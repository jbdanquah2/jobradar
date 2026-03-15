import { NormalizedJob } from './remoteok';

export async function scrapeArbeitnow(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    // Arbeitnow is great for English speaking jobs in Germany
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.data) return [];

    for (const item of data.data) {
      const title = item.title.toLowerCase();
      
      // Basic filtering for your stack
      const isTech = /engineer|developer|lead|architect/i.test(title);
      if (!isTech) continue;

      jobs.push({
        title: item.title,
        company: item.company_name,
        location_text: item.location || 'Germany',
        remote_type: item.remote ? 'Remote' : 'On-site',
        description: item.description || '',
        apply_url: item.url,
        source: 'Arbeitnow',
        date_posted: new Date(item.created_at * 1000 || new Date()),
        skills_detected: JSON.stringify(item.tags || []),
        match_score: 0,
        eligibility_status: 'REVIEW_NEEDED',
      });
    }
  } catch (error) {
    console.error("Error scraping Arbeitnow", error);
  }
  return jobs;
}
