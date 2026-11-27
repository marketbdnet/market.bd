import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from './admin-auth';

const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents';
const FIRESTORE_PRODUCTS_URL = `${FIRESTORE_BASE_URL}/products?pageSize=300`;
const FIRESTORE_DELETED_PRODUCTS_URL = `${FIRESTORE_BASE_URL}/settings/deleted_products`;

const ALLOWED_ORIGINS = new Set([
  'https://marketbd.net',
  'https://www.marketbd.net',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

export function applySafeCors(req: any, res: any, methods: string) {
  const origin = String(req?.headers?.origin || '').trim();
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-email, x-user-phone');
}

function normPhone(p?: string): string {
  const d = String(p || '').replace(/\D/g, '');
  return d ? d.replace(/^880?/, '').replace(/^0+/, '') : '';
}

export function extractCaller(req: any) {
  const rawId = String(req?.headers?.['x-user-id'] || '').trim();
  const userId = rawId && rawId !== 'user-me' && rawId !== 'guest' && rawId !== 'anonymous' ? rawId : '';
  const email = String(req?.headers?.['x-user-email'] || '').trim().toLowerCase();
  const phone = normPhone(String(req?.headers?.['x-user-phone'] || ''));
  return { userId, email, phone };
}

export function isProductOwner(product: any, caller: { userId: string; email: string; phone: string }): boolean {
  if (!product) return false;
  if (caller.userId) {
    const sId = String(product.seller?.id || '').trim();
    const topId = String(product.sellerId || '').trim();
    if ((sId && sId !== 'user-me' && sId === caller.userId) || (topId && topId !== 'user-me' && topId === caller.userId)) {
      return true;
    }
  }
  if (caller.email && product.seller?.email && String(product.seller.email).trim().toLowerCase() === caller.email) {
    return true;
  }
  if (caller.phone.length >= 10 && product.seller?.phone && normPhone(product.seller.phone) === caller.phone) {
    return true;
  }
  return false;
}

function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue?.values || []).map(decodeFirestoreValue);
  if ('mapValue' in val) {
    const out: Record<string, any> = {};
    const fields = val.mapValue?.fields || {};
    for (const k of Object.keys(fields)) out[k] = decodeFirestoreValue(fields[k]);
    return out;
  }
  return val;
}

const CACHE_TTL_MS = 45_000;
let cachedProductsList: any[] = [];
let cachedDeletedIds = new Set<string>();
let lastFetchAtMs = 0;

export function getCachedDeletedIds(): string[] {
  return Array.from(cachedDeletedIds);
}

export function markProductDeletedInCache(productId: string) {
  if (!productId) return;
  cachedDeletedIds.add(productId);
  cachedProductsList = cachedProductsList.filter(p => p && p.id !== productId);
}

export function upsertProductInCache(product: any) {
  if (!product || !product.id) return;
  cachedDeletedIds.delete(product.id);
  const idx = cachedProductsList.findIndex(p => p && p.id === product.id);
  if (idx >= 0) {
    cachedProductsList[idx] = { ...cachedProductsList[idx], ...product };
  } else {
    cachedProductsList = [product, ...cachedProductsList];
  }
}

export async function fetchFirestoreProducts(): Promise<any[]> {
  const now = Date.now();
  if (lastFetchAtMs > 0 && now - lastFetchAtMs < CACHE_TTL_MS && cachedProductsList.length > 0) {
    return cachedProductsList.filter(p => !cachedDeletedIds.has(p.id) && p.isDeleted !== true && p.status !== 'deleted');
  }
  try {
    const [prodRes, delRes] = await Promise.all([
      fetch(FIRESTORE_PRODUCTS_URL),
      fetch(FIRESTORE_DELETED_PRODUCTS_URL).catch(() => null),
    ]);

    if (delRes && delRes.ok) {
      const delJson: any = await delRes.json();
      const ids = decodeFirestoreValue(delJson?.fields?.ids || delJson?.fields?.value?.mapValue?.fields?.ids);
      if (Array.isArray(ids)) {
        ids.forEach((id: any) => {
          if (typeof id === 'string' && id.trim()) cachedDeletedIds.add(id.trim());
        });
      }
    }

    if (!prodRes.ok) {
      return cachedProductsList.filter(p => !cachedDeletedIds.has(p.id));
    }
    const json: any = await prodRes.json();
    const docs = Array.isArray(json?.documents) ? json.documents : [];
    const parsed = docs
      .map((d: any) => {
        const id = String(d?.name || '').split('/').pop() || '';
        const fields = d?.fields || {};
        const obj: Record<string, any> = { id };
        for (const k of Object.keys(fields)) obj[k] = decodeFirestoreValue(fields[k]);
        return obj;
      })
      .filter((p: any) => p && p.id && p.title && String(p.title).trim() !== '')
      .filter((p: any) => !cachedDeletedIds.has(p.id) && p.isDeleted !== true && String(p.status || '').toLowerCase() !== 'deleted')
      .map((p: any) => ({
        ...p,
        status: p.status || 'active',
        isApproved: p.isApproved !== false,
        isActive: p.isActive !== false,
      }));
    cachedProductsList = parsed;
    lastFetchAtMs = now;
    return parsed;
  } catch {
    return cachedProductsList.filter(p => !cachedDeletedIds.has(p.id));
  }
}

export function sanitizeProductForPublic(product: any, caller: { userId: string; email: string; phone: string }, isAdmin: boolean) {
  if (!product) return product;

  const isOwner = isProductOwner(product, caller);
  const isPhoneVisible = product.showPhoneNumber === true || product.seller?.hidePhone === false || product.seller?.showPhoneNumber === true;

  if (isAdmin || isOwner || isPhoneVisible) {
    return product;
  }

  const rawPhone = product.seller?.phone || '';
  const masked = rawPhone.length >= 7 
    ? `${rawPhone.substring(0, 3)}*****${rawPhone.slice(-3)}`
    : '017*****000';

  return {
    ...product,
    seller: {
      ...product.seller,
      phone: masked,
      hidePhone: true,
      showPhoneNumber: false
    }
  };
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  applySafeCors(req, res, 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isAdmin = verifyAdminRequest(req);
    const caller = extractCaller(req);
    const canonicalValid = await fetchFirestoreProducts();

    if (req.method === 'GET') {
      const { category, sellerId, status, query, id } = req.query || {};

      let productList = [...canonicalValid];

      if (id && typeof id === 'string') {
        const found = productList.find(p => p.id === id || p.slug === id);
        if (found) {
          const st = String(found.status || '').toLowerCase();
          if (!isAdmin && !isProductOwner(found, caller) && (st === 'pending' || st === 'rejected' || st === 'under_review' || st === 'in_review')) {
            return res.status(404).json({ success: false, message: 'Product not found' });
          }
          return res.status(200).json({ success: true, data: sanitizeProductForPublic(found, caller, isAdmin) });
        } else {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
      }

      if (category && typeof category === 'string') {
        productList = productList.filter(p => p.category === category);
      }
      if (sellerId && typeof sellerId === 'string') {
        productList = productList.filter(p => p.seller?.id === sellerId || p.sellerId === sellerId);
      }

      if (!isAdmin) {
        productList = productList.filter(p => {
          const rawStatus = String(p.status || '').toLowerCase();
          const rawMod = String(p.moderationStatus || '').toLowerCase();
          const isUnlisted =
            rawStatus === 'pending' ||
            rawStatus === 'under_review' ||
            rawStatus === 'in_review' ||
            rawStatus === 'rejected' ||
            rawMod === 'pending' ||
            rawMod === 'rejected';
          if (isUnlisted) {
            return isProductOwner(p, caller);
          }
          return true;
        });
      }

      if (status && typeof status === 'string') {
        if (status === 'active' || status === 'approved') {
          productList = productList.filter(p => p.status === 'active' || p.status === 'approved' || !p.status);
        } else if (status === 'pending') {
          productList = productList.filter(p => p.status === 'pending' || p.status === 'under_review' || p.status === 'in_review');
        } else if (status !== 'all') {
          productList = productList.filter(p => p.status === status);
        }
      }
      if (query && typeof query === 'string') {
        const q = query.toLowerCase();
        productList = productList.filter(p => 
          (p.title && p.title.toLowerCase().includes(q)) || 
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.titleBn && p.titleBn.includes(q))
        );
      }

      const sanitizedList = productList.map(p => sanitizeProductForPublic(p, caller, isAdmin));

      return res.status(200).json({
        success: true,
        count: sanitizedList.length,
        data: sanitizedList,
        products: sanitizedList,
        deletedIds: getCachedDeletedIds(),
        updatedAt: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      if (!isAdmin && !caller.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required to post an ad.' });
      }
      const newAd = req.body;
      if (!newAd || !newAd.title) {
        return res.status(400).json({ success: false, message: 'Title is required for product' });
      }
      if (!newAd.id) {
        newAd.id = 'prod-' + Date.now();
      }
      if (!isAdmin) {
        newAd.status = 'pending';
        newAd.isApproved = false;
        newAd.isActive = false;
        newAd.sellerId = caller.userId;
        newAd.seller = { ...(newAd.seller || {}), id: caller.userId };
      }
      upsertProductInCache(newAd);
      return res.status(201).json({
        success: true,
        message: 'Product received and queued for persistence',
        data: newAd
      });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
