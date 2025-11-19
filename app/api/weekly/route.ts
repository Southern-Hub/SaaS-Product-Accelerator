import { NextResponse } from 'next/server';
import { scrapeRecentStartups } from '@/lib/betalist';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
    try {
        const startups = await scrapeRecentStartups(5);

        if (startups.length === 0) {
            return NextResponse.json({
                error: 'No startups found',
                startups: []
            }, { status: 200 });
        }

        return NextResponse.json({ startups });
    } catch (error) {
        console.error('Error in /api/weekly:', error);
        return NextResponse.json({
            error: 'Failed to fetch weekly startups',
            startups: []
        }, { status: 500 });
    }
}
