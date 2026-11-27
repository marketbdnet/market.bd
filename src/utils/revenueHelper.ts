import { Product } from '../types';
import { PaymentRecord } from '../types/payment';

/**
 * Computes real verified platform revenue ONLY from actual approved/paid transactions
 * and active ads with verified real payment amounts/TrxIDs.
 * Never fabricates default amounts from seeded/demo catalog ads.
 */
export function calculateRealVerifiedRevenue(
  products: Product[],
  payments: PaymentRecord[]
): number {
  const paidPayments = (payments || []).filter(p => p && p.status === 'paid');
  const paidTotal = paidPayments.reduce((sum, p) => sum + (Number(p.submittedAmount) || 0), 0);

  const countedOrderIds = new Set(
    (payments || [])
      .map(p => String(p.orderId || '').trim())
      .filter(Boolean)
  );
  const countedTrxIds = new Set(
    (payments || [])
      .map(p => String(p.transactionId || '').trim().toUpperCase())
      .filter(Boolean)
  );

  const boostTotal = (products || []).reduce((sum, p) => {
    if (!p || p.status !== 'active') return sum;
    const paidAmount = Number(p.paymentInfo?.amount) || 0;
    const trxId = String(p.paymentInfo?.trxId || '').trim().toUpperCase();
    if (paidAmount <= 0 || !trxId) return sum;
    if (countedOrderIds.has(p.id) || countedTrxIds.has(trxId)) return sum;
    return sum + paidAmount;
  }, 0);

  return paidTotal + boostTotal;
}
