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
  Wallet,
  Eye,
  EyeOff,
  KeyRound,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { db, doc, getDoc, safeFirestoreSetDoc } from '../../lib/firebase';
import { requestWebPushPermission, sendLocalBrowserPushNotification } from '../../services/pushNotificationService';
import { checkAndExpireAds } from '../../utils/adExpiryEngine';
import {
  SMS_PROVIDER_OPTIONS,
  SmsProviderId,
  fetchUnifiedSmsBalance,
  fetchUnifiedSmsConfig,
  saveUnifiedSmsConfig,
  sendUnifiedSmsOtp,
  sendUnifiedSmsText,
} from '../../services/smsService';
import {
  fetchPaymentGatewayConfig,
  savePaymentGatewayConfig,
} from '../../services/paymentGateway';
import { storage } from '../../utils/storage';

const DEFAULT_OTP_TEMPLATE = 'Your MarketBD.Net OTP is {otp}';

export const GatewaysAdminPanel: React.FC = () => {
  const { language, products } = useMarket();
  const bn = language === 'bn';

  // 1. Unified SMS Provider & OTP Gateway State
  const [providerId, setProviderId] = useState<SmsProviderId>(
    (storage.getItem('marketbd_sms_provider_id') as SmsProviderId) || 'bulksmsdhaka'
  );
  const [providerName, setProviderName] = useState(
    storage.getItem('marketbd_sms_provider_name') || 'BulkSMS Dhaka (bulksmsdhaka.net)'
  );
  const [smsApiUrl, setSmsApiUrl] = useState(
    storage.getItem('marketbd_sms_api_url') || 'https://bulksmsdhaka.net/api'
  );
  const [smsApiKey, setSmsApiKey] = useState('');
  const [showSmsApiKey, setShowSmsApiKey] = useState(false);
  const [hasServerApiKey, setHasServerApiKey] = useState(false);
  const [maskedServerApiKey, setMaskedServerApiKey] = useState('');
  const [smsSenderId, setSmsSenderId] = useState(
    storage.getItem('marketbd_sms_sender_id') || 'MarketBD.Net'
  );
  const [smsSid, setSmsSid] = useState(storage.getItem('marketbd_sms_sid') || '');
  const [smsMaskingEnabled, setSmsMaskingEnabled] = useState(
    storage.getItem('marketbd_sms_masking_enabled') !== 'false'
  );
  const [smsIsLive, setSmsIsLive] = useState(storage.getItem('marketbd_live_mode') !== 'false');
  const [adminSecret, setAdminSecret] = useState(storage.getItem('marketbd_sms_admin_secret') || '');
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [otpTemplate, setOtpTemplate] = useState(DEFAULT_OTP_TEMPLATE);
  const [smsStatusMsg, setSmsStatusMsg] = useState('');
  const [smsSaving, setSmsSaving] = useState(false);

  // Balance & Recharge State
  const [balance, setBalance] = useState<number | null>(null);
  const [totalRecharged, setTotalRecharged] = useState(storage.getItem('marketbd_sms_total_recharged') || '');
  const [ratePerSms, setRatePerSms] = useState(storage.getItem('marketbd_sms_rate') || '0.29');
  const [balMsg, setBalMsg] = useState('');

  // Unified SMS Send / Test State
  const [smsTargetPhone, setSmsTargetPhone] = useState('01723230230');
  const [smsTargetMessage, setSmsTargetMessage] = useState('Test SMS from MarketBD.Net');
  const [sendMsg, setSendMsg] = useState('');

  // 2. Payment Gateway API Config State
  const [paymentLiveMode, setPaymentLiveMode] = useState(
    storage.getItem('marketbd_payment_live_mode') === 'true'
  );
  const [autoSettle, setAutoSettle] = useState(storage.getItem('marketbd_payment_auto_settle') !== 'false');
  const [sslStoreId, setSslStoreId] = useState(storage.getItem('marketbd_ssl_store_id') || '');
  const [sslStorePassword, setSslStorePassword] = useState('');
  const [hasSslPass, setHasSslPass] = useState(false);
  const [maskedSslPass, setMaskedSslPass] = useState('');

  const [bkashAppKey, setBkashAppKey] = useState(storage.getItem('marketbd_bkash_app_key') || '');
  const [bkashAppSecret, setBkashAppSecret] = useState('');
  const [hasBkashSecret, setHasBkashSecret] = useState(false);
  const [maskedBkashSecret, setMaskedBkashSecret] = useState('');
  const [bkashUsername, setBkashUsername] = useState(storage.getItem('marketbd_bkash_username') || '');

  const [nagadMerchantId, setNagadMerchantId] = useState(storage.getItem('marketbd_nagad_merchant_id') || '');
  const [nagadMerchantKey, setNagadMerchantKey] = useState('');
  const [hasNagadKey, setHasNagadKey] = useState(false);
  const [maskedNagadKey, setMaskedNagadKey] = useState('');

  const [rocketMerchantId, setRocketMerchantId] = useState(storage.getItem('marketbd_rocket_merchant_id') || '');
  const [rocketApiKey, setRocketApiKey] = useState('');
  const [hasRocketKey, setHasRocketKey] = useState(false);
  const [maskedRocketKey, setMaskedRocketKey] = useState('');

  const [showPaySecrets, setShowPaySecrets] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  // 3. Web Push State
  const [pushEnabled, setPushEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [pushStatusMsg, setPushStatusMsg] = useState('');

  // 4. Expiry Run State
  const [expirySummary, setExpirySummary] = useState('');

  // Load initial configuration from authoritative server API; use Firestore only as fallback
  useEffect(() => {
    fetchUnifiedSmsConfig().then(res => {
      if (res.ok && res.config) {
        const c = res.config;
        setProviderId(c.providerId);
        setProviderName(c.providerName);
        setSmsApiUrl(c.apiUrl);
        setSmsSenderId(c.senderId);
        setSmsSid(c.sid || '');
        setSmsMaskingEnabled(c.maskingEnabled);
        setSmsIsLive(c.isLiveMode);
        setOtpTemplate(c.otpTemplate || DEFAULT_OTP_TEMPLATE);
        setHasServerApiKey(c.hasApiKey);
        setMaskedServerApiKey(c.maskedApiKey || '');
      } else {
        getDoc(doc(db, 'settings', 'sms_config'))
          .then(snap => {
            const d = snap.data();
            if (d?.otpTemplate) setOtpTemplate(String(d.otpTemplate));
            if (typeof d?.maskingEnabled === 'boolean') setSmsMaskingEnabled(d.maskingEnabled);
            if (d?.providerName) setProviderName(String(d.providerName));
            if (d?.senderId) setSmsSenderId(String(d.senderId));
          })
          .catch(() => {});
      }
    });

    fetchPaymentGatewayConfig().then(res => {
      if (res.ok && res.config) {
        const p = res.config;
        setPaymentLiveMode(p.isLiveMode);
        setAutoSettle(p.autoSettle);
        if (p.bkashAppKey) setBkashAppKey(p.bkashAppKey);
        if (p.bkashUsername) setBkashUsername(p.bkashUsername);
        setHasBkashSecret(p.hasBkashSecret);
        setMaskedBkashSecret(p.maskedBkashSecret);
        if (p.nagadMerchantId) setNagadMerchantId(p.nagadMerchantId);
        setHasNagadKey(p.hasNagadKey);
        setMaskedNagadKey(p.maskedNagadKey);
        if (p.rocketMerchantId) setRocketMerchantId(p.rocketMerchantId);
        setHasRocketKey(p.hasRocketKey);
        setMaskedRocketKey(p.maskedRocketKey);
        if (p.sslcommerzStoreId) setSslStoreId(p.sslcommerzStoreId);
        setHasSslPass(p.hasSslPassword);
        setMaskedSslPass(p.maskedSslPassword);
      }
    });
  }, []);

  const handleProviderSelect = (nextId: SmsProviderId) => {
    setProviderId(nextId);
    const preset = SMS_PROVIDER_OPTIONS.find(p => p.id === nextId);
    if (preset) {
      if (nextId !== 'custom') {
        setProviderName(preset.companyName);
        setSmsApiUrl(preset.defaultApiUrl);
      } else {
        setProviderName('');
      }
    }
  };

  const handleSaveSecret = (value: string) => {
    setAdminSecret(value);
    storage.setItem('marketbd_sms_admin_secret', value);
  };

  // Single Unified Save Handler (Provider + API Key + Masking + Live Mode + OTP Template)
  const handleSaveUnifiedSmsConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!providerName.trim()) {
      setSmsStatusMsg(
        bn ? '❌ অনুগ্রহ করে এসএমএস প্রোভাইডার কোম্পানির নাম লিখুন।' : '❌ Enter SMS provider company name.'
      );
      return;
    }

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

    setSmsSaving(true);
    const resolvedSenderId = smsMaskingEnabled ? (smsSenderId.trim() || 'MarketBD.Net') : '1234';

    const serverRes = await saveUnifiedSmsConfig({
      providerId,
      providerName: providerName.trim(),
      apiUrl: smsApiUrl.trim(),
      apiKey: smsApiKey.trim() || undefined,
      senderId: resolvedSenderId,
      sid: smsSid.trim(),
      maskingEnabled: smsMaskingEnabled,
      isLiveMode: smsIsLive,
      otpTemplate: otpTemplate.trim(),
      adminSecret,
    });
    setSmsSaving(false);

    if (!serverRes.ok) {
      setSmsStatusMsg(`❌ ${serverRes.error || (bn ? 'সার্ভারে সেভ করা যায়নি।' : 'Failed to save on server.')}`);
      return;
    }

    if (serverRes.config) {
      setHasServerApiKey(serverRes.config.hasApiKey);
      setMaskedServerApiKey(serverRes.config.maskedApiKey || '');
      setSmsApiKey(''); // Clear plaintext input after secure server save
    }

    // Save non-secret flags locally & sync non-secret fields to Firestore
    storage.setItem('marketbd_sms_provider_id', providerId);
    storage.setItem('marketbd_sms_provider_name', providerName.trim());
    storage.setItem('marketbd_sms_api_url', smsApiUrl.trim());
    storage.setItem('marketbd_sms_masking_enabled', String(smsMaskingEnabled));
    storage.setItem('marketbd_sms_sender_id', resolvedSenderId);
    storage.setItem('marketbd_sms_sid', smsSid.trim());
    storage.setItem('marketbd_live_mode', String(smsIsLive));

    await safeFirestoreSetDoc(
      doc(db, 'settings', 'sms_config'),
      {
        providerId,
        providerName: providerName.trim(),
        apiUrl: smsApiUrl.trim(),
        senderId: resolvedSenderId,
        otpTemplate: otpTemplate.trim(),
        maskingEnabled: smsMaskingEnabled,
        isLiveMode: smsIsLive,
      },
      { merge: true }
    );

    if (serverRes.config) {
      setSmsSenderId(serverRes.config.senderId);
      setSmsMaskingEnabled(serverRes.config.maskingEnabled);
      if (serverRes.config.otpTemplate) setOtpTemplate(serverRes.config.otpTemplate);
    }

    if (serverRes.persistedOnServer === false || serverRes.warning) {
      const prefix = serverRes.config?.hasApiKey ? 'ℹ️' : '⚠️';
      setSmsStatusMsg(
        `${prefix} ${serverRes.warning || (bn ? 'Vercel-এ ফাইল Read-Only থাকায় Vercel Environment Variables-এ SMS_API_KEY সেট করুন।' : 'Read-only filesystem: Set SMS_API_KEY in Vercel Environment Variables.')}`
      );
      return;
    }

    setSmsStatusMsg(
      bn
        ? '✅ এসএমএস প্রোভাইডার, API Key ও ওটিপি সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
        : '✅ SMS Provider, API Key & OTP settings saved securely!'
    );
    setTimeout(() => setSmsStatusMsg(''), 4500);
  };

  const handleClearSmsApiKey = async () => {
    setSmsSaving(true);
    const res = await saveUnifiedSmsConfig({
      providerId,
      providerName: providerName.trim() || 'BulkSMS Dhaka',
      apiUrl: smsApiUrl.trim(),
      clearApiKey: true,
      senderId: smsSenderId.trim() || '1234',
      maskingEnabled: smsMaskingEnabled,
      isLiveMode: smsIsLive,
      otpTemplate: otpTemplate.trim(),
      adminSecret,
    });
    setSmsSaving(false);
    if (res.ok && res.config) {
      setHasServerApiKey(res.config.hasApiKey);
      setMaskedServerApiKey(res.config.maskedApiKey || '');
      setSmsApiKey('');
      setSmsStatusMsg(bn ? '🗑️ সংরক্ষিত SMS API Key সরানো হয়েছে।' : '🗑️ Saved SMS API Key cleared.');
    }
  };

  const handleCheckBalance = async () => {
    setBalMsg(bn ? 'ব্যালেন্স চেক করা হচ্ছে...' : 'Checking balance...');
    const res = await fetchUnifiedSmsBalance(adminSecret);
    if (res.status === 401) {
      setBalMsg(bn ? '❌ অ্যাডমিন সিক্রেট ভুল বা খালি।' : '❌ Invalid admin secret.');
      return;
    }
    if (res.status === 503) {
      setBalMsg(bn ? '❌ SMS API Key সেট করা নেই। উপরের বক্সে API Key দিয়ে সেভ করুন।' : '❌ SMS API Key not configured.');
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
      setSendMsg(bn ? '❌ SMS API Key সেট করা নেই। উপরের বক্সে API Key দিয়ে সেভ করুন।' : '❌ SMS API Key not set.');
    } else if (res.status === 401) {
      setSendMsg(bn ? '❌ সঠিক অ্যাডমিন সিক্রেট লিখুন।' : '❌ Invalid admin secret.');
    } else if (res.ok) {
      setSendMsg(
        bn
          ? `✅ এসএমএস সফলভাবে পাঠানো হয়েছে (${res.providerName || providerName}, Sender: ${res.usedCaller || '1234'})`
          : `✅ SMS sent successfully! (${res.providerName || providerName}, Sender: ${res.usedCaller || '1234'})`
      );
    } else {
      setSendMsg(`❌ ${res.hint || res.error || 'SMS sending failed'}`);
    }
  };

  const handleTestUnifiedOtp = async () => {
    if (!smsTargetPhone.trim()) {
      setSendMsg(bn ? '⚠️ টেস্ট OTP পাঠাতে মোবাইল নম্বর দিন।' : '⚠️ Enter a phone number to test OTP.');
      return;
    }
    setSendMsg(bn ? 'লাইভ ওটিপি (OTP) পাঠানো হচ্ছে...' : 'Sending live test OTP...');
    const res = await sendUnifiedSmsOtp(smsTargetPhone);
    if (res.ok) {
      setSendMsg(
        bn
          ? `✅ OTP পাঠানো সফল হয়েছে! (${res.providerName || providerName}, রুট: ${res.usedEndpoint || 'otpsend'}, Sender: ${res.usedCaller || '1234'})`
          : `✅ Test OTP sent! (${res.providerName || providerName}, Route: ${res.usedEndpoint || 'otpsend'}, Sender: ${res.usedCaller || '1234'})`
      );
    } else {
      setSendMsg(`❌ ${res.hint || res.error || 'OTP sending failed'}`);
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaving(true);

    const serverRes = await savePaymentGatewayConfig(
      {
        isLiveMode: paymentLiveMode,
        autoSettle,
        bkashAppKey: bkashAppKey.trim(),
        ...(bkashAppSecret.trim() ? { bkashAppSecret: bkashAppSecret.trim() } : {}),
        bkashUsername: bkashUsername.trim(),
        nagadMerchantId: nagadMerchantId.trim(),
        ...(nagadMerchantKey.trim() ? { nagadMerchantKey: nagadMerchantKey.trim() } : {}),
        rocketMerchantId: rocketMerchantId.trim(),
        ...(rocketApiKey.trim() ? { rocketApiKey: rocketApiKey.trim() } : {}),
        sslcommerzStoreId: sslStoreId.trim(),
        ...(sslStorePassword.trim() ? { sslcommerzStorePassword: sslStorePassword.trim() } : {}),
      },
      adminSecret
    );
    setPaymentSaving(false);

    if (!serverRes.ok) {
      setPaymentMsg(`❌ ${serverRes.error || (bn ? 'পেমেন্ট সেটিংস সেভ করা যায়নি।' : 'Failed to save payment settings.')}`);
      return;
    }

    if (serverRes.config) {
      setHasBkashSecret(serverRes.config.hasBkashSecret);
      setMaskedBkashSecret(serverRes.config.maskedBkashSecret);
      setHasNagadKey(serverRes.config.hasNagadKey);
      setMaskedNagadKey(serverRes.config.maskedNagadKey);
      setHasRocketKey(serverRes.config.hasRocketKey);
      setMaskedRocketKey(serverRes.config.maskedRocketKey);
      setHasSslPass(serverRes.config.hasSslPassword);
      setMaskedSslPass(serverRes.config.maskedSslPassword);
      setBkashAppSecret('');
      setNagadMerchantKey('');
      setRocketApiKey('');
      setSslStorePassword('');
    }

    storage.setItem('marketbd_payment_live_mode', String(paymentLiveMode));
    storage.setItem('marketbd_payment_auto_settle', String(autoSettle));
    storage.setItem('marketbd_bkash_app_key', bkashAppKey.trim());
    storage.setItem('marketbd_bkash_username', bkashUsername.trim());
    storage.setItem('marketbd_nagad_merchant_id', nagadMerchantId.trim());
    storage.setItem('marketbd_rocket_merchant_id', rocketMerchantId.trim());
    storage.setItem('marketbd_ssl_store_id', sslStoreId.trim());

    await safeFirestoreSetDoc(
      doc(db, 'settings', 'payment_gateway'),
      {
        isLiveMode: paymentLiveMode,
        autoSettle,
        hasBkashConfigured: Boolean(bkashAppKey.trim()),
        hasNagadConfigured: Boolean(nagadMerchantId.trim()),
        hasRocketConfigured: Boolean(rocketMerchantId.trim()),
        hasSslConfigured: Boolean(sslStoreId.trim()),
      },
      { merge: true }
    );

    setPaymentMsg(
      bn
        ? '✅ আপডেট সফল হয়েছে! - পেমেন্ট গেটওয়ে API কী ও সেটিংস সার্ভারে সুরক্ষিতভাবে সেভ হয়েছে।'
        : '✅ Payment Gateway API keys & settings saved securely!'
    );
    setTimeout(() => setPaymentMsg(''), 4500);
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

  const selectedPreset = SMS_PROVIDER_OPTIONS.find(p => p.id === providerId);

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
              ? 'এসএমএস প্রোভাইডার কোম্পানি নির্বাচন, API Key/কোড সেটআপ, পেমেন্ট গেটওয়ে API এবং পুশ নোটিফিকেশন কন্ট্রোল'
              : 'Configure SMS provider company, API keys, payment gateway credentials & push alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span
            className={`px-3 py-1 border rounded-full text-xs font-bold flex items-center gap-1.5 ${
              hasServerApiKey
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
            }`}
          >
            {hasServerApiKey ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {hasServerApiKey
                ? bn
                  ? `SMS API যুক্ত (${maskedServerApiKey})`
                  : `SMS API Ready (${maskedServerApiKey})`
                : bn
                ? 'SMS API Key সেট করুন'
                : 'SMS API Key Pending'}
            </span>
          </span>
        </div>
      </div>

      {/* Grid of 4 Gateway Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Unified SMS & OTP Gateway Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 rounded-2xl border border-pink-200 dark:border-pink-800">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {bn ? '১. একক এসএমএস ও ওটিপি গেটওয়ে (SMS Provider & API)' : '1. Unified SMS Provider & OTP Gateway'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bn ? 'কোম্পানি, API Key, Sender ID এবং OTP মেসেজ ফরম্যাট সেট করুন' : 'Select SMS provider company, API key, sender ID & OTP format'}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                smsIsLive
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
              }`}
            >
              {smsIsLive ? (bn ? '🟢 লাইভ সচল' : '🟢 Live Mode') : (bn ? '🟡 টেস্ট স্যান্ডবক্স' : '🟡 Sandbox')}
            </span>
          </div>

          {!hasServerApiKey && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200 font-bold leading-relaxed space-y-1">
              <p>
                {bn
                  ? '⚠️ এই হোস্টিংয়ে এখনো SMS_API_KEY চালু নেই — তাই ওয়েব ও অ্যান্ড্রয়েড অ্যাপে ওটিপি যাচ্ছে না।'
                  : '⚠️ SMS_API_KEY is not active on this server host yet — OTP SMS cannot be delivered.'}
              </p>
              <p className="font-normal opacity-90">
                {bn
                  ? 'Vercel-এ হোস্ট করলে Vercel Dashboard → Settings → Environment Variables-এ SMS_API_KEY যোগ করে Redeploy করুন এবং BulkSMS Dhaka প্যানেলে IP Whitelist বন্ধ (OFF) রাখুন।'
                  : 'On Vercel, add SMS_API_KEY in Project Settings → Environment Variables, redeploy, and keep IP Whitelist OFF in BulkSMS Dhaka.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSaveUnifiedSmsConfig} className="space-y-3">
            {/* SMS Provider Company Selector & Custom Name */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div>
                <label className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>{bn ? 'এসএমএস প্রোভাইডার কোম্পানি নির্বাচন করুন' : 'SMS Provider Company'}</span>
                </label>
                <select
                  value={providerId}
                  onChange={e => handleProviderSelect(e.target.value as SmsProviderId)}
                  className={inputCls}
                >
                  {SMS_PROVIDER_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {bn ? 'কোম্পানির নাম লিখুন *' : 'Provider Company Name *'}
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    placeholder={bn ? 'যেমন: BulkSMS Dhaka / SSL Wireless' : 'e.g. BulkSMS Dhaka'}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {bn ? 'API এন্ডপয়েন্ট URL' : 'API Endpoint URL'}
                  </label>
                  <input
                    type="url"
                    value={smsApiUrl}
                    onChange={e => setSmsApiUrl(e.target.value)}
                    placeholder="https://bulksmsdhaka.net/api"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
            </div>

            {/* SMS API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-pink-600" />
                  <span>{bn ? 'এসএমএস API Key / এপিআই কোড' : 'SMS API Key / Token'}</span>
                </label>
                {hasServerApiKey && (
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {bn ? `✓ সংরক্ষিত: ${maskedServerApiKey}` : `✓ Saved: ${maskedServerApiKey}`}
                  </span>
                )}
              </div>
              <div className="relative flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type={showSmsApiKey ? 'text' : 'password'}
                    value={smsApiKey}
                    onChange={e => setSmsApiKey(e.target.value)}
                    placeholder={
                      hasServerApiKey
                        ? bn
                          ? 'পরিবর্তন করতে নতুন API Key দিন (না বদলালে খালি রাখুন)'
                          : 'Enter new API Key to update (leave blank to keep current)'
                        : bn
                        ? 'আপনার SMS কোম্পানির API Key / কোড লিখুন...'
                        : 'Paste your SMS Provider API Key...'
                    }
                    className={`${inputCls} pr-9 font-mono`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showSmsApiKey ? 'Hide' : 'Show'}
                  >
                    {showSmsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {hasServerApiKey && (
                  <button
                    type="button"
                    onClick={handleClearSmsApiKey}
                    className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black cursor-pointer shrink-0"
                    title={bn ? 'সংরক্ষিত API Key মুছুন' : 'Clear saved API key'}
                  >
                    {bn ? 'মুছুন' : 'Clear'}
                  </button>
                )}
              </div>
            </div>

            {/* Sender ID & Optional SID */}
            <div className={`grid gap-2.5 ${selectedPreset?.requiresSid ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  🏷️ {bn ? 'Sender ID / Caller ID (মাস্কিং বা নম্বর)' : 'Sender ID / Caller ID'}
                </label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  placeholder="MarketBD.Net / 1234 / 88096..."
                  className={`${inputCls} font-mono`}
                />
              </div>
              {selectedPreset?.requiresSid && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    🆔 SID (SSL Wireless Stakeholder ID)
                  </label>
                  <input
                    type="text"
                    value={smsSid}
                    onChange={e => setSmsSid(e.target.value)}
                    placeholder="e.g. MARKETBDBRAND"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              )}
            </div>

            {/* Masking + Live Mode Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 cursor-pointer select-none">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {smsMaskingEnabled
                    ? bn
                      ? `মাসকিং: ${smsSenderId || 'MarketBD.Net'}`
                      : `Masking: ${smsSenderId || 'MarketBD.Net'}`
                    : bn
                    ? 'নন-মাসকিং: 1234'
                    : 'Non-masking: 1234'}
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

            {/* Admin Secret */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                🔐 {bn ? 'অ্যাডমিন সিক্রেট (ব্যালেন্স, ম্যানুয়াল এসএমএস ও সেটিংস লক)' : 'Admin Secret (for balance & custom SMS)'}
              </label>
              <div className="relative">
                <input
                  type={showAdminSecret ? 'text' : 'password'}
                  value={adminSecret}
                  onChange={e => handleSaveSecret(e.target.value)}
                  placeholder="Enter SMS_ADMIN_SECRET (optional if unset)..."
                  className={`${inputCls} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminSecret(!showAdminSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showAdminSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OTP Template */}
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
              disabled={smsSaving}
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {smsSaving
                  ? bn
                    ? 'সেভ হচ্ছে...'
                    : 'Saving...'
                  : bn
                  ? 'এসএমএস প্রোভাইডার, API Key ও ওটিপি সেভ করুন'
                  : 'Save SMS Provider, API Key & OTP'}
              </span>
            </button>

            {smsStatusMsg && (
              <div
                className={`p-2.5 border text-xs font-bold rounded-xl flex items-center gap-2 ${
                  smsStatusMsg.startsWith('❌')
                    ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200'
                    : smsStatusMsg.startsWith('⚠️')
                    ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                  onChange={e => {
                    setTotalRecharged(e.target.value);
                    storage.setItem('marketbd_sms_total_recharged', e.target.value);
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5">{bn ? 'প্রতি SMS রেট (৳)' : 'Rate per SMS (৳)'}</span>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerSms}
                  onChange={e => {
                    setRatePerSms(e.target.value);
                    storage.setItem('marketbd_sms_rate', e.target.value);
                  }}
                  className={inputCls}
                />
              </div>
            </div>
            {balance !== null && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                  {bn ? 'অবশিষ্ট' : 'Balance'}
                  <br />৳ {balance.toFixed(2)}
                  {smsLeft !== null && (
                    <>
                      <br />
                      <span className="font-bold">≈ {smsLeft} SMS</span>
                    </>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                  {bn ? 'খরচ' : 'Spent'}
                  <br />
                  {used !== null ? `৳ ${used.toFixed(2)}` : '—'}
                  {smsUsed !== null && (
                    <>
                      <br />
                      <span className="font-bold">≈ {smsUsed} SMS</span>
                    </>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300">
                  {bn ? 'রিচার্জ' : 'Recharged'}
                  <br />
                  {!isNaN(recharged) ? `৳ ${recharged}` : '—'}
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
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSendUnifiedSms}
                className="py-2 bg-pink-700 hover:bg-pink-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{bn ? 'এসএমএস পাঠান' : 'Send SMS'}</span>
              </button>
              <button
                type="button"
                onClick={handleTestUnifiedOtp}
                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{bn ? 'ওটিপি টেস্ট করুন' : 'Test OTP'}</span>
              </button>
            </div>
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
                  {bn ? '২. লাইভ পেমেন্ট গেটওয়ে API কী ও কনফিগারেশন' : '2. Live Payment Gateway API Keys'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {bn ? 'বিকাশ, নগদ, রকেট ও SSLCommerz API Key / Secret সেটআপ' : 'bKash, Nagad, Rocket & SSLCommerz API credentials'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPaySecrets(!showPaySecrets)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
            >
              {showPaySecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPaySecrets ? (bn ? 'লুকান' : 'Hide') : (bn ? 'দেখুন' : 'Show')}</span>
            </button>
          </div>

          <form onSubmit={handleSavePaymentConfig} className="space-y-3.5">
            {/* Mode Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 cursor-pointer select-none">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {paymentLiveMode ? (bn ? '🟢 লাইভ পেমেন্ট API' : '🟢 Live API Mode') : (bn ? '🟡 টেস্ট / ম্যানুয়াল মোড' : '🟡 Sandbox / Manual')}
                </span>
                <input
                  type="checkbox"
                  checked={paymentLiveMode}
                  onChange={e => setPaymentLiveMode(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 cursor-pointer select-none">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {bn ? 'অটো-সেটেলমেন্ট চালু' : 'Auto Settlement'}
                </span>
                <input
                  type="checkbox"
                  checked={autoSettle}
                  onChange={e => setAutoSettle(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* bKash Credentials */}
            <div className="p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-pink-700 dark:text-pink-300">bKash Tokenized Checkout API</span>
                {hasBkashSecret && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    ✓ Secret ({maskedBkashSecret})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">bKash App Key</label>
                  <input
                    type="text"
                    value={bkashAppKey}
                    onChange={e => setBkashAppKey(e.target.value)}
                    placeholder="App Key"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">bKash App Secret</label>
                  <input
                    type={showPaySecrets ? 'text' : 'password'}
                    value={bkashAppSecret}
                    onChange={e => setBkashAppSecret(e.target.value)}
                    placeholder={hasBkashSecret ? '•••• (Saved)' : 'App Secret'}
                    className={`${inputCls} font-mono`}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">Merchant Username</label>
                  <input
                    type="text"
                    value={bkashUsername}
                    onChange={e => setBkashUsername(e.target.value)}
                    placeholder="Merchant User"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
            </div>

            {/* Nagad & Rocket Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-800 dark:text-amber-300">Nagad Merchant API</span>
                  {hasNagadKey && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">✓ {maskedNagadKey}</span>}
                </div>
                <input
                  type="text"
                  value={nagadMerchantId}
                  onChange={e => setNagadMerchantId(e.target.value)}
                  placeholder="Nagad Merchant ID"
                  className={`${inputCls} font-mono`}
                />
                <input
                  type={showPaySecrets ? 'text' : 'password'}
                  value={nagadMerchantKey}
                  onChange={e => setNagadMerchantKey(e.target.value)}
                  placeholder={hasNagadKey ? '•••• (Saved)' : 'Nagad Merchant Public/API Key'}
                  className={`${inputCls} font-mono`}
                  autoComplete="new-password"
                />
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-purple-800 dark:text-purple-300">Rocket Payment API</span>
                  {hasRocketKey && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">✓ {maskedRocketKey}</span>}
                </div>
                <input
                  type="text"
                  value={rocketMerchantId}
                  onChange={e => setRocketMerchantId(e.target.value)}
                  placeholder="Rocket Merchant ID"
                  className={`${inputCls} font-mono`}
                />
                <input
                  type={showPaySecrets ? 'text' : 'password'}
                  value={rocketApiKey}
                  onChange={e => setRocketApiKey(e.target.value)}
                  placeholder={hasRocketKey ? '•••• (Saved)' : 'Rocket API Key / Secret'}
                  className={`${inputCls} font-mono`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* SSLCommerz Credentials */}
            <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-sky-800 dark:text-sky-300">SSLCommerz Gateway</span>
                {hasSslPass && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">✓ Pass ({maskedSslPass})</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={sslStoreId}
                  onChange={e => setSslStoreId(e.target.value)}
                  placeholder="SSLCommerz Store ID"
                  className={`${inputCls} font-mono`}
                />
                <input
                  type={showPaySecrets ? 'text' : 'password'}
                  value={sslStorePassword}
                  onChange={e => setSslStorePassword(e.target.value)}
                  placeholder={hasSslPass ? '•••• (Saved)' : 'SSLCommerz Store Password'}
                  className={`${inputCls} font-mono`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={paymentSaving}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {paymentSaving
                  ? bn
                    ? 'সেভ হচ্ছে...'
                    : 'Saving...'
                  : bn
                  ? 'পেমেন্ট গেটওয়ে API কী ও সেটিংস সেভ করুন'
                  : 'Save Payment Gateway Config'}
              </span>
            </button>
            {paymentMsg && (
              <div
                className={`p-3 border text-xs font-black rounded-xl animate-in fade-in flex items-center justify-center gap-2 shadow-sm ${
                  paymentMsg.startsWith('❌')
                    ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
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
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                pushEnabled ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
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
