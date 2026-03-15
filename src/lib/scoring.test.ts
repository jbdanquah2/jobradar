import { calculateJobMatch } from './scoring';
import { expect, test } from 'vitest';

test('calculates correct score and eligibility for a perfect match', () => {
  const job = {
    title: 'Senior Node.js Backend Engineer',
    company: 'Tech Corp',
    location_text: 'Worldwide',
    remote_type: 'Remote',
    description: 'Looking for a senior engineer with expertise in Node.js, TypeScript, PostgreSQL, AWS, and Microservices.',
    apply_url: 'http://example.com/apply',
    source: 'RemoteOK',
    date_posted: new Date(),
    skills_detected: '[]',
    match_score: 0,
    eligibility_status: 'REVIEW_NEEDED'
  };

  const result = calculateJobMatch(job);
  
  // 5 skills out of 10 max = 30 points. Seniority = 20 points. Eligible = 20 points. Total = 70.
  expect(result.eligibility_status).toBe('ELIGIBLE');
  expect(result.match_score).toBeGreaterThan(60); // It should score highly
});

test('rejects US only jobs', () => {
  const job = {
    title: 'Software Engineer',
    company: 'US Corp',
    location_text: 'US Only',
    remote_type: 'Remote',
    description: 'We need a React developer based in the US.',
    apply_url: 'http://example.com/apply2',
    source: 'RemoteOK',
    date_posted: new Date(),
    skills_detected: '[]',
    match_score: 0,
    eligibility_status: 'REVIEW_NEEDED'
  };

  const result = calculateJobMatch(job);
  
  expect(result.eligibility_status).toBe('REJECTED');
});
