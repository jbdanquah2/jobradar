import { expect, test, vi } from 'vitest';
import { scrapeHackerNews } from './hackernews';

test('scrapeHackerNews parses a simulated HN thread correctly', async () => {
  // Mock the global fetch
  const mockFetch = vi.fn((url) => {
    if (url.includes('/user/whoishiring.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({ submitted: [12345] })
      });
    }
    if (url.includes('/item/12345.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          title: 'Who is hiring? (March 2026)',
          kids: [1, 2]
        })
      });
    }
    if (url.includes('/item/1.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          id: 1,
          time: 1741731600,
          text: 'Stripe | Senior Backend Engineer | Remote | https://stripe.com/jobs\n\nWe are looking for Node.js experts.'
        })
      });
    }
    if (url.includes('/item/2.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          id: 2,
          time: 1741731600,
          text: 'LocalCorp | Junior Dev | New York | No remote'
        })
      });
    }
    return Promise.reject('Unknown URL');
  });

  global.fetch = mockFetch as unknown as typeof fetch;

  const jobs = await scrapeHackerNews();

  // Should only have 1 job (Stripe) because LocalCorp doesn't mention Remote
  expect(jobs.length).toBe(1);
  expect(jobs[0].company).toBe('Stripe');
  expect(jobs[0].title).toBe('Senior Backend Engineer');
  expect(jobs[0].location_text).toBe('Remote');
  expect(jobs[0].source).toBe('Hacker News');
});
