import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function GET() {
  try {
    // Find NEW and ELIGIBLE jobs from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const jobs = await prisma.job.findMany({
      where: {
        status: 'NEW',
        eligibility_status: 'ELIGIBLE',
        created_at: {
          gte: yesterday,
        }
      },
      orderBy: { match_score: 'desc' },
      take: 10,
    });

    if (jobs.length === 0) {
      return NextResponse.json({ success: true, message: 'No new jobs to report' });
    }

    // Build Email HTML
    let html = '<h2>Your Daily JobRadar Matches</h2><ul>';
    jobs.forEach(job => {
      html += `
        <li style="margin-bottom: 20px;">
          <strong><a href="${job.apply_url}">${job.title}</a> @ ${job.company}</strong><br/>
          <span>Location: ${job.location_text} | Score: ${job.match_score}</span><br/>
          <small>${JSON.parse(job.skills_detected).join(', ')}</small>
        </li>
      `;
    });
    html += '</ul><p>View all jobs at your <a href="' + (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000') + '">JobRadar Dashboard</a>.</p>';

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'JobRadar <onboarding@resend.dev>', // Standard test domain
        to: process.env.USER_EMAIL || 'test@example.com',
        subject: `JobRadar: ${jobs.length} New Remote Jobs`,
        html: html,
      });
    } else {
      console.log('RESEND_API_KEY not set. Would have sent email:', html);
    }

    return NextResponse.json({ success: true, sent: jobs.length });
  } catch (error) {
    console.error('Notification failed:', error);
    return NextResponse.json({ success: false, error: 'Notification failed' }, { status: 500 });
  }
}
