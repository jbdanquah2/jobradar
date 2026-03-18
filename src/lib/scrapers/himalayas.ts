import { NormalizedJob } from './remoteok';
import { isLocationCompatible } from './utils';

export async function scrapeHimalayas(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    // Himalayas has a very clean public API for remote jobs
    // We'll search for 'node' and 'germany' specifically
    const res = await fetch('https://himalayas.app/jobs/api?q=node+germany');
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.jobs) return [];

    for (const item of data.jobs) {
      const title = item.title.toLowerCase();
      const location = item.location || '';
      const description = item.description || '';
      
      // Basic filtering for your stack
      if (!title.includes('engineer') && !title.includes('developer')) continue;

      // Location Filtering
      if (!isLocationCompatible(`${title} ${location} ${description}`)) continue;

      jobs.push({
        title: item.title,
        company: item.company_name,
        location_text: location || 'Remote',
        remote_type: 'Remote',
        description: description,
        apply_url: item.application_url || item.url,
        source: 'Himalayas',
        date_posted: new Date(item.pub_date || new Date()),
        skills_detected: JSON.stringify(item.skills || []),
        match_score: 0,
        eligibility_status: 'REVIEW_NEEDED',
      });
    }
  } catch (error) {
    console.error("Error scraping Himalayas", error);
  }
  return jobs;
}
