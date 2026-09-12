import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  setDoc,
  getDoc,
  doc,
  deleteDoc,
  collection,
  onSnapshot,
  DocumentReference,
  SetOptions,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Configure Firestore log level to suppress benign internal stream cancellation notices
try {
  setLogLevel('error');
} catch {
  // Ignore if already configured or running in non-browser context
}

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Explicitly ensure robust browser local persistence across refreshes
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase Auth] Persistence initialization notice:', err);
});

export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);

// Circuit breaker for Firestore free tier quota exhaustion
let firestoreQuotaExceededUntil = 0;

export function isFirestoreQuotaExceeded(): boolean {
  return Date.now() < firestoreQuotaExceededUntil;
}

// Recursively remove any undefined properties so Firestore never throws unsupported field value errors
export function sanitizeFirestoreData<T = any>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => sanitizeFirestoreData(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj as any)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      clean[key] = sanitizeFirestoreData(val);
    }
  }
  return clean as T;
}

export async function safeFirestoreSetDoc(
  docRef: DocumentReference,
  data: any,
  options?: SetOptions
): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) {
    // Quota circuit breaker tripped; skip write to prevent endless backoff loops
    return false;
  }
  try {
    const cleanData = sanitizeFirestoreData(data);
    if (options) {
      await setDoc(docRef, cleanData, options);
    } else {
      await setDoc(docRef, cleanData);
    }
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || '';
    const isQuota =
      err?.code === 'resource-exhausted' ||
      errorMsg.includes('Quota limit exceeded') ||
      errorMsg.includes('resource-exhausted') ||
      errorMsg.includes('daily write units');

    if (isQuota) {
      // Pause Firestore writes for 10 minutes, silently falling back to LocalStorage & Express REST API
      firestoreQuotaExceededUntil = Date.now() + 10 * 60 * 1000;
      console.warn('[Firestore] Free tier daily write quota limit reached. Falling back to local storage and Express REST backend seamlessly.');
    } else {
      console.error('[Firestore write notice]:', errorMsg, err);
    }
    return false;
  }
}

export async function safeFirestoreDeleteDoc(docRef: DocumentReference): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) {
    return false;
  }
  try {
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted') {
      firestoreQuotaExceededUntil = Date.now() + 10 * 60 * 1000;
    }
    return false;
  }
}

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
};
export type { ConfirmationResult, FirebaseUser };


