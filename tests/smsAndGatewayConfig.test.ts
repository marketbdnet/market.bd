import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import smsHandler, { SMS_PROVIDER_PRESETS } from '../api/sms';
import paymentGatewayHandler from '../api/payment-gateway';
import { signAdminToken } from '../api/admin-auth';

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

  it('rejects unauthenticated save_config calls on SMS and Payment Gateway endpoints', async () => {
    const unauthSms = createMockRes();
    await smsHandler({ method: 'POST', headers: {}, body: { action: 'save_config' } }, unauthSms.res);
    expect(unauthSms.statusCode).toBe(401);

    const unauthPay = createMockRes();
    await paymentGatewayHandler({ method: 'POST', headers: {}, body: { action: 'save_config' } }, unauthPay.res);
    expect(unauthPay.statusCode).toBe(401);
  });

  it('saves SMS provider company name, API URL, and masks the saved SMS API Key', async () => {
    const mockSave = createMockRes();
    await smsHandler(
      {
        method: 'POST',
        headers: { authorization: `Bearer ${signAdminToken()}` },
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
        headers: { authorization: `Bearer ${signAdminToken()}` },
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
        headers: { authorization: `Bearer ${signAdminToken()}` },
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

  it('sanitizes accidental note text in SMS_CALLER_ID and runs admin_test_otp atomically', async () => {
    const prevFetch = globalThis.fetch;
    const prevCaller = process.env.SMS_CALLER_ID;
    const prevSecrets = fs.existsSync(SECRETS_FILE) ? fs.readFileSync(SECRETS_FILE, 'utf-8') : null;
    if (fs.existsSync(SECRETS_FILE)) fs.unlinkSync(SECRETS_FILE);

    process.env.SMS_CALLER_ID = '1234 (অথবা আপনার অনুমোদিত Non-Masking / Masking Sender ID)';
    let sentUrl = '';
    (globalThis as any).fetch = async (url: string) => {
      if (String(url).includes('settings/sms_config')) {
        return { ok: true, status: 200, json: async () => ({ fields: {} }) };
      }
      sentUrl = String(url);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ Status: '1000', Success: 'true', Message: 'Your OTP Send Successful!!' }),
      };
    };

    try {
      const getCfg = createMockRes();
      await smsHandler({ method: 'POST', headers: {}, body: { action: 'get_config' } }, getCfg.res);
      expect(getCfg.body.config.senderId).toBe('1234');

      const testOtp = createMockRes();
      await smsHandler(
        {
          method: 'POST',
          headers: { authorization: `Bearer ${signAdminToken()}` },
          body: {
            action: 'admin_test_otp',
            phone: '01711223344',
            providerId: 'bulksmsdhaka',
            apiUrl: 'https://bulksmsdhaka.net/api',
            apiKey: 'atomic-test-key',
            senderId: '1234 (helper text)',
            maskingEnabled: false,
            isLiveMode: true,
            otpTemplate: 'Your MarketBD.Net OTP is {otp}',
          },
        },
        testOtp.res
      );
      expect(testOtp.statusCode).toBe(200);
      expect(testOtp.body.ok).toBe(true);
      expect(testOtp.body.usedCaller).toBe('1234');
      expect(sentUrl).toContain('callerID=1234');
      expect(sentUrl).toContain('apikey=atomic-test-key');
    } finally {
      (globalThis as any).fetch = prevFetch;
      if (prevCaller === undefined) delete process.env.SMS_CALLER_ID;
      else process.env.SMS_CALLER_ID = prevCaller;
      if (prevSecrets !== null) fs.writeFileSync(SECRETS_FILE, prevSecrets, 'utf-8');
    }
  });

  it('blocks personal mobile numbers as Sender ID in No-Reply mode and appends Do not reply to text/OTP SMS', async () => {
    const blockedSave = createMockRes();
    await smsHandler(
      {
        method: 'POST',
        headers: { authorization: `Bearer ${signAdminToken()}` },
        body: {
          action: 'save_config',
          providerId: 'bulksmsdhaka',
          senderId: '01711223344',
          maskingEnabled: false,
          noReplyMode: true,
        },
      },
      blockedSave.res
    );
    expect(blockedSave.statusCode).toBe(400);
    expect(blockedSave.body.ok).toBe(false);

    const prevFetch = globalThis.fetch;
    const prevKey = process.env.SMS_API_KEY;
    process.env.SMS_API_KEY = 'no-reply-test-key';
    const sentUrls: string[] = [];
    (globalThis as any).fetch = async (url: string) => {
      const s = String(url);
      if (s.includes('settings/sms_config')) {
        return { ok: true, status: 200, json: async () => ({ fields: {} }) };
      }
      sentUrls.push(s);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ Status: '1000', Success: 'true', Message: 'Sent' }),
      };
    };

    try {
      const textRes = createMockRes();
      await smsHandler(
        {
          method: 'POST',
          headers: { authorization: `Bearer ${signAdminToken()}` },
          body: {
            action: 'send_text',
            phone: '01711223344',
            message: 'Welcome offer active on MarketBD',
          },
        },
        textRes.res
      );
      expect(textRes.statusCode).toBe(200);
      expect(sentUrls.some(u => decodeURIComponent(u).replace(/\+/g, ' ').includes('Do not reply to this SMS'))).toBe(true);
    } finally {
      (globalThis as any).fetch = prevFetch;
      if (prevKey === undefined) delete process.env.SMS_API_KEY;
      else process.env.SMS_API_KEY = prevKey;
    }
  });

  it('calculates real verified revenue without fabricating amounts from demo/catalog featured ads', async () => {
    const { calculateRealVerifiedRevenue } = await import('../src/utils/revenueHelper');
    const demoCatalogProducts: any[] = [
      { id: 'cat-1', status: 'active', adType: 'featured', isFeatured: true },
      { id: 'cat-2', status: 'active', adType: 'top_ad' },
      { id: 'cat-3', status: 'active', adType: 'urgent', isUrgent: true },
    ];
    expect(calculateRealVerifiedRevenue(demoCatalogProducts, [])).toBe(0);

    const withRealPayments = calculateRealVerifiedRevenue(
      [
        ...demoCatalogProducts,
        {
          id: 'real-ad-1',
          status: 'active',
          adType: 'featured',
          paymentInfo: { method: 'bkash', senderNumber: '01711223344', trxId: 'TRXREAL01', amount: 599 },
        },
      ],
      [
        {
          paymentId: 'PAY-1',
          orderId: 'ORD-100',
          userId: 'u1',
          customerName: 'Hasan',
          customerMobile: '01711223344',
          paymentMethod: 'bKash',
          marketbdAccountNumber: '01723230230',
          senderMobileNumber: '01711223344',
          transactionId: 'TRXPAID99',
          expectedAmount: 299,
          submittedAmount: 299,
          amountMatched: true,
          paymentDate: new Date().toISOString(),
          status: 'paid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    );
    expect(withRealPayments).toBe(898);
  });
});
