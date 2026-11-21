/**
 * APK Download Helper for MarketBD Android App
 * Handles direct APK downloads, Google Drive / GitHub Releases / Cloud URL conversion, and browser triggers.
 * Verifies same-origin APK presence before reporting success so users never see fake completion on 404.
 */

export interface ApkDownloadOptions {
  apkUrl?: string;
  version?: string;
  fileName?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Convert popular file sharing URLs (Google Drive, Dropbox, OneDrive, GitHub)
 * into direct 1-click binary download URLs.
 */
export function formatDirectApkUrl(rawUrl: string | undefined): string {
  if (!rawUrl || !rawUrl.trim()) {
    return '/MarketBD.apk';
  }

  const url = rawUrl.trim();

  // Map legacy dead paths to canonical static path
  if (url === '/marketbd-release-v2.5.0.apk' || (url.includes('.run.app') && url.includes('.apk'))) {
    return '/MarketBD.apk';
  }

  if (url === '/MarketBD.apk') {
    return '/MarketBD.apk';
  }

  // If local path or data/blob URL, return directly
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Google Drive format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // or https://drive.google.com/open?id=FILE_ID
  const gDriveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch1 && gDriveMatch1[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch1[1]}&confirm=t`;
  }

  const gDriveMatch2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch2 && gDriveMatch2[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch2[1]}&confirm=t`;
  }

  // Dropbox format: https://www.dropbox.com/s/.../app.apk?dl=0
  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'dl=1').replace('?dl=0', '?dl=1');
  }

  // GitHub blob URL to raw URL (keep /releases/download/ URLs untouched)
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // OneDrive format
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    if (!url.includes('download=1')) {
      return url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
    }
  }

  return url;
}

function triggerAnchorDownload(href: string, downloadName: string, openInNewTab: boolean): void {
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

function isSameOriginPath(url: string): boolean {
  if (url.startsWith('/')) return true;
  if (typeof window === 'undefined') return false;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Triggers a real APK file download on Android, desktop, or mobile browsers.
 * Never navigates the current window to a broken page and never falsely reports success on 404.
 */
export async function downloadApkFile(options: ApkDownloadOptions = {}): Promise<boolean> {
  const {
    apkUrl,
    version = '2.5.0',
    fileName = `MarketBD_v${version}.apk`,
    onProgress,
    onComplete,
    onError
  } = options;

  const finalFileName = fileName.endsWith('.apk') ? fileName : `${fileName}.apk`;
  const directUrl = formatDirectApkUrl(apkUrl);

  try {
    if (onProgress) onProgress(25);

    // 1. Blob or data URLs (local admin preview/test)
    if (directUrl.startsWith('blob:') || directUrl.startsWith('data:')) {
      if (onProgress) onProgress(85);
      triggerAnchorDownload(directUrl, finalFileName, false);
      setTimeout(() => {
        if (onProgress) onProgress(100);
        if (onComplete) onComplete();
      }, 300);
      return true;
    }

    // 2. Same-origin APK paths (/MarketBD.apk or /api/download/apk)
    if (isSameOriginPath(directUrl)) {
      if (onProgress) onProgress(55);

      const candidates =
        directUrl === '/MarketBD.apk'
          ? ['/MarketBD.apk', '/api/download/apk']
          : directUrl === '/api/download/apk'
            ? ['/api/download/apk', '/MarketBD.apk']
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
        const missingErr = new Error('APK_NOT_AVAILABLE');
        if (onError) onError(missingErr);
        return false;
      }

      if (onProgress) onProgress(90);
      triggerAnchorDownload(resolvedUrl, finalFileName, shouldOpenInNewTab);
      setTimeout(() => {
        if (onProgress) onProgress(100);
        if (onComplete) onComplete();
      }, 350);
      return true;
    }

    // 3. External Cloud URL (Google Drive, GitHub Releases, Dropbox, OneDrive, CDN)
    // Open via direct anchor click to avoid CORS failures and X-Frame-Options blocks
    if (onProgress) onProgress(85);
    triggerAnchorDownload(directUrl, finalFileName, true);
    setTimeout(() => {
      if (onProgress) onProgress(100);
      if (onComplete) onComplete();
    }, 350);
    return true;
  } catch (err) {
    console.error('Error downloading APK:', err);
    if (onError) {
      onError(err instanceof Error ? err : new Error('APK_DOWNLOAD_FAILED'));
    }
    return false;
  }
}
