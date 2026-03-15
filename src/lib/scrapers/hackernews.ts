import { NormalizedJob } from './remoteok';

export async function scrapeHackerNews(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    // 1. Get the latest 'Who is Hiring' post from the user 'whoishiring'
    const userResponse = await fetch('https://hacker-news.firebaseio.com/v0/user/whoishiring.json');
    const userData = await userResponse.json();
    
    // The first item in submitted is usually the latest 'Who is Hiring' thread
    const latestThreadId = userData.submitted.find((id: number) => id !== undefined);
    if (!latestThreadId) return [];

    const threadResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${latestThreadId}.json`);
    const threadData = await threadResponse.json();

    if (!threadData.title.includes('Who is hiring') || !threadData.kids) {
      return [];
    }

    // 2. Fetch the top-level comments (each one is a job post)
    // We'll take the first 200 to capture more startup roles
    const jobIds = threadData.kids.slice(0, 200);
    
    for (const id of jobIds) {
      const jobResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const jobData = await jobResponse.json();

      if (!jobData || !jobData.text || jobData.deleted) continue;

      // HN posts often start with: Company | Role | Location | ...
      const rawText = jobData.text.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
      const firstLine = rawText.split('\n')[0];
      const parts = firstLine.split('|').map((p: string) => p.trim());

      const company = parts[0] || 'Unknown Startup';
      const title = parts[1] || 'Software Engineer';
      const location = parts[2] || 'Unknown';
      
      const isRemoteMatch = /\bremote\b/i.test(rawText);
      const isNegativeMatch = /\b(no|not|non)\s+remote\b/i.test(rawText);
      
      // Strict Location Filtering for Hacker News
      const REJECT_LOCATION_PATTERNS = [
        /u\.?s\.?\s+only/i,
        /united\s+states\s+only/i,
        /u\.?k\.?\s+only/i,
        /canada\s+only/i,
        /europe\s+only/i,
        /eu\s+only/i,
        /must\s+be\s+based\s+in\s+the\s+u\.?s\.?/i,
        /no\s+sponsorship/i,
        /visa\s+sponsorship\s+not\s+available/i,
      ];

      const isExcludedLocation = REJECT_LOCATION_PATTERNS.some(pattern => pattern.test(rawText));

      if (!isRemoteMatch || isNegativeMatch || isExcludedLocation) continue;

      jobs.push({
        title: title,
        company: company,
        location_text: location,
        remote_type: 'Remote',
        description: rawText.substring(0, 2000), 
        apply_url: `https://news.ycombinator.com/item?id=${id}`,
        source: 'Hacker News',
        date_posted: new Date(jobData.time * 1000),
        skills_detected: JSON.stringify([]), 
        match_score: 0,
        eligibility_status: 'REVIEW_NEEDED',
      });
    }
  } catch (error) {
    console.error("Error scraping Hacker News", error);
  }
  return jobs;
}
