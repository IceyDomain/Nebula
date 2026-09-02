import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Nebula landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'NEBULA' })).toBeDefined();
  expect(screen.getByRole('button', { name: /enter portal/i })).toBeDefined();
});
