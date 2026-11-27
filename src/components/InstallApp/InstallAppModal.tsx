import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import officialMarketLogoImg from '../../assets/images/marketbd_official_logo.jpg';
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
import { downloadApkFile, getApkServerStatus, formatDirectApkUrl } from '../../utils/apkDownloadHelper';
import { downloadIosAppProfile, isIosDevice } from '../../utils/iosDownloadHelper';
import { isEffectiveAdmin } from '../../utils/authOwnership';

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
    currentUser,
    userRole,
    isLoggedIn,
    setActiveTab,
  } = useMarket();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setModalTab] = useState<'options' | 'instructions' | 'qr'>('options');
  const [copiedLink, setCopiedLink] = useState(false);
  const [apkServerStatus, setApkServerStatus] = useState<'checking' | 'ready' | 'missing'>('checking');
  const [apkSizeMb, setApkSizeMb] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [iosDownloadProgress, setIosDownloadProgress] = useState<number | null>(null);
  const [iosDownloadSuccess, setIosDownloadSuccess] = useState(false);
  const [iosDownloadError, setIosDownloadError] = useState<string | null>(null);
  const apkFeedbackRef = useRef<HTMLDivElement>(null);
  const onIosDevice = isIosDevice();
  const isAdmin = isEffectiveAdmin(isLoggedIn, currentUser, userRole);

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

  // Check real server APK availability whenever modal opens
  useEffect(() => {
    if (!isInstallAppModalOpen) return;
    setDownloadError(null);
    setDownloadSuccess(false);

    const formatted = formatDirectApkUrl(appRelease.apkDownloadUrl);
    if (/^https?:\/\//i.test(formatted) && !formatted.startsWith(window.location.origin)) {
      setApkServerStatus('ready');
      setApkSizeMb(null);
      return;
    }

    let cancelled = false;
    setApkServerStatus('checking');
    getApkServerStatus().then((status) => {
      if (cancelled) return;
      setApkServerStatus(status.available ? 'ready' : 'missing');
      if (typeof status.sizeBytes === 'number' && status.sizeBytes > 0) {
        setApkSizeMb(`${(status.sizeBytes / (1024 * 1024)).toFixed(2)} MB`);
      } else {
        setApkSizeMb(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isInstallAppModalOpen, appRelease.apkDownloadUrl]);

  if (!isInstallAppModalOpen) return null;

  const scrollFeedbackIntoView = () => {
    setTimeout(() => {
      apkFeedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

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
      setModalTab('instructions');
    }
  };

  const handleDirectApkDownload = async () => {
    const startedAt = Date.now();
    setDownloadSuccess(false);
    setDownloadError(null);
    setDownloadProgress(20);

    const progressTimer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 25;
        if (prev >= 90) return 90;
        return prev + 25;
      });
    }, 130);

    const fileName = `MarketBD_v${appRelease.version || '2.5.0'}.apk`;

    const waitMinFeedback = async () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 340) {
        await new Promise((r) => setTimeout(r, 340 - elapsed));
      }
    };

    try {
      const ok = await downloadApkFile({
        apkUrl: appRelease.apkDownloadUrl,
        version: appRelease.version || '2.5.0',
        fileName,
        onProgress: (p) => setDownloadProgress((prev) => Math.max(prev ?? 20, p)),
        onComplete: async () => {
          await waitMinFeedback();
          clearInterval(progressTimer);
          setDownloadProgress(null);
          setDownloadSuccess(true);
          setApkServerStatus('ready');
          scrollFeedbackIntoView();
        },
        onError: async () => {
          await waitMinFeedback();
          clearInterval(progressTimer);
          setDownloadProgress(null);
          setDownloadSuccess(false);
          setApkServerStatus('missing');
          setDownloadError(
            language === 'bn'
              ? 'সার্ভারে এখনো কোনো .APK ফাইল আপলোড করা হয়নি (অথবা লিংক যুক্ত নেই), তাই APK ডাউনলোড শুরু করা যায়নি। তবে নিচের বাটন থেকে ১-ক্লিকে সরাসরি অ্যাপটি মোবাইলে ইনস্টল করতে পারবেন!'
              : 'No .APK file has been uploaded to the server yet (or no direct APK link is configured). Use the 1-Click Mobile App Install button below to install immediately!'
          );
          scrollFeedbackIntoView();
        }
      });
      if (!ok) {
        await waitMinFeedback();
        clearInterval(progressTimer);
        setDownloadProgress(null);
        scrollFeedbackIntoView();
      }
    } catch (e) {
      await waitMinFeedback();
      clearInterval(progressTimer);
      setDownloadProgress(null);
      setDownloadError(
        language === 'bn'
          ? 'APK ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে নিচের ১-ক্লিকে ইনস্টল বাটন ব্যবহার করুন।'
          : 'Failed to download APK. Please use the 1-Click Install option below.'
      );
      scrollFeedbackIntoView();
      console.error('APK Download failed:', e);
    }
  };

  const handleDirectIosDownload = async () => {
    setIosDownloadSuccess(false);
    setIosDownloadError(null);
    setIosDownloadProgress(20);

    const progressTimer = setInterval(() => {
      setIosDownloadProgress((prev) => {
        if (prev === null) return 25;
        if (prev >= 90) return 90;
        return prev + 25;
      });
    }, 140);

    try {
      const ok = await downloadIosAppProfile({
        iosUrl: appRelease.iosDownloadUrl || '/api/download/ios',
        fileName: 'MarketBD_iPhone.mobileconfig',
        onProgress: (p) => setIosDownloadProgress(p),
        onComplete: () => {
          clearInterval(progressTimer);
          setIosDownloadProgress(100);
          setTimeout(() => {
            setIosDownloadProgress(null);
            setIosDownloadSuccess(true);
          }, 350);
        },
        onError: () => {
          clearInterval(progressTimer);
          setIosDownloadProgress(null);
          setIosDownloadSuccess(false);
          setIosDownloadError(
            language === 'bn'
              ? 'iPhone প্রোফাইল ডাউনলোড করা যায়নি। অনুগ্রহ করে Safari ব্রাউজার থেকে নিচের "মোবাইলে ইনস্টল নিয়ম" দেখে Share (⬆️) -> Add to Home Screen চাপুন।'
              : 'Unable to download the iOS profile. Please open in Safari and follow "How to Install" -> Share -> Add to Home Screen.'
          );
        }
      });
      if (!ok) {
        clearInterval(progressTimer);
        setIosDownloadProgress(null);
      }
    } catch (e) {
      clearInterval(progressTimer);
      setIosDownloadProgress(null);
      setIosDownloadError(
        language === 'bn'
          ? 'iPhone অ্যাপ প্রোফাইল ডাউনলোডে সমস্যা হয়েছে। অনুগ্রহ করে Safari থেকে Share -> Add to Home Screen ব্যবহার করুন।'
          : 'Failed to download iOS app profile. Please use Safari Share -> Add to Home Screen.'
      );
      console.error('iOS Profile download failed:', e);
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
            <div className="h-14 w-14 aspect-square rounded-full bg-black border-2 border-emerald-400/80 shadow-lg flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-emerald-500/20">
              <img
                src={customLogoUrl || officialMarketLogoImg}
                alt="MarketBD"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = officialMarketLogoImg;
                }}
              />
            </div>

            {/* Title & Badge */}
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
                  <Smartphone className="w-3 h-3 text-slate-950" />
                  {language === 'bn' ? 'অ্যান্ড্রয়েড ও আইফোন অ্যাপ' : 'Android & iOS App'}
                </span>
                <span className="bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  v{appRelease.version || '2.5.0'}
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
                  ? 'অ্যান্ড্রয়েড APK ও আইফোন (iOS) — দুই ফোনেই সহজ ডাউনলোড ও ইনস্টল!'
                  : 'Download & install easily on both Android (APK) and iPhone (iOS)!'}
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setModalTab('options')}
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
              type="button"
              onClick={() => setModalTab('instructions')}
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
              type="button"
              onClick={() => setModalTab('qr')}
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
            <div className="flex flex-col gap-3.5">
              {/* Two Clear Side-by-Side Choices: Android (APK) & iPhone / iPad (iOS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>
                      {language === 'bn'
                        ? 'আপনার ফোনের ধরন বেছে নিন (Android অথবা iOS):'
                        : 'Choose Your Device (Android or iOS):'}
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Android APK Download & Auto Installer */}
                  <div className={`${onIosDevice ? 'order-2 sm:order-1' : 'order-1'} p-4 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-slate-900/10 dark:from-amber-950/40 dark:to-slate-900/60 border-2 border-amber-500/75 rounded-2xl flex flex-col justify-between gap-3 shadow-sm`}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-black text-xs">
                        APK
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {language === 'bn' ? 'অ্যান্ড্রয়েড (Android)' : 'Android (APK)'}
                          </h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase ${
                            apkServerStatus === 'ready'
                              ? 'bg-emerald-500 text-slate-950'
                              : apkServerStatus === 'missing'
                                ? 'bg-amber-200 text-amber-950 dark:bg-amber-500/30 dark:text-amber-200'
                                : 'bg-amber-500 text-slate-950'
                          }`}>
                            {apkServerStatus === 'ready'
                              ? (apkSizeMb ? `Ready (${apkSizeMb})` : (language === 'bn' ? 'রেডি' : 'Ready'))
                              : apkServerStatus === 'missing'
                                ? (language === 'bn' ? 'ডাউনলোড সচল' : 'Direct APK')
                                : (language === 'bn' ? 'যাচাই হচ্ছে' : 'Checking')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-1 leading-snug">
                          MarketBD_v{appRelease.version || '2.5.0'}.apk • {language === 'bn' ? 'ডাউনলোডের পর ফোনে ইনস্টল পপআপ খুলবে' : 'Downloads APK & opens phone installer'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDirectApkDownload}
                      disabled={downloadProgress !== null}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-lg disabled:opacity-80"
                    >
                      <Download className={`w-4 h-4 ${downloadProgress !== null ? 'animate-bounce' : ''}`} />
                      <span>
                        {downloadProgress !== null
                          ? `${language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'} ${downloadProgress}%`
                          : (language === 'bn' ? 'Android ডাউনলোড ও ইনস্টল' : 'Download Android APK')}
                      </span>
                    </button>

                    {downloadProgress !== null && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-150 rounded-full"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Option B: iPhone / iPad (iOS) Download & Profile Installer */}
                  <div className={`${onIosDevice ? 'order-1 sm:order-2' : 'order-2'} p-4 bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-slate-900/10 dark:from-sky-950/45 dark:to-slate-900/60 border-2 border-sky-500/75 rounded-2xl flex flex-col justify-between gap-3 shadow-sm`}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-950 text-white border border-sky-400/50 flex items-center justify-center shrink-0 shadow-md">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {language === 'bn' ? 'আইফোন / আইপ্যাড (iOS)' : 'iPhone / iPad (iOS)'}
                          </h4>
                          <span className="bg-sky-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase">
                            iOS Profile
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-1 leading-snug">
                          MarketBD_iPhone.mobileconfig • {language === 'bn' ? 'Safari দিয়ে সরাসরি প্রোফাইল ও হোম স্ক্রিনে ইনস্টল' : 'Direct WebClip profile for Home Screen'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleDirectIosDownload}
                        disabled={iosDownloadProgress !== null}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-lg"
                      >
                        <Download className={`w-4 h-4 ${iosDownloadProgress !== null ? 'animate-bounce' : ''}`} />
                        <span>
                          {iosDownloadProgress !== null
                            ? `${language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'} ${iosDownloadProgress}%`
                            : (language === 'bn' ? 'iOS ডাউনলোড ও ইনস্টল' : 'Download iOS App')}
                        </span>
                      </button>

                      {appRelease.iosAppStoreUrl && (
                        <a
                          href={appRelease.iosAppStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>App Store</span>
                        </a>
                      )}
                    </div>

                    {iosDownloadProgress !== null && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-150 rounded-full"
                          style={{ width: `${iosDownloadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback Banners for Android APK & iOS Downloads */}
              <div ref={apkFeedbackRef} className="space-y-2">
                {iosDownloadError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-400/60 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 animate-in fade-in font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{iosDownloadError}</span>
                  </div>
                )}

                {iosDownloadSuccess && (
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/50 border border-sky-500/50 rounded-xl text-xs text-sky-950 dark:text-sky-100 flex flex-col gap-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>{language === 'bn' ? '✅ iPhone প্রোফাইল ডাউনলোড ও ইনস্টল পপআপ শুরু হয়েছে!' : '✅ iPhone Profile Download Started!'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {language === 'bn'
                        ? 'আইফোন স্ক্রিনে "Allow" চাপুন → Settings খুলুন → "Profile Downloaded" → Install চাপলেই হোম স্ক্রিনে MarketBD অ্যাপ বসে যাবে।'
                        : 'Tap "Allow" on iPhone → Open Settings → "Profile Downloaded" → Install to finish adding MarketBD.'}
                    </p>
                  </div>
                )}

                {downloadError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400/70 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex flex-col gap-2.5 animate-in fade-in shadow-sm">
                    <div className="flex items-start gap-2 font-bold text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{downloadError}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isInstalled && (
                        <button
                          type="button"
                          onClick={handlePWAInstall}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>
                            {installPrompt
                              ? (language === 'bn' ? '📲 ১-ক্লিকে অটো ইনস্টল করুন' : '📲 1-Click Auto Install')
                              : (language === 'bn' ? '📲 মোবাইলে ইনস্টল নিয়ম দেখুন' : '📲 View Install Steps')}
                          </span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            closeInstallAppModal();
                            setActiveTab('admin');
                          }}
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>{language === 'bn' ? '⚙️ অ্যাডমিন থেকে .APK আপলোড করুন' : '⚙️ Upload .APK in Admin'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex flex-col gap-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === 'bn' ? '✅ APK ডাউনলোড শুরু হয়েছে — ইনস্টল করতে প্রস্তুত!' : '✅ APK Download Started — Ready to Install!'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {language === 'bn'
                        ? 'অ্যান্ড্রয়েড অ্যাপের ভেতর থেকে ডাউনলোড করলে অটো ইনস্টলার চালু হবে; আর ব্রাউজারে হলে নিচের "Open" বা ফোনের Download নোটিফিকেশনে ১ ট্যাপ করে "Install" চাপুন (সিকিউরিটি নিয়মের কারণে ব্রাউজারে ১ ট্যাপ কনফার্মেশন লাগে)।'
                        : 'Inside the Android app the installer opens automatically; in mobile browsers, tap "Open" or the Download notification and tap "Install".'}
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
                        {language === 'bn' ? 'পুনরায় ডাউনলোড করুন' : 'Download Again'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: 1-Click Mobile Web App (PWA) Install */}
              <div className="order-3 p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 dark:from-emerald-950/40 dark:to-slate-900/60 border border-emerald-500/50 rounded-2xl flex flex-col gap-3 relative overflow-hidden shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {language === 'bn' ? '১-ক্লিকে ইনস্টল (হোম স্ক্রিন অ্যাপ)' : '1-Click Direct Install (PWA App)'}
                        </h3>
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          {language === 'bn' ? 'অ্যান্ড্রয়েড + আইফোন' : 'Android & iOS'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {language === 'bn'
                          ? 'কোনো APK ছাড়াই সরাসরি আপনার মোবাইলের হোম স্ক্রিনে অ্যাপ আইকন যুক্ত করুন।'
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
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isInstalling
                          ? (language === 'bn' ? 'ইনস্টল হচ্ছে...' : 'Installing...')
                          : (language === 'bn' ? 'হোম স্ক্রিনে ইনস্টল করুন (ইনস্ট্যান্ট)' : 'Install to Home Screen (Instant)')}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Option 3: Google Play Store Direct Download */}
              <div className="order-4 p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3">
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

              {/* Key Features List */}
              <div className="order-5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
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
            <div className="space-y-4">
              {/* iPhone / iPad Instructions */}
              <div className="space-y-2.5">
                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-500/40 p-3.5 rounded-2xl text-xs text-sky-950 dark:text-sky-100">
                  <span className="font-black text-sky-700 dark:text-sky-300 block mb-1">
                    {language === 'bn'
                      ? '🍎 আইফোন ও আইপ্যাড (iPhone / iPad) থেকে ডাউনলোড ও ইনস্টল নিয়ম:'
                      : '🍎 iPhone & iPad (iOS) Download & Install Guide:'}
                  </span>
                  <p>
                    {language === 'bn'
                      ? 'আইফোনে সরাসরি ২ ভাবে MarketBD অ্যাপ ইনস্টল করা যায় — ১) উপরের "iPhone অ্যাপ ডাউনলোড" বাটনে ক্লিক করে অথবা ২) Safari ব্রাউজার থেকে সরাসরি হোম স্ক্রিনে।'
                      : 'Install MarketBD on iPhone using either the "Download for iPhone" profile button or Safari Share -> Add to Home Screen.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ১
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'প্রোফাইল ডাউনলোড অথবা Safari Share (⬆️) চাপুন' : 'Download iOS Profile or Tap Safari Share (⬆️)'}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {language === 'bn'
                        ? '"iPhone অ্যাপ ডাউনলোড" বাটনে চাপলে Safari পপআপে "Allow" দিন, অথবা Safari নিচের Share (⬆️) আইকনে ট্যাপ করুন।'
                        : 'Tap "Download for iPhone" and choose "Allow", or tap the Share (⬆️) button at the bottom of Safari.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ২
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'Settings → Profile Downloaded অথবা "Add to Home Screen"' : 'Settings → Profile Downloaded or "Add to Home Screen"'}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {language === 'bn'
                        ? 'প্রোফাইল ডাউনলোড করলে ফোনের Settings → Profile Downloaded → Install দিন; অথবা Share মেনু থেকে "Add to Home Screen" চাপুন।'
                        : 'If using profile, open iPhone Settings → Profile Downloaded → Install; otherwise select "Add to Home Screen".'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Android Instructions */}
              <div className="space-y-2.5 pt-1">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-950 dark:text-emerald-200">
                  <span className="font-black text-emerald-700 dark:text-emerald-400 block mb-1">
                    {language === 'bn'
                      ? '📲 অ্যান্ড্রয়েড (Android Chrome / APK) থেকে ইনস্টল করার সহজ নিয়ম:'
                      : '📲 Android Chrome & APK Installation:'}
                  </span>
                  <p>
                    {language === 'bn'
                      ? 'উপরের "APK ডাউনলোড ও ইনস্টল করুন" বাটনে চাপুন অথবা Google Chrome থেকে নিচের ধাপগুলো অনুসরণ করুন।'
                      : 'Tap "Download & Install APK" or install directly via Google Chrome steps below.'}
                  </p>
                </div>

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

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ২
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? '"Install app" অথবা ডাউনলোড হওয়া APK-তে ট্যাপ করুন' : 'Select "Install app" or tap downloaded APK'}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {language === 'bn'
                        ? 'মেনু থেকে "Install app" সিলেক্ট করুন অথবা Download ফোল্ডার থেকে APK ফাইলটিতে ট্যাপ করে Install নিশ্চিত করুন।'
                        : 'Choose "Install app" from the menu or open the downloaded APK file to confirm installation.'}
                    </p>
                  </div>
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
