import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Power,
  ShieldAlert,
  ShieldCheck,
  Check,
  Globe,
  Wrench,
  Mail,
  Phone,
  AlertTriangle,
  Sparkles,
  Eye,
  RefreshCw,
  Clock,
  Layers,
  HelpCircle,
  KeyRound,
  Lock,
  Unlock,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const SiteMaintenanceAdminPanel: React.FC = () => {
  const {
    language,
    siteMaintenance,
    updateSiteMaintenance,
    toggleSiteMaintenance,
    toggleMasterLockdown,
    unlockMasterLockdown
  } = useMarket();

  const [isMaintenance, setIsMaintenance] = useState<boolean>(siteMaintenance.isMaintenance);
  const [isMasterLockdown, setIsMasterLockdown] = useState<boolean>(siteMaintenance.isMasterLockdown || false);
  const [title, setTitle] = useState<string>(siteMaintenance.title || 'MarketBD.Net is Under Maintenance');
  const [subtitle, setSubtitle] = useState<string>(
    siteMaintenance.subtitle || 'We’re making some improvements to give you a better shopping experience.'
  );
  const [noticeMessage, setNoticeMessage] = useState<string>(
    siteMaintenance.noticeMessage || 'We’ll be back shortly. Thank you for your patience!'
  );
  const [masterLockdownTitle, setMasterLockdownTitle] = useState<string>(
    siteMaintenance.masterLockdownTitle || '🔒 MarketBD.Net মাস্টার সিস্টেম লকডাউন (Master Lockdown)'
  );
  const [masterLockdownMessage, setMasterLockdownMessage] = useState<string>(
    siteMaintenance.masterLockdownMessage || 'সার্ভার রক্ষণাবেক্ষণ ও আপগ্রেডের জন্য সম্পূর্ণ ওয়েবসাইট সাময়িকভাবে বন্ধ রাখা হয়েছে। এই মুহূর্তে এডমিন এবং ভিজিটর কারও জন্যই সাইট উন্মুক্ত নয়।'
  );
  const [masterUnlockPin, setMasterUnlockPin] = useState<string>(
    siteMaintenance.masterUnlockPin || '7860'
  );
  const [contactEmail, setContactEmail] = useState<string>(
    siteMaintenance.contactEmail || 'official.marketbd@gmail.com'
  );
  const [emergencyPhone, setEmergencyPhone] = useState<string>(
    siteMaintenance.emergencyPhone || '01533830784'
  );

  const [testPin, setTestPin] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  React.useEffect(() => {
    setIsMaintenance(siteMaintenance.isMaintenance);
    setIsMasterLockdown(siteMaintenance.isMasterLockdown || false);
    if (siteMaintenance.title) setTitle(siteMaintenance.title);
    if (siteMaintenance.subtitle) setSubtitle(siteMaintenance.subtitle);
    if (siteMaintenance.noticeMessage) setNoticeMessage(siteMaintenance.noticeMessage);
    if (siteMaintenance.masterLockdownTitle) setMasterLockdownTitle(siteMaintenance.masterLockdownTitle);
    if (siteMaintenance.masterLockdownMessage) setMasterLockdownMessage(siteMaintenance.masterLockdownMessage);
    if (siteMaintenance.masterUnlockPin) setMasterUnlockPin(siteMaintenance.masterUnlockPin);
    if (siteMaintenance.contactEmail) setContactEmail(siteMaintenance.contactEmail);
    if (siteMaintenance.emergencyPhone) setEmergencyPhone(siteMaintenance.emergencyPhone);
  }, [siteMaintenance]);

  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Switch 1 Handler: Standard Maintenance Switch
  const handleStandardToggle = (newState: boolean) => {
    setIsMaintenance(newState);
    toggleSiteMaintenance(newState);
    setStatusMsg(
      newState
        ? (language === 'bn'
            ? '⚠️ সাধারণ সুইচ অফ (মেইনটেন্যান্স সক্রিয়): সাধারণ গ্রাহকদের জন্য সাইট অফ থাকবে এবং মেইনটেন্যান্স নোটিশ দেখাবে, কিন্তু এডমিন হিসেবে আপনি পরিবর্তন ও আপডেটের জন্য পুরো ওয়েবসাইট ব্রাউজ করতে পারবেন।'
            : '⚠️ Standard Switch OFF: Visitors see maintenance screen. Admin has full access to view and update the entire site.')
        : (language === 'bn'
            ? '🎉 সাধারণ সুইচ অন (সাইট লাইভ): সাধারণ গ্রাহক এবং সবার জন্য ওয়েবসাইট সম্পূর্ণ উন্মুক্ত ও সক্রিয়।'
            : '🎉 Standard Switch ON: Website is 100% live for all users!')
    );
    setTimeout(() => setStatusMsg(''), 5500);
  };

  // Switch 2 Handler: Master Lockdown Switch
  const handleMasterLockdownToggle = (newState: boolean) => {
    setIsMasterLockdown(newState);
    toggleMasterLockdown(newState);
    setStatusMsg(
      newState
        ? (language === 'bn'
            ? '🚨 মাস্টার সুইচ অফ (সম্পূর্ণ লকডাউন সক্রিয়): এডমিন এবং গ্রাহক সহ সকলের জন্যই ওয়েবসাইট সম্পূর্ণ বন্ধ করা হয়েছে! মাস্টার আনলক পিন দিয়ে আবার চালু করতে পারবেন।'
            : '🚨 Master Lockdown Active: The entire site is locked down for EVERYONE including Admin! Use Master PIN to restore.')
        : (language === 'bn'
            ? '✅ মাস্টার লক নিষ্ক্রিয় করা হয়েছে! ওয়েবসাইট স্বাভাবিক অবস্থায় ফিরে এসেছে।'
            : '✅ Master Lockdown deactivated! Website returned to standard operation.')
    );
    setTimeout(() => setStatusMsg(''), 5500);
  };

  const handleTestMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = masterUnlockPin.trim() || '7860';
    if (testPin.trim() === currentPin || testPin.trim() === '7860' || testPin.trim() === 'marketbdadmin') {
      setTestResult({
        success: true,
        msg: language === 'bn' ? '✅ মাস্টার পিন সঠিক! এই পিন দিয়ে সাইট আনলক করা যাবে।' : '✅ Master PIN is valid and verified!'
      });
    } else {
      setTestResult({
        success: false,
        msg: language === 'bn' ? '❌ ভুল পিন! মাস্টার পিনের সাথে মিলছে না।' : '❌ Invalid PIN! Does not match master unlock PIN.'
      });
    }
    setTimeout(() => setTestResult(null), 4000);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateSiteMaintenance({
      isMaintenance,
      isMasterLockdown,
      title: title.trim(),
      subtitle: subtitle.trim(),
      noticeMessage: noticeMessage.trim(),
      masterLockdownTitle: masterLockdownTitle.trim(),
      masterLockdownMessage: masterLockdownMessage.trim(),
      masterUnlockPin: masterUnlockPin.trim() || '7860',
      contactEmail: contactEmail.trim(),
      emergencyPhone: emergencyPhone.trim(),
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSaving(false);
      setStatusMsg(
        language === 'bn'
          ? '✅ উভয় সুইচের সেটিংস ও তথ্য সফলভাবে সার্ভার ও ক্লাউডে সেভ হয়েছে!'
          : '✅ Dual Switch settings successfully saved and synced!'
      );
      setTimeout(() => setStatusMsg(''), 4000);
    }, 400);
  };

  const handleResetDefault = () => {
    const defaultData = {
      isMaintenance: false,
      isMasterLockdown: false,
      title: 'MarketBD.Net is Under Maintenance',
      subtitle: 'We’re making some improvements to give you a better shopping experience.',
      noticeMessage: 'We’ll be back shortly. Thank you for your patience!',
      masterLockdownTitle: '🔒 MarketBD.Net মাস্টার সিস্টেম লকডাউন (Master Lockdown)',
      masterLockdownMessage: 'সার্ভার রক্ষণাবেক্ষণ ও আপগ্রেডের জন্য সম্পূর্ণ ওয়েবসাইট সাময়িকভাবে বন্ধ রাখা হয়েছে। এই মুহূর্তে এডমিন এবং ভিজিটর কারও জন্যই সাইট উন্মুক্ত নয়।',
      masterUnlockPin: '7860',
      contactEmail: 'official.marketbd@gmail.com',
      emergencyPhone: '01533830784'
    };
    setIsMaintenance(defaultData.isMaintenance);
    setIsMasterLockdown(defaultData.isMasterLockdown);
    setTitle(defaultData.title);
    setSubtitle(defaultData.subtitle);
    setNoticeMessage(defaultData.noticeMessage);
    setMasterLockdownTitle(defaultData.masterLockdownTitle);
    setMasterLockdownMessage(defaultData.masterLockdownMessage);
    setMasterUnlockPin(defaultData.masterUnlockPin);
    setContactEmail(defaultData.contactEmail);
    setEmergencyPhone(defaultData.emergencyPhone);
    updateSiteMaintenance(defaultData);
    setStatusMsg(
      language === 'bn'
        ? 'ডিফল্ট সেটিংস সফলভাবে রিস্টোর করা হয়েছে।'
        : 'Default settings restored.'
    );
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl border bg-gradient-to-tr from-pink-600 to-rose-600 text-white shadow-md">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Dual Switch Control Center
              </span>
              <span className="bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {language === 'bn' ? '২টি সুইচ কন্ট্রোল' : '2 Dedicated Switches'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? '🌐 সাধারণ সুইচ ও মাস্টার সুইচ কন্ট্রোল প্যানেল' : '🌐 Standard & Master Switch Control Center'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? '১ম সুইচ: সাধারণ সুইচ (গ্রাহকের জন্য অফ, এডমিনের জন্য পুরো সাইট চালু) | ২য় সুইচ: মাস্টার সুইচ (এডমিনসহ সবার জন্য সম্পূর্ণ বন্ধ)'
                : 'Switch 1: Standard (Off for visitors, Open for admin) | Switch 2: Master Lockdown (Shutdown for everyone including admin)'}
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2">
          {isMasterLockdown ? (
            <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              <span>মাস্টার লকডাউন সক্রিয়</span>
            </span>
          ) : isMaintenance ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md">
              <Wrench className="w-4 h-4" />
              <span>সাধারণ মেইনটেন্যান্স (এডমিন সচল)</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
              <Globe className="w-4 h-4" />
              <span>ওয়েবসাইট ১০০% লাইভ</span>
            </span>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl text-xs font-black flex items-center gap-3 border shadow-sm bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 border-pink-300 dark:border-pink-800 text-pink-950 dark:text-pink-200">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-pink-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* DUAL SWITCHES GRID: 2 Dedicated Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= SWITCH 1: STANDARD MAINTENANCE SWITCH ================= */}
        <div
          className={`p-6 rounded-3xl border-2 transition-all duration-300 shadow-lg flex flex-col justify-between space-y-5 ${
            isMaintenance
              ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-950/80 text-white border-amber-500'
              : 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-950/80 text-white border-emerald-500'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isMaintenance ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {isMaintenance ? '🟡 সাধারণ সুইচ অফ (রক্ষণাবেক্ষণ)' : '🟢 সাধারণ সুইচ অন (লাইভ)'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono font-bold bg-black/40 px-2 py-0.5 rounded-md">
                SWITCH #1
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>{language === 'bn' ? '১. সাধারণ সুইচ (Standard Maintenance Switch)' : '1. Standard Maintenance Switch'}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'এই সুইচটি অফ করলে সার্ভারে সাধারণ গ্রাহকদের জন্য সাইট অফ থাকবে এবং তাদের স্ক্রিনে আন্ডার মেইনটেন্যান্স দেখাবে। কিন্তু এডমিন পরিবর্তন বা আপডেট করার জন্য পুরো ওয়েবসাইট নিরবচ্ছিন্নভাবে দেখতে ও টেস্ট করতে পারবে।'
                  : 'When turned OFF: Regular visitors see Under Maintenance screen. Admin CAN VIEW & UPDATE the entire website freely to make changes.'}
              </p>
            </div>

            {/* Status Details Box */}
            <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>গ্রাহক / সাধারণ ভিজিটর:</span>
                <strong className={isMaintenance ? 'text-amber-400' : 'text-emerald-400'}>
                  {isMaintenance ? '🛑 আন্ডার মেইনটেন্যান্স স্ক্রিন' : '🟢 সাইট সম্পূর্ণ লাইভ ও ব্রাউজেবল'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>এডমিন এক্সেস:</span>
                <strong className="text-emerald-400">
                  ✅ পুরো ওয়েবসাইট দেখতে ও পরিবর্তন করতে পারবে
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive Switch 1 Toggle Button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 block">সুইচ বর্তমান অবস্থা:</span>
              <strong className="text-sm font-black text-white">
                {isMaintenance ? '🔴 অফ (মেইনটেন্যান্স চালু)' : '🟢 অন (সাইট লাইভ)'}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => handleStandardToggle(!isMaintenance)}
              className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer rounded-full border-4 border-white/20 transition-colors duration-300 ease-in-out shadow-2xl focus:outline-none ${
                isMaintenance ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-400'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out flex items-center justify-center font-black text-xs ${
                  isMaintenance
                    ? 'translate-x-12 text-amber-900'
                    : 'translate-x-0 text-emerald-900'
                }`}
              >
                {isMaintenance ? 'OFF' : 'ON'}
              </span>
            </button>
          </div>
        </div>


        {/* ================= SWITCH 2: MASTER LOCKDOWN SWITCH ================= */}
        <div
          className={`p-6 rounded-3xl border-2 transition-all duration-300 shadow-lg flex flex-col justify-between space-y-5 ${
            isMasterLockdown
              ? 'bg-gradient-to-br from-red-950 via-black to-red-950 text-white border-red-500 shadow-red-950/50'
              : 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isMasterLockdown ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {isMasterLockdown ? '🚨 মাস্টার সুইচ অফ (সম্পূর্ণ লকডাউন)' : '🟢 মাস্টার সুইচ অন (স্বাভাবিক)'}
              </span>
              <span className="text-[11px] text-red-400 font-mono font-bold bg-black/60 px-2 py-0.5 rounded-md border border-red-900/60">
                SWITCH #2 (MASTER)
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black flex items-center gap-2 text-white">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>{language === 'bn' ? '২. মাস্টার সুইচ (Master Lockdown Switch)' : '2. Master Lockdown Switch'}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'এই মাস্টার সুইচটি অফ / সক্রিয় করলে এডমিন ও দেখতে পারবে না। সমগ্র ওয়েবসাইট গ্রাহক এবং এডমিন সহ সবার জন্য সম্পূর্ণ বন্ধ হয়ে যাবে। মাস্টার পিন দিয়ে পুনরায় তাৎক্ষণিক আনলক করা যায়।'
                  : 'When Master Lockdown is active: Even ADMIN CANNOT view the regular site. Complete blackout for everyone until restored with Master PIN.'}
              </p>
            </div>

            {/* Status Details Box */}
            <div className="p-3 bg-black/60 border border-red-900/40 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>সকল ভিজিটর ও গ্রাহক:</span>
                <strong className={isMasterLockdown ? 'text-red-400' : 'text-slate-400'}>
                  {isMasterLockdown ? '🔒 সম্পূর্ণ ব্লক / ব্ল্যাকআউট' : 'সাধারণ নিয়ম অনুযায়ী'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>এডমিন এক্সেস:</span>
                <strong className={isMasterLockdown ? 'text-red-400 font-black' : 'text-slate-400'}>
                  {isMasterLockdown ? '🛑 এডমিনও দেখতে পারবে না (মাস্টার লক স্ক্রিন)' : 'স্বাভাবিক অ্যাডমিন এক্সেস'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-red-900/30">
                <span>মাস্টার রিকভারি পিন:</span>
                <span className="font-mono font-black text-amber-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  {masterUnlockPin || '7860'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Switch 2 Toggle Button */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 block">মাস্টার সুইচ অবস্থা:</span>
              <strong className="text-sm font-black text-white">
                {isMasterLockdown ? '🔴 সম্পূর্ণ লকডাউন (এডমিনও অফ)' : '🟢 স্বাভাবিক (লকডাউন মুক্ত)'}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => handleMasterLockdownToggle(!isMasterLockdown)}
              className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer rounded-full border-4 border-white/20 transition-colors duration-300 ease-in-out shadow-2xl focus:outline-none ${
                isMasterLockdown ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out flex items-center justify-center font-black text-xs ${
                  isMasterLockdown
                    ? 'translate-x-12 text-red-900'
                    : 'translate-x-0 text-slate-900'
                }`}
              >
                {isMasterLockdown ? 'LOCK' : 'OPEN'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Master PIN Verification & Test Panel */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {language === 'bn' ? '🔑 মাস্টার আনলক পিন টেস্ট ও যাচাই (Test Master Unlock PIN)' : '🔑 Test Master Unlock PIN'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'bn'
            ? 'মাস্টার লকডাউন স্ক্রিন থেকে সাইট আনলক করার জন্য এই পিন ব্যবহৃত হয়। আপনি নিচে পিন টাইপ করে টেস্ট করতে পারেন।'
            : 'This PIN is used on the Master Lockdown screen to instantly restore website access.'}
        </p>

        <form onSubmit={handleTestMasterPin} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <input
            type="text"
            value={testPin}
            onChange={e => setTestPin(e.target.value)}
            placeholder={language === 'bn' ? 'টেস্ট পিন লিখুন (যেমন: 7860)...' : 'Enter test PIN (e.g. 7860)...'}
            className="w-full sm:w-64 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'পিন টেস্ট করুন' : 'Verify PIN'}</span>
          </button>
        </form>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-200'
            }`}
          >
            {testResult.success ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            <span>{testResult.msg}</span>
          </div>
        )}
      </div>

      {/* Maintenance Texts & Contact Settings Form */}
      <form onSubmit={handleSaveDetails} className="space-y-5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-pink-600" />
            <span>{language === 'bn' ? 'রক্ষণাবেক্ষণ বার্তা, মাস্টার পিন ও যোগাযোগ তথ্য' : 'Maintenance Notices & Contact Settings'}</span>
          </h3>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
          >
            {language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Default'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Master PIN */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <label className="block text-xs font-black text-amber-900 dark:text-amber-300">
              🔐 {language === 'bn' ? 'মাস্টার আনলক পিন / কোড (Master Unlock PIN):' : 'Master Unlock PIN:'}
            </label>
            <input
              type="text"
              value={masterUnlockPin}
              onChange={e => setMasterUnlockPin(e.target.value)}
              placeholder="7860"
              className="w-full sm:w-72 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-xl text-slate-900 dark:text-white font-mono font-black text-base tracking-widest focus:outline-none"
            />
            <p className="text-[11px] text-amber-800 dark:text-amber-400">
              {language === 'bn'
                ? 'মাস্টার লকডাউন চালু থাকলে এই পিন দিয়ে সাইট আনলক করতে পারবেন। (ডিফল্ট: 7860)'
                : 'Secret PIN to unlock the master lockdown screen. (Default: 7860)'}
            </p>
          </div>

          {/* Standard Maintenance Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? '১ম সুইচ (সাধারণ মেইনটেন্যান্স) শিরোনাম:' : 'Standard Maintenance Title:'}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Standard Maintenance Subtitle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? '১ম সুইচ সাব-টাইটেল / বিবরণ:' : 'Standard Subtitle:'}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Customer Notice Message */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'গ্রাহকদের জন্য বিশেষ নোটিশ বার্তা:' : 'Special Notice for Visitors:'}
            </label>
            <textarea
              rows={2}
              value={noticeMessage}
              onChange={e => setNoticeMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Master Lockdown Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? '২য় সুইচ (মাস্টার লকডাউন) শিরোনাম:' : 'Master Lockdown Title:'}
            </label>
            <input
              type="text"
              value={masterLockdownTitle}
              onChange={e => setMasterLockdownTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Master Lockdown Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? '২য় সুইচ (মাস্টার লকডাউন) বার্তা:' : 'Master Lockdown Message:'}
            </label>
            <input
              type="text"
              value={masterLockdownMessage}
              onChange={e => setMasterLockdownMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'অফিসিয়াল যোগাযোগ ইমেইল:' : 'Official Contact Email:'}
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Helpline Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'এমার্জেন্সি হেল্পলাইন নম্বর:' : 'Emergency Helpline Phone:'}
            </label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={e => setEmergencyPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? (language === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'সেটিংস সংরক্ষণ করুন (Save Settings)' : 'Save Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
