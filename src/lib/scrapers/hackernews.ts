import { NormalizedJob } from './remoteok';
import { isLocationCompatible } from './utils';

export async function scrapeHackerNews(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  try {
    // 1. Get the latest 'Who is Hiring' post from the user 'whoishiring'
    const userResponse = await fetch('https://hacker-news.firebaseio.com/v0/user/whoishiring.json');
    const userData = await userResponse.json();
    
    // The user 'whoishiring' submits multiple threads (Hiring, Freelancer, Hired).
    // We need to find the latest thread with "Who is hiring" in the title.
    const submittedIds = userData.submitted || [];
    let latestThreadId = null;

    // Check the latest 10 submissions to find the actual hiring thread
    for (const id of submittedIds.slice(0, 10)) {
      const threadRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const threadData = await threadRes.json();
      if (threadData && threadData.title && threadData.title.includes('Who is hiring')) {
        latestThreadId = id;
        break;
      }
    }

    if (!latestThreadId) return [];

    const threadResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${latestThreadId}.json`);
    const threadData = await threadResponse.json();

    if (!threadData.title.includes('Who is hiring') || !threadData.kids) {
      return [];
    }

    // 2. Fetch the top-level comments (each one is a job post)
    // We'll take the first 300 to stay within serverless timeouts
    const jobIds = threadData.kids.slice(0, 300);
    
    const jobResults = await Promise.all(
      jobIds.map(async (id: number) => {
        try {
          const jobResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const jobData = await jobResponse.json();

          if (!jobData || !jobData.text || jobData.deleted) return null;

          const rawText = jobData.text.replace(/<[^>]*>?/gm, ''); 
          const firstLine = rawText.split('\n')[0];
          const parts = firstLine.split('|').map((p: string) => p.trim());

          const company = parts[0] || 'Unknown Startup';
          const title = parts[1] || 'Software Engineer';
          const location = parts[2] || 'Unknown';
          
          const isRemoteMatch = /\bremote\b/i.test(rawText);
          const isNegativeMatch = /\b(no|not|non)\s+remote\b/i.test(rawText);
          
          if (!isRemoteMatch || isNegativeMatch) return null;

          // Location Filtering
          if (!isLocationCompatible(`${title} ${location} ${rawText}`)) return null;

          return {
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
          };
        } catch (_e) {
          return null;
        }
      })
    );

    for (const job of jobResults) {
      if (job) jobs.push(job);
    }
  } catch (error) {
    console.error("Error scraping Hacker News", error);
  }
  return jobs;
}
