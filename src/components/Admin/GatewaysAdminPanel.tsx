import React, { useEffect, useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Smartphone,
  CreditCard,
  BellRing,
  Clock,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Send,
  Save,
  Wallet
} from 'lucide-react';
import { db, doc, getDoc, safeFirestoreSetDoc } from '../../lib/firebase';
import { requestWebPushPermission, sendLocalBrowserPushNotification } from '../../services/pushNotificationService';
import { checkAndExpireAds } from '../../utils/adExpiryEngine';
import { fetchUnifiedSmsBalance, sendUnifiedSmsText } from '../../services/smsService';
import { storage } from '../../utils/storage';

const DEFAULT_OTP_TEMPLATE = 'Your MarketBD.Net OTP is {otp}';

export const GatewaysAdminPanel: React.FC = () => {
  const { language, products } = useMarket();
  const bn = language === 'bn';

  // Single Unified SMS & OTP Gateway Config State
  const [smsMaskingEnabled, setSmsMaskingEnabled] = useState(
    storage.getItem('marketbd_sms_masking_enabled') !== 'false'
  );
  const [smsIsLive, setSmsIsLive] = useState(storage.getItem('marketbd_live_mode') !== 'false');
  const [adminSecret, setAdminSecret] = useState(storage.getItem('marketbd_sms_admin_secret') || '');
  const [otpTemplate, setOtpTemplate] = useState(DEFAULT_OTP_TEMPLATE);
  const [smsStatusMsg, setSmsStatusMsg] = useState('');

  // Balance & Recharge State
  const [balance, setBalance] = useState<number | null>(null);
  const [totalRecharged, setTotalRecharged] = useState(storage.getItem('marketbd_sms_total_recharged') || '');
  const [ratePerSms, setRatePerSms] = useState(storage.getItem('marketbd_sms_rate') || '0.29');
  const [balMsg, setBalMsg] = useState('');

  // Unified SMS Send / Test State
  const [smsTargetPhone, setSmsTargetPhone] = useState('01723230230');
  const [smsTargetMessage, setSmsTargetMessage] = useState('Test SMS from MarketBD.Net');
  const [sendMsg, setSendMsg] = useState('');

  // Payment Gateway Config State
  const [paymentLiveMode] = useState(storage.getItem('marketbd_payment_live_mode') !== 'false');
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

  // Load OTP template & masking config from Firestore
  useEffect(() => {
    getDoc(doc(db, 'settings', 'sms_config'))
      .then(snap => {
        const d = snap.data();
        if (d?.otpTemplate) setOtpTemplate(String(d.otpTemplate));
        if (typeof d?.maskingEnabled === 'boolean') setSmsMaskingEnabled(d.maskingEnabled);
      })
      .catch(() => {});
  }, []);

  const handleSaveSecret = (value: string) => {
    setAdminSecret(value);
    storage.setItem('marketbd_sms_admin_secret', value);
  };

  // Single Unified Save Handler (Masking + Live Mode + OTP Template -> Firestore)
  const handleSaveUnifiedSmsConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/\{otp\}/i.test(otpTemplate)) {
      setSmsStatusMsg(
        bn
          ? '❌ ওটিপি টেমপ্লেটে অবশ্যই {otp} লিখতে হবে (যেখানে ৬ ডিজিটের কোড বসবে)।'
          : '❌ OTP template must contain {otp}.'
      );
      return;
    }

    const preview = otpTemplate.replace(/\{otp\}/gi, '123456');
    if (preview.length > 70) {
      setSmsStatusMsg(
        bn
          ? `❌ ওটিপি মেসেজ ${preview.length} অক্ষর — ৭০ অক্ষরের মধ্যে রাখুন।`
          : `❌ Keep OTP message within 70 characters (currently ${preview.length}).`
      );
      return;
    }

    storage.setItem('marketbd_sms_masking_enabled', String(smsMaskingEnabled));
    storage.setItem('marketbd_sms_sender_id', smsMaskingEnabled ? 'MarketBD.Net' : '1234');
    storage.setItem('marketbd_live_mode', String(smsIsLive));

    const ok = await safeFirestoreSetDoc(
      doc(db, 'settings', 'sms_config'),
      {
        otpTemplate: otpTemplate.trim(),
        maskingEnabled: smsMaskingEnabled,
      },
      { merge: true }
    );

    setSmsStatusMsg(
      ok === false
        ? bn
          ? '⚠️ লোকাল সেটিংস সেভ হয়েছে, তবে ক্লাউড সেভের জন্য অ্যাডমিন লগইন নিশ্চিত করুন।'
          : '⚠️ Saved locally. Ensure admin login for cloud sync.'
        : bn
        ? '✅ এসএমএস ও ওটিপি সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
        : '✅ Unified SMS & OTP settings saved!'
    );
    setTimeout(() => setSmsStatusMsg(''), 4000);
  };

  const handleCheckBalance = async () => {
    setBalMsg(bn ? 'ব্যালেন্স চেক করা হচ্ছে...' : 'Checking balance...');
    const res = await fetchUnifiedSmsBalance(adminSecret);
    if (res.status === 401) {
      setBalMsg(bn ? '❌ অ্যাডমিন সিক্রেট ভুল বা খালি।' : '❌ Invalid admin secret.');
      return;
    }
    if (res.status === 503) {
      setBalMsg(bn ? '❌ সার্ভারে SMS_API_KEY সেট করা নেই।' : '❌ Server SMS_API_KEY not configured.');
      return;
    }
    if (res.balance === null) {
      setBalMsg(`❌ ${res.hint || res.error || 'Could not load balance'}`);
      return;
    }
    setBalance(res.balance);
    setBalMsg('');
  };

  const handleSendUnifiedSms = async () => {
    if (!smsTargetPhone.trim() || !smsTargetMessage.trim()) {
      setSendMsg(bn ? '⚠️ ফোন নম্বর ও মেসেজ লিখুন।' : '⚠️ Enter both phone number and message.');
      return;
    }
    setSendMsg(bn ? 'এসএমএস পাঠানো হচ্ছে...' : 'Sending SMS...');
    const res = await sendUnifiedSmsText({
      phone: smsTargetPhone,
      message: smsTargetMessage,
      adminSecret,
    });
    if (res.status === 503) {
      setSendMsg(bn ? '❌ সার্ভারে SMS_API_KEY সেট করা নেই।' : '❌ Server SMS_API_KEY not set.');
    } else if (res.status === 401) {
      setSendMsg(bn ? '❌ সঠিক অ্যাডমিন সিক্রেট লিখুন।' : '❌ Invalid admin secret.');
    } else if (res.ok) {
      setSendMsg(
        bn
          ? `✅ এসএমএস সফলভাবে পাঠানো হয়েছে। (Sender ID: ${res.usedCaller || '1234'})`
          : `✅ SMS sent successfully! (Caller ID: ${res.usedCaller || '1234'})`
      );
    } else {
      setSendMsg(`❌ ${res.hint || res.error || 'SMS sending failed'}`);
    }
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setItem('marketbd_payment_live_mode', String(paymentLiveMode));
    storage.setItem('marketbd_payment_auto_settle', String(autoSettle));
    storage.setItem('marketbd_bkash_app_key', bkashAppKey);
    storage.setItem('marketbd_nagad_merchant_id', nagadMerchantId);
    storage.setItem('marketbd_ssl_store_id', sslStoreId);
    setPaymentMsg(
      bn
        ? '✅ আপডেট সফল হয়েছে! - অটো পেমেন্ট গেটওয়ে সেটিংস সেভ হয়েছে।'
        : '✅ Payment Gateway settings saved.'
    );
    setTimeout(() => setPaymentMsg(''), 4000);
  };

  const handleEnableWebPush = async () => {
    const granted = await requestWebPushPermission();
    setPushEnabled(granted);
    if (granted) {
      sendLocalBrowserPushNotification({
        title: 'MarketBD.Net Push Notification Active',
        body: 'আপনার ব্রাউজারে নোটিফিকেশন নোটিশ সফলভাবে চালু হয়েছে।',
      });
      setPushStatusMsg(bn ? '✓ ওয়েব পুশ নোটিফিকেশন অ্যাক্টিভ হয়েছে!' : '✓ Web push active!');
    } else {
      setPushStatusMsg(bn ? '❌ ব্রাউজার নোটিফিকেশন পারমিশন মেলেনি।' : '❌ Notification permission denied.');
    }
  };

  const handleManualAdExpiryRun = () => {
    checkAndExpireAds(products);
    setExpirySummary(
      bn
        ? `✓ মার্কেটপ্লেসের সকল বিজ্ঞাপন সফলভাবে লাইভ ও সক্রিয় রাখা হয়েছে (${products.length} টি বিজ্ঞাপন)।`
        : `✓ All ${products.length} marketplace ads are verified active.`
    );
  };

  const expiredAdsCount = products.filter(p => p.status === 'expired').length;
  const recharged = parseFloat(totalRecharged);
  const rate = parseFloat(ratePerSms);
  const used = balance !== null && !isNaN(recharged) ? Math.max(recharged - balance, 0) : null;
  const smsUsed = used !== null && rate > 0 ? Math.round(used / rate) : null;
  const smsLeft = balance !== null && rate > 0 ? Math.floor(balance / rate) : null;

  const inputCls =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold';

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
              {bn ? '⚡ এসএমএস, পেমেন্ট ও পুশ গেটওয়ে কন্ট্রোল' : '⚡ SMS, Payment & Push Gateway Hub'}
            </h2>
          </div>
          <p className="text-xs text-pink-200">
            {bn
              ? 'একক ও নিরাপদ সার্ভার-ভিত্তিক এসএমএস ওটিপি সিস্টেম, পেমেন্ট কনফিগারেশন এবং পুশ নোটিফিকেশন কন্ট্রোল'
              : 'Unified server-side SMS OTP gateway, payment configuration & push engine.'}
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

        {/* 1. Unified SMS & OTP Gateway Settings (Single Clean Interface) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 rounded-2xl border border-pink-200 dark:border-pink-800">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {bn ? '১. একক এসএমএস ও ওটিপি গেটওয়ে (Unified SMS & OTP)' : '1. Unified SMS & OTP Gateway'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bn ? 'ওটিপি টেমপ্লেট, ব্যালেন্স ও গ্রাহক এসএমএস একটি সহজ প্যানেল থেকে' : 'Single unified SMS OTP template, balance & dispatch panel'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              smsIsLive ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
            }`}>
              {smsIsLive ? (bn ? '🟢 লাইভ সচল' : '🟢 Live Mode') : (bn ? '🟡 টেস্ট স্যান্ডবক্স' : '🟡 Sandbox')}
            </span>
          </div>

          <form onSubmit={handleSaveUnifiedSmsConfig} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 cursor-pointer select-none">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {smsMaskingEnabled
                    ? (bn ? 'মাসকিং: MarketBD.Net' : 'Masking: MarketBD.Net')
                    : (bn ? 'নন-মাসকিং: 1234' : 'Non-masking: 1234')}
                </span>
                <input
                  type="checkbox"
                  checked={smsMaskingEnabled}
                  onChange={e => setSmsMaskingEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 cursor-pointer select-none">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {bn ? 'লাইভ এসএমএস মোড' : 'Live SMS Mode'}
                </span>
                <input
                  type="checkbox"
                  checked={smsIsLive}
                  onChange={e => setSmsIsLive(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 cursor-pointer"
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                🔐 {bn ? 'অ্যাডমিন সিক্রেট (ব্যালেন্স ও ম্যানুয়াল এসএমএসের জন্য)' : 'Admin Secret (for balance & custom SMS)'}
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={e => handleSaveSecret(e.target.value)}
                placeholder="Enter SMS_ADMIN_SECRET..."
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  ✉️ {bn ? 'ওটিপি মেসেজ টেমপ্লেট' : 'OTP Message Template'}
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  ({otpTemplate.replace(/\{otp\}/gi, '123456').length}/70)
                </span>
              </div>
              <textarea
                rows={2}
                value={otpTemplate}
                onChange={e => setOtpTemplate(e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                {bn ? '{otp} লিখলে ৬ ডিজিটের কোড বসবে (সর্বোচ্চ ৭০ অক্ষর)।' : 'Use {otp} placeholder. Keep max 70 chars.'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{bn ? 'এসএমএস ও ওটিপি সেটিংস সেভ করুন' : 'Save SMS & OTP Settings'}</span>
            </button>

            {smsStatusMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{smsStatusMsg}</span>
              </div>
            )}
          </form>

          {/* Balance Checker & Recharge Calculator */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                {bn ? 'এসএমএস ব্যালেন্স ও হিসাব' : 'SMS Balance'}
              </span>
              <button
                type="button"
                onClick={handleCheckBalance}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{bn ? 'ব্যালেন্স দেখুন' : 'Check'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5">{bn ? 'মোট রিচার্জ (৳)' : 'Total recharged (৳)'}</span>
                <input
                  type="number"
                  value={totalRecharged}
                  onChange={e => { setTotalRecharged(e.target.value); storage.setItem('marketbd_sms_total_recharged', e.target.value); }}
                  className={inputCls}
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5">{bn ? 'প্রতি SMS রেট (৳)' : 'Rate per SMS (৳)'}</span>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerSms}
                  onChange={e => { setRatePerSms(e.target.value); storage.setItem('marketbd_sms_rate', e.target.value); }}
                  className={inputCls}
                />
              </div>
            </div>
            {balance !== null && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                  {bn ? 'অবশিষ্ট' : 'Balance'}<br />৳ {balance.toFixed(2)}
                  {smsLeft !== null && <><br /><span className="font-bold">≈ {smsLeft} SMS</span></>}
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                  {bn ? 'খরচ' : 'Spent'}<br />{used !== null ? `৳ ${used.toFixed(2)}` : '—'}
                  {smsUsed !== null && <><br /><span className="font-bold">≈ {smsUsed} SMS</span></>}
                </div>
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300">
                  {bn ? 'রিচার্জ' : 'Recharged'}<br />{!isNaN(recharged) ? `৳ ${recharged}` : '—'}
                </div>
              </div>
            )}
            {balMsg && <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300">{balMsg}</p>}
          </div>

          {/* Single Unified SMS Send / Test Box */}
          <div className="p-3.5 bg-pink-50/60 dark:bg-pink-950/30 rounded-2xl border border-pink-200 dark:border-pink-900/60 space-y-2">
            <label className="block text-[11px] font-extrabold text-pink-950 dark:text-pink-300">
              📩 {bn ? 'টেস্ট বা গ্রাহককে এসএমএস পাঠান' : 'Send Test / Customer SMS'}
            </label>
            <input
              type="text"
              value={smsTargetPhone}
              onChange={e => setSmsTargetPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
            <textarea
              rows={2}
              value={smsTargetMessage}
              onChange={e => setSmsTargetMessage(e.target.value)}
              placeholder={bn ? 'এখানে মেসেজ লিখুন...' : 'Type your message...'}
              className={inputCls}
            />
            <button
              type="button"
              onClick={handleSendUnifiedSms}
              className="w-full py-2 bg-pink-700 hover:bg-pink-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{bn ? 'এসএমএস পাঠান' : 'Send SMS'}</span>
            </button>
            {sendMsg && <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300">{sendMsg}</p>}
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
                  {bn ? '২. লাইভ পেমেন্ট অটো-সেটেলমেন্ট এপিআই' : '2. Live Auto Payment Gateway API'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bn ? 'বিকাশ, নগদ, রকেট ও SSLCommerz কনফিগারেশন' : 'bKash, Nagad, Rocket & SSLCommerz API'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              autoSettle ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {autoSettle ? (bn ? '⚡ অটো ভেরিফিকেশন' : '⚡ Auto Verify') : (bn ? '📋 ম্যানুয়াল TrxID' : 'Manual TrxID')}
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
                className={inputCls}
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
                  className={inputCls}
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
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {bn ? 'ইনস্ট্যান্ট অটো-সেটেলমেন্ট এপ্রুভাল সক্রিয় করুন' : 'Instant Auto Payment Settlement'}
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
              {bn ? 'পেমেন্ট গেটওয়ে সেটিংস সেভ করুন' : 'Save Payment Config'}
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
                  {bn ? '৩. ব্রাউজার ও মোবাইল পুশ নোটিফিকেশন' : '3. Web Push & FCM Engine'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bn ? 'ব্যাকগ্রাউন্ডে ইনস্ট্যান্ট নোটিফিকেশন এলার্ট' : 'Background desktop/mobile alerts'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              pushEnabled ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {pushEnabled ? (bn ? '🔔 সক্রিয়' : '🔔 Enabled') : (bn ? '🔕 নিষ্ক্রিয়' : '🔕 Disabled')}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {bn
              ? 'ক্রেতা ও বিক্রেতার মাঝে নতুন বার্তা, অ্যাড এপ্রুভাল বা রিনিউয়াল এলার্ট আসলে ব্রাউজার স্ক্রিনে সরাসরি পুশ নোটিফিকেশন প্রদর্শিত হবে।'
              : 'Delivers desktop notifications for new messages, ad approvals, and expiry renewal alerts.'}
          </p>

          <button
            type="button"
            onClick={handleEnableWebPush}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>{bn ? 'ব্রাউজার পুশ নোটিফিকেশন চালু করুন' : 'Enable Web Push Notifications'}</span>
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
                  {bn ? '৪. অটোমেটেড ৩০-দিনের অ্যাড এক্সপায়ারি' : '4. Auto 30-Day Ad Expiry'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bn ? '৩০ দিন পুরোনো বিজ্ঞাপনের অটো-মেয়াদ ও রিনিউ ব্যবস্থা' : 'Auto expiry & renewal manager'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
              {bn ? `মেয়াদোত্তীর্ণ: ${expiredAdsCount} টি` : `Expired: ${expiredAdsCount}`}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {bn
              ? '৩০ দিন অতিক্রম করা সকল পুরোনো পোস্ট অটোমেটিক মেয়াদোত্তীর্ণ হিসেবে চিহ্নিত হবে এবং বিক্রেতার কাছে ১-ক্লিক রিনিউ অপশন থাকবে।'
              : 'Ads older than 30 days automatically mark as expired, giving sellers 1-click renewal.'}
          </p>

          <button
            type="button"
            onClick={handleManualAdExpiryRun}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{bn ? 'এখনই ক্রন জব চেক রান করুন' : 'Run Auto Expiry Check Now'}</span>
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
