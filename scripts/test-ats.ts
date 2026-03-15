import { scrapeAtsJobs } from '../src/lib/scrapers/ats';

async function main() {
  console.log('--- STARTING ATS SCRAPE ---');
  const jobs = await scrapeAtsJobs();
  console.log('--- FINISHED ATS SCRAPE ---');
  console.log(`Total jobs found across all ATS: ${jobs.length}`);
  
  if (jobs.length > 0) {
    console.log('Sample Job:');
    console.log(JSON.stringify(jobs[0], null, 2));
  }
}

main().catch(console.error);
