import { NormalizedJob } from './remoteok';

export const WATCHLIST = [
  { name: 'Canonical', type: 'greenhouse', boardId: 'canonical' },
  { name: 'Mattermost', type: 'greenhouse', boardId: 'mattermost' },
  { name: 'Sourcegraph', type: 'greenhouse', boardId: 'sourcegraph91' },
  { name: 'Andela', type: 'greenhouse', boardId: 'andela' },
  { name: 'Toptal', type: 'greenhouse', boardId: 'toptal' },
  { name: 'Replit', type: 'greenhouse', boardId: 'replit' },
  { name: 'Vercel', type: 'greenhouse', boardId: 'vercel' },
  { name: 'OpenAI', type: 'greenhouse', boardId: 'openai' },
  { name: 'GitLab', type: 'greenhouse', boardId: 'gitlab' },
];

export async function scrapeAtsJobs(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];

  const results = await Promise.all(
    WATCHLIST.map(async (company) => {
      const companyJobs: NormalizedJob[] = [];
      try {
        if (company.type === 'greenhouse') {
          const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.boardId}/jobs?content=true`);
          if (!res.ok) return [];
          const data = await res.json();
          
          for (const item of data.jobs) {
            const title = item.title.toLowerCase();
            
            // Broadening the filter to ensure we don't miss roles
            if (!title.includes('engineer') && !title.includes('developer') && !title.includes('lead')) continue;
            
            // Check for stack-related keywords
            const hasStackMatch = ['node', 'typescript', 'backend', 'full stack', 'ai', 'cloud', 'javascript', 'react', 'next'].some(k => title.includes(k));
            if (!hasStackMatch) continue;

            companyJobs.push({
              title: item.title,
              company: company.name,
              location_text: item.location?.name || 'Remote',
              remote_type: 'Remote',
              description: item.content || '',
              apply_url: item.absolute_url,
              source: 'Greenhouse',
              date_posted: new Date(item.updated_at || new Date()),
              skills_detected: JSON.stringify([]),
              match_score: 0,
              eligibility_status: 'REVIEW_NEEDED',
            });
          }
        }
      } catch (error) {
        console.error(`Error scraping ${company.name}:`, error);
      }
      return companyJobs;
    })
  );

  results.forEach(companyJobs => jobs.push(...companyJobs));
  return jobs;
}
