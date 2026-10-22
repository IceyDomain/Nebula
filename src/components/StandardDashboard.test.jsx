import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import StandardDashboard from './StandardDashboard';

test('profile menu opens the profile and unlocked frames can be equipped', () => {
  localStorage.clear();
  const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
  const { container } = render(
    <StandardDashboard
      user={{ username: 'profile-test', email: 'profile@example.com', role: 'user', credits: 1000, tier: 'Basic', exp: 0 }}
      onSignOut={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Open profile menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Visit Store' }));

  fireEvent.click(screen.getByRole('tab', { name: 'Avatar Frames' }));
  const frameCard = screen.getByText('Silver Frame').closest('.nd-card');
  fireEvent.click(within(frameCard).getByRole('button', { name: 'Unlock' }));

  fireEvent.click(screen.getByRole('button', { name: 'Open profile menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
  fireEvent.click(screen.getByRole('button', { name: 'Equip' }));
  expect(screen.getAllByText('Equipped').length).toBeGreaterThan(0);
  expect(container.querySelector('.nd-profile .nd-ring-Silver')).not.toBeNull();
  alert.mockRestore();
});
