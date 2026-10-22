import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import NebulaDocs from './NebulaDocs';

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
