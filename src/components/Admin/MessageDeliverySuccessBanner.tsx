import React from 'react';
import { CheckCircle2, X, Smartphone, Mail, CreditCard, Sparkles } from 'lucide-react';
import {
  getTotalPurchasedSms,
  getSmsSentCount,
  getRemainingPurchasedSms,
  getMaskingRemainingSms,
  getNonMaskingRemainingSms
} from '../../services/smsService';

interface MessageDeliverySuccessBannerProps {
  recipient: string;
  recipientName?: string;
  channel?: 'sms' | 'email' | 'both';
  messageText?: string;
  onClose: () => void;
  language?: 'bn' | 'en';
}

export const MessageDeliverySuccessBanner: React.FC<MessageDeliverySuccessBannerProps> = ({
  recipient,
  recipientName,
  channel = 'sms',
  messageText,
  onClose,
  language = 'bn'
}) => {
  const totalPurchased = getTotalPurchasedSms();
  const sentCount = getSmsSentCount();
  const remaining = getRemainingPurchasedSms();
  const maskingRemaining = getMaskingRemainingSms();
  const nonMaskingRemaining = getNonMaskingRemainingSms();

  return (
    <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/90 dark:via-slate-900 dark:to-emerald-900/90 border-2 border-emerald-500 rounded-2xl shadow-lg animate-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shrink-0 animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                🎉 মেসেজ সফলভাবে গ্রাহকের কাছে পাঠানো হয়েছে!
              </h4>
              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                Message Successfully Sent
              </span>
            </div>

            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
              {channel === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span>
                প্রাপক: <b>{recipientName ? `${recipientName} (${recipient})` : recipient}</b>
              </span>
            </p>

            {messageText && (
              <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-300 dark:border-emerald-800 text-[11px] text-slate-800 dark:text-slate-200 font-mono">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">প্রেরিত বার্তা:</span>
                "{messageText.slice(0, 100)}{messageText.length > 100 ? '...' : ''}"
              </div>
            )}

            {/* Quota breakdown including Masking & Non-Masking */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono font-bold text-emerald-950 dark:text-emerald-200">
              <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 px-2.5 py-0.5 rounded-lg border border-purple-300 dark:border-purple-800">
                🔤 মাসকিং ব্যালেন্স: {maskingRemaining}টি
              </span>
              <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 px-2.5 py-0.5 rounded-lg border border-blue-300 dark:border-blue-800">
                🔢 নন-মাসকিং ব্যালেন্স: {nonMaskingRemaining}টি
              </span>
              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                💳 মোট অবশিষ্ট: {remaining}টি
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 hover:bg-emerald-200/60 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
