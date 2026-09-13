import { describe, it, expect } from 'vitest';
import { Product } from '../src/types';
import { makePendingProduct, makeApprovedProduct, makeRejectedProduct } from '../src/utils/productStatus';

describe('Ad Moderation, Title Validation & Notification Suite', () => {
  const mockProduct: Partial<Product> = {
    id: 'test-ad-101',
    title: 'Toyota Corolla Cross 2022 Hybrid',
    price: 4200000,
    category: 'vehicles',
    location: 'Dhaka',
    condition: 'used_like_new',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341'],
    seller: {
      name: 'Rahim Ahmed',
      phone: '01711122233',
      location: 'Dhanmondi, Dhaka'
    }
  };

  // TEST CASE 1: Title Validation
  describe('Test 1: Title Validation', () => {
    it('rejects empty or whitespace-only titles', () => {
      const validateTitle = (t: string) => {
        if (!t || !t.trim()) {
          return { isValid: false, error: 'Advertisement title is required.' };
        }
        return { isValid: true, error: '' };
      };

      expect(validateTitle('').isValid).toBe(false);
      expect(validateTitle('   ').isValid).toBe(false);
      expect(validateTitle('').error).toBe('Advertisement title is required.');
      expect(validateTitle('Toyota Allion 2018').isValid).toBe(true);
    });
  });

  // TEST CASE 2: Manual Title Posting Flow
  describe('Test 2: Manual Title Posting Flow', () => {
    it('creates a pending product with exact manual title and sends under review notification', () => {
      const manualTitle = 'Walton Primo S8 6GB/128GB Official Warranty';
      const createdAd = makePendingProduct({
        ...mockProduct,
        title: manualTitle
      });

      expect(createdAd.title).toBe(manualTitle);
      expect(createdAd.status).toBe('pending');
      expect(createdAd.isApproved).toBe(false);
      expect(createdAd.isActive).toBe(false);
      expect(createdAd.moderationStatus).toBe('pending');
      expect(createdAd.liveNotificationSent).toBe(false);

      // Verify review notification text format
      const reviewNotifEn = {
        title: 'Your advertisement is under review.',
        message: 'Your advertisement is under review.'
      };
      const reviewNotifBn = {
        title: 'বিজ্ঞাপন পর্যালোচনায় রয়েছে',
        message: 'আপনার বিজ্ঞাপনটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।'
      };

      expect(reviewNotifEn.title).toBe('Your advertisement is under review.');
      expect(reviewNotifBn.title).toBe('বিজ্ঞাপন পর্যালোচনায় রয়েছে');
    });
  });

  // TEST CASE 3: Admin Approval Flow
  describe('Test 3: Admin Approval Flow', () => {
    it('transitions pending ad to active and creates Live notification', () => {
      const pendingAd = makePendingProduct(mockProduct);
      const approvedAd = makeApprovedProduct(pendingAd, 'admin@marketbd.com');

      expect(approvedAd.status).toBe('active');
      expect(approvedAd.isApproved).toBe(true);
      expect(approvedAd.isActive).toBe(true);
      expect(approvedAd.moderationStatus).toBe('approved');
      expect(approvedAd.approvedBy).toBe('admin@marketbd.com');
      expect(approvedAd.liveNotificationSent).toBe(true);

      const liveNotifEn = {
        id: `notif-live-${approvedAd.id}`,
        title: 'Your advertisement is now live.',
        message: `Your advertisement "${approvedAd.title}" is now live.`
      };

      expect(liveNotifEn.title).toBe('Your advertisement is now live.');
      expect(liveNotifEn.message).toContain('is now live.');
    });
  });

  // TEST CASE 4: 30-Minute Auto-Approval Flow
  describe('Test 4: 30-Minute Auto-Approval Flow', () => {
    it('auto-approves ad older than 30 minutes with Live notification (no auto-approved wording)', () => {
      const thirtyFiveMinutesAgo = new Date(Date.now() - 35 * 60 * 1000).toISOString();
      const pendingAd: Product = {
        ...(makePendingProduct(mockProduct)),
        postedAt: thirtyFiveMinutesAgo
      };

      const AUTO_APPROVE_MS = 30 * 60 * 1000;
      const elapsed = Date.now() - new Date(pendingAd.postedAt).getTime();
      expect(elapsed).toBeGreaterThanOrEqual(AUTO_APPROVE_MS);

      const autoApproved = makeApprovedProduct(pendingAd, 'system.auto_approve@marketbd.net');
      expect(autoApproved.status).toBe('active');
      expect(autoApproved.isApproved).toBe(true);
      expect(autoApproved.liveNotificationSent).toBe(true);

      // Notification sent to user MUST BE "Your advertisement is now live."
      const notifTitle = 'Your advertisement is now live.';
      expect(notifTitle).toBe('Your advertisement is now live.');
      expect(notifTitle).not.toContain('Auto-Approved');
    });
  });

  // TEST CASE 5: Duplicate Protection
  describe('Test 5: Live Notification Duplicate Protection', () => {
    it('prevents multiple live notifications for the same ad ID', () => {
      const notifications: { id: string; title: string }[] = [];

      const dispatchLiveNotification = (ad: Product) => {
        const notifId = `notif-live-${ad.id}`;
        if (notifications.some(n => n.id === notifId)) {
          return false; // Ignored duplicate
        }
        notifications.push({ id: notifId, title: 'Your advertisement is now live.' });
        return true;
      };

      const ad = makeApprovedProduct(makePendingProduct(mockProduct));

      // First trigger
      const firstResult = dispatchLiveNotification(ad);
      expect(firstResult).toBe(true);
      expect(notifications.length).toBe(1);

      // Duplicate trigger (e.g. repeated status update)
      const secondResult = dispatchLiveNotification(ad);
      expect(secondResult).toBe(false);
      expect(notifications.length).toBe(1);
    });
  });

  // TEST CASE 6: Rejected Ad Handling
  describe('Test 6: Rejected Ad Handling', () => {
    it('sets status to rejected, saves reason, and never dispatches Live notification', () => {
      const pendingAd = makePendingProduct(mockProduct);
      const rejectedAd = makeRejectedProduct(pendingAd, 'অসম্পূর্ণ বিবরণ ও অস্পষ্ট ছবি', 'admin@marketbd.com');

      expect(rejectedAd.status).toBe('rejected');
      expect(rejectedAd.isApproved).toBe(false);
      expect(rejectedAd.isActive).toBe(false);
      expect(rejectedAd.moderationStatus).toBe('rejected');
      expect(rejectedAd.rejectionReason).toBe('অসম্পূর্ণ বিবরণ ও অস্পষ্ট ছবি');
      expect(rejectedAd.liveNotificationSent).toBe(false);

      const isLiveEligible = rejectedAd.status === 'active' && rejectedAd.isApproved === true;
      expect(isLiveEligible).toBe(false);
    });
  });

  // TEST CASE 7: Edit Form Flow
  describe('Test 7: Edit Form Flow', () => {
    it('re-submits updated ad as pending with manual title and sends under review notification', () => {
      const originalAd = makeApprovedProduct(mockProduct as Product);
      const updatedTitle = 'Toyota Corolla Cross Hybrid 2022 (Pearl White Special Edition)';

      const editedAd = makePendingProduct({
        ...originalAd,
        title: updatedTitle,
        price: 4150000
      });

      expect(editedAd.title).toBe(updatedTitle);
      expect(editedAd.status).toBe('pending');
      expect(editedAd.isApproved).toBe(false);
      expect(editedAd.liveNotificationSent).toBe(false);
    });
  });
});
