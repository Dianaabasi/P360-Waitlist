import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key from the environment
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header-image {
      width: 100%;
      height: auto;
      display: block;
    }
    .content {
      padding: 40px 40px;
      text-align: center;
    }
    .title {
      color: #a855f7;
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 40px;
      text-align: center;
    }
    .body-text strong {
      color: #a855f7;
    }
    .section-title {
      color: #a855f7;
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    .steps-container {
      text-align: left;
      margin-bottom: 40px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    .step-icon {
      flex-shrink: 0;
      margin-right: 16px;
      margin-top: 2px;
    }
    .step-content {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
    }
    .step-title {
      font-weight: 700;
      color: #a855f7;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .button {
      background-color: #a855f7;
      color: #ffffff;
      padding: 14px 32px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      display: inline-block;
    }
    .footer {
      background-color: #e0f2fe;
      background: linear-gradient(to bottom, #ffffff, #dbeafe);
      padding: 40px 20px;
      text-align: center;
      font-size: 12px;
      color: #0f172a;
    }
    .footer-links {
      margin-bottom: 30px;
      color: #3b82f6;
    }
    .footer-links a {
      color: #3b82f6;
      text-decoration: underline;
      margin: 0 8px;
    }
    .company-info {
      margin-bottom: 24px;
      color: #0f172a;
    }
    .social-icons {
      margin-bottom: 30px;
    }
    .social-icons img {
      width: 40px;
      margin: 0 10px;
      vertical-align: middle;
    }
    .copyright {
      margin-top: 24px;
      color: #0f172a;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://waitlist.thepw360.net/Waitlist-email.png" alt="Thanks for joining the waitlist" class="header-image" />
    
    <div class="content">
      <h1 class="title">WELCOME TO PW360!!!</h1>
      
      <p class="body-text">
        Thanks for joining the PW360 waitlist &mdash; You're one step closer to launching<br/>
        your Web3 career. Complete quests, invite friends, earn points, climb the<br/>
        leaderboard, and unlock rewards like <strong>FREE subscriptions, exclusive perks,<br/>
        and early access.</strong> 🚀
      </p>
      
      <h2 class="section-title">NEXT STEPS</h2>
      
      <div class="steps-container">
        <div class="step">
          <img src="https://api.iconify.design/lucide:arrow-right.svg?color=%231e293b&width=24" class="step-icon" alt="->" />
          <div class="step-content">
            <span class="step-title">Head over the waitlist dashboard</span> - Access<br/>
            your waitlist account and start tracking your<br/>
            progress.
          </div>
        </div>
        
        <div class="step">
          <img src="https://api.iconify.design/lucide:arrow-right.svg?color=%231e293b&width=24" class="step-icon" alt="->" />
          <div class="step-content">
            <span class="step-title">Complete available quests</span> - Head to the<br/>
            Quest section and finish every available task to<br/>
            earn points. New quests are added regularly, so<br/>
            check back daily to keep growing your score.
          </div>
        </div>
        
        <div class="step">
          <img src="https://api.iconify.design/lucide:arrow-right.svg?color=%231e293b&width=24" class="step-icon" alt="->" />
          <div class="step-content">
            <span class="step-title">Share your referral link</span> - Find your unique<br/>
            referral link in your dashboard and share it<br/>
            across X, LinkedIn, WhatsApp, Telegram,<br/>
            Instagram, and with friends. Every successful<br/>
            signup earns you more points and moves you<br/>
            higher on the leaderboard.
          </div>
        </div>
      </div>
      
      <div class="button-container">
        <a href="https://waitlist.thepw360.net" class="button">Waitlist Dashboard</a>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-links">
        <a href="#">View in browser</a> | 
        <a href="#">Update your preferences</a> | 
        <a href="#">Unsubscribe</a>
      </div>
      
      <div class="company-info">
        Profunda Web3 Academy<br />
        Lagos, Nigeria
      </div>
      
      <div class="social-icons">
        <a href="https://x.com/thePW3acad"><img src="https://api.iconify.design/ri:twitter-x-fill.svg?color=%23000000" alt="X" /></a>
        <a href="https://www.instagram.com/thepw3acad"><img src="https://api.iconify.design/skill-icons:instagram.svg" alt="Instagram" /></a>
      </div>
      
      <div class="copyright">
        &copy; 2026 PW3 Academy. All rights reserved.<br /><br />
        You're receiving this email because you signed up for updates from PW3 Academy
      </div>
    </div>
  </div>
</body>
</html>
`;

    // Note: If you verified thepw360.net, you can send emails from any prefix (e.g. hello@thepw360.net)
    // If you only verified the subdomain (waitlist.thepw360.net), you might need to send from something like hello@waitlist.thepw360.net
    const fromEmail = 'hello@thepw360.net';
      
    const data = await resend.emails.send({
      from: `Profunda Web3 Academy <${fromEmail}>`,
      to: [email],
      subject: 'Welcome to PW360, a new learning era awaits',
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
