import { scrapeRecentStartups } from '../betalist';
import { scrapeShowHN } from './hackerNewsScraper';
import { scrapeIndieHackersRecent } from './indieHackersScraper';
import { scrapeAlternativeTo } from './alternativeToScraper';
import type { UnifiedProduct } from './types';

export interface MultiSourceOptions {
    betalist?: boolean;
    hackernews?: boolean;
    indiehackers?: boolean;
    alternativeto?: boolean;
    limitPerSource?: number;
}

const DEFAULT_OPTIONS: MultiSourceOptions = {
    betalist: true,
    hackernews: true,
    indiehackers: true,
    alternativeto: false, // Disabled by default due to anti-scraping
    limitPerSource: 5,
};

/**
 * Scrapes multiple startup platforms and returns unified product data
 */
export async function scrapeMultiSource(options: MultiSourceOptions = {}): Promise<UnifiedProduct[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const limit = opts.limitPerSource || 5;

    const products: UnifiedProduct[] = [];
    const promises: Promise<void>[] = [];

    // BetaList
    if (opts.betalist) {
        promises.push(
            scrapeRecentStartups(limit)
                .then(startups => {
                    startups.forEach(startup => {
                        products.push({
                            name: startup.name,
                            tagline: startup.tagline,
                            url: startup.betalistUrl,
                            sourceUrl: startup.betalistUrl,
                            source: 'betalist',
                        });
                    });
                })
                .catch(err => console.error('BetaList scraper error:', err))
        );
    }

    // Hacker News
    if (opts.hackernews) {
        promises.push(
            scrapeShowHN(limit)
                .then(hnProducts => {
                    hnProducts.forEach(product => {
                        products.push({
                            name: product.name,
                            tagline: product.tagline,
                            url: product.url,
                            sourceUrl: product.hnUrl,
                            source: 'hackernews',
                            metadata: {
                                author: product.author,
                                comments: product.comments,
                                timeAgo: product.timeAgo,
                            },
                        });
                    });
                })
                .catch(err => console.error('Hacker News scraper error:', err))
        );
    }

    // Indie Hackers
    if (opts.indiehackers) {
        promises.push(
            scrapeIndieHackersRecent(limit)
                .then(ihProducts => {
                    ihProducts.forEach(product => {
                        products.push({
                            name: product.name,
                            tagline: product.tagline,
                            url: product.url || product.ihUrl,
                            sourceUrl: product.ihUrl,
                            source: 'indiehackers',
                            metadata: {
                                revenue: product.revenue,
                            },
                        });
                    });
                })
                .catch(err => console.error('Indie Hackers scraper error:', err))
        );
    }

    // AlternativeTo
    if (opts.alternativeto) {
        promises.push(
            scrapeAlternativeTo(limit)
                .then(atProducts => {
                    atProducts.forEach(product => {
                        products.push({
                            name: product.name,
                            tagline: product.tagline,
                            url: product.url || product.alternativeToUrl,
                            sourceUrl: product.alternativeToUrl,
                            source: 'alternativeto',
                            metadata: {
                                likes: product.likes,
                                category: product.category,
                            },
                        });
                    });
                })
                .catch(err => console.error('AlternativeTo scraper error:', err))
        );
    }

    // Wait for all scrapers to complete
    await Promise.all(promises);

    // Shuffle to mix sources
    return shuffleArray(products);
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
