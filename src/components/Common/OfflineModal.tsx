import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';

export const OfflineModal: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [manualChecking, setManualChecking] = useState<boolean>(false);

  const handleConnectionRestored = useCallback(() => {
    setIsReconnecting(true);
    // Smoothly restart/reload website automatically upon connection restoration
    setTimeout(() => {
      setIsOffline(false);
      window.location.reload();
    }, 600);
  }, []);

  // Check actual internet connectivity by probing server/network
  const checkRealConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Use cache-busting ping to ensure real internet access, not cached response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const onOffline = () => {
      setIsOffline(true);
      setIsReconnecting(false);
    };

    const onOnline = async () => {
      // Confirm with actual probe
      const hasNet = await checkRealConnection();
      if (hasNet) {
        handleConnectionRestored();
      } else {
        setIsOffline(true);
      }
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    // Periodic heartbeat probe when offline to automatically detect re-connection on Android WebViews & mobile
    let probeInterval: any = null;
    if (isOffline) {
      probeInterval = setInterval(async () => {
        if (navigator.onLine) {
          const hasNet = await checkRealConnection();
          if (hasNet) {
            handleConnectionRestored();
          }
        }
      }, 2500);
    }

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      if (probeInterval) clearInterval(probeInterval);
    };
  }, [isOffline, checkRealConnection, handleConnectionRestored]);

  const handleManualRetry = async () => {
    setManualChecking(true);
    const hasNet = await checkRealConnection();
    setManualChecking(false);
    if (hasNet) {
      handleConnectionRestored();
    }
  };

  if (!isOffline && !isReconnecting) {
    return null;
  }

  return (
    <div
      id="marketbd-offline-screen"
      className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center space-y-5 relative overflow-hidden">
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Pulsing Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-red-500 shadow-inner">
          {isReconnecting ? (
            <Wifi className="w-10 h-10 text-emerald-400 animate-bounce" />
          ) : (
            <WifiOff className="w-10 h-10 text-red-500 animate-pulse" />
          )}
        </div>

        {/* Exact Header Requested */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isReconnecting ? (
              <span className="text-emerald-400">ইন্টারনেট সংযোগ পাওয়া গেছে!</span>
            ) : (
              <span className="text-red-500">চেক ইউর ইন্টারনেট কানেকশন</span>
            )}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            {isReconnecting ? 'Connected! Resuming...' : 'Check Your Internet Connection'}
          </p>
        </div>

        {/* Explanation & Automatic resumption notice */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1.5 text-slate-300">
          <p className="leading-relaxed font-semibold">
            {isReconnecting
              ? 'ইন্টারনেট সফলভাবে পুনরায় সংযুক্ত হয়েছে। ওয়েবসাইট স্বয়ংক্রিয়ভাবে চালু হচ্ছে...'
              : 'আপনার ডিভাইসে ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে ডেটা বা ওয়াইফাই সংযোগ চেক করুন।'}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-[11px] pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ইন্টারনেট কানেকশন পেলেই ওয়েবসাইট অটোমেটিক চালু হয়ে যাবে</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isReconnecting ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg">
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>ওয়েবসাইট চালু হচ্ছে... (Starting Website)</span>
            </div>
          ) : (
            <button
              onClick={handleManualRetry}
              disabled={manualChecking}
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${manualChecking ? 'animate-spin' : ''}`} />
              <span>{manualChecking ? 'যাচাই করা হচ্ছে...' : 'পুনরায় চেক করুন (Retry Connection)'}</span>
            </button>
          )}
        </div>

        {/* Brand footer watermark */}
        <div className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span>MarketBD.Net • রিয়েল-টাইম নেটওয়ার্ক মনিটরিং</span>
        </div>
      </div>
    </div>
  );
};
