import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  Phone,
  Mail,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Copy,
  Info
} from 'lucide-react';

export const MasterLockdownScreen: React.FC = () => {
  const {
    language,
    siteMaintenance,
    toggleMasterLockdown,
    unlockMasterLockdown,
    customLogoUrl
  } = useMarket();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPinHelp, setShowPinHelp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const contactEmail = siteMaintenance.contactEmail || 'official.marketbd@gmail.com';
  const emergencyPhone = siteMaintenance.emergencyPhone || '01533830784';

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg(language === 'bn' ? '⚠️ অনুগ্রহ করে মাস্টার আনলক পিন দিন!' : '⚠️ Please enter master unlock PIN!');
      return;
    }

    const success = unlockMasterLockdown(pin.trim());
    if (success) {
      setErrorMsg('');
      setSuccessMsg(language === 'bn' ? '🎉 মাস্টার লক সফলভাবে আনলক করা হয়েছে! ওয়েবসাইট লাইভ হচ্ছে...' : '🎉 Master Lockdown removed! Website restored...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } else {
      setErrorMsg(
        language === 'bn'
          ? '❌ ভুল মাস্টার পিন! সঠিক সিকিউরিটি পিন (ডিফল্ট: 7860) দিয়ে চেষ্টা করুন।'
          : '❌ Invalid Master PIN! Please use the correct emergency PIN (Default: 7860).'
      );
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleCheckStatus = () => {
    setIsRefreshing(true);
    fetch('/api/sync/state')
      .then(res => res.json())
      .then(res => {
        if (res?.data?.siteMaintenance && !res.data.siteMaintenance.isMasterLockdown) {
          window.location.reload();
        }
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 800);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-3 border-b border-red-900/40">
        <div className="flex items-center gap-2.5">
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt="MarketBD.Net"
              className="h-9 w-auto max-w-[160px] object-contain rounded-xl border border-red-600 bg-black shadow-md"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-black border-2 border-red-600 text-red-500 flex items-center justify-center font-black text-lg shadow-md">
                <span className="font-black text-red-500">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight flex items-center">
                  <span className="text-red-500">M</span>
                  <span className="text-white">arketBD.</span>
                  <span className="text-red-500">Net</span>
                </span>
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">
                  Master Security Lock
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-red-600 text-white border border-red-500 shadow-md animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মাস্টার লক সক্রিয়' : 'MASTER LOCKDOWN'}</span>
          </span>

          <button
            onClick={handleCheckStatus}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-red-900/50 transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Center Lockdown Card */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8 sm:py-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Badge & Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-red-950 via-red-900 to-black border-2 border-red-500 flex items-center justify-center shadow-2xl shadow-red-900/40 mx-auto backdrop-blur-md">
            <Lock className="w-12 h-12 sm:w-14 sm:h-14 text-red-500 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black text-red-500 p-2 rounded-2xl border-2 border-red-500 shadow-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-4 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-950/80 border border-red-700/80 rounded-full text-red-300 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{language === 'bn' ? 'সম্পূর্ণ সার্ভার ও ওয়েবসাইট লকডাউন' : 'COMPLETE SERVER & SITE SHUTDOWN'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {siteMaintenance.masterLockdownTitle || (language === 'bn' ? '🔒 সমগ্র ওয়েবসাইট মাস্টার লকডাউন' : '🔒 Master System Lockdown')}
          </h1>

          <div className="space-y-2 max-w-xl mx-auto">
            <p className="text-base sm:text-lg text-slate-300 font-semibold leading-relaxed">
              {siteMaintenance.masterLockdownMessage || (
                language === 'bn'
                  ? 'সার্ভার ও সিস্টেম আপগ্রেডের কারণে ওয়েবসাইটটি সম্পূর্ণভাবে বন্ধ রাখা হয়েছে। এই মুহূর্তে এডমিন বা সাধারণ ভিজিটর কারও জন্যই সাইট উন্মুক্ত নয়।'
                  : 'The entire website is completely shut down for server maintenance. Access is restricted for all users including administrators.'
              )}
            </p>
          </div>
        </div>

        {/* Emergency Master Unlock Box */}
        <div className="max-w-md mx-auto p-6 bg-slate-950/90 border-2 border-red-700/60 rounded-3xl shadow-2xl backdrop-blur-md space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-red-950 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {language === 'bn' ? '🔐 এমার্জেন্সি মাস্টার আনলক' : '🔐 Emergency Master Unlock'}
              </h3>
            </div>
            <button
              onClick={() => setShowPinHelp(!showPinHelp)}
              className="text-[11px] text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'পিন সাহায্য' : 'PIN Help'}
            </button>
          </div>

          {showPinHelp && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 space-y-1">
              <p>💡 <strong>ডিফল্ট মাস্টার আনলক পিন:</strong> <code className="bg-black px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">7860</code></p>
              <p className="text-[11px] text-slate-400">এডমিন এই পিন দিয়ে যেকোনো সময় তাৎক্ষণিক মাস্টার লক তুলে দিয়ে ওয়েবসাইট লাইভ করতে পারবেন।</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950 border border-red-600 rounded-xl text-xs text-red-200 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'bn' ? 'মাস্টার আনলক পিন / সিকিউরিটি কোড:' : 'Master Unlock PIN / Security Code:'}
              </label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder={language === 'bn' ? 'পিন লিখুন (যেমন: 7860)...' : 'Enter PIN (e.g. 7860)...'}
                className="w-full px-4 py-3 bg-black border border-red-800 focus:border-red-500 rounded-xl text-white font-mono text-sm tracking-widest text-center focus:outline-none transition shadow-inner"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>{language === 'bn' ? 'আনলক করে সাইট লাইভ করুন' : 'Unlock & Restore Website'}</span>
            </button>
          </form>
        </div>

        {/* Official Contact Box */}
        <div className="max-w-md mx-auto p-4 bg-black/60 border border-red-900/30 rounded-2xl space-y-2 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="font-bold text-slate-300">Official Contact:</span>
            <a
              href={`mailto:${contactEmail}`}
              className="text-red-400 hover:text-red-300 font-mono font-bold transition break-all"
            >
              {contactEmail}
            </a>
          </div>
          {emergencyPhone && (
            <div className="text-slate-400">
              Helpline: <strong className="text-white font-mono">{emergencyPhone}</strong>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 border-t border-red-900/30 text-xs text-slate-500">
        <p>© 2026 MarketBD.Net — Master Lockdown Security Guard. All rights reserved.</p>
      </footer>
    </div>
  );
};
