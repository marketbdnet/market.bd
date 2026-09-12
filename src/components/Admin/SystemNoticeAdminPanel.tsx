import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Megaphone,
  Check,
  PhoneCall,
  Mail,
  Bell,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  Flame,
  Zap,
  Sliders,
  Eye,
  PlusCircle
} from 'lucide-react';

export const SystemNoticeAdminPanel: React.FC = () => {
  const { language, systemNotice, updateSystemNotice } = useMarket();

  // State management
  const [isEnabled, setIsEnabled] = useState(systemNotice.isEnabled !== false);
  const [showAdPromo, setShowAdPromo] = useState(systemNotice.showAdPromo !== false);
  const [showFraudWarning, setShowFraudWarning] = useState(systemNotice.showFraudWarning !== false);
  const [showCustomNotice, setShowCustomNotice] = useState(systemNotice.showCustomNotice !== false);

  const [adPromoBn, setAdPromoBn] = useState(
    systemNotice.adPromoBn || '🚀 আপনার যেকোনো অব্যবহৃত বা নতুন পণ্য দ্রুত বিক্রি করতে আজই ১০০% ফ্রিতে বিজ্ঞাপন পোস্ট করুন! হাজারো প্রকৃত ক্রেতার কাছে সহজেই পৌঁছান।'
  );
  const [adPromoEn, setAdPromoEn] = useState(
    systemNotice.adPromoEn || '🚀 Sell your new or used items faster! Post your ad for 100% FREE today and reach thousands of verified buyers instantly!'
  );

  const [fraudWarningBn, setFraudWarningBn] = useState(
    systemNotice.fraudWarningBn || '🛡️ প্রতারক হতে সতর্ক থাকুন: পণ্য ও আসল কাগজপত্র সরাসরি না দেখে বা পরীক্ষা না করে কাউকে অগ্রিম কুরিয়ার/বিকাশ/নগদে টাকা পাঠাবেন না!'
  );
  const [fraudWarningEn, setFraudWarningEn] = useState(
    systemNotice.fraudWarningEn || '🛡️ Fraud Alert: Never pay money in advance or send bKash/Nagad without verifying the product & documents in person!'
  );

  const [customNoticeBn, setCustomNoticeBn] = useState(
    systemNotice.customNoticeBn || '🔥 বিশেষ অফার: ভেরিফায়েড বিজনেস শপ একাউন্ট খুললেই পাচ্ছেন ৩টি প্রিমিয়াম ফেভারিট টপ অ্যাড প্রমোশন একদম ফ্রি!'
  );
  const [customNoticeEn, setCustomNoticeEn] = useState(
    systemNotice.customNoticeEn || '🔥 Special Offer: Register a Verified Business Shop today and enjoy 3 FREE Top Ad Promotions!'
  );

  const [scrollSpeed, setScrollSpeed] = useState<'slow' | 'medium' | 'fast'>(
    systemNotice.scrollSpeed || 'medium'
  );

  const [contactPhone, setContactPhone] = useState(
    systemNotice.contactPhone === '01634025151' || systemNotice.contactPhone === '33830784' ? '01533830784' : (systemNotice.contactPhone || '01533830784')
  );
  const [contactEmail, setContactEmail] = useState(systemNotice.contactEmail || 'official.marketbd@gmail.com');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();

    updateSystemNotice({
      isEnabled,
      showAdPromo,
      showFraudWarning,
      showCustomNotice,
      adPromoBn: adPromoBn.trim(),
      adPromoEn: adPromoEn.trim(),
      fraudWarningBn: fraudWarningBn.trim(),
      fraudWarningEn: fraudWarningEn.trim(),
      customNoticeBn: customNoticeBn.trim(),
      customNoticeEn: customNoticeEn.trim(),
      scrollSpeed,
      noticeBn: adPromoBn.trim() || fraudWarningBn.trim(),
      noticeEn: adPromoEn.trim() || fraudWarningEn.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
    });

    setStatusMsg(
      language === 'bn'
        ? '✅ আপডেট সফল হয়েছে! (Update Successfully) - ৩D লাইটিং চলমান সাইট নোটিশ ও কন্টাক্ট তথ্য সেভ হয়েছে।'
        : '✅ Update Successfully! - 3D Marquee Notice & Contact Settings Saved.'
    );
    setTimeout(() => setStatusMsg(''), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-500/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              3D Live Marquee Ticker
            </span>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>
                {language === 'bn'
                  ? '📢 ৩D লাইটিং চলমান বিজ্ঞাপন ও নিরাপত্তা টিঙ্কার সেটিংস'
                  : '📢 3D Lighting Live Marquee & Notice Controls'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-emerald-200 max-w-2xl">
            {language === 'bn'
              ? 'ন্যাভবারের নিচে চলমান ৩D বর্ডার ও লাইটিং ইফেক্ট বিশিষ্ট বার্তা নিয়ন্ত্রণ করুন। কাস্টম বিজ্ঞাপন, উৎসাহমূলক কথা এবং প্রতারক সতর্কতা চালু বা বন্ধ করতে পারেন।'
              : 'Customize the 3D eye-catching live marquee banner under the navbar with custom ads, seller encouragement, and scam alert cautions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>3D Lighting Active</span>
          </span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200 text-xs font-black rounded-2xl animate-in zoom-in-95 flex items-center gap-2 shadow-lg">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveNotice} className="space-y-6">
        {/* Main Master Control & Speed */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '১. ৩D চলমান নোটিশ মাস্টারিং (Live 3D Ticker Master Switch)' : '1. Live 3D Marquee Master Switch'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'টিক চিহ্নিত অপশনগুলোই শুধুমাত্র ওয়েবসাইটে লাইভ স্ক্রোল হবে' : 'Checked items will be broadcasted live under the main navbar'}
                </p>
              </div>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/80 p-3 rounded-2xl border border-emerald-300 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                {language === 'bn' ? 'চালু করুন (Enable Live 3D Ticker)' : 'Enable Live 3D Ticker'}
              </span>
            </label>
          </div>

          {/* Speed Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'স্ক্রোলিং গতি (Scrolling Speed):' : 'Scroll Speed:'}</span>
            </span>
            <div className="flex items-center gap-2">
              {[
                { id: 'slow', labelBn: 'ধীরগতি (Slow)', labelEn: 'Slow' },
                { id: 'medium', labelBn: 'মাঝারি (Medium)', labelEn: 'Medium' },
                { id: 'fast', labelBn: 'দ্রুত (Fast)', labelEn: 'Fast' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setScrollSpeed(sp.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                    scrollSpeed === sp.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {language === 'bn' ? sp.labelBn : sp.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Option 1: Ad Posting Encouragement */}
          <div className="p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdPromo}
                  onChange={(e) => setShowAdPromo(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded cursor-pointer accent-amber-600"
                />
                <span className="font-black text-xs text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    {language === 'bn'
                      ? '১. বিজ্ঞাপন পোস্ট করার উৎসাহমূলক বার্তা (Ad Posting Encouragement)'
                      : '1. Ad Posting Encouragement Message'}
                  </span>
                </span>
              </label>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 uppercase">
                Encouragement
              </span>
            </div>

            {showAdPromo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    বাংলা বার্তা (Bangla Ad Encouragement):
                  </label>
                  <textarea
                    rows={2}
                    value={adPromoBn}
                    onChange={(e) => setAdPromoBn(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    English Text (English Ad Encouragement):
                  </label>
                  <textarea
                    rows={2}
                    value={adPromoEn}
                    onChange={(e) => setAdPromoEn(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Fraud Warning Caution */}
          <div className="p-5 rounded-2xl border-2 border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFraudWarning}
                  onChange={(e) => setShowFraudWarning(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded cursor-pointer accent-red-600"
                />
                <span className="font-black text-xs text-red-950 dark:text-red-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>
                    {language === 'bn'
                      ? '২. প্রতারক থেকে দূরে থাকার নিরাপত্তা সতর্কতা (Scam / Fraud Alert)'
                      : '2. Scam / Fraud Caution Alert'}
                  </span>
                </span>
              </label>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 uppercase">
                Fraud Caution
              </span>
            </div>

            {showFraudWarning && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    বাংলা সতর্কতা (Bangla Fraud Caution):
                  </label>
                  <textarea
                    rows={2}
                    value={fraudWarningBn}
                    onChange={(e) => setFraudWarningBn(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    English Caution (English Fraud Caution):
                  </label>
                  <textarea
                    rows={2}
                    value={fraudWarningEn}
                    onChange={(e) => setFraudWarningEn(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Option 3: Custom Written Announcement */}
          <div className="p-5 rounded-2xl border-2 border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/50 dark:bg-cyan-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCustomNotice}
                  onChange={(e) => setShowCustomNotice(e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded cursor-pointer accent-cyan-600"
                />
                <span className="font-black text-xs text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-cyan-500" />
                  <span>
                    {language === 'bn'
                      ? '৩. কাস্টম নিজস্ব বিজ্ঞাপন বা অফার ঘোষণা (Custom Written Announcement)'
                      : '3. Custom Announcement / Special Ad Offer'}
                  </span>
                </span>
              </label>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 uppercase">
                Custom Option
              </span>
            </div>

            {showCustomNotice && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    বাংলা কাস্টম বার্তা (Bangla Custom Notice):
                  </label>
                  <textarea
                    rows={2}
                    value={customNoticeBn}
                    onChange={(e) => setCustomNoticeBn(e.target.value)}
                    placeholder="এখানে আপনার নিজস্ব কোনো বিজ্ঞাপন বা অফারের কথা লিখুন..."
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    English Custom Notice:
                  </label>
                  <textarea
                    rows={2}
                    value={customNoticeEn}
                    onChange={(e) => setCustomNoticeEn(e.target.value)}
                    placeholder="Type your custom offer or promotion in English..."
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3D Lighting Live Preview Container inside Admin */}
        <div className="p-6 bg-slate-950 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? '৩D লাইভ প্রিভিউ (3D Lighting Live Marquee Preview)' : '3D Marquee Live Preview'}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
              {isEnabled ? '● LIVE ACTIVE' : '○ DISABLED'}
            </span>
          </div>

          {isEnabled ? (
            <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y-2 border-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.4)] rounded-2xl flex items-center justify-between gap-3 overflow-hidden text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0">
                  3D LIGHTING
                </span>
                <p className="text-amber-200 font-bold truncate">
                  {showAdPromo && adPromoBn}
                  {showFraudWarning && ` | ${fraudWarningBn}`}
                  {showCustomNotice && ` | ${customNoticeBn}`}
                </p>
              </div>
              <button
                type="button"
                className="px-3 py-1 bg-pink-600 text-white font-black rounded-lg text-[10px] shrink-0 shadow-md flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>বিজ্ঞাপন দিন</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-2">
              {language === 'bn' ? 'টিঙ্কারটি বর্তমানে নিষ্ক্রিয় রয়েছে। চালু করতে উপরের মাস্টারিং চেকপয়েন্ট টিক দিন।' : 'Ticker is currently disabled.'}
            </p>
          )}
        </div>

        {/* Section: Official Helpline Contact Information */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'bn' ? 'অফিসিয়াল কাস্টমার সাপোর্ট ফোন ও ইমেইল' : 'Official Customer Support Contact Information'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'ফুটার ও কাস্টমার চ্যাটে প্রদর্শিত হবে' : 'Used across website footer & helpline'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'হেল্পলাইন মোবাইল নম্বর:' : 'Helpline Mobile:'}
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'হেল্পলাইন ইমেইল এড্রেস:' : 'Helpline Email:'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 transform active:scale-95"
        >
          <Check className="w-5 h-5" />
          <span>{language === 'bn' ? '৩D নোটিশ ও কন্টাক্ট সেভ করুন' : 'Save 3D Notice & Contact Settings'}</span>
        </button>
      </form>
    </div>
  );
};

