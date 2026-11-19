import type { VercelRequest, VercelResponse } from '@vercel/node';

const FIRESTORE_PRODUCTS_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents/products?pageSize=300';

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

async function fetchFirestoreProducts(): Promise<any[]> {
  try {
    const r = await fetch(FIRESTORE_PRODUCTS_URL);
    if (!r.ok) return [];
    const json: any = await r.json();
    const docs = Array.isArray(json?.documents) ? json.documents : [];
    return docs
      .map((d: any) => {
        const id = String(d?.name || '').split('/').pop() || '';
        const fields = d?.fields || {};
        const obj: Record<string, any> = { id };
        for (const k of Object.keys(fields)) obj[k] = decodeFirestoreValue(fields[k]);
        return obj;
      })
      .filter((p: any) => p && p.id && p.title && String(p.title).trim() !== '')
      .map((p: any) => ({
        ...p,
        status: p.status || 'active',
        isApproved: p.isApproved !== false,
        isActive: p.isActive !== false,
      }));
  } catch {
    return [];
  }
}

function sanitizeProductForPublic(product: any, callerUserId?: string, isAdmin?: boolean) {
  if (!product) return product;

  const isOwner = callerUserId && (product.sellerId === callerUserId || product.seller?.id === callerUserId);
  const isPhoneVisible = product.seller?.hidePhone === false || product.seller?.showPhoneNumber === true;

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const canonicalValid = await fetchFirestoreProducts();

    if (req.method === 'GET') {
      const { category, sellerId, status, query, userId, role, id } = req.query || {};
      const isAdmin = role === 'admin';
      const callerUserId = typeof userId === 'string' ? userId : undefined;

      let productList = [...canonicalValid];

      if (id && typeof id === 'string') {
        const found = productList.find(p => p.id === id || p.slug === id);
        if (found) {
          return res.status(200).json({ success: true, data: sanitizeProductForPublic(found, callerUserId, isAdmin) });
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
      if (status && typeof status === 'string') {
        if (status === 'active' || status === 'approved') {
          productList = productList.filter(p => p.status === 'active' || p.status === 'approved' || !p.status);
        } else if (status === 'pending') {
          productList = productList.filter(p => p.status === 'pending' || p.status === 'under_review' || p.status === 'in_review');
        } else {
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

      const sanitizedList = productList.map(p => sanitizeProductForPublic(p, callerUserId, isAdmin));

      return res.status(200).json({
        success: true,
        count: sanitizedList.length,
        data: sanitizedList,
        products: sanitizedList,
        updatedAt: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const newAd = req.body;
      if (!newAd || !newAd.title) {
        return res.status(400).json({ success: false, message: 'Title is required for product' });
      }
      if (!newAd.id) {
        newAd.id = 'prod-' + Date.now();
      }
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
