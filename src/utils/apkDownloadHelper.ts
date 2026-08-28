/**
 * APK Download Helper for MarketBD Android App
 * Handles direct APK downloads, Google Drive / Cloud URL conversion, and browser triggers
 * Ensures the web page is NEVER navigated away or replaced with a 404 error
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
    return '/api/download/apk';
  }

  const url = rawUrl.trim();

  // If local path or legacy relative path
  if (url === '/MarketBD.apk' || url === '/marketbd-release-v2.5.0.apk' || url.startsWith('/downloads/')) {
    return '/api/download/apk';
  }

  // If legacy full Cloud Run URL pointing to old container
  if (url.includes('.run.app') && url.includes('.apk')) {
    return '/api/download/apk';
  }

  // If local path or data URL, return directly
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

  // GitHub blob URL to raw URL
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

/**
 * Triggers a real APK file download on Android, desktop, or mobile browsers.
 * Guaranteed to NEVER navigate the current window or replace the app screen.
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

  const directUrl = formatDirectApkUrl(apkUrl);

  try {
    if (onProgress) onProgress(20);

    // Primary & Safe Method: Fetch as Blob and trigger object URL download
    // This NEVER causes any page navigation or 404 replacement
    try {
      if (onProgress) onProgress(45);
      const response = await fetch(directUrl, {
        headers: {
          'Accept': 'application/vnd.android.package-archive, application/octet-stream, */*'
        }
      });

      if (response.ok) {
        if (onProgress) onProgress(75);
        const blobData = await response.blob();
        const apkBlob = new Blob([blobData], { type: 'application/vnd.android.package-archive' });
        const blobUrl = window.URL.createObjectURL(apkBlob);

        if (onProgress) onProgress(90);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName.endsWith('.apk') ? fileName : `${fileName}.apk`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(blobUrl);
          if (onProgress) onProgress(100);
          if (onComplete) onComplete();
        }, 500);

        return true;
      }
    } catch (fetchErr) {
      console.warn('Direct blob fetch failed, trying safe background iframe:', fetchErr);
    }

    // Secondary Safe Fallback: Hidden iframe download (prevents main frame navigation)
    if (onProgress) onProgress(80);

    const hiddenIframe = document.createElement('iframe');
    hiddenIframe.style.display = 'none';
    hiddenIframe.style.width = '0px';
    hiddenIframe.style.height = '0px';
    hiddenIframe.style.border = 'none';
    hiddenIframe.src = directUrl;
    document.body.appendChild(hiddenIframe);

    setTimeout(() => {
      if (document.body.contains(hiddenIframe)) {
        document.body.removeChild(hiddenIframe);
      }
      if (onProgress) onProgress(100);
      if (onComplete) onComplete();
    }, 1500);

    return true;
  } catch (err) {
    console.error('Error downloading APK:', err);
    if (onError && err instanceof Error) {
      onError(err);
    }
    return false;
  }
}
