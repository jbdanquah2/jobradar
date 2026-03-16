import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeHackerNews } from '@/lib/scrapers/hackernews';
import { scrapeAtsJobs } from '@/lib/scrapers/ats';
import { scrapeHimalayas } from '@/lib/scrapers/himalayas';
import { scrapeAllGermanJobs } from '@/lib/scrapers/germany';
import { scrapeSolutionsJobs } from '@/lib/scrapers/solutions';
import { calculateJobMatch } from '@/lib/scoring';

export async function GET() {
  try {
    const hackerNewsJobs = await scrapeHackerNews();
    const atsJobs = await scrapeAtsJobs();
    const himalayasJobs = await scrapeHimalayas();
    const germanJobs = await scrapeAllGermanJobs();
    const solutionsJobs = await scrapeSolutionsJobs();

    const allJobs = [...hackerNewsJobs, ...atsJobs, ...himalayasJobs, ...germanJobs, ...solutionsJobs];
    let ingestedCount = 0;

    for (const rawJob of allJobs) {
      const job = calculateJobMatch(rawJob);

      // Create or update to prevent duplicates based on apply_url
      // Since SQLite doesn't easily support bulk upsert by unique constraint with Prisma `createMany`, we iterate.
      const existing = await prisma.job.findUnique({
        where: { apply_url: job.apply_url }
      });

      if (!existing) {
        await prisma.job.create({
          data: job
        });
        ingestedCount++;
      }
    }

    return NextResponse.json({ success: true, ingested: ingestedCount });
  } catch (error) {
    console.error('Ingestion failed:', error);
    return NextResponse.json({ success: false, error: 'Ingestion failed' }, { status: 500 });
  }
}
