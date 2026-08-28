import { Product } from '../types';

/**
 * Checks if a product/advertisement is canonical and publicly active.
 * Used across Home, Category, Search, FlashSale, Android WebView & APIs.
 */
export function isProductPublicActive(product: Partial<Product> | null | undefined): boolean {
  if (!product) return false;

  // Explicit non-active states take strict priority
  const rawStatus = (product.status || '').toString().toLowerCase().trim();
  const rawModeration = (product.moderationStatus || '').toString().toLowerCase().trim();

  // If rejected, pending or in review, never show publicly
  if (
    rawStatus === 'rejected' ||
    rawModeration === 'rejected' ||
    rawStatus === 'pending' ||
    rawStatus === 'under_review' ||
    rawStatus === 'in_review' ||
    rawModeration === 'pending' ||
    rawStatus === 'sold' ||
    rawStatus === 'expired' ||
    rawStatus === 'inactive' ||
    rawStatus === 'blocked'
  ) {
    return false;
  }

  // Explicit active or approved flags
  if (
    rawStatus === 'active' ||
    rawStatus === 'approved' ||
    rawStatus === 'published' ||
    product.isActive === true ||
    product.isApproved === true ||
    rawModeration === 'approved'
  ) {
    return true;
  }

  // Default fallback for legacy mock items with undefined status
  if (!rawStatus && !rawModeration) {
    return true;
  }

  return false;
}

/**
 * Checks if a product is in the Under Review / Pending queue.
 */
export function isProductPending(product: Partial<Product> | null | undefined): boolean {
  if (!product) return false;
  const rawStatus = (product.status || '').toString().toLowerCase().trim();
  const rawModeration = (product.moderationStatus || '').toString().toLowerCase().trim();

  if (rawStatus === 'rejected' || rawModeration === 'rejected') return false;
  if (rawStatus === 'sold' || rawStatus === 'expired') return false;

  return (
    rawStatus === 'pending' ||
    rawStatus === 'under_review' ||
    rawStatus === 'in_review' ||
    rawModeration === 'pending'
  );
}

/**
 * Checks if a product has been rejected by Admin Moderation.
 */
export function isProductRejected(product: Partial<Product> | null | undefined): boolean {
  if (!product) return false;
  const rawStatus = (product.status || '').toString().toLowerCase().trim();
  const rawModeration = (product.moderationStatus || '').toString().toLowerCase().trim();

  return rawStatus === 'rejected' || rawModeration === 'rejected';
}

/**
 * Checks if a product is marked as Sold.
 */
export function isProductSold(product: Partial<Product> | null | undefined): boolean {
  if (!product) return false;
  const rawStatus = (product.status || '').toString().toLowerCase().trim();
  return rawStatus === 'sold';
}

/**
 * Checks if a product is marked as Expired.
 */
export function isProductExpired(product: Partial<Product> | null | undefined): boolean {
  if (!product) return false;
  const rawStatus = (product.status || '').toString().toLowerCase().trim();
  return rawStatus === 'expired';
}

/**
 * Factory to produce a fully approved, canonically active product document.
 */
export function makeApprovedProduct(product: Product, adminEmail?: string): Product {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    ...product,
    status: 'active',
    isApproved: true,
    isActive: true,
    moderationStatus: 'approved',
    publishedAt: product.publishedAt || now,
    approvedAt: product.approvedAt || now,
    approvedBy: adminEmail || product.approvedBy || 'official.marketbd@gmail.com',
    postedAt: product.postedAt || now,
    createdAt: product.createdAt || product.postedAt || now,
    updatedAt: now,
    expiresAt: product.expiresAt || expiresAt,
    rejectionReason: undefined,
    liveNotificationSent: true
  };
}

/**
 * Factory to produce a pending under-review product document.
 */
export function makePendingProduct(product: Partial<Product>): Product {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    ...(product as Product),
    status: 'pending',
    isApproved: false,
    isActive: false,
    moderationStatus: 'pending',
    postedAt: product.postedAt || now,
    createdAt: product.createdAt || now,
    updatedAt: now,
    expiresAt: product.expiresAt || expiresAt,
    rejectionReason: undefined,
    liveNotificationSent: false
  };
}

/**
 * Factory to produce a rejected product document with reason.
 */
export function makeRejectedProduct(product: Product, reason?: string, adminEmail?: string): Product {
  const now = new Date().toISOString();

  return {
    ...product,
    status: 'rejected',
    isApproved: false,
    isActive: false,
    moderationStatus: 'rejected',
    rejectionReason: reason || 'তথ্য সংশোধন প্রয়োজন',
    updatedAt: now,
    approvedBy: adminEmail,
    liveNotificationSent: false
  };
}
