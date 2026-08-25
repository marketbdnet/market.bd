import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Wrench,
  Mail,
  RefreshCw,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Copy,
  ArrowRight,
  Clock,
  Zap,
  Globe
} from 'lucide-react';

export const MaintenanceScreen: React.FC = () => {
  const {
    language,
    siteMaintenance,
    toggleSiteMaintenance,
    openAuthModal,
    currentUser,
    userRole,
    setActiveTab,
    customLogoUrl
  } = useMarket();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const contactEmail = siteMaintenance.contactEmail || 'official.marketbd@gmail.com';
  const emergencyPhone = siteMaintenance.emergencyPhone || '01533830784';

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
        if (res?.data?.siteMaintenance) {
          if (!res.data.siteMaintenance.isMaintenance) {
            window.location.reload();
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 800);
      });
  };

  const isAdmin = userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.email === 'official.marketbd@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt="MarketBD.Net"
              className="h-9 w-auto max-w-[160px] object-contain rounded-xl border border-red-500 bg-slate-950 shadow-md"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border-2 border-red-500 text-red-500 flex items-center justify-center font-black text-lg shadow-md">
                <span className="font-black text-red-500">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight flex items-center">
                  <span className="text-red-500">M</span>
                  <span className="text-white">arketBD.</span>
                  <span className="text-red-500">Net</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Bangladesh Marketplace
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Maintenance Mode</span>
          </span>

          <button
            onClick={handleCheckStatus}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Check live website status"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Center Maintenance Card */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8 sm:py-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Badge & Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/20 border-2 border-amber-500/40 flex items-center justify-center shadow-2xl shadow-amber-500/10 mx-auto backdrop-blur-md">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-2xl border-2 border-slate-900 shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Primary Requested Headings */}
        <div className="space-y-4 px-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            MarketBD.Net is Under Maintenance
          </h1>
          
          <div className="space-y-2 max-w-xl mx-auto">
            <p className="text-base sm:text-lg text-slate-300 font-semibold leading-relaxed">
              We’re making some improvements to give you a better shopping experience.
            </p>
            <p className="text-sm sm:text-base text-amber-300/90 font-medium">
              We’ll be back shortly. Thank you for your patience!
            </p>
          </div>
        </div>

        {/* Need Help Box */}
        <div className="max-w-md mx-auto p-5 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Need Help?
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs sm:text-sm font-bold transition break-all"
            >
              <span className="text-base">📧</span>
              <span>{contactEmail}</span>
            </a>

            <button
              onClick={handleCopyEmail}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0"
              title="Copy Email Address"
            >
              {copiedEmail ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {emergencyPhone && (
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Helpline: <strong className="text-slate-300">{emergencyPhone}</strong></span>
            </div>
          )}
        </div>

        {/* Live Admin Bypass / Control Center */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAdmin ? (
            <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left w-full max-w-md shadow-lg">
              <div>
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>অ্যাডমিন কন্ট্রোল মোড (Admin Online)</span>
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  সুইচ অন করে ওয়েবসাইট পুনরায় চালু করতে অ্যাডমিন প্যানেলে যান।
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    toggleSiteMaintenance(false);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>সাইট অন করুন</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  অ্যাডমিন প্যানেল ➔
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('general')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>এডমিন এক্সেস / লগইন (Admin Login)</span>
            </button>
          )}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 border-t border-slate-800/80 text-xs text-slate-500">
        <p>© 2026 MarketBD.Net — Bangladesh Trusted Classified Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};
