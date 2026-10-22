import { describe, expect, test, vi } from 'vitest';
import { calculatePublishingFee } from './publishingRates';
import {
  calculateProgress,
  getDiscountedStorePrice,
  getMinimumExpForLevel,
  handleStorePurchase,
  handleTierPurchase,
} from './tierSystem';

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
    expect(purchase.exp).toBe(637);
    alert.mockRestore();
  });

  test('awards two EXP per credit spent on publishing', () => {
    expect(calculatePublishingFee('A short note').earnedExp).toBe(20);
  });

  test('charges 10 credits for each started 2,000 letters or digits', () => {
    expect(calculatePublishingFee('a'.repeat(2000)).finalCost).toBe(10);
    expect(calculatePublishingFee('a'.repeat(2001)).finalCost).toBe(20);
    expect(calculatePublishingFee('a'.repeat(4000)).finalCost).toBe(20);
    expect(calculatePublishingFee('a'.repeat(4001)).finalCost).toBe(30);
  });

  test('does not charge for whitespace or punctuation that contains no letters or digits', () => {
    expect(calculatePublishingFee(' !?\n ').characterCount).toBe(0);
    expect(calculatePublishingFee(' !?\n ').finalCost).toBe(0);
  });

  test('tier purchases raise EXP to at least the tier level', () => {
    const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    const purchase = handleTierPurchase({
      user: { credits: 1000, exp: 0, tier: 'Basic' },
      nextTier: 'Bronze',
    });

    expect(purchase.credits).toBe(500);
    expect(purchase.exp).toBe(getMinimumExpForLevel(20));
    expect(calculateProgress(purchase.exp).level).toBe(20);
    expect(purchase.tier).toBe('Bronze');
    alert.mockRestore();
  });

  test('tier purchases cannot reduce existing progression', () => {
    const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    const existingExp = getMinimumExpForLevel(25);
    const purchase = handleTierPurchase({
      user: { credits: 1000, exp: existingExp, tier: 'Basic' },
      nextTier: 'Bronze',
    });

    expect(purchase.exp).toBeGreaterThanOrEqual(existingExp);
    expect(calculateProgress(purchase.exp).level).toBeGreaterThanOrEqual(25);
    alert.mockRestore();
  });
});
