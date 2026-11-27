import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../admin-auth';

const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents';

const ALLOWED_ORIGINS = new Set([
  'https://marketbd.net',
  'https://www.marketbd.net',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

let sharedDeletedProductIds: string[] = [];
let sharedClockSettings: any = null;
let lastFirestoreSyncAt = 0;
const SYNC_CACHE_TTL_MS = 15_000;

function decodeFirestoreVal(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue?.values || []).map(decodeFirestoreVal);
  if ('mapValue' in val) {
    const out: Record<string, any> = {};
    const fields = val.mapValue?.fields || {};
    for (const k of Object.keys(fields)) out[k] = decodeFirestoreVal(fields[k]);
    return out;
  }
  return val;
}

async function hydrateSharedFirestoreSettings() {
  const now = Date.now();
  if (lastFirestoreSyncAt > 0 && now - lastFirestoreSyncAt < SYNC_CACHE_TTL_MS) {
    return;
  }
  try {
    const [delRes, clockRes] = await Promise.all([
      fetch(`${FIRESTORE_BASE_URL}/settings/deleted_products`).catch(() => null),
      fetch(`${FIRESTORE_BASE_URL}/settings/clock_settings`).catch(() => null),
    ]);

    if (delRes && delRes.ok) {
      const delJson: any = await delRes.json();
      const ids = decodeFirestoreVal(delJson?.fields?.ids || delJson?.fields?.value?.mapValue?.fields?.ids);
      if (Array.isArray(ids)) {
        const merged = new Set<string>(sharedDeletedProductIds);
        ids.forEach((id: any) => {
          if (typeof id === 'string' && id.trim()) merged.add(id.trim());
        });
        sharedDeletedProductIds = Array.from(merged);
      }
    }

    if (clockRes && clockRes.ok) {
      const clockJson: any = await clockRes.json();
      const val = decodeFirestoreVal(clockJson?.fields?.value) || null;
      if (val && typeof val === 'object' && Number(val.clockVersion || 0) >= 2) {
        sharedClockSettings = val;
      } else {
        sharedClockSettings = null;
      }
    }
    lastFirestoreSyncAt = now;
  } catch {
    // Non-fatal fallback to cached values
  }
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  const origin = String(req?.headers?.origin || '').trim();
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-email, x-user-phone');
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await hydrateSharedFirestoreSettings();
    const isAdmin = verifyAdminRequest(req);

    const responseState = {
      siteMaintenance: {
        isMaintenanceMode: false,
        maintenanceMessageBn: 'মার্কেটবিডি সিস্টেম আপগ্রেড চলছে। খুব শীঘ্রই আমরা ফিরছি!',
        maintenanceMessageEn: 'MarketBD is undergoing scheduled maintenance. We will be back shortly!',
        allowedAdminIps: []
      },
      systemNotice: {
        isEnabled: true,
        showAppPromo: true,
        showAdPromo: true,
        showFraudWarning: true,
        showCustomNotice: true,
        scrollSpeed: 'medium',
        contactPhone: '01533830784',
        contactEmail: 'official.marketbd@gmail.com'
      },
      clockSettings: sharedClockSettings,
      paymentPartners: null,
      branding: null,
      appRelease: null,
      deletedProductIds: sharedDeletedProductIds,
      ...(isAdmin ? { adminActiveSession: null } : {}),
      updatedAt: new Date().toISOString()
    };

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: responseState,
        updatedAt: responseState.updatedAt
      });
    }

    if (req.method === 'POST') {
      const updates = req.body || {};
      const keys = Object.keys(updates);
      const rawUserId = String(req?.headers?.['x-user-id'] || '').trim();
      const hasValidUser = Boolean(rawUserId && rawUserId !== 'user-me' && rawUserId !== 'guest' && rawUserId !== 'anonymous');
      const isReactionOnly = keys.length > 0 && keys.every(k => k === 'product_reactions');

      if (!isAdmin && !(isReactionOnly && hasValidUser)) {
        return res.status(401).json({ success: false, message: 'Admin authorization required' });
      }

      if (Array.isArray(updates.deletedProductIds)) {
        const merged = new Set<string>(sharedDeletedProductIds);
        updates.deletedProductIds.forEach((id: any) => {
          if (typeof id === 'string' && id.trim()) merged.add(id.trim());
        });
        sharedDeletedProductIds = Array.from(merged);
      }

      const incomingClock = updates.clockSettings || updates.clock_settings;
      if (incomingClock && typeof incomingClock === 'object') {
        sharedClockSettings = { ...incomingClock, clockVersion: 2 };
      }

      return res.status(200).json({
        success: true,
        message: 'Sync state received',
        data: {
          ...responseState,
          ...updates,
          clockSettings: sharedClockSettings,
          deletedProductIds: sharedDeletedProductIds
        }
      });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
