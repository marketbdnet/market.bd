import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../utils/storage';
import { getAdminAuthToken } from '../utils/adminAuth';

export type SmsProviderId =
  | 'bulksmsdhaka'
  | 'bulksmsbd'
  | 'greenweb'
  | 'alphasms'
  | 'sslwireless'
  | 'elitbuzz'
  | 'muthofun'
  | 'custom';

export interface SmsProviderPresetInfo {
  id: SmsProviderId;
  companyName: string;
  defaultApiUrl: string;
  supportsBalance: boolean;
  requiresSid?: boolean;
}

export const SMS_PROVIDER_OPTIONS: SmsProviderPresetInfo[] = [
  { id: 'bulksmsdhaka', companyName: 'BulkSMS Dhaka (bulksmsdhaka.net)', defaultApiUrl: 'https://bulksmsdhaka.net/api', supportsBalance: true },
  { id: 'bulksmsbd', companyName: 'BulkSMS BD (bulksmsbd.net)', defaultApiUrl: 'https://bulksmsbd.net/api', supportsBalance: true },
  { id: 'greenweb', companyName: 'GreenWeb BD (greenweb.com.bd)', defaultApiUrl: 'https://api.greenweb.com.bd/api.php', supportsBalance: false },
  { id: 'alphasms', companyName: 'Alpha SMS (sms.net.bd)', defaultApiUrl: 'https://api.sms.net.bd', supportsBalance: true },
  { id: 'sslwireless', companyName: 'SSL Wireless (sslwireless.com)', defaultApiUrl: 'https://smsplus.sslwireless.com/api/v3/send-sms', supportsBalance: false, requiresSid: true },
  { id: 'elitbuzz', companyName: 'Elitbuzz / MIMSMS (elitbuzz-bd.com)', defaultApiUrl: 'https://msg.elitbuzz-bd.com/smsapi', supportsBalance: true },
  { id: 'muthofun', companyName: 'MuthoFun (muthofun.com)', defaultApiUrl: 'https://sysadmin.muthobarta.com/api/v1/send-sms', supportsBalance: false },
  { id: 'custom', companyName: 'Custom SMS Provider (অন্যান্য কোম্পানি)', defaultApiUrl: '', supportsBalance: false },
];

export interface SMSConfig {
  isLiveMode: boolean;
  maskingEnabled?: boolean;
  senderId?: string;
}

export interface UnifiedSmsGatewayConfig {
  providerId: SmsProviderId;
  providerName: string;
  apiUrl: string;
  senderId: string;
  sid?: string;
  maskingEnabled: boolean;
  noReplyMode?: boolean;
  isLiveMode: boolean;
  otpTemplate: string;
  updatedAt?: string;
  hasApiKey: boolean;
  maskedApiKey: string;
  hasAdminSecret: boolean;
  presets?: SmsProviderPresetInfo[];
}

export interface UnifiedSmsOtpResult {
  ok: boolean;
  token?: string;
  exp?: number;
  code?: string;
  hint?: string;
  error?: string;
  providerName?: string;
  usedCaller?: string;
  usedEndpoint?: string;
  mode?: string;
}

export interface UnifiedSmsTextResult {
  ok: boolean;
  status: number;
  usedCaller?: string;
  providerName?: string;
  hint?: string;
  error?: string;
  gateway?: any;
}

export interface UnifiedSmsBalanceResult {
  ok: boolean;
  status: number;
  balance: number | null;
  hint?: string;
  error?: string;
  gateway?: any;
}

async function postUnifiedSmsApi(
  body: Record<string, any>,
  adminSecret?: string
): Promise<{ status: number; ok: boolean; data: any }> {
  const adminToken = getAdminAuthToken();
  const response = await fetch('/api/sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok && !!data?.ok, data };
}

/**
 * Fetch safe/masked unified SMS gateway configuration from server.
 */
export async function fetchUnifiedSmsConfig(): Promise<{
  ok: boolean;
  config?: UnifiedSmsGatewayConfig;
  error?: string;
}> {
  try {
    const { ok, data } = await postUnifiedSmsApi({ action: 'get_config' });
    if (!ok || !data?.config) {
      return { ok: false, error: data?.error || 'Could not load SMS gateway config' };
    }
    return { ok: true, config: data.config };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error loading SMS config' };
  }
}

/**
 * Save SMS Provider Company, API URL, API Key, Sender ID & OTP Template securely on server.
 */
export async function saveUnifiedSmsConfig(params: {
  providerId: SmsProviderId;
  providerName: string;
  apiUrl: string;
  apiKey?: string;
  clearApiKey?: boolean;
  senderId: string;
  sid?: string;
  maskingEnabled: boolean;
  noReplyMode?: boolean;
  isLiveMode: boolean;
  otpTemplate: string;
  updatedAt?: string;
  adminSecret?: string;
  newAdminSecret?: string;
}): Promise<{
  ok: boolean;
  status: number;
  persistedOnServer?: boolean;
  warning?: string;
  config?: UnifiedSmsGatewayConfig;
  error?: string;
}> {
  try {
    const secret =
      params.adminSecret !== undefined
        ? params.adminSecret
        : storage.getItem('marketbd_sms_admin_secret') || '';
    const { status, ok, data } = await postUnifiedSmsApi(
      {
        action: 'save_config',
        providerId: params.providerId,
        providerName: params.providerName,
        apiUrl: params.apiUrl,
        ...(params.apiKey ? { apiKey: params.apiKey } : {}),
        ...(params.clearApiKey ? { clearApiKey: true } : {}),
        senderId: params.senderId,
        sid: params.sid || '',
        maskingEnabled: params.maskingEnabled,
        noReplyMode: params.noReplyMode !== false,
        isLiveMode: params.isLiveMode,
        otpTemplate: params.otpTemplate,
        ...(params.updatedAt ? { updatedAt: params.updatedAt } : {}),
        ...(params.newAdminSecret ? { newAdminSecret: params.newAdminSecret } : {}),
      },
      secret
    );
    return {
      ok,
      status,
      persistedOnServer: data?.persistedOnServer,
      warning: data?.warning,
      config: data?.config,
      error: data?.error,
    };
  } catch (err: any) {
    return { ok: false, status: 0, error: err?.message || 'Failed to save SMS gateway config' };
  }
}

/**
 * Single Unified Function: Send OTP SMS securely via /api/sms.
 */
export async function sendUnifiedSmsOtp(phone: string): Promise<UnifiedSmsOtpResult> {
  try {
    const { ok, data } = await postUnifiedSmsApi({
      action: 'send_otp',
      phone: phone.trim(),
    });
    if (!ok) {
      return {
        ok: false,
        code: data?.code,
        hint: data?.hint,
        usedCaller: data?.usedCaller,
        usedEndpoint: data?.usedEndpoint,
        error: data?.error || 'Could not send OTP. Please try again.',
      };
    }
    return {
      ok: true,
      token: data.token,
      exp: data.exp,
      providerName: data.providerName,
      usedCaller: data.usedCaller,
      usedEndpoint: data.usedEndpoint,
      mode: data.mode,
    };
  } catch (err: any) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      error: err?.message || 'Network error while sending OTP.',
    };
  }
}

export async function testAdminSmsOtp(params: {
  phone: string;
  providerId: SmsProviderId;
  apiUrl: string;
  apiKey?: string;
  senderId: string;
  sid?: string;
  maskingEnabled: boolean;
  noReplyMode?: boolean;
  isLiveMode: boolean;
  otpTemplate: string;
  adminSecret?: string;
}): Promise<UnifiedSmsOtpResult> {
  try {
    const secret =
      params.adminSecret !== undefined
        ? params.adminSecret
        : storage.getItem('marketbd_sms_admin_secret') || '';
    const { ok, data } = await postUnifiedSmsApi(
      {
        action: 'admin_test_otp',
        phone: params.phone.trim(),
        providerId: params.providerId,
        apiUrl: params.apiUrl,
        ...(params.apiKey ? { apiKey: params.apiKey } : {}),
        senderId: params.senderId,
        sid: params.sid || '',
        maskingEnabled: params.maskingEnabled,
        noReplyMode: params.noReplyMode !== false,
        isLiveMode: params.isLiveMode,
        otpTemplate: params.otpTemplate,
      },
      secret
    );
    if (!ok) {
      return {
        ok: false,
        code: data?.code,
        hint: data?.hint,
        usedCaller: data?.usedCaller,
        usedEndpoint: data?.usedEndpoint,
        error: data?.error || 'Could not send test OTP.',
      };
    }
    return {
      ok: true,
      providerName: data.providerName,
      usedCaller: data.usedCaller,
      usedEndpoint: data.usedEndpoint,
      mode: data.mode,
    };
  } catch (err: any) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      error: err?.message || 'Network error while testing OTP.',
    };
  }
}

/**
 * Single Unified Function: Verify OTP SMS code securely via /api/sms.
 */
export async function verifyUnifiedSmsOtp(params: {
  phone: string;
  code: string;
  token: string;
  exp: number;
}): Promise<{ ok: boolean; expired?: boolean; error?: string }> {
  try {
    const { ok, data } = await postUnifiedSmsApi({
      action: 'verify_otp',
      phone: params.phone.trim(),
      code: params.code.trim(),
      token: params.token,
      exp: params.exp,
    });
    return {
      ok,
      expired: !!data?.expired,
      error: data?.error,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Network error while verifying OTP.',
    };
  }
}

/**
 * Single Unified Admin Function: Send custom / test SMS via /api/sms.
 */
export async function sendUnifiedSmsText(params: {
  phone: string;
  message: string;
  adminSecret?: string;
}): Promise<UnifiedSmsTextResult> {
  try {
    const secret =
      params.adminSecret !== undefined
        ? params.adminSecret
        : storage.getItem('marketbd_sms_admin_secret') || '';
    const { status, ok, data } = await postUnifiedSmsApi(
      {
        action: 'send_text',
        phone: params.phone.trim(),
        message: params.message.trim(),
      },
      secret
    );
    return {
      ok,
      status,
      usedCaller: data?.usedCaller,
      providerName: data?.providerName,
      hint: data?.hint,
      error: data?.error,
      gateway: data?.gateway,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || 'Failed to connect to SMS gateway server.',
    };
  }
}

/**
 * Single Unified Admin Function: Check remaining SMS balance via /api/sms.
 */
export async function fetchUnifiedSmsBalance(
  adminSecret?: string
): Promise<UnifiedSmsBalanceResult> {
  try {
    const secret =
      adminSecret !== undefined
        ? adminSecret
        : storage.getItem('marketbd_sms_admin_secret') || '';
    const { status, ok, data } = await postUnifiedSmsApi({ action: 'balance' }, secret);
    const parsed = parseFloat(data?.balance);
    return {
      ok,
      status,
      balance: isNaN(parsed) ? null : parsed,
      hint: data?.hint,
      error: data?.error,
      gateway: data?.gateway,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      balance: null,
      error: err?.message || 'Failed to check SMS balance.',
    };
  }
}

/**
 * Compatibility wrapper routed cleanly through the single unified /api/sms service.
 */
export async function sendRealSmsOtp(
  phone: string,
  otpCode: string,
  config: SMSConfig = { isLiveMode: storage.getItem('marketbd_live_mode') !== 'false' }
): Promise<{ success: boolean; message: string; gatewayResponse?: any }> {
  const cleanPhone = phone.startsWith('+88') ? phone : `+88${phone.replace(/^[^\d]/, '')}`;

  if (!config.isLiveMode) {
    return {
      success: true,
      message: `[Sandbox Mode] SMS OTP code ${otpCode} prepared for ${cleanPhone}`,
    };
  }

  // Always route through send_otp so the saved 70-char custom OTP template and No-Reply policy are applied consistently
  const otpRes = await sendUnifiedSmsOtp(phone);
  return {
    success: otpRes.ok,
    message: otpRes.ok
      ? `Unified OTP SMS dispatched to ${cleanPhone} (${otpRes.providerName || 'Gateway'}, Sender: ${otpRes.usedCaller || 'default'})`
      : (otpRes.hint || otpRes.error || 'Failed to dispatch SMS'),
    gatewayResponse: otpRes,
  };
}

/**
 * Firebase Native Recaptcha Phone OTP Initializer
 */
export function setupFirebaseRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified for Phone Auth');
    },
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
      message: `Password reset link has been sent to ${email}. Check your inbox or spam folder.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to send password reset email.',
    };
  }
}
