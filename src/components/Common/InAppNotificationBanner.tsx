import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';

interface InAppNotice {
  id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export const InAppNotificationBanner: React.FC = () => {
  const [notice, setNotice] = useState<InAppNotice | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string; icon?: string; url?: string }>;
      if (customEvent.detail && customEvent.detail.title) {
        setTimeout(() => {
          setNotice({
            id: 'banner-' + Date.now(),
            title: customEvent.detail.title,
            body: customEvent.detail.body,
            icon: customEvent.detail.icon,
            url: customEvent.detail.url
          });
        }, 0);
      }
    };

    window.addEventListener('marketbd:in_app_notification', handleNotification);
    return () => {
      window.removeEventListener('marketbd:in_app_notification', handleNotification);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  const isLive = notice.title.includes('লাইভ') || notice.title.toLowerCase().includes('live');

  return (
    <div
      id="inapp-notification-banner"
      className="fixed top-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-9999 animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/40 p-3.5 flex items-start gap-3 transition-all duration-300 ring-2 ring-emerald-500/20">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLive ? 'bg-emerald-500 text-white' : 'bg-pink-600 text-white'}`}>
          {isLive ? <CheckCircle2 className="w-6 h-6" /> : <Bell className="w-5 h-5 animate-bounce" />}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="font-black text-xs sm:text-sm text-emerald-400 truncate">
              {notice.title}
            </h4>
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Just now</span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-200 leading-snug line-clamp-2">
            {notice.body}
          </p>
        </div>

        <button
          onClick={() => setNotice(null)}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
