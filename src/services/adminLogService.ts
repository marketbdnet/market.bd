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

export const INITIAL_ADMIN_LOGS: AdminActivityLog[] = [
  {
    id: 'adm-log-1',
    adminId: 'admin-master',
    adminName: 'Official Super Admin',
    adminEmail: 'official.marketbd@gmail.com',
    action: 'Updated Site Status',
    actionType: 'site_maintenance',
    targetTitle: 'Website Production Switch',
    details: 'Site set to 100% Live Production Mode for all buyers and sellers across Bangladesh.',
    timestamp: '28 Jul 2026, 12:30 PM',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    ip: '103.110.22.4',
    device: 'Desktop / Chrome 127'
  },
  {
    id: 'adm-log-2',
    adminId: 'admin-master',
    adminName: 'Official Super Admin',
    adminEmail: 'official.marketbd@gmail.com',
    action: 'Changed User Role',
    actionType: 'user_management',
    targetId: 'usr-002',
    targetTitle: 'Tariqul Islam (01822334455)',
    details: 'User role updated from "Buyer" to "Moderator" with ad review and inspection permissions.',
    timestamp: '28 Jul 2026, 11:15 AM',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    ip: '103.110.22.4',
    device: 'Desktop / Chrome 127'
  },
  {
    id: 'adm-log-3',
    adminId: 'staff-2',
    adminName: 'Tariqul Islam (Moderator)',
    adminEmail: 'tariq.mod@marketbd.net',
    action: 'Deleted Ad',
    actionType: 'ad_moderation',
    targetId: 'prod-spam-981',
    targetTitle: 'Duplicate iPhone 13 Pro Listing',
    details: 'Ad removed due to spam duplication and violation of marketplace listing guidelines.',
    timestamp: '28 Jul 2026, 10:05 AM',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    ip: '103.88.220.12',
    device: 'macOS / Safari 17'
  },
  {
    id: 'adm-log-4',
    adminId: 'admin-master',
    adminName: 'Official Super Admin',
    adminEmail: 'official.marketbd@gmail.com',
    action: 'Approved Ad',
    actionType: 'ad_moderation',
    targetId: 'prod-1',
    targetTitle: 'iPhone 15 Pro Max 256GB Dual SIM',
    details: 'Verified seller ad passed security check and published to live marketplace queue.',
    timestamp: '28 Jul 2026, 09:20 AM',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    ip: '103.110.22.4',
    device: 'Desktop / Chrome 127'
  },
  {
    id: 'adm-log-5',
    adminId: 'admin-master',
    adminName: 'Official Super Admin',
    adminEmail: 'official.marketbd@gmail.com',
    action: 'Updated Master Lockdown',
    actionType: 'security',
    targetTitle: 'Security Protocol Verification',
    details: 'Master lockdown security PIN tested and verified active with single-device admin guard.',
    timestamp: '27 Jul 2026, 06:45 PM',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    ip: '103.110.22.4',
    device: 'Desktop / Chrome 127'
  }
];

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
        console.warn('[AdminLogService] Realtime subscription notice:', error?.message);
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
