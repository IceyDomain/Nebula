import { EXP_PER_CREDIT, TIER_PERKS } from './tierSystem.js';

export function calculatePublishingFee(content = '', userTier = 'Basic') {
  const characterCount = (content.match(/[\p{L}\p{N}]/gu) || []).length;
  const baseUnits = Math.ceil(characterCount / 2000);
  const rawCreditCost = baseUnits * 10;
  const perks = TIER_PERKS[userTier] || TIER_PERKS.Basic;
  const finalCreditCost = Math.floor(rawCreditCost * (1 - perks.discount));

  return {
    characterCount,
    baseUnits,
    rawCost: rawCreditCost,
    finalCost: finalCreditCost,
    earnedExp: Math.floor(finalCreditCost * perks.boost * EXP_PER_CREDIT),
    discountPercent: perks.discount * 100,
  };
}
