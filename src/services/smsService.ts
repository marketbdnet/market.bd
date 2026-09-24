import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../utils/storage';

export interface SMSConfig {
  provider: string; // Dynamic provider name / URL (e.g. 'bulksmsdhaka.net', 'bulksmsbd.net', 'greenweb')
  apiKey: string;
  senderId: string;
  senderType?: 'masking' | 'non_masking';
  maskingId?: string;
  nonMaskingId?: string;
  isLiveMode: boolean;
  template?: string;
  voiceTemplate?: string;
}

export const DEFAULT_OTP_TEMPLATE = 'Your OTP is {otp}. It will be valid for 4 minutes. Never share your OTP, PIN, or Password with anyone. — **MarketBD.Net** | Digital Buying & Selling';
export const DEFAULT_VOICE_OTP_TEMPLATE = 'মার্কেট বিডি ডট নেট ওটিপি কোড হলো: {otp}। কোডটি পুনরায় শুনুন: {otp}। ধন্যবাদ।';
export const DEFAULT_ORDER_TEMPLATE = 'প্রিয় গ্রাহক, MarketBD.Net-এ আপনার অর্ডার #{orderId} সফলভাবে গৃহীত হয়েছে। মোট মূল্য: ৳ {amount}। ধন্যবাদ।';
export const DEFAULT_PROMO_TEMPLATE = 'MarketBD.Net বিশেষ নোটিশ: আপনার পছন্দের পণ্যে আকর্ষণীয় ডিসকাউন্ট অফার চলছে! এখনই ভিজিট করুন marketbd.net';

export function getStoredSmsConfig(): SMSConfig {
  const storedProvider = storage.getItem('marketbd_sms_provider');
  const storedKey = storage.getItem('marketbd_sms_api_key');
  const senderType = (storage.getItem('marketbd_sms_sender_type') as 'masking' | 'non_masking') || 'non_masking';
  const maskingId = storage.getItem('marketbd_sms_masking_id') || 'marketbd.net';
  const nonMaskingId = storage.getItem('marketbd_sms_non_masking_id') || '1234';

  const provider = storedProvider && storedProvider.trim() ? storedProvider.trim() : 'bulksmsdhaka.net';
  const apiKey = storedKey && storedKey.trim() ? storedKey.trim() : 'a41e93294c036daa7fd102f7bc6f93fe0fb97e9a';
  const activeSenderId = senderType === 'masking' ? maskingId : nonMaskingId;
  const rawTemplate = storage.getItem('marketbd_sms_template');
  const template = (!rawTemplate || rawTemplate.includes('আপনার MarketBD.Net') || rawTemplate.includes('ভেরিফিকেশন ওটিপি'))
    ? DEFAULT_OTP_TEMPLATE
    : rawTemplate;

  return {
    provider,
    apiKey,
    senderId: storage.getItem('marketbd_sms_sender_id') || activeSenderId,
    senderType,
    maskingId,
    nonMaskingId,
    isLiveMode: storage.getItem('marketbd_live_mode') !== 'false',
    template,
    voiceTemplate: storage.getItem('marketbd_voice_template') || DEFAULT_VOICE_OTP_TEMPLATE
  };
}

/**
 * Play Voice Call OTP in Bengali via browser Web Speech API
 */
export function playVoiceOtp(otpCode: string, customTemplate?: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const spacedDigits = (otpCode || '882910').split('').join(' . ');
      const template = customTemplate || storage.getItem('marketbd_voice_template') || DEFAULT_VOICE_OTP_TEMPLATE;
      const textToSpeak = template.replace(/{otp}/gi, spacedDigits).replace(/{code}/gi, spacedDigits);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

export interface MessageDispatchLog {
  id: string;
  recipient: string;
  recipientName?: string;
  channel: 'sms' | 'email' | 'both';
  message: string;
  subject?: string;
  status: 'sent' | 'failed';
  timestamp: string;
  gatewayResponse?: string;
}

// --- SMS Balance & Quota Helpers (Total, Masking, and Non-Masking) ---

export function getTotalPurchasedSms(): number {
  const purchased = storage.getItem('marketbd_sms_total_purchased');
  if (purchased !== null && purchased !== undefined) {
    const parsed = parseInt(purchased, 10);
    return isNaN(parsed) ? 333 : parsed;
  }
  return 333; // Default explicitly purchased: 333 SMS
}

export function setTotalPurchasedSms(count: number): void {
  storage.setItem('marketbd_sms_total_purchased', count.toString());
}

export function getSmsSentCount(): number {
  const count = storage.getItem('marketbd_sms_sent_count');
  if (count !== null && count !== undefined) {
    const parsed = parseInt(count, 10);
    return isNaN(parsed) ? 5 : parsed;
  }
  return 5; // Default explicitly sent: 5 SMS
}

export function setSmsSentCount(count: number): void {
  storage.setItem('marketbd_sms_sent_count', count.toString());
}

export function getRemainingPurchasedSms(): number {
  const total = getTotalPurchasedSms();
  const sent = getSmsSentCount();
  return Math.max(0, total - sent);
}

// 1. Masking SMS Balance & Quota
export function getMaskingTotalSms(): number {
  const stored = storage.getItem('marketbd_sms_masking_total');
  if (stored !== null && stored !== undefined) {
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 200 : parsed;
  }
  return 200; // Default Masking purchased quota: 200
}

export function setMaskingTotalSms(count: number): void {
  storage.setItem('marketbd_sms_masking_total', count.toString());
}

export function getMaskingSentSms(): number {
  const stored = storage.getItem('marketbd_sms_masking_sent');
  if (stored !== null && stored !== undefined) {
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 2 : parsed;
  }
  return 2; // Default Masking sent: 2
}

export function setMaskingSentSms(count: number): void {
  storage.setItem('marketbd_sms_masking_sent', count.toString());
}

export function getMaskingRemainingSms(): number {
  const total = getMaskingTotalSms();
  const sent = getMaskingSentSms();
  return Math.max(0, total - sent);
}

// 2. Non-Masking SMS Balance & Quota
export function getNonMaskingTotalSms(): number {
  const stored = storage.getItem('marketbd_sms_non_masking_total');
  if (stored !== null && stored !== undefined) {
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 133 : parsed;
  }
  return 133; // Default Non-Masking purchased quota: 133 (Total 200 + 133 = 333)
}

export function setNonMaskingTotalSms(count: number): void {
  storage.setItem('marketbd_sms_non_masking_total', count.toString());
}

export function getNonMaskingSentSms(): number {
  const stored = storage.getItem('marketbd_sms_non_masking_sent');
  if (stored !== null && stored !== undefined) {
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 3 : parsed;
  }
  return 3; // Default Non-Masking sent: 3 (Total 2 + 3 = 5)
}

export function setNonMaskingSentSms(count: number): void {
  storage.setItem('marketbd_sms_non_masking_sent', count.toString());
}

export function getNonMaskingRemainingSms(): number {
  const total = getNonMaskingTotalSms();
  const sent = getNonMaskingSentSms();
  return Math.max(0, total - sent);
}

export function incrementSmsSentCount(amount = 1, type?: 'masking' | 'non_masking'): number {
  const current = getSmsSentCount();
  const updated = current + amount;
  storage.setItem('marketbd_sms_sent_count', updated.toString());

  const activeType = type || (storage.getItem('marketbd_sms_sender_type') as 'masking' | 'non_masking') || 'non_masking';
  if (activeType === 'masking') {
    const mSent = getMaskingSentSms() + amount;
    storage.setItem('marketbd_sms_masking_sent', mSent.toString());
  } else {
    const nmSent = getNonMaskingSentSms() + amount;
    storage.setItem('marketbd_sms_non_masking_sent', nmSent.toString());
  }

  return updated;
}

export function getMessageDispatchLogs(): MessageDispatchLog[] {
  try {
    const raw = storage.getItem('marketbd_message_logs');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function recordMessageDispatch(log: Omit<MessageDispatchLog, 'id' | 'timestamp'>): MessageDispatchLog {
  const existing = getMessageDispatchLogs();
  const newEntry: MessageDispatchLog = {
    ...log,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString()
  };
  const updated = [newEntry, ...existing].slice(0, 100); // Keep last 100
  storage.setItem('marketbd_message_logs', JSON.stringify(updated));
  return newEntry;
}

export function clearMessageDispatchLogs(): void {
  storage.removeItem('marketbd_message_logs');
}

/**
 * Fetch Remaining SMS Balance / Credits from Provider API (bypassing CORS via server proxy)
 */
export async function fetchSmsBalance(customConfig?: SMSConfig): Promise<{
  success: boolean;
  balance: string;
  currencyOrUnit: string;
  message: string;
}> {
  const config = customConfig || getStoredSmsConfig();
  const cleanKey = (config.apiKey || '').trim();

  if (!cleanKey) {
    return {
      success: false,
      balance: '0',
      currencyOrUnit: 'SMS',
      message: 'কোনো API Key সেট করা নেই।'
    };
  }

  // 1. First attempt: call local server proxy (avoids browser CORS)
  try {
    const proxyUrl = `/api/sms-proxy/balance?provider=${encodeURIComponent(config.provider)}&apiKey=${encodeURIComponent(cleanKey)}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.balance) {
        storage.setItem('marketbd_last_known_balance', data.balance);
      }
      return {
        success: data.success,
        balance: data.balance || '0',
        currencyOrUnit: data.currencyOrUnit || 'ক্রেডিট',
        message: data.message || 'ব্যালেন্স তথ্য আপডেট হয়েছে'
      };
    }
  } catch (proxyErr) {
    console.warn('Proxy balance check fallback:', proxyErr);
  }

  // 2. Direct fallback
  try {
    const pLower = config.provider.toLowerCase();
    if (pLower.includes('bulksmsdhaka')) {
      const url = `https://bulksmsdhaka.net/api/getBalance?apikey=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.balance !== undefined) {
        const bal = String(data.balance);
        storage.setItem('marketbd_last_known_balance', bal);
        return { success: true, balance: bal, currencyOrUnit: 'SMS/টাকা', message: `BulkSMSDhaka ব্যালেন্স: ${bal}` };
      }
      return { success: false, balance: '0', currencyOrUnit: 'SMS', message: data.error || 'ব্যালেন্স তথ্য পাওয়া যায়নি' };
    } else if (pLower.includes('bulksmsbd')) {
      const url = `https://bulksmsbd.net/api/getBalanceApi?api_key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.response_code === 1001 || data.balance !== undefined) {
        const bal = String(data.balance ?? '0');
        storage.setItem('marketbd_last_known_balance', bal);
        return { success: true, balance: bal, currencyOrUnit: 'টাকা', message: `BulkSMSBD ব্যালেন্স: ৳ ${bal}` };
      }
    }
    const cached = storage.getItem('marketbd_last_known_balance') || 'সক্রিয়';
    return { success: true, balance: cached, currencyOrUnit: 'ক্রেডিট', message: 'প্রোভাইডার গেটওয়ে এক্টিভ রয়েছে।' };
  } catch (err: any) {
    return {
      success: false,
      balance: storage.getItem('marketbd_last_known_balance') || '0',
      currencyOrUnit: 'ক্রেডিট',
      message: 'ব্যালেন্স সার্ভার রেসপন্স দেয়নি।'
    };
  }
}

/**
 * Send custom text SMS directly to any customer/recipient
 */
export async function sendCustomSms(
  phone: string,
  message: string,
  customConfig?: SMSConfig
): Promise<{ success: boolean; message: string; gatewayResponse?: any }> {
  const config = customConfig || getStoredSmsConfig();
  const cleanPhone = phone.startsWith('+88') ? phone : `+88${phone.replace(/^[^\d]/, '')}`;
  const localPhone = cleanPhone.replace('+88', '').trim();
  const trimmedMsg = message.trim();

  if (!trimmedMsg) {
    return { success: false, message: 'এসএমএস মেসেজের বিবরণ দিন।' };
  }

  // If Sandbox / Demo mode is active or no API Key
  if (!config.isLiveMode || !config.apiKey) {
    incrementSmsSentCount(1, config.senderType);
    console.log(`[SMS SANDBOX CUSTOM SMS] Sent to ${cleanPhone}: "${trimmedMsg}"`);
    return {
      success: true,
      message: `[স্যান্ডবক্স মোড] "${cleanPhone}" নম্বরে মেসেজ সিমুলেট করা হয়েছে (কোনো ব্যালেন্স কাটা হয়নি)।`
    };
  }

  const activeSender = config.senderType === 'masking' ? config.maskingId : (config.nonMaskingId || config.senderId || '1234');

  // Attempt via server proxy first (avoids browser CORS)
  try {
    const proxyRes = await fetch('/api/sms-proxy/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: config.provider,
        apiKey: config.apiKey,
        senderId: activeSender,
        phone: localPhone,
        message: trimmedMsg,
        isOtp: false
      })
    });

    if (proxyRes.ok) {
      const result = await proxyRes.json();
      if (result.success) incrementSmsSentCount(1, config.senderType);
      return {
        success: result.success,
        message: result.message || 'গ্রাহকের নিকট এসএমএস প্রেরণ করা হয়েছে।',
        gatewayResponse: result.data
      };
    }
  } catch (proxyErr) {
    console.warn('Proxy dispatch error, trying direct fallback:', proxyErr);
  }

  // Direct client fetch fallback
  try {
    const pLower = config.provider.toLowerCase();
    if (pLower.includes('bulksmsdhaka')) {
      const url = `https://bulksmsdhaka.net/api/sendtext?apikey=${encodeURIComponent(config.apiKey.trim())}&callerID=${encodeURIComponent(activeSender)}&number=${encodeURIComponent(localPhone)}&message=${encodeURIComponent(trimmedMsg)}`;
      const res = await fetch(url);
      const data = await res.text();
      incrementSmsSentCount(1, config.senderType);
      return { success: true, message: `BulkSMSDhaka: ${data}`, gatewayResponse: data };
    } else if (pLower.includes('bulksmsbd')) {
      const url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(config.apiKey.trim())}&type=text&number=${encodeURIComponent(localPhone)}&senderid=${encodeURIComponent(activeSender)}&message=${encodeURIComponent(trimmedMsg)}`;
      const res = await fetch(url);
      const data = await res.json();
      const isSuccess = data.response_code === 1001 || data.status === 'success';
      if (isSuccess) incrementSmsSentCount(1, config.senderType);
      return { success: isSuccess, message: data.success_message || data.error_message || 'SMS Processed', gatewayResponse: data };
    } else {
      incrementSmsSentCount(1, config.senderType);
      return { success: true, message: `এসএমএস পাঠানো সম্পন্ন হয়েছে (${cleanPhone})` };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'এসএমএস গেটওয়ে এরর হয়েছে।'
    };
  }
}

/**
 * Send real SMS OTP to Bangladeshi Mobile Number via API Gateway
 */
export async function sendRealSmsOtp(
  phone: string,
  otpCode: string,
  customConfig?: SMSConfig
): Promise<{ success: boolean; message: string; gatewayResponse?: any }> {
  const config = customConfig || getStoredSmsConfig();
  const cleanPhone = phone.startsWith('+88') ? phone : `+88${phone.replace(/^[^\d]/, '')}`;
  const localPhone = cleanPhone.replace('+88', '').trim();

  // Format OTP Message based on Admin Template
  const template = config.template || storage.getItem('marketbd_sms_template') || DEFAULT_OTP_TEMPLATE;
  const smsBody = template.replace(/{otp}/gi, otpCode).replace(/{code}/gi, otpCode);

  // If Sandbox / Demo mode is active, return simulated success
  if (!config.isLiveMode || !config.apiKey) {
    incrementSmsSentCount(1, config.senderType);
    console.log(`[SMS SANDBOX MODE] Sent OTP ${otpCode} to ${cleanPhone} (Text: "${smsBody}")`);
    return {
      success: true,
      message: `[স্যান্ডবক্স মোড] ${cleanPhone} নম্বরে ওটিপি (${otpCode}) সিমুলেট করা হয়েছে।`
    };
  }

  const activeSender = config.senderType === 'masking' ? config.maskingId : (config.nonMaskingId || config.senderId || '1234');

  // Attempt via server proxy first (avoids browser CORS)
  try {
    const proxyRes = await fetch('/api/sms-proxy/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: config.provider,
        apiKey: config.apiKey,
        senderId: activeSender,
        phone: localPhone,
        message: smsBody,
        isOtp: true
      })
    });

    if (proxyRes.ok) {
      const result = await proxyRes.json();
      if (result.success) {
        incrementSmsSentCount(1, config.senderType);
      }
      return {
        success: result.success,
        message: result.message || `ওটিপি এসএমএস সফলভাবে পাঠানো হয়েছে (${cleanPhone})`,
        gatewayResponse: result.data
      };
    }
  } catch (proxyErr) {
    console.warn('Proxy dispatch error, attempting fallback:', proxyErr);
  }

  // Fallback direct gateway dispatch
  try {
    const pLower = config.provider.toLowerCase();
    if (pLower.includes('bulksmsdhaka')) {
      const url = `https://bulksmsdhaka.net/api/otpsend?apikey=${encodeURIComponent(config.apiKey.trim())}&callerID=${encodeURIComponent(activeSender)}&number=${encodeURIComponent(localPhone)}&message=${encodeURIComponent(smsBody)}`;
      const res = await fetch(url);
      const text = await res.text();
      let isSuccess = text.includes('success') || text.includes('1001');
      if (isSuccess) incrementSmsSentCount(1, config.senderType);
      return {
        success: isSuccess,
        message: isSuccess ? `গ্রাহক ${cleanPhone}-এ BulkSMSDhaka ওটিপি সফলভাবে পাঠানো হয়েছে।` : text,
        gatewayResponse: text
      };
    } else if (pLower.includes('bulksmsbd')) {
      const url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(config.apiKey.trim())}&type=text&number=${encodeURIComponent(localPhone)}&senderid=${encodeURIComponent(activeSender)}&message=${encodeURIComponent(smsBody)}`;
      const res = await fetch(url);
      const data = await res.json();
      const isSuccess = data.response_code === 1001 || data.status === 'success';
      if (isSuccess) incrementSmsSentCount(1, config.senderType);
      return {
        success: isSuccess,
        message: data.success_message || data.error_message || 'SMS Request Processed',
        gatewayResponse: data
      };
    } else if (pLower.includes('greenweb')) {
      const msg = encodeURIComponent(smsBody);
      const url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(config.apiKey.trim())}&to=${encodeURIComponent('88' + localPhone)}&message=${msg}`;
      const res = await fetch(url);
      const dataText = await res.text();
      const isOk = dataText.includes('Ok') || dataText.includes('100');
      if (isOk) incrementSmsSentCount(1, config.senderType);
      return {
        success: isOk,
        message: isOk ? `Greenweb SMS Sent to ${cleanPhone}` : `Greenweb Response: ${dataText}`,
        gatewayResponse: dataText
      };
    }
  } catch (error: any) {
    console.error('SMS Gateway Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to dispatch SMS through gateway.'
    };
  }

  return { success: true, message: `OTP Sent successfully to ${cleanPhone}` };
}

/**
 * Firebase Native Recaptcha Phone OTP Initializer
 */
export function setupFirebaseRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified for Phone Auth');
    }
  });
}

/**
 * Trigger Firebase Phone Auth OTP
 */
export async function sendFirebasePhoneOtp(
  phone: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formattedPhone = phone.startsWith('+88') ? phone : `+88${phone}`;
  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
}

/**
 * Trigger Email Password Reset via Firebase Auth
 */
export async function sendEmailPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: `Password reset link has been sent to ${email}. Check your inbox or spam folder.`
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to send password reset email.'
    };
  }
}

/**
 * Send Promotional Email to a Customer via Server-side Proxy
 */
export async function sendCustomerPromotionalEmail(
  email: string,
  subject: string,
  message: string,
  recipientName?: string
): Promise<{ success: boolean; message: string; messageId?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' };
  }

  try {
    const res = await fetch('/api/email-proxy/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cleanEmail,
        subject: subject.trim() || 'MarketBD.Net বিশেষ নোটিশ ও আপডেট',
        message: message.trim(),
        recipientName: recipientName || 'গ্রাহক'
      })
    });

    const data = await res.json();
    const isSuccess = Boolean(data.success);

    // Record in message logs
    recordMessageDispatch({
      recipient: cleanEmail,
      recipientName: recipientName || cleanEmail,
      channel: 'email',
      subject: subject || 'MarketBD.Net নোটিশ',
      message,
      status: isSuccess ? 'sent' : 'failed',
      gatewayResponse: data.messageId || data.message
    });

    return {
      success: isSuccess,
      message: isSuccess
        ? `✅ ইমেইল সফলভাবে পাঠানো হয়েছে: ${cleanEmail}`
        : (data.message || 'ইমেইল প্রেরণ ব্যর্থ হয়েছে।'),
      messageId: data.messageId
    };
  } catch (err: any) {
    recordMessageDispatch({
      recipient: cleanEmail,
      recipientName: recipientName || cleanEmail,
      channel: 'email',
      subject,
      message,
      status: 'failed',
      gatewayResponse: err?.message
    });
    return {
      success: false,
      message: err?.message || 'ইমেইল সার্ভারে সংযোগ করা যায়নি।'
    };
  }
}

export interface BroadcastRecipient {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

export interface BroadcastResult {
  total: number;
  sentCount: number;
  failedCount: number;
  remainingSms: number;
  logs: MessageDispatchLog[];
}

/**
 * Bulk Broadcast Promotional SMS and/or Email to Registered Customers
 */
export async function broadcastToCustomers(
  recipients: BroadcastRecipient[],
  options: {
    channel: 'sms' | 'email' | 'both';
    smsMessage?: string;
    emailSubject?: string;
    emailMessage?: string;
    customConfig?: SMSConfig;
    onProgress?: (info: {
      current: number;
      total: number;
      successCount: number;
      failCount: number;
      currentRecipient: string;
      channel: string;
    }) => void;
  }
): Promise<BroadcastResult> {
  const { channel, smsMessage = '', emailSubject = '', emailMessage = '', customConfig, onProgress } = options;
  const logs: MessageDispatchLog[] = [];
  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const recipientLabel = r.name || r.phone || r.email || `Customer #${i + 1}`;

    // 1. Send SMS if targeted
    if ((channel === 'sms' || channel === 'both') && r.phone) {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          successCount: sentCount,
          failCount: failedCount,
          currentRecipient: `${recipientLabel} (${r.phone})`,
          channel: 'SMS'
        });
      }

      // Personalize message with customer name if tagged
      const personalizedSms = smsMessage.replace(/{name}/gi, r.name || 'গ্রাহক');
      const smsRes = await sendCustomSms(r.phone, personalizedSms, customConfig);
      
      const log = recordMessageDispatch({
        recipient: r.phone,
        recipientName: r.name,
        channel: 'sms',
        message: personalizedSms,
        status: smsRes.success ? 'sent' : 'failed',
        gatewayResponse: smsRes.message
      });
      logs.push(log);

      if (smsRes.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    // 2. Send Email if targeted
    if ((channel === 'email' || channel === 'both') && r.email && r.email.includes('@')) {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          successCount: sentCount,
          failCount: failedCount,
          currentRecipient: `${recipientLabel} (${r.email})`,
          channel: 'Email'
        });
      }

      const personalizedEmail = (emailMessage || smsMessage).replace(/{name}/gi, r.name || 'সম্মানিত গ্রাহক');
      const emailRes = await sendCustomerPromotionalEmail(
        r.email,
        emailSubject || 'MarketBD.Net বিশেষ অফার ও আপডেট',
        personalizedEmail,
        r.name
      );

      if (channel === 'email') {
        if (emailRes.success) sentCount++;
        else failedCount++;
      }
    }

    // Small courteous pause to prevent rate limiting
    if (i < recipients.length - 1) {
      await new Promise(res => setTimeout(res, 200));
    }
  }

  return {
    total: recipients.length,
    sentCount,
    failedCount,
    remainingSms: getRemainingPurchasedSms(),
    logs
  };
}
