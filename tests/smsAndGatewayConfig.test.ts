import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import smsHandler, { SMS_PROVIDER_PRESETS } from '../api/sms';
import paymentGatewayHandler from '../api/payment-gateway';

const SECRETS_FILE = path.join(process.cwd(), '.gateway_secrets.json');
const TMP_SECRETS_FILE = path.join(os.tmpdir(), '.marketbd_gateway_secrets.json');
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
    if (fs.existsSync(TMP_SECRETS_FILE)) {
      fs.unlinkSync(TMP_SECRETS_FILE);
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

  it('falls back to non-masking callerID 1234 and clean single-line OTP on BulkSMS Dhaka rejection', async () => {
    const prevFetch = globalThis.fetch;
    const prevSecrets = fs.existsSync(SECRETS_FILE) ? fs.readFileSync(SECRETS_FILE, 'utf-8') : null;
    if (fs.existsSync(SECRETS_FILE)) fs.unlinkSync(SECRETS_FILE);

    const calls: string[] = [];
    (globalThis as any).fetch = async (url: string) => {
      calls.push(String(url));
      if (String(url).includes('settings/sms_config')) {
        return {
          ok: true,
          status: 200,
          text: async () => '{}',
          json: async () => ({
            fields: {
              maskingEnabled: { booleanValue: true },
              otpTemplate: { stringValue: 'Buy Sell & Exchange\nIn Bangladesh\nMarketBD.Net \nOTP is {otp}' },
            },
          }),
        };
      }
      if (String(url).includes('callerID=MarketBD.Net')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ Status: '1011', Success: 'false', Message: 'Sender ID not approved' }),
        };
      }
      if (String(url).includes('Buy+Sell')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ Status: '1006', Success: 'false', Message: 'Content Validation Error' }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ Status: '1000', Success: 'true', Message: 'Your OTP Send Successful!!' }),
      };
    };

    const prevKey = process.env.SMS_API_KEY;
    process.env.SMS_API_KEY = 'unit-test-live-key';

    try {
      const mockOtp = createMockRes();
      await smsHandler(
        {
          method: 'POST',
          headers: {},
          body: { action: 'send_otp', phone: '01711223344' },
        },
        mockOtp.res
      );

      expect(mockOtp.statusCode).toBe(200);
      expect(mockOtp.body.ok).toBe(true);
      expect(mockOtp.body.usedCaller).toBe('1234');
      expect(calls.some(c => c.includes('callerID=1234') && c.includes('Your+MarketBD.Net+OTP+is+'))).toBe(true);
    } finally {
      (globalThis as any).fetch = prevFetch;
      if (prevKey === undefined) delete process.env.SMS_API_KEY;
      else process.env.SMS_API_KEY = prevKey;
      if (prevSecrets !== null) fs.writeFileSync(SECRETS_FILE, prevSecrets, 'utf-8');
    }
  });

  it('switches cleanly between Non-Masking (1234) and Masking (MarketBD.Net) via save_config', async () => {
    const saveNonMask = createMockRes();
    await smsHandler(
      {
        method: 'POST',
        headers: {},
        body: {
          action: 'save_config',
          providerId: 'bulksmsdhaka',
          providerName: 'BulkSMS Dhaka (bulksmsdhaka.net)',
          apiUrl: 'https://bulksmsdhaka.net/api',
          senderId: '1234',
          maskingEnabled: false,
          isLiveMode: true,
          otpTemplate: 'Your MarketBD.Net OTP is {otp}',
        },
      },
      saveNonMask.res
    );

    expect(saveNonMask.statusCode).toBe(200);
    expect(saveNonMask.body.config.maskingEnabled).toBe(false);
    expect(saveNonMask.body.config.senderId).toBe('1234');

    const getNonMask = createMockRes();
    await smsHandler({ method: 'POST', headers: {}, body: { action: 'get_config' } }, getNonMask.res);
    expect(getNonMask.statusCode).toBe(200);
    expect(getNonMask.body.config.maskingEnabled).toBe(false);
    expect(getNonMask.body.config.senderId).toBe('1234');
  });
});
