import { storage } from '../utils/storage';

/**
 * Web Push Notification & FCM Engine Service
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

/**
 * Request Browser Push Notification Permission
 */
export async function requestWebPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Trigger Real Browser Desktop / Mobile Push Notification
 */
export async function sendLocalBrowserPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: '/favicon.ico',
        data: { url: payload.url || window.location.href }
      };

      const notification = new Notification(payload.title, options);
      notification.onclick = () => {
        window.focus();
        if (payload.url) {
          window.location.hash = payload.url;
        }
        notification.close();
      };
      return true;
    } catch (err) {
      console.error('Error firing Web Push Notification:', err);
    }
  }

  return false;
}

/**
 * Register Simulated FCM Device Token for Backend Push Dispatch
 */
export function registerFcmDeviceToken(): string {
  let token = storage.getItem('marketbd_fcm_token');
  if (!token) {
    token = `fcm_token_mktbd_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    storage.setItem('marketbd_fcm_token', token);
  }
  return token;
}
