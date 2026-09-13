import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { PaymentRecord, PaymentStatus } from '../../types/payment';
import {
  PAYMENT_ACCOUNTS_CONFIG,
  OFFICIAL_PAYMENT_EMAIL
} from '../../config/paymentConfig';
import {
  fetchAllPayments,
  verifyPayment,
  isAuthorizedAdmin
} from '../../services/paymentService';
import { BkashLogo, NagadLogo, RocketLogo } from '../Common/BrandLogos';

export const PaymentVerificationAdminPanel: React.FC = () => {
  const { language, currentUser } = useMarket();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  
  // Proof Viewer Modal
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Action State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Transaction ID মেলেনি বা টাকা জমা পড়েনি');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  const adminEmail = currentUser?.email || 'official.marketbd@gmail.com';
  const isAdminAuthorized = isAuthorizedAdmin(adminEmail);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const list = await fetchAllPayments();
      setPayments(list);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleApprove = async (payment: PaymentRecord) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে TrxID: ${payment.transactionId}-এর ৳${payment.submittedAmount} পেমেন্ট অ্যাপ্রুভ করবেন?`)) {
      return;
    }

    setProcessingId(payment.paymentId);
    setActionErrorMsg('');
    setActionSuccessMsg('');

    const res = await verifyPayment(adminEmail, payment.paymentId, 'approve');
    setProcessingId(null);

    if (res.success && res.updatedPayment) {
      setActionSuccessMsg(`পেমেন্ট (${payment.transactionId}) সফলভাবে অনুমোদিত (PAID) হয়েছে।`);
      setPayments(prev => prev.map(p => (p.paymentId === payment.paymentId ? res.updatedPayment! : p)));
    } else {
      setActionErrorMsg(res.error || 'অনুমোদনে সমস্যা হয়েছে।');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingPayment) return;

    setProcessingId(rejectingPayment.paymentId);
    setActionErrorMsg('');
    setActionSuccessMsg('');

    const res = await verifyPayment(
      adminEmail,
      rejectingPayment.paymentId,
      'reject',
      rejectionReason
    );
    setProcessingId(null);
    setRejectingPayment(null);

    if (res.success && res.updatedPayment) {
      setActionSuccessMsg(`পেমেন্ট (${rejectingPayment.transactionId}) বাতিল (REJECTED) করা হয়েছে।`);
      setPayments(prev => prev.map(p => (p.paymentId === rejectingPayment.paymentId ? res.updatedPayment! : p)));
    } else {
      setActionErrorMsg(res.error || 'পেমেন্ট রিজেক্ট করতে ব্যর্থ হয়েছে।');
    }
  };

  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.transactionId.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.senderMobileNumber.includes(q) ||
      p.paymentId.toLowerCase().includes(q)
    );
  });

  const pendingCount = payments.filter(p => p.status === 'pending_verification').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">পেমেন্ট ভেরিফিকেশন ম্যানেজমেন্ট</h2>
              <p className="text-xs text-gray-500">
                গ্রাহকদের bKash, Nagad ও Rocket ম্যানুয়াল পেমেন্ট যাচাই ও অনুমোদন সিস্টেম
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPayments}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Central Configuration Card */}
      <div className="p-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-cyan-50/60 border border-emerald-200 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            MarketBD অফিসিয়াল পেমেন্ট অ্যাকাউন্টস (Central Configuration)
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            Support: {OFFICIAL_PAYMENT_EMAIL}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* bKash */}
          <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <BkashLogo className="h-5 w-auto" />
              <span className="text-xs font-bold text-gray-800">bKash</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800">
              {PAYMENT_ACCOUNTS_CONFIG.bKash.accountNumber}
            </span>
          </div>

          {/* Nagad */}
          <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <NagadLogo className="h-5 w-auto" />
              <span className="text-xs font-bold text-gray-800">Nagad</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800">
              {PAYMENT_ACCOUNTS_CONFIG.Nagad.accountNumber}
            </span>
          </div>

          {/* Rocket */}
          <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <RocketLogo className="h-5 w-auto" />
              <span className="text-xs font-bold text-gray-800">Rocket</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800">
              {PAYMENT_ACCOUNTS_CONFIG.Rocket.accountNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Counters & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            সব ({payments.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending_verification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'pending_verification'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span>পেন্ডিং</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'pending_verification' ? 'bg-white text-amber-600' : 'bg-amber-200 text-amber-900'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            অনুমোদিত ({paidCount})
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            বাতিল ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="TrxID, অর্ডার, মোবাইল বা নাম খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Payment Records List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <div className="w-8 h-8 mx-auto border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">পেমেন্ট রেকর্ড লোড হচ্ছে...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200 space-y-2">
          <CreditCard className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-sm font-semibold text-gray-700">কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি</p>
          <p className="text-xs">
            {statusFilter !== 'all' ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।' : 'গ্রাহক পেমেন্ট সাবমিট করলে এখানে তালিকা দেখাবে।'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">অর্ডার ও পেমেন্ট আইডি</th>
                  <th className="px-4 py-3">গ্রাহকের তথ্য</th>
                  <th className="px-4 py-3">মেথড ও TrxID</th>
                  <th className="px-4 py-3">প্রেরকের নম্বর</th>
                  <th className="px-4 py-3">টাকার পরিমাণ (Expected vs Paid)</th>
                  <th className="px-4 py-3">প্রুফ/নোট</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">কার্যক্রম (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => {
                  const isProcessing = processingId === p.paymentId;
                  const isMatched = p.amountMatched;

                  return (
                    <tr key={p.paymentId} className="hover:bg-gray-50/80 transition-colors">
                      {/* Order & Payment ID */}
                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-gray-900">{p.orderId}</div>
                        <div className="text-[10px] text-gray-400">{p.paymentId}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString('bn-BD', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{p.customerName}</div>
                        <div className="text-[11px] text-gray-500">{p.customerMobile}</div>
                      </td>

                      {/* Method & TrxID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {p.paymentMethod === 'bKash' && <BkashLogo className="h-4 w-auto" />}
                          {p.paymentMethod === 'Nagad' && <NagadLogo className="h-4 w-auto" />}
                          {p.paymentMethod === 'Rocket' && <RocketLogo className="h-4 w-auto" />}
                          <span className="font-semibold text-gray-800">{p.paymentMethod}</span>
                        </div>
                        <div className="mt-1 inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-bold text-xs tracking-wider">
                          {p.transactionId}
                        </div>
                      </td>

                      {/* Sender Mobile */}
                      <td className="px-4 py-3 font-mono text-gray-800 font-semibold">
                        {p.senderMobileNumber}
                      </td>

                      {/* Amount Match Check */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-gray-900">৳{p.submittedAmount}</span>
                          {isMatched ? (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              ✓ Matched
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                              ⚠ Exp: ৳{p.expectedAmount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Proof / Note */}
                      <td className="px-4 py-3">
                        {p.proofImageUrl ? (
                          <button
                            onClick={() => setSelectedProofUrl(p.proofImageUrl!)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[11px] font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>প্রুফ দেখুন</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400">স্ক্রিনশট নেই</span>
                        )}
                        {p.customerNote && (
                          <div className="text-[10px] text-gray-500 italic mt-1 max-w-[150px] truncate" title={p.customerNote}>
                            "{p.customerNote}"
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {p.status === 'pending_verification' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
                            <Clock className="w-3 h-3" />
                            পেন্ডিং
                          </span>
                        )}
                        {p.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-900">
                              <XCircle className="w-3 h-3" />
                              REJECTED
                            </span>
                            {p.rejectionReason && (
                              <div className="text-[10px] text-rose-600 mt-0.5">
                                {p.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status !== 'paid' && (
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                            >
                              {isProcessing ? '...' : 'Approve'}
                            </button>
                          )}

                          {p.status === 'pending_verification' && (
                            <button
                              onClick={() => setRejectingPayment(p)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          )}

                          {p.status === 'paid' && (
                            <span className="text-[11px] text-gray-400 font-medium italic">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Image Viewer Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-800">পেমেন্ট স্ক্রিনশট / রসিদ</span>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 max-h-[75vh] overflow-auto flex justify-center bg-gray-50 rounded-xl">
              <img
                src={selectedProofUrl}
                alt="Payment Proof"
                className="max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900 text-base">পেমেন্ট বাতিল (Reject) করুন</h4>
              <button onClick={() => setRejectingPayment(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              TrxID <span className="font-mono font-bold text-gray-900">{rejectingPayment.transactionId}</span> বাতিল করার কারণ নির্বাচন করুন:
            </p>

            <div className="space-y-2">
              {[
                'Transaction ID মেলেনি বা টাকা জমা পড়েনি',
                'ভুল বা অস্তিত্বহীন TrxID দেওয়া হয়েছে',
                'প্রেরিত টাকার পরিমাণ সম্পূর্ণ মেলেনি',
                'অন্যান্য তথ্যগত অসঙ্গতি'
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={rejectionReason === reason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <input
                type="text"
                placeholder="অথবা অন্য কারণ লিখুন..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 mt-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                রিজেক্ট কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
