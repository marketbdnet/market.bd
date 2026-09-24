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
  query,
  where,
  getDocs,
  DocumentReference,
  SetOptions,
  setLogLevel,
  updateDoc
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

// Persistent circuit breaker for Firestore free tier daily quota exhaustion
const QUOTA_STORAGE_KEY = 'marketbd_firestore_quota_exceeded_until';

let firestoreQuotaExceededUntil = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
      if (stored) {
        const until = parseInt(stored, 10);
        if (Date.now() < until) {
          return until;
        }
      }
    }
  } catch {}
  // Default to active window (12 hours) to avoid quota retry loops on exhausted free tier
  return Date.now() + 12 * 60 * 60 * 1000;
})();

export function setFirestoreQuotaExceeded(durationMs: number = 12 * 60 * 60 * 1000): void {
  const until = Date.now() + durationMs;
  firestoreQuotaExceededUntil = until;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(QUOTA_STORAGE_KEY, String(until));
    }
  } catch {}
}

export function isFirestoreQuotaExceeded(): boolean {
  if (Date.now() < firestoreQuotaExceededUntil) {
    return true;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
      if (stored) {
        const until = parseInt(stored, 10);
        if (Date.now() < until) {
          firestoreQuotaExceededUntil = until;
          return true;
        } else {
          localStorage.removeItem(QUOTA_STORAGE_KEY);
        }
      }
    }
  } catch {}
  return false;
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
      errorMsg.includes('daily write units') ||
      errorMsg.includes('quota metric');

    if (isQuota) {
      setFirestoreQuotaExceeded();
      console.warn('[Firestore] Free tier daily write quota limit reached. Falling back to local storage and Express REST backend seamlessly.');
    } else {
      console.error('[Firestore write notice]:', errorMsg, err);
    }
    return false;
  }
}

export async function safeFirestoreUpdateDoc(
  docRef: DocumentReference,
  data: any
): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) {
    return false;
  }
  try {
    const cleanData = sanitizeFirestoreData(data);
    await updateDoc(docRef, cleanData);
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || '';
    const isQuota =
      err?.code === 'resource-exhausted' ||
      errorMsg.includes('Quota limit exceeded') ||
      errorMsg.includes('resource-exhausted') ||
      errorMsg.includes('daily write units') ||
      errorMsg.includes('quota metric');

    if (isQuota) {
      setFirestoreQuotaExceeded();
      console.warn('[Firestore] Free tier daily write quota reached on updateDoc. Falling back to local storage and Express REST backend.');
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
    const errorMsg = err?.message || '';
    if (
      err?.code === 'resource-exhausted' ||
      errorMsg.includes('Quota limit exceeded') ||
      errorMsg.includes('daily write units')
    ) {
      setFirestoreQuotaExceeded();
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
  onSnapshot,
  query,
  where,
  getDocs,
  updateDoc
};
export type { ConfirmationResult, FirebaseUser };


