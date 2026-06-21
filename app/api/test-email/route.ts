import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/test-email?to=youremail@gmail.com
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json({
      error: 'Missing ?to= param. Use: /api/test-email?to=your@email.com',
      apiKeyPresent: !!process.env.RESEND_API_KEY,
    });
  }

  console.log('[test-email] API Key present:', !!process.env.RESEND_API_KEY);
  console.log('[test-email] Attempting to send to:', to);

  const { data, error } = await resend.emails.send({
    from: 'Profunda Web3 Academy <hello@thepw360.net>',
    to: [to],
    subject: 'PW360 Email Test ✅',
    html: '<h1>It works!</h1><p>Your Resend integration is configured correctly.</p>',
  });

  if (error) {
    console.error('[test-email] Resend error:', JSON.stringify(error));
    return NextResponse.json({ 
      success: false, 
      error,
      apiKeyPresent: !!process.env.RESEND_API_KEY 
    }, { status: 500 });
  }

  console.log('[test-email] Success! Email ID:', data?.id);
  return NextResponse.json({ 
    success: true, 
    emailId: data?.id,
    sentTo: to,
  });
}
