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
  SetOptions
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

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
    if (options) {
      await setDoc(docRef, data, options);
    } else {
      await setDoc(docRef, data);
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
      console.warn('[Firestore write notice]:', errorMsg);
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


