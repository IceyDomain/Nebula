import { describe, expect, test, vi } from 'vitest';
import { getDiscountedStorePrice, handleStorePurchase } from './tierSystem';

describe('store discounts', () => {
  test('uses the same rounded price for displayed and charged discounts', () => {
    expect(getDiscountedStorePrice(300, 'Gold')).toBe(255);
    expect(getDiscountedStorePrice(300, 'Basic')).toBe(300);
  });

  test('charges the discounted price and awards EXP from that price', () => {
    const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    const purchase = handleStorePurchase({
      user: { credits: 1000, exp: 0, tier: 'Gold' },
      itemPrice: 300,
      activeTier: 'Gold',
    });

    expect(purchase.credits).toBe(745);
    expect(purchase.exp).toBe(318);
    alert.mockRestore();
  });
});
