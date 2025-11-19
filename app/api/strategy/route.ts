import { NextResponse } from 'next/server';
import { generateStrategyReport } from '@/lib/llm';
import { StartupData } from '@/lib/betalist';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startup } = body;

        if (!startup) {
            return NextResponse.json({ error: 'Startup data is required' }, { status: 400 });
        }

        const report = await generateStrategyReport(startup as StartupData);

        return NextResponse.json({ report });

    } catch (error) {
        console.error('Error in /api/strategy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
