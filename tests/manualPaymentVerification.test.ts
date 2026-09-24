import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../src/utils/storage';
import {
  PAYMENT_ACCOUNTS_CONFIG,
  getPaymentAccount,
  validatePaymentAccount,
  normalizeTransactionId,
  OFFICIAL_PAYMENT_EMAIL
} from '../src/config/paymentConfig';
import {
  submitManualPayment,
  verifyPayment,
  isAuthorizedAdmin,
  checkDuplicateTransactionId
} from '../src/services/paymentService';

describe('Manual Payment Verification & Central Config Engine', () => {
  beforeEach(() => {
    storage.clear();
  });

  describe('Central Configuration & Accounts Source of Truth', () => {
    it('has correct and single source of truth numbers for bKash, Nagad, and Rocket', () => {
      expect(PAYMENT_ACCOUNTS_CONFIG.bKash.accountNumber).toBe('+8801723230230');
      expect(PAYMENT_ACCOUNTS_CONFIG.Nagad.accountNumber).toBe('+8801723230230');
      expect(PAYMENT_ACCOUNTS_CONFIG.Rocket.accountNumber).toBe('+8801533830784');
    });

    it('has neutral instructions without assuming Personal or Merchant type', () => {
      expect(PAYMENT_ACCOUNTS_CONFIG.bKash.instructions).toBe(
        'bKash থেকে এই নম্বরে টাকা পাঠান এবং Transaction ID সংরক্ষণ করুন।'
      );
      expect(PAYMENT_ACCOUNTS_CONFIG.Nagad.instructions).toBe(
        'Nagad থেকে এই নম্বরে টাকা পাঠান এবং Transaction ID সংরক্ষণ করুন।'
      );
      expect(PAYMENT_ACCOUNTS_CONFIG.Rocket.instructions).toBe(
        'Rocket থেকে এই নম্বরে টাকা পাঠান এবং Transaction ID সংরক্ষণ করুন।'
      );
    });

    it('validates correct account matching for each payment method', () => {
      expect(validatePaymentAccount('bKash', '+8801723230230')).toBe(true);
      expect(validatePaymentAccount('bKash', '01723230230')).toBe(true);
      expect(validatePaymentAccount('Nagad', '+8801723230230')).toBe(true);
      expect(validatePaymentAccount('Rocket', '+8801533830784')).toBe(true);
      expect(validatePaymentAccount('Rocket', '01533830784')).toBe(true);
      
      // Mismatch detection
      expect(validatePaymentAccount('Rocket', '+8801723230230')).toBe(false);
      expect(validatePaymentAccount('bKash', '+8801533830784')).toBe(false);
    });

    it('provides official backup email', () => {
      expect(OFFICIAL_PAYMENT_EMAIL).toBe('official.marketbd@gmail.com');
    });
  });

  describe('Transaction ID Normalization', () => {
    it('trims whitespace and converts to uppercase', () => {
      expect(normalizeTransactionId('  9j38sdf71  ')).toBe('9J38SDF71');
      expect(normalizeTransactionId('bksh-1029 ')).toBe('BKSH1029');
    });

    it('returns empty string on empty input', () => {
      expect(normalizeTransactionId('')).toBe('');
    });
  });

  describe('Submission & Security Rules', () => {
    const uid = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    it('submits payment with mandatory status = pending_verification', async () => {
      const trx = `TRX${uid()}`;
      const res = await submitManualPayment({
        orderId: `MB-ORD-${uid()}`,
        userId: 'user-001',
        customerName: 'Rahim Uddin',
        customerMobile: '01812345678',
        paymentMethod: 'bKash',
        senderMobileNumber: '01812345678',
        transactionId: trx.toLowerCase(),
        submittedAmount: 500,
        expectedAmount: 500
      });

      expect(res.success).toBe(true);
      expect(res.payment).toBeDefined();
      expect(res.payment?.status).toBe('pending_verification');
      expect(res.payment?.transactionId).toBe(trx);
      expect(res.payment?.amountMatched).toBe(true);
      expect(res.payment?.marketbdAccountNumber).toBe('+8801723230230');
    });

    it('detects amount mismatch between expected and submitted', async () => {
      const res = await submitManualPayment({
        orderId: `MB-ORD-${uid()}`,
        userId: 'user-002',
        customerName: 'Karim Ahmed',
        customerMobile: '01912345678',
        paymentMethod: 'Nagad',
        senderMobileNumber: '01912345678',
        transactionId: `TRX${uid()}`,
        submittedAmount: 400, // Short of 500
        expectedAmount: 500
      });

      expect(res.success).toBe(true);
      expect(res.payment?.amountMatched).toBe(false);
    });

    it('prevents duplicate transactionId for the same payment method', async () => {
      const dupTrx = `RCK-DUP-${uid()}`;
      const first = await submitManualPayment({
        orderId: `MB-ORD-${uid()}`,
        userId: 'user-003',
        customerName: 'Abul Bashar',
        customerMobile: '01712345678',
        paymentMethod: 'Rocket',
        senderMobileNumber: '01712345678',
        transactionId: dupTrx,
        submittedAmount: 300,
        expectedAmount: 300
      });
      expect(first.success).toBe(true);

      // Attempt second submission with duplicate TrxID
      const second = await submitManualPayment({
        orderId: `MB-ORD-${uid()}`,
        userId: 'user-004',
        customerName: 'Other User',
        customerMobile: '01612345678',
        paymentMethod: 'Rocket',
        senderMobileNumber: '01612345678',
        transactionId: dupTrx.toLowerCase(), // Lowercase, normalized
        submittedAmount: 300,
        expectedAmount: 300
      });

      expect(second.success).toBe(false);
      expect(second.error).toContain('ইতোমধ্যে ব্যবহৃত হয়েছে');
    });

    it('prevents multiple active pending submissions for the same order', async () => {
      const orderId = `MB-ORD-PEND-${uid()}`;
      const first = await submitManualPayment({
        orderId,
        userId: 'user-005',
        customerName: 'Salam Mia',
        customerMobile: '01711223344',
        paymentMethod: 'bKash',
        senderMobileNumber: '01711223344',
        transactionId: `TRX-PEND-${uid()}`,
        submittedAmount: 299,
        expectedAmount: 299
      });
      expect(first.success).toBe(true);

      const duplicateOrder = await submitManualPayment({
        orderId,
        userId: 'user-005',
        customerName: 'Salam Mia',
        customerMobile: '01711223344',
        paymentMethod: 'bKash',
        senderMobileNumber: '01711223344',
        transactionId: `TRX-PEND-${uid()}`,
        submittedAmount: 299,
        expectedAmount: 299
      });

      expect(duplicateOrder.success).toBe(false);
      expect(duplicateOrder.error).toContain('ইতোমধ্যে একটি পেমেন্ট ভেরিফিকেশনে অপেক্ষমান রয়েছে');
    });
  });

  describe('Admin Verification & Double-Approval Protection', () => {
    const uid = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    it('authorizes only official admin accounts', () => {
      expect(isAuthorizedAdmin('official.marketbd@gmail.com')).toBe(true);
      expect(isAuthorizedAdmin('admin@marketbd.net')).toBe(true);
      expect(isAuthorizedAdmin('fake.admin@gmail.com')).toBe(false);
      expect(isAuthorizedAdmin('')).toBe(false);
    });

    it('allows authorized admin to approve pending payment and records audit trail', async () => {
      const sub = await submitManualPayment({
        orderId: `MB-ORD-${uid()}`,
        userId: 'user-201',
        customerName: 'Tanvir Hossain',
        customerMobile: '01511223344',
        paymentMethod: 'bKash',
        senderMobileNumber: '01511223344',
        transactionId: `TRX-APPR-${uid()}`,
        submittedAmount: 599,
        expectedAmount: 599
      });

      const paymentId = sub.payment!.paymentId;

      const approveRes = await verifyPayment('official.marketbd@gmail.com', paymentId, 'approve');
      expect(approveRes.success).toBe(true);
      expect(approveRes.updatedPayment?.status).toBe('paid');
      expect(approveRes.updatedPayment?.verifiedBy).toBe('official.marketbd@gmail.com');
      expect(approveRes.updatedPayment?.verifiedAt).toBeDefined();

      // Double approval prevention check
      const reApproveRes = await verifyPayment('official.marketbd@gmail.com', paymentId, 'approve');
      expect(reApproveRes.success).toBe(false);
      expect(reApproveRes.error).toContain('ইতোমধ্যে অনুমোদিত (PAID) হয়ে গেছে');
    });

    it('allows admin to reject payment and records rejectionReason', async () => {
      const sub = await submitManualPayment({
        orderId: `MB-ORD-${uid()}`,
        userId: 'user-202',
        customerName: 'Bad User',
        customerMobile: '01911223344',
        paymentMethod: 'Nagad',
        senderMobileNumber: '01911223344',
        transactionId: `TRX-REJ-${uid()}`,
        submittedAmount: 100,
        expectedAmount: 500
      });

      const paymentId = sub.payment!.paymentId;

      const rejectRes = await verifyPayment(
        'official.marketbd@gmail.com',
        paymentId,
        'reject',
        'টাকা জমা পড়েনি'
      );

      expect(rejectRes.success).toBe(true);
      expect(rejectRes.updatedPayment?.status).toBe('rejected');
      expect(rejectRes.updatedPayment?.rejectionReason).toBe('টাকা জমা পড়েনি');
      expect(rejectRes.updatedPayment?.verifiedBy).toBe('official.marketbd@gmail.com');
    });
  });
});
