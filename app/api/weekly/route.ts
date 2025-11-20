import { NextResponse } from 'next/server';
import { scrapeMultiSource } from '@/lib/scrapers/multiSourceScraper';
import { AppError } from '@/lib/errors';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
    try {
        // Scrape from multiple sources: BetaList, Hacker News, Indie Hackers
        const products = await scrapeMultiSource({
            betalist: true,
            hackernews: true,
            indiehackers: true,
            alternativeto: false, // Disabled due to anti-scraping
            limitPerSource: 5,
        });

        if (products.length === 0) {
            console.warn('No products found from any source');
            return NextResponse.json({ products: [] });
        }

        console.log(`Successfully scraped ${products.length} products from multiple sources`);

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error in /api/weekly:', error);

        if (error instanceof AppError) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                { status: error.statusCode }
            );
        }

        return NextResponse.json({
            error: 'Failed to fetch weekly products',
            code: 'INTERNAL_ERROR',
            products: []
        }, { status: 500 });
    }
}
