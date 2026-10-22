import { afterEach, expect, test, vi } from 'vitest';
import { getCommunityTopics } from './communityApi';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('explains when the site host serves HTML instead of the community Worker', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<!doctype html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })));

  await expect(getCommunityTopics('personal')).rejects.toThrow(
    'The site host is serving its static page instead of the community Worker. Deploy the Worker and site together with "npm run deploy".',
  );
});

test('returns the Worker error for JSON API failures', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ error: 'The shared community database is not configured.' }),
    { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )));

  await expect(getCommunityTopics('personal')).rejects.toThrow(
    'The shared community database is not configured.',
  );
});
