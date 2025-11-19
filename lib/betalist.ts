import * as cheerio from 'cheerio';

export interface StartupData {
    name: string;
    tagline: string;
    description: string;
    topics: string[];
    website: string;
    featuredDate: string;
    screenshotUrls: string[];
    betalistUrl: string;
    scrapedAt: string;
}

export async function scrapeBetaList(url: string): Promise<StartupData | null> {
    try {
        // Basic validation to ensure it's a BetaList URL
        if (!url.includes('betalist.com/startups/')) {
            throw new Error('Invalid BetaList URL. Please use a URL like: https://betalist.com/startups/startup-name');
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch page: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract startup name - typically in h1
        const name = $('h1').first().text().trim();

        // Extract tagline - typically in h2 right after h1
        const tagline = $('h2').first().text().trim();

        // Extract description - usually in a div or paragraph after the tagline
        // BetaList typically has the full description in structured paragraphs
        let description = '';
        $('p').each((_, el) => {
            const text = $(el).text().trim();
            // Look for substantial paragraphs (not navigation or footer text)
            if (text.length > 100 && !description) {
                description = text;
            }
        });

        // If we didn't find description via paragraphs, try meta description
        if (!description) {
            description = $('meta[property="og:description"]').attr('content') || '';
        }

        // Extract topics/categories - typically linked tags
        const topics: string[] = [];
        $('a[href*="/topics/"]').each((_, el) => {
            const topic = $(el).text().trim();
            if (topic && !topics.includes(topic)) {
                topics.push(topic);
            }
        });

        // Extract website URL - "Visit Site" button
        const visitLinkHref = $('a:contains("Visit Site")').attr('href') || '';
        // BetaList uses a redirect pattern, the actual link is typically in the href
        let website = '';
        if (visitLinkHref) {
            // The href might be /startups/{name}/visit which redirects to the actual site
            website = visitLinkHref.startsWith('http') ? visitLinkHref : `https://betalist.com${visitLinkHref}`;
        }

        // Extract featured date
        let featuredDate = '';
        // Look for text containing "Featured on" in links or text nodes
        const featuredText = $('a:contains("Featured on")').text() || $('*:contains("Featured on")').first().text();
        if (featuredText) {
            // Extract date from text like "Featured on November 18, 2025  5:08am"
            // Match pattern: "Featured on [Month] [Day], [Year]" (ignoring the time)
            const dateMatch = featuredText.match(/Featured on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
            if (dateMatch) {
                featuredDate = dateMatch[1].trim();
            }
        }

        // Extract screenshot URLs - look for image elements
        const screenshotUrls: string[] = [];
        $('img').each((_, el) => {
            const src = $(el).attr('src');
            if (src && (src.includes('screenshot') || src.includes('image') || src.includes('startup'))) {
                const fullUrl = src.startsWith('http') ? src : `https://betalist.com${src}`;
                screenshotUrls.push(fullUrl);
            }
        });

        if (!name) {
            console.warn('Could not extract startup name from BetaList page');
            return null;
        }

        const scrapedAt = new Date().toISOString();

        return {
            name,
            tagline,
            description,
            topics,
            website,
            featuredDate,
            screenshotUrls,
            betalistUrl: url,
            scrapedAt,
        };

    } catch (error) {
        console.error('Error scraping BetaList:', error);
        return null;
    }
}

export function getMockStartupData(): StartupData {
    return {
        name: "FlowBase (Demo)",
        tagline: "Simple, intuitive CRM tool created specifically for freelancers",
        description: "FlowBase is a lightweight, intuitive SaaS platform designed to help freelancers and small teams organize their client work, projects, and tasks all in one place. It provides easy-to-use dashboards and reporting features, so teams can track progress, identify bottlenecks, and make informed decisions faster.",
        topics: ["SaaS", "Startups", "Productivity Software", "Business Productivity", "Sales and Marketing"],
        website: "https://flowbase.example.com",
        featuredDate: "November 18, 2025",
        screenshotUrls: [],
        betalistUrl: "https://betalist.com/startups/flowbase",
        scrapedAt: new Date().toISOString(),
    };
}
