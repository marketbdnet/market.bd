/**
 * APK Download Helper for MarketBD Android App
 * Handles direct APK downloads, Google Drive / GitHub Releases / Cloud URL conversion, and browser triggers.
 * Verifies same-origin APK presence before reporting success so users never see fake completion on 404.
 */

import { getAdminAuthToken } from './adminAuth';

export interface ApkDownloadOptions {
  apkUrl?: string;
  version?: string;
  fileName?: string;
  allowBlob?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

export interface ApkServerStatus {
  available: boolean;
  source: 'local' | 'external' | 'none';
  downloadUrl: string | null;
  fileName: string;
  sizeBytes: number | null;
  version?: string;
}

export interface ApkUploadOptions {
  adminPassword?: string;
  onProgress?: (progress: number) => void;
}

export interface ApkUploadResult {
  ok: boolean;
  downloadUrl?: string;
  sizeBytes?: number;
  code?: string;
  error?: string;
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

export async function getApkServerStatus(): Promise<ApkServerStatus> {
  try {
    const resp = await fetch('/api/apk-status', { cache: 'no-store' });
    if (!resp.ok) {
      return { available: false, source: 'none', downloadUrl: null, fileName: 'MarketBD.apk', sizeBytes: null };
    }
    const json = await resp.json();
    return {
      available: Boolean(json?.available),
      source: json?.source || 'none',
      downloadUrl: json?.downloadUrl || null,
      fileName: json?.fileName || 'MarketBD.apk',
      sizeBytes: typeof json?.sizeBytes === 'number' ? json.sizeBytes : null,
      version: json?.version
    };
  } catch {
    return { available: false, source: 'none', downloadUrl: null, fileName: 'MarketBD.apk', sizeBytes: null };
  }
}

export async function uploadApkFileToServer(
  file: File,
  options: ApkUploadOptions = {}
): Promise<ApkUploadResult> {
  const { adminPassword, onProgress } = options;

  if (!file || !file.name.toLowerCase().endsWith('.apk')) {
    return { ok: false, code: 'INVALID_EXTENSION', error: 'Invalid .apk filename.' };
  }

  if (file.size < 1024) {
    return { ok: false, code: 'INVALID_APK_EMPTY', error: 'Selected .apk file is too small or empty.' };
  }

  if (file.size > 70 * 1024 * 1024) {
    return {
      ok: false,
      code: 'FILE_TOO_LARGE',
      error: 'APK exceeds 70 MB direct upload limit. Please use Google Drive or GitHub Releases link.'
    };
  }

  // Verify APK/ZIP magic bytes PK\x03\x04 before transferring entire binary
  try {
    const headerBuf = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    const validZip =
      headerBuf.length >= 4 &&
      headerBuf[0] === 0x50 &&
      headerBuf[1] === 0x4b &&
      headerBuf[2] === 0x03 &&
      headerBuf[3] === 0x04;
    if (!validZip) {
      return {
        ok: false,
        code: 'INVALID_APK_SIGNATURE',
        error: 'This file is not a valid Android APK archive.'
      };
    }
  } catch {
    // Fallback to server-side validation
  }

  return await new Promise<ApkUploadResult>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-apk', true);
    xhr.setRequestHeader('Content-Type', 'application/vnd.android.package-archive');

    const token = getAdminAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    if (adminPassword && adminPassword.trim()) {
      xhr.setRequestHeader('x-admin-password', adminPassword.trim());
    }

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        const pct = Math.min(96, Math.max(5, Math.round((ev.loaded / ev.total) * 100)));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      let json: any = {};
      try {
        json = JSON.parse(xhr.responseText || '{}');
      } catch {
        // Non-JSON error (e.g., proxy 413 payload limit)
      }

      if (xhr.status >= 200 && xhr.status < 300 && json?.ok) {
        if (onProgress) onProgress(100);
        resolve({
          ok: true,
          downloadUrl: json.downloadUrl || '/api/download/apk',
          sizeBytes: json.sizeBytes || file.size
        });
        return;
      }

      if (xhr.status === 413) {
        resolve({
          ok: false,
          code: 'SERVERLESS_SIZE_LIMIT',
          error: 'Host upload limit reached (~4.5 MB on Serverless). Host the APK on Google Drive / GitHub Releases and paste its link below.'
        });
        return;
      }

      resolve({
        ok: false,
        code: json?.code || `HTTP_${xhr.status}`,
        error: json?.message || 'APK upload failed.'
      });
    };

    xhr.onerror = () => {
      resolve({
        ok: false,
        code: 'NETWORK_ERROR',
        error: 'Network error while uploading APK to server.'
      });
    };

    xhr.send(file);
  });
}

function isMarketBdAndroidApp(): boolean {
  return typeof navigator !== 'undefined' && /MarketBDAndroidApp/i.test(navigator.userAgent || '');
}

function triggerAnchorDownload(href: string, downloadName: string, openInNewTab: boolean): void {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = href;
  if (openInNewTab && !isMarketBdAndroidApp()) {
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

async function probeBinaryCandidate(candidate: string): Promise<'binary' | 'redirect' | 'missing'> {
  try {
    let resp = await fetch(candidate, { method: 'HEAD', redirect: 'manual' });
    if (resp.status === 405) {
      resp = await fetch(candidate, {
        method: 'GET',
        headers: { Range: 'bytes=0-3' },
        redirect: 'manual'
      });
    }

    if (resp.type === 'opaqueredirect' || (resp.status >= 300 && resp.status < 400)) {
      return 'redirect';
    }

    const contentType = (resp.headers.get('content-type') || '').toLowerCase();
    if (
      resp.ok &&
      !contentType.includes('text/html') &&
      !contentType.includes('application/json')
    ) {
      return 'binary';
    }
  } catch {
    // Ignore probe errors
  }
  return 'missing';
}

/**
 * Triggers a real APK file download on Android, desktop, or mobile browsers.
 * Never navigates the current window to a broken page and never silently clicks dead blob URLs.
 */
export async function downloadApkFile(options: ApkDownloadOptions = {}): Promise<boolean> {
  const {
    apkUrl,
    version = '2.5.0',
    fileName = `MarketBD_v${version}.apk`,
    allowBlob = false,
    onProgress,
    onComplete,
    onError
  } = options;

  const finalFileName = fileName.endsWith('.apk') ? fileName : `${fileName}.apk`;
  const directUrl = formatDirectApkUrl(apkUrl);
  const inAndroidApp = isMarketBdAndroidApp();

  try {
    if (onProgress) onProgress(25);

    // 1. Blob or data URLs: never allow stale persisted blob URLs silently for customers
    if (directUrl.startsWith('blob:') || directUrl.startsWith('data:')) {
      if (!allowBlob && directUrl.startsWith('blob:')) {
        if (onError) onError(new Error('APK_NOT_AVAILABLE'));
        return false;
      }

      if (directUrl.startsWith('blob:')) {
        try {
          const checkResp = await fetch(directUrl);
          if (!checkResp.ok) {
            if (onError) onError(new Error('APK_NOT_AVAILABLE'));
            return false;
          }
        } catch {
          if (onError) onError(new Error('APK_NOT_AVAILABLE'));
          return false;
        }
      }

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
        const result = await probeBinaryCandidate(candidate);
        if (result === 'redirect') {
          resolvedUrl = candidate;
          shouldOpenInNewTab = !inAndroidApp;
          break;
        }
        if (result === 'binary') {
          resolvedUrl = candidate;
          shouldOpenInNewTab = false;
          break;
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
    if (onProgress) onProgress(85);
    triggerAnchorDownload(directUrl, finalFileName, !inAndroidApp);
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
