import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../utils/storage';

export interface SMSConfig {
  isLiveMode: boolean;
  maskingEnabled?: boolean;
  senderId?: string;
}

export interface UnifiedSmsOtpResult {
  ok: boolean;
  token?: string;
  exp?: number;
  code?: string;
  error?: string;
}

export interface UnifiedSmsTextResult {
  ok: boolean;
  status: number;
  usedCaller?: string;
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
  const response = await fetch('/api/sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok && !!data?.ok, data };
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
        error: data?.error || 'Could not send OTP. Please try again.',
      };
    }
    return {
      ok: true,
      token: data.token,
      exp: data.exp,
    };
  } catch (err: any) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      error: err?.message || 'Network error while sending OTP.',
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

  const adminSecret = storage.getItem('marketbd_sms_admin_secret') || '';
  if (adminSecret) {
    const res = await sendUnifiedSmsText({
      phone,
      message: `Your MarketBD.Net OTP is ${otpCode}`,
      adminSecret,
    });
    if (res.ok) {
      return {
        success: true,
        message: `SMS Sent via Unified Gateway (Caller: ${res.usedCaller || 'default'})`,
        gatewayResponse: res.gateway,
      };
    }
    return {
      success: false,
      message: res.hint || res.error || 'SMS Gateway request failed.',
      gatewayResponse: res.gateway,
    };
  }

  const otpRes = await sendUnifiedSmsOtp(phone);
  return {
    success: otpRes.ok,
    message: otpRes.ok ? `Unified OTP SMS dispatched to ${cleanPhone}` : (otpRes.error || 'Failed to dispatch SMS'),
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
