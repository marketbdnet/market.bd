import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { getConfiguredExternalApkUrl } from './download/apk';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const localCandidates = [
    path.join(process.cwd(), 'public', 'MarketBD.apk'),
    path.join(process.cwd(), 'public', 'downloads', 'MarketBD.apk'),
    '/tmp/MarketBD.apk'
  ];

  for (const p of localCandidates) {
    try {
      const stat = fs.statSync(p);
      if (stat.isFile() && stat.size > 0) {
        return res.status(200).json({
          ok: true,
          available: true,
          source: 'local',
          downloadUrl: '/MarketBD.apk',
          fileName: 'MarketBD.apk',
          sizeBytes: stat.size
        });
      }
    } catch {
      // Check next candidate
    }
  }

  const externalUrl = await getConfiguredExternalApkUrl();
  if (externalUrl) {
    return res.status(200).json({
      ok: true,
      available: true,
      source: 'external',
      downloadUrl: '/api/download/apk',
      externalUrl,
      fileName: 'MarketBD.apk',
      sizeBytes: null
    });
  }

  // Probe static /MarketBD.apk hosted on CDN edge
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  if (host) {
    const proto = String(req?.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
    try {
      const headResp = await fetch(`${proto}://${host}/MarketBD.apk`, { method: 'HEAD', redirect: 'manual' });
      const ct = (headResp.headers.get('content-type') || '').toLowerCase();
      if (headResp.ok && !ct.includes('text/html') && !ct.includes('application/json')) {
        const lenHeader = headResp.headers.get('content-length');
        const sizeBytes = lenHeader ? Number(lenHeader) : null;
        return res.status(200).json({
          ok: true,
          available: true,
          source: 'static',
          downloadUrl: '/MarketBD.apk',
          fileName: 'MarketBD.apk',
          sizeBytes: Number.isFinite(sizeBytes) && (sizeBytes ?? 0) > 0 ? sizeBytes : null
        });
      }
    } catch {
      // Ignore network probe error
    }
  }

  return res.status(200).json({
    ok: true,
    available: false,
    source: 'none',
    downloadUrl: null,
    fileName: 'MarketBD.apk',
    sizeBytes: null
  });
}
