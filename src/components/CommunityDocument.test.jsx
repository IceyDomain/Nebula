import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import CommunityDocument from './CommunityDocument';

test('renders sanitized formatted document content', () => {
  const { container } = render(
    <CommunityDocument
      topic={{
        title: 'Shared report',
        content: 'Report content',
        documentHtml: '<h1>Report</h1><p><strong>Important</strong><script>alert(1)</script></p>',
      }}
    />,
  );

  expect(container.querySelector('h1').textContent).toBe('Report');
  expect(container.querySelector('strong').textContent).toBe('Important');
  expect(container.querySelector('script')).toBeNull();
});
