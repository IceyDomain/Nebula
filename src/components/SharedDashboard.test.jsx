import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import SharedDashboard from './SharedDashboard';

test('posts topics and replies to the shared community API', async () => {
  let topic;
  const fetchMock = vi.fn(async (_url, options = {}) => {
    const body = options.body ? JSON.parse(options.body) : null;
    if (options.method === 'POST' && _url.includes('/replies')) {
      return { ok: true, status: 201, json: async () => ({ id: 'reply-1', ...body, likes: 0 }) };
    }
    if (options.method === 'POST') {
      topic = { id: 'topic-1', ...body, replies: [], repliesCount: 0, views: '1', lastActivity: 'Just now' };
      return { ok: true, status: 201, json: async () => topic };
    }
    return { ok: true, status: 200, json: async () => topic ? [topic] : [] };
  });
  vi.stubGlobal('fetch', fetchMock);

  const { unmount } = render(
    <SharedDashboard user={{ username: 'student-one', credits: 1000, tier: 'Basic' }} />,
  );
  await waitFor(() => expect(screen.getByText(/Connected to the shared personal community/)).toBeDefined());

  fireEvent.click(screen.getByRole('button', { name: '+ New Topic' }));
  fireEvent.change(screen.getByPlaceholderText('Topic title'), { target: { value: 'A shared topic' } });
  fireEvent.change(screen.getByPlaceholderText('Type your post...'), { target: { value: 'A message for classmates.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Post Topic' }));

  const topicButton = await screen.findByRole('button', { name: /A shared topic/ });
  expect(fetchMock.mock.calls.some(([url]) => url.includes('scope=personal'))).toBe(true);
  expect(topic.author).toBe('student-one');
  fireEvent.click(topicButton);

  fireEvent.change(screen.getByRole('textbox', { name: 'Reply to topic' }), { target: { value: 'I can see it.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reply' }));
  await waitFor(() => expect(screen.getByText('I can see it.')).toBeDefined());

  unmount();
  vi.unstubAllGlobals();
});

test('reports a shared forum outage and disables posting', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
  const { unmount } = render(
    <SharedDashboard user={{ username: 'student-one', credits: 1000, tier: 'Basic' }} />,
  );

  expect((await screen.findByRole('alert')).textContent).toContain('Shared community unavailable');
  expect(screen.getByRole('button', { name: '+ New Topic' }).disabled).toBe(true);

  unmount();
  vi.unstubAllGlobals();
});

test('reports a static-site fallback instead of treating HTML as a topic list', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ title: 'Nebula Portal' }),
  }));
  const { unmount } = render(
    <SharedDashboard user={{ username: 'student-one', credits: 1000, tier: 'Basic' }} />,
  );

  expect((await screen.findByRole('alert')).textContent).toContain('did not return a topic list');
  expect(screen.getByRole('button', { name: '+ New Topic' }).disabled).toBe(true);

  unmount();
  vi.unstubAllGlobals();
});
