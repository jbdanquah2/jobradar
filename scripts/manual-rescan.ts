import { prisma } from '@/lib/prisma';
import { scrapeHackerNews } from '@/lib/scrapers/hackernews';
import { scrapeAllGermanJobs } from '@/lib/scrapers/germany';
import { calculateJobMatch, getProfileData } from '@/lib/scoring';

async function main() {
  console.log('--- STARTING MANUAL RESCAN ---');
  
  const profile = await getProfileData();

  console.log('Fetching from Hacker News...');
  const hnJobs = await scrapeHackerNews();
  console.log(`Found ${hnJobs.length} potential HN jobs.`);

  console.log('Fetching from German sources...');
  const germanJobs = await scrapeAllGermanJobs();
  console.log(`Found ${germanJobs.length} potential German jobs.`);

  const allJobs = [...hnJobs, ...germanJobs];
  let ingestedCount = 0;
  let skippedCount = 0;

  console.log(`Processing ${allJobs.length} total jobs...`);

  for (const rawJob of allJobs) {
    const job = await calculateJobMatch(rawJob, profile);

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
