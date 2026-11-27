import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';

const BRAND_RED = '#E50914';

export const LiveClockWidget: React.FC = () => {
  const { language, clockSettings } = useMarket();

  // Helper to get real Bangladesh (Asia/Dhaka) Time
  const getDhakaNow = (): Date => {
    const now = new Date();
    // Dhaka is UTC+6 without DST
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcTime + 6 * 3600000);
  };

  const [now, setNow] = useState<Date>(getDhakaNow);

  useEffect(() => {
    // Precise timer synchronized to seconds boundary to prevent drift
    let timerId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const tick = () => {
      if (!isMounted) return;
      setNow(getDhakaNow());
    };

    // Initial tick
    tick();

    // Calculate delay until the next exact second boundary
    const startPreciseTimer = () => {
      if (timerId) clearInterval(timerId);
      const currentMs = new Date().getMilliseconds();
      const delayUntilNextSecond = 1000 - currentMs;

      const timeoutId = setTimeout(() => {
        if (!isMounted) return;
        tick();
        timerId = setInterval(tick, 1000);
      }, delayUntilNextSecond);

      return () => {
        clearTimeout(timeoutId);
        if (timerId) clearInterval(timerId);
      };
    };

    const cleanupTimer = startPreciseTimer();

    // Visibility API optimization: sync immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      cleanupTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (clockSettings && clockSettings.isWidgetEnabled === false) {
    return null;
  }

  const getDateTimeComponents = () => {
    const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const toBnNums = (str: string | number) =>
      String(str).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

    const dayIdx = now.getDay();
    const dateNum = now.getDate();
    const monthIdx = now.getMonth();
    const yearNum = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const showSec = clockSettings?.showSeconds !== false;

    if (language === 'bn') {
      const dayNameBn = bnDays[dayIdx];
      const dayDateBn = toBnNums(dateNum);
      const monthNameBn = bnMonths[monthIdx];
      const yearBn = toBnNums(yearNum);

      const hoursBn = toBnNums(String(hours).padStart(2, '0'));
      const minBn = toBnNums(String(minutes).padStart(2, '0'));
      const secBn = toBnNums(String(seconds).padStart(2, '0'));

      return {
        dateStr: `${dayNameBn}, ${dayDateBn} ${monthNameBn} ${yearBn}`,
        hoursStr: hoursBn,
        minStr: minBn,
        secStr: secBn,
        ampmStr: ampm,
        showSec
      };
    } else {
      const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayNameEn = daysEn[dayIdx];
      const monthNameEn = monthsEn[monthIdx];

      const hoursStr = String(hours).padStart(2, '0');
      const minStr = String(minutes).padStart(2, '0');
      const secStr = String(seconds).padStart(2, '0');

      return {
        dateStr: `${dayNameEn}, ${dateNum} ${monthNameEn} ${yearNum}`,
        hoursStr,
        minStr,
        secStr,
        ampmStr: ampm,
        showSec
      };
    }
  };

  const { dateStr, hoursStr, minStr, secStr, ampmStr, showSec } = getDateTimeComponents();

  const isLegacyUnversioned = !clockSettings?.clockVersion || clockSettings.clockVersion < 2;
  const resolvedFontKey =
    isLegacyUnversioned && clockSettings?.fontFamily === 'orbitron' && clockSettings?.textColor === '#fbbf24'
      ? 'vt323'
      : clockSettings?.fontFamily || 'vt323';

  const getFontFamilyCss = () => {
    switch (resolvedFontKey) {
      case 'vt323':
        return "'VT323', 'Share Tech Mono', monospace";
      case 'orbitron':
        return "'Orbitron', 'Montserrat', sans-serif";
      case 'sharetech':
        return "'Share Tech Mono', monospace";
      case 'firacode':
        return "'Fira Code', monospace";
      case 'pressstart':
        return "'Press Start 2P', monospace";
      case 'siliguri':
        return "'Hind Siliguri', sans-serif";
      case 'sans':
        return "'Montserrat', ui-sans-serif, system-ui, sans-serif";
      case 'serif':
        return "'Playfair Display', Georgia, serif";
      case 'custom':
        return clockSettings?.customFontFamily || "'Orbitron', monospace";
      default:
        return "'VT323', 'Share Tech Mono', monospace";
    }
  };

  // Font size calculation for time and date
  const getTimeFontSizeStyle = () => {
    if (clockSettings?.fontSize === 'custom' && clockSettings.customFontSizePx) {
      return { fontSize: `${clockSettings.customFontSizePx}px` };
    }
    return {};
  };

  const getTimeFontSizeClass = () => {
    const isVt323 = resolvedFontKey === 'vt323';
    switch (clockSettings?.fontSize) {
      case 'xs':
        return isVt323 ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs';
      case 'sm':
        return isVt323 ? 'text-[15px] sm:text-[18px]' : 'text-xs sm:text-sm';
      case 'md':
        return isVt323 ? 'text-base sm:text-xl' : 'text-sm sm:text-base';
      case 'lg':
        return isVt323 ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg';
      case 'xl':
        return 'text-lg sm:text-xl';
      case '2xl':
        return 'text-xl sm:text-2xl';
      case '3xl':
        return 'text-2xl sm:text-3xl';
      default:
        return isVt323 ? 'text-[15px] sm:text-[18px]' : 'text-xs sm:text-sm';
    }
  };

  const getDateFontSizeClass = () => {
    switch (clockSettings?.fontSize) {
      case 'xs':
        return 'text-[7.5px] sm:text-[8.5px]';
      case 'sm':
        return 'text-[8px] sm:text-[9.5px]';
      case 'md':
        return 'text-[9px] sm:text-[10.5px]';
      case 'lg':
        return 'text-[10px] sm:text-xs';
      case 'xl':
      case '2xl':
      case '3xl':
        return 'text-xs';
      default:
        return 'text-[8px] sm:text-[9.5px]';
    }
  };

  const getFontWeightClass = () => {
    switch (clockSettings?.fontWeight) {
      case 'normal':
        return 'font-normal';
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      case 'black':
        return 'font-black';
      default:
        return 'font-black';
    }
  };

  const fontFamilyCss = getFontFamilyCss();
  const rawBg = clockSettings?.bgColor?.trim();
  const isDefaultBg = !rawBg || rawBg.toLowerCase() === '#090d16' || (isLegacyUnversioned && rawBg.toLowerCase() === '#0f172a');
  const bgColor = isDefaultBg ? '#040507' : rawBg;

  const rawBorder = clockSettings?.borderColor?.trim();
  const borderColor =
    rawBorder && rawBorder !== '#334155' && rawBorder !== '#ef4444'
      ? rawBorder
      : '#ffffff';

  const rawColor = clockSettings?.textColor?.trim();
  const timeColor =
    !rawColor ||
    rawColor === '#22c55e' ||
    rawColor === '#34d399' ||
    (isLegacyUnversioned && rawColor.toLowerCase() === '#fbbf24')
      ? '#00FF66'
      : rawColor;

  const rawDateColor = clockSettings?.dateTextColor?.trim();
  const dateColor =
    !rawDateColor ||
    rawDateColor === '#6ee7b7' ||
    (isLegacyUnversioned && rawDateColor.toLowerCase() === '#fbbf24')
      ? '#FFFFFF'
      : rawDateColor;

  const isGlow = clockSettings?.glowEffect !== false;
  const showCrest = clockSettings?.showPulseIcon !== false;

  return (
    <div
      id="live-navbar-clock-widget"
      style={{
        background: `radial-gradient(120% 100% at 14% 50%, rgba(229, 9, 20, 0.22) 0%, rgba(229, 9, 20, 0.04) 48%, ${bgColor} 100%)`,
        backgroundColor: bgColor,
        borderColor: borderColor,
        boxShadow: isGlow
          ? `0 0 14px rgba(0, 0, 0, 0.55), 0 0 10px ${borderColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 0 rgba(229, 9, 20, 0.35)`
          : `0 2px 8px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
      }}
      className="relative overflow-hidden h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full border-[1.5px] ring-1 ring-white/35 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 select-none cursor-default max-w-full"
      title={language === 'bn' ? 'বাংলাদেশ সময় (লাইভ)' : 'Bangladesh Time (Live)'}
    >
      {/* Top Specular Mirror Sheen (Welcome to MarketBD Glass Stage Aesthetic) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-0 h-[42%] rounded-t-full bg-gradient-to-b from-white/[0.14] via-white/[0.04] to-transparent"
      />

      {/* Signature Bi-Color Horizon Beam Underline (Crimson #E50914 -> Pure White) */}
      <span
        aria-hidden="true"
        style={{
          background: `linear-gradient(90deg, ${BRAND_RED} 0%, ${BRAND_RED} 28%, #FFFFFF 60%, rgba(255,255,255,0.16) 100%)`,
          boxShadow: `0 0 6px rgba(229, 9, 20, 0.65)`
        }}
        className="pointer-events-none absolute inset-x-3.5 bottom-[2px] h-[1.5px] rounded-full opacity-90"
      />

      {/* Left Twin-Arc Orbital Chronometer Emblem */}
      {showCrest && (
        <div
          aria-hidden="true"
          className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible">
            {/* Outer Crimson Orbital Arc */}
            <path
              d="M 12 2.2 A 9.8 9.8 0 1 1 3.6 17"
              fill="none"
              stroke={BRAND_RED}
              strokeWidth="1.9"
              strokeLinecap="round"
              className="mbd-clock-orbit-cw"
            />
            {/* Inner Crisp White Orbital Arc */}
            <path
              d="M 12 18.8 A 6.8 6.8 0 0 1 7.2 7.2"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.92"
              className="mbd-clock-orbit-ccw"
            />
            {/* Minimalist Precision Hands */}
            <path
              d="M 12 7.6 L 12 12 L 15.2 13.8"
              fill="none"
              stroke={timeColor}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1.2" fill="#FFFFFF" />
          </svg>
        </div>
      )}

      {/* Telemetry Stack: Date Line + Luminous Digital Digits */}
      <div className="relative z-10 flex flex-col text-left leading-none justify-center gap-[1.5px] min-w-0 pb-[2px]">
        {/* Line 1: Crisp Editorial Date + BDT Meridian Tag */}
        <div className="flex items-center justify-between gap-1.5 leading-none">
          <span
            style={{
              fontFamily: "'Montserrat', 'Hind Siliguri', system-ui, sans-serif",
              color: dateColor,
              textShadow: '0 1px 2px rgba(0,0,0,0.95)'
            }}
            className={`${getDateFontSizeClass()} font-bold tracking-tight whitespace-nowrap truncate`}
          >
            {dateStr}
          </span>
          <span
            style={{
              fontFamily: "'Montserrat', system-ui, sans-serif",
              borderColor: 'rgba(229, 9, 20, 0.7)'
            }}
            className="hidden md:inline-flex items-center px-1 py-[0.5px] rounded text-[7px] font-black tracking-[0.12em] uppercase text-white/95 bg-[#E50914]/25 border shrink-0"
          >
            BD
          </span>
        </div>

        {/* Line 2: High-Precision Tabular Digital Readout */}
        <div
          style={{
            fontFamily: fontFamilyCss,
            fontVariantNumeric: 'tabular-nums',
            color: timeColor,
            textShadow: isGlow
              ? `0 0 10px ${timeColor}CC, 0 0 4px ${timeColor}99, 0 1px 2px rgba(0,0,0,0.98)`
              : '0 1px 2px rgba(0,0,0,0.95)',
            ...getTimeFontSizeStyle()
          }}
          className={`${getTimeFontSizeClass()} ${getFontWeightClass()} tracking-wider whitespace-nowrap flex items-center leading-none`}
        >
          <span className="inline-block text-center min-w-[1.2em]">{hoursStr}</span>
          <span className="mbd-clock-colon mx-[1px] sm:mx-0.5 text-white/90">:</span>
          <span className="inline-block text-center min-w-[1.2em]">{minStr}</span>

          {showSec && (
            <>
              <span className="mbd-clock-colon mx-[1px] sm:mx-0.5 text-white/80">:</span>
              <span
                style={{
                  color: timeColor,
                  textShadow: isGlow
                    ? `0 0 8px ${timeColor}, 0 1px 2px rgba(0,0,0,0.95)`
                    : undefined
                }}
                className="inline-flex items-center justify-center px-1 py-[0.5px] rounded-[4px] bg-white/[0.08] border border-white/15 min-w-[1.45em] text-center leading-none"
              >
                {secStr}
              </span>
            </>
          )}

          <span
            style={{
              fontFamily: "'Montserrat', system-ui, sans-serif",
              color: '#FFFFFF',
              textShadow: isGlow ? `0 0 6px ${BRAND_RED}AA` : undefined
            }}
            className="ml-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.12em] text-white/95"
          >
            {ampmStr}
          </span>
        </div>
      </div>
    </div>
  );
};
