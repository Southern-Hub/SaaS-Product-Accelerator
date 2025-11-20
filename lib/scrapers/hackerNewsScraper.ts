import * as cheerio from 'cheerio';

export interface HNProduct {
    name: string;
    tagline: string;
    url: string;
    hnUrl: string;
    author: string;
    timeAgo: string;
    comments: number;
    source: 'hackernews';
}

export async function scrapeShowHN(limit: number = 10): Promise<HNProduct[]> {
    try {
        const response = await fetch('https://news.ycombinator.com/show', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Hacker News: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const products: HNProduct[] = [];

        // HN has a specific structure: items are in <tr class="athing">
        $('.athing').each((index, element) => {
            if (products.length >= limit) return false;

            const titleRow = $(element);
            const titleLink = titleRow.find('.titleline > a').first();
            const title = titleLink.text().trim();
            const url = titleLink.attr('href') || '';

            // Only process "Show HN:" posts
            if (!title.startsWith('Show HN:')) return;

            // Clean the name (remove "Show HN:" prefix)
            const name = title.replace(/^Show HN:\s*/i, '').trim();

            // Get the item ID for building HN URL
            const itemId = titleRow.attr('id') || '';

            // The next row contains metadata (author, time, comments)
            const metaRow = titleRow.next();
            const author = metaRow.find('.hnuser').text().trim();
            const timeAgo = metaRow.find('.age').attr('title') || metaRow.find('.age').text().trim();

            // Get comment count
            const commentsText = metaRow.find('a:contains("comment")').last().text().trim();
            const commentsMatch = commentsText.match(/(\d+)/);
            const comments = commentsMatch ? parseInt(commentsMatch[1]) : 0;

            // Extract tagline from the title or use a default
            let tagline = '';
            const dashIndex = name.indexOf('–');
            const hyphenIndex = name.indexOf('-');

            if (dashIndex > 0) {
                tagline = name.substring(dashIndex + 1).trim();
            } else if (hyphenIndex > 10) { // Only use hyphen if it's not at the beginning
                tagline = name.substring(hyphenIndex + 1).trim();
            } else {
                tagline = 'Check out this product on Hacker News';
            }

            products.push({
                name: dashIndex > 0 || hyphenIndex > 10 ? name.substring(0, Math.max(dashIndex, hyphenIndex)).trim() : name,
                tagline,
                url: url.startsWith('http') ? url : `https://news.ycombinator.com/${url}`,
                hnUrl: `https://news.ycombinator.com/item?id=${itemId}`,
                author,
                timeAgo,
                comments,
                source: 'hackernews',
            });
        });

        return products;

    } catch (error) {
        console.error('Error scraping Hacker News:', error);
        return [];
    }
}
