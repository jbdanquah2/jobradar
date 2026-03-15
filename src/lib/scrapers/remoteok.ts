export interface NormalizedJob {
  title: string;
  company: string;
  location_text: string;
  remote_type: string;
  description: string;
  apply_url: string;
  source: string;
  date_posted: Date;
  skills_detected: string; // JSON string array for SQLite compatibility
  match_score: number;
  eligibility_status: string; // 'ELIGIBLE' | 'REVIEW_NEEDED' | 'REJECTED'
}

export async function scrapeRemoteOk(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    const response = await fetch('https://remoteok.com/api');
    if (!response.ok) return [];

    const data = await response.json();
    
    // First item is legal info
    for (const item of data.slice(1)) {
      if (!item.id || !item.company || !item.position) continue;

      const datePosted = new Date(item.date);
      const locationText = item.location ? item.location.toLowerCase() : 'worldwide';
      
      // Basic heuristic for remote type and eligibility (will be refined later)
      let eligibility = 'REVIEW_NEEDED';
      if (locationText.includes('worldwide') || locationText.includes('anywhere') || locationText.includes('global')) {
        eligibility = 'ELIGIBLE';
      } else if (locationText.includes('us only') || locationText.includes('united states only') || locationText.includes('uk only')) {
        eligibility = 'REJECTED';
      } else if (locationText.includes('emea') || locationText.includes('africa')) {
        eligibility = 'ELIGIBLE';
      }

      jobs.push({
        title: item.position,
        company: item.company,
        location_text: item.location || 'Worldwide',
        remote_type: 'Remote',
        description: item.description || '',
        apply_url: item.url,
        source: 'RemoteOK',
        date_posted: datePosted,
        skills_detected: JSON.stringify(item.tags || []),
        match_score: 0, // Will be calculated in the scoring engine
        eligibility_status: eligibility,
      });
    }
  } catch (error) {
    console.error("Error scraping RemoteOK", error);
  }
  return jobs;
}
