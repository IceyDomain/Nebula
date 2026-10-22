import { beforeEach, describe, expect, test } from 'vitest';
import {
  applyDailyCreditsToStorage,
  grantDailyTestingCredits,
  initializeSitePhase,
} from './sitePhase';

describe('site phase account handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('grants daily testing credits only once per account per day', () => {
    const account = { username: 'tester', credits: 250 };
    const firstGrant = grantDailyTestingCredits(account, '2026-10-22');

    expect(firstGrant.credits).toBe(1250);
    expect(grantDailyTestingCredits(firstGrant, '2026-10-22')).toBe(firstGrant);
    expect(grantDailyTestingCredits(firstGrant, '2026-10-23').credits).toBe(2250);
  });

  test('updates all stored accounts and the active session once per day', () => {
    initializeSitePhase(localStorage, 'testing');
    localStorage.setItem('nebula_users_personal', JSON.stringify([
      { username: 'personal', credits: 10 },
    ]));
    localStorage.setItem('nebula_users_org', JSON.stringify([
      { username: 'school', email: 'school@example.com', credits: 20, organization: { id: 'school' } },
    ]));
    localStorage.setItem('nebula_active_org_user', JSON.stringify({
      username: 'school',
      email: 'school@example.com',
      credits: 20,
      organization: { id: 'school' },
    }));

    applyDailyCreditsToStorage(localStorage, '2026-10-22');
    applyDailyCreditsToStorage(localStorage, '2026-10-22');

    expect(JSON.parse(localStorage.getItem('nebula_users_personal'))[0].credits).toBe(1010);
    expect(JSON.parse(localStorage.getItem('nebula_users_org'))[0].credits).toBe(1020);
    expect(JSON.parse(localStorage.getItem('nebula_active_org_user')).credits).toBe(1020);
  });

  test('clears saved account lists only when entering demo phase', () => {
    initializeSitePhase(localStorage, 'testing');
    localStorage.setItem('nebula_users_personal', JSON.stringify([{ username: 'tester' }]));

    expect(initializeSitePhase(localStorage, 'demo').accountsReset).toBe(true);
    expect(localStorage.getItem('nebula_users_personal')).toBeNull();

    localStorage.setItem('nebula_users_personal', JSON.stringify([{ username: 'demo-user' }]));
    expect(initializeSitePhase(localStorage, 'demo').accountsReset).toBe(false);
    expect(JSON.parse(localStorage.getItem('nebula_users_personal'))[0].username).toBe('demo-user');
  });
});
