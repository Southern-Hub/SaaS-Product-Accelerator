import * as cheerio from 'cheerio';

export interface IndieHackersProduct {
    name: string;
    tagline: string;
    url: string;
    ihUrl: string;
    revenue?: string;
    source: 'indiehackers';
}

export async function scrapeIndieHackers(limit: number = 10): Promise<IndieHackersProduct[]> {
    try {
        // Note: Indie Hackers is a JavaScript-heavy site (Ember.js)
        // This scraper may need a headless browser for full functionality
        // For now, we'll attempt to scrape what we can from the initial HTML
        
        const response = await fetch('https://www.indiehackers.com/products', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Indie Hackers: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const products: IndieHackersProduct[] = [];

        // Indie Hackers uses a JavaScript framework, so the content might be loaded dynamically
        // We'll try to extract from any pre-rendered content or use their API if available
        
        // Look for product listings - this is a best-effort approach
        // The actual structure may vary depending on what's server-rendered
        $('a[href*="/products/"]').each((index, element) => {
            if (products.length >= limit) return false;

            const link = $(element);
            const href = link.attr('href') || '';
            
            // Skip navigation links
            if (href === '/products' || href === '/products/') return;

            const productSlug = href.split('/products/')[1]?.split('/')[0];
            if (!productSlug || products.some(p => p.ihUrl.includes(productSlug))) return;

            const name = link.text().trim();
            if (!name || name.length < 2) return;

            // Try to find tagline nearby
            const parent = link.parent();
            const tagline = parent.find('.tagline, .description, p').first().text().trim() || 
                           link.next('p, span, div').text().trim() || 
                           'Building in public on Indie Hackers';

            products.push({
                name,
                tagline: tagline.substring(0, 200), // Limit tagline length
                url: '', // Will need to fetch from product page
                ihUrl: `https://www.indiehackers.com${href}`,
                source: 'indiehackers',
            });
        });

        // If we didn't get products from the HTML, return placeholder data with a note
        if (products.length === 0) {
            console.warn('Indie Hackers scraper: No products found. Site may require JavaScript rendering.');
            // Return empty array - could implement Puppeteer/Playwright for JS-heavy scraping
            return [];
        }

        return products;

    } catch (error) {
        console.error('Error scraping Indie Hackers:', error);
        return [];
    }
}

// Alternative: Use a simpler approach - scrape from the homepage/recent posts
export async function scrapeIndieHackersRecent(limit: number = 10): Promise<IndieHackersProduct[]> {
    try {
        const response = await fetch('https://www.indiehackers.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Indie Hackers: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const products: IndieHackersProduct[] = [];
        const seen = new Set<string>();

        // Try to extract from post titles that mention products
        $('a[href*="/post/"]').each((index, element) => {
            if (products.length >= limit) return false;

            const link = $(element);
            const title = link.text().trim();
            
            // Look for launch/milestone posts
            const isLaunch = /launched|launched|building|made|created|released|introducing/i.test(title);
            if (!isLaunch) return;

            const href = link.attr('href') || '';
            if (seen.has(href)) return;
            seen.add(href);

            // Extract product name from title (rough heuristic)
            const nameMatch = title.match(/(?:launched|built|made|created|released)\s+([^-–!.]+)/i);
            const name = nameMatch ? nameMatch[1].trim() : title.substring(0, 50);

            products.push({
                name,
                tagline: title.substring(0, 150),
                url: '',
                ihUrl: `https://www.indiehackers.com${href}`,
                source: 'indiehackers',
            });
        });

        return products;

    } catch (error) {
        console.error('Error scraping Indie Hackers recent:', error);
        return [];
    }
}
