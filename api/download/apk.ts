import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const FIRESTORE_APP_RELEASE_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents/settings/app_release';

function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue?.values || []).map(decodeFirestoreValue);
  if ('mapValue' in val) {
    const out: Record<string, any> = {};
    const fields = val.mapValue?.fields || {};
    for (const k of Object.keys(fields)) out[k] = decodeFirestoreValue(fields[k]);
    return out;
  }
  return val;
}

function normalizeExternalApkUrl(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url || !/^https?:\/\//i.test(url)) return null;

  // Prevent redirect loop if URL points back to /api/download/apk on the same domain
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/api/download/apk')) {
      return null;
    }
  } catch {
    return null;
  }

  // Google Drive direct download conversion
  const gDriveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch1?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch1[1]}&confirm=t`;
  }
  const gDriveMatch2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch2?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch2[1]}&confirm=t`;
  }

  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'dl=1');
  }

  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  if ((url.includes('1drv.ms') || url.includes('onedrive.live.com')) && !url.includes('download=1')) {
    return url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
  }

  return url;
}

async function getConfiguredExternalApkUrl(): Promise<string | null> {
  const envUrl = normalizeExternalApkUrl(process.env.APK_DOWNLOAD_URL);
  if (envUrl) return envUrl;

  try {
    const resp = await fetch(FIRESTORE_APP_RELEASE_URL, {
      headers: { Accept: 'application/json' }
    });
    if (!resp.ok) return null;

    const json: any = await resp.json();
    const fields = json?.fields || {};
    const releaseObj = fields.value ? decodeFirestoreValue(fields.value) : (() => {
      const obj: Record<string, any> = {};
      for (const k of Object.keys(fields)) obj[k] = decodeFirestoreValue(fields[k]);
      return obj;
    })();

    return normalizeExternalApkUrl(releaseObj?.apkDownloadUrl);
  } catch {
    return null;
  }
}

async function checkStaticApkExistsOnOrigin(req: VercelRequest | any): Promise<string | null> {
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  if (!host) return null;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  const staticUrl = `${proto}://${host}/MarketBD.apk`;

  try {
    const headResp = await fetch(staticUrl, { method: 'HEAD', redirect: 'manual' });
    const contentType = (headResp.headers.get('content-type') || '').toLowerCase();
    if (
      headResp.ok &&
      !contentType.includes('text/html') &&
      !contentType.includes('application/json')
    ) {
      return '/MarketBD.apk';
    }
  } catch {
    // Ignore network probe failures
  }
  return null;
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  // 1. Check local filesystem APK (if deployed inside public/ or running locally)
  const localCandidates = [
    path.join(process.cwd(), 'public', 'MarketBD.apk'),
    path.join(process.cwd(), 'public', 'downloads', 'MarketBD.apk')
  ];
  const localApkPath = localCandidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (localApkPath) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="MarketBD.apk"');
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    const stream = fs.createReadStream(localApkPath);
    return stream.pipe(res);
  }

  // 2. Check configured external URL from env or Firestore settings/app_release
  const externalUrl = await getConfiguredExternalApkUrl();
  if (externalUrl) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', externalUrl);
    return res.status(302).end();
  }

  // 3. Probe static /MarketBD.apk hosted on the CDN edge
  const staticPath = await checkStaticApkExistsOnOrigin(req);
  if (staticPath) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', staticPath);
    return res.status(302).end();
  }

  // 4. Honest 404 JSON when no APK has been uploaded or linked yet
  res.setHeader('Cache-Control', 'no-store');
  return res.status(404).json({
    ok: false,
    error: 'APK_NOT_UPLOADED',
    message: 'MarketBD.apk is not uploaded yet. Upload public/MarketBD.apk or set an external APK download link in Admin -> App Update.'
  });
}
