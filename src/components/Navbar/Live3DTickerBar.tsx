import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Megaphone,
  ShieldAlert,
  Sparkles,
  Flame,
  Zap,
  Smartphone
} from 'lucide-react';

export const Live3DTickerBar: React.FC = () => {
  const { systemNotice, language, openInstallAppModal } = useMarket();
  const [isPaused, setIsPaused] = useState(false);

  if (!systemNotice || systemNotice.isEnabled === false) {
    return null;
  }

  // Compile active ticker items (alternating Bangla & English)
  const tickerItems: { id: string; type: 'app' | 'promo' | 'fraud' | 'custom' | 'general'; textBn: string; textEn: string; icon: React.ReactNode; badgeBn: string; badgeEn: string; color: string; onClick?: () => void }[] = [];

  // 0. Android App Download Promo Ticker Item
  tickerItems.push({
    id: 'app-download',
    type: 'app',
    textBn: '📱 মার্কেটবিডি অফিসিয়াল অ্যান্ড্রয়েড অ্যাপ গুগল প্লে স্টোর ও ওয়েব থেকে এখনই ফ্রিতে ইনস্টল করুন! ১-ক্লিকে ইনস্টল করে পান ৫ গুণ দ্রুত কেনাবেচার অভিজ্ঞতা।',
    textEn: '📱 Download MarketBD Official Android App for Free from Google Play Store & Web! 1-Click Install for 5x faster trading.',
    icon: <Smartphone className="w-4 h-4 text-emerald-300 animate-bounce" />,
    badgeBn: '📱 অ্যান্ড্রয়েড অ্যাপ ডাউনলোড',
    badgeEn: '📱 ANDROID APP DOWNLOAD',
    color: 'from-emerald-600 to-teal-600',
    onClick: openInstallAppModal
  });

  // 1. Encouragement to post ads (বিজ্ঞাপন দেওয়ার উৎসাহমূলক বার্তা)
  if (systemNotice.showAdPromo !== false) {
    tickerItems.push({
      id: 'promo',
      type: 'promo',
      textBn: systemNotice.adPromoBn || '🚀 আপনার যেকোনো অব্যবহৃত বা নতুন পণ্য দ্রুত বিক্রি করতে আজই ১০০% ফ্রিতে বিজ্ঞাপন পোস্ট করুন! হাজারো প্রকৃত ক্রেতার কাছে সহজেই পৌঁছান।',
      textEn: systemNotice.adPromoEn || '🚀 Sell your new or used items faster! Post your ad for 100% FREE today and reach thousands of verified buyers instantly!',
      icon: <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />,
      badgeBn: 'বিজ্ঞাপন সেল ধামাকা',
      badgeEn: 'POST & SELL FAST',
      color: 'from-amber-500 to-yellow-500'
    });
  }

  // 2. Fraud Warning & Caution (প্রতারক থেকে দূরে থাকার সতর্কতা)
  if (systemNotice.showFraudWarning !== false) {
    tickerItems.push({
      id: 'fraud',
      type: 'fraud',
      textBn: systemNotice.fraudWarningBn || '🛡️ প্রতারক হতে সতর্ক থাকুন: পণ্য ও আসল কাগজপত্র সরাসরি না দেখে বা পরীক্ষা না করে কাউকে অগ্রিম কুরিয়ার/বিকাশ/নগদে টাকা পাঠাবেন না!',
      textEn: systemNotice.fraudWarningEn || '🛡️ Fraud Alert: Never pay money in advance or send bKash/Nagad without verifying the product & documents in person!',
      icon: <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />,
      badgeBn: 'নিরাপত্তা সতর্কতা',
      badgeEn: 'FRAUD WARNING',
      color: 'from-red-600 to-rose-600'
    });
  }

  // 3. Custom Written Notice / Announcement (কাস্টম বিজ্ঞাপন বা বার্তা)
  if (systemNotice.showCustomNotice !== false && (systemNotice.customNoticeBn || systemNotice.customNoticeEn)) {
    tickerItems.push({
      id: 'custom',
      type: 'custom',
      textBn: systemNotice.customNoticeBn || '🔥 বিশেষ অফার: ভেরিফায়েড বিজনেস শপ একাউন্ট খুললেই পাচ্ছেন ৩টি প্রিমিয়াম ফেভারিট টপ অ্যাড প্রমোশন একদম ফ্রি!',
      textEn: systemNotice.customNoticeEn || '🔥 Special Offer: Register a Verified Business Shop today and enjoy 3 FREE Top Ad Promotions!',
      icon: <Flame className="w-4 h-4 text-cyan-300 animate-bounce" />,
      badgeBn: 'অফিসিয়াল অফার',
      badgeEn: 'OFFICIAL NOTICE',
      color: 'from-cyan-500 to-blue-600'
    });
  }

  // Fallback if none enabled
  if (tickerItems.length === 0 && systemNotice.noticeBn) {
    tickerItems.push({
      id: 'general',
      type: 'general',
      textBn: systemNotice.noticeBn,
      textEn: systemNotice.noticeEn || systemNotice.noticeBn,
      icon: <Megaphone className="w-4 h-4 text-emerald-300" />,
      badgeBn: 'লাইভ নোটিশ',
      badgeEn: 'LIVE NOTICE',
      color: 'from-emerald-500 to-teal-600'
    });
  }

  // Calculate speed duration (slightly slower for easier reading)
  const animDuration = systemNotice.scrollSpeed === 'slow'
    ? '170s'
    : systemNotice.scrollSpeed === 'fast'
      ? '80s'
      : '120s';

  return (
    <div className="w-full relative z-30 select-none overflow-hidden my-1">
      {/* 3D Glowing Neon Container */}
      <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y-2 border-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.4)] py-2 sm:py-2.5 px-3 sm:px-4 flex items-center justify-between gap-3 overflow-hidden rounded-2xl mx-2 sm:mx-4 my-1 group">
        
        {/* Glowing Background Overlay & 3D Gloss Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/20 via-pink-500/10 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-pink-400/70 to-transparent" />

        {/* LIVE Indicator Badge (Left Side Sticky) */}
        <div
          onClick={() => setIsPaused(!isPaused)}
          className="shrink-0 z-20 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-2.5 py-1 rounded-xl shadow-[0_4px_14px_rgba(5,150,105,0.6)] border border-emerald-300/50 text-[11px] sm:text-xs font-black uppercase tracking-wider transform hover:scale-105 transition-transform cursor-pointer"
          title={isPaused ? 'পজ করা আছে - চালু করতে ক্লিক করুন' : 'পজ করতে কারসর রাখুন বা ক্লিক করুন'}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white" />
          </span>
          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
          <span className="hidden sm:inline drop-shadow-md font-black">
            {isPaused ? (language === 'bn' ? '⏸️ পজ করা' : 'PAUSED') : (language === 'bn' ? '🔴 লাইভ' : 'LIVE')}
          </span>
        </div>

        {/* Scrolling Marquee Stream Section */}
        <div
          className="flex-1 overflow-hidden relative z-10 py-0.5 cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className={`flex items-center gap-10 whitespace-nowrap transition-all duration-300 group-hover:[animation-play-state:paused] hover:[animation-play-state:paused] ${
              isPaused ? '[animation-play-state:paused]' : ''
            } animate-marquee`}
            style={{
              display: 'inline-flex',
              minWidth: '200%',
              animationDuration: animDuration,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          >
            {/* Duplicated array for seamless 360 infinite loop */}
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={item.onClick}
                className={`inline-flex items-center gap-2.5 bg-slate-900/95 hover:bg-slate-800/95 border border-slate-700/90 px-3.5 py-1 rounded-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),_0_4px_12px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.01] transform ${
                  item.onClick ? 'cursor-pointer hover:border-emerald-400' : ''
                }`}
              >
                {/* Pill Badge */}
                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg text-white bg-gradient-to-r ${item.color} shadow-md border border-white/30 uppercase tracking-wide flex items-center gap-1 shrink-0`}>
                  {item.icon}
                  <span>{language === 'bn' ? item.badgeBn : item.badgeEn}</span>
                </span>

                {/* Bangla Text */}
                <span className="text-xs sm:text-sm md:text-base font-bold text-amber-300 tracking-wide drop-shadow-md">
                  {item.textBn}
                </span>

                <span className="text-slate-600 font-black text-xs sm:text-sm mx-1">|</span>

                {/* English Text */}
                <span className="text-xs sm:text-sm md:text-base font-medium text-sky-200 tracking-wide drop-shadow-md">
                  {item.textEn}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
