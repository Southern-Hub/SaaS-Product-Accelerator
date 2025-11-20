// Unified product interface for all scrapers
export interface UnifiedProduct {
    name: string;
    tagline: string;
    url: string;
    sourceUrl: string; // URL to the source platform (BetaList, HN, etc.)
    source: 'betalist' | 'hackernews' | 'indiehackers' | 'alternativeto';
    metadata?: {
        author?: string;
        comments?: number;
        timeAgo?: string;
        revenue?: string;
        likes?: number;
        category?: string;
        topics?: string[];
        featuredDate?: string;
    };
}

// Re-export types from individual scrapers
export type { HNProduct } from './hackerNewsScraper';
export type { IndieHackersProduct } from './indieHackersScraper';
export type { AlternativeToProduct } from './alternativeToScraper';
export type { StartupPreview } from '../betalist';
