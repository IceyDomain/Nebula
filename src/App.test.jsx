import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import LandingPage from './components/LandingPage';

test('renders the Nebula landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'The secure portal for your school.' })).toBeDefined();
  expect(screen.getByRole('button', { name: /enter portal/i })).toBeDefined();
});

test('routes landing page entry actions to the sign-in choice screen', () => {
  const onOpenModal = vi.fn();
  render(<LandingPage onOpenModal={onOpenModal} />);

  fireEvent.click(screen.getByRole('button', { name: /enter portal/i }));
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(onOpenModal).toHaveBeenCalledTimes(2);
});

test('opens the sign-in choice from the landing page and returns home', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /enter portal/i }));
  expect(screen.getByRole('heading', { name: 'How are you signing in?' })).toBeDefined();

  fireEvent.click(screen.getByRole('button', { name: /back to home/i }));
  expect(screen.getByRole('heading', { name: 'The secure portal for your school.' })).toBeDefined();
});

test('opens organization search from the organization sign-in choice', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /enter portal/i }));
  fireEvent.click(screen.getByRole('button', { name: /organization/i }));

  expect(screen.getByRole('heading', { name: 'Choose your country or region' })).toBeDefined();
  expect(screen.getByRole('button', { name: /continue/i }).disabled).toBe(true);

  fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
  expect(screen.getByRole('heading', { name: 'How are you signing in?' })).toBeDefined();
});

test('creates an organization account from the organization sign-in flow', async () => {
  localStorage.clear();
  const { container } = render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /enter portal/i }));
  fireEvent.click(screen.getByRole('button', { name: /organization/i }));
  fireEvent.click(screen.getByRole('button', { name: /jamaica/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /ardenne high school/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.click(screen.getByRole('tab', { name: /create account/i }));
  const organizationForm = within(container.querySelector('.fo-form'));
  fireEvent.change(organizationForm.getByLabelText('Username'), { target: { value: 'schooluser' } });
  fireEvent.change(organizationForm.getByLabelText('Email address'), { target: { value: 'school@example.com' } });
  fireEvent.change(organizationForm.getByLabelText('Password'), { target: { value: 'securepass123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => {
    const activeUser = JSON.parse(localStorage.getItem('nebula_active_user'));
    expect(activeUser.username).toBe('schooluser');
    expect(activeUser.organization.name).toBe('Ardenne High School');
  });
});

test('signs in with the Ardenne demo account through organization login', async () => {
  localStorage.clear();
  const { container } = render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /enter portal/i }));
  fireEvent.click(screen.getByRole('button', { name: /organization/i }));
  fireEvent.click(screen.getByRole('button', { name: /jamaica/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /ardenne high school/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  const organizationForm = within(container.querySelector('.fo-form'));
  fireEvent.change(organizationForm.getByLabelText('Username or email'), { target: { value: 'ardenne-demo' } });
  fireEvent.change(organizationForm.getByLabelText('Password'), { target: { value: 'ardenne123' } });
  fireEvent.click(organizationForm.getByRole('button', { name: /^sign in$/i }));

  await waitFor(() => {
    const activeUser = JSON.parse(localStorage.getItem('nebula_active_org_user'));
    expect(activeUser.username).toBe('ardenne-demo');
    expect(activeUser.organization.id).toBe('ardenne-high-school');
  });
});
