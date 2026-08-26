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
  // Ensure white text color by default (#FFFFFF / text-white)
  const textColor = clockSettings?.textColor || '#FFFFFF';
  const dateTextColor = clockSettings?.dateTextColor || '#FFFFFF';
  const bgColor = clockSettings?.bgColor || '#0f172a';
  const borderColor = clockSettings?.borderColor || '#334155';
  const showPulse = clockSettings?.showPulseIcon !== false;

  return (
    <div
      id="live-navbar-clock-widget"
      style={{
        backgroundColor: bgColor,
        fontFamily: fontFamilyCss,
        borderColor: borderColor,
      }}
      className="w-full h-full min-h-[30px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg border shadow-sm flex items-center justify-between gap-1.5 shrink-0 select-none text-white transition-all overflow-hidden"
    >
      {showPulse && (
        <Clock
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse shrink-0 text-white"
          style={{ color: textColor }}
        />
      )}
      <div className="flex flex-col text-left leading-none justify-center gap-0.5 min-w-0 flex-1">
        {/* Line 1: Date in White Text */}
        <span
          style={{ color: dateTextColor }}
          className={`${getDateFontSizeClass()} font-semibold tracking-tight whitespace-nowrap opacity-95 text-white text-[8px] sm:text-[9px]`}
        >
          {dateStr}
        </span>
        {/* Line 2: Real Bangladesh Time with stationary hours:minutes and running seconds */}
        <div
          style={{
            color: textColor,
            ...getTimeFontSizeStyle(),
          }}
          className={`${getTimeFontSizeClass()} ${getFontWeightClass()} tracking-wider whitespace-nowrap text-white text-[10px] sm:text-xs flex items-center font-mono`}
        >
          <span>{hoursStr}</span>
          <span className="mx-px">:</span>
          <span>{minStr}</span>
          {showSec && (
            <>
              <span className="mx-px">:</span>
              <span className="inline-block w-[1.3em] text-center font-bold">{secStr}</span>
            </>
          )}
          <span className="ml-1 text-[9px] sm:text-[10px] opacity-90">{ampmStr}</span>
        </div>
      </div>
    </div>
  );
};
