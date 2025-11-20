import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateEmailTemplate } from '@/lib/emailTemplate';

// Lazy instantiation to avoid build-time errors
function getResendClient() {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
    }
    return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: Request) {
    try {
        const { email, report, startupName } = await request.json();

        // Validation
        if (!email) {
            return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
        }

        if (!report) {
            return NextResponse.json({ error: 'Report content is required' }, { status: 400 });
        }

        if (!startupName) {
            return NextResponse.json({ error: 'Startup name is required' }, { status: 400 });
        }

        // Generate HTML email
        const htmlContent = generateEmailTemplate(startupName, report);

        console.log('Sending email to:', email);
        console.log('From:', 'onboarding@resend.dev');

        // Get Resend client (lazy instantiation)
        const resend = getResendClient();

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [email],
            subject: `Product Strategy Report: ${startupName}`,
            html: htmlContent,
        });

        if (error) {
            console.error('Resend API error:', JSON.stringify(error, null, 2));
            return NextResponse.json({
                error: `Failed to send email: ${error.message || 'Unknown error'}`
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            messageId: data?.id
        });

    } catch (error) {
        console.error('Error in /api/email:', error);
        return NextResponse.json({
            error: 'Internal server error. Please try again later.'
        }, { status: 500 });
    }
}
