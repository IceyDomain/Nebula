import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import useChristmasEvent from './useChristmasEvent';

afterEach(() => {
  window.history.replaceState({}, '', '/');
  vi.useRealTimers();
  localStorage.clear();
});

function ChristmasHarness({ onCharge }) {
  const { christmas, buyChristmas, toggleChristmas } = useChristmasEvent('holiday-user');
  return (
    <>
      <output data-testid="active">{String(christmas.active.app)}</output>
      <button type="button" onClick={() => buyChristmas('app', 1000, onCharge)}>Buy app theme</button>
      <button type="button" onClick={() => toggleChristmas('app', false)}>Turn off app theme</button>
    </>
  );
}

test('purchases and toggles Christmas items only during the event', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 11, 15, 12));
  const onCharge = vi.fn();

  render(<ChristmasHarness onCharge={onCharge} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buy app theme' }));

  expect(onCharge).toHaveBeenCalledOnce();
  expect(onCharge).toHaveBeenCalledWith(750);
  expect(screen.getByTestId('active').textContent).toBe('true');
  expect(JSON.parse(localStorage.getItem('nebula_christmas_holiday-user')).owned).toContain('app');

  fireEvent.click(screen.getByRole('button', { name: 'Turn off app theme' }));
  expect(screen.getByTestId('active').textContent).toBe('false');
});

test('Christmas preview enables the full theme without changing saved items', () => {
  window.history.replaceState({}, '', '/?christmas-preview=1');
  const onCharge = vi.fn();

  render(<ChristmasHarness onCharge={onCharge} />);

  expect(screen.getByTestId('active').textContent).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Turn off app theme' }));
  expect(screen.getByTestId('active').textContent).toBe('false');
  expect(onCharge).not.toHaveBeenCalled();
  expect(localStorage.getItem('nebula_christmas_holiday-user')).toBeNull();
});
