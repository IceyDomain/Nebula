export const TIER_PERKS = {
  Basic: { level: 0, discount: 0, boost: 1, monthlyBonus: 100, milestoneReward: 0, buyable: true, price: 0 },
  Bronze: { level: 20, discount: 0.02, boost: 1, monthlyBonus: 200, milestoneReward: 250, buyable: true, price: 500 },
  Copper: { level: 40, discount: 0.05, boost: 1, monthlyBonus: 350, milestoneReward: 500, buyable: true, price: 1200 },
  Iron: { level: 60, discount: 0.08, boost: 1, monthlyBonus: 550, milestoneReward: 1000, buyable: true, price: 2500 },
  Silver: { level: 80, discount: 0.12, boost: 1, monthlyBonus: 800, milestoneReward: 2000, buyable: true, price: 5000 },
  Gold: { level: 100, discount: 0.15, boost: 1.25, monthlyBonus: 1100, milestoneReward: 4000, buyable: true, price: 10000 },
  Diamond: { level: 120, discount: 0.2, boost: 1.5, monthlyBonus: 1600, milestoneReward: 7500, buyable: false, price: null },
  Ruby: { level: 140, discount: 0.25, boost: 1.75, monthlyBonus: 2300, milestoneReward: 12000, buyable: false, price: null },
  Platinum: { level: 160, discount: 0.3, boost: 2, monthlyBonus: 3100, milestoneReward: 20000, buyable: false, price: null },
  Nebula: { level: 999, discount: 0.5, boost: 3, monthlyBonus: 9999, milestoneReward: 0, buyable: false, price: null },
};

export function getExpForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.05, level - 1));
}

export function calculateProgress(totalExp = 0) {
  let level = 1;
  let remainingExp = Math.max(0, totalExp);
  let nextLevelExp = getExpForLevel(level + 1);

  while (remainingExp >= nextLevelExp) {
    remainingExp -= nextLevelExp;
    level += 1;
    nextLevelExp = getExpForLevel(level + 1);
  }

  return {
    level,
    currentLevelExp: remainingExp,
    nextLevelExp,
    percent: Math.min(100, Math.floor((remainingExp / nextLevelExp) * 100)),
  };
}

export function getTierForLevel(level) {
  if (level >= 160) return 'Platinum';
  if (level >= 140) return 'Ruby';
  if (level >= 120) return 'Diamond';
  if (level >= 100) return 'Gold';
  if (level >= 80) return 'Silver';
  if (level >= 60) return 'Iron';
  if (level >= 40) return 'Copper';
  if (level >= 20) return 'Bronze';
  return 'Basic';
}

export function handleStorePurchase({ user, itemPrice, activeTier = user.tier || 'Basic' }) {
  const perks = TIER_PERKS[activeTier] || TIER_PERKS.Basic;
  const finalPrice = Math.floor(itemPrice * (1 - perks.discount));

  if (user.credits < finalPrice) {
    alert(`Not enough credits. You need ${finalPrice} credits.`);
    return null;
  }

  const oldProgress = calculateProgress(user.exp || 0);
  const newTotalExp = (user.exp || 0) + Math.floor(finalPrice * perks.boost);
  const newProgress = calculateProgress(newTotalExp);
  let newTier = user.tier || 'Basic';
  let newCredits = user.credits - finalPrice;

  if (newProgress.level > oldProgress.level) {
    const calculatedTier = getTierForLevel(newProgress.level);
    const currentTierLevel = TIER_PERKS[newTier]?.level || 0;
    const calculatedTierLevel = TIER_PERKS[calculatedTier]?.level || 0;
    if (newTier !== 'Nebula' && calculatedTierLevel > currentTierLevel) {
      newTier = calculatedTier;
      newCredits += TIER_PERKS[calculatedTier].milestoneReward;
      alert(`Level up! You reached Level ${newProgress.level} and unlocked ${newTier} Tier (+${TIER_PERKS[calculatedTier].milestoneReward} bonus credits).`);
    } else {
      alert(`Level up! You reached Level ${newProgress.level}.`);
    }
  }

  return { ...user, credits: newCredits, exp: newTotalExp, tier: newTier };
}
