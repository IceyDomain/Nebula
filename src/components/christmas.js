// Christmas event: dates, items, prices and what each person owns. Used by both the Nebula and Ardenne stores.
// Change the dates, names and prices here and everything else follows.

export const EVENT = { id: 'christmas', name: 'Christmas', startMonth: 11, startDay: 15, endMonth: 0, endDay: 1 }; // Dec 15 to Jan 1

export const ITEMS = [
  { id: 'app', name: 'Christmas Theme', desc: 'Red, green and gold colors, snow and a candy cane edge across the whole app.', price: 250 },
  { id: 'doc', name: 'Christmas Document Theme', desc: 'A festive page for the Docs editor: a candy cane band with red and green headings.', price: 150 },
  { id: 'logo', name: 'Christmas Logo', desc: 'The logo wearing a Santa hat.', price: 100 },
  { id: 'frame', name: 'Christmas Avatar Frame', desc: 'A candy cane ring with a Santa hat for your profile picture.', price: 200 },
];
export const PACKAGE = { id: 'package', name: 'Christmas All-in-One Package', desc: 'Everything below in one purchase. It switches the whole app to Christmas.', price: 500, includes: ['app', 'doc', 'logo', 'frame'] };
export const SEPARATE_TOTAL = ITEMS.reduce((sum, item) => sum + item.price, 0);
export const SAVINGS = SEPARATE_TOTAL - PACKAGE.price;

// The event is open to buy from Dec 15 to Jan 1 (including both days). Things people bought stay usable all year.
export function isEventActive(now = new Date()) {
  const m = now.getMonth(); const d = now.getDate();
  return (m === EVENT.startMonth && d >= EVENT.startDay) || (m === EVENT.endMonth && d <= EVENT.endDay);
}
export function eventWindow(now = new Date()) {
  const inJan = now.getMonth() === EVENT.endMonth && now.getDate() <= EVENT.endDay;
  let year = inJan ? now.getFullYear() - 1 : now.getFullYear();
  let start = new Date(year, EVENT.startMonth, EVENT.startDay);
  let end = new Date(year + 1, EVENT.endMonth, EVENT.endDay, 23, 59, 59);
  if (now > end) { year += 1; start = new Date(year, EVENT.startMonth, EVENT.startDay); end = new Date(year + 1, EVENT.endMonth, EVENT.endDay, 23, 59, 59); }
  return { start, end };
}
export const formatDay = (date) => date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
export function daysLeft(now = new Date()) {
  const { start, end } = eventWindow(now);
  return isEventActive(now) ? Math.max(0, Math.ceil((end - now) / 86400000)) : Math.max(0, Math.ceil((start - now) / 86400000));
}

/* ---------- what each person owns and has switched on ---------- */
const EMPTY = { owned: [], active: { app: false, doc: false, logo: false, frame: false } };
const key = (username) => `nebula_christmas_${username || 'guest'}`;
export function loadChristmas(username) {
  try {
    const saved = JSON.parse(localStorage.getItem(key(username)) || 'null');
    if (saved && Array.isArray(saved.owned)) return { owned: saved.owned, active: { ...EMPTY.active, ...(saved.active || {}) } };
  } catch { /* use empty */ }
  return { owned: [], active: { ...EMPTY.active } };
}
export function saveChristmas(username, state) { try { localStorage.setItem(key(username), JSON.stringify(state)); } catch { /* ignore */ } return state; }
export const owns = (state, id) => state.owned.includes(id) || state.owned.includes('package');
// Buying gives the item and switches it on. The package gives all four and switches them all on.
export function grant(state, itemId) {
  const ids = itemId === PACKAGE.id ? PACKAGE.includes : [itemId];
  const owned = Array.from(new Set([...state.owned, ...ids, ...(itemId === PACKAGE.id ? [PACKAGE.id] : [])]));
  const active = { ...state.active }; ids.forEach((i) => { active[i] = true; });
  return { owned, active };
}
export const priceOf = (itemId) => (itemId === PACKAGE.id ? PACKAGE.price : (ITEMS.find((i) => i.id === itemId) || {}).price || 0);
export const allOwned = (state) => PACKAGE.includes.every((i) => owns(state, i));
