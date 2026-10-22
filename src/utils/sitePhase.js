export const TESTING_DAILY_CREDITS = 1000;

const PHASE_STORAGE_KEY = 'nebula_site_phase';
const USER_STORAGE_KEYS = [
  'nebula_users_personal',
  'nebula_users_org',
  'nebula_active_user',
  'nebula_active_org_user',
  'nebula_users',
];

export function getUtcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function grantDailyTestingCredits(user, today = getUtcDateString()) {
  if (!user || user.dailyCreditDate === today) return user;

  return {
    ...user,
    credits: (Number(user.credits) || 0) + TESTING_DAILY_CREDITS,
    dailyCreditDate: today,
  };
}

export function initializeSitePhase(storage, phase) {
  const previousPhase = storage.getItem(PHASE_STORAGE_KEY);
  const accountsReset = phase === 'demo' && previousPhase !== 'demo';

  if (accountsReset) {
    USER_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  }

  storage.setItem(PHASE_STORAGE_KEY, phase);
  return { accountsReset };
}

function readUserList(storage, key) {
  const users = JSON.parse(storage.getItem(key) || '[]');
  if (!Array.isArray(users)) {
    throw new Error(`Expected an account list in localStorage key "${key}".`);
  }
  return users;
}

function readSession(storage, key) {
  const serializedUser = storage.getItem(key);
  return serializedUser ? JSON.parse(serializedUser) : null;
}

function isOrganizationUser(user) {
  return Boolean(user.organization?.id || user.orgId);
}

export function applyDailyCreditsToStorage(storage, today = getUtcDateString()) {
  const personalUsers = readUserList(storage, 'nebula_users_personal')
    .map((user) => grantDailyTestingCredits(user, today));
  const organizationUsers = readUserList(storage, 'nebula_users_org')
    .map((user) => grantDailyTestingCredits(user, today));

  storage.setItem('nebula_users_personal', JSON.stringify(personalUsers));
  storage.setItem('nebula_users_org', JSON.stringify(organizationUsers));

  for (const sessionKey of ['nebula_active_user', 'nebula_active_org_user']) {
    const sessionUser = readSession(storage, sessionKey);
    if (!sessionUser) continue;

    const users = isOrganizationUser(sessionUser) ? organizationUsers : personalUsers;
    const matchingUser = users.find((user) =>
      user.username === sessionUser.username || user.email === sessionUser.email
    );
    storage.setItem(sessionKey, JSON.stringify(matchingUser || grantDailyTestingCredits(sessionUser, today)));
  }
}
