import { Product, AppNotification } from '../types';

export interface ExpiryCheckResult {
  updatedProducts: Product[];
  expiredCount: number;
  newNotifications: AppNotification[];
}

/**
 * Automated Cron Job Engine to check and expire 30+ days old ads
 */
export function checkAndExpireAds(products: Product[]): ExpiryCheckResult {
  const now = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  let expiredCount = 0;
  const newNotifications: AppNotification[] = [];

  const updatedProducts = products.map(product => {
    // Only check active ads
    if (product.status !== 'active') return product;

    // Parse date or fallback to now
    let postDate = new Date();
    if (product.postedAt) {
      const parsed = Date.parse(product.postedAt);
      if (!isNaN(parsed)) postDate = new Date(parsed);
    }

    const ageMs = now.getTime() - postDate.getTime();
    if (ageMs >= THIRTY_DAYS_MS) {
      expiredCount++;
      const expiryStr = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
      
      // Create automated expiry notification
      newNotifications.push({
        id: `notif_exp_${product.id}_${Date.now()}`,
        title: `বিজ্ঞাপন এক্সপায়ার হয়েছে: ${product.title}`,
        message: `আপনার "<b>${product.title}</b>" বিজ্ঞাপনের ৩০ দিনের মেয়াদ শেষ হয়েছে। নতুন ক্রেতাদের আকৃষ্ট করতে ১-ক্লিকে আবার রিনিউ করুন।`,
        time: 'এখনই',
        isRead: false,
        type: 'system',
        link: `#renew-${product.id}`
      });

      return {
        ...product,
        status: 'expired' as const,
        expiryDate: expiryStr
      };
    }

    return product;
  });

  return { updatedProducts, expiredCount, newNotifications };
}

/**
 * 1-Click Renew Ad Helper
 */
export function renewExpiredAd(product: Product): Product {
  const today = new Date().toISOString().split('T')[0];
  return {
    ...product,
    status: 'active',
    postedAt: today,
    expiryDate: undefined
  };
}
