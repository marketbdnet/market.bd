import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from './admin-auth';

const SECRETS_FILE = path.join(process.cwd(), '.gateway_secrets.json');

interface PaymentSecretsConfig {
  isLiveMode?: boolean;
  autoSettle?: boolean;
  bkashAppKey?: string;
  bkashAppSecret?: string;
  bkashUsername?: string;
  nagadMerchantId?: string;
  nagadMerchantKey?: string;
  rocketMerchantId?: string;
  rocketApiKey?: string;
  sslcommerzStoreId?: string;
  sslcommerzStorePassword?: string;
  updatedAt?: string;
}

function readPaymentSecrets(): PaymentSecretsConfig {
  try {
    if (fs.existsSync(SECRETS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8'));
      return parsed?.payment || {};
    }
  } catch {
    // Fallback cleanly in read-only runtimes
  }
  return {};
}

function writePaymentSecrets(nextPayment: PaymentSecretsConfig): boolean {
  try {
    let existing: Record<string, any> = {};
    if (fs.existsSync(SECRETS_FILE)) {
      existing = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8')) || {};
    }
    const merged = {
      ...existing,
      payment: { ...(existing.payment || {}), ...nextPayment },
    };
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function maskVal(val?: string): string {
  if (!val) return '';
  const t = val.trim();
  if (t.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(8, t.length - 4))}${t.slice(-4)}`;
}

function checkAdminSecret(req: any): boolean {
  if (verifyAdminRequest(req)) return true;
  let savedAdminSecret = '';
  try {
    if (fs.existsSync(SECRETS_FILE)) {
      savedAdminSecret = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8'))?.sms?.adminSecret || '';
    }
  } catch {
    savedAdminSecret = '';
  }
  const configured = (process.env.SMS_ADMIN_SECRET || savedAdminSecret || '').trim();
  if (!configured) return false;
  const given = String(req.headers['x-admin-secret'] || '');
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(configured);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = String(body.action || '');
  const current = readPaymentSecrets();

  if (action === 'get_config') {
    return res.status(200).json({
      ok: true,
      config: {
        isLiveMode: current.isLiveMode ?? false,
        autoSettle: current.autoSettle ?? true,
        bkashAppKey: current.bkashAppKey || '',
        hasBkashSecret: Boolean(current.bkashAppSecret),
        maskedBkashSecret: maskVal(current.bkashAppSecret),
        bkashUsername: current.bkashUsername || '',
        nagadMerchantId: current.nagadMerchantId || '',
        hasNagadKey: Boolean(current.nagadMerchantKey),
        maskedNagadKey: maskVal(current.nagadMerchantKey),
        rocketMerchantId: current.rocketMerchantId || '',
        hasRocketKey: Boolean(current.rocketApiKey),
        maskedRocketKey: maskVal(current.rocketApiKey),
        sslcommerzStoreId: current.sslcommerzStoreId || '',
        hasSslPassword: Boolean(current.sslcommerzStorePassword),
        maskedSslPassword: maskVal(current.sslcommerzStorePassword),
      },
    });
  }

  if (action === 'save_config') {
    if (!checkAdminSecret(req)) {
      return res.status(401).json({
        ok: false,
        error: 'অ্যাডমিন সিক্রেট সঠিক নয়। সেভ করার জন্য সঠিক অ্যাডমিন সিক্রেট দিন।',
      });
    }

    const next: PaymentSecretsConfig = {
      isLiveMode: typeof body.isLiveMode === 'boolean' ? body.isLiveMode : (current.isLiveMode ?? false),
      autoSettle: typeof body.autoSettle === 'boolean' ? body.autoSettle : (current.autoSettle ?? true),
      bkashAppKey: String(body.bkashAppKey ?? current.bkashAppKey ?? '').trim(),
      bkashAppSecret:
        typeof body.bkashAppSecret === 'string' && body.bkashAppSecret.trim()
          ? body.bkashAppSecret.trim()
          : current.bkashAppSecret || '',
      bkashUsername: String(body.bkashUsername ?? current.bkashUsername ?? '').trim(),
      nagadMerchantId: String(body.nagadMerchantId ?? current.nagadMerchantId ?? '').trim(),
      nagadMerchantKey:
        typeof body.nagadMerchantKey === 'string' && body.nagadMerchantKey.trim()
          ? body.nagadMerchantKey.trim()
          : current.nagadMerchantKey || '',
      rocketMerchantId: String(body.rocketMerchantId ?? current.rocketMerchantId ?? '').trim(),
      rocketApiKey:
        typeof body.rocketApiKey === 'string' && body.rocketApiKey.trim()
          ? body.rocketApiKey.trim()
          : current.rocketApiKey || '',
      sslcommerzStoreId: String(body.sslcommerzStoreId ?? current.sslcommerzStoreId ?? '').trim(),
      sslcommerzStorePassword:
        typeof body.sslcommerzStorePassword === 'string' && body.sslcommerzStorePassword.trim()
          ? body.sslcommerzStorePassword.trim()
          : current.sslcommerzStorePassword || '',
      updatedAt: new Date().toISOString(),
    };

    const persisted = writePaymentSecrets(next);
    return res.status(200).json({
      ok: true,
      persistedOnServer: persisted,
      config: {
        isLiveMode: next.isLiveMode,
        autoSettle: next.autoSettle,
        bkashAppKey: next.bkashAppKey,
        hasBkashSecret: Boolean(next.bkashAppSecret),
        maskedBkashSecret: maskVal(next.bkashAppSecret),
        bkashUsername: next.bkashUsername,
        nagadMerchantId: next.nagadMerchantId,
        hasNagadKey: Boolean(next.nagadMerchantKey),
        maskedNagadKey: maskVal(next.nagadMerchantKey),
        rocketMerchantId: next.rocketMerchantId,
        hasRocketKey: Boolean(next.rocketApiKey),
        maskedRocketKey: maskVal(next.rocketApiKey),
        sslcommerzStoreId: next.sslcommerzStoreId,
        hasSslPassword: Boolean(next.sslcommerzStorePassword),
        maskedSslPassword: maskVal(next.sslcommerzStorePassword),
      },
    });
  }

  return res.status(400).json({ ok: false, error: 'Unknown action' });
}
