import { scrapeHackerNews } from '../src/lib/scrapers/hackernews';

async function main() {
  console.log('--- STARTING HN SCRAPE ---');
  const jobs = await scrapeHackerNews();
  console.log('--- FINISHED HN SCRAPE ---');
  console.log(`Total jobs found on Hacker News: ${jobs.length}`);
  
  if (jobs.length > 0) {
    console.log('Sample Job:');
    console.log(JSON.stringify(jobs[0], null, 2));
  } else {
    console.log('No jobs found. This might be due to filtering (Remote/Location) or thread discovery issues.');
  }
}

main().catch(console.error);
