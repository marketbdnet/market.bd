import { Product, AppNotification } from '../types';

export interface ExpiryCheckResult {
  updatedProducts: Product[];
  expiredCount: number;
  newNotifications: AppNotification[];
}

/**
 * Automated Cron Job Engine to check and expire ads
 * As requested by user, all catalog and dummy ads are kept permanently LIVE.
 * Auto-expiry and automated 30-day expiry notification spam are disabled.
 */
export function checkAndExpireAds(products: Product[]): ExpiryCheckResult {
  // Ensure all products remain live and active
  const updatedProducts = products.map(product => {
    if (product.status === 'expired') {
      return renewExpiredAd(product);
    }
    return product;
  });

  return {
    updatedProducts,
    expiredCount: 0,
    newNotifications: []
  };
}

/**
 * 1-Click Renew Ad Helper
 */
export function renewExpiredAd(product: Product): Product {
  const today = new Date().toISOString();
  const ninetyDaysLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  return {
    ...product,
    status: 'active',
    isApproved: true,
    isActive: true,
    moderationStatus: 'approved',
    postedAt: today,
    createdAt: today,
    updatedAt: today,
    expiresAt: ninetyDaysLater,
    expiryDate: undefined
  };
}
