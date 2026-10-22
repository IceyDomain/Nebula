import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import StandardDashboard from './StandardDashboard';
import { calculateProgress } from '../utils/tierSystem';

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

test('saves purchased backgrounds on the signed-in account', () => {
  localStorage.clear();
  const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
  const user = { username: 'store-test', email: 'store@example.com', role: 'user', credits: 1000, tier: 'Basic', exp: 0 };
  localStorage.setItem('nebula_users_personal', JSON.stringify([user]));
  const { unmount } = render(<StandardDashboard user={user} onSignOut={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: 'Open profile menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
  fireEvent.click(screen.getByRole('button', { name: 'Visit Store' }));

  const backgroundCard = screen.getByText('Deep Space Blue').closest('.nd-card');
  fireEvent.click(within(backgroundCard).getByRole('button', { name: 'Buy' }));

  const savedUser = JSON.parse(localStorage.getItem('nebula_users_personal')).find((account) => account.username === user.username);
  expect(savedUser.purchasedBgs).toContain('#03071e');
  expect(JSON.parse(localStorage.getItem('nebula_active_user')).purchasedBgs).toContain('#03071e');
  unmount();

  render(<StandardDashboard user={savedUser} onSignOut={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open profile menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
  fireEvent.click(screen.getByRole('button', { name: 'Visit Store' }));
  const restoredCard = screen.getByText('Deep Space Blue').closest('.nd-card');
  expect(within(restoredCard).getByRole('button', { name: 'Unlocked' })).toBeDefined();
  alert.mockRestore();
});

test('tier upgrades persist the matching EXP level', () => {
  localStorage.clear();
  const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
  const user = { username: 'tier-test', email: 'tier@example.com', role: 'user', credits: 1000, tier: 'Basic', exp: 0 };
  localStorage.setItem('nebula_users_personal', JSON.stringify([user]));
  render(<StandardDashboard user={user} onSignOut={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: 'Open profile menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
  fireEvent.click(screen.getByRole('button', { name: 'Visit Store' }));
  fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }));

  const savedUser = JSON.parse(localStorage.getItem('nebula_users_personal'))
    .find((account) => account.username === user.username);
  expect(savedUser.tier).toBe('Bronze');
  expect(calculateProgress(savedUser.exp).level).toBe(20);
  expect(JSON.parse(localStorage.getItem('nebula_active_user')).tier).toBe('Bronze');
  alert.mockRestore();
});
