import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import NebulaDocs from './NebulaDocs';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('unlocked store templates appear in Docs and create a prefilled document', () => {
  localStorage.clear();
  render(
    <NebulaDocs
      credits={1000}
      user={{ username: 'template-user', unlockedTemplates: ['Resume Pro'] }}
      onPublish={() => {}}
      onUpdateCredits={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /Resume Pro/ }));
  expect(screen.getByRole('textbox', { name: 'Document editor' }).textContent).toContain('PROFESSIONAL SUMMARY');
});

test('publishes the formatted document to the personal community before charging', async () => {
  const onPublish = vi.fn();
  const onUpdateCredits = vi.fn();
  const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
  const fetchMock = vi.fn(async (_url, options) => ({
    ok: true,
    status: 201,
    json: async () => ({ id: 'published-document', ...JSON.parse(options.body) }),
  }));
  vi.stubGlobal('fetch', fetchMock);

  render(
    <NebulaDocs
      credits={1000}
      user={{ username: 'doc-author', tier: 'Basic', exp: 0 }}
      onPublish={onPublish}
      onUpdateCredits={onUpdateCredits}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /^Resume$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Share / Publish' }));

  await waitFor(() => expect(onPublish).toHaveBeenCalledTimes(1));
  const [url, request] = fetchMock.mock.calls[0];
  const postedDocument = JSON.parse(request.body);

  expect(url).toBe('/api/community/topics?scope=personal');
  expect(postedDocument.category).toBe('General Discussion');
  expect(postedDocument.title).toBe('Resume');
  expect(postedDocument.documentHtml).toContain('<h1>');
  expect(postedDocument.content).toContain('Education');
  expect(onUpdateCredits).toHaveBeenCalledWith(990, 20);
  expect(onPublish.mock.calls[0][0].html).toBe(postedDocument.documentHtml);
  alert.mockRestore();
});

test('does not charge credits when the community document post fails', async () => {
  const onPublish = vi.fn();
  const onUpdateCredits = vi.fn();
  const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({ error: 'Community is unavailable.' }),
  }));

  render(
    <NebulaDocs
      credits={1000}
      user={{ username: 'doc-author', tier: 'Basic', exp: 0 }}
      onPublish={onPublish}
      onUpdateCredits={onUpdateCredits}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /^Resume$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Share / Publish' }));

  await waitFor(() => expect(alert).toHaveBeenCalledWith(
    'Unable to publish this document to the Community forum. Community is unavailable.',
  ));
  expect(onUpdateCredits).not.toHaveBeenCalled();
  expect(onPublish).not.toHaveBeenCalled();
  alert.mockRestore();
});
