import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { sendRealSmsOtp } from '../../services/smsService';
import { requestWebPushPermission, sendLocalBrowserPushNotification } from '../../services/pushNotificationService';
import { checkAndExpireAds } from '../../utils/adExpiryEngine';

import { storage } from '../../utils/storage';

export const GatewaysAdminPanel: React.FC = () => {
  const { language, products, renewAd } = useMarket();

  // SMS Gateway Config State
  const [smsProvider, setSmsProvider] = useState<'greenweb' | 'bulksmsbd' | 'steadfast' | 'twilio'>(
    (storage.getItem('marketbd_sms_provider') as any) || 'greenweb'
  );
  const [smsApiKey, setSmsApiKey] = useState(storage.getItem('marketbd_sms_api_key') || '');
  const [smsSenderId, setSmsSenderId] = useState(storage.getItem('marketbd_sms_sender_id') || 'MarketBD');
  const [smsIsLive, setSmsIsLive] = useState(storage.getItem('marketbd_live_mode') !== 'false');
  const [testPhone, setTestPhone] = useState('01723230230');
  const [smsStatusMsg, setSmsStatusMsg] = useState('');

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
    storage.setItem('marketbd_sms_provider', smsProvider);
    storage.setItem('marketbd_sms_api_key', smsApiKey);
    storage.setItem('marketbd_sms_sender_id', smsSenderId);
    storage.setItem('marketbd_live_mode', String(smsIsLive));
    setSmsStatusMsg(
      language === 'bn'
        ? '✅ আপডেট সফল হয়েছে! (Update Successfully) - এসএমএস গেটওয়ে কনফিগারেশন সংরক্ষিত হয়েছে।'
        : '✅ Update Successfully! - SMS Gateway config saved.'
    );
    setTimeout(() => setSmsStatusMsg(''), 4000);
  };

  // Test SMS Sending
  const handleTestSms = async () => {
    setSmsStatusMsg(language === 'bn' ? 'এসএমএস পাঠানো হচ্ছে...' : 'Sending test SMS...');
    const res = await sendRealSmsOtp(testPhone, '882910', {
      provider: smsProvider,
      apiKey: smsApiKey,
      senderId: smsSenderId,
      isLiveMode: smsIsLive
    });
    setSmsStatusMsg(res.message);
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

  // Trigger Ad Expiry Cron Check
  const handleManualAdExpiryRun = () => {
    const res = checkAndExpireAds(products);
    setExpirySummary(
      language === 'bn'
        ? `✓ ম্যানুয়াল ক্রন জব সম্পন্ন: ${res.expiredCount} টি বিজ্ঞাপন ৩০ দিন মেয়াদ শেষ হওয়ায় অটো-এক্সপায়ার করা হয়েছে।`
        : `✓ Manual cron executed: ${res.expiredCount} ads expired automatically.`
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
              {language === 'bn' ? '⚡ এসএমএস, লাইভ পেমেন্ট ও পুশ গেটওয়ে কন্ট্রোল' : '⚡ SMS, Auto Payment & Push Gateway Hub'}
            </h2>
          </div>
          <p className="text-xs text-pink-200">
            {language === 'bn'
              ? 'গ্রিনওয়েব / টুইলিও এসএমএস ওটিপি, বিকাশ/SSLCommerz অটো পেমেন্ট এবং ৩০-দিনের অ্যাড এক্সপায়ারি ক্রন জব'
              : 'Configure Greenweb SMS OTP, bKash / SSLCommerz Auto Payments & 30-day Ad Expiry Engine.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>API Encryption Active</span>
          </span>
        </div>
      </div>

      {/* Grid of 4 Gateway Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Real SMS / OTP Gateway Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 rounded-2xl border border-pink-200 dark:border-pink-800">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '১. বাস্তব এসএমএস ওটিপি গেটওয়ে (Greenweb / Twilio / BulkSMS)' : '1. Real SMS OTP Gateway'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'রিয়েল সেলফোন এসএমএস ওটিপি প্রেরণের এপিআই সেটিংস' : 'SMS API provider credentials'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              smsIsLive ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
            }`}>
              {smsIsLive ? (language === 'bn' ? '🟢 লাইভ এসএমএস চালু' : '🟢 Live Mode') : (language === 'bn' ? '🟡 টেস্ট স্যান্ডবক্স মোড' : '🟡 Test Mode')}
            </span>
          </div>

          <form onSubmit={handleSaveSmsConfig} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'এসএমএস প্রোভাইডার' : 'SMS Provider'}
                </label>
                <select
                  value={smsProvider}
                  onChange={e => setSmsProvider(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="greenweb">Greenweb SMS Gateway (BD)</option>
                  <option value="bulksmsbd">BulkSMSBD.net (BD)</option>
                  <option value="steadfast">Steadfast SMS Portal (BD)</option>
                  <option value="twilio">Twilio Global SMS API</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'সেন্ডার আইডি (SenderID / Masking)' : 'Sender ID / Masking'}
                </label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  placeholder="MarketBD"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'প্রোভাইডার এপিআই কি (API Token / Secret Key)' : 'API Token / Key'}
              </label>
              <input
                type="password"
                value={smsApiKey}
                onChange={e => setSmsApiKey(e.target.value)}
                placeholder="Paste Greenweb / Twilio API Token..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'লাইভ এসএমএস সেন্ডিং এপিআই মোড সক্রিয় করুন' : 'Enable Live Gateway API Calls'}
              </span>
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
                <span>{language === 'bn' ? 'সেটিংস সেভ করুন (Save SMS Config)' : 'Save SMS Gateway Config'}</span>
              </button>
            </div>

            {smsStatusMsg && smsStatusMsg.includes('Update Successfully') && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-black rounded-xl animate-in fade-in flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{smsStatusMsg}</span>
              </div>
            )}
          </form>

          {/* Test SMS dispatch form */}
          <div className="p-3 bg-pink-50/60 dark:bg-pink-950/40 rounded-xl border border-pink-200 dark:border-pink-900/60 space-y-2">
            <label className="block text-[10px] font-extrabold text-pink-950 dark:text-pink-300 uppercase">
              🧪 {language === 'bn' ? 'এসএমএস গেটওয়ে টেস্ট করুন:' : 'Test SMS Delivery:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="01723230230"
                className="flex-1 px-3 py-1.5 border border-pink-300 dark:border-pink-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
              />
              <button
                type="button"
                onClick={handleTestSms}
                className="px-4 py-1.5 bg-pink-700 text-white font-bold rounded-lg text-xs hover:bg-pink-800 cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পাঠান' : 'Test Send'}</span>
              </button>
            </div>
            {smsStatusMsg && (
              <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300 animate-in fade-in">{smsStatusMsg}</p>
            )}
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
                SSLCommerz Store ID
              </label>
              <input
                type="text"
                value={sslStoreId}
                onChange={e => setSslStoreId(e.target.value)}
                placeholder="e.g. marketbd_live_001"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  bKash App Key
                </label>
                <input
                  type="text"
                  value={bkashAppKey}
                  onChange={e => setBkashAppKey(e.target.value)}
                  placeholder="bkash_key_123"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nagad Merchant ID
                </label>
                <input
                  type="text"
                  value={nagadMerchantId}
                  onChange={e => setNagadMerchantId(e.target.value)}
                  placeholder="6829102"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'ইনস্ট্যান্ট অটো-সেটেলমেন্ট এপ্রুভাল সক্রিয় করুন' : 'Instant Auto Payment Settlement'}
              </span>
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
              {language === 'bn' ? 'পেমেন্ট গেটওয়ে সেটিংস সেভ করুন' : 'Save Payment Config'}
            </button>
            {paymentMsg && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-black rounded-xl animate-in fade-in flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{paymentMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* 3. Web Push Notification Engine */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '৩. ব্রাউজার ও মোবাইল পুশ নোটিফিকেশন (Push / FCM)' : '3. Web Push & FCM Engine'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'ব্যাকগ্রাউন্ডে ইনস্ট্যান্ট নোটিফিকেশন এলার্ট' : 'Background desktop/mobile alerts'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              pushEnabled ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {pushEnabled ? (language === 'bn' ? '🔔 সক্রিয়' : '🔔 Enabled') : (language === 'bn' ? '🔕 নিষ্ক্রিয়' : '🔕 Disabled')}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'ক্রেতা ও বিক্রেতার মাঝে নতুন বার্তা, অ্যাড এপ্রুভাল বা রিনিউয়াল এলার্ট আসলে ব্রাউজার স্ক্রিনে সরাসরি পুশ নোটিফিকেশন নোটিশ প্রদর্শিত হবে।'
              : 'Delivers desktop notifications for new messages, ad approvals, and expiry renewal alerts.'}
          </p>

          <button
            type="button"
            onClick={handleEnableWebPush}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>{language === 'bn' ? 'ব্রাউজার পুশ নোটিফিকেশন চালু করুন' : 'Enable Web Push Notifications'}</span>
          </button>
          {pushStatusMsg && <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center">{pushStatusMsg}</p>}
        </div>

        {/* 4. Automated 30-Day Ad Expiry & Renewal Engine */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-800">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '৪. অটোমেটেড ৩০-দিনের অ্যাড এক্সপায়ারি ও রিনিউয়াল' : '4. Auto 30-Day Ad Expiry & Renewal'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? '৩০ দিন পুরোনো বিজ্ঞাপনের অটো-মেয়াদ শেষ ও রিনিউ ব্যবস্থা' : 'Auto cron job & renewal manager'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
              {language === 'bn' ? `মেয়াদোত্তীর্ণ: ${expiredAdsCount} টি` : `Expired: ${expiredAdsCount}`}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'bn'
              ? '৩০ দিন অতিক্রম করা সকল পুরোনো পোস্ট অটোমেটিক "মেয়াদোত্তীর্ণ (Expired)" হিসেবে চিহ্নিত হবে এবং বিক্রেতার কাছে ১-ক্লিক রিনিউ নোটিফিকেশন প্রেরিত হবে।'
              : 'Ads older than 30 days automatically mark as expired, giving sellers 1-click renewal option.'}
          </p>

          <button
            type="button"
            onClick={handleManualAdExpiryRun}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{language === 'bn' ? 'এখনই ক্রন জব চেক রান করুন' : 'Run Auto Expiry Cron Check Now'}</span>
          </button>
          {expirySummary && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200">
              {expirySummary}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
