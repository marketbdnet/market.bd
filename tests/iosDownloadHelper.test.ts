import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isIosDevice,
  isIosSafari,
  formatDirectIosUrl,
  downloadIosAppProfile
} from '../src/utils/iosDownloadHelper';

describe('iosDownloadHelper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('device detection', () => {
    it('detects iPhone and iPad user agents accurately', () => {
      expect(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')).toBe(true);
      expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5)).toBe(true);
      expect(isIosDevice('Mozilla/5.0 (Linux; Android 14; Pixel 8)', 'Linux armv8l', 5)).toBe(false);
    });

    it('distinguishes iOS Safari from iOS Chrome wrappers', () => {
      expect(isIosSafari('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1')).toBe(true);
      expect(isIosSafari('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 CriOS/123.0 Mobile/15E148 Safari/604.1')).toBe(false);
    });
  });

  describe('formatDirectIosUrl', () => {
    it('defaults to /api/download/ios when empty', () => {
      expect(formatDirectIosUrl('')).toBe('/api/download/ios');
      expect(formatDirectIosUrl(undefined)).toBe('/api/download/ios');
    });

    it('preserves canonical same-origin paths and external App Store links', () => {
      expect(formatDirectIosUrl('/MarketBD.mobileconfig')).toBe('/MarketBD.mobileconfig');
      expect(formatDirectIosUrl('/api/download/ios')).toBe('/api/download/ios');
      const appStoreUrl = 'https://apps.apple.com/app/id1234567890';
      expect(formatDirectIosUrl(appStoreUrl)).toBe(appStoreUrl);
    });

    it('converts Google Drive and Dropbox URLs to direct download URLs', () => {
      expect(formatDirectIosUrl('https://drive.google.com/file/d/AbCdEf123/view')).toBe(
        'https://drive.google.com/uc?export=download&id=AbCdEf123&confirm=t'
      );
      expect(formatDirectIosUrl('https://www.dropbox.com/s/xyz/MarketBD.mobileconfig?dl=0')).toBe(
        'https://www.dropbox.com/s/xyz/MarketBD.mobileconfig?dl=1'
      );
    });
  });

  describe('downloadIosAppProfile', () => {
    it('rejects HTML SPA fallback and reports error cleanly', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        type: 'basic',
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' })
      });
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', { location: { origin: 'https://marketbd.net' } });

      const onError = vi.fn();
      const ok = await downloadIosAppProfile({ iosUrl: '/api/download/ios', onError });

      expect(ok).toBe(false);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('triggers native location navigation on iPhone so Safari prompts Configuration Profile install', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        type: 'basic',
        headers: new Headers({ 'content-type': 'application/x-apple-aspen-config; charset=utf-8' })
      });
      const assignSpy = vi.fn();
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 5
      });
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', {
        location: { origin: 'https://marketbd.net', assign: assignSpy }
      });

      const onError = vi.fn();
      const ok = await downloadIosAppProfile({ iosUrl: '/api/download/ios', onError });

      expect(ok).toBe(true);
      expect(onError).not.toHaveBeenCalled();
      expect(assignSpy).toHaveBeenCalledWith('/api/download/ios');
    });

    it('triggers anchor file download on Desktop/Android browsers', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        type: 'basic',
        headers: new Headers({ 'content-type': 'application/x-apple-aspen-config; charset=utf-8' })
      });
      const clickSpy = vi.fn();
      const fakeAnchor: any = { style: {}, click: clickSpy };
      const bodyChildren = new Set<any>();

      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0',
        platform: 'Win32',
        maxTouchPoints: 0
      });
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', { location: { origin: 'https://marketbd.net' } });
      vi.stubGlobal('document', {
        createElement: vi.fn(() => fakeAnchor),
        body: {
          appendChild: vi.fn((el: any) => bodyChildren.add(el)),
          contains: vi.fn((el: any) => bodyChildren.has(el)),
          removeChild: vi.fn((el: any) => bodyChildren.delete(el))
        }
      });

      const ok = await downloadIosAppProfile({ iosUrl: '/api/download/ios' });

      expect(ok).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(fakeAnchor.href).toBe('/api/download/ios');
      expect(fakeAnchor.download).toBe('MarketBD_iPhone.mobileconfig');
    });
  });
});
