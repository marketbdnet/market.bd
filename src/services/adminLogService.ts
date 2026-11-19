import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, safeFirestoreSetDoc } from '../lib/firebase';
import { AdminActivityLog, AdminActionType } from '../types';

export const INITIAL_ADMIN_LOGS: AdminActivityLog[] = [];

export function formatAdminLogTimestamp(date = new Date()): string {
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Persist an admin action log to Firestore collection "admin_logs"
 */
export async function saveAdminLogToFirestore(log: AdminActivityLog): Promise<boolean> {
  try {
    const docRef = doc(db, 'admin_logs', log.id);
    const success = await safeFirestoreSetDoc(docRef, {
      ...log,
      createdAt: log.createdAt || new Date().toISOString()
    });
    return success;
  } catch (error) {
    console.warn('[AdminLogService] Notice writing to Firestore admin_logs:', error);
    return false;
  }
}

/**
 * Subscribe to realtime updates from Firestore collection "admin_logs"
 */
export function subscribeToFirestoreAdminLogs(
  onUpdate: (logs: AdminActivityLog[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const q = query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(150));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteLogs: AdminActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            remoteLogs.push({ id: docSnap.id, ...(docSnap.data() as any) });
          }
        });
        if (remoteLogs.length > 0) {
          onUpdate(remoteLogs);
        }
      },
      (error) => {
        if (error?.code !== 'cancelled') {
          console.warn('[AdminLogService] Realtime subscription notice:', error?.message || error);
        }
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[AdminLogService] Could not establish Firestore realtime listener:', err);
    return () => {};
  }
}

/**
 * Fetch all admin logs directly from Firestore
 */
export async function fetchAllAdminLogsFromFirestore(): Promise<AdminActivityLog[]> {
  try {
    const q = query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const logs: AdminActivityLog[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        logs.push({ id: docSnap.id, ...(docSnap.data() as any) });
      }
    });
    return logs;
  } catch (e) {
    console.warn('[AdminLogService] Notice fetching admin logs from Firestore:', e);
    return [];
  }
}
