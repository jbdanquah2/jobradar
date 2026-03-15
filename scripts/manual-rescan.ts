import { prisma } from '../src/lib/prisma';
import { scrapeHackerNews } from '../src/lib/scrapers/hackernews';
import { scrapeAtsJobs } from '../src/lib/scrapers/ats';
import { scrapeHimalayas } from '../src/lib/scrapers/himalayas';
import { calculateJobMatch } from '../src/lib/scoring';

async function main() {
  console.log('--- STARTING MANUAL RESCAN ---');
  
  console.log('Fetching from Hacker News...');
  const hnJobs = await scrapeHackerNews();
  console.log(`Found ${hnJobs.length} potential HN jobs.`);

  console.log('Fetching from Greenhouse Watchlist...');
  const atsJobs = await scrapeAtsJobs();
  console.log(`Found ${atsJobs.length} potential ATS jobs.`);

  console.log('Fetching from Himalayas...');
  const himalayasJobs = await scrapeHimalayas();
  console.log(`Found ${himalayasJobs.length} potential Himalayas jobs.`);

  const allJobs = [...hnJobs, ...atsJobs, ...himalayasJobs];
  let ingestedCount = 0;
  let skippedCount = 0;

  console.log(`Processing ${allJobs.length} total jobs...`);

  for (const rawJob of allJobs) {
    const job = calculateJobMatch(rawJob);

    const existing = await prisma.job.findUnique({
      where: { apply_url: job.apply_url }
    });

    if (!existing) {
      await prisma.job.create({
        data: job
      });
      ingestedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log('--- RESCAN COMPLETE ---');
  console.log(`New jobs ingested: ${ingestedCount}`);
  console.log(`Duplicates skipped: ${skippedCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
