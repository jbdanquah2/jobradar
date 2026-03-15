import Parser from 'rss-parser';
import { NormalizedJob } from './remoteok';
import { scrapeArbeitnow } from './arbeitnow';

const parser = new Parser();

/**
 * Scrapes BerlinStartupJobs.com via their engineering RSS feed
 */
export async function scrapeBerlinStartupJobs(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    const feed = await parser.parseURL('https://berlinstartupjobs.com/engineering/feed/');
    
    for (const item of feed.items) {
      jobs.push({
        title: item.title || 'Software Engineer',
        company: 'Startup in Berlin', // RSS title often includes company, but we'd need more parsing
        location_text: 'Berlin, Germany',
        remote_type: 'On-site/Remote',
        description: item.contentSnippet || item.content || '',
        apply_url: item.link || '',
        source: 'BerlinStartupJobs',
        date_posted: new Date(item.pubDate || new Date()),
        skills_detected: JSON.stringify([]),
        match_score: 0,
        eligibility_status: 'REVIEW_NEEDED',
      });
    }
  } catch (error) {
    console.error("Error scraping BerlinStartupJobs", error);
  }
  return jobs;
}

/**
 * Scrapes Landing.jobs for Germany specific roles with visa/relocation
 */
export async function scrapeLandingJobsGermany(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    // Landing.jobs API - searching for jobs in Germany
    const res = await fetch('https://landing.jobs/api/v1/jobs?location=Germany');
    if (!res.ok) return [];
    
    const data = await res.json();
    
    for (const item of data) {
      // Check for tech stack match loosely here
      const title = item.title.toLowerCase();
      if (!/engineer|developer|lead|architect|node|typescript/i.test(title)) continue;

      jobs.push({
        title: item.title,
        company: item.company_name,
        location_text: item.location_name || 'Germany',
        remote_type: item.remote ? 'Remote' : 'On-site',
        description: item.main_requirements || '',
        apply_url: item.url,
        source: 'LandingJobs',
        date_posted: new Date(item.published_at || new Date()),
        skills_detected: JSON.stringify(item.skills || []),
        match_score: 0,
        eligibility_status: 'REVIEW_NEEDED',
      });
    }
  } catch (error) {
    console.error("Error scraping LandingJobs Germany", error);
  }
  return jobs;
}

/**
 * Central orchestrator for all German-only job discovery
 */
export async function scrapeAllGermanJobs(): Promise<NormalizedJob[]> {
  console.log('--- Starting Dedicated German Jobs Scrape ---');
  
  const [arbeitnow, berlin, landing] = await Promise.all([
    scrapeArbeitnow(),
    scrapeBerlinStartupJobs(),
    scrapeLandingJobsGermany()
  ]);

  const allGermanJobs = [...arbeitnow, ...berlin, ...landing];
  console.log(`--- Finished German Scrape: Found ${allGermanJobs.length} potential roles ---`);
  
  return allGermanJobs;
}
