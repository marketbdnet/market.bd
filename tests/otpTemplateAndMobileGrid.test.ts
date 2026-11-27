import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { formatOtpMessage, dispatchSmsByProvider } from '../api/sms';
import {
  getAutoAdjustedShowcaseCardClass,
  getAutoAdjustedRecentCardClass,
} from '../src/utils/gridLayout';

describe('Custom 70-Char OTP SMS Template Formatting & Gateway Dispatch', () => {
  it('preserves a 70-char custom English/Bengali OTP template without reverting to default text', () => {
    // Exactly 70 chars when {otp} -> 6 digits
    const tpl70 = 'MarketBD Payment Verify Code {otp}. Valid 5m. Thank you for trusting!';
    const out = formatOtpMessage(tpl70, '482910', true);
    expect(out.length).toBeLessThanOrEqual(70);
    expect(out).toContain('482910');
    expect(out).toContain('MarketBD Payment Verify Code');
    expect(out).not.toContain('Your MarketBD.Net OTP is');

    // Bengali 70-char template
    const bnTpl = 'মার্কেটবিডি পেমেন্ট ভেরিফিকেশন কোড {otp}। কারো সাথে শেয়ার করবেন না।';
    const bnOut = formatOtpMessage(bnTpl, '773311', true);
    expect(bnOut.length).toBeLessThanOrEqual(70);
    expect(bnOut).toContain('773311');
    expect(bnOut).toContain('মার্কেটবিডি পেমেন্ট');
    expect(bnOut).not.toContain('Your MarketBD.Net OTP is');
  });

  it('trims gracefully instead of discarding custom template if slightly over 70 chars', () => {
    const longTpl = 'MarketBD.Net VIP Payment Verification Code is {otp} please enter quickly now';
    const out = formatOtpMessage(longTpl, '998877', true);
    expect(out.length).toBeLessThanOrEqual(70);
    expect(out).toContain('998877');
    expect(out).toContain('MarketBD.Net VIP Payment');
    expect(out).not.toContain('Your MarketBD.Net OTP is');
  });

  it('tries BulkSMS Dhaka /sendtext with custom message before falling back to default OTP text', async () => {
    const calledUrls: string[] = [];
    const mockFetcher = async (url: string) => {
      calledUrls.push(url);
      if (url.includes('/otpsend?')) {
        return {
          httpStatus: 200,
          json: { Success: 'false', Status: '1006', Message: 'Content validation failed' },
          raw: '{"Success":"false","Status":"1006"}',
        };
      }
      // /sendtext succeeds with custom message!
      return {
        httpStatus: 200,
        json: { Success: 'true', Status: '1000' },
        raw: '{"Success":"true","Status":"1000"}',
      };
    };

    const customMsg = 'MarketBD Pay OTP 654321. Stay safe.';
    const res = await dispatchSmsByProvider({
      providerId: 'bulksmsdhaka',
      apiUrl: 'https://bulksmsdhaka.net/api',
      apiKey: 'dummy_key',
      senderId: '1234',
      phone: '01711223344',
      message: customMsg,
      isOtp: true,
      otpCode: '654321',
      noReplyMode: true,
      fetcher: mockFetcher,
    });

    expect(res.usedEndpoint).toBe('sendtext');
    expect(calledUrls.length).toBe(2);
    expect(calledUrls[0]).toContain('/otpsend?');
    expect(calledUrls[1]).toContain('/sendtext?');
    expect(decodeURIComponent(calledUrls[1].replace(/\+/g, ' '))).toContain(customMsg);
    expect(decodeURIComponent(calledUrls[1].replace(/\+/g, ' '))).not.toContain('Your MarketBD.Net OTP is');
  });

  it('prioritizes remote Firestore config timestamp over static SMS_OTP_TEMPLATE env var in api/sms.ts', () => {
    const smsSource = fs.readFileSync(path.join(process.cwd(), 'api/sms.ts'), 'utf-8');
    expect(smsSource).toContain('const preferRemote = remoteTs > storedTs;');
    expect(smsSource).toContain('remote.template ||');
    expect(smsSource).toContain('updatedAt: cfg.updatedAt');
  });
});

describe('Responsive Auto-Adjust Grids for Android (No Blank Trailing Slot)', () => {
  it('renders 6 cards cleanly on Android 2-col, 4 on md 4-col, and 5 on lg 5-col when >= 6 ads exist', () => {
    expect(getAutoAdjustedShowcaseCardClass(0, 6)).toBe('flex');
    expect(getAutoAdjustedShowcaseCardClass(3, 6)).toBe('flex');
    expect(getAutoAdjustedShowcaseCardClass(4, 6)).toBe('flex md:hidden lg:flex');
    expect(getAutoAdjustedShowcaseCardClass(5, 6)).toBe('flex md:hidden');
  });

  it('auto-spans odd trailing card on mobile 2-col when fewer than 6 active ads exist', () => {
    expect(getAutoAdjustedShowcaseCardClass(4, 5)).toContain('col-span-2');
    expect(getAutoAdjustedShowcaseCardClass(2, 3)).toContain('col-span-2');
    expect(getAutoAdjustedShowcaseCardClass(3, 4)).toContain('col-span-1');
  });

  it('balances Recent Ads grid remainders cleanly on mobile 2-col and md 3-col', () => {
    // 16 items: even on mobile 2-col (col-span-1), 1 remainder on md 3-col (md:col-span-3), even on lg 4-col
    const cls16 = getAutoAdjustedRecentCardClass(15, 16);
    expect(cls16).toContain('col-span-1');
    expect(cls16).toContain('md:col-span-3');
    expect(cls16).toContain('lg:col-span-1');

    // 5 items (e.g. filtered category): odd on mobile 2-col (col-span-2), 2 remainder on md 3-col (md:col-span-2)
    const cls5 = getAutoAdjustedRecentCardClass(4, 5);
    expect(cls5).toContain('col-span-2');
    expect(cls5).toContain('md:col-span-2');
  });

  it('FlashSale and HomePage slice up to 6 items and retain lg:grid-cols-5 for desktop', () => {
    const flashSource = fs.readFileSync(path.join(process.cwd(), 'src/components/Home/FlashSale.tsx'), 'utf-8');
    const homeSource = fs.readFileSync(path.join(process.cwd(), 'src/pages/HomePage.tsx'), 'utf-8');

    expect(flashSource).toContain('flashProducts.slice(0, 6)');
    expect(flashSource).toContain('getAutoAdjustedShowcaseCardClass');
    expect(flashSource).toContain('lg:grid-cols-5');

    expect(homeSource).toContain('featuredAds.slice(0, 6)');
    expect(homeSource).toContain('getAutoAdjustedShowcaseCardClass');
    expect(homeSource).toContain('getAutoAdjustedRecentCardClass');
    expect(homeSource).toContain('lg:grid-cols-5');
  });
});
