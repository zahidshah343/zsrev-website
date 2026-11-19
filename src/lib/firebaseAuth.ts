import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'] as const;

export const SENDER_ADVISOR_EMAIL = 'emrpulse.us@gmail.com';

let isSigningIn = false;
// In-memory Gmail access token cache only (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

function formatFirebaseAuthError(err: unknown): Error {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

  if (code.includes('api-key-not-valid')) {
    return new Error(
      'Firebase rejected the Web API key. Please check your Firebase configuration in firebase-applet-config.json.'
    );
  }

  switch (code) {
    case 'auth/popup-blocked':
      return new Error(
        'Sign-in popup was blocked by your browser. Please allow popups for this site and click "Sign in with Google" again.'
      );
    case 'auth/popup-closed-by-user':
      return new Error(
        'Google sign-in popup was closed before completing. Please try again.'
      );
    case 'auth/cancelled-popup-request':
      return new Error(
        'A Google sign-in popup is already open. Please complete or close it and try again.'
      );
    case 'auth/unauthorized-domain':
      return new Error(
        `Domain "${host}" is not authorized in Firebase Auth. Add it in Firebase Console → Authentication → Settings → Authorized domains.`
      );
    case 'auth/operation-not-allowed':
      return new Error(
        'Google Sign-In is not enabled in Firebase Console → Authentication → Sign-in method.'
      );
    default:
      return err instanceof Error
        ? err
        : new Error('Google sign-in failed. Please try again.');
  }
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    for (const scope of GMAIL_SCOPES) {
      provider.addScope(scope);
    }
    provider.setCustomParameters({
      prompt: 'select_account',
      login_hint: SENDER_ADVISOR_EMAIL,
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || '';
    if (accessToken) {
      cachedAccessToken = accessToken;
    }

    return {
      user: result.user,
      accessToken,
    };
  } catch (err: unknown) {
    throw formatFirebaseAuthError(err);
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const clearAccessToken = () => {
  cachedAccessToken = null;
};

export const logout = async () => {
  cachedAccessToken = null;
  await auth.signOut();
};
