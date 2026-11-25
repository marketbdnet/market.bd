/**
 * iOS / iPhone Download Helper for MarketBD App
 * Handles Apple Configuration Profile (.mobileconfig) downloads for iPhone & iPad,
 * Safari "Allow Profile" navigation, external TestFlight/App Store links, and device detection.
 */

export interface IosDownloadOptions {
  iosUrl?: string;
  fileName?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

export function isIosDevice(userAgent?: string, platform?: string, maxTouchPoints?: number): boolean {
  const ua =
    userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent || '' : '');
  const plat =
    platform ??
    (typeof navigator !== 'undefined' ? navigator.platform || '' : '');
  const touchPoints =
    maxTouchPoints ??
    (typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0);

  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ identifies as MacIntel with multi-touch
  if (/Mac/i.test(plat) && touchPoints > 1) return true;
  return false;
}

export function isIosSafari(userAgent?: string): boolean {
  const ua =
    userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent || '' : '');
  if (!isIosDevice(ua)) return false;
  // Exclude Chrome/Firefox/Edge/Opera iOS wrappers which don't show Share->Add to Home Screen or native mobileconfig flow seamlessly
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

/**
 * Normalize an iOS download URL.
 * Defaults to our Apple WebClip Configuration Profile endpoint `/api/download/ios`.
 */
export function formatDirectIosUrl(rawUrl: string | undefined): string {
  if (!rawUrl || !rawUrl.trim()) {
    return '/api/download/ios';
  }
  const url = rawUrl.trim();
  if (url === '/MarketBD.mobileconfig' || url === '/api/download/ios') {
    return url;
  }
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Google Drive / Dropbox / GitHub conversion in case admin hosts a custom .mobileconfig or enterprise plist
  const gDriveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch1?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch1[1]}&confirm=t`;
  }
  const gDriveMatch2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch2?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch2[1]}&confirm=t`;
  }
  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'dl=1').replace('?dl=0', '?dl=1');
  }
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  return url;
}

function isSameOriginPath(url: string): boolean {
  if (url.startsWith('/')) return true;
  if (typeof window === 'undefined') return false;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

function triggerAnchorFileDownload(href: string, downloadName: string, openInNewTab: boolean): void {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = href;
  if (openInNewTab) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  } else {
    a.download = downloadName;
  }
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 800);
}

/**
 * Triggers real iOS App Profile (.mobileconfig) download or external App Store / TestFlight link.
 * On iPhone/iPad Safari, navigates directly to the `.mobileconfig` endpoint WITHOUT `download` attribute
 * so iOS triggers the native "This website is trying to download a configuration profile -> Allow" prompt.
 * On Desktop/Android, downloads the `.mobileconfig` file cleanly.
 */
export async function downloadIosAppProfile(options: IosDownloadOptions = {}): Promise<boolean> {
  const {
    iosUrl,
    fileName = 'MarketBD_iPhone.mobileconfig',
    onProgress,
    onComplete,
    onError
  } = options;

  const finalFileName = fileName.endsWith('.mobileconfig') || fileName.endsWith('.ipa')
    ? fileName
    : `${fileName}.mobileconfig`;
  const directUrl = formatDirectIosUrl(iosUrl);
  const onIos = isIosDevice();

  try {
    if (onProgress) onProgress(25);

    // 1. Blob or Data URL (local preview)
    if (directUrl.startsWith('blob:') || directUrl.startsWith('data:')) {
      if (onProgress) onProgress(90);
      triggerAnchorFileDownload(directUrl, finalFileName, false);
      setTimeout(() => {
        if (onProgress) onProgress(100);
        if (onComplete) onComplete();
      }, 300);
      return true;
    }

    // 2. Same-origin Apple Configuration Profile (/api/download/ios or /MarketBD.mobileconfig)
    if (isSameOriginPath(directUrl)) {
      if (onProgress) onProgress(55);

      const candidates =
        directUrl === '/api/download/ios'
          ? ['/api/download/ios', '/MarketBD.mobileconfig']
          : directUrl === '/MarketBD.mobileconfig'
            ? ['/MarketBD.mobileconfig', '/api/download/ios']
            : [directUrl];

      let resolvedUrl: string | null = null;
      let shouldOpenInNewTab = false;

      for (const candidate of candidates) {
        try {
          const headRes = await fetch(candidate, { method: 'HEAD', redirect: 'manual' });
          if (headRes.type === 'opaqueredirect' || (headRes.status >= 300 && headRes.status < 400)) {
            resolvedUrl = candidate;
            shouldOpenInNewTab = true;
            break;
          }
          const contentType = (headRes.headers.get('content-type') || '').toLowerCase();
          if (
            headRes.ok &&
            !contentType.includes('text/html') &&
            !contentType.includes('application/json')
          ) {
            resolvedUrl = candidate;
            shouldOpenInNewTab = false;
            break;
          }
        } catch {
          // Try next candidate
        }
      }

      if (!resolvedUrl) {
        const missingErr = new Error('IOS_PROFILE_NOT_AVAILABLE');
        if (onError) onError(missingErr);
        return false;
      }

      if (onProgress) onProgress(90);

      // Critical iOS Safari behavior: navigating without `download` attribute launches the native Profile installer prompt
      if (onIos && typeof window !== 'undefined' && typeof window.location?.assign === 'function') {
        window.location.assign(resolvedUrl);
      } else {
        triggerAnchorFileDownload(resolvedUrl, finalFileName, shouldOpenInNewTab);
      }

      setTimeout(() => {
        if (onProgress) onProgress(100);
        if (onComplete) onComplete();
      }, 350);
      return true;
    }

    // 3. External URL (Apple App Store / TestFlight / external profile)
    if (onProgress) onProgress(85);
    if (onIos && typeof window !== 'undefined' && typeof window.location?.assign === 'function') {
      window.location.assign(directUrl);
    } else {
      triggerAnchorFileDownload(directUrl, finalFileName, true);
    }
    setTimeout(() => {
      if (onProgress) onProgress(100);
      if (onComplete) onComplete();
    }, 350);
    return true;
  } catch (err) {
    console.error('Error downloading iOS app profile:', err);
    if (onError) {
      onError(err instanceof Error ? err : new Error('IOS_DOWNLOAD_FAILED'));
    }
    return false;
  }
}
