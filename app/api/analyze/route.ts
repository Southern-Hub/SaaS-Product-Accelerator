import { NextResponse } from 'next/server';
import { scrapeBetaList } from '@/lib/betalist';
import { analyzeViability } from '@/lib/analyzer';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        let startupData = await scrapeBetaList(url);
        let isMock = false;

        if (!startupData) {
            console.log("Scraping failed, falling back to mock data");
            startupData = require('@/lib/betalist').getMockStartupData();
            isMock = true;
        }

        if (!startupData) {
            return NextResponse.json({ error: 'Failed to retrieve startup data.' }, { status: 404 });
        }

        const analysis = await analyzeViability(startupData);

        return NextResponse.json({
            startup: startupData,
            analysis,
            isMock,
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
