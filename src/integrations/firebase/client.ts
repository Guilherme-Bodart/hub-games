import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously } from 'firebase/auth';
import { Database, getDatabase, onValue, ref } from 'firebase/database';

export type FirebaseConnectionState =
  | 'disabled'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

type FirebaseServices = {
  app: FirebaseApp | null;
  auth: Auth | null;
  database: Database | null;
  error: string | null;
};

type FirebaseConnectionStatus = {
  state: FirebaseConnectionState;
  message?: string;
};

type FirebaseConfigInput = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
  databaseURL?: string;
};

let cachedServices: FirebaseServices | null = null;
let signInPromise: Promise<string> | null = null;

const readFirebaseConfigFromEnv = (): FirebaseConfigInput => ({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
});

const resolveMissingFields = (config: FirebaseConfigInput): string[] => {
  const requiredFields: Array<keyof FirebaseConfigInput> = [
    'apiKey',
    'authDomain',
    'projectId',
    'appId',
  ];

  return requiredFields.filter((field) => !config[field]);
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getFirebaseServices = (): FirebaseServices => {
  if (cachedServices) {
    return cachedServices;
  }

  const rawConfig = readFirebaseConfigFromEnv();
  const missingFields = resolveMissingFields(rawConfig);

  if (missingFields.length > 0) {
    cachedServices = {
      app: null,
      auth: null,
      database: null,
      error: `Firebase config missing: ${missingFields.join(', ')}`,
    };
    return cachedServices;
  }

  const firebaseConfig: FirebaseOptions = {
    apiKey: rawConfig.apiKey!,
    authDomain: rawConfig.authDomain!,
    projectId: rawConfig.projectId!,
    appId: rawConfig.appId!,
    databaseURL: rawConfig.databaseURL,
  };

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = rawConfig.databaseURL ? getDatabase(app) : null;

  cachedServices = {
    app,
    auth,
    database,
    error: rawConfig.databaseURL
      ? null
      : 'EXPO_PUBLIC_FIREBASE_DATABASE_URL is required for realtime features.',
  };

  return cachedServices;
};

export const getFirebaseAuthUid = (): string | null => {
  const services = getFirebaseServices();
  return services.auth?.currentUser?.uid ?? null;
};

export const ensureFirebaseAnonymousAuth = async (): Promise<string> => {
  const services = getFirebaseServices();

  if (services.error || !services.auth) {
    throw new Error(services.error || 'Firebase Auth unavailable.');
  }

  const currentUid = services.auth.currentUser?.uid;

  if (currentUid) {
    return currentUid;
  }

  if (signInPromise) {
    return signInPromise;
  }

  signInPromise = (async () => {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const credentials = await signInAnonymously(services.auth!);
        const uid = credentials.user?.uid;

        if (!uid) {
          throw new Error('Anonymous auth did not return a UID.');
        }

        return uid;
      } catch (error) {
        if (attempt === maxAttempts) {
          if (error instanceof Error && error.message) {
            throw new Error(error.message);
          }

          throw new Error('Failed to sign in anonymously.');
        }

        const backoffMs = Math.min(600 * 2 ** (attempt - 1), 5000);
        const jitterMs = Math.floor(Math.random() * 180);
        await sleep(backoffMs + jitterMs);
      }
    }

    throw new Error('Failed to sign in anonymously.');
  })().finally(() => {
    signInPromise = null;
  });

  return signInPromise;
};

export const subscribeFirebaseConnection = (
  onStatus: (status: FirebaseConnectionStatus) => void
): (() => void) => {
  const services = getFirebaseServices();

  if (services.error) {
    onStatus({ state: 'disabled', message: services.error });
    return () => undefined;
  }

  if (!services.database) {
    onStatus({
      state: 'disabled',
      message: 'Realtime Database unavailable. Set EXPO_PUBLIC_FIREBASE_DATABASE_URL.',
    });
    return () => undefined;
  }

  onStatus({ state: 'connecting' });

  const connectedRef = ref(services.database, '.info/connected');
  const unsubscribe = onValue(
    connectedRef,
    (snapshot) => {
      const isConnected = snapshot.val() === true;
      onStatus({
        state: isConnected ? 'connected' : 'disconnected',
      });
    },
    (error) => {
      onStatus({
        state: 'error',
        message: error.message || 'Failed to monitor Firebase connection.',
      });
    }
  );

  return unsubscribe;
};
