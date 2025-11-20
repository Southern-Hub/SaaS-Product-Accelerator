import { NextResponse } from 'next/server';
import { scrapeBetaList, getMockStartupData } from '@/lib/betalist';
import { analyzeProductComplete } from '@/lib/analyzer';
import { AppError, ValidationError, ScrapingError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => {
            throw new ValidationError('Invalid JSON body');
        });

        const { url } = body;

        if (!url) {
            throw new ValidationError('URL is required');
        }

        if (typeof url !== 'string' || !url.includes('betalist.com/startups/')) {
            throw new ValidationError('Invalid BetaList URL. Please use a URL like: https://betalist.com/startups/startup-name');
        }

        let startupData = await scrapeBetaList(url);
        let isMock = false;

        if (!startupData) {
            console.warn('Scraping failed, falling back to mock data');
            startupData = getMockStartupData();
            isMock = true;
        }

        // Use the unified analysis function
        const completeAnalysis = await analyzeProductComplete(startupData);

        // Return complete analysis (frontend can extract what it needs)
        return NextResponse.json({
            analysis: completeAnalysis,
            isMock,
            // For backward compatibility, include simplified analysis
            startup: startupData,
        });
    } catch (error) {
        console.error('API Error:', error);

        if (error instanceof AppError) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                { status: error.statusCode }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
