import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase (avoid duplicate initialization in Next.js hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const callable = (name: string) => httpsCallable(functions, name);

export default app;