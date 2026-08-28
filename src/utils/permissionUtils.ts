/**
 * Android and Web Runtime Permissions Helper for MarketBD.Net
 * Handles Camera, Geolocation, Media Images, and Network state checks.
 */

export interface PermissionStatusResult {
  permission: 'camera' | 'location' | 'images' | 'notifications' | 'microphone' | 'internet';
  granted: boolean;
  status: 'granted' | 'denied' | 'prompt' | 'unsupported';
  message: string;
}

export const checkAndRequestCamera = async (): Promise<PermissionStatusResult> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      permission: 'camera',
      granted: false,
      status: 'unsupported',
      message: 'Camera API not supported on this browser or platform.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately after checking/granting
    stream.getTracks().forEach(track => track.stop());
    return {
      permission: 'camera',
      granted: true,
      status: 'granted',
      message: 'Camera permission granted successfully for taking product photos.',
    };
  } catch (err: any) {
    return {
      permission: 'camera',
      granted: false,
      status: 'denied',
      message: err?.message || 'Camera permission was denied.',
    };
  }
};

export const checkAndRequestLocation = async (): Promise<PermissionStatusResult> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      permission: 'location',
      granted: false,
      status: 'unsupported',
      message: 'Geolocation API not supported.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          permission: 'location',
          granted: true,
          status: 'granted',
          message: `Location permission granted (Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}).`,
        });
      },
      (err) => {
        resolve({
          permission: 'location',
          granted: false,
          status: 'denied',
          message: err.message || 'Location permission was denied.',
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};

export const checkAndRequestNotifications = async (): Promise<PermissionStatusResult> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      permission: 'notifications',
      granted: false,
      status: 'unsupported',
      message: 'Push Notifications not supported.',
    };
  }

  try {
    const perm = await Notification.requestPermission();
    return {
      permission: 'notifications',
      granted: perm === 'granted',
      status: perm as any,
      message: perm === 'granted' ? 'Notifications permission granted.' : 'Notifications permission denied.',
    };
  } catch {
    return {
      permission: 'notifications',
      granted: false,
      status: 'denied',
      message: 'Failed to request notification permission.',
    };
  }
};

export const checkAndRequestMicrophone = async (): Promise<PermissionStatusResult> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      permission: 'microphone',
      granted: false,
      status: 'unsupported',
      message: 'Audio Recording / Microphone API not supported.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return {
      permission: 'microphone',
      granted: true,
      status: 'granted',
      message: 'Microphone permission granted for AI voice search and audio messages.',
    };
  } catch (err: any) {
    return {
      permission: 'microphone',
      granted: false,
      status: 'denied',
      message: err?.message || 'Microphone permission was denied.',
    };
  }
};

