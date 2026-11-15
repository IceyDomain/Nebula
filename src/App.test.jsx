import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import LandingPage from './components/LandingPage';

test('renders the Nebula landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'The secure portal for your school.' })).toBeDefined();
  expect(screen.getByRole('button', { name: /enter portal/i })).toBeDefined();
  expect(screen.getAllByRole('link', { name: 'For schools' }).every((link) => link.getAttribute('href') === '/for-schools.html')).toBe(true);
  expect(screen.getByRole('link', { name: 'Terms of Service' }).getAttribute('href')).toBe('/terms.html');
  expect(screen.getByRole('link', { name: 'Privacy Policy' }).getAttribute('href')).toBe('/privacy.html');
});

test('shows Christmas preview decorations on the landing page when requested', () => {
  const originalPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  localStorage.clear();
  window.history.replaceState({}, '', '/?christmas-preview=1');
  const siteIcon = document.createElement('link');
  siteIcon.rel = 'icon';
  siteIcon.href = '/nebula-star.png';
  const touchIcon = document.createElement('link');
  touchIcon.rel = 'apple-touch-icon';
  touchIcon.href = '/nebula-star.png';
  document.head.append(siteIcon, touchIcon);

  render(<App />);

  expect(document.querySelector('.app-root')?.getAttribute('data-event')).toBe('christmas');
  expect(screen.getByText('Christmas preview')).toBeDefined();
  expect(screen.getByAltText('Nebula Christmas logo').getAttribute('src')).toBe('/christmas-logo.png');
  expect(document.querySelector('.lp-header-christmas-logo')?.getAttribute('src')).toBe('/christmas-logo.png');
  expect(document.querySelector('.lp-site-hat')).toBeNull();
  expect(siteIcon.getAttribute('href')).toBe('/christmas-site-logo.svg?v=4');
  expect(siteIcon.getAttribute('type')).toBe('image/svg+xml');
  expect(touchIcon.getAttribute('href')).toBe('/nebula-star.png');

  window.history.replaceState({}, '', originalPath);
  siteIcon.remove();
  touchIcon.remove();
  localStorage.clear();
});

test('applies the Christmas palette and site-logo accent to a personal dashboard preview', async () => {
  const originalPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  localStorage.clear();
  window.history.replaceState({}, '', '/?christmas-preview=1');
  localStorage.setItem('nebula_active_user', JSON.stringify({
    username: 'preview-user',
    email: 'preview@example.com',
    role: 'user',
    credits: 2000,
    tier: 'Basic',
  }));

  render(<App />);

  await waitFor(() => expect(document.querySelector('.nd[data-event="christmas"]')).not.toBeNull());
  expect(document.querySelector('.nd')?.getAttribute('style')).toContain('linear-gradient');
  expect(document.querySelector('.nd-brand .nd-christmas-wordmark')?.getAttribute('src')).toBe('/christmas-logo.png');
  expect(document.querySelector('.nd-site-hat')).toBeNull();
  expect(screen.getByRole('region', { name: 'Christmas event' })).toBeDefined();

  window.history.replaceState({}, '', originalPath);
  localStorage.clear();
});

test('restores an existing session without deleting it during startup', async () => {
  localStorage.clear();
  const user = {
    username: 'returning-user',
    email: 'returning@example.com',
    role: 'user',
    credits: 1000,
    tier: 'Basic',
  };
  localStorage.setItem('nebula_active_user', JSON.stringify(user));

  const firstLoad = render(<App />);
  await waitFor(() => expect(screen.getByText(/Welcome back,/)).toBeDefined());
  expect(JSON.parse(localStorage.getItem('nebula_active_user')).username).toBe('returning-user');

  firstLoad.unmount();
  const refreshedLoad = render(<App />);
  await waitFor(() => expect(screen.getByText(/Welcome back,/)).toBeDefined());
  expect(JSON.parse(localStorage.getItem('nebula_active_user')).username).toBe('returning-user');
  refreshedLoad.unmount();
  localStorage.clear();
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
  expect(screen.getByRole('link', { name: 'Terms of Service' }).getAttribute('href')).toBe('/terms.html');
  expect(screen.getByRole('link', { name: 'Privacy Policy' }).getAttribute('href')).toBe('/privacy.html');

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
  fireEvent.change(organizationForm.getByLabelText('Grade level'), { target: { value: '7' } });
  fireEvent.change(organizationForm.getByLabelText('Form'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => {
    const activeUser = JSON.parse(localStorage.getItem('nebula_active_user'));
    expect(activeUser.username).toBe('schooluser');
    expect(activeUser.organization.name).toBe('Ardenne High School');
    expect(activeUser.role).toBe('student');
    expect(activeUser.grade).toBe(7);
    expect(activeUser.form).toBe(1);
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
