import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import smsHandler, { SMS_PROVIDER_PRESETS } from '../api/sms';
import paymentGatewayHandler from '../api/payment-gateway';

const SECRETS_FILE = path.join(process.cwd(), '.gateway_secrets.json');
const hadSecretsBefore = fs.existsSync(SECRETS_FILE);
const prevSecretsContent = hadSecretsBefore ? fs.readFileSync(SECRETS_FILE, 'utf-8') : null;

function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;
  const res: any = {
    setHeader(k: string, v: string) {
      headers[k] = v;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      body = data;
      return res;
    },
  };
  return {
    res,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
  };
}

describe('Unified SMS Provider & Payment Gateway Config APIs', () => {
  afterAll(() => {
    if (hadSecretsBefore && prevSecretsContent !== null) {
      fs.writeFileSync(SECRETS_FILE, prevSecretsContent, 'utf-8');
    } else if (fs.existsSync(SECRETS_FILE)) {
      fs.unlinkSync(SECRETS_FILE);
    }
  });

  it('exposes Bangladesh SMS provider presets including custom provider', () => {
    expect(SMS_PROVIDER_PRESETS.bulksmsdhaka.companyName).toContain('BulkSMS Dhaka');
    expect(SMS_PROVIDER_PRESETS.bulksmsbd.companyName).toContain('BulkSMS BD');
    expect(SMS_PROVIDER_PRESETS.sslwireless.requiresSid).toBe(true);
    expect(SMS_PROVIDER_PRESETS.custom.id).toBe('custom');
  });

  it('saves SMS provider company name, API URL, and masks the saved SMS API Key', async () => {
    const mockSave = createMockRes();
    await smsHandler(
      {
        method: 'POST',
        headers: {},
        body: {
          action: 'save_config',
          providerId: 'custom',
          providerName: 'My Custom BD SMS Ltd',
          apiUrl: 'https://sms.example.com/api',
          apiKey: 'secret-test-key-9876',
          senderId: 'MarketBD.Net',
          maskingEnabled: true,
          isLiveMode: false,
          otpTemplate: 'MarketBD OTP: {otp}',
        },
      },
      mockSave.res
    );

    expect(mockSave.statusCode).toBe(200);
    expect(mockSave.body.ok).toBe(true);
    expect(mockSave.body.config.providerName).toBe('My Custom BD SMS Ltd');
    expect(mockSave.body.config.hasApiKey).toBe(true);
    expect(mockSave.body.config.maskedApiKey).toContain('9876');
    expect(JSON.stringify(mockSave.body)).not.toContain('secret-test-key-9876');

    const mockGet = createMockRes();
    await smsHandler({ method: 'POST', headers: {}, body: { action: 'get_config' } }, mockGet.res);
    expect(mockGet.statusCode).toBe(200);
    expect(mockGet.body.config.providerName).toBe('My Custom BD SMS Ltd');
    expect(mockGet.body.config.hasApiKey).toBe(true);
  });

  it('saves Payment Gateway API keys/secrets securely and returns masked status only', async () => {
    const mockSave = createMockRes();
    await paymentGatewayHandler(
      {
        method: 'POST',
        headers: {},
        body: {
          action: 'save_config',
          isLiveMode: true,
          autoSettle: true,
          bkashAppKey: 'bkash-app-123',
          bkashAppSecret: 'bkash-super-secret-5544',
          nagadMerchantId: 'NAGAD-001',
          nagadMerchantKey: 'nagad-key-8899',
          rocketMerchantId: 'RCK-001',
          rocketApiKey: 'rocket-secret-7766',
          sslcommerzStoreId: 'ssl-store-01',
          sslcommerzStorePassword: 'ssl-pass-3322',
        },
      },
      mockSave.res
    );

    expect(mockSave.statusCode).toBe(200);
    expect(mockSave.body.ok).toBe(true);
    expect(mockSave.body.config.hasBkashSecret).toBe(true);
    expect(mockSave.body.config.maskedBkashSecret).toContain('5544');
    expect(mockSave.body.config.hasNagadKey).toBe(true);
    expect(mockSave.body.config.hasRocketKey).toBe(true);
    expect(mockSave.body.config.hasSslPassword).toBe(true);
    expect(JSON.stringify(mockSave.body)).not.toContain('bkash-super-secret-5544');
    expect(JSON.stringify(mockSave.body)).not.toContain('ssl-pass-3322');
  });
});
