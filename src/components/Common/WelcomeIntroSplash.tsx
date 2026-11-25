import React, { useEffect, useState } from 'react';
import { useMarket } from '../../context/MarketContext';

declare global {
  interface Window {
    __marketbdNativeIntroElapsed?: number;
  }
}

export const WelcomeIntroSplash: React.FC = () => {
  const { language } = useMarket();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [skipToSettled, setSkipToSettled] = useState(false);

  useEffect(() => {
    const mediaQuery =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const prefersReduced = Boolean(mediaQuery?.matches);
    setReducedMotion(prefersReduced);

    const nativeElapsed =
      typeof window !== 'undefined' ? window.__marketbdNativeIntroElapsed || 0 : 0;
    const alreadyPlayedNatively = nativeElapsed >= 1200;
    if (alreadyPlayedNatively) {
      setSkipToSettled(true);
    }

    const totalVisibleMs = prefersReduced
      ? 1100
      : alreadyPlayedNatively
        ? 950
        : 3150;

    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, totalVisibleMs);

    const removeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, totalVisibleMs + 420);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    window.setTimeout(() => setIsVisible(false), 320);
  };

  if (!isVisible) return null;

  const isStatic = reducedMotion || skipToSettled;

  const sharedSvgTextStyle: React.CSSProperties = {
    fontFamily: "'Montserrat', 'Arial Black', system-ui, sans-serif",
    fontWeight: 900,
    fontSize: '86px',
    letterSpacing: '-1.5px'
  };

  return (
    <div
      role="dialog"
      aria-label="Welcome to MarketBD.Net"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden select-none px-4 transition-all duration-400 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle dark stage radial ambience keeping pure black depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(229, 9, 20, 0.12) 0%, rgba(0, 0, 0, 0.96) 55%, #000000 100%)'
        }}
      />

      {/* Central Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
        {/* Small Crisp White "Welcome to" */}
        <p
          className={`text-white font-semibold tracking-[0.22em] text-xs sm:text-sm md:text-base mb-2 sm:mb-3 text-center ${
            isStatic ? 'opacity-100' : 'mbd-welcome-text'
          }`}
          style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
        >
          Welcome to
        </p>

        {/* Main Wordmark + Synchronized Mirror Floor */}
        <div className="relative w-full flex flex-col items-center">
          {/* Sweep Baseline Tracer entering from the left (like the video) */}
          {!isStatic && (
            <div
              aria-hidden="true"
              className="mbd-sweep-line pointer-events-none absolute left-0 right-0 bottom-[2px] h-[2px] mx-auto"
            />
          )}

          {/* Primary Wordmark Row (Both M and arketBD.Net share exact SVG baseline y=86) */}
          <div className="relative inline-flex items-center justify-center">
            <span
              className={`inline-flex shrink-0 ${isStatic ? 'opacity-100' : 'mbd-bouncing-m'}`}
              style={{
                filter: 'drop-shadow(0 4px 22px rgba(229, 9, 20, 0.35))'
              }}
            >
              <svg
                viewBox="0 0 88 110"
                className="overflow-visible"
                style={{ height: 'clamp(2.45rem, 9.2vw, 6.2rem)', width: 'auto' }}
                aria-hidden="true"
              >
                <text x="2" y="86" fill="#E50914" style={sharedSvgTextStyle}>
                  M
                </text>
              </svg>
            </span>

            <span className="inline-flex shrink-0" style={{ marginLeft: '-0.06em' }}>
              <svg
                viewBox="0 0 585 110"
                className="overflow-visible"
                style={{ height: 'clamp(2.45rem, 9.2vw, 6.2rem)', width: 'auto' }}
                aria-label="MarketBD.Net"
              >
                <text
                  x="0"
                  y="86"
                  className={isStatic ? 'mbd-svg-wordmark-static' : 'mbd-svg-wordmark'}
                  style={sharedSvgTextStyle}
                >
                  arketBD.Net
                </text>
              </svg>
            </span>
          </div>

          {/* Glossy Mirror Floor Reflection (Matches Video) */}
          <div
            aria-hidden="true"
            className="relative w-full flex justify-center overflow-hidden pointer-events-none -mt-3 sm:-mt-5"
            style={{
              height: 'clamp(1.65rem, 5.8vw, 4rem)'
            }}
          >
            <div
              className="inline-flex items-center justify-center opacity-38"
              style={{
                transform: 'scaleY(-1)',
                transformOrigin: 'center top'
              }}
            >
              <span className={`inline-flex shrink-0 ${isStatic ? 'opacity-100' : 'mbd-bouncing-m'}`}>
                <svg
                  viewBox="0 0 88 110"
                  className="overflow-visible"
                  style={{ height: 'clamp(2.45rem, 9.2vw, 6.2rem)', width: 'auto' }}
                >
                  <text x="2" y="86" fill="#E50914" style={sharedSvgTextStyle}>
                    M
                  </text>
                </svg>
              </span>
              <span className="inline-flex shrink-0" style={{ marginLeft: '-0.06em' }}>
                <svg
                  viewBox="0 0 585 110"
                  className="overflow-visible"
                  style={{ height: 'clamp(2.45rem, 9.2vw, 6.2rem)', width: 'auto' }}
                >
                  <text
                    x="0"
                    y="86"
                    className={isStatic ? 'mbd-svg-wordmark-static' : 'mbd-svg-wordmark'}
                    style={sharedSvgTextStyle}
                  >
                    arketBD.Net
                  </text>
                </svg>
              </span>
            </div>

            {/* Smooth Black Mirror Floor Gradient Mask */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.8) 58%, #000000 95%)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Subtle Skip / Enter Affordance */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute bottom-8 sm:bottom-10 z-20 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
      >
        {language === 'bn' ? 'প্রবেশ করুন →' : 'Skip intro →'}
      </button>
    </div>
  );
};
