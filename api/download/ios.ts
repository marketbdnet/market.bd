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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeHttpUrl(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/api/download/ios') || parsed.pathname === '/MarketBD.mobileconfig') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

async function getConfiguredIosUrls(): Promise<{ storeUrl: string | null; customDownloadUrl: string | null }> {
  const envStore = normalizeHttpUrl(process.env.IOS_APP_STORE_URL);
  const envDownload = normalizeHttpUrl(process.env.IOS_DOWNLOAD_URL);
  if (envStore && envDownload) {
    return { storeUrl: envStore, customDownloadUrl: envDownload };
  }

  try {
    const resp = await fetch(FIRESTORE_APP_RELEASE_URL, {
      headers: { Accept: 'application/json' }
    });
    if (!resp.ok) {
      return { storeUrl: envStore, customDownloadUrl: envDownload };
    }
    const json: any = await resp.json();
    const fields = json?.fields || {};
    const releaseObj = fields.value
      ? decodeFirestoreValue(fields.value)
      : (() => {
          const obj: Record<string, any> = {};
          for (const k of Object.keys(fields)) obj[k] = decodeFirestoreValue(fields[k]);
          return obj;
        })();

    return {
      storeUrl: envStore || normalizeHttpUrl(releaseObj?.iosAppStoreUrl),
      customDownloadUrl: envDownload || normalizeHttpUrl(releaseObj?.iosDownloadUrl)
    };
  } catch {
    return { storeUrl: envStore, customDownloadUrl: envDownload };
  }
}

function resolveAppOriginUrl(req: VercelRequest | any): string {
  const rawHost = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '').trim();
  if (!rawHost || rawHost.includes('127.0.0.1') || rawHost.includes('localhost')) {
    return 'https://marketbd.net/';
  }
  const protoHeader = String(req?.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const proto = protoHeader === 'http' ? 'http' : 'https';
  return `${proto}://${rawHost}/`;
}

function loadMarketBdIconBase64(): string | null {
  const iconCandidates = [
    path.join(process.cwd(), 'public', 'icon-192.png'),
    path.join(process.cwd(), 'public', 'icon-512.png'),
    path.join(process.cwd(), 'public', 'marketbd_logo.png'),
    path.join(process.cwd(), 'public', 'logo.jpg')
  ];

  for (const candidate of iconCandidates) {
    try {
      if (fs.existsSync(candidate)) {
        const buffer = fs.readFileSync(candidate);
        if (buffer.length > 0) {
          return buffer.toString('base64');
        }
      }
    } catch {
      // Try next icon asset
    }
  }
  return null;
}

export function buildIosMobileConfigXml(targetUrl: string, iconBase64?: string | null): string {
  const safeUrl = escapeXml(targetUrl);
  const cleanBase64 = iconBase64 ? iconBase64.replace(/\s+/g, '') : '';
  const iconEntry = cleanBase64
    ? `        <key>Icon</key>\n        <data>${cleanBase64}</data>\n`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>FullScreen</key>
        <true/>
${iconEntry}        <key>IgnoreManifestScope</key>
        <false/>
        <key>IsRemovable</key>
        <true/>
        <key>Label</key>
        <string>MarketBD.Net</string>
        <key>PayloadDescription</key>
        <string>Installs the MarketBD.Net iPhone &amp; iPad Web App shortcut onto your Home Screen.</string>
        <key>PayloadDisplayName</key>
        <string>MarketBD.Net App</string>
        <key>PayloadIdentifier</key>
        <string>net.marketbd.webclip.app</string>
        <key>PayloadType</key>
        <string>com.apple.webClip.managed</string>
        <key>PayloadUUID</key>
        <string>9B47F3D1-7C64-4A89-9E2F-6A88D71E2026</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>Precomposed</key>
        <true/>
        <key>URL</key>
        <string>${safeUrl}</string>
      </dict>
    </array>
    <key>PayloadDescription</key>
    <string>MarketBD.Net — Bangladesh&apos;s Trusted Online Marketplace App for iPhone &amp; iPad.</string>
    <key>PayloadDisplayName</key>
    <string>MarketBD.Net (iOS App)</string>
    <key>PayloadIdentifier</key>
    <string>net.marketbd.ios.profile</string>
    <key>PayloadOrganization</key>
    <string>MarketBD.Net</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>4C11E8A0-35B7-4D19-8C03-A19E3F502026</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
  </dict>
</plist>
`;
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

  const queryMode = String(req?.query?.mode || '').toLowerCase();
  if (queryMode === 'store' || req?.query?.redirect === '1') {
    const { storeUrl, customDownloadUrl } = await getConfiguredIosUrls();
    const redirectTarget = queryMode === 'store' ? storeUrl : customDownloadUrl;
    if (redirectTarget) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Location', redirectTarget);
      return res.status(302).end();
    }
  }

  const targetUrl = resolveAppOriginUrl(req);
  const iconBase64 = loadMarketBdIconBase64();
  const profileXml = buildIosMobileConfigXml(targetUrl, iconBase64);
  const byteLength = Buffer.byteLength(profileXml, 'utf8');

  res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="MarketBD_iPhone.mobileconfig"');
  res.setHeader('Content-Length', String(byteLength));
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).send(profileXml);
}
