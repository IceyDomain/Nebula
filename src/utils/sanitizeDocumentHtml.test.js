import { expect, test } from 'vitest';
import { sanitizeDocumentHtml } from './sanitizeDocumentHtml';

test('keeps document formatting while removing executable markup and unsafe links', () => {
  const safeHtml = sanitizeDocumentHtml(
    '<h1 style="text-align:center">Title</h1>'
    + '<p><strong>Bold</strong><script>alert(1)</script>'
    + '<a href="javascript:alert(1)">unsafe</a>'
    + '<a href="https://example.com">safe</a>'
    + '<span style="background-image:url(javascript:alert(1));color:#123456">color</span></p>',
  );

  expect(safeHtml).toContain('<h1 style="text-align: center">Title</h1>');
  expect(safeHtml).toContain('<strong>Bold</strong>');
  expect(safeHtml).not.toContain('<script');
  expect(safeHtml).not.toContain('javascript:');
  expect(safeHtml).toContain('<a>unsafe</a>');
  expect(safeHtml).toContain('href="https://example.com"');
  expect(safeHtml).toContain('color: #123456');
  expect(safeHtml).not.toContain('background-image');
});
