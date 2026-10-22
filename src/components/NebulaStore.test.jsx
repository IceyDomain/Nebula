import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import NebulaStore from './NebulaStore';

test('shows tier-discounted frame pricing and sends the catalog price to the purchase handler', () => {
  const onPurchaseFrame = vi.fn();
  render(
    <NebulaStore
      credits={1000}
      tier="Gold"
      purchasedBgs={[]}
      onPurchaseBackground={vi.fn()}
      onPurchaseTier={vi.fn()}
      onPurchaseFrame={onPurchaseFrame}
      onPurchaseTemplate={vi.fn()}
      onEquipFrame={vi.fn()}
    />,
  );

  const frameCard = screen.getByText('Silver Frame').closest('.nd-card');
  expect(within(frameCard).getByText('255 Credits')).toBeDefined();
  expect(within(frameCard).getByText('300')).toBeDefined();
  fireEvent.click(within(frameCard).getByRole('button', { name: 'Unlock' }));
  expect(onPurchaseFrame).toHaveBeenCalledWith('Silver', 300);
});
