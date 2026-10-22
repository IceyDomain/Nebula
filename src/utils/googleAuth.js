const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
let googleIdentityScriptPromise;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
      } else {
        googleIdentityScriptPromise = null;
        reject(new Error('Google Identity Services did not initialize.'));
      }
    };
    script.onerror = () => {
      googleIdentityScriptPromise = null;
      script.remove();
      reject(new Error('Unable to load Google Identity Services.'));
    };
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}

export async function requestGoogleProfile(clientId) {
  if (!clientId) throw new Error('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID and restart the app.');

  const google = await loadGoogleIdentityServices();
  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        try {
          resolve(readGoogleProfile(credential, clientId));
        } catch (error) {
          reject(error);
        }
      },
    });

    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        reject(new Error("Google sign-in could not be displayed. Check the OAuth client's authorized JavaScript origins."));
      } else if (notification.isSkippedMoment()) {
        reject(new Error('Google sign-in was closed before an account was selected.'));
      } else if (notification.isDismissedMoment()) {
        reject(new Error('Google sign-in was dismissed.'));
      }
    });
  });
}

export function readGoogleProfile(credential, clientId) {
  if (typeof credential !== 'string' || typeof clientId !== 'string' || !clientId) {
    throw new Error('Google did not return a valid sign-in credential.');
  }

  try {
    const payload = credential.split('.')[1];
    if (!payload) throw new Error();
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    const audienceMatches = claims.aud === clientId
      || (Array.isArray(claims.aud) && claims.aud.includes(clientId));

    if (
      !claims.sub
      || !claims.email
      || claims.email_verified !== true
      || !audienceMatches
      || typeof claims.exp !== 'number'
      || claims.exp <= Date.now() / 1000
      || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)
    ) {
      throw new Error();
    }

    return { googleId: claims.sub, email: claims.email, name: claims.name || '' };
  } catch {
    throw new Error('Google sign-in returned invalid or expired account details. Please try again.');
  }
}
