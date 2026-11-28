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
import { auth, db, doc, getDoc, safeFirestoreSetDoc, GoogleAuthProvider, signInWithPopup } from '../../lib/firebase';
import { requestWebPushPermission, sendLocalBrowserPushNotification } from '../../services/pushNotificationService';
import { checkAndExpireAds } from '../../utils/adExpiryEngine';
import {
  SMS_PROVIDER_OPTIONS,
  SmsProviderId,
  fetchUnifiedSmsBalance,
  fetchUnifiedSmsConfig,
  saveUnifiedSmsConfig,
  sendUnifiedSmsText,
  testAdminSmsOtp,
} from '../../services/smsService';
import {
  fetchPaymentGatewayConfig,
  savePaymentGatewayConfig,
} from '../../services/paymentGateway';
import { storage } from '../../utils/storage';

const DEFAULT_OTP_TEMPLATE = 'Your MarketBD.Net OTP is {otp}. Do not reply.';

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
    storage.getItem('marketbd_sms_sender_id') || '1234'
  );
  const [nonMaskingSenderId, setNonMaskingSenderId] = useState(
    storage.getItem('marketbd_sms_non_masking_sender_id') || '1234'
  );
  const [maskingSenderId, setMaskingSenderId] = useState(
    storage.getItem('marketbd_sms_masking_sender_id') || 'MarketBD.Net'
  );
  const [smsSid, setSmsSid] = useState(storage.getItem('marketbd_sms_sid') || '');
  const [smsMaskingEnabled, setSmsMaskingEnabled] = useState(
    storage.getItem('marketbd_sms_masking_enabled') === 'true'
  );
  const [smsNoReplyMode, setSmsNoReplyMode] = useState(
    storage.getItem('marketbd_sms_no_reply_mode') !== 'false'
  );
  const [smsIsLive, setSmsIsLive] = useState(storage.getItem('marketbd_live_mode') !== 'false');
  const [adminSecret, setAdminSecret] = useState(storage.getItem('marketbd_sms_admin_secret') || '');
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [otpTemplate, setOtpTemplate] = useState(
    storage.getItem('marketbd_sms_otp_template') || DEFAULT_OTP_TEMPLATE
  );
  const [smsStatusMsg, setSmsStatusMsg] = useState('');
  const [smsSaving, setSmsSaving] = useState(false);
  const [needsGoogleSync, setNeedsGoogleSync] = useState(false);

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

  // Load initial configuration from BOTH server API and Firestore, picking the newest saved timestamp
  useEffect(() => {
    Promise.allSettled([
      fetchUnifiedSmsConfig(),
      getDoc(doc(db, 'settings', 'sms_config')),
    ]).then(([apiSettled, fsSettled]) => {
      const apiRes = apiSettled.status === 'fulfilled' ? apiSettled.value : null;
      const fsSnap = fsSettled.status === 'fulfilled' ? fsSettled.value : null;
      const fsData = fsSnap && fsSnap.exists() ? fsSnap.data() : null;

      const c = apiRes?.ok ? apiRes.config : undefined;
      if (c) {
        setHasServerApiKey(c.hasApiKey);
        setMaskedServerApiKey(c.maskedApiKey || '');
      }

      const apiTs = Date.parse(c?.updatedAt || '') || 0;
      const fsTs = Date.parse(String(fsData?.updatedAt || '')) || 0;
      const localTs = Date.parse(storage.getItem('marketbd_sms_updated_at') || '') || 0;
      const localTpl = storage.getItem('marketbd_sms_otp_template') || '';

      const useFirestore = Boolean(fsData && (fsTs >= apiTs || !c));
      const srcProviderId = (useFirestore ? fsData?.providerId : c?.providerId) || c?.providerId || fsData?.providerId;
      const srcProviderName = (useFirestore ? fsData?.providerName : c?.providerName) || c?.providerName || fsData?.providerName;
      const srcApiUrl = (useFirestore ? fsData?.apiUrl : c?.apiUrl) || c?.apiUrl || fsData?.apiUrl;
      const srcMasking = useFirestore
        ? (typeof fsData?.maskingEnabled === 'boolean' ? fsData.maskingEnabled : c?.maskingEnabled)
        : (typeof c?.maskingEnabled === 'boolean' ? c.maskingEnabled : fsData?.maskingEnabled);
      const srcNoReply = useFirestore
        ? (typeof fsData?.noReplyMode === 'boolean' ? fsData.noReplyMode : c?.noReplyMode)
        : (typeof c?.noReplyMode === 'boolean' ? c.noReplyMode : fsData?.noReplyMode);
      const srcSenderId = (useFirestore ? fsData?.senderId : c?.senderId) || c?.senderId || fsData?.senderId;
      const srcLive = useFirestore
        ? (typeof fsData?.isLiveMode === 'boolean' ? fsData.isLiveMode : c?.isLiveMode)
        : (typeof c?.isLiveMode === 'boolean' ? c.isLiveMode : fsData?.isLiveMode);

      if (srcProviderId) setProviderId(srcProviderId as SmsProviderId);
      if (srcProviderName) setProviderName(String(srcProviderName));
      if (srcApiUrl) setSmsApiUrl(String(srcApiUrl));
      if (typeof srcMasking === 'boolean') setSmsMaskingEnabled(srcMasking);
      if (typeof srcNoReply === 'boolean') setSmsNoReplyMode(srcNoReply);
      if (typeof srcLive === 'boolean') setSmsIsLive(srcLive);
      if (c?.sid) setSmsSid(c.sid);
      if (srcSenderId) {
        const sidVal = String(srcSenderId);
        setSmsSenderId(sidVal);
        if (srcMasking) setMaskingSenderId(sidVal);
        else setNonMaskingSenderId(sidVal !== 'MarketBD.Net' ? sidVal : '1234');
      }

      let winningTemplate = c?.otpTemplate || DEFAULT_OTP_TEMPLATE;
      let bestTs = apiTs;
      if (fsData?.otpTemplate && (fsTs >= bestTs || !c?.otpTemplate)) {
        winningTemplate = String(fsData.otpTemplate);
        bestTs = fsTs;
      }
      if (localTpl && localTs > bestTs) {
        winningTemplate = localTpl;
      }
      setOtpTemplate(winningTemplate);
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

  const handleSelectMaskingMode = (enableMasking: boolean) => {
    setSmsMaskingEnabled(enableMasking);
    const nextSender = enableMasking
      ? (maskingSenderId.trim() || 'MarketBD.Net')
      : (nonMaskingSenderId.trim() && nonMaskingSenderId.trim() !== 'MarketBD.Net' ? nonMaskingSenderId.trim() : '1234');
    setSmsSenderId(nextSender);
  };

  const handleSenderIdChange = (val: string) => {
    setSmsSenderId(val);
    if (smsMaskingEnabled) {
      setMaskingSenderId(val);
      storage.setItem('marketbd_sms_masking_sender_id', val);
    } else {
      setNonMaskingSenderId(val);
      storage.setItem('marketbd_sms_non_masking_sender_id', val);
    }
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

    const resolvedSenderId = smsMaskingEnabled
      ? (maskingSenderId.trim() || smsSenderId.trim() || 'MarketBD.Net')
      : (nonMaskingSenderId.trim() && nonMaskingSenderId.trim() !== 'MarketBD.Net'
          ? nonMaskingSenderId.trim()
          : '1234');

    const cleanedDigits = resolvedSenderId.replace(/[\s\-+]/g, '');
    if (smsNoReplyMode && /^(?:88)?01[3-9]\d{8}$/.test(cleanedDigits)) {
      setSmsStatusMsg(
        bn
          ? '❌ রিপ্লাই অপশন বন্ধ রাখতে ব্যক্তিগত মোবাইল নম্বর Sender ID হিসেবে দেওয়া যাবে না। Alphanumeric ব্র্যান্ড নাম (MarketBD.Net) বা 1234 ব্যবহার করুন।'
          : '❌ Personal mobile numbers cannot be used as Sender ID in No-Reply mode. Use MarketBD.Net or 1234.'
      );
      return;
    }

    const savedAt = new Date().toISOString();
    const cleanTemplate = otpTemplate
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    setSmsSaving(true);
    const serverRes = await saveUnifiedSmsConfig({
      providerId,
      providerName: providerName.trim(),
      apiUrl: smsApiUrl.trim(),
      apiKey: smsApiKey.trim() || undefined,
      senderId: resolvedSenderId,
      sid: smsSid.trim(),
      maskingEnabled: smsMaskingEnabled,
      noReplyMode: smsNoReplyMode,
      isLiveMode: smsIsLive,
      otpTemplate: cleanTemplate,
      updatedAt: savedAt,
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
      if (serverRes.persistedOnServer !== false) {
        setSmsApiKey('');
      }
      setSmsSenderId(serverRes.config.senderId);
      setSmsMaskingEnabled(serverRes.config.maskingEnabled);
      if (serverRes.config.maskingEnabled) {
        setMaskingSenderId(serverRes.config.senderId);
      } else {
        setNonMaskingSenderId(serverRes.config.senderId);
      }
      if (serverRes.config.otpTemplate) setOtpTemplate(serverRes.config.otpTemplate);
    }

    // Save non-secret flags & custom OTP template locally + sync to Firestore with updatedAt timestamp
    storage.setItem('marketbd_sms_provider_id', providerId);
    storage.setItem('marketbd_sms_provider_name', providerName.trim());
    storage.setItem('marketbd_sms_api_url', smsApiUrl.trim());
    storage.setItem('marketbd_sms_masking_enabled', String(smsMaskingEnabled));
    storage.setItem('marketbd_sms_no_reply_mode', String(smsNoReplyMode));
    storage.setItem('marketbd_sms_sender_id', resolvedSenderId);
    storage.setItem('marketbd_sms_otp_template', cleanTemplate);
    storage.setItem('marketbd_sms_updated_at', savedAt);
    if (smsMaskingEnabled) {
      storage.setItem('marketbd_sms_masking_sender_id', resolvedSenderId);
    } else {
      storage.setItem('marketbd_sms_non_masking_sender_id', resolvedSenderId);
    }
    storage.setItem('marketbd_sms_sid', smsSid.trim());
    storage.setItem('marketbd_live_mode', String(smsIsLive));

    const firestoreSaved = await safeFirestoreSetDoc(
      doc(db, 'settings', 'sms_config'),
      {
        providerId,
        providerName: providerName.trim(),
        apiUrl: smsApiUrl.trim(),
        senderId: resolvedSenderId,
        otpTemplate: cleanTemplate,
        maskingEnabled: smsMaskingEnabled,
        noReplyMode: smsNoReplyMode,
        isLiveMode: smsIsLive,
        updatedAt: savedAt,
      },
      { merge: true }
    );

    setNeedsGoogleSync(!firestoreSaved);

    if (serverRes.persistedOnServer === false && !firestoreSaved) {
      const prefix = serverRes.config?.hasApiKey ? '⚠️' : '⚠️';
      setSmsStatusMsg(
        `${prefix} ${
          bn
            ? 'বর্তমান সেশনে সেভ হয়েছে, কিন্তু স্থায়ী Firestore সিঙ্ক হয়নি (কারণ Google Admin দিয়ে Firebase সাইন-ইন করা নেই)। রিস্টার্টের পরও নতুন ৭০-অক্ষরের টেক্সট ধরে রাখতে নিচের "Google Admin দিয়ে স্থায়ী সিঙ্ক" বাটনে ক্লিক করুন।'
            : 'Saved in current session only. Sign in with Google Admin below to persist permanently in Firestore across server restarts.'
        }`
      );
      return;
    }

    setSmsStatusMsg(
      bn
        ? `✅ স্থায়ীভাবে সংরক্ষিত হয়েছে! (${smsMaskingEnabled ? 'Masking' : 'Non-Masking'}: ${resolvedSenderId})`
        : `✅ Saved permanently! (${smsMaskingEnabled ? 'Masking' : 'Non-Masking'}: ${resolvedSenderId})`
    );
    setTimeout(() => setSmsStatusMsg(''), 5000);
  };

  const handleGoogleAdminFirestoreSync = async () => {
    try {
      setSmsSaving(true);
      await signInWithPopup(auth, new GoogleAuthProvider());
      const resolvedSenderId = smsMaskingEnabled
        ? (maskingSenderId.trim() || smsSenderId.trim() || 'MarketBD.Net')
        : (nonMaskingSenderId.trim() && nonMaskingSenderId.trim() !== 'MarketBD.Net'
            ? nonMaskingSenderId.trim()
            : '1234');
      const savedAt = new Date().toISOString();
      const cleanTemplate = otpTemplate
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      const ok = await safeFirestoreSetDoc(
        doc(db, 'settings', 'sms_config'),
        {
          providerId,
          providerName: providerName.trim(),
          apiUrl: smsApiUrl.trim(),
          senderId: resolvedSenderId,
          otpTemplate: cleanTemplate,
          maskingEnabled: smsMaskingEnabled,
          noReplyMode: smsNoReplyMode,
          isLiveMode: smsIsLive,
          updatedAt: savedAt,
        },
        { merge: true }
      );
      setSmsSaving(false);
      if (ok) {
        setNeedsGoogleSync(false);
        storage.setItem('marketbd_sms_updated_at', savedAt);
        setSmsStatusMsg(
          bn
            ? '✅ Google Admin ভেরিফাইড! আপনার ৭০ অক্ষরের কাস্টম OTP টেক্সট স্থায়ীভাবে Firestore-এ সংরক্ষিত হয়েছে।'
            : '✅ Permanently synced to Firestore!'
        );
      } else {
        setSmsStatusMsg(
          bn
            ? '❌ এই Google একাউন্টের Admin Firestore পারমিশন নেই (official.marketbd@gmail.com / official.marketsbd@gmail.com দিয়ে লগইন করুন)।'
            : '❌ This Google account lacks Firestore admin permission.'
        );
      }
    } catch (err: any) {
      setSmsSaving(false);
      setSmsStatusMsg(`❌ ${err?.message || 'Google sync failed'}`);
    }
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
    const resolvedSenderId = smsMaskingEnabled
      ? (maskingSenderId.trim() || smsSenderId.trim() || 'MarketBD.Net')
      : (nonMaskingSenderId.trim() && nonMaskingSenderId.trim() !== 'MarketBD.Net'
          ? nonMaskingSenderId.trim()
          : '1234');
    const activeTemplate = /\{otp\}/i.test(otpTemplate)
      ? otpTemplate.replace(/\r\n?/g, '\n').trim()
      : DEFAULT_OTP_TEMPLATE;

    setSendMsg(
      bn
        ? `${smsMaskingEnabled ? 'Masking' : 'Non-Masking'} (${resolvedSenderId}) দিয়ে লাইভ OTP পাঠানো হচ্ছে...`
        : `Sending live OTP via ${smsMaskingEnabled ? 'Masking' : 'Non-Masking'} (${resolvedSenderId})...`
    );

    // Run atomic admin OTP test directly with the ticked Masking / Non-Masking route & key
    const res = await testAdminSmsOtp({
      phone: smsTargetPhone,
      providerId,
      apiUrl: smsApiUrl.trim(),
      apiKey: smsApiKey.trim() || undefined,
      senderId: resolvedSenderId,
      sid: smsSid.trim(),
      maskingEnabled: smsMaskingEnabled,
      noReplyMode: smsNoReplyMode,
      isLiveMode: smsIsLive,
      otpTemplate: activeTemplate,
      adminSecret,
    });
    if (res.ok) {
      setSendMsg(
        bn
          ? `✅ OTP পাঠানো সফল হয়েছে! (মোড: ${smsMaskingEnabled ? 'Masking' : 'Non-Masking'}, Sender: ${res.usedCaller || resolvedSenderId}, রুট: ${res.usedEndpoint || 'otpsend'})`
          : `✅ Test OTP sent! (Mode: ${smsMaskingEnabled ? 'Masking' : 'Non-Masking'}, Sender: ${res.usedCaller || resolvedSenderId}, Route: ${res.usedEndpoint || 'otpsend'})`
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
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl text-[11px] text-amber-950 dark:text-amber-100 leading-relaxed space-y-1.5">
              <p className="font-extrabold">
                {bn
                  ? '⚠️ এই হোস্টিং সার্ভারে এখনো SMS_API_KEY সেট নেই — তাই সাধারণ লগইন ওটিপি যাচ্ছে না।'
                  : '⚠️ SMS_API_KEY is not set in Vercel Production Environment Variables yet — customer OTPs will not send.'}
              </p>
              <p className="font-normal opacity-90">
                {bn
                  ? 'Vercel Dashboard → Project → Settings → Environment Variables (Production টিক দিয়ে) নিচের ভ্যালুগুলো হুবহু যোগ করে Redeploy করুন:'
                  : 'In Vercel Dashboard → Project → Settings → Environment Variables (check Production), set these exact values and Redeploy:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-mono text-[10px] bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
                <div><span className="font-black">SMS_API_KEY</span> = your_bulksms_key</div>
                <div><span className="font-black">SMS_MASKING_ENABLED</span> = {smsMaskingEnabled ? 'true' : 'false'}</div>
                <div><span className="font-black">SMS_CALLER_ID</span> = {smsMaskingEnabled ? (maskingSenderId || 'MarketBD.Net') : (nonMaskingSenderId || '1234')}</div>
                <div><span className="font-black">SMS_OTP_TEMPLATE</span> = Your MarketBD.Net OTP is {'{otp}'}</div>
              </div>
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

            {/* Masking & Non-Masking Route Selector (Tick Cards) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{bn ? 'OTP রুট নির্বাচন করুন (Masking / Non-Masking টিক দিন)' : 'Select OTP Route (Tick Masking or Non-Masking)'}</span>
                </label>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  !smsMaskingEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                }`}>
                  {!smsMaskingEnabled ? (bn ? 'নন-মাসকিং চালু' : 'Non-Masking') : (bn ? 'মাসকিং চালু' : 'Masking')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Non-Masking Tick Card */}
                <button
                  type="button"
                  onClick={() => handleSelectMaskingMode(false)}
                  aria-pressed={!smsMaskingEnabled}
                  className={`text-left p-3 rounded-2xl border-2 transition cursor-pointer flex items-start gap-2.5 ${
                    !smsMaskingEnabled
                      ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                      !smsMaskingEnabled
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {bn ? 'নন-মাসকিং (Non-Masking)' : 'Non-Masking'}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                        {bn ? 'সহজ ও চালু' : 'Recommended'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                      {bn
                        ? 'BTRC ব্র্যান্ড অনুমোদন ছাড়া 1234 বা নম্বর দিয়ে সরাসরি OTP পাঠাবে।'
                        : 'Sends OTP directly via 1234 or virtual number without BTRC brand approval.'}
                    </p>
                  </div>
                </button>

                {/* Masking Tick Card */}
                <button
                  type="button"
                  onClick={() => handleSelectMaskingMode(true)}
                  aria-pressed={smsMaskingEnabled}
                  className={`text-left p-3 rounded-2xl border-2 transition cursor-pointer flex items-start gap-2.5 ${
                    smsMaskingEnabled
                      ? 'border-pink-500 bg-pink-50/90 dark:bg-pink-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                      smsMaskingEnabled
                        ? 'border-pink-600 bg-pink-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {bn ? 'মাসকিং (Masking Brand)' : 'Masking (Brand Name)'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                      {bn
                        ? 'প্রোভাইডার থেকে Brand Name (যেমন MarketBD.Net) অনুমোদিত থাকলে টিক দিন।'
                        : 'Tick only if your Brand Name (e.g. MarketBD.Net) is approved by your provider.'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Active Sender / Caller ID Input based on selected route */}
              <div className={`grid gap-2.5 ${selectedPreset?.requiresSid ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {smsMaskingEnabled
                        ? bn
                          ? '🏷️ অনুমোদিত Masking Sender ID'
                          : '🏷️ Approved Masking Sender ID'
                        : bn
                        ? '📱 Non-Masking Caller ID (ডিফল্ট: 1234)'
                        : '📱 Non-Masking Caller ID (default: 1234)'}
                    </label>
                    {!smsMaskingEnabled && nonMaskingSenderId !== '1234' && (
                      <button
                        type="button"
                        onClick={() => handleSenderIdChange('1234')}
                        className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                      >
                        {bn ? '1234 বসান' : 'Use 1234'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={smsMaskingEnabled ? maskingSenderId : nonMaskingSenderId}
                    onChange={e => handleSenderIdChange(e.target.value)}
                    placeholder={smsMaskingEnabled ? 'MarketBD.Net' : '1234 বা 88096...'}
                    className={`${inputCls} font-mono`}
                  />
                  {smsMaskingEnabled && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 font-semibold">
                      {bn
                        ? '⚠️ ব্র্যান্ড মাসকিং অনুমোদিত না থাকলে গেটওয়ে ১০১১ এরর দেবে—সেক্ষেত্রে Non-Masking টিক দিন।'
                        : '⚠️ If brand masking is not approved by BTRC/provider, OTP will fail—tick Non-Masking instead.'}
                    </p>
                  )}
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

              {/* Live SMS Mode Toggle */}
              <label className="flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 cursor-pointer select-none">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {bn ? 'লাইভ এসএমএস মোড (Live OTP চালু)' : 'Live SMS Mode (Send Real OTPs)'}
                </span>
                <input
                  type="checkbox"
                  checked={smsIsLive}
                  onChange={e => setSmsIsLive(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 cursor-pointer"
                />
              </label>

              {/* One-Way / No-Reply Mode Toggle */}
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-1.5">
                <label className="flex items-center justify-between gap-2 text-xs cursor-pointer select-none">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                    {bn
                      ? '🚫 গ্রাহকের রিপ্লাই অপশন বন্ধ (One-Way No-Reply SMS)'
                      : '🚫 Disable Customer Replies (One-Way No-Reply Mode)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={smsNoReplyMode}
                    onChange={e => setSmsNoReplyMode(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </label>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-snug">
                  {bn
                    ? 'সব OTP ও SMS-এ "Do not reply" যুক্ত হবে এবং রিপ্লাইযোগ্য ১১-ডিজিট নম্বর Sender ID হিসেবে ব্লক থাকবে। (গ্রাহকের ফোনে রিপ্লাই ইনপুট বক্স পুরোপুরি লুকাতে প্রোভাইডারের অনুমোদিত Alphanumeric Masking "MarketBD.Net" চালু রাখুন।)'
                    : 'Appends "Do not reply" to outgoing OTP/SMS and blocks personal 11-digit phone numbers as Sender ID. For carrier-level hiding of the handset reply box, use an approved Alphanumeric Masking Sender ID (MarketBD.Net).'}
                </p>
              </div>
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
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  ✉️ {bn ? 'ওটিপি মেসেজ টেমপ্লেট' : 'OTP Message Template'}
                </label>
                <div className="flex items-center gap-2">
                  {otpTemplate !== DEFAULT_OTP_TEMPLATE && (
                    <button
                      type="button"
                      onClick={() => setOtpTemplate(DEFAULT_OTP_TEMPLATE)}
                      className="text-[10px] font-extrabold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                    >
                      {bn ? '১-লাইন ডিফল্ট বসান' : 'Use 1-Line Default'}
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-slate-500">
                    ({otpTemplate.replace(/\{otp\}/gi, '123456').length}/70)
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                value={otpTemplate}
                onChange={e => setOtpTemplate(e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                {bn ? '{otp} লিখলে ৬ ডিজিটের কোড বসবে (৩-লাইন / সর্বোচ্চ ৭০ অক্ষর)।' : 'Use {otp} placeholder (supports multiline up to 70 chars).'}
              </p>
              <div className="mt-1.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px]">
                <span className="font-bold text-slate-500 dark:text-slate-400">
                  {bn ? 'প্রিভিউ SMS: ' : 'SMS Preview: '}
                </span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-100 break-words whitespace-pre-line mt-1">
                  {otpTemplate.replace(/\r\n?/g, '\n').trim().replace(/\{otp\}/gi, '123456')}
                </div>
              </div>
              {/[&]/.test(otpTemplate) && (
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {bn
                    ? '💡 "&" ও একাধিক লাইন সহ কাস্টম টেমপ্লেট স্বয়ংক্রিয়ভাবে সঠিক গেটওয়ে রুটে পাঠানো হবে।'
                    : '💡 Multiline templates & "&" are preserved and routed automatically via the compatible gateway endpoint.'}
                </p>
              )}
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
                  ? 'এসএমএস ও OTP রুট সেভ করুন'
                  : 'Save SMS & OTP Route'}
              </span>
            </button>

            {smsStatusMsg && (
              <div
                className={`p-2.5 border text-xs font-bold rounded-xl flex items-center gap-2 ${
                  smsStatusMsg.startsWith('❌')
                    ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200'
                    : smsStatusMsg.startsWith('⚠️')
                    ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : smsStatusMsg.startsWith('ℹ️')
                    ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{smsStatusMsg}</span>
              </div>
            )}

            {needsGoogleSync && (
              <button
                type="button"
                onClick={handleGoogleAdminFirestoreSync}
                disabled={smsSaving}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {bn
                    ? 'Google Admin দিয়ে স্থায়ী Firestore সিঙ্ক করুন'
                    : 'Sync Permanently to Firestore via Google Admin'}
                </span>
              </button>
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
