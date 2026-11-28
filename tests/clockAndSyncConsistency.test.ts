import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  DEFAULT_CLOCK_SETTINGS,
  isLegacyStaleClockConfig,
  sanitizeIncomingClockSettings,
} from '../src/context/MarketContext';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import { isProductPublicActive } from '../src/utils/productStatus';

describe('Clock Migration & Cache Consistency', () => {
  it('rejects stale 2026-08-16 amber/slate Firestore clock preset', () => {
    const staleFirestoreClock = {
      bgColor: '#0f172a',
      borderColor: '#334155',
      textColor: '#fbbf24',
      dateTextColor: '#fbbf24',
      fontFamily: 'orbitron',
      fontSize: 'sm',
      customFontSizePx: 14,
      showPulseIcon: true,
      showSeconds: true,
      isWidgetEnabled: true,
    };
    expect(isLegacyStaleClockConfig(staleFirestoreClock)).toBe(true);
    const result = sanitizeIncomingClockSettings(staleFirestoreClock, DEFAULT_CLOCK_SETTINGS);
    expect(result).toEqual(DEFAULT_CLOCK_SETTINGS);
    expect(result.textColor).toBe('#00FF66');
    expect(result.dateTextColor).toBe('#FFFFFF');
    expect(result.bgColor).toBe('#090d16');
    expect(result.borderColor).toBe('#ffffff');
  });

  it('rejects unversioned stub clock settings without color/font', () => {
    const stub = {
      timeFormat: '12h',
      showSeconds: true,
      showTimeZone: true,
      forcedTimeZone: 'Asia/Dhaka',
    };
    expect(isLegacyStaleClockConfig(stub)).toBe(true);
    expect(sanitizeIncomingClockSettings(stub, DEFAULT_CLOCK_SETTINGS)).toEqual(DEFAULT_CLOCK_SETTINGS);
  });

  it('accepts versioned admin clock updates (clockVersion >= 2)', () => {
    const customAdminClock = {
      ...DEFAULT_CLOCK_SETTINGS,
      textColor: '#FFEA00',
      fontFamily: 'orbitron' as const,
      clockVersion: 2,
    };
    expect(isLegacyStaleClockConfig(customAdminClock)).toBe(false);
    const result = sanitizeIncomingClockSettings(customAdminClock, DEFAULT_CLOCK_SETTINGS);
    expect(result.textColor).toBe('#FFEA00');
    expect(result.fontFamily).toBe('orbitron');
    expect(result.clockVersion).toBe(2);
  });

  it('has aligned canonical catalog count of 416 active ads', () => {
    expect(INITIAL_PRODUCTS.length).toBe(416);
    expect(INITIAL_PRODUCTS.filter(isProductPublicActive).length).toBe(416);
  });

  it('aligns Service Worker and index.html cache flush versions on v10', () => {
    const sw = fs.readFileSync(path.join(process.cwd(), 'public', 'sw.js'), 'utf8');
    const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    expect(sw).toContain("const CACHE_NAME = 'marketbd-app-v10';");
    expect(html).toContain('marketbd_sw_v10_flushed');
    expect(html).toContain("if (n !== 'marketbd-app-v10')");
  });
});
