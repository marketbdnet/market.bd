import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/lib/firebase', () => ({
  db: {},
  auth: { currentUser: null },
  RecaptchaVerifier: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
  safeFirestoreSetDoc: vi.fn().mockResolvedValue(true),
  safeFirestoreDeleteDoc: vi.fn().mockResolvedValue(true),
  onAuthStateChanged: vi.fn(() => () => {}),
  signOut: vi.fn().mockResolvedValue(true),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
}));

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/services/adminLogService', () => ({
  INITIAL_ADMIN_LOGS: [],
  saveAdminLogToFirestore: vi.fn().mockResolvedValue(true),
  subscribeToFirestoreAdminLogs: vi.fn(() => () => {}),
  fetchAllAdminLogsFromFirestore: vi.fn().mockResolvedValue([]),
  formatAdminLogTimestamp: vi.fn(() => '28 Aug 2026, 12:00 PM'),
}));

vi.mock('../src/services/pushNotificationService', () => ({
  sendLocalBrowserPushNotification: vi.fn(),
  requestWebPushPermission: vi.fn(),
}));

import { CATEGORIES } from '../src/data/categoriesData';
import {
  getLiveCategoryCount,
  getLiveSubcategoryCount,
  getLiveSecondLevelCount,
} from '../src/utils/categoryCounts';
import {
  SUBCATEGORY_IMAGES,
  BRAND_SECOND_LEVEL_IMAGES,
  getCategoryImageUrl,
  getSubcategoryImageUrl,
} from '../src/utils/categoryImages';
import {
  DEFAULT_PAYMENT_PARTNERS,
  DEFAULT_PAYMENT_ACCOUNTS,
} from '../src/context/MarketContext';
import * as smsService from '../src/services/smsService';
import type { Product } from '../src/types';

describe('Turn 3 Updates Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Real Live Ad Counts & 16-Category Structure Preservation', () => {
    it('keeps all 16 categories and their subcategories with static count zeroed', () => {
      expect(CATEGORIES.length).toBe(16);
      CATEGORIES.forEach((cat) => {
        expect(cat.count).toBe(0);
        expect(Array.isArray(cat.subcategories)).toBe(true);
        expect(cat.subcategories!.length).toBeGreaterThan(0);
        cat.subcategories!.forEach((sub) => {
          expect(sub.count).toBe(0);
          sub.secondLevelCategories?.forEach((sl) => {
            expect(sl.count).toBe(0);
          });
        });
      });
    });

    it('returns 0 for empty, pending, rejected, and sold ads', () => {
      const inactiveAds: Partial<Product>[] = [
        { id: '1', category: 'mobiles', subCategory: 'smartphones', status: 'pending' },
        { id: '2', category: 'mobiles', subCategory: 'smartphones', status: 'rejected' },
        { id: '3', category: 'mobiles', subCategory: 'smartphones', status: 'sold', isSold: true },
        { id: '4', category: 'vehicles', subCategory: 'cars', status: 'expired' },
      ];

      expect(getLiveCategoryCount([], 'mobiles')).toBe(0);
      expect(getLiveCategoryCount(inactiveAds, 'mobiles')).toBe(0);
      expect(getLiveSubcategoryCount(inactiveAds, 'mobiles', 'smartphones')).toBe(0);
      expect(getLiveSecondLevelCount(inactiveAds, 'mobiles', 'smartphones', 'samsung', 'Samsung')).toBe(0);
    });

    it('counts active ads accurately across main categories, subcategories, legacy aliases, and second-level brands', () => {
      const sampleAds: Partial<Product>[] = [
        {
          id: 'a1',
          category: 'mobiles',
          subCategory: 'smartphones',
          secondLevelCategory: 'samsung',
          brand: 'Samsung',
          title: 'Samsung Galaxy S24 Ultra',
          status: 'active',
        },
        {
          id: 'a2',
          category: 'vehicles',
          subCategory: 'motorcycles', // legacy alias for motorcycles_scooters
          title: 'Yamaha R15 V4',
          status: 'active',
        },
        {
          id: 'a3',
          category: 'electronics',
          subCategory: 'printers', // legacy alias for printers_peripherals
          title: 'Epson EcoTank Printer',
          status: 'active',
        },
        {
          id: 'a4',
          category: 'mobiles',
          subCategory: 'smartphones',
          secondLevelCategory: 'apple',
          title: 'iPhone 15 Pro',
          status: 'pending', // excluded
        },
      ];

      expect(getLiveCategoryCount(sampleAds, 'mobiles')).toBe(1);
      expect(getLiveCategoryCount(sampleAds, 'vehicles')).toBe(1);
      expect(getLiveCategoryCount(sampleAds, 'electronics')).toBe(1);
      expect(getLiveCategoryCount(sampleAds, 'property')).toBe(0);

      expect(getLiveSubcategoryCount(sampleAds, 'mobiles', 'smartphones')).toBe(1);
      expect(getLiveSubcategoryCount(sampleAds, 'vehicles', 'motorcycles_scooters')).toBe(1);
      expect(getLiveSubcategoryCount(sampleAds, 'electronics', 'printers_peripherals')).toBe(1);

      expect(getLiveSecondLevelCount(sampleAds, 'mobiles', 'smartphones', 'samsung', 'Samsung')).toBe(1);
      expect(getLiveSecondLevelCount(sampleAds, 'mobiles', 'smartphones', 'apple', 'Apple')).toBe(0);
    });
  });

  describe('2. Subcategory & Second-Level Image Integrity', () => {
    const BROKEN_UNSPLASH_IDS = [
      '1486006920555',
      '1580481077190',
      '1556742049',
      '1579783902614',
      '1542272604',
    ];

    it('contains zero broken 404 Unsplash image URLs across catalog and mappings', () => {
      const allUrls: string[] = [];

      Object.values(SUBCATEGORY_IMAGES).forEach((u) => allUrls.push(u));
      Object.values(BRAND_SECOND_LEVEL_IMAGES).forEach((u) => allUrls.push(u));

      CATEGORIES.forEach((cat) => {
        allUrls.push(getCategoryImageUrl(cat.id, cat.image));
        cat.subcategories?.forEach((sub) => {
          const resolved = getSubcategoryImageUrl(cat.id, sub.id, sub.image);
          expect(resolved.length).toBeGreaterThan(0);
          allUrls.push(resolved);
          if (sub.image) allUrls.push(sub.image);
          sub.secondLevelCategories?.forEach((sl) => {
            if (sl.image) allUrls.push(sl.image);
          });
        });
      });

      allUrls.forEach((url) => {
        BROKEN_UNSPLASH_IDS.forEach((badId) => {
          expect(url).not.toContain(badId);
        });
      });
    });
  });

  describe('3. Payment Verification Defaults (bKash, Nagad, Rocket Active; Others Disabled by Default)', () => {
    it('keeps strictly 3 partners enabled (bKash, Nagad, Rocket) and 17 disabled in DEFAULT_PAYMENT_PARTNERS', () => {
      const enabled = DEFAULT_PAYMENT_PARTNERS.filter((p) => p.isEnabled);
      const disabled = DEFAULT_PAYMENT_PARTNERS.filter((p) => !p.isEnabled);

      expect(enabled.length).toBe(3);
      expect(disabled.length).toBe(17);
      expect(enabled.map((p) => p.id)).toEqual(['partner-1', 'partner-2', 'partner-3']);
    });

    it('enables only bKash, Nagad, and Rocket in DEFAULT_PAYMENT_ACCOUNTS while keeping Upay & Bank disabled for Admin reactivation', () => {
      expect(DEFAULT_PAYMENT_ACCOUNTS.bkashEnabled).toBe(true);
      expect(DEFAULT_PAYMENT_ACCOUNTS.nagadEnabled).toBe(true);
      expect(DEFAULT_PAYMENT_ACCOUNTS.rocketEnabled).toBe(true);
      expect(DEFAULT_PAYMENT_ACCOUNTS.upayEnabled).toBe(false);
      expect(DEFAULT_PAYMENT_ACCOUNTS.bankAccount?.isEnabled).toBe(false);
    });
  });

  describe('4. Unified Bulk SMS & OTP Service', () => {
    it('exports a single unified set of SMS & OTP functions', () => {
      expect(typeof smsService.sendUnifiedSmsOtp).toBe('function');
      expect(typeof smsService.verifyUnifiedSmsOtp).toBe('function');
      expect(typeof smsService.sendUnifiedSmsText).toBe('function');
      expect(typeof smsService.fetchUnifiedSmsBalance).toBe('function');
      expect(typeof smsService.sendRealSmsOtp).toBe('function');
      expect(typeof smsService.sendEmailPasswordReset).toBe('function');
    });

    it('dispatches sendUnifiedSmsOtp and verifyUnifiedSmsOtp cleanly via /api/sms', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ ok: true, token: 'tok-123', exp: 999999999999 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ ok: true }),
        });
      vi.stubGlobal('fetch', fetchMock);

      const sendRes = await smsService.sendUnifiedSmsOtp('01712345678');
      expect(sendRes.ok).toBe(true);
      expect(sendRes.token).toBe('tok-123');
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        '/api/sms',
        expect.objectContaining({ method: 'POST' })
      );

      const verifyRes = await smsService.verifyUnifiedSmsOtp({
        phone: '01712345678',
        code: '123456',
        token: 'tok-123',
        exp: 999999999999,
      });
      expect(verifyRes.ok).toBe(true);
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/sms',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
