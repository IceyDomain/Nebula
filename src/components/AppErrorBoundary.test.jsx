import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary';
import { ERROR_CODES } from '../utils/errorCodes';

afterEach(() => {
  vi.restoreAllMocks();
});

test('shows a support code when a component fails to render', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  function BrokenPage() {
    throw new Error('render failed');
  }

  render(
    <AppErrorBoundary>
      <BrokenPage />
    </AppErrorBoundary>,
  );

  expect(screen.getByRole('heading', { name: ERROR_CODES.UI_RENDER_FAILURE.title })).toBeDefined();
  expect(screen.getByText(ERROR_CODES.UI_RENDER_FAILURE.code)).toBeDefined();
});

test('shows a support code for an uncaught browser error', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<AppErrorBoundary><p>Healthy page</p></AppErrorBoundary>);

  fireEvent(
    window,
    new ErrorEvent('error', { message: 'unexpected failure' }),
  );

  expect(screen.getByRole('heading', { name: ERROR_CODES.GLOBAL_SCRIPT_ERROR.title })).toBeDefined();
  expect(screen.getByText(ERROR_CODES.GLOBAL_SCRIPT_ERROR.code)).toBeDefined();
});

test('shows a support code for an unhandled promise rejection', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<AppErrorBoundary><p>Healthy page</p></AppErrorBoundary>);
  const rejectionEvent = new Event('unhandledrejection');
  Object.defineProperty(rejectionEvent, 'reason', { value: new Error('background failure') });

  fireEvent(window, rejectionEvent);

  expect(screen.getByRole('heading', { name: ERROR_CODES.UNHANDLED_REJECTION.title })).toBeDefined();
  expect(screen.getByText(ERROR_CODES.UNHANDLED_REJECTION.code)).toBeDefined();
});
