import { TIER_PERKS } from './tierSystem.js';

export function calculatePublishingFee(content = '', userTier = 'Basic') {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const baseUnits = Math.max(1, Math.ceil(words / 2000));
  const rawCreditCost = baseUnits * 10;
  const perks = TIER_PERKS[userTier] || TIER_PERKS.Basic;
  const finalCreditCost = Math.max(1, Math.floor(rawCreditCost * (1 - perks.discount)));

  return {
    wordCount: words,
    rawCost: rawCreditCost,
    finalCost: finalCreditCost,
    earnedExp: Math.floor(finalCreditCost * perks.boost),
    discountPercent: perks.discount * 100,
  };
}
