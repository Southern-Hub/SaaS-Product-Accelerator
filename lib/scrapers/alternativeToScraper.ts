import * as cheerio from 'cheerio';

export interface AlternativeToProduct {
    name: string;
    tagline: string;
    url: string;
    alternativeToUrl: string;
    likes?: number;
    category?: string;
    source: 'alternativeto';
}

export async function scrapeAlternativeTo(limit: number = 10): Promise<AlternativeToProduct[]> {
    try {
        // Note: AlternativeTo blocks simple HTTP requests (403 error)
        // This is a placeholder implementation that would need:
        // 1. Headless browser (Puppeteer/Playwright) to bypass anti-scraping
        // 2. Or use their API if available
        // 3. Or use a proxy/scraping service

        const response = await fetch('https://alternativeto.net/browse/trending/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
        });

        if (!response.ok) {
            console.warn(`AlternativeTo returned ${response.status}. May require headless browser.`);
            // Return empty array - this would need Puppeteer implementation
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const products: AlternativeToProduct[] = [];

        // AlternativeTo structure (if we can access it)
        $('.app-item, .application-item').each((index, element) => {
            if (products.length >= limit) return false;

            const item = $(element);
            const nameLink = item.find('.app-name a, h3 a').first();
            const name = nameLink.text().trim();
            const href = nameLink.attr('href') || '';

            if (!name) return;

            const tagline = item.find('.app-tagline, .description, p').first().text().trim() ||
                'Discover alternatives on AlternativeTo';

            const likesText = item.find('.likes, .votes').text().trim();
            const likesMatch = likesText.match(/(\d+)/);
            const likes = likesMatch ? parseInt(likesMatch[1]) : undefined;

            const category = item.find('.category, .tag').first().text().trim();

            products.push({
                name,
                tagline: tagline.substring(0, 200),
                url: '', // Would need to scrape from individual page
                alternativeToUrl: href.startsWith('http') ? href : `https://alternativeto.net${href}`,
                likes,
                category: category || undefined,
                source: 'alternativeto',
            });
        });

        return products;

    } catch (error) {
        console.error('Error scraping AlternativeTo:', error);
        return [];
    }
}

// Mock data for testing since AlternativeTo blocks scraping
export function getMockAlternativeToProducts(): AlternativeToProduct[] {
    return [
        {
            name: 'Notion',
            tagline: 'All-in-one workspace for notes, tasks, wikis, and databases',
            url: 'https://notion.so',
            alternativeToUrl: 'https://alternativeto.net/software/notion/',
            likes: 2500,
            category: 'Productivity',
            source: 'alternativeto',
        },
        {
            name: 'Obsidian',
            tagline: 'Powerful knowledge base that works on local Markdown files',
            url: 'https://obsidian.md',
            alternativeToUrl: 'https://alternativeto.net/software/obsidian/',
            likes: 1800,
            category: 'Note Taking',
            source: 'alternativeto',
        },
    ];
}
