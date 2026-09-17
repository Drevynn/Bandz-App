import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Load values directly from the applet configuration file
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
export const googleClientId = config.oAuthClientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '323405324328-uq69l385rrt49mki0p6osffrm63ll63i.apps.googleusercontent.com';
