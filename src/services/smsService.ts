import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../utils/storage';

export interface SMSConfig {
  provider: 'bulksmsbd' | 'steadfast' | 'greenweb' | 'twilio' | 'firebase';
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
