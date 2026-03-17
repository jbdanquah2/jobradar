import { prisma } from './prisma';
import { scrapeHackerNews } from './scrapers/hackernews';
import { scrapeAtsJobs } from './scrapers/ats';
import { scrapeHimalayas } from './scrapers/himalayas';
import { scrapeAllGermanJobs } from './scrapers/germany';
import { scrapeSolutionsJobs } from './scrapers/solutions';
import { calculateJobMatch } from './scoring';

export async function performIngestion() {
  console.log('--- Starting Job Ingestion ---');
  
  const [hackerNewsJobs, atsJobs, himalayasJobs, germanJobs, solutionsJobs] = await Promise.all([
    scrapeHackerNews(),
    scrapeAtsJobs(),
    scrapeHimalayas(),
    scrapeAllGermanJobs(),
    scrapeSolutionsJobs()
  ]);

  const allJobs = [...hackerNewsJobs, ...atsJobs, ...himalayasJobs, ...germanJobs, ...solutionsJobs];
  console.log(`Scraped ${allJobs.length} potential roles in total.`);
  
  let ingestedCount = 0;

  for (const rawJob of allJobs) {
    try {
      const job = calculateJobMatch(rawJob);

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
