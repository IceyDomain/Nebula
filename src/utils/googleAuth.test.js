import { expect, test } from 'vitest';
import { readGoogleProfile } from './googleAuth';

const clientId = 'nebula-client.apps.googleusercontent.com';

function makeCredential(claims) {
  const bytes = new TextEncoder().encode(JSON.stringify(claims));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  const payload = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

function validClaims(overrides = {}) {
  return {
    sub: 'google-user-id',
    email: 'designer@example.com',
    email_verified: true,
    aud: clientId,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'https://accounts.google.com',
    name: 'Zoë Designer',
    ...overrides,
  };
}

test('reads a verified Google profile, including unicode names', () => {
  expect(readGoogleProfile(makeCredential(validClaims()), clientId)).toEqual({
    googleId: 'google-user-id',
    email: 'designer@example.com',
    name: 'Zoë Designer',
  });
});

test('rejects credentials issued for a different OAuth client', () => {
  expect(() => readGoogleProfile(makeCredential(validClaims({ aud: 'other-client' })), clientId))
    .toThrow(/invalid or expired account details/);
});

test('rejects unverified and expired accounts', () => {
  expect(() => readGoogleProfile(makeCredential(validClaims({ email_verified: false })), clientId))
    .toThrow(/invalid or expired account details/);
  expect(() => readGoogleProfile(makeCredential(validClaims({ exp: 1 })), clientId))
    .toThrow(/invalid or expired account details/);
});
