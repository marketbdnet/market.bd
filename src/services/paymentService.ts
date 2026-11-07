import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, sanitizeFirestoreData, isFirestoreQuotaExceeded } from '../lib/firebase';
import { PaymentRecord, PaymentSubmissionInput, PaymentMethod } from '../types/payment';
import {
  PAYMENT_ACCOUNTS_CONFIG,
  normalizeTransactionId,
  validatePaymentAccount
} from '../config/paymentConfig';
import { storage } from '../utils/storage';

const PAYMENTS_COLLECTION = 'payments';
const LOCAL_STORAGE_PAYMENTS_KEY = 'marketbd_manual_payments_cache';

// Authorized Admin list for verification integrity
const AUTHORIZED_ADMIN_EMAILS = [
  'admin@marketbd.net',
  'official.marketbd@gmail.com',
  'official.marketsbd@gmail.com',
  'graphicsdesign23@gmail.com'
];

function getLocalCachedPayments(): PaymentRecord[] {
  try {
    const raw = storage.getItem(LOCAL_STORAGE_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedPayments(payments: PaymentRecord[]): void {
  try {
    storage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  } catch {
    // Ignore quota storage errors
  }
}

/**
 * Validates whether an email has administrative approval privileges
 */
export function isAuthorizedAdmin(email?: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail);
}

/**
 * Checks if a transaction ID is already registered for this payment method
 */
export async function checkDuplicateTransactionId(
  method: PaymentMethod,
  normalizedTrxId: string
): Promise<boolean> {
  // Check local cache first
  const localList = getLocalCachedPayments();
  const foundLocal = localList.some(
    p => p.paymentMethod === method && p.transactionId === normalizedTrxId && p.status !== 'rejected'
  );
  if (foundLocal) return true;

  // Check Firestore if available
  if (!isFirestoreQuotaExceeded()) {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        where('paymentMethod', '==', method),
        where('transactionId', '==', normalizedTrxId)
      );
      const snap = await getDocs(q);
      const hasActive = snap.docs.some(d => {
        const data = d.data() as PaymentRecord;
        return data.status !== 'rejected';
      });
      if (hasActive) return true;
    } catch (err) {
      console.warn('[PaymentService] Duplicate check fallback to local cache:', err);
    }
  }

  return false;
}

/**
 * Checks if an active pending payment submission already exists for this order
 */
export async function checkActivePendingPaymentForOrder(orderId: string): Promise<boolean> {
  if (!orderId) return false;

  const localList = getLocalCachedPayments();
  const hasLocal = localList.some(
    p => p.orderId === orderId && p.status === 'pending_verification'
  );
  if (hasLocal) return true;

  if (!isFirestoreQuotaExceeded()) {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        where('orderId', '==', orderId),
        where('status', '==', 'pending_verification')
      );
      const snap = await getDocs(q);
      if (!snap.empty) return true;
    } catch (err) {
      console.warn('[PaymentService] Order pending check fallback:', err);
    }
  }

  return false;
}

/**
 * Customer Manual Payment Submission:
 * - Normalizes Transaction ID
 * - Validates payment method and MarketBD central account number
 * - Detects duplicate Transaction IDs
 * - Ensures status is strictly 'pending_verification'
 */
export async function submitManualPayment(
  input: PaymentSubmissionInput
): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
  try {
    const normalizedTrx = normalizeTransactionId(input.transactionId);

    if (!normalizedTrx || normalizedTrx.length < 4) {
      return {
        success: false,
        error: 'সঠিক Transaction ID লিখুন (কমপক্ষে ৪টি অক্ষর বা সংখ্যা)।'
      };
    }

    if (!input.senderMobileNumber || input.senderMobileNumber.trim().length < 10) {
      return {
        success: false,
        error: 'আপনি যে মোবাইল নম্বর থেকে টাকা পাঠিয়েছেন তা সঠিকভাবে লিখুন।'
      };
    }

    const configAccount = PAYMENT_ACCOUNTS_CONFIG[input.paymentMethod];
    if (!configAccount) {
      return {
        success: false,
        error: 'নির্বাচিত পেমেন্ট মেথডটি সঠিক নয়।'
      };
    }

    // Account validation check
    const isValidAccount = validatePaymentAccount(input.paymentMethod, configAccount.accountNumber);
    if (!isValidAccount) {
      return {
        success: false,
        error: 'পেমেন্ট অ্যাকাউন্টের তথ্যে অসঙ্গতি রয়েছে।'
      };
    }

    // Duplicate TrxID Check
    const isDuplicate = await checkDuplicateTransactionId(input.paymentMethod, normalizedTrx);
    if (isDuplicate) {
      return {
        success: false,
        error: `এই Transaction ID (${normalizedTrx})-টি ইতোমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে আপনার সঠিক ও নতুন ট্রানজেকশন আইডি দিন।`
      };
    }

    // Duplicate Pending check for the same order
    const hasPending = await checkActivePendingPaymentForOrder(input.orderId);
    if (hasPending) {
      return {
        success: false,
        error: 'এই অর্ডারের জন্য ইতোমধ্যে একটি পেমেন্ট ভেরিফিকেশনে অপেক্ষমান রয়েছে।'
      };
    }

    const now = new Date().toISOString();
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newPayment: PaymentRecord = {
      paymentId,
      orderId: input.orderId,
      userId: input.userId,
      customerName: input.customerName || 'Customer',
      customerMobile: input.customerMobile,
      customerEmail: input.customerEmail || undefined,

      paymentMethod: input.paymentMethod,
      marketbdAccountNumber: configAccount.accountNumber,

      senderMobileNumber: input.senderMobileNumber.trim(),
      transactionId: normalizedTrx,
      expectedAmount: Number(input.expectedAmount) || 0,
      submittedAmount: Number(input.submittedAmount) || 0,
      amountMatched: Number(input.expectedAmount) === Number(input.submittedAmount),

      proofImageUrl: input.proofImageUrl || undefined,
      customerNote: input.customerNote?.trim() || undefined,
      paymentDate: now,

      // Security Constraint: Customer CANNOT set 'paid'. Must be 'pending_verification'
      status: 'pending_verification',
      createdAt: now,
      updatedAt: now
    };

    // Save to Firestore
    if (!isFirestoreQuotaExceeded()) {
      try {
        const cleaned = sanitizeFirestoreData(newPayment);
        await setDoc(doc(db, PAYMENTS_COLLECTION, paymentId), cleaned);
      } catch (err) {
        console.warn('[PaymentService] Failed saving to Firestore, caching locally:', err);
      }
    }

    // Update Local Cache
    const localList = getLocalCachedPayments();
    saveLocalCachedPayments([newPayment, ...localList]);

    return { success: true, payment: newPayment };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'পেমেন্ট তথ্য সাবমিট করতে সমস্যা হয়েছে।'
    };
  }
}

/**
 * Fetches all payment records for Admin panel verification
 */
export async function fetchAllPayments(): Promise<PaymentRecord[]> {
  const localList = getLocalCachedPayments();

  if (!isFirestoreQuotaExceeded()) {
    try {
      const snap = await getDocs(collection(db, PAYMENTS_COLLECTION));
      if (!snap.empty) {
        const firestoreList: PaymentRecord[] = [];
        snap.forEach(d => {
          firestoreList.push(d.data() as PaymentRecord);
        });

        // Merge Firestore with local without duplicates
        const map = new Map<string, PaymentRecord>();
        [...firestoreList, ...localList].forEach(p => {
          map.set(p.paymentId, p);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        saveLocalCachedPayments(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[PaymentService] Error fetching payments from Firestore:', err);
    }
  }

  return localList.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Admin Action: Approve or Reject Payment
 * - Requires authorized admin email
 * - Double approval prevented (idempotent)
 * - Records verifiedBy & verifiedAt
 * - Synchronizes with Order payment status
 */
export async function verifyPayment(
  adminEmail: string,
  paymentId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
): Promise<{ success: boolean; updatedPayment?: PaymentRecord; error?: string }> {
  try {
    if (!isAuthorizedAdmin(adminEmail)) {
      return {
        success: false,
        error: 'অনুমতি নেই: শুধুমাত্র অনুমোদিত এডমিন পেমেন্ট যাচাই বা অনুমোদন করতে পারবেন।'
      };
    }

    const localList = getLocalCachedPayments();
    let payment = localList.find(p => p.paymentId === paymentId);

    // Try reading directly from Firestore
    if (!isFirestoreQuotaExceeded()) {
      try {
        const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          payment = snap.data() as PaymentRecord;
        }
      } catch (err) {
        console.warn('[PaymentService] Error fetching single payment from Firestore:', err);
      }
    }

    if (!payment) {
      return { success: false, error: 'পেমেন্ট রেকর্ডটি খুঁজে পাওয়া যায়নি।' };
    }

    // Double Approval Prevention
    if (payment.status === 'paid' && action === 'approve') {
      return { success: false, error: 'এই পেমেন্টটি ইতোমধ্যে অনুমোদিত (PAID) হয়ে গেছে।' };
    }

    const now = new Date().toISOString();
    const newStatus = action === 'approve' ? 'paid' : 'rejected';

    const updatedPayment: PaymentRecord = {
      ...payment,
      status: newStatus,
      rejectionReason: action === 'reject' ? (rejectionReason || 'ভুল বা অমিল তথ্য') : undefined,
      verifiedBy: adminEmail.trim().toLowerCase(),
      verifiedAt: now,
      updatedAt: now
    };

    // Save to Firestore
    if (!isFirestoreQuotaExceeded()) {
      try {
        const cleaned = sanitizeFirestoreData(updatedPayment);
        await setDoc(doc(db, PAYMENTS_COLLECTION, paymentId), cleaned);

        // Synchronize Order status atomically if orderId exists
        if (payment.orderId) {
          try {
            const orderRef = doc(db, 'orders', payment.orderId);
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
              await updateDoc(orderRef, {
                paymentStatus: action === 'approve' ? 'PAID' : 'REJECTED',
                orderStatus: action === 'approve' ? 'CONFIRMED' : 'PAYMENT_FAILED',
                paidAt: action === 'approve' ? now : null,
                updatedAt: now
              });
            }
          } catch (orderErr) {
            console.warn('[PaymentService] Order sync skipped:', orderErr);
          }
        }
      } catch (err) {
        console.warn('[PaymentService] Firestore update error:', err);
      }
    }

    // Update Local Cache
    const updatedLocalList = localList.map(p => (p.paymentId === paymentId ? updatedPayment : p));
    saveLocalCachedPayments(updatedLocalList);

    return { success: true, updatedPayment };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'পেমেন্ট ভেরিফিকেশন সম্পন্ন করতে ব্যর্থ হয়েছে।'
    };
  }
}
