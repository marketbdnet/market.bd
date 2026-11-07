import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../utils/storage';

export interface SMSConfig {
  provider: 'bulksmsbd' | 'steadfast' | 'greenweb' | 'twilio' | 'firebase' | 'custom';
  customProviderName?: string;
  apiKey: string;
  senderId: string;
  isLiveMode: boolean;
}

const DEFAULT_SMS_CONFIG: SMSConfig = {
  provider: (storage.getItem('marketbd_sms_provider') as any) || 'greenweb',
  apiKey: storage.getItem('marketbd_sms_api_key') || '',
  senderId: storage.getItem('marketbd_sms_sender_id') || 'MarketBD',
  isLiveMode: storage.getItem('marketbd_live_mode') !== 'false'
};

/**
 * Send real SMS OTP to Bangladeshi Mobile Number via API Gateway or Firebase
 */
export async function sendRealSmsOtp(
  phone: string,
  otpCode: string,
  config: SMSConfig = DEFAULT_SMS_CONFIG
): Promise<{ success: boolean; message: string; gatewayResponse?: any }> {
  const cleanPhone = phone.startsWith('+88') ? phone : `+88${phone.replace(/^[^\d]/, '')}`;
  const localPhone = cleanPhone.replace('+88', '');

  // If Sandbox / Demo mode is active, return instant simulated success
  if (!config.isLiveMode || !config.apiKey) {
    console.log(`[SMS SANDBOX MODE] Sent OTP ${otpCode} to ${cleanPhone}`);
    return {
      success: true,
      message: `[Sandbox Mode] SMS OTP code ${otpCode} sent to ${cleanPhone}`
    };
  }

  try {
    if (config.provider === 'greenweb') {
      const msg = encodeURIComponent(`আপনার MarketBD.Net ভেরিফিকেশন কোড: ${otpCode}।`);
      const url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(config.apiKey)}&to=${encodeURIComponent('88' + localPhone)}&message=${msg}`;
      const res = await fetch(url);
      const dataText = await res.text();
      const isOk = dataText.includes('Ok') || dataText.includes('100') || !dataText.toLowerCase().includes('error');
      return {
        success: isOk,
        message: isOk ? `Greenweb SMS Sent to ${cleanPhone}` : `Greenweb API Response: ${dataText}`,
        gatewayResponse: dataText
      };
    } else if (config.provider === 'twilio') {
      // Twilio REST API integration
      const accountSid = config.senderId; // Using senderId field as Account SID
      const authToken = config.apiKey;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('To', cleanPhone);
      params.append('From', storage.getItem('marketbd_twilio_from') || '+1234567890');
      params.append('Body', `Your MarketBD.Net OTP is ${otpCode}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const data = await res.json();
      return {
        success: !!data.sid,
        message: data.sid ? 'Twilio SMS Dispatched' : (data.message || 'Twilio Error'),
        gatewayResponse: data
      };
    } else if (config.provider === 'bulksmsbd') {
      const url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(config.apiKey)}&type=text&number=${encodeURIComponent(localPhone)}&senderid=${encodeURIComponent(config.senderId)}&message=${encodeURIComponent(`আপনার MarketBD.Net ভেরিফিকেশন কোড: ${otpCode}। কারো সাথে শেয়ার করবেন না।`)}`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        success: data.response_code === 1001 || data.status === 'success',
        message: data.success_message || data.error_message || 'SMS Request Processed',
        gatewayResponse: data
      };
    } else if (config.provider === 'steadfast') {
      const res = await fetch('https://portal.steadfast.com.bd/api/v1/send_sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': config.apiKey,
          'Secret-Key': config.senderId
        },
        body: JSON.stringify({
          recipient: localPhone,
          message: `MarketBD.Net Verification Code: ${otpCode}. Valid for 5 minutes.`
        })
      });
      const data = await res.json();
      return {
        success: data.status === 200,
        message: data.message || 'Steadfast SMS Processed',
        gatewayResponse: data
      };
    } else if (config.provider === 'custom') {
      const customName = (config.customProviderName || '').toLowerCase();

      if (customName.includes('bulksmsdhaka')) {
        // Real integration: Bulk SMS Dhaka (bulksmsdhaka.net) OTP API.
        // Docs: https://bulksmsdhaka.com/bulk-sms-api-in-bangladesh
        // callerID: "1234" for non-masking, or the brand/sender name for masking.
        // Note: the OTP message body must stay under 70 characters or the
        // gateway silently fails to deliver while still deducting balance.
        const callerID = config.senderId && config.senderId.trim() !== ''
          ? config.senderId.trim()
          : '1234';
        const otpMessage = `Your MarketBD.Net OTP is ${otpCode}`; // kept short, under 70 chars
        const url = `https://bulksmsdhaka.net/api/otpsend?apikey=${encodeURIComponent(config.apiKey)}&callerID=${encodeURIComponent(callerID)}&number=${encodeURIComponent(localPhone)}&message=${encodeURIComponent(otpMessage)}`;

        const res = await fetch(url, { method: 'GET' });
        const rawText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(rawText);
        } catch {
          // Gateway didn't return valid JSON (e.g. an HTML error page) —
          // surface the raw text so the real problem is visible.
          console.error('Bulk SMS Dhaka: non-JSON response:', rawText);
          return {
            success: false,
            message: `Gateway থেকে অপ্রত্যাশিত উত্তর এসেছে (HTTP ${res.status}): ${rawText.slice(0, 200)}`
          };
        }

        console.log('Bulk SMS Dhaka raw response:', data);
        const isSuccess = data.Success === 'true' || data.Success === true || data.Status === '1000';
        return {
          success: isSuccess,
          message: isSuccess
            ? (data.Message || 'SMS পাঠানো সফল হয়েছে।')
            : `❌ SMS পাঠানো ব্যর্থ। Gateway-র সম্পূর্ণ raw উত্তর: ${JSON.stringify(data)} | HTTP Status: ${res.status}`,
          gatewayResponse: data
        };
      }

      // Any other custom/manually-named provider: we don't know its specific
      // API request format, so we can't auto-send through it yet. This
      // returns an honest message instead of silently pretending it worked.
      console.warn('Custom SMS provider selected — no API integration wired up for it yet:', config.customProviderName);
      return {
        success: false,
        message: 'এই কাস্টম প্রোভাইডারের জন্য এখনো API ইন্টিগ্রেশন কোড লেখা হয়নি। এটা কাজ করানোর জন্য এই প্রোভাইডারের API ডকুমেন্টেশন দিয়ে ডেভেলপারকে বলে কোডে যোগ করাতে হবে।'
      };
    }
  } catch (error: any) {
    console.error('SMS Gateway Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to dispatch SMS through gateway.'
    };
  }

  return { success: true, message: 'OTP Sent successfully' };
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
