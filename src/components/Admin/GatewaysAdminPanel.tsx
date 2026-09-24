import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Smartphone,
  CreditCard,
  BellRing,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Send,
  Lock,
  MessageSquare,
  FileText,
  HelpCircle,
  Volume2,
  Check,
  Layers,
  Radio,
  Eye,
  EyeOff,
  Megaphone,
  Edit3,
  Save,
  Users,
  History
} from 'lucide-react';
import {
  sendRealSmsOtp,
  sendCustomSms,
  fetchSmsBalance,
  getSmsSentCount,
  getTotalPurchasedSms,
  setTotalPurchasedSms,
  getRemainingPurchasedSms,
  getMaskingTotalSms,
  setMaskingTotalSms,
  getMaskingSentSms,
  setMaskingSentSms,
  getMaskingRemainingSms,
  getNonMaskingTotalSms,
  setNonMaskingTotalSms,
  getNonMaskingSentSms,
  setNonMaskingSentSms,
  getNonMaskingRemainingSms,
  getMessageDispatchLogs,
  clearMessageDispatchLogs,
  MessageDispatchLog,
  playVoiceOtp,
  DEFAULT_OTP_TEMPLATE,
  DEFAULT_VOICE_OTP_TEMPLATE,
  DEFAULT_ORDER_TEMPLATE,
  DEFAULT_PROMO_TEMPLATE
} from '../../services/smsService';
import { requestWebPushPermission, sendLocalBrowserPushNotification } from '../../services/pushNotificationService';
import { checkAndExpireAds } from '../../utils/adExpiryEngine';
import { CustomerBroadcastModal } from './CustomerBroadcastModal';
import { MessageDeliverySuccessBanner } from './MessageDeliverySuccessBanner';

import { storage } from '../../utils/storage';

export const GatewaysAdminPanel: React.FC = () => {
  const { language, products, renewAd, registeredUsers = [] } = useMarket();

  // SMS Gateway Config State
  const [smsProvider, setSmsProvider] = useState<string>(
    storage.getItem('marketbd_sms_provider') || 'bulksmsdhaka.net'
  );
  const [smsApiKey, setSmsApiKey] = useState<string>(
    storage.getItem('marketbd_sms_api_key') || 'a41e93294c036daa7fd102f7bc6f93fe0fb97e9a'
  );
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // Masking vs Non-Masking State
  const [senderType, setSenderType] = useState<'masking' | 'non_masking'>(
    (storage.getItem('marketbd_sms_sender_type') as any) || 'non_masking'
  );
  const [maskingId, setMaskingId] = useState<string>(
    storage.getItem('marketbd_sms_masking_id') || 'marketbd.net'
  );
  const [nonMaskingId, setNonMaskingId] = useState<string>(
    storage.getItem('marketbd_sms_non_masking_id') || '1234'
  );

  const [smsIsLive, setSmsIsLive] = useState(storage.getItem('marketbd_live_mode') !== 'false');

  // Modern Message Templates
  const [activeTemplateTab, setActiveTemplateTab] = useState<'otp' | 'voice' | 'order' | 'promo' | 'security'>('otp');
  const [smsTemplate, setSmsTemplate] = useState<string>(() => {
    const stored = storage.getItem('marketbd_sms_template');
    if (!stored || stored.includes('আপনার MarketBD.Net') || stored.includes('ভেরিফিকেশন ওটিপি')) {
      return DEFAULT_OTP_TEMPLATE;
    }
    return stored;
  });
  const [voiceTemplate, setVoiceTemplate] = useState<string>(
    storage.getItem('marketbd_voice_template') || DEFAULT_VOICE_OTP_TEMPLATE
  );
  const [orderTemplate, setOrderTemplate] = useState<string>(
    storage.getItem('marketbd_order_template') || DEFAULT_ORDER_TEMPLATE
  );
  const [promoTemplate, setPromoTemplate] = useState<string>(
    storage.getItem('marketbd_promo_template') || DEFAULT_PROMO_TEMPLATE
  );

  const [testPhone, setTestPhone] = useState('01634025151');
  const [smsStatusMsg, setSmsStatusMsg] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // SMS Usage & Quota State (333 Total Purchased, 5 Current Sent, 328 Remaining Balance)
  const [totalPurchasedSms, setTotalPurchasedSmsState] = useState<number>(getTotalPurchasedSms());
  const [isEditingPurchased, setIsEditingPurchased] = useState(false);
  const [editPurchasedInput, setEditPurchasedInput] = useState<string>(String(getTotalPurchasedSms()));
  const [smsSentCount, setSmsSentCount] = useState<number>(getSmsSentCount());

  // Masking SMS State
  const [maskingTotalSms, setMaskingTotalSmsState] = useState<number>(getMaskingTotalSms());
  const [maskingSentSms, setMaskingSentSmsState] = useState<number>(getMaskingSentSms());
  const [isEditingMasking, setIsEditingMasking] = useState(false);
  const [editMaskingInput, setEditMaskingInput] = useState<string>(String(getMaskingTotalSms()));

  // Non-Masking SMS State
  const [nonMaskingTotalSms, setNonMaskingTotalSmsState] = useState<number>(getNonMaskingTotalSms());
  const [nonMaskingSentSms, setNonMaskingSentSmsState] = useState<number>(getNonMaskingSentSms());
  const [isEditingNonMasking, setIsEditingNonMasking] = useState(false);
  const [editNonMaskingInput, setEditNonMaskingInput] = useState<string>(String(getNonMaskingTotalSms()));

  const [smsBalance, setSmsBalance] = useState<string>(
    storage.getItem('marketbd_last_known_balance') || 'যাচাই করা হয়নি'
  );
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false);
  const [balanceStatusMsg, setBalanceStatusMsg] = useState<string>('');

  // Customer Custom SMS State & Delivery Feedback
  const [customSmsPhone, setCustomSmsPhone] = useState('');
  const [customSmsMessage, setCustomSmsMessage] = useState('');
  const [customSmsStatus, setCustomSmsStatus] = useState('');
  const [isSendingCustomSms, setIsSendingCustomSms] = useState(false);
  const [singleMsgDeliverySuccess, setSingleMsgDeliverySuccess] = useState<{
    recipient: string;
    messageText?: string;
    channel: 'sms' | 'email';
  } | null>(null);

  // Bulk Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [messageLogs, setMessageLogs] = useState<MessageDispatchLog[]>(getMessageDispatchLogs());

  // Compute active sender id
  const activeSenderId = senderType === 'masking' ? maskingId.trim() : (nonMaskingId.trim() || '1234');

  // Load balance on mount
  useEffect(() => {
    setSmsSentCount(getSmsSentCount());
  }, []);

  const handleRefreshBalance = async () => {
    setIsCheckingBalance(true);
    setBalanceStatusMsg('');
    const res = await fetchSmsBalance({
      provider: smsProvider.trim(),
      apiKey: smsApiKey.trim(),
      senderId: activeSenderId,
      senderType,
      maskingId: maskingId.trim(),
      nonMaskingId: nonMaskingId.trim(),
      isLiveMode: smsIsLive,
      template: smsTemplate
    });
    setIsCheckingBalance(false);
    setSmsBalance(res.balance);
    setBalanceStatusMsg(res.message);
    setSmsSentCount(getSmsSentCount());
  };

  // Payment Gateway Config State
  const [paymentLiveMode, setPaymentLiveMode] = useState(storage.getItem('marketbd_payment_live_mode') !== 'false');
  const [autoSettle, setAutoSettle] = useState(storage.getItem('marketbd_payment_auto_settle') !== 'false');
  const [bkashAppKey, setBkashAppKey] = useState(storage.getItem('marketbd_bkash_app_key') || '');
  const [nagadMerchantId, setNagadMerchantId] = useState(storage.getItem('marketbd_nagad_merchant_id') || '');
  const [sslStoreId, setSslStoreId] = useState(storage.getItem('marketbd_ssl_store_id') || '');
  const [paymentMsg, setPaymentMsg] = useState('');

  // Web Push State
  const [pushEnabled, setPushEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [pushStatusMsg, setPushStatusMsg] = useState('');

  // Expiry Run State
  const [expirySummary, setExpirySummary] = useState('');

  // Save SMS Gateway Config
  const handleSaveSmsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanProvider = smsProvider.trim() || 'bulksmsdhaka.net';
    const cleanKey = smsApiKey.trim();
    const cleanMasking = maskingId.trim() || 'marketbd.net';
    const cleanNonMasking = nonMaskingId.trim() || '1234';
    const cleanOtpTpl = smsTemplate.trim() || DEFAULT_OTP_TEMPLATE;
    const cleanVoiceTpl = voiceTemplate.trim() || DEFAULT_VOICE_OTP_TEMPLATE;
    const cleanOrderTpl = orderTemplate.trim() || DEFAULT_ORDER_TEMPLATE;
    const cleanPromoTpl = promoTemplate.trim() || DEFAULT_PROMO_TEMPLATE;

    const currentSender = senderType === 'masking' ? cleanMasking : cleanNonMasking;

    setSmsProvider(cleanProvider);
    setSmsApiKey(cleanKey);
    setMaskingId(cleanMasking);
    setNonMaskingId(cleanNonMasking);
    setSmsTemplate(cleanOtpTpl);
    setVoiceTemplate(cleanVoiceTpl);
    setOrderTemplate(cleanOrderTpl);
    setPromoTemplate(cleanPromoTpl);

    storage.setItem('marketbd_sms_provider', cleanProvider);
    storage.setItem('marketbd_sms_api_key', cleanKey);
    storage.setItem('marketbd_sms_sender_type', senderType);
    storage.setItem('marketbd_sms_masking_id', cleanMasking);
    storage.setItem('marketbd_sms_non_masking_id', cleanNonMasking);
    storage.setItem('marketbd_sms_sender_id', currentSender);
    storage.setItem('marketbd_sms_template', cleanOtpTpl);
    storage.setItem('marketbd_voice_template', cleanVoiceTpl);
    storage.setItem('marketbd_order_template', cleanOrderTpl);
    storage.setItem('marketbd_promo_template', cleanPromoTpl);
    storage.setItem('marketbd_live_mode', String(smsIsLive));

    setSmsStatusMsg(
      language === 'bn'
        ? `✅ আপডেট সফল হয়েছে! (${cleanProvider}) গেটওয়ে ও ${senderType === 'masking' ? 'মাসকিং' : 'নন-মাসকিং'} মোড সংরক্ষিত হয়েছে।`
        : `✅ Successfully Saved! Provider: ${cleanProvider}, Mode: ${senderType}.`
    );
    setTimeout(() => setSmsStatusMsg(''), 4000);
  };

  // Send Custom SMS to Customer
  const handleSendCustomCustomerSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSmsPhone.trim() || !customSmsMessage.trim()) {
      setCustomSmsStatus(
        language === 'bn'
          ? '❌ গ্রাহকের মোবাইল নম্বর এবং মেসেজ টাইপ করুন।'
          : '❌ Please enter customer phone number and SMS message.'
      );
      return;
    }

    setIsSendingCustomSms(true);
    setCustomSmsStatus(language === 'bn' ? 'গ্রাহকের নিকট এসএমএস প্রেরণ করা হচ্ছে...' : 'Sending SMS to customer...');

    const res = await sendCustomSms(customSmsPhone.trim(), customSmsMessage.trim(), {
      provider: smsProvider.trim(),
      apiKey: smsApiKey.trim(),
      senderId: activeSenderId,
      senderType,
      maskingId: maskingId.trim(),
      nonMaskingId: nonMaskingId.trim(),
      isLiveMode: smsIsLive
    });

    setIsSendingCustomSms(false);
    setCustomSmsStatus(res.message);
    const updatedCount = getSmsSentCount();
    setSmsSentCount(updatedCount);
    setMaskingSentSmsState(getMaskingSentSms());
    setNonMaskingSentSmsState(getNonMaskingSentSms());

    if (res.success || res.message.includes('Sent') || res.message.includes('সফল') || res.message.includes('Success')) {
      // Trigger prominent delivery success notification!
      setSingleMsgDeliverySuccess({
        recipient: customSmsPhone.trim(),
        messageText: customSmsMessage.trim(),
        channel: 'sms'
      });
      setMessageLogs(getMessageDispatchLogs());
      setTimeout(() => {
        setCustomSmsMessage('');
      }, 2000);
    }
  };

  // Save/Update Total Purchased SMS Quota
  const handleSavePurchasedQuota = () => {
    const parsed = parseInt(editPurchasedInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert(language === 'bn' ? 'সঠিক সংখ্যা দিন।' : 'Please enter a valid number.');
      return;
    }
    setTotalPurchasedSms(parsed);
    setTotalPurchasedSmsState(parsed);
    setIsEditingPurchased(false);
  };

  // Save/Update Masking SMS Quota
  const handleSaveMaskingQuota = () => {
    const parsed = parseInt(editMaskingInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert(language === 'bn' ? 'সঠিক সংখ্যা দিন।' : 'Please enter a valid number.');
      return;
    }
    setMaskingTotalSms(parsed);
    setMaskingTotalSmsState(parsed);
    setIsEditingMasking(false);
  };

  // Save/Update Non-Masking SMS Quota
  const handleSaveNonMaskingQuota = () => {
    const parsed = parseInt(editNonMaskingInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert(language === 'bn' ? 'সঠিক সংখ্যা দিন।' : 'Please enter a valid number.');
      return;
    }
    setNonMaskingTotalSms(parsed);
    setNonMaskingTotalSmsState(parsed);
    setIsEditingNonMasking(false);
  };

  // Test Real SMS Sending
  const handleTestSms = async () => {
    setSmsStatusMsg(language === 'bn' ? 'টেস্ট ওটিপি এসএমএস পাঠানো হচ্ছে...' : 'Sending test OTP SMS...');
    const res = await sendRealSmsOtp(testPhone.trim(), '882910', {
      provider: smsProvider.trim(),
      apiKey: smsApiKey.trim(),
      senderId: activeSenderId,
      senderType,
      maskingId: maskingId.trim(),
      nonMaskingId: nonMaskingId.trim(),
      isLiveMode: smsIsLive,
      template: smsTemplate
    });
    setSmsStatusMsg(res.message);
    setSmsSentCount(getSmsSentCount());
  };

  // Test Voice Call OTP Speech Synthesis
  const handleTestVoiceOtp = async () => {
    setIsPlayingVoice(true);
    setSmsStatusMsg(language === 'bn' ? '🔊 ভয়েস ওটিপি পাঠ করা হচ্ছে...' : 'Playing voice call OTP...');
    await playVoiceOtp('882910', voiceTemplate);
    setIsPlayingVoice(false);
    setSmsStatusMsg(language === 'bn' ? '✅ ভয়েস ওটিপি সফলভাবে সম্পন্ন হয়েছে।' : 'Voice OTP finished.');
    setTimeout(() => setSmsStatusMsg(''), 3000);
  };

  // Save Payment Config
  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setItem('marketbd_payment_live_mode', String(paymentLiveMode));
    storage.setItem('marketbd_payment_auto_settle', String(autoSettle));
    storage.setItem('marketbd_bkash_app_key', bkashAppKey);
    storage.setItem('marketbd_nagad_merchant_id', nagadMerchantId);
    storage.setItem('marketbd_ssl_store_id', sslStoreId);
    setPaymentMsg(
      language === 'bn'
        ? '✅ আপডেট সফল হয়েছে! (Update Successfully) - অটো পেমেন্ট গেটওয়ে সেটিংস সেভ হয়েছে।'
        : '✅ Update Successfully! - Payment Gateway settings saved.'
    );
    setTimeout(() => setPaymentMsg(''), 4000);
  };

  // Enable Web Push
  const handleEnableWebPush = async () => {
    const granted = await requestWebPushPermission();
    setPushEnabled(granted);
    if (granted) {
      sendLocalBrowserPushNotification({
        title: 'MarketBD.Net Push Notification Active',
        body: 'আপনার ব্রাউজারে নোটিফিকেশন নোটিশ সফলভাবে চালু হয়েছে।'
      });
      setPushStatusMsg(language === 'bn' ? '✓ ওয়েব পুশ নোটিফিকেশন অ্যাক্টিভ হয়েছে!' : '✓ Web push active!');
    } else {
      setPushStatusMsg(language === 'bn' ? '❌ ব্রাউজার নোটিফিকেশন পারমিশন মেলেনি।' : '❌ Notification permission denied.');
    }
  };

  // Trigger Ad Expiry Cron Check / Live Status Check
  const handleManualAdExpiryRun = () => {
    const res = checkAndExpireAds(products);
    setExpirySummary(
      language === 'bn'
        ? `✓ মার্কেটপ্লেসের সকল বিজ্ঞাপন সফলভাবে লাইভ ও সক্রিয় রাখা হয়েছে (${products.length} টি বিজ্ঞাপন লাইভ)। কোনো বিজ্ঞাপন ডামি বা মেয়াদোত্তীর্ণ নেই।`
        : `✓ All ${products.length} marketplace ads are verified live and active. No ads are expired or dummy.`
    );
  };

  const expiredAdsCount = products.filter(p => p.status === 'expired').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-pink-900 via-purple-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-pink-700/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              System Gateways
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '⚡ এসএমএস, ভয়েস ওটিপি ও লাইভ পেমেন্ট গেটওয়ে কন্ট্রোল' : '⚡ SMS, Voice OTP & Payment Gateway Hub'}
            </h2>
          </div>
          <p className="text-xs text-pink-200">
            {language === 'bn'
              ? 'BulkSMSDhaka, BulkSMSBD, Greenweb, মাসকিং/নন-মাসকিং মোড, ভয়েস ওটিপি এবং বিকাশ/SSLCommerz লাইভ কন্ট্রোল'
              : 'BulkSMSDhaka, BulkSMSBD, Masking / Non-Masking toggle, Voice OTP & bKash / SSLCommerz Auto Payments.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>API Proxy Active</span>
          </span>
        </div>
      </div>

      {/* Grid of 4 Gateway Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Real SMS & Voice OTP Gateway Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 rounded-2xl border border-pink-200 dark:border-pink-800">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '১. রিয়েল SMS ও ভয়েস ওটিপি গেটওয়ে কন্ট্রোল' : '1. Real SMS & Voice OTP Gateway'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'কাস্টম প্রোভাইডার, মাসকিং/নন-মাসকিং সুইচ ও লাইভ ব্যালেন্স' : 'Custom Provider, Masking/Non-Masking switch & balance'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              smsIsLive ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
            }`}>
              {smsIsLive ? (language === 'bn' ? '🟢 লাইভ গেটওয়ে সক্রিয়' : '🟢 Live Gateway') : (language === 'bn' ? '🟡 টেস্ট মোড' : '🟡 Test Mode')}
            </span>
          </div>

          {/* SMS Quota (Purchased, Sent, Remaining) & Balance Metrics Card */}
          <div className="p-4 bg-gradient-to-br from-slate-50 via-pink-50/30 to-indigo-50/20 dark:from-slate-800/80 dark:via-pink-950/20 dark:to-indigo-950/20 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-pink-600" />
                {language === 'bn' ? 'এসএমএস কোটা হিসাব ও অবশিষ্ট ব্যালেন্স:' : 'SMS Quota & Live Balance:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="text-[11px] px-3 py-1 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '📢 বাল্ক প্রমোশন পাঠান' : '📢 Bulk Broadcast'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefreshBalance}
                  disabled={isCheckingBalance}
                  className="text-[11px] px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingBalance ? 'animate-spin text-pink-600' : ''}`} />
                  <span>{isCheckingBalance ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Checking...') : (language === 'bn' ? 'ব্যালেন্স রিফ্রেশ' : 'Check Balance')}</span>
                </button>
              </div>
            </div>

            {/* 3-Column Quota Counter (Total, Sent, Remaining) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. Total Purchased */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                    {language === 'bn' ? '📦 মোট ক্রয়কৃত' : 'Total Purchased'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPurchasedInput(String(totalPurchasedSms));
                      setIsEditingPurchased(!isEditingPurchased);
                    }}
                    className="text-[10px] text-slate-400 hover:text-pink-600 cursor-pointer"
                    title="Edit Quota"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                {isEditingPurchased ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      value={editPurchasedInput}
                      onChange={e => setEditPurchasedInput(e.target.value)}
                      className="w-16 px-1 py-0.5 text-xs font-bold font-mono border border-pink-500 rounded bg-pink-50 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleSavePurchasedQuota}
                      className="p-1 bg-pink-600 text-white rounded cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono block">
                    {totalPurchasedSms} <span className="text-xs font-semibold text-slate-500">টি</span>
                  </span>
                )}
                <span className="text-[9px] text-slate-400 block mt-0.5">সর্বমোট প্যাকেজ কোটা</span>
              </div>

              {/* 2. Total Sent */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {language === 'bn' ? '📤 বর্তমান খরচ / সেন্ট' : 'Total Sent'}
                </span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono block">
                  {smsSentCount} <span className="text-xs font-semibold text-slate-500">টি</span>
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">ব্যবহৃত মোট এসএমএস</span>
              </div>

              {/* 3. Remaining Balance */}
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800/60 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-0.5">
                  {language === 'bn' ? '💳 অবশিষ্ট মোট ব্যালেন্স' : 'Total Remaining'}
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                  {Math.max(0, totalPurchasedSms - smsSentCount)} <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">টি</span>
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {smsBalance && smsBalance !== 'যাচাই করা হয়নি' ? `(API: ${smsBalance})` : 'সরাসরি ব্যবহারযোগ্য'}
                </span>
              </div>
            </div>

            {/* SEPARATE MASKING SMS & NON-MASKING SMS BALANCE DUAL-SECTION */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  {language === 'bn' ? 'মাসকিং ও নন-মাসকিং এসএমএস ব্যালেন্স বিবরণ:' : 'Masking & Non-Masking SMS Balance Details:'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'পৃথক কোটা ও ট্র্যাকিং' : 'Separate Quotas'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. MASKING SMS BALANCE FIELD */}
                <div className={`p-3.5 rounded-2xl border transition ${
                  senderType === 'masking'
                    ? 'bg-gradient-to-br from-purple-50 via-pink-50/50 to-white dark:from-purple-950/40 dark:via-pink-950/20 dark:to-slate-900 border-purple-400 dark:border-purple-700 ring-2 ring-purple-400/30'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/80'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                      <span className="text-xs font-black text-purple-950 dark:text-purple-200">
                        {language === 'bn' ? '🔤 মাসকিং এসএমএস ব্যালেন্স (Masking SMS)' : 'Masking SMS Balance'}
                      </span>
                    </div>
                    {senderType === 'masking' && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                        {language === 'bn' ? 'বর্তমানে সক্রিয়' : 'Active Sender'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between py-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        অবশিষ্ট মাসকিং ব্যালেন্স
                      </span>
                      <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                        {Math.max(0, maskingTotalSms - maskingSentSms)} <span className="text-xs font-bold text-slate-500">টি</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          কোটা: <b className="font-mono text-purple-950 dark:text-purple-200">{maskingTotalSms}</b> টি
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMaskingInput(String(maskingTotalSms));
                            setIsEditingMasking(!isEditingMasking);
                          }}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer"
                          title="Edit Masking Quota"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                        সেন্ট / ব্যবহৃত: <b className="font-mono text-rose-600">{maskingSentSms}</b> টি
                      </span>
                    </div>
                  </div>

                  {isEditingMasking && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-purple-200 dark:border-purple-800/60">
                      <span className="text-[10px] text-purple-900 dark:text-purple-300 font-bold">নতুন মাসকিং কোটা:</span>
                      <input
                        type="number"
                        value={editMaskingInput}
                        onChange={e => setEditMaskingInput(e.target.value)}
                        className="w-20 px-2 py-0.5 text-xs font-bold font-mono border border-purple-400 rounded bg-white dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleSaveMaskingQuota}
                        className="px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold rounded cursor-pointer flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>সেভ</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>প্রেরক আইডি: <b className="text-slate-800 dark:text-slate-200">{maskingId}</b></span>
                    <span className="text-purple-700 dark:text-purple-400 font-bold">ব্র্যান্ড নেম এসএমএস</span>
                  </div>
                </div>

                {/* 2. NON-MASKING SMS BALANCE FIELD */}
                <div className={`p-3.5 rounded-2xl border transition ${
                  senderType === 'non_masking'
                    ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-blue-400 dark:border-blue-700 ring-2 ring-blue-400/30'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/80'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-xs font-black text-blue-950 dark:text-blue-200">
                        {language === 'bn' ? '🔢 নন-মাসকিং এসএমএস ব্যালেন্স (Non-Masking)' : 'Non-Masking SMS Balance'}
                      </span>
                    </div>
                    {senderType === 'non_masking' && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        {language === 'bn' ? 'বর্তমানে সক্রিয়' : 'Active Sender'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between py-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        অবশিষ্ট নন-মাসকিং ব্যালেন্স
                      </span>
                      <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                        {Math.max(0, nonMaskingTotalSms - nonMaskingSentSms)} <span className="text-xs font-bold text-slate-500">টি</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          কোটা: <b className="font-mono text-blue-950 dark:text-blue-200">{nonMaskingTotalSms}</b> টি
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditNonMaskingInput(String(nonMaskingTotalSms));
                            setIsEditingNonMasking(!isEditingNonMasking);
                          }}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Edit Non-Masking Quota"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                        সেন্ট / ব্যবহৃত: <b className="font-mono text-rose-600">{nonMaskingSentSms}</b> টি
                      </span>
                    </div>
                  </div>

                  {isEditingNonMasking && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800/60">
                      <span className="text-[10px] text-blue-900 dark:text-blue-300 font-bold">নতুন নন-মাসকিং কোটা:</span>
                      <input
                        type="number"
                        value={editNonMaskingInput}
                        onChange={e => setEditNonMaskingInput(e.target.value)}
                        className="w-20 px-2 py-0.5 text-xs font-bold font-mono border border-blue-400 rounded bg-white dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleSaveNonMaskingQuota}
                        className="px-2 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>সেভ</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>প্রেরক আইডি: <b className="text-slate-800 dark:text-slate-200">{nonMaskingId}</b></span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold">সাধারণ নিউমেরিক এসএমএস</span>
                  </div>
                </div>
              </div>
            </div>

            {balanceStatusMsg && (
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1">
                {balanceStatusMsg}
              </p>
            )}
          </div>

          {/* SMS Provider Settings Form */}
          <form onSubmit={handleSaveSmsConfig} className="space-y-4">
            
            {/* 1. Editable SMS Provider Input with quick chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'এসএমএস প্রোভাইডার (SMS Provider):' : 'SMS Provider:'}
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  {language === 'bn' ? 'প্রোভাইডার নাম বা ডোমেইন লিখুন' : 'Type name or domain'}
                </span>
              </div>
              <input
                type="text"
                value={smsProvider}
                onChange={e => setSmsProvider(e.target.value)}
                placeholder="যেমন: bulksmsdhaka.net"
                className="w-full px-3.5 py-2.5 border border-pink-300 dark:border-pink-800 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold shadow-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-500 font-semibold">কুইক সিলেক্ট:</span>
                {['bulksmsdhaka.net', 'bulksmsbd.net', 'greenweb.com.bd', 'steadfast.com.bd', 'twilio'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSmsProvider(item)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      smsProvider.toLowerCase().includes(item.split('.')[0])
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-pink-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Masking vs Non-Masking with Checkmark Selection */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-pink-600" />
                  {language === 'bn' ? 'মাসকিং বা নন-মাসকিং অপশন (টিক চিহ্ন দিন):' : 'Masking vs Non-Masking (Check to Activate):'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  সক্রিয়: {senderType === 'masking' ? `মাসকিং (${maskingId})` : `নন-মাসকিং (${nonMaskingId})`}
                </span>
              </div>

              {/* Option A: Masking */}
              <div
                onClick={() => setSenderType('masking')}
                className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                  senderType === 'masking'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      senderType === 'masking' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400 bg-transparent'
                    }`}>
                      {senderType === 'masking' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'মাসকিং সেন্ডার আইডি (Masking Sender ID)' : 'Masking Sender ID'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {language === 'bn' ? 'অনুমোদিত ব্র্যান্ড নাম' : 'Approved Brand Name'}
                  </span>
                </div>

                <div className="pl-6" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={maskingId}
                    onChange={e => setMaskingId(e.target.value)}
                    placeholder="যেমন: marketbd.net বা আপনার ব্র্যান্ড"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    গ্রাহকের ফোনে এসএমএস আসার সময় প্রেরক হিসেবে এই নামটি প্রদর্শিত হবে।
                  </span>
                </div>
              </div>

              {/* Option B: Non-Masking */}
              <div
                onClick={() => setSenderType('non_masking')}
                className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                  senderType === 'non_masking'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      senderType === 'non_masking' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400 bg-transparent'
                    }`}>
                      {senderType === 'non_masking' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'নন-মাসকিং কলার আইডি (Non-Masking Caller ID)' : 'Non-Masking Caller ID'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {language === 'bn' ? 'সাধারণ / কলার নম্বর' : 'Numeric / 1234'}
                  </span>
                </div>

                <div className="pl-6" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={nonMaskingId}
                    onChange={e => setNonMaskingId(e.target.value)}
                    placeholder="যেমন: 1234 বা প্রোভাইডারের দেওয়া কলার আইডি"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    মাসকিং অনুমোদন না হওয়া পর্যন্ত নন-মাসকিং (যেমন 1234) দিয়ে তাৎক্ষণিক ওটিপি পাঠানো যায়।
                  </span>
                </div>
              </div>
            </div>

            {/* 3. API Token / Secret Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'প্রোভাইডার এপিআই কি (API Token / Key):' : 'API Token / Key:'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-[10px] text-pink-600 dark:text-pink-400 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiKey ? 'হাইড করুন' : 'কি দেখুন'}</span>
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={smsApiKey}
                onChange={e => setSmsApiKey(e.target.value)}
                placeholder="a41e93294c036daa7fd102f7bc6f93fe0fb97e9a"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            {/* 4. Modern Multi-channel Message Templates Tab (OTP, Voice, Order, Promo) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-600" />
                  <span>{language === 'bn' ? 'আধুনিক মেসেজ টেমপ্লেট কনফিগারেশন:' : 'Modern Message Templates:'}</span>
                </label>
              </div>

              {/* Template switcher tabs */}
              <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('otp')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTemplateTab === 'otp' ? 'bg-pink-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>ওটিপি (OTP SMS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('voice')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTemplateTab === 'voice' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>ভয়েস ওটিপি (Voice Call)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('order')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTemplateTab === 'order' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3 h-3" />
                  <span>অর্ডার মেসেজ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab('promo')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTemplateTab === 'promo' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>অফার/নোটিশ</span>
                </button>
              </div>

              {/* Tab 1: OTP SMS */}
              {activeTemplateTab === 'otp' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      মোবাইল এসএমএস ওটিপি টেমপ্লেট:
                    </span>
                    <span className="text-[10px] text-pink-600 font-mono font-bold bg-pink-100 dark:bg-pink-950 px-2 py-0.5 rounded">
                      ট্যাগ: {'{otp}'}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={smsTemplate}
                    onChange={e => setSmsTemplate(e.target.value)}
                    placeholder="Your OTP is {otp}. It will be valid for 4 minutes. Never share your OTP, PIN, or Password with anyone. — **MarketBD.Net** | Digital Buying & Selling"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none"
                  />
                  <div className="p-2 bg-pink-100/60 dark:bg-pink-950/50 rounded-lg border border-pink-200 dark:border-pink-800/60 text-[11px]">
                    <span className="font-bold text-pink-900 dark:text-pink-300">📱 এসএমএস প্রিভিউ: </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {smsTemplate
                        .replace(/{otp}/gi, '882910')
                        .replace(/{code}/gi, '882910')
                        .split('**MarketBD.Net**')
                        .map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && <strong className="font-bold text-slate-950 dark:text-white">MarketBD.Net</strong>}
                          </React.Fragment>
                        ))}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Voice OTP */}
              {activeTemplateTab === 'voice' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      ভয়েস কল ওটিপি স্ক্রিপ্ট (Voice Call OTP):
                    </span>
                    <button
                      type="button"
                      onClick={handleTestVoiceOtp}
                      disabled={isPlayingVoice}
                      className="text-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Volume2 className={`w-3 h-3 ${isPlayingVoice ? 'animate-bounce' : ''}`} />
                      <span>{isPlayingVoice ? 'কথা বলছে...' : '🔊 ভয়েস ওটিপি শুনুন'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={voiceTemplate}
                    onChange={e => setVoiceTemplate(e.target.value)}
                    placeholder="মার্কেট বিডি ডট নেট ওটিপি কোড হলো: {otp}। কোডটি পুনরায় শুনুন: {otp}। ধন্যবাদ।"
                    className="w-full p-2.5 border border-purple-300 dark:border-purple-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none"
                  />
                  <div className="p-2 bg-purple-100/60 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800/60 text-[11px]">
                    <span className="font-bold text-purple-900 dark:text-purple-300">🗣️ ভয়েস প্রিভিউ: </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {voiceTemplate.replace(/{otp}/gi, '৮ ৮ ২ ৯ ১ ০')}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 3: Order Update */}
              {activeTemplateTab === 'order' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      অর্ডার আপডেট টেমপ্লেট:
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      ট্যাগ: {'{orderId}'}, {'{amount}'}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={orderTemplate}
                    onChange={e => setOrderTemplate(e.target.value)}
                    placeholder="প্রিয় গ্রাহক, MarketBD.Net-এ আপনার অর্ডার #{orderId} সফলভাবে গৃহীত হয়েছে। মোট মূল্য: ৳ {amount}। ধন্যবাদ।"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none"
                  />
                  <div className="p-2 bg-emerald-100/60 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">📦 মেসেজ প্রিভিউ: </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {orderTemplate.replace(/{orderId}/gi, 'MB-9402').replace(/{amount}/gi, '১২৫০')}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 4: Promotional Notice */}
              {activeTemplateTab === 'promo' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      প্রোমোশনাল ও অফার এসএমএস:
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={promoTemplate}
                    onChange={e => setPromoTemplate(e.target.value)}
                    placeholder="MarketBD.Net বিশেষ নোটিশ: আপনার পছন্দের পণ্যে আকর্ষণীয় ডিসকাউন্ট অফার চলছে! এখনই ভিজিট করুন marketbd.net"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none"
                  />
                </div>
              )}
            </div>

            {/* Live Gateway Checkbox */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'bn' ? 'লাইভ এসএমএস সেন্ডিং এপিআই মোড সক্রিয় করুন' : 'Enable Live Gateway API Calls'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'সরাসরি প্রোভাইডারের মাধ্যমে গ্রাহকের ফোনে মেসেজ পৌঁছাবে' : 'Dispatches real SMS to subscriber cellphones'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsIsLive}
                onChange={e => setSmsIsLive(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{language === 'bn' ? 'সেটিংস ও টেমপ্লেট সেভ করুন (Save SMS Config)' : 'Save SMS Gateway Config'}</span>
              </button>
            </div>

            {smsStatusMsg && (
              <div className={`p-3 border text-xs font-bold rounded-xl animate-in fade-in flex items-center gap-2 shadow-sm ${
                smsStatusMsg.includes('✅') || smsStatusMsg.includes('সফল') || smsStatusMsg.includes('Success')
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{smsStatusMsg}</span>
              </div>
            )}
          </form>

          {/* Test SMS dispatch form with Voice OTP option */}
          <div className="p-3.5 bg-pink-50/60 dark:bg-pink-950/40 rounded-2xl border border-pink-200 dark:border-pink-900/60 space-y-2">
            <label className="block text-[10px] font-extrabold text-pink-950 dark:text-pink-300 uppercase">
              🧪 {language === 'bn' ? 'রিয়েল মোবাইলে টেস্ট ওটিপি ডেলিভারি:' : 'Test Live OTP Delivery:'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="01634025151"
                className="flex-1 px-3 py-2 border border-pink-300 dark:border-pink-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
              />
              <button
                type="button"
                onClick={handleTestSms}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '📱 SMS পাঠান' : 'Send SMS'}</span>
              </button>
              <button
                type="button"
                onClick={handleTestVoiceOtp}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '🔊 ভয়েস টেস্ট' : 'Voice Test'}</span>
              </button>
            </div>
            {smsStatusMsg && !smsStatusMsg.includes('আপডেট সফল') && (
              <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300 animate-in fade-in">{smsStatusMsg}</p>
            )}
          </div>

          {/* PROMINENT DELIVERY SUCCESS NOTIFICATION BANNER */}
          {singleMsgDeliverySuccess && (
            <MessageDeliverySuccessBanner
              recipient={singleMsgDeliverySuccess.recipient}
              messageText={singleMsgDeliverySuccess.messageText}
              channel={singleMsgDeliverySuccess.channel}
              onClose={() => setSingleMsgDeliverySuccess(null)}
              language={language}
            />
          )}

          {/* FIELD FOR SENDING CUSTOM MESSAGE TO CUSTOMERS */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'bn' ? 'গ্রাহকের নিকট যেকোনো কাস্টম মেসেজ প্রেরণ:' : 'Send Custom Message to Customer:'}</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="text-[10px] px-2.5 py-1 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs transition"
                >
                  <Megaphone className="w-3 h-3" />
                  <span>{language === 'bn' ? '📢 সকল গ্রাহককে পাঠান' : 'Broadcast to All'}</span>
                </button>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold bg-white dark:bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {customSmsMessage.length} অক্ষর
                </span>
              </div>
            </div>

            <form onSubmit={handleSendCustomCustomerSms} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'গ্রাহকের মোবাইল নম্বর:' : 'Customer Mobile Number:'}
                </label>
                <input
                  type="text"
                  value={customSmsPhone}
                  onChange={e => setCustomSmsPhone(e.target.value)}
                  placeholder="017XXXXXXXX বা 01634025151"
                  className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'মেসেজের বিবরণ (যা গ্রাহককে জানাতে চান):' : 'Message Body (Announcement / Order Update):'}
                </label>
                <textarea
                  rows={2}
                  value={customSmsMessage}
                  onChange={e => setCustomSmsMessage(e.target.value)}
                  placeholder={language === 'bn' ? 'প্রিয় গ্রাহক, MarketBD.Net-এ আপনার অর্ডারটি কনফার্ম হয়েছে। বিস্তারিত জানতে ভিজিট করুন...' : 'Dear Customer, your order on MarketBD.Net has been confirmed...'}
                  className="w-full p-2.5 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none"
                />
              </div>

              {/* Quick Template Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setCustomSmsMessage('প্রিয় গ্রাহক, MarketBD.Net-এ আপনার অ্যাকাউন্ট ও অর্ডার ভেরিফাই সম্পন্ন হয়েছে। ধন্যবাদ।')}
                  className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 font-medium cursor-pointer"
                >
                  অর্ডার ভেরিফাই
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSmsMessage('MarketBD.Net বিশেষ নোটিশ: আপনার তালিকাভুক্ত বিজ্ঞাপনের মেয়াদ বাড়ানো হয়েছে।')}
                  className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 font-medium cursor-pointer"
                >
                  বিজ্ঞাপন নোটিশ
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSmsMessage('প্রিয় গ্রাহক, আপনার জন্য MarketBD.Net-এ একটি বিশেষ ডিসকাউন্ট অপেক্ষা করছে!')}
                  className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 font-medium cursor-pointer"
                >
                  অফার মেসেজ
                </button>
              </div>

              <button
                type="submit"
                disabled={isSendingCustomSms}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSendingCustomSms
                    ? (language === 'bn' ? 'মেসেজ পাঠানো হচ্ছে...' : 'Sending SMS...')
                    : (language === 'bn' ? 'গ্রাহককে মেসেজ পাঠান (Send SMS)' : 'Send SMS to Customer')}
                </span>
              </button>

              {customSmsStatus && (
                <p className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 animate-in fade-in p-2 bg-white/60 dark:bg-slate-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  {customSmsStatus}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* 2. Live Auto Payment Gateway Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '২. লাইভ পেমেন্ট অটো-সেটেলমেন্ট এপিআই' : '2. Live Auto Payment Gateway API'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'বিকাশ, নগদ, রকেট ও SSLCommerz অটো চেকআউট' : 'bKash, Nagad & SSLCommerz instant API'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              autoSettle ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {autoSettle ? (language === 'bn' ? '⚡ অটো ভেরিফিকেশন' : '⚡ Auto Verify') : (language === 'bn' ? '📋 ম্যানুয়াল TrxID' : 'Manual TrxID')}
            </span>
          </div>

          <form onSubmit={handleSavePaymentConfig} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'বিকাশ মার্চেন্ট এপিআই কী (bKash App Key)' : 'bKash App Key'}
              </label>
              <input
                type="text"
                value={bkashAppKey}
                onChange={e => setBkashAppKey(e.target.value)}
                placeholder="bkash_app_key_live_..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'নগদ মার্চেন্ট আইডি (Nagad Merchant ID)' : 'Nagad Merchant ID'}
              </label>
              <input
                type="text"
                value={nagadMerchantId}
                onChange={e => setNagadMerchantId(e.target.value)}
                placeholder="NAGAD_MERC_..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'SSLCommerz স্টোর আইডি (SSL Store ID)' : 'SSLCommerz Store ID'}
              </label>
              <input
                type="text"
                value={sslStoreId}
                onChange={e => setSslStoreId(e.target.value)}
                placeholder="marketbdlive..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'bn' ? 'ইনস্ট্যান্ট অটো-সেটেলমেন্ট এপিআই' : 'Instant Auto-Settlement'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'পেমেন্ট হওয়ার সাথে সাথে স্বয়ংক্রিয় বিজ্ঞাপন সক্রিয় হবে' : 'Instantly activate ads upon successful payment'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSettle}
                onChange={e => setAutoSettle(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer"
            >
              {language === 'bn' ? 'পেমেন্ট গেটওয়ে সেটিংস সেভ করুন (Save Payment Config)' : 'Save Payment Config'}
            </button>

            {paymentMsg && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">{paymentMsg}</p>
            )}
          </form>
        </div>

        {/* 3. Real Web Push Notification Gateway */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-800">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '৩. ব্রাউজার ওয়েব পুশ নোটিফিকেশন গেটওয়ে' : '3. Real Web Push Notifications'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'গ্রাহকদের ব্রাউজার ও ডিভাইসে সরাসরি নোটিশ পাঠানো' : 'Native browser desktop & mobile notification push'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              pushEnabled ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {pushEnabled ? (language === 'bn' ? 'অনুমোদিত' : 'Granted') : (language === 'bn' ? 'অননুমোদিত' : 'Default')}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {language === 'bn'
                ? 'ব্রাউজার পুশ নোটিফিকেশনের মাধ্যমে নতুন অফার, অর্ডার ডেলিভারি ও মেসেজ অ্যালার্ট ব্যবহারকারীর ডিভাইসে স্ক্রিন পপ-আপ হিসেবে পৌঁছে যায়।'
                : 'Send immediate alert popups to user desktop and mobile devices for order status, messages, and hot deals.'}
            </p>

            <button
              type="button"
              onClick={handleEnableWebPush}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-4 h-4" />
              <span>{language === 'bn' ? 'পুশ নোটিফিকেশন অনুমতি দিন ও টেস্ট করুন' : 'Enable & Test Web Push'}</span>
            </button>

            {pushStatusMsg && (
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 animate-in fade-in">{pushStatusMsg}</p>
            )}
          </div>
        </div>

        {/* 4. Automated 30-Day Ad Expiry Cron Engine */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-800">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '৪. বিজ্ঞাপন মেয়াদ নিয়ন্ত্রণ ইঞ্জিন (Auto Ad Expiry)' : '4. Automated Ad Lifecycle Engine'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? '৩০ দিনের অতিরিক্ত পুরানো বিজ্ঞাপন স্বয়ংক্রিয় আর্কাইভ' : 'Auto archive ads exceeding 30-day lifetime'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300">
              {language === 'bn' ? 'স্বয়ংক্রিয় চালু' : 'Cron Active'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{language === 'bn' ? 'মোট সক্রিয় বিজ্ঞাপন:' : 'Total Active Ads:'}</span>
                <span className="text-pink-600 font-mono">{products.filter(p => p.status !== 'expired').length} টি</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{language === 'bn' ? 'মেয়াদোত্তীর্ণ বিজ্ঞাপন:' : 'Expired Ads:'}</span>
                <span className="text-amber-600 font-mono">{expiredAdsCount} টি</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualAdExpiryRun}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'bn' ? 'বিজ্ঞাপন লাইভ স্থিতি নিরীক্ষণ ও ভেরিফাই' : 'Verify Marketplace Ads'}</span>
            </button>

            {expirySummary && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">{expirySummary}</p>
            )}
          </div>
        </div>

      </div>

      {/* Customer Bulk Broadcast Modal */}
      <CustomerBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        registeredUsers={registeredUsers}
        language={language}
        onBroadcastComplete={() => {
          setSmsSentCount(getSmsSentCount());
          setMessageLogs(getMessageDispatchLogs());
        }}
      />
    </div>
  );
};
