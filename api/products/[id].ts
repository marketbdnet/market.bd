import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from '../admin-auth';
import {
  applySafeCors,
  extractCaller,
  fetchFirestoreProducts,
  isProductOwner,
  markProductDeletedInCache,
  sanitizeProductForPublic,
  upsertProductInCache,
} from '../products';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  applySafeCors(req, res, 'GET, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const id = String(req.query?.id || '').trim();
    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const isAdmin = verifyAdminRequest(req);
    const caller = extractCaller(req);
    const productList = await fetchFirestoreProducts();
    const found = productList.find(p => p.id === id || p.slug === id);

    if (req.method === 'GET') {
      if (!found) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      const rawStatus = String(found.status || '').toLowerCase();
      if (!isAdmin && !isProductOwner(found, caller) && (rawStatus === 'pending' || rawStatus === 'rejected' || rawStatus === 'under_review' || rawStatus === 'in_review')) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, data: sanitizeProductForPublic(found, caller, isAdmin) });
    }

    if (req.method === 'PUT') {
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to update an ad.' });
      }
      if (found && !isAdmin && !isProductOwner(found, caller)) {
        return res.status(403).json({ success: false, message: 'Forbidden: you do not own this ad.' });
      }
      const updateData = { ...(req.body || {}) };
      if (!isAdmin && found) {
        const wasApproved = found.status === 'active' || found.status === 'approved' || found.isApproved === true;
        if (!wasApproved && (updateData.status === 'active' || updateData.status === 'approved' || updateData.isApproved === true)) {
          updateData.status = found.status || 'pending';
          updateData.isApproved = found.isApproved ?? false;
          updateData.isActive = found.isActive ?? false;
        }
        if (updateData.status === 'rejected') {
          updateData.status = found.status;
        }
      }
      const merged = found ? { ...found, ...updateData, id } : { id, ...updateData };
      upsertProductInCache(merged);
      return res.status(200).json({ success: true, message: 'Product updated cleanly', data: merged });
    }

    if (req.method === 'DELETE') {
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to delete an ad.' });
      }
      if (!isAdmin && found && !isProductOwner(found, caller)) {
        return res.status(403).json({ success: false, message: 'Forbidden: you do not own this ad.' });
      }
      markProductDeletedInCache(id);
      return res.status(200).json({ success: true, message: 'Product deleted and recorded', id });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
