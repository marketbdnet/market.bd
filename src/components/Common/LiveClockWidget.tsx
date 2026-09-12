import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Clock } from 'lucide-react';

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

  // Font family calculation
  const getFontFamilyCss = () => {
    switch (clockSettings?.fontFamily) {
      case 'vt323':
        return "'VT323', monospace";
      case 'orbitron':
        return "'Orbitron', sans-serif";
      case 'sharetech':
        return "'Share Tech Mono', monospace";
      case 'firacode':
        return "'Fira Code', monospace";
      case 'pressstart':
        return "'Press Start 2P', monospace";
      case 'siliguri':
        return "'Hind Siliguri', sans-serif";
      case 'sans':
        return 'ui-sans-serif, system-ui, sans-serif';
      case 'serif':
        return "'Playfair Display', Georgia, serif";
      case 'custom':
        return clockSettings?.customFontFamily || 'monospace';
      default:
        return "'VT323', monospace";
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
    switch (clockSettings?.fontSize) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-xs sm:text-sm';
      case 'md':
        return 'text-sm sm:text-base';
      case 'lg':
        return 'text-base sm:text-lg';
      case 'xl':
        return 'text-lg sm:text-xl';
      case '2xl':
        return 'text-xl sm:text-2xl';
      case '3xl':
        return 'text-2xl sm:text-3xl';
      default:
        return 'text-xs sm:text-sm';
    }
  };

  const getDateFontSizeClass = () => {
    switch (clockSettings?.fontSize) {
      case 'xs':
        return 'text-[8px]';
      case 'sm':
        return 'text-[9px] sm:text-[10px]';
      case 'md':
        return 'text-[10px] sm:text-xs';
      case 'lg':
        return 'text-xs';
      case 'xl':
      case '2xl':
      case '3xl':
        return 'text-xs sm:text-sm';
      default:
        return 'text-[9px] sm:text-[10px]';
    }
  };

  // Font weight
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
        return 'font-bold';
    }
  };

  const fontFamilyCss = getFontFamilyCss();
  const bgColor = clockSettings?.bgColor || '#090d16';
  const borderColor = clockSettings?.borderColor && clockSettings.borderColor !== '#334155' ? clockSettings.borderColor : '#ef4444';

  // Fallback to sparkling ultra-bright neon green if empty or dull old default
  const rawColor = clockSettings?.textColor?.trim();
  const timeColor = (!rawColor || rawColor === '#22c55e' || rawColor === '#34d399')
    ? '#00FF66'
    : rawColor;

  const rawDateColor = clockSettings?.dateTextColor?.trim();
  const dateColor = (!rawDateColor || rawDateColor === '#6ee7b7')
    ? '#FFFFFF'
    : rawDateColor;

  const isGlow = clockSettings?.glowEffect !== false;

  return (
    <div
      id="live-navbar-clock-widget"
      style={{
        fontFamily: fontFamilyCss,
        backgroundColor: bgColor,
        borderColor: borderColor,
        boxShadow: `0 0 10px ${borderColor}44, inset 0 0 10px rgba(0,0,0,0.85)`
      }}
      className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-full border-2 ring-1 ring-red-500/50 flex items-center justify-center gap-1.5 shrink-0 select-none cursor-default shadow-md"
      title={language === 'bn' ? 'বাংলাদেশ সময় (লাইভ)' : 'Bangladesh Time (Live)'}
    >
      <div className="flex flex-col text-center sm:text-left leading-none justify-center gap-0.5 min-w-0">
        {/* Line 1: Date & Month in pure crisp white with shadow */}
        <span
          style={{
            color: dateColor,
            textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 4px rgba(255,255,255,0.4)',
          }}
          className={`${getDateFontSizeClass()} font-black tracking-tight whitespace-nowrap text-white text-[9px] sm:text-[10px] leading-tight`}
        >
          {dateStr}
        </span>
        {/* Line 2: Real Bangladesh Current Time with shiny/glowing vibrant text */}
        <div
          style={{
            color: timeColor,
            textShadow: isGlow
              ? `0 0 10px ${timeColor}, 0 0 4px ${timeColor}, 0 1px 2px rgba(0,0,0,0.95)`
              : '0 1px 3px rgba(0,0,0,0.9)',
            ...getTimeFontSizeStyle(),
          }}
          className={`${getTimeFontSizeClass()} ${getFontWeightClass()} tracking-wider whitespace-nowrap text-[11px] sm:text-xs flex items-center font-mono font-black drop-shadow-md`}
        >
          <span style={{ color: timeColor }} className="font-black">{hoursStr}</span>
          <span
            style={{
              color: timeColor,
              textShadow: isGlow ? `0 0 8px ${timeColor}` : undefined
            }}
            className="mx-0.5 animate-pulse font-black opacity-95"
          >
            :
          </span>
          <span style={{ color: timeColor }} className="font-black">{minStr}</span>
          {showSec && (
            <>
              <span
                style={{
                  color: timeColor,
                  textShadow: isGlow ? `0 0 8px ${timeColor}` : undefined
                }}
                className="mx-0.5 animate-pulse font-black opacity-95"
              >
                :
              </span>
              <span
                style={{
                  color: timeColor,
                  textShadow: isGlow ? `0 0 12px ${timeColor}, 0 0 6px ${timeColor}` : undefined
                }}
                className="inline-block w-[1.3em] text-center font-black"
              >
                {secStr}
              </span>
            </>
          )}
          <span
            style={{
              color: timeColor,
              filter: 'brightness(1.15)',
              textShadow: isGlow ? `0 0 8px ${timeColor}99` : undefined
            }}
            className="ml-1 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider"
          >
            {ampmStr}
          </span>
        </div>
      </div>
    </div>
  );
};
