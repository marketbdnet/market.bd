import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMarket } from '../../context/MarketContext';

declare global {
  interface Window {
    __marketbdNativeIntroElapsed?: number;
    __marketbdNativeIntroActive?: boolean;
  }
}

const WORDMARK = 'MarketBD.Net';
const CHARS = WORDMARK.split(''); // Index 0 = 'M', Indices 1..11 = 'a','r','k','e','t','B','D','.','N','e','t'
const TOTAL_DURATION_MS = 7800; // Matches the 8s slow-motion reference video
const HOLD_BEFORE_EXIT_MS = 700;

// Approximate stroke perimeters for fontSize=82 heavy geometric sans (calibrated for zero dead-time)
const CHAR_DASH_LENGTHS: Record<string, number> = {
  M: 430,
  a: 310,
  r: 220,
  k: 310,
  e: 310,
  t: 230,
  B: 420,
  D: 360,
  '.': 75,
  N: 360
};

// Proportional fallback offsets at fontSize=82 before webfont measurement settles
const DEFAULT_CHAR_XS = [0, 74, 125, 160, 211, 261, 297, 358, 421, 444, 511, 561];
const DEFAULT_TOTAL_WIDTH = 598;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const easeInOutCubic = (t: number): number => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const easeOutCubic = (t: number): number => {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

interface GlyphRenderTargets {
  sweepMain: SVGPathElement | null;
  sweepRef: SVGPathElement | null;
  letterMain: (SVGTextElement | null)[];
  letterRef: (SVGTextElement | null)[];
  mGroupMain: SVGGElement | null;
  mGroupRef: SVGGElement | null;
}

export const WelcomeIntroSplash: React.FC = () => {
  const { language } = useMarket();

  const isRunningInNativeAndroid =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('MarketBDAndroidApp');

  const [isVisible, setIsVisible] = useState(!isRunningInNativeAndroid);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [charLayout, setCharLayout] = useState<{ xs: number[]; totalWidth: number }>({
    xs: DEFAULT_CHAR_XS,
    totalWidth: DEFAULT_TOTAL_WIDTH
  });

  const measureTextRef = useRef<SVGTextElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const targetsRef = useRef<GlyphRenderTargets>({
    sweepMain: null,
    sweepRef: null,
    letterMain: [],
    letterRef: [],
    mGroupMain: null,
    mGroupRef: null
  });

  const sharedTextStyle: React.CSSProperties = {
    fontFamily: "'Montserrat', 'Arial Black', system-ui, sans-serif",
    fontWeight: 900,
    fontSize: '82px',
    letterSpacing: '-1.5px'
  };

  // Skip completely inside native Android app so Android's identical native splash handles intro once
  useEffect(() => {
    if (isRunningInNativeAndroid || window.__marketbdNativeIntroActive) {
      setIsVisible(false);
      return;
    }

    const mediaQuery =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    if (mediaQuery?.matches) {
      setReducedMotion(true);
    }
  }, [isRunningInNativeAndroid]);

  // Measure crisp browser glyph X offsets (re-runs when Montserrat font finishes loading)
  useLayoutEffect(() => {
    if (!isVisible) return;

    const measure = () => {
      const textEl = measureTextRef.current;
      if (!textEl || typeof textEl.getStartPositionOfChar !== 'function') return;
      try {
        const count = textEl.getNumberOfChars();
        const xs: number[] = [];
        for (let i = 0; i < count; i++) {
          xs.push(textEl.getStartPositionOfChar(i).x);
        }
        const total = textEl.getComputedTextLength();
        if (xs.length === CHARS.length && total > 100) {
          setCharLayout({ xs, totalWidth: total });
        }
      } catch {
        // Fallback offsets remain active
      }
    };

    measure();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
  }, [isVisible]);

  // 60fps Video-Matched Slow-Motion Timeline (7.8s pure white outline -> progressive fill -> hopping M -> landing)
  useEffect(() => {
    if (!isVisible) return;

    if (reducedMotion) {
      const t1 = window.setTimeout(() => setIsFadingOut(true), 1200);
      const t2 = window.setTimeout(() => setIsVisible(false), 1650);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    const startTime = startTimeRef.current;
    let fadeTimeout: number | undefined;
    let removeTimeout: number | undefined;

    const applyFrame = (p: number) => {
      const targets = targetsRef.current;
      const aX = charLayout.xs[1] ?? 74;
      const wordW = charLayout.totalWidth;

      // 1. Baseline Sweep Line + Curved Entry into 'a' (0.00 -> 0.36)
      const sweepTotal = 380 + aX + 42;
      const headFrac = easeOutCubic(clamp01(p / 0.16));
      const tailFrac = p <= 0.15 ? 0 : easeInOutCubic(clamp01((p - 0.15) / 0.21));
      const visibleLen = Math.max(0, (headFrac - tailFrac) * sweepTotal);
      const sweepOpacity = p > 0.37 ? 0 : tailFrac >= 0.99 ? 0 : 0.96;

      [targets.sweepMain, targets.sweepRef].forEach((pathEl) => {
        if (!pathEl) return;
        const realLen = pathEl.getTotalLength ? pathEl.getTotalLength() : sweepTotal;
        const headPx = headFrac * realLen;
        const tailPx = tailFrac * realLen;
        const segLen = Math.max(0, headPx - tailPx);
        pathEl.style.strokeDasharray = `${segLen} ${realLen + 100}`;
        pathEl.style.strokeDashoffset = `${-tailPx}`;
        pathEl.style.opacity = visibleLen > 0.5 ? String(sweepOpacity) : '0';
      });

      // 2. Per-letter slow-motion white outline tracing (0.09 -> 0.43)
      //    followed by progressive left-to-right solid white fill (0.42 -> 0.78)
      for (let i = 1; i < CHARS.length; i++) {
        const idx = i - 1; // 0..10
        const ch = CHARS[i];
        const dashLen = CHAR_DASH_LENGTHS[ch] ?? 320;

        const outlineStart = 0.09 + idx * 0.021;
        const outlineFrac = easeInOutCubic((p - outlineStart) / 0.11);

        const fillStart = 0.42 + idx * 0.026;
        const fillFrac = easeInOutCubic((p - fillStart) / 0.1);

        const strokeAlpha =
          outlineFrac <= 0 ? 0 : fillFrac >= 1 ? 0 : Math.max(0, 1 - fillFrac * 0.9);
        const strokeWidth = lerp(1.9, 0.5, fillFrac);

        const elMain = targets.letterMain[i];
        const elRef = targets.letterRef[i];
        [elMain, elRef].forEach((el) => {
          if (!el) return;
          el.style.strokeDasharray = String(dashLen);
          el.style.strokeDashoffset = String(dashLen * (1 - outlineFrac));
          el.style.stroke = `rgba(255, 255, 255, ${strokeAlpha.toFixed(3)})`;
          el.style.strokeWidth = `${strokeWidth.toFixed(2)}px`;
          el.style.fill = `rgba(255, 255, 255, ${fillFrac.toFixed(3)})`;
        });
      }

      // 3. Slow-Motion Bouncing "M" Arc Across Tops & Final Left Landing (0.43 -> 0.91)
      let mOpacity = 0;
      let mX = 0;
      let mY = 0;
      let mScaleX = 1;
      let mScaleY = 1;
      let mRot = 0;

      const mStartX = charLayout.xs[0] ?? 0;
      const mSlotCenter = mStartX + 32;
      const hopLeftX = (charLayout.xs[1] ?? 74) + 18 - mSlotCenter; // Above 'a'/'r'
      const hopMidX = wordW * 0.52 - mSlotCenter; // Above 't'/'B'
      const hopRightX = wordW * 0.84 - mSlotCenter; // Above 'N'/'e'

      if (p < 0.43) {
        mOpacity = 0;
      } else if (p < 0.49) {
        // Emerge upright above first solid white letters (00:04 frame)
        const k = easeOutCubic((p - 0.43) / 0.06);
        mOpacity = k;
        mX = hopLeftX;
        mY = lerp(-56, -78, k);
        mScaleX = lerp(0.32, 0.41, k);
        mScaleY = lerp(0.32, 0.41, k);
        mRot = 0;
      } else if (p < 0.62) {
        // Hop arc rightward across middle letters tilting clockwise (00:05 frame)
        const k = (p - 0.49) / 0.13;
        const arcLift = Math.sin(k * Math.PI) * 32;
        mOpacity = 1;
        mX = lerp(hopLeftX, hopMidX, easeInOutCubic(k));
        mY = lerp(-78, -94, k) - arcLift;
        mScaleX = lerp(0.41, 0.38, k);
        mScaleY = lerp(0.41, 0.38, k);
        mRot = lerp(0, 19, easeInOutCubic(k));
      } else if (p < 0.74) {
        // Continue right over '.Net' tilting further clockwise (00:06 frame)
        const k = (p - 0.62) / 0.12;
        const arcLift = Math.sin(k * Math.PI) * 24;
        mOpacity = 1;
        mX = lerp(hopMidX, hopRightX, easeInOutCubic(k));
        mY = lerp(-94, -84, k) - arcLift;
        mScaleX = 0.37;
        mScaleY = 0.37;
        mRot = lerp(19, 27, easeInOutCubic(k));
      } else if (p < 0.87) {
        // Swoop back leftward in a tall arc growing to full 1.0x size (00:07 frame)
        const k = (p - 0.74) / 0.13;
        const eased = easeInOutCubic(k);
        const arcLift = Math.sin(k * Math.PI) * 58;
        mOpacity = 1;
        mX = lerp(hopRightX, 0, eased);
        mY = lerp(-84, 0, eased) - arcLift;
        const sc = lerp(0.37, 1.0, eased);
        mScaleX = sc;
        mScaleY = sc;
        mRot = k < 0.55 ? lerp(27, -16, k / 0.55) : lerp(-16, 0, (k - 0.55) / 0.45);
      } else if (p < 0.92) {
        // Subtle tactile landing squash & settle (00:08 frame)
        const k = (p - 0.87) / 0.05;
        mOpacity = 1;
        mX = 0;
        mY = 0;
        mRot = 0;
        if (k < 0.45) {
          const s = k / 0.45;
          mScaleX = lerp(1.0, 1.04, s);
          mScaleY = lerp(1.0, 0.94, s);
        } else {
          const s = (k - 0.45) / 0.55;
          mScaleX = lerp(1.04, 1.0, s);
          mScaleY = lerp(0.94, 1.0, s);
        }
      } else {
        mOpacity = 1;
      }

      const transformStr = `translate(${mX.toFixed(2)} ${mY.toFixed(2)}) translate(${mSlotCenter.toFixed(1)} 94) rotate(${mRot.toFixed(2)}) scale(${mScaleX.toFixed(3)} ${mScaleY.toFixed(3)}) translate(${-mSlotCenter.toFixed(1)} -94)`;

      [targets.mGroupMain, targets.mGroupRef].forEach((grp) => {
        if (!grp) return;
        grp.style.opacity = mOpacity.toFixed(3);
        grp.setAttribute('transform', transformStr);
      });
    };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = clamp01(elapsed / TOTAL_DURATION_MS);
      applyFrame(p);

      if (p < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        fadeTimeout = window.setTimeout(() => setIsFadingOut(true), HOLD_BEFORE_EXIT_MS);
        removeTimeout = window.setTimeout(() => setIsVisible(false), HOLD_BEFORE_EXIT_MS + 450);
      }
    };

    const initialP = clamp01((performance.now() - startTime) / TOTAL_DURATION_MS);
    applyFrame(initialP);
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (fadeTimeout) window.clearTimeout(fadeTimeout);
      if (removeTimeout) window.clearTimeout(removeTimeout);
    };
  }, [isVisible, reducedMotion, charLayout]);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    window.setTimeout(() => setIsVisible(false), 320);
  };

  if (!isVisible) return null;

  const aStartX = charLayout.xs[1] ?? 74;
  // Horizontal white baseline sweep entering from visible left stage edge and curving cleanly up into letter 'a'
  const sweepPathD = `M -380 94 L ${(aStartX - 24).toFixed(1)} 94 Q ${aStartX.toFixed(1)} 94 ${aStartX.toFixed(1)} 52`;
  const svgWidth = charLayout.totalWidth + 24;

  const renderWordmarkSet = (isReflection: boolean) => (
    <>
      {/* Left-to-Right White Baseline Sweep + Curved Hook */}
      <path
        ref={(el) => {
          if (isReflection) targetsRef.current.sweepRef = el;
          else targetsRef.current.sweepMain = el;
        }}
        d={sweepPathD}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        style={reducedMotion ? { opacity: 0 } : undefined}
      />

      {/* Bouncing & Landing "M" */}
      <g
        ref={(el) => {
          if (isReflection) targetsRef.current.mGroupRef = el;
          else targetsRef.current.mGroupMain = el;
        }}
        style={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      >
        <text x={charLayout.xs[0] ?? 0} y={94} fill="#FFFFFF" style={sharedTextStyle}>
          M
        </text>
      </g>

      {/* Progressive White Outline -> Progressive Solid White Fill ("arketBD.Net") */}
      {CHARS.slice(1).map((ch, sliceIdx) => {
        const charIdx = sliceIdx + 1;
        return (
          <text
            key={`${isReflection ? 'ref' : 'main'}-${charIdx}`}
            ref={(el) => {
              if (isReflection) targetsRef.current.letterRef[charIdx] = el;
              else targetsRef.current.letterMain[charIdx] = el;
            }}
            x={charLayout.xs[charIdx] ?? 0}
            y={94}
            style={{
              ...sharedTextStyle,
              fill: reducedMotion ? '#FFFFFF' : 'rgba(255, 255, 255, 0)',
              stroke: reducedMotion ? 'none' : 'rgba(255, 255, 255, 0)',
              strokeLinejoin: 'round',
              strokeLinecap: 'round'
            }}
          >
            {ch}
          </text>
        );
      })}
    </>
  );

  return (
    <div
      role="dialog"
      aria-label="Welcome to MarketBD.Net"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden select-none px-4 transition-all duration-400 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.01] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Hidden off-screen SVG glyph width measurer */}
      <svg
        aria-hidden="true"
        width="900"
        height="150"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden'
        }}
      >
        <text ref={measureTextRef} x="0" y="94" style={sharedTextStyle}>
          {WORDMARK}
        </text>
      </svg>

      {/* Central Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl">
        {/* Small Crisp White "Welcome to" */}
        <p
          className={`text-white font-semibold tracking-[0.22em] text-xs sm:text-sm md:text-base mb-1 sm:mb-2 text-center ${
            reducedMotion ? 'opacity-100' : 'mbd-welcome-text'
          }`}
          style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
        >
          Welcome to
        </p>

        {/* Video-Matched Pure White Wordmark + Synchronized Mirror Floor Reflection */}
        <div className="relative w-full flex justify-center">
          <svg
            viewBox={`-12 0 ${svgWidth.toFixed(1)} 168`}
            className="overflow-visible w-full max-w-[350px] sm:max-w-[540px] md:max-w-[680px] h-auto"
            aria-label="MarketBD.Net"
          >
            <defs>
              <linearGradient
                id="mbd-mirror-grad"
                x1="0"
                y1="95"
                x2="0"
                y2="152"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
                <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <mask id="mbd-mirror-mask" maskUnits="userSpaceOnUse">
                <rect
                  x="-1400"
                  y="94"
                  width="3600"
                  height="80"
                  fill="url(#mbd-mirror-grad)"
                />
              </mask>
            </defs>

            {/* Primary Upright Animated Wordmark */}
            <g>{renderWordmarkSet(false)}</g>

            {/* Synchronized Floor Mirror Reflection (Directly touching baseline) */}
            <g mask="url(#mbd-mirror-mask)" opacity="0.52">
              <g transform="translate(0, 190) scale(1, -1)">{renderWordmarkSet(true)}</g>
            </g>
          </svg>
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
