import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMarket } from '../../context/MarketContext';

declare global {
  interface Window {
    __marketbdNativeIntroElapsed?: number;
    __marketbdNativeIntroActive?: boolean;
  }
}

const WORDMARK = 'MarketBD';
const CHARS = WORDMARK.split(''); // Index 0 = 'M' (#E50914 Red), Indices 1..7 = 'a','r','k','e','t','B','D' (#FFFFFF White)
const TOTAL_DURATION_MS = 6600;
const HOLD_BEFORE_EXIT_MS = 750;
const BRAND_RED = '#E50914';

// Calibrated SVG stroke perimeters for fontSize=82 heavy geometric sans
const CHAR_DASH_LENGTHS: Record<string, number> = {
  M: 430,
  a: 310,
  r: 220,
  k: 310,
  e: 310,
  t: 230,
  B: 420,
  D: 360
};

// Proportional fallback offsets at fontSize=82 before webfont measurement settles
const DEFAULT_CHAR_XS = [0, 74, 125, 160, 211, 261, 297, 358];
const DEFAULT_TOTAL_WIDTH = 421;

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
  horizonBeamMain: SVGLineElement | null;
  horizonBeamRef: SVGLineElement | null;
  seamGlowMain: SVGLineElement | null;
  arcRedMain: SVGPathElement | null;
  arcWhiteMain: SVGPathElement | null;
  letterMain: (SVGTextElement | null)[];
  letterRef: (SVGTextElement | null)[];
  mGroupMain: SVGGElement | null;
  mGroupRef: SVGGElement | null;
}

/**
 * Compute crisp SVG orbital arc path around center (cx, cy) with radius r.
 */
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad1 = ((startDeg - 90) * Math.PI) / 180;
  const rad2 = ((endDeg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad1);
  const y1 = cy + r * Math.sin(rad1);
  const x2 = cx + r * Math.cos(rad2);
  const y2 = cy + r * Math.sin(rad2);
  const largeArc = Math.abs(endDeg - startDeg) <= 180 ? '0' : '1';
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
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
    horizonBeamMain: null,
    horizonBeamRef: null,
    seamGlowMain: null,
    arcRedMain: null,
    arcWhiteMain: null,
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

  // Skip inside native Android app so Android's identical native splash handles intro once
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
        if (xs.length === CHARS.length && total > 80) {
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

  // Original MarketBD Signature Choreography (6.6s slow-motion):
  //   Act 1 (0.00 -> 0.24): Center-outward horizon beam + Welcome tracking-condense title
  //   Act 2 (0.14 -> 0.46): Twin Red/White orbital emblem arcs + Crimson Red "M" depth lock-in
  //   Act 3 (0.34 -> 0.82): Progressive white vector etching + diagonal light-fill on "arketBD"
  //   Act 4 (0.76 -> 1.00): Bi-color Red+White baseline gleam & synchronized floor reflection settle
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
      const wordW = charLayout.totalWidth;
      const centerX = wordW * 0.5;
      const mStartX = charLayout.xs[0] ?? 0;
      const aStartX = charLayout.xs[1] ?? 74;
      const mSlotCenter = mStartX + (aStartX - mStartX) * 0.48;
      const mAnchorY = 64; // Vertical visual midpoint of uppercase M (baseline 94, cap 34)

      // Act 1: Symmetric Center-Outward Horizon Split Beam (0.00 -> 0.40)
      const expandFrac = easeOutCubic(clamp01(p / 0.22));
      const beamFadeOut = p < 0.22 ? 1 : 1 - easeInOutCubic(clamp01((p - 0.22) / 0.18));
      const beamHalfW = (wordW * 0.56) * expandFrac;

      [targets.horizonBeamMain, targets.horizonBeamRef].forEach((beam) => {
        if (!beam) return;
        beam.setAttribute('x1', (centerX - beamHalfW).toFixed(1));
        beam.setAttribute('x2', (centerX + beamHalfW).toFixed(1));
        beam.style.opacity = (p > 0.42 ? 0 : beamFadeOut * 0.85).toFixed(3);
      });

      // Act 2A: Twin Orbital Emblem Arcs (Red left arc + White right arc rotating around "M")
      const arcDraw = easeInOutCubic(clamp01((p - 0.12) / 0.22));
      const arcFade = p < 0.36 ? 1 : 1 - easeInOutCubic(clamp01((p - 0.36) / 0.14));
      const arcRot = lerp(-55, 25, easeInOutCubic(clamp01((p - 0.12) / 0.36)));
      const arcRadius = 46;
      const arcSpan = Math.max(2, 148 * arcDraw);

      if (targets.arcRedMain) {
        targets.arcRedMain.setAttribute(
          'd',
          describeArc(mSlotCenter, mAnchorY, arcRadius, 196 + arcRot, 196 + arcRot + arcSpan)
        );
        targets.arcRedMain.style.opacity = (p > 0.52 || p < 0.12 ? 0 : arcDraw * arcFade * 0.95).toFixed(3);
      }
      if (targets.arcWhiteMain) {
        targets.arcWhiteMain.setAttribute(
          'd',
          describeArc(mSlotCenter, mAnchorY, arcRadius, 16 + arcRot, 16 + arcRot + arcSpan)
        );
        targets.arcWhiteMain.style.opacity = (p > 0.52 || p < 0.12 ? 0 : arcDraw * arcFade * 0.9).toFixed(3);
      }

      // Act 2B: Majestic Crimson Red "M" Depth Arrival & Lock-In (0.16 -> 0.46)
      let mAlpha = 0;
      let mScale = 1;
      let mTranslateY = 0;
      if (p >= 0.16) {
        const mIn = easeOutCubic(clamp01((p - 0.16) / 0.26));
        mAlpha = clamp01(mIn * 1.35);
        mScale = lerp(1.48, 1.0, mIn);
        mTranslateY = lerp(-12, 0, mIn);
        // Subtle settled micro-elastic breathe as beam completes at 0.42 -> 0.48
        if (p >= 0.42 && p < 0.49) {
          const s = (p - 0.42) / 0.07;
          mScale = 1 + Math.sin(s * Math.PI) * 0.035;
        }
      }

      const mTransform = `translate(0 ${mTranslateY.toFixed(2)}) translate(${mSlotCenter.toFixed(1)} ${mAnchorY}) scale(${mScale.toFixed(4)}) translate(${-mSlotCenter.toFixed(1)} ${-mAnchorY})`;
      [targets.mGroupMain, targets.mGroupRef].forEach((grp) => {
        if (!grp) return;
        grp.style.opacity = mAlpha.toFixed(3);
        grp.setAttribute('transform', mTransform);
      });

      // Act 3: Progressive Vector Etching -> Precision Light-Sweep Fill on "arketBD" (0.34 -> 0.82)
      for (let i = 1; i < CHARS.length; i++) {
        const idx = i - 1; // 0..6 ('a'..'D')
        const ch = CHARS[i];
        const dashLen = CHAR_DASH_LENGTHS[ch] ?? 320;

        const etchStart = 0.34 + idx * 0.028;
        const etchFrac = easeInOutCubic((p - etchStart) / 0.12);

        const fillStart = 0.54 + idx * 0.032;
        const fillFrac = easeInOutCubic((p - fillStart) / 0.13);

        const strokeAlpha =
          etchFrac <= 0 ? 0 : fillFrac >= 1 ? 0 : Math.max(0, 1 - fillFrac * 0.88);
        const strokeWidth = lerp(2.0, 0.45, fillFrac);

        const elMain = targets.letterMain[i];
        const elRef = targets.letterRef[i];
        [elMain, elRef].forEach((el) => {
          if (!el) return;
          el.style.strokeDasharray = String(dashLen);
          el.style.strokeDashoffset = String(dashLen * (1 - etchFrac));
          el.style.stroke = `rgba(255, 255, 255, ${strokeAlpha.toFixed(3)})`;
          el.style.strokeWidth = `${strokeWidth.toFixed(2)}px`;
          el.style.fill = `rgba(255, 255, 255, ${fillFrac.toFixed(3)})`;
        });
      }

      // Act 4: Bi-Color Signature Baseline Seam Gleam (0.76 -> 1.00)
      if (targets.seamGlowMain) {
        const seamProg = easeOutCubic(clamp01((p - 0.74) / 0.22));
        targets.seamGlowMain.setAttribute('x1', '0');
        targets.seamGlowMain.setAttribute('x2', (wordW * seamProg).toFixed(1));
        targets.seamGlowMain.style.opacity = seamProg > 0.01 ? (0.85 * clamp01(seamProg * 1.4)).toFixed(3) : '0';
      }
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

  const svgWidth = charLayout.totalWidth + 24;

  const renderWordmarkSet = (isReflection: boolean) => (
    <>
      {/* Center-Outward Initial Horizon Light Beam */}
      <line
        ref={(el) => {
          if (isReflection) targetsRef.current.horizonBeamRef = el;
          else targetsRef.current.horizonBeamMain = el;
        }}
        x1={(charLayout.totalWidth * 0.5).toFixed(1)}
        y1={94}
        x2={(charLayout.totalWidth * 0.5).toFixed(1)}
        y2={94}
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        style={reducedMotion ? { opacity: 0 } : undefined}
      />

      {/* Twin Red+White Orbital Emblem Crest framing "M" (Upright stage only) */}
      {!isReflection && !reducedMotion && (
        <>
          <path
            ref={(el) => {
              targetsRef.current.arcRedMain = el;
            }}
            fill="none"
            stroke={BRAND_RED}
            strokeWidth="2.8"
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />
          <path
            ref={(el) => {
              targetsRef.current.arcWhiteMain = el;
            }}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />
        </>
      )}

      {/* Anchor Crimson Red "M" */}
      <g
        ref={(el) => {
          if (isReflection) targetsRef.current.mGroupRef = el;
          else targetsRef.current.mGroupMain = el;
        }}
        style={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      >
        <text x={charLayout.xs[0] ?? 0} y={94} fill={BRAND_RED} style={sharedTextStyle}>
          M
        </text>
      </g>

      {/* Precision Etched White Outline -> Solid White Fill ("arketBD") */}
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
      aria-label="Welcome to MarketBD"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden select-none px-4 transition-all duration-400 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.01] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Signature Crimson Ambient Glow at Center Stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 46% 48%, rgba(229, 9, 20, 0.14) 0%, rgba(0, 0, 0, 0.96) 52%, #000000 100%)'
        }}
      />

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
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl">
        {/* Crisp White "Welcome to" with tracking condense */}
        <p
          className={`text-white font-semibold tracking-[0.18em] text-xl sm:text-3xl md:text-4xl mb-4 sm:mb-7 text-center ${
            reducedMotion ? 'opacity-100' : 'mbd-welcome-text'
          }`}
          style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
        >
          Welcome to
        </p>

        {/* MarketBD Signature Wordmark (2x Larger Scale) + Bi-Color Seam + Synchronized Mirror Floor */}
        <div className="relative w-full flex justify-center">
          <svg
            viewBox={`-6 0 ${(svgWidth - 12).toFixed(1)} 168`}
            className="overflow-visible w-[95vw] sm:w-[92vw] max-w-[1080px] h-auto"
            aria-label="MarketBD"
          >
            <defs>
              <linearGradient id="mbd-seam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={BRAND_RED} stopOpacity="0.95" />
                <stop offset="18%" stopColor={BRAND_RED} stopOpacity="0.95" />
                <stop offset="32%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
              </linearGradient>
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

            {/* Signature Bi-Color Red+White Baseline Horizon Gleam */}
            <line
              ref={(el) => {
                targetsRef.current.seamGlowMain = el;
              }}
              x1="0"
              y1={95.5}
              x2={reducedMotion ? charLayout.totalWidth : 0}
              y2={95.5}
              stroke="url(#mbd-seam-grad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={reducedMotion ? { opacity: 0.75 } : { opacity: 0 }}
            />

            {/* Synchronized Floor Mirror Reflection */}
            <g mask="url(#mbd-mirror-mask)" opacity="0.54">
              <g transform="translate(0, 191) scale(1, -1)">{renderWordmarkSet(true)}</g>
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
