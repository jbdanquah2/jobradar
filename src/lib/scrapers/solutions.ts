import { NormalizedJob } from './remoteok';

export const SOLUTIONS_ROLES = [
  'solutions engineer',
  'solutions architect',
  'developer solutions engineer',
  'customer success engineer',
  'sales engineer',
  'field engineer',
  'partner engineer',
  'technical solutions engineer',
  'solutions delivery manager',
  'solutions specialist'
];

export const SOLUTIONS_WATCHLIST = [
  { name: 'Stripe', type: 'greenhouse', boardId: 'stripe' },
  { name: 'Cloudflare', type: 'greenhouse', boardId: 'cloudflare' },
  { name: 'Datadog', type: 'greenhouse', boardId: 'datadog' },
  { name: 'MongoDB', type: 'greenhouse', boardId: 'mongodb' },
  { name: 'Auth0', type: 'greenhouse', boardId: 'auth0' },
  { name: 'Twilio', type: 'greenhouse', boardId: 'twilio' },
  { name: 'Segment', type: 'greenhouse', boardId: 'segment' },
  { name: 'New Relic', type: 'greenhouse', boardId: 'newrelic' },
  { name: 'Sentry', type: 'greenhouse', boardId: 'sentry' },
  { name: 'PagerDuty', type: 'greenhouse', boardId: 'pagerduty' },
  { name: 'Checkly', type: 'greenhouse', boardId: 'checkly' },
  { name: 'Grafana Labs', type: 'greenhouse', boardId: 'grafana' },
  { name: 'HashiCorp', type: 'greenhouse', boardId: 'hashicorp' },
  { name: 'PostHog', type: 'greenhouse', boardId: 'posthog' },
  { name: 'Railway', type: 'lever', boardId: 'railway' },
  { name: 'Supabase', type: 'lever', boardId: 'supabase' },
  { name: 'Render', type: 'lever', boardId: 'render' },
];

export async function scrapeSolutionsJobs(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  
  // 1. Scrape specific companies via Greenhouse/Lever
  for (const company of SOLUTIONS_WATCHLIST) {
    try {
      if (company.type === 'greenhouse') {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.boardId}/jobs?content=true`);
        if (!res.ok) continue;
        const data = await res.json();
        
        for (const item of data.jobs) {
          const title = item.title.toLowerCase();
          if (SOLUTIONS_ROLES.some(role => title.includes(role))) {
            jobs.push({
              title: item.title,
              company: company.name,
              location_text: item.location?.name || 'Remote',
              remote_type: 'Remote',
              description: item.content || '',
              apply_url: item.absolute_url,
              source: `ATS (${company.name})`,
              date_posted: new Date(item.updated_at || new Date()),
              skills_detected: JSON.stringify([]),
              match_score: 0,
              eligibility_status: 'REVIEW_NEEDED',
            });
          }
        }
      } else if (company.type === 'lever') {
        const res = await fetch(`https://api.lever.co/v0/postings/${company.boardId}?mode=json`);
        if (!res.ok) continue;
        const data = await res.json();
        
        for (const item of data) {
          const title = item.text.toLowerCase();
          if (SOLUTIONS_ROLES.some(role => title.includes(role))) {
            jobs.push({
              title: item.text,
              company: company.name,
              location_text: item.categories?.location || 'Remote',
              remote_type: 'Remote',
              description: item.description + ' ' + (item.lists?.map((l: { text: string; content: string }) => l.text + ' ' + l.content).join(' ') || ''),
              apply_url: item.applyUrl,
              source: `ATS (${company.name})`,
              date_posted: new Date(item.createdAt || new Date()),
              skills_detected: JSON.stringify([]),
              match_score: 0,
              eligibility_status: 'REVIEW_NEEDED',
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping Solutions roles for ${company.name}:`, error);
    }
  }

  // 2. Scrape Himalayas specifically for "Solutions"
  try {
    const res = await fetch('https://himalayas.app/jobs/api?q=solutions');
    if (res.ok) {
      const data = await res.json();
      if (data.jobs) {
        for (const item of data.jobs) {
          const title = item.title.toLowerCase();
          if (SOLUTIONS_ROLES.some(role => title.includes(role))) {
            jobs.push({
              title: item.title,
              company: item.company_name,
              location_text: item.location || 'Remote',
              remote_type: 'Remote',
              description: item.description || '',
              apply_url: item.application_url || item.url,
              source: 'Himalayas (Solutions Search)',
              date_posted: new Date(item.pub_date || new Date()),
              skills_detected: JSON.stringify(item.skills || []),
              match_score: 0,
              eligibility_status: 'REVIEW_NEEDED',
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error scraping Himalayas for Solutions roles", error);
  }

  return jobs;
}
