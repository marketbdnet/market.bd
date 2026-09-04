import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CANONICAL_400_PRODUCTS } from '../src/data/canonicalCatalog400';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const products = Array.isArray(CANONICAL_400_PRODUCTS)
      ? CANONICAL_400_PRODUCTS
      : [];

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        total: products.length,
        source: 'canonicalCatalog400',
        updatedAt: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'Canonical product sync endpoint',
        data: products,
        count: products.length,
        total: products.length,
        source: 'canonicalCatalog400',
        updatedAt: new Date().toISOString()
      });
    }

    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  } catch (e: any) {
    console.error('PRODUCT_API_ERROR:', e);
    return res.status(500).json({
      success: false,
      error: e?.message || 'Server error'
    });
  }
}
