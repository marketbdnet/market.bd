import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  CreditCard,
  Upload,
  AlertCircle,
  Clock,
  ShieldCheck,
  Mail,
  Smartphone,
  Info
} from 'lucide-react';
import { BkashLogo, NagadLogo, RocketLogo } from '../Common/BrandLogos';
import { PaymentMethod, PaymentRecord } from '../../types/payment';
import {
  PAYMENT_ACCOUNTS_CONFIG,
  OFFICIAL_PAYMENT_EMAIL
} from '../../config/paymentConfig';
import { submitManualPayment } from '../../services/paymentService';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  expectedAmount: number;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  userId?: string;
  serviceTitle?: string;
  onPaymentSubmitted?: (payment: PaymentRecord) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  orderId,
  expectedAmount,
  customerName,
  customerMobile,
  customerEmail,
  userId = 'guest',
  serviceTitle = 'MarketBD সার্ভিস / অর্ডার',
  onPaymentSubmitted
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bKash');
  const [senderMobile, setSenderMobile] = useState(customerMobile || '');
  const [transactionId, setTransactionId] = useState('');
  const [submittedAmount, setSubmittedAmount] = useState<string>(String(expectedAmount));
  const [customerNote, setCustomerNote] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<PaymentRecord | null>(null);

  if (!isOpen) return null;

  const currentAccountConfig = PAYMENT_ACCOUNTS_CONFIG[selectedMethod];

  const handleCopyNumber = () => {
    if (currentAccountConfig?.accountNumber) {
      navigator.clipboard.writeText(currentAccountConfig.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('শুধুমাত্র ছবি ফাইল (JPG, PNG) আপলোড করুন।');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('ছবির আকার সর্বোচ্চ ৩ মেগাবাইটের মধ্যে হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!senderMobile.trim()) {
      setErrorMsg('আপনি যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন।');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMsg('টাকা পাঠানোর পর প্রাপ্ত Transaction ID লিখুন।');
      return;
    }

    const parsedAmount = Number(submittedAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('টাকার সঠিক পরিমাণ লিখুন।');
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitManualPayment({
        orderId,
        userId,
        customerName,
        customerMobile,
        customerEmail,
        paymentMethod: selectedMethod,
        senderMobileNumber: senderMobile,
        transactionId,
        submittedAmount: parsedAmount,
        expectedAmount,
        proofImageUrl: proofImage,
        customerNote
      });

      if (!res.success || !res.payment) {
        setErrorMsg(res.error || 'পেমেন্ট তথ্য সাবমিট করতে সমস্যা হয়েছে।');
      } else {
        setSuccessResult(res.payment);
        if (onPaymentSubmitted) {
          onPaymentSubmitted(res.payment);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'পেমেন্ট সাবমিশন সম্পন্ন করা যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">ম্যানুয়াল পেমেন্ট কনফার্মেশন</h3>
              <p className="text-xs text-emerald-100 font-medium">
                অর্ডার: <span className="font-mono">{orderId}</span> • {serviceTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-800">পেমেন্ট ভেরিফিকেশনের জন্য জমা হয়েছে</h4>
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-left text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">পেমেন্ট আইডি:</span>
                <span className="font-mono font-bold">{successResult.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">অর্ডার নম্বর:</span>
                <span className="font-mono font-medium">{successResult.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">পেমেন্ট মেথড:</span>
                <span className="font-semibold text-gray-800">{successResult.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold text-emerald-700">{successResult.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">টাকার পরিমাণ:</span>
                <span className="font-bold text-emerald-600">৳{successResult.submittedAmount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-200">
                <span className="text-gray-500">বর্তমান স্ট্যাটাস:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-200 text-amber-900">
                  Pending Verification
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              আমাদের অফিসিয়াল টিম আপনার ট্রানজেকশন তথ্য দ্রুত যাচাই করে অর্ডার অ্যাপ্রুভ করবে।
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all"
            >
              ঠিক আছে
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Amount Banner */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <span className="text-xs text-gray-500 font-medium">পরিশোধের নির্ধারিত অংক</span>
                <div className="text-xl font-black text-gray-900">৳ {expectedAmount}</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3 h-3" /> নিরাপদ লেনদেন
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                পেমেন্ট মেথড নির্বাচন করুন
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bKash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    selectedMethod === 'bKash'
                      ? 'border-[#E2136E] bg-pink-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <BkashLogo className="h-6 w-auto" />
                  <span className="text-xs font-semibold text-gray-800 mt-1.5">bKash</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('Nagad')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    selectedMethod === 'Nagad'
                      ? 'border-[#F7931E] bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <NagadLogo className="h-6 w-auto" />
                  <span className="text-xs font-semibold text-gray-800 mt-1.5">Nagad</span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('Rocket')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    selectedMethod === 'Rocket'
                      ? 'border-[#8C3494] bg-purple-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <RocketLogo className="h-6 w-auto" />
                  <span className="text-xs font-semibold text-gray-800 mt-1.5">Rocket</span>
                </button>
              </div>
            </div>

            {/* Centralized Account Number & Instructions */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">
                  {selectedMethod} Payment Number:
                </span>
                <span className="text-[11px] text-gray-500 font-medium">MarketBD অফিসিয়াল</span>
              </div>

              <div className="flex items-center justify-between bg-white border border-emerald-300 rounded-lg p-2 px-3 shadow-inner">
                <span className="font-mono text-base font-bold text-gray-900 tracking-wider">
                  {currentAccountConfig?.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> কপি করুন
                    </>
                  )}
                </button>
              </div>

              {/* Exact neutral instruction from central config */}
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                ℹ️ {currentAccountConfig?.instructions}
              </p>
            </div>

            {/* Transaction Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile) *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    placeholder="e.g. 9J38SDF71"
                    className="w-full px-3 py-2 text-sm font-mono uppercase font-bold text-emerald-900 bg-emerald-50/30 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    প্রেরিত টাকার পরিমাণ (৳) *
                  </label>
                  <input
                    type="number"
                    value={submittedAmount}
                    onChange={(e) => setSubmittedAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Optional Screenshot Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পেমেন্ট স্ক্রিনশট / রসিদ (ঐচ্ছিক)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span>ছবি নির্বাচন করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofUpload}
                      className="hidden"
                    />
                  </label>
                  {proofImage && (
                    <div className="flex items-center gap-2">
                      <img
                        src={proofImage}
                        alt="Proof Preview"
                        className="w-9 h-9 object-cover rounded-md border border-gray-200"
                      />
                      <span className="text-xs text-emerald-600 font-medium">ছবি যুক্ত হয়েছে</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Customer Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  মন্তব্য বা অতিরিক্ত তথ্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="প্রয়োজনে কোনো তথ্য এখানে লিখতে পারেন"
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Email Backup Notice */}
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
              <span>
                আপনি চাইলে আপনার অর্ডার আইডি এবং ট্রানজেকশন স্ক্রিনশট আমাদের অফিসিয়াল ইমেইল{' '}
                <span className="font-semibold text-gray-800">{OFFICIAL_PAYMENT_EMAIL}</span>-এও ব্যাকআপ হিসেবে পাঠিয়ে রাখতে পারেন।
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <span>পেমেন্ট কনফার্মেশন জমা দিন</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
