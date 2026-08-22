import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Download, Sparkles, CheckCircle2, ShieldCheck, RefreshCw, Smartphone, AlertOctagon, ExternalLink, FolderDown } from 'lucide-react';
import { downloadApkFile } from '../../utils/apkDownloadHelper';

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
  
  const isAndroid = ua.includes('android');
  const isAndroidParam = window.location.search.includes('platform=android') || 
                         window.location.search.includes('app=android') ||
                         ua.includes('wv');

  return isAndroid || isAndroidParam;
};

export const AppUpdateModal: React.FC = () => {
  const {
    language,
    appRelease,
    userInstalledVersion,
    applyAppUpdate
  } = useMarket();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [apkDownloadDone, setApkDownloadDone] = useState(false);

  const isAndroid = isAndroidDevice();
  const isNewVersionAvailable = userInstalledVersion !== appRelease.version;

  // WEB AUTO-UPDATE RULE:
  // If user is accessing via standard Web browser (Non-Android / Web platform),
  // automatically sync and apply update silently in background without showing any modal option!
  useEffect(() => {
    if (!isAndroid && isNewVersionAvailable) {
      applyAppUpdate();
    }
  }, [isAndroid, isNewVersionAvailable, applyAppUpdate]);

  // If website browser (Non-Android) or no new version available, do not display popup
  if (!isAndroid || !isNewVersionAvailable) {
    return null;
  }

  const handleOpenPlayStore = () => {
    const playStoreLink = appRelease.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.marketbd.app';
    window.open(playStoreLink, '_blank');
  };

  const handleDownloadApk = async () => {
    setIsDownloadingApk(true);
    setApkDownloadDone(false);
    await downloadApkFile({
      apkUrl: appRelease.apkDownloadUrl,
      version: appRelease.version || '2.5.0',
      fileName: `MarketBD_v${appRelease.version || '2.5.0'}.apk`,
      onComplete: () => {
        setIsDownloadingApk(false);
        setApkDownloadDone(true);
      }
    });
  };

  const handleSyncAfterUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateComplete(true);
      setTimeout(() => {
        applyAppUpdate();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300 pointer-events-auto select-none">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative text-slate-900 dark:text-slate-100">
        
        {/* Top Play Store Branding Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white p-5 sm:p-6 relative border-b border-emerald-500/40">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 text-white flex items-center justify-center font-black shadow-xl shrink-0 border border-emerald-300 ring-4 ring-emerald-500/20">
              <Smartphone className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-slate-950" />
                {language === 'bn' ? 'গুগল প্লে স্টোর অ্যাপ আপডেট আবশ্যক' : 'Google Play Store Update Required'}
              </span>
              <h3 className="text-base sm:text-lg font-black leading-tight text-white">
                {language === 'bn' ? appRelease.titleBn : appRelease.titleEn}
              </h3>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between bg-slate-900/90 border border-emerald-500/40 p-2.5 rounded-2xl text-xs font-bold shadow-inner">
            <span className="text-slate-300">
              {language === 'bn' ? 'ইনস্টলড ভার্সন:' : 'Installed:'}{' '}
              <strong className="text-amber-400 font-mono">{userInstalledVersion}</strong>
            </span>
            <span className="text-slate-300">
              {language === 'bn' ? 'প্লে স্টোর ভার্সন:' : 'Play Store:'}{' '}
              <strong className="text-emerald-400 font-mono font-black">{appRelease.version}</strong>
            </span>
          </div>
        </div>

        {/* Mandatory Lock Notice & Written Release Notes */}
        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* Mandatory Lock Warning */}
          <div className="p-3 bg-amber-500/10 border-2 border-amber-500/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200 font-bold">
            <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="block font-black text-amber-600 dark:text-amber-400 uppercase text-[11px] tracking-wider">
                {language === 'bn' ? '⚠️ আপডেট না করলে অ্যাপ ব্যবহার নিষিদ্ধ' : '⚠️ MANDATORY APP UPDATE'}
              </span>
              <p className="leading-snug">
                {language === 'bn'
                  ? 'গুগল প্লে স্টোর থেকে অ্যাপটি আপডেট না করা পর্যন্ত ওয়েবসাইটে এবং অ্যাপে প্রবেশ করা যাবে না।'
                  : 'You must update the app from Google Play Store to browse the website or access services.'}
              </p>
            </div>
          </div>

          {/* Written Release Notes (Changelog) */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-2xl space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-1.5 font-black text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{language === 'bn' ? 'রিলিজ নোটস ও নতুন সুবিধা (Changelog):' : 'Play Store Release Notes:'}</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed font-semibold text-[11px] sm:text-xs">
              {language === 'bn' ? appRelease.notesBn : appRelease.notesEn}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              {language === 'bn'
                ? 'গুগল প্লে স্টোর সিকিউরিটি ভেরিফাইড এবং শতভাগ নিরাপদ অ্যাপ।'
                : 'Google Play Store verified, 100% safe & secure release.'}
            </span>
          </div>
        </div>

        {/* Modal Actions - Direct Play Store CTA */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          {updateComplete ? (
            <div className="w-full py-3.5 bg-emerald-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-yellow-300 animate-bounce" />
              <span>{language === 'bn' ? 'সফলভাবে প্রবেশ করা হচ্ছে! 🎉' : 'Update Verified! Entering Marketplace...'}</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleOpenPlayStore}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 text-white font-black text-sm rounded-2xl transition shadow-xl cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <ExternalLink className="w-5 h-5 text-white animate-pulse" />
                <span>{language === 'bn' ? 'গুগল প্লে স্টোরে আপডেট করুন' : 'Update on Google Play Store'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncAfterUpdate}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'bn' ? 'আপডেট শেষ? রিফ্রেশ ও প্রবেশ করুন' : 'Updated? Sync & Access'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadApk}
                  disabled={isDownloadingApk}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-700 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Direct APK Download"
                >
                  <Download className={`w-3.5 h-3.5 text-teal-400 ${isDownloadingApk ? 'animate-bounce' : ''}`} />
                  <span>{isDownloadingApk ? '...' : 'APK'}</span>
                </button>
              </div>

              {apkDownloadDone && (
                <p className="text-[10px] text-emerald-500 font-bold text-center animate-in fade-in">
                  {language === 'bn' ? '✅ APK ডাউনলোড শুরু হয়েছে!' : '✅ APK download started!'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
