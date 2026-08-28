import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Bell,
  Camera,
  Layers,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  Info,
  FolderDown,
  AlertCircle
} from 'lucide-react';
import { downloadApkFile, formatDirectApkUrl } from '../../utils/apkDownloadHelper';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallAppModal: React.FC = () => {
  const {
    language,
    isInstallAppModalOpen,
    closeInstallAppModal,
    appRelease,
    customLogoUrl,
  } = useMarket();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'instructions' | 'qr'>('options');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isInstallAppModalOpen) return null;

  const handlePWAInstall = async () => {
    if (installPrompt) {
      setIsInstalling(true);
      try {
        await installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('Error triggering PWA install:', err);
      } finally {
        setIsInstalling(false);
        setInstallPrompt(null);
      }
    } else {
      // If native prompt is not active, switch to instructions tab
      setActiveTab('instructions');
    }
  };

  const handleDirectApkDownload = async () => {
    setDownloadSuccess(false);
    setDownloadProgress(15);

    const progressTimer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 20;
        if (prev >= 90) return 90;
        return prev + 25;
      });
    }, 150);

    const fileName = `MarketBD_v${appRelease.version || '2.5.0'}.apk`;

    try {
      await downloadApkFile({
        apkUrl: appRelease.apkDownloadUrl,
        version: appRelease.version || '2.5.0',
        fileName,
        onProgress: (p) => setDownloadProgress(p),
        onComplete: () => {
          clearInterval(progressTimer);
          setDownloadProgress(100);
          setTimeout(() => {
            setDownloadProgress(null);
            setDownloadSuccess(true);
          }, 400);
        }
      });
    } catch (e) {
      clearInterval(progressTimer);
      setDownloadProgress(null);
      console.error('APK Download failed:', e);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const shareUrl = window.location.origin;
    const text =
      language === 'bn'
        ? `বাংলাদেশে অনলাইনে সহজে ও নিরাপদে পণ্য কেনাবেচা করতে মার্কেটবিডি অ্যাপ ডাউনলোড করুন: ${shareUrl}`
        : `Download MarketBD Android App for the best online marketplace experience in Bangladesh: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://marketbd.net';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/70 dark:border-emerald-500/50 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative text-slate-900 dark:text-slate-100 my-auto">
        
        {/* Top Header Banner with Android Branding */}
        <div className="relative bg-gradient-to-r from-[#090f1e] via-slate-900 to-emerald-950 text-white p-5 sm:p-6 border-b border-emerald-500/30 overflow-hidden">
          {/* Decorative Background Accents */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeInstallAppModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60 active:scale-95 z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 relative z-10">
            {/* App Icon */}
            <div className="h-14 w-14 aspect-square rounded-2xl bg-slate-900 border-2 border-emerald-400/80 shadow-lg flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-emerald-500/20">
              <img
                src={customLogoUrl || '/logo.jpg'}
                alt="MarketBD"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
            </div>

            {/* Title & Badge */}
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
                  <Smartphone className="w-3 h-3 text-slate-950" />
                  {language === 'bn' ? 'অ্যান্ড্রয়েড অ্যাপ' : 'Android App'}
                </span>
                <span className="bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  v{appRelease.version || '2.4.0'}
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  100% Free
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {language === 'bn' ? 'মার্কেটবিডি মোবাইল অ্যাপ ইনস্টল করুন' : 'Install MarketBD Mobile App'}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {language === 'bn'
                  ? 'দ্রুততম কেনাবেচা, ইনস্ট্যান্ট নোটিফিকেশন ও সেরা অভিজ্ঞতা!'
                  : 'Fast browsing, instant chat alerts & seamless trading!'}
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('options')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'options'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ডাউনলোড অপশন' : 'Download Options'}</span>
            </button>

            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'instructions'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মোবাইলে ইনস্টল নিয়ম' : 'How to Install'}</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`py-1.5 px-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
              }`}
              title="QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Scan</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content based on activeTab */}
        <div className="p-4 sm:p-5 max-h-[62vh] overflow-y-auto space-y-4">
          
          {activeTab === 'options' && (
            <div className="space-y-3.5">
              {/* Option 1: 1-Click Mobile Web App (PWA) Install */}
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 dark:from-emerald-950/40 dark:to-slate-900/60 border-2 border-emerald-500/60 rounded-2xl flex flex-col gap-3 relative overflow-hidden shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {language === 'bn' ? '১-ক্লিকে ইনস্টল (মোবাইল অ্যাপ)' : '1-Click Direct Install (PWA App)'}
                        </h3>
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          {language === 'bn' ? 'সুপার ফাস্ট' : 'Fastest'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {language === 'bn'
                          ? 'কোনো ঝামেলা ছাড়াই সরাসরি আপনার মোবাইলের হোম স্ক্রিনে অ্যাপ আইকন যুক্ত করুন।'
                          : 'Add instant native web app directly onto your phone screen.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {isInstalled ? (
                    <div className="w-full py-2.5 bg-emerald-600/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'bn' ? 'আপনার ফোনে অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে ✅' : 'App is already installed on your device ✅'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handlePWAInstall}
                      disabled={isInstalling}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                      <span>
                        {isInstalling
                          ? (language === 'bn' ? 'ইনস্টল হচ্ছে...' : 'Installing...')
                          : (language === 'bn' ? 'মোবাইলে ইনস্টল করুন (ইনস্ট্যান্ট)' : 'Install to Mobile (Instant)')}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Option 2: Google Play Store Direct Download */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M3.6 1.8L14.2 12.4 3.6 23C3.2 22.6 3 22 3 21.2V3.6C3 2.8 3.2 2.2 3.6 1.8Z" fill="#00C1A6"/>
                      <path d="M17.7 8.9L14.2 12.4 3.6 1.8C4.1 1.3 4.9 1.1 5.8 1.6L17.7 8.9Z" fill="#00E676"/>
                      <path d="M17.7 15.9L5.8 23.2C4.9 23.7 4.1 23.5 3.6 23L14.2 12.4 17.7 15.9Z" fill="#FF3D00"/>
                      <path d="M21.5 11.1L17.7 8.9 14.2 12.4 17.7 15.9 21.5 13.7C22.4 13.2 22.4 12.2 21.5 11.1Z" fill="#FFC107"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Google Play Store
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'অফিসিয়াল প্লে স্টোর ভার্সন' : 'Official Play Store Release'} • 4.9 ⭐
                    </span>
                  </div>
                </div>

                <a
                  href={appRelease.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.marketbd.app'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্লে স্টোরে যান' : 'Open Play Store'}</span>
                </a>
              </div>

              {/* Option 3: Direct APK File Fast Download */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30 font-black text-xs">
                      APK
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {language === 'bn' ? 'সরাসরি APK ফাইল ডাউনলোড' : 'Direct APK File Download'}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        MarketBD_v{appRelease.version || '2.5.0'}.apk • {language === 'bn' ? 'মোবাইলে সরাসরি ডাউনলোড ও ইনস্টল' : 'Direct install on mobile'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDirectApkDownload}
                    disabled={downloadProgress !== null}
                    className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md"
                  >
                    <Download className={`w-3.5 h-3.5 ${downloadProgress !== null ? 'animate-bounce' : ''}`} />
                    <span>{downloadProgress !== null ? `${downloadProgress}%` : (language === 'bn' ? 'APK ডাউনলোড' : 'Download APK')}</span>
                  </button>
                </div>

                {downloadProgress !== null && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-150 rounded-full"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                )}

                {/* Download Success Card */}
                {downloadSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex flex-col gap-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === 'bn' ? '✅ APK ডাউনলোড শুরু হয়েছে!' : '✅ APK Download Started!'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {language === 'bn'
                        ? 'আপনার মোবাইলের স্ক্রিনের উপর থেকে নিচে সোয়াইপ করে নোটিফিকেশন বার অথবা Download ফোল্ডার ওপেন করে ফাইলে ট্যাপ করে ইনস্টল সম্পন্ন করুন।'
                        : 'Check your phone notifications bar or Downloads folder, tap the APK file and select "Install".'}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {language === 'bn' ? 'ডাউনলোড না হলে:' : 'If download didn\'t start:'}
                      </span>
                      <button
                        type="button"
                        onClick={handleDirectApkDownload}
                        className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 underline flex items-center gap-1 hover:text-emerald-500 cursor-pointer"
                      >
                        <FolderDown className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'সরাসরি ফাইল ডাউনলোড করুন' : 'Download File Directly'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Features List */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {language === 'bn' ? 'অ্যাপ ব্যবহারের বিশেষ সুবিধাসমূহ:' : 'App Exclusive Benefits:'}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{language === 'bn' ? '৫ গুণ দ্রুত ব্রাউজিং' : '5x Faster Loading'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span>{language === 'bn' ? 'ইনস্ট্যান্ট চ্যাট নোটিফিকেশন' : 'Instant Chat Alerts'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>{language === 'bn' ? 'ক্যামেরা দিয়ে ছবি আপলোড' : 'Direct Camera Photos'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{language === 'bn' ? '১০০% নিরাপদ ও সুরক্ষিত' : '100% Secure Trading'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-3.5">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-950 dark:text-emerald-200">
                <span className="font-black text-emerald-700 dark:text-emerald-400 block mb-1">
                  {language === 'bn'
                    ? '📲 মোবাইল ব্রাউজার (Chrome) থেকে ইনস্টল করার সহজ নিয়ম:'
                    : '📲 Step-by-Step Mobile Chrome Installation:'}
                </span>
                <p>
                  {language === 'bn'
                    ? 'আপনার যেকোনো অ্যান্ড্রয়েড মোবাইলের Google Chrome বা অন্য ব্রাউজার থেকে খুব সহজেই ১ মিনিটে অ্যাপ ইনস্টল করা যায়।'
                    : 'Easily install the app from Google Chrome or any browser in less than a minute.'}
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  ১
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'ব্রাউজারের ৩ ডট (⋮) মেনুতে চাপুন' : 'Tap the 3-dots (⋮) Menu in Chrome'}
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'আপনার ফোনের ক্রোম ব্রাউজারের উপরে ডানদিকের ৩টি ডট (⋮) আইকনে ক্লিক করুন।'
                      : 'Look at the top-right corner of Google Chrome and tap the ⋮ icon.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  ২
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? '"Install app" অথবা "Add to Home screen" চাপুন' : 'Select "Install app" or "Add to Home screen"'}
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'মেনু থেকে "Install app" অথবা "হোম স্ক্রিনে যোগ করুন" অপশনটি সিলেক্ট করুন।'
                      : 'Choose "Install app" or "Add to Home screen" from the menu options.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  ৩
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? '"Install" বাটনে ক্লিক করে নিশ্চিত করুন' : 'Confirm by tapping "Install"'}
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'নিশ্চিত করার সাথে সাথে আপনার মোবাইলের ডিসপ্লেতে মার্কেটবিডি অ্যাপ আইকন সেভ হয়ে যাবে।'
                      : 'The MarketBD app icon will immediately appear on your mobile home screen.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center p-3 space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-emerald-500/50 inline-block">
                <img
                  src={qrCodeUrl}
                  alt="MarketBD Mobile App QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>

              <div className="text-xs space-y-1">
                <h4 className="font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন' : 'Scan with Mobile Camera'}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {language === 'bn'
                    ? 'আপনার অ্যান্ড্রয়েড বা আইফোনের ক্যামেরা দিয়ে কিউআর কোড স্ক্যান করে সরাসরি মোবাইলে অ্যাপ ইনস্টল করুন।'
                    : 'Scan this QR code with your smartphone camera to instantly open and install the app.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Share Link & Dismiss Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (language === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>

          <button
            onClick={closeInstallAppModal}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
