import { NextResponse } from 'next/server';
import { scrapeRecentStartups } from '@/lib/betalist';
import { AppError, ScrapingError } from '@/lib/errors';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
    try {
        const startups = await scrapeRecentStartups(5);

        if (startups.length === 0) {
            // We could throw an error or just return empty list with a warning
            console.warn('No startups found for weekly gallery');
            return NextResponse.json({ startups: [] });
        }

        return NextResponse.json({ startups });
    } catch (error) {
        console.error('Error in /api/weekly:', error);

        if (error instanceof AppError) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                { status: error.statusCode }
            );
        }

        return NextResponse.json({
            error: 'Failed to fetch weekly startups',
            code: 'INTERNAL_ERROR',
            startups: []
        }, { status: 500 });
    }
}
