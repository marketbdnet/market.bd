import { describe, it, expect } from 'vitest';
import { toBengaliNumber, formatPostedAt } from '../src/utils/dateUtils';
import { checkAndExpireAds, renewExpiredAd } from '../src/utils/adExpiryEngine';
import { Product } from '../src/types';
import { CATEGORIES } from '../src/data/categoriesData';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';

const baseMockAd: Product = {
  id: 'test-ad-1',
  title: 'Samsung Galaxy S22',
  price: 45000,
  category: 'Mobiles',
  location: 'Dhaka',
  condition: 'Used',
  images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'],
  status: 'active',
  postedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days old
};

describe('Date & Localization Utilities', () => {
  it('converts English numbers to Bengali numerals correctly', () => {
    expect(toBengaliNumber('12345')).toBe('১২৩৪৫');
    expect(toBengaliNumber(67890)).toBe('৬৭৮৯০');
    expect(toBengaliNumber('0')).toBe('০');
  });

  it('formats recent timestamps to friendly strings', () => {
    const justNow = new Date();
    expect(formatPostedAt(justNow, 'en')).toBe('Just now');
    expect(formatPostedAt(justNow, 'bn')).toBe('এইমাত্র');

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    expect(formatPostedAt(tenMinutesAgo, 'en')).toBe('10 mins ago');
    expect(formatPostedAt(tenMinutesAgo, 'bn')).toBe('১০ মিনিট আগে');
  });
});

describe('Ad Expiry & Renewal Engine', () => {
  it('expires ads older than 30 days and generates notification', () => {
    const result = checkAndExpireAds([baseMockAd]);
    expect(result.expiredCount).toBe(1);
    expect(result.updatedProducts[0].status).toBe('expired');
    expect(result.newNotifications.length).toBe(1);
    expect(result.newNotifications[0].title).toContain('Samsung Galaxy S22');
  });

  it('does not expire ads created recently', () => {
    const recentAd: Product = {
      ...baseMockAd,
      id: 'recent-ad',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days old
    };

    const result = checkAndExpireAds([recentAd]);
    expect(result.expiredCount).toBe(0);
    expect(result.updatedProducts[0].status).toBe('active');
    expect(result.newNotifications.length).toBe(0);
  });

  it('renews expired ads to active with reset timestamp', () => {
    const expiredAd: Product = {
      ...baseMockAd,
      status: 'expired',
      expiryDate: '২৫ আগস্ট ২০২৬',
    };

    const renewed = renewExpiredAd(expiredAd);
    expect(renewed.status).toBe('active');
    expect(renewed.expiryDate).toBeUndefined();
    expect(renewed.postedAt).toBeDefined();
  });
});

describe('Ad Status & Flow Logic Verification', () => {
  it('correctly maps statuses between Pending, Approved, and Active', () => {
    const newPendingAd: Product = {
      ...baseMockAd,
      status: 'pending',
    };

    expect(newPendingAd.status).toBe('pending');

    // Simulate Admin approval logic
    const approve = (status: 'active' | 'approved' | 'pending' | 'sold' | 'rejected') => {
      return status === 'approved' ? 'active' : status;
    };

    expect(approve('approved')).toBe('active');
    expect(approve('active')).toBe('active');
    expect(approve('rejected')).toBe('rejected');
  });

  it('correctly filters public visible ads vs pending ads', () => {
    const ads: Product[] = [
      { ...baseMockAd, id: '1', status: 'active' },
      { ...baseMockAd, id: '2', status: 'pending' },
      { ...baseMockAd, id: '3', status: 'rejected' },
      { ...baseMockAd, id: '4', status: 'approved' },
    ];

    const publicAds = ads.filter(p => p.status === 'active' || p.status === 'approved' || !p.status);
    expect(publicAds.map(a => a.id)).toEqual(['1', '4']);

    const pendingAds = ads.filter(p => p.status === 'pending');
    expect(pendingAds.map(a => a.id)).toEqual(['2']);
  });
});

describe('Production Advertisement & 20-Category Coverage Verification', () => {
  it('ensures all 20 main categories have at least 1 active advertisement', () => {
    expect(CATEGORIES.length).toBe(20);
    expect(INITIAL_PRODUCTS.length).toBeGreaterThanOrEqual(20);

    const categoryAdCounts = new Map<string, number>();
    CATEGORIES.forEach(c => categoryAdCounts.set(c.id, 0));

    INITIAL_PRODUCTS.forEach(p => {
      expect(p.status).toBe('active');
      if (categoryAdCounts.has(p.category)) {
        categoryAdCounts.set(p.category, (categoryAdCounts.get(p.category) || 0) + 1);
      }
    });

    CATEGORIES.forEach(c => {
      const count = categoryAdCounts.get(c.id) || 0;
      expect(count, `Category "${c.id}" (${c.nameEn}) must have at least 1 active ad`).toBeGreaterThanOrEqual(1);
    });
  });

  it('ensures all initial products follow valid category and subcategory hierarchy without dummy text', () => {
    const catMap = new Map();
    CATEGORIES.forEach(c => {
      catMap.set(c.id, new Set(c.subcategories.map(s => s.id)));
    });

    INITIAL_PRODUCTS.forEach(p => {
      // 1. Valid category
      expect(catMap.has(p.category), `Product ${p.id} has valid category`).toBe(true);

      // 2. Valid subcategory if present
      if (p.subCategory) {
        const subSet = catMap.get(p.category);
        expect(subSet.has(p.subCategory), `Product ${p.id} has valid subcategory ${p.subCategory} in category ${p.category}`).toBe(true);
      }

      // 3. No dummy / demo placeholders in title or description
      expect(p.title).not.toMatch(/dummy|demo|test product|sample product/i);
      expect(p.description).not.toMatch(/dummy|demo|test product|sample product/i);

      // 4. Valid price and location
      expect(p.price).toBeGreaterThan(0);
      expect(p.location).toBeDefined();
      expect(p.location.division).toBeTruthy();
    });
  });
});

