import { useEffect, useState } from 'react';
import { ITEMS, PACKAGE, grant, isEventActive, loadChristmas, owns, priceOf, saveChristmas } from './christmas';

function isPreviewEnabled() {
  return new URLSearchParams(window.location.search).get('christmas-preview') === '1';
}

function getChristmasState(username, preview) {
  if (!preview) return loadChristmas(username);
  return {
    owned: [...ITEMS.map((item) => item.id), PACKAGE.id],
    active: { app: true, doc: true, logo: true, frame: true },
  };
}

export default function useChristmasEvent(username) {
  const preview = isPreviewEnabled();
  const [saved, setSaved] = useState(() => ({ username, state: getChristmasState(username, preview) }));
  const christmas = saved.username === username ? saved.state : getChristmasState(username, preview);

  useEffect(() => {
    setSaved({ username, state: getChristmasState(username, preview) });
  }, [username, preview]);

  const persist = (next) => {
    if (!preview) saveChristmas(username, next);
    setSaved({ username, state: next });
  };

  const buyChristmas = (itemId, credits, onCharge) => {
    if (itemId !== PACKAGE.id && !ITEMS.some((item) => item.id === itemId)) return false;
    if (!isEventActive() || owns(christmas, itemId)) return false;
    const price = priceOf(itemId);
    if (credits < price) return false;

    onCharge(credits - price);
    persist(grant(christmas, itemId));
    return true;
  };

  const toggleChristmas = (itemId, enabled) => {
    if (!ITEMS.some((item) => item.id === itemId) || !owns(christmas, itemId)) return false;
    persist({ ...christmas, active: { ...christmas.active, [itemId]: Boolean(enabled) } });
    return true;
  };

  return { christmas, buyChristmas, toggleChristmas, preview };
}
