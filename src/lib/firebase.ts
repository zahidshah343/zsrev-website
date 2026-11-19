import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import appletFirebaseConfig from '../../firebase-applet-config.json';

const measurementId =
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() ||
  appletFirebaseConfig.measurementId ||
  undefined;

const firebaseConfig = {
  apiKey: appletFirebaseConfig.apiKey,
  authDomain: appletFirebaseConfig.authDomain,
  projectId: appletFirebaseConfig.projectId,
  storageBucket: appletFirebaseConfig.storageBucket,
  messagingSenderId: appletFirebaseConfig.messagingSenderId,
  appId: appletFirebaseConfig.appId,
  ...(measurementId ? { measurementId } : {}),
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp = app;
export const auth = getAuth(app);

function createFirestoreClient() {
  try {
    return initializeFirestore(
      app,
      { experimentalForceLongPolling: true },
      appletFirebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, appletFirebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreClient();

let analyticsInstance: Analytics | null = null;
let analyticsInitPromise: Promise<Analytics | null> | null = null;

/**
 * Safely initializes Firebase Analytics (GA4) only when
 * `import.meta.env.VITE_FIREBASE_MEASUREMENT_ID` is present and valid,
 * and after verifying the Firebase Web API key is accepted so
 * `firebase/installations` does not emit an uncaught background rejection.
 */
export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (analyticsInstance) return analyticsInstance;
  if (typeof window === 'undefined') return null;

  if (
    !measurementId ||
    measurementId === 'G-XXXXXXXXXX' ||
    !/^G-[A-Z0-9]+$/i.test(measurementId)
  ) {
    return null;
  }

  if (!analyticsInitPromise) {
    analyticsInitPromise = (async () => {
      try {
        const supported = await isSupported();
        if (!supported) return null;

        const webConfigUrl = `https://firebase.googleapis.com/v1alpha/projects/-/apps/${encodeURIComponent(firebaseConfig.appId)}/webConfig`;
        const res = await fetch(webConfigUrl, {
          method: 'GET',
          headers: { 'X-Goog-Api-Key': firebaseConfig.apiKey },
        });
        if (!res.ok) {
          console.warn(
            `Firebase Analytics skipped: Web API key check returned HTTP ${res.status} for project "${firebaseConfig.projectId}".`
          );
          return null;
        }

        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      } catch {
        return null;
      }
    })();
  }

  return analyticsInitPromise;
}

async function testFirestoreConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void initFirebaseAnalytics();
void testFirestoreConnection();
