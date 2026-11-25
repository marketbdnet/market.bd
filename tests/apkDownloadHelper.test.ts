import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDirectApkUrl, downloadApkFile, uploadApkFileToServer } from '../src/utils/apkDownloadHelper';

describe('apkDownloadHelper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('formatDirectApkUrl', () => {
    it('defaults to /MarketBD.apk when empty', () => {
      expect(formatDirectApkUrl('')).toBe('/MarketBD.apk');
      expect(formatDirectApkUrl(undefined)).toBe('/MarketBD.apk');
    });

    it('keeps /MarketBD.apk directly and upgrades legacy dead URLs', () => {
      expect(formatDirectApkUrl('/MarketBD.apk')).toBe('/MarketBD.apk');
      expect(formatDirectApkUrl('/marketbd-release-v2.5.0.apk')).toBe('/MarketBD.apk');
      expect(formatDirectApkUrl('https://old-service.run.app/MarketBD.apk')).toBe('/MarketBD.apk');
    });

    it('converts Google Drive sharing links to direct download links', () => {
      expect(formatDirectApkUrl('https://drive.google.com/file/d/1AbCdEfGhIjK/view?usp=sharing')).toBe(
        'https://drive.google.com/uc?export=download&id=1AbCdEfGhIjK&confirm=t'
      );
      expect(formatDirectApkUrl('https://drive.google.com/open?id=9ZyXwVu')).toBe(
        'https://drive.google.com/uc?export=download&id=9ZyXwVu&confirm=t'
      );
    });

    it('preserves GitHub Releases download links and converts blob links to raw', () => {
      const releaseUrl = 'https://github.com/marketbd/app/releases/download/latest-apk/MarketBD.apk';
      expect(formatDirectApkUrl(releaseUrl)).toBe(releaseUrl);

      expect(formatDirectApkUrl('https://github.com/marketbd/app/blob/main/MarketBD.apk')).toBe(
        'https://raw.githubusercontent.com/marketbd/app/main/MarketBD.apk'
      );
    });
  });

  describe('downloadApkFile', () => {
    it('calls onError and returns false when same-origin APK candidates return 404 or HTML fallback', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        type: 'basic',
        headers: new Headers({ 'content-type': 'application/json' })
      });
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', { location: { origin: 'https://marketbd.net' } });

      const onError = vi.fn();
      const onComplete = vi.fn();

      const result = await downloadApkFile({
        apkUrl: '/MarketBD.apk',
        onError,
        onComplete
      });

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('rejects HTML SPA fallback even when status is 200', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        type: 'basic',
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' })
      });
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', { location: { origin: 'https://marketbd.net' } });

      const onError = vi.fn();
      const result = await downloadApkFile({
        apkUrl: '/MarketBD.apk',
        onError
      });

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('rejects stale blob: URLs by default instead of failing silently', async () => {
      const onError = vi.fn();
      const onComplete = vi.fn();

      const result = await downloadApkFile({
        apkUrl: 'blob:https://marketbd.net/1234-5678',
        onError,
        onComplete
      });

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('triggers anchor download when /MarketBD.apk returns binary content-type (or 405 HEAD -> 206 GET)', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 405,
          type: 'basic',
          headers: new Headers()
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 206,
          type: 'basic',
          headers: new Headers({ 'content-type': 'application/vnd.android.package-archive' })
        });
      const clickSpy = vi.fn();
      const fakeAnchor: any = { style: {}, click: clickSpy };
      const bodyChildren = new Set<any>();

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

      const onError = vi.fn();
      const result = await downloadApkFile({
        apkUrl: '/MarketBD.apk',
        version: '2.5.0',
        onError
      });

      expect(result).toBe(true);
      expect(onError).not.toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(fakeAnchor.href).toBe('/MarketBD.apk');
      expect(fakeAnchor.download).toBe('MarketBD_v2.5.0.apk');
    });

    it('avoids target=_blank inside MarketBDAndroidApp WebView so DownloadListener saves APK to storage', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 302,
        type: 'opaqueredirect',
        headers: new Headers()
      });
      const clickSpy = vi.fn();
      const fakeAnchor: any = { style: {}, click: clickSpy };
      const bodyChildren = new Set<any>();

      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 MarketBDAndroidApp/2.5.0'
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

      const result = await downloadApkFile({
        apkUrl: '/api/download/apk',
        version: '2.5.0'
      });

      expect(result).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(fakeAnchor.target).toBeUndefined();
      expect(fakeAnchor.download).toBe('MarketBD_v2.5.0.apk');
    });
  });

  describe('uploadApkFileToServer', () => {
    it('rejects files without PK/ZIP magic signature before network upload', async () => {
      const fakeNotZip = new File([new Uint8Array(2048).fill(0x41)], 'fake.apk', {
        type: 'application/vnd.android.package-archive'
      });

      const res = await uploadApkFileToServer(fakeNotZip);
      expect(res.ok).toBe(false);
      expect(res.code).toBe('INVALID_APK_SIGNATURE');
    });
  });
});
