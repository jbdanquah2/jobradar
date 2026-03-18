import { prisma } from './prisma';
import { scrapeHackerNews } from './scrapers/hackernews';
import { scrapeAllGermanJobs } from './scrapers/germany';
import { calculateJobMatch, getProfileData } from './scoring';

export async function performIngestion() {
  console.log('--- Starting Job Ingestion ---');
  
  // Pre-fetch profile once to avoid redundant DB calls during the loop
  const profile = await getProfileData();
  
  const [hackerNewsJobs, germanJobs] = await Promise.all([
    scrapeHackerNews(),
    scrapeAllGermanJobs(),
  ]);

  const allJobs = [...hackerNewsJobs, ...germanJobs];
  console.log(`Scraped ${allJobs.length} potential roles in total.`);
  
  let ingestedCount = 0;

  for (const rawJob of allJobs) {
    try {
      const job = await calculateJobMatch(rawJob, profile);

      const existing = await prisma.job.findUnique({
        where: { apply_url: job.apply_url }
      });

      if (!existing) {
        await prisma.job.create({
          data: job
        });
        ingestedCount++;
      }
    } catch (err) {
      console.error(`Failed to process job: ${rawJob.title}`, err);
    }
  }

  console.log(`--- Ingestion Complete: ${ingestedCount} new jobs added ---`);
  return { ingested: ingestedCount };
}
