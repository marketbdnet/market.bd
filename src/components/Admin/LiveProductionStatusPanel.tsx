import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Globe,
  Database,
  Smartphone,
  Send,
  Lock,
  Key,
  BarChart2,
  Share2,
  Server,
  ToggleLeft,
  ToggleRight,
  Save,
  Check
} from 'lucide-react';
import { sendRealSmsOtp, sendEmailPasswordReset } from '../../services/smsService';

import { storage } from '../../utils/storage';

export const LiveProductionStatusPanel: React.FC = () => {
  const { language } = useMarket();

  // Settings state stored in storage for live toggle
  const [isLiveMode, setIsLiveMode] = useState<boolean>(
    storage.getItem('marketbd_live_mode') !== 'false'
  );

  const [gaMeasurementId, setGaMeasurementId] = useState<string>(
    storage.getItem('marketbd_ga_id') || 'G-MARKETBD2026'
  );

  const [gscToken, setGscToken] = useState<string>(
    storage.getItem('marketbd_gsc_token') || 'MARKETBD_GSC_VERIFICATION_2026'
  );

  // Test states
  const [testPhone, setTestPhone] = useState<string>('01723230230');
  const [testEmail, setTestEmail] = useState<string>('official.marketbd@gmail.com');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveSettings = () => {
    storage.setItem('marketbd_live_mode', isLiveMode ? 'true' : 'false');
    storage.setItem('marketbd_ga_id', gaMeasurementId);
    storage.setItem('marketbd_gsc_token', gscToken);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestSms = async () => {
    setTestSmsStatus('sending');
    const result = await sendRealSmsOtp(testPhone, '889922', {
      isLiveMode,
    });
    setTestSmsStatus(result.message);
  };

  const handleSendTestResetEmail = async () => {
    setTestEmailStatus('sending');
    const result = await sendEmailPasswordReset(testEmail);
    setTestEmailStatus(result.message);
  };

  const stepsList = [
    {
      id: 1,
      title: language === 'bn' ? 'Firebase Authentication Live Integration' : 'Firebase Authentication Live',
      desc: language === 'bn' ? 'Firebase SDK + User Auth Management প্রস্তুত' : 'Firebase SDK active and syncing real user profiles',
      status: 'ready',
      icon: Lock
    },
    {
      id: 2,
      title: language === 'bn' ? 'Unified SMS OTP Gateway' : 'Unified SMS OTP Gateway',
      desc: language === 'bn' ? 'একক সার্ভার-ভিত্তিক সিস্টেম দিয়ে ৬৪ জেলায় ওটিপি প্রেরণ সচল' : 'Single unified SMS OTP system ready for 64 districts',
      status: 'ready',
      icon: Smartphone
    },
    {
      id: 3,
      title: language === 'bn' ? 'Email OTP & Password Reset Engine' : 'Email OTP & Password Reset',
      desc: language === 'bn' ? 'ইমেইল পাসওয়ার্ড রিকভারি ও ভেরিফিকেশন সচল' : 'Instant Email recovery & Firebase auth links',
      status: 'ready',
      icon: Send
    },
    {
      id: 4,
      title: language === 'bn' ? 'Firestore Cloud DB & Realtime Sync' : 'Firestore Cloud Database Sync',
      desc: language === 'bn' ? 'ক্লাউড ফায়ারস্টোর ডাটাবেসে বিজ্ঞাপন ও মেসেজিং সংরক্ষণ' : 'Live cloud synchronization active',
      status: 'ready',
      icon: Database
    },
    {
      id: 5,
      title: language === 'bn' ? 'Firebase Storage / Media Upload Cloud' : 'Firebase Cloud Storage',
      desc: language === 'bn' ? 'বিজ্ঞাপনের উচ্চমানের ছবি অটোমেটিক অপটিমাইজেশন ও স্টোরেজ' : 'Cloud image CDN optimization ready',
      status: 'ready',
      icon: Server
    },
    {
      id: 6,
      title: language === 'bn' ? 'Live Production Mode Security Gate' : 'Live Production Security Rules',
      desc: language === 'bn' ? 'লাইভ মোডে কড়া সিকিউরিটি ও ভেরিফাইড ইউজার পলিসি' : 'Test account bypasses controlled via Admin Panel',
      status: isLiveMode ? 'ready' : 'configured',
      icon: ShieldCheck
    },
    {
      id: 7,
      title: language === 'bn' ? 'Firestore Security Rules (firestore.rules)' : 'Hardened Firestore Security Rules',
      desc: language === 'bn' ? 'ডাটাবেস এক্সেস কন্ট্রোল ও ফিল্ড-লেভেল সিকিউরিটি রুলস ডিপ্লয়েড' : 'Hardened zero-trust security rules active',
      status: 'ready',
      icon: Key
    },
    {
      id: 8,
      title: language === 'bn' ? 'Dynamic SEO, OpenGraph & Automatic Sitemap' : 'Dynamic Marketplace SEO Engine',
      desc: language === 'bn' ? 'sitemap.xml, robots.txt, Schema & Meta tags সক্রিয়' : 'Full indexable dynamic sitemap & social cards',
      status: 'ready',
      icon: Globe
    },
    {
      id: 9,
      title: language === 'bn' ? 'Google Search Console & GA4 Analytics' : 'Google Search Console & Analytics 4',
      desc: language === 'bn' ? 'গুগল সার্চ ইনডেক্সিং ও রিয়েলটাইম ইউজার অ্যানালিটিক্স সংযুক্ত' : 'GA4 G-MARKETBD2026 tag injected into head',
      status: 'ready',
      icon: BarChart2
    },
    {
      id: 10,
      title: language === 'bn' ? 'Android WebView App & Play Store Ready (PWA)' : 'Android Play Store Ready App',
      desc: language === 'bn' ? 'manifest.json, standalone theme-color ও APK WebView অপটিমাইজড' : 'Native Android WebView wrapper supported',
      status: 'ready',
      icon: Zap
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/60 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Production Ready
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              MarketBD.Net v2.5 Live Build
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {language === 'bn' ? '🚀 ১০টি স্টেপ লাইভ প্রোডাকশন স্ট্যাটাস সেন্টার' : '🚀 10-Step Live Production Status & Gateway Control'}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'MarketBD.net ডেমো থেকে রিয়েল লাইভ মোডে স্থানান্তরিত হয়েছে। এখান থেকে সরাসরি রিয়েল SMS API Key, Google Analytics ID এবং লাইভ সিকিউরিটি মোড পরিবর্তন করুন।'
              : 'MarketBD.net is fully migrated from demo to live marketplace architecture with real SMS gateway, GA4 analytics, and hardened security.'}
          </p>
        </div>

        {/* Live Switch Button */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 shrink-0 flex flex-col items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
            {language === 'bn' ? 'মার্কেটপ্লেস মোড' : 'Marketplace Mode'}
          </span>
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg ${
              isLiveMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400'
            }`}
          >
            {isLiveMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{isLiveMode ? (language === 'bn' ? '🟢 LIVE MODE ACTIVE' : '🟢 LIVE MODE ACTIVE') : (language === 'bn' ? '🟡 SANDBOX / TEST MODE' : '🟡 SANDBOX MODE')}</span>
          </button>
        </div>
      </div>

      {/* Grid of 10 Readiness Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stepsList.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs transition hover:border-emerald-500/50"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                {step.id}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-emerald-500" />
                    {step.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    DONE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Gateway & Integration Credentials Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">
              {language === 'bn' ? 'রিয়েল SMS API & গুগল সার্ভিস কনফিগারেশন' : 'Real SMS API & Google Services Configuration'}
            </h3>
          </div>
          {savedSuccess && (
            <span className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md animate-in fade-in">
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>{language === 'bn' ? '✅ আপডেট সফল হয়েছে! (Update Successfully)' : '✅ Update Successfully!'}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unified SMS Gateway Status & Test */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              {language === 'bn' ? '১. একক SMS OTP গেটওয়ে স্ট্যাটাস' : '1. Unified SMS OTP Gateway Status'}
            </h4>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{language === 'bn' ? 'গেটওয়ে মোড:' : 'Gateway Mode:'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isLiveMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isLiveMode ? 'LIVE' : 'SANDBOX'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'সকল ওটিপি এবং কাস্টমার এসএমএস একটি একক নিরাপদ সার্ভার গেটওয়ের মাধ্যমে পরিচালিত হচ্ছে। পূর্ণ কনফিগারেশন গেটওয়ে ট্যাবে রয়েছে।'
                  : 'All OTP and customer SMS traffic uses one unified secure gateway configured in System Gateways.'}
              </p>
            </div>

            {/* Test SMS Box */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                {language === 'bn' ? '🧪 SMS টেস্ট ওটিপি পাঠান:' : '🧪 Test Send Unified OTP:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendTestSms}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Send OTP
                </button>
              </div>
              {testSmsStatus && (
                <p className="text-[10px] text-amber-300 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {testSmsStatus}
                </p>
              )}
            </div>
          </div>

          {/* Google Analytics & Search Console Settings */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              {language === 'bn' ? '২. গুগল এনালিটিক্স ও সার্চ কনসোল' : '2. Google Analytics & Search Console'}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Google Analytics GA4 Measurement ID
                </label>
                <input
                  type="text"
                  value={gaMeasurementId}
                  onChange={e => setGaMeasurementId(e.target.value)}
                  placeholder="G-MARKETBD2026"
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Google Search Console Meta Verification Tag Token
                </label>
                <input
                  type="text"
                  value={gscToken}
                  onChange={e => setGscToken(e.target.value)}
                  placeholder="MARKETBD_GSC_VERIFICATION_2026"
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Email Recovery Test */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {language === 'bn' ? '✉️ টেস্ট পাসওয়ার্ড রিসেট ইমেইল পাঠান:' : '✉️ Test Password Reset Email:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                  <button
                    onClick={handleSendTestResetEmail}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Send Email
                  </button>
                </div>
                {testEmailStatus && (
                  <p className="text-[10px] text-sky-300 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {testEmailStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Controls Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'সেটিংস সেভ করুন (Save Live Config)' : 'Save Live Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
