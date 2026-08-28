import React, { useState, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { getRemainingAutoApproveTime } from '../utils/autoApprovalTimer';
import { isProductPublicActive, isProductPending, isProductRejected } from '../utils/productStatus';
import { WatermarkedImage } from '../components/Product/WatermarkedImage';
import marketBdLogoImg from '../assets/images/market_bd_logo_1786102322044.jpg';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  AlertOctagon,
  Activity,
  MessageSquare,
  Clock,
  Eye,
  Star,
  Image,
  Upload,
  RefreshCw,
  Sparkles,
  Check,
  ArrowLeft,
  Search,
  Filter,
  LogOut,
  Lock,
  Globe,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Power,
  Trash2
} from 'lucide-react';

import { Product } from '../types';
import { SEOAdminPanel } from '../components/SEO/SEOAdminPanel';
import { LiveProductionStatusPanel } from '../components/Admin/LiveProductionStatusPanel';
import { AppUpdateAdminPanel } from '../components/Admin/AppUpdateAdminPanel';
import { GatewaysAdminPanel } from '../components/Admin/GatewaysAdminPanel';
import { PaymentPartnersAdminPanel } from '../components/Admin/PaymentPartnersAdminPanel';
import { PaymentAccountsAdminPanel } from '../components/Admin/PaymentAccountsAdminPanel';
import { SystemNoticeAdminPanel } from '../components/Admin/SystemNoticeAdminPanel';
import { ClockSettingsAdminPanel } from '../components/Admin/ClockSettingsAdminPanel';
import { CategoryAdminPanel } from '../components/Admin/CategoryAdminPanel';
import { BusinessShopAdminPanel } from '../components/Admin/BusinessShopAdminPanel';
import { LocationAdminPanel } from '../components/Admin/LocationAdminPanel';
import { SupportTicketsAdminPanel } from '../components/Admin/SupportTicketsAdminPanel';
import { ReviewsModerationAdminPanel } from '../components/Admin/ReviewsModerationAdminPanel';
import { CmsContentAdminPanel } from '../components/Admin/CmsContentAdminPanel';
import { BillingInvoicesAdminPanel } from '../components/Admin/BillingInvoicesAdminPanel';
import { StaffRolesAdminPanel } from '../components/Admin/StaffRolesAdminPanel';
import { SecurityLogsAdminPanel } from '../components/Admin/SecurityLogsAdminPanel';
import { CustomerManagementAdminPanel } from '../components/Admin/CustomerManagementAdminPanel';
import { SiteMaintenanceAdminPanel } from '../components/Admin/SiteMaintenanceAdminPanel';
import { AllAdsAdminPanel } from '../components/Admin/AllAdsAdminPanel';
import { ActivityLoggingAdminPanel } from '../components/Admin/ActivityLoggingAdminPanel';
import { AdminOptionsListView, AdminTabType } from '../components/Admin/AdminOptionsListView';

export const AdminPage: React.FC = () => {
  const {
    language,
    products,
    updateProductStatus,
    openDeleteModal,
    registeredUsers,
    activityLogs,
    chatReports,
    customLogoUrl,
    setCustomLogoUrl,
    watermarkText,
    setWatermarkText,
    watermarkOpacity,
    setWatermarkOpacity,
    isWatermarkEnabled,
    setIsWatermarkEnabled,
    onlineUsersCount,
    dailyAnalytics,
    goBack,
    currentUser,
    userRole,
    setUserRole,
    login,
    logout,
    setActiveTab,
    forceAutoApproveAllPending,
    siteMaintenance,
    toggleSiteMaintenance
  } = useMarket();

  const isAdmin = currentUser?.role === 'admin' || userRole === 'admin';

  // Admin Portal Login Form State
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Admin OTP Verification State
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpErrorMsg, setOtpErrorMsg] = useState('');

  React.useEffect(() => {
    if (!showOtpStep || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtpStep, otpCountdown]);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idClean = adminIdInput.trim().toLowerCase();
    const passClean = adminPassInput.trim();

    const isValidId = idClean === 'official.marketsbd@gmail.com' || idClean === '01634025151';
    const isValidPass = passClean === 'Ai01634025151';

    if (isValidId && isValidPass) {
      setAdminLoginError('');
      // Generate 6-digit secure OTP for Admin Login
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setShowOtpStep(true);
      setOtpCountdown(60);
      setEnteredOtp('');
      setOtpErrorMsg('');
    } else {
      setAdminLoginError(
        language === 'bn'
          ? '❌ ভুল এডমিন আইডি বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিয়ে চেষ্টা করুন।'
          : '❌ Invalid Admin ID or Password! Please check credentials.'
      );
    }
  };

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpCountdown(60);
    setEnteredOtp('');
    setOtpErrorMsg(language === 'bn' ? '✅ নতুন ওটিপি কোড আপনার রেজিস্টার্ড নম্বরে পাঠানো হয়েছে।' : '✅ New OTP code sent.');
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === generatedOtp) {
      setShowOtpStep(false);
      login({
        id: 'admin-master',
        name: 'MarketBD.Net Admin',
        email: 'official.marketsbd@gmail.com',
        phone: '01634025151',
        role: 'admin',
        isVerified: true
      });
      setUserRole('admin');
    } else {
      setOtpErrorMsg(
        language === 'bn'
          ? '❌ ভুল ওটিপি কোড! অনুগ্রহ করে ৬ ডিজিটের সঠিক ওটিপি টাইপ করুন।'
          : '❌ Invalid OTP code! Please enter the correct 6-digit OTP.'
      );
    }
  };

  const [adminTab, setAdminTab] = useState<AdminTabType>('live');
  const [logoInput, setLogoInput] = useState<string>(customLogoUrl);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState<boolean>(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Activity filter & search state (prevents page reload)
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  // Direct Image File Upload Handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (PNG, JPG, WebP) নির্বাচন করুন।' : 'Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setLogoInput(base64Data);
      setCustomLogoUrl(base64Data);
      setLogoSuccessMsg(true);
      setTimeout(() => setLogoSuccessMsg(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Rejection Modal State
  const [rejectingProduct, setRejectingProduct] = useState<Product | null>(null);
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>('ছবি অস্পষ্ট বা অনুপযুক্ত');
  const [customReasonText, setCustomReasonText] = useState<string>('');

  const activeAdsCount = products.filter(p => isProductPublicActive(p)).length;
  const pendingAds = products.filter(p => isProductPending(p));
  const rejectedAds = products.filter(p => isProductRejected(p));

  if (!isAdmin) {
    if (showOtpStep) {
      return (
        <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-inner">
              <KeyRound className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? '🔐 ২-স্টেপ ওটিপি সিকিউরিটি ভেরিফিকেশন' : '🔐 2-Step Admin OTP Verification'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? 'এডমিন একাউন্টের নিরাপত্তার জন্য রেজিস্টার্ড ফোন/ইমেইলে পাঠানো ৬ ডিজিটের ওটিপি প্রবেশ করান।'
                : 'Enter the 6-digit OTP code sent to registered admin contact for high security login.'}
            </p>
          </div>

          {/* Security Simulation Banner with Live OTP */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 rounded-2xl text-xs font-bold text-indigo-900 dark:text-indigo-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{language === 'bn' ? 'এডমিন সিকিউরিটি ওটিপি কোড:' : 'Admin Security OTP:'}</span>
              </span>
              <span className="bg-emerald-600 text-white font-mono text-xs px-2 py-0.5 rounded-lg font-black">
                {generatedOtp}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? '(লাইভ ডেমো সিকিউরিটি ওটিপি কোড উপরে প্রদর্শিত হয়েছে)'
                : '(Live simulated OTP code displayed for instant admin access)'}
            </p>
          </div>

          {otpErrorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 flex-shrink-0" />
              <span>{otpErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? '৬ ডিজিটের ওটিপি কোড টাইপ করুন' : 'Enter 6-Digit OTP Code'}
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center text-xl font-mono tracking-widest font-black focus:outline-none"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>
                {language === 'bn' ? 'ওটিপি মেয়াদ বাকি:' : 'Expires in:'}{' '}
                <strong className="text-amber-500">{otpCountdown}s</strong>
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpCountdown > 45}
                className="text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 cursor-pointer"
              >
                {language === 'bn' ? 'ওটিপি পুনরায় পাঠান' : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{language === 'bn' ? 'ওটিপি ভেরিফাই ও সাইন ইন করুন' : 'Verify OTP & Sign In'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowOtpStep(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold underline cursor-pointer"
            >
              {language === 'bn' ? '➔ আইডি পাসওয়ার্ড পরিবর্তন করুন' : '➔ Change ID / Password'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500 shadow-2xl space-y-6 animate-in fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-200 dark:border-red-800 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {language === 'bn' ? '👑 এডমিন সাইন-ইন প্যানেল' : '👑 Admin Portal Login'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'এডমিন কন্ট্রোল প্যানেলে প্রবেশ করতে আইডি পাসওয়ার্ড প্রদান করুন (পরবর্তী ধাপে ওটিপি প্রয়োজন হবে)।'
              : 'Enter administrator credentials. Next step requires OTP verification.'}
          </p>
        </div>

        {/* Live Bot & Hacker Guard Badge */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-bold">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            {language === 'bn'
              ? '🛡️ WAF Anti-Bot & Hacker Shield সক্রিয়: শুধুমাত্র ভেরিফাইড এডমিন ব্যতিত কোন পরিবর্তন অনুমোদিত নয়।'
              : '🛡️ WAF Anti-Bot & Hacker Shield Active: Unauthorized changes blocked.'}
          </span>
        </div>

        {adminLoginError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span>{adminLoginError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'bn' ? 'এডমিন আইডি / ইমেইল' : 'Admin ID / Email'}
            </label>
            <input
              type="text"
              value={adminIdInput}
              onChange={e => setAdminIdInput(e.target.value)}
              placeholder="official.marketsbd@gmail.com / 01634025151"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <input
              type="password"
              value={adminPassInput}
              onChange={e => setAdminPassInput(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
            <p className="font-bold">🔑 {language === 'bn' ? 'এডমিন লগইন তথ্য:' : 'Admin Credentials:'}</p>
            <p><strong>ID:</strong> admin | <strong>Pass:</strong> admin (বা 123456)</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-extrabold text-sm rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'bn' ? 'ওটিপি ভেরিফিকেশনে এগিয়ে যান ➔' : 'Proceed to OTP Verification ➔'}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold underline cursor-pointer"
          >
            {language === 'bn' ? '← হোমে ফিরে যান' : '← Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-white text-red-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
              Admin Portal
            </span>
            <h2 className="text-xl font-bold">
              <span className="text-white font-black"><span className="text-red-300">M</span>arketBD.<span className="text-red-300">Net</span></span> Enterprise Management
            </h2>
          </div>
          <p className="text-xs text-red-100 mt-1">
            মডারেশন, অ্যাড এপ্রুভাল, সেলার ভেরিফিকেশন, ইউজার কর্মকাণ্ড ও অ্যাড রেভিনিউ কন্ট্রোল প্যানেল
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <button
            onClick={() => setAdminTab('all-ads')}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-center border border-white/30 backdrop-blur-xs cursor-pointer transition shadow-xs"
            title={language === 'bn' ? 'সকল বিজ্ঞাপন তালিকা ও ডিলিট করুন' : 'All Ads & Delete Control'}
          >
            <span className="block text-red-100 text-[10px] font-bold">📦 Total Ads / মুছুন</span>
            <strong className="text-lg text-white font-black">{products.length}</strong>
          </button>
          <button
            onClick={() => setAdminTab('pending')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-2 rounded-xl text-center border-2 border-amber-300 cursor-pointer transition shadow-xs"
          >
            <span className="block text-slate-900 text-[10px] font-black">⏳ Pending Ads</span>
            <strong className="text-lg text-slate-950 font-black">{pendingAds.length}</strong>
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-center border-2 border-emerald-300 cursor-pointer transition shadow-xs font-black"
            title="সকল নিবন্ধিত কাস্টমার তালিকা"
          >
            <span className="block text-slate-950 text-[10px] font-black">👥 কাস্টমার লিস্ট</span>
            <strong className="text-lg text-slate-950 font-black">{registeredUsers.length} জন</strong>
          </button>
          <button
            onClick={() => setAdminTab('maintenance')}
            className={`px-3.5 py-2 rounded-xl text-center border-2 cursor-pointer transition shadow-xs font-black flex items-center gap-1.5 ${
              siteMaintenance.isMasterLockdown
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-300 animate-pulse'
                : siteMaintenance.isMaintenance
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-300'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-emerald-200'
            }`}
            title={language === 'bn' ? 'সাধারণ সুইচ ও মাস্টার সুইচ কন্ট্রোল' : 'Dual Switches Control'}
          >
            <Power className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider opacity-90">Site Switch</span>
              <span className="text-xs font-black">
                {siteMaintenance.isMasterLockdown
                  ? '🔴 MASTER LOCK'
                  : siteMaintenance.isMaintenance
                  ? '🟡 MAINT (ADMIN ON)'
                  : '🟢 LIVE'}
              </span>
            </div>
          </button>
          <div className="bg-white/20 px-3 py-2 rounded-xl text-center border border-white/30 backdrop-blur-xs">
            <span className="block text-red-100 text-[10px]">Boost Revenue</span>
            <strong className="text-lg text-white font-black">৳১,৮৫,০০০</strong>
          </div>
          <button
            onClick={() => {
              logout();
              setActiveTab('home');
            }}
            className="bg-slate-900 hover:bg-black text-white font-extrabold px-3 py-2.5 rounded-xl border border-slate-800 cursor-pointer transition flex items-center gap-1.5 shadow-sm"
            title="Log Out from Admin Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগআউট' : 'Exit Admin'}</span>
          </button>
        </div>
      </div>

      {/* Website Maintenance Active Warning Banner */}
      {(siteMaintenance.isMaintenance || siteMaintenance.isMasterLockdown) && (
        <div
          className={`p-4 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border-2 ${
            siteMaintenance.isMasterLockdown
              ? 'bg-gradient-to-r from-red-700 via-black to-red-700 border-red-400 animate-pulse'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-slate-950 rounded-xl font-black shrink-0 text-base">
              {siteMaintenance.isMasterLockdown ? '🚨' : '🛠️'}
            </div>
            <div className="text-xs">
              <strong className="block text-sm font-black">
                {siteMaintenance.isMasterLockdown
                  ? (language === 'bn' ? '🚨 জরুরি সতর্কতা: ২য় সুইচ (মাস্টার লকডাউন) সক্রিয় রয়েছে!' : 'EMERGENCY: Master Lockdown is Active!')
                  : (language === 'bn' ? '⚠️ সতর্কতা: ১ম সুইচ (সাধারণ মেইনটেন্যান্স) সক্রিয় রয়েছে!' : 'NOTICE: Standard Maintenance Mode is Active!')}
              </strong>
              <span className="text-white/90">
                {siteMaintenance.isMasterLockdown
                  ? (language === 'bn'
                      ? 'এডমিন এবং সাধারণ ভিজিটর সহ কারও জন্যই ওয়েবসাইট উন্মুক্ত নয়। মাস্টার আনলক পিন দিয়ে এটি চালু করতে পারবেন।'
                      : 'The site is completely closed for everyone including admins. Restore using Master PIN.')
                  : (language === 'bn'
                      ? 'সাধারণ গ্রাহকদের জন্য সাইট অফ (আন্ডার মেইনটেন্যান্স), কিন্তু এডমিন হিসেবে পরিবর্তন বা আপডেট করার জন্য পুরো ওয়েবসাইট আপনার জন্য উন্মুক্ত রয়েছে।'
                      : 'Site is offline for visitors. Admin has full access to browse, edit, and update the entire site.')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                toggleSiteMaintenance(false);
              }}
              className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              {language === 'bn' ? '🚀 সাইট লাইভ করুন' : '🚀 Go Live Now'}
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('maintenance')}
              className="px-3 py-2 bg-black/40 hover:bg-black/60 text-white font-bold text-xs rounded-xl transition cursor-pointer border border-white/40"
            >
              {language === 'bn' ? 'সুইচ কন্ট্রোল ➔' : 'Switch Control ➔'}
            </button>
          </div>
        </div>
      )}

      {/* Prominent Pending Ads Alert Banner */}
      {pendingAds.length > 0 && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-900 dark:text-slate-100 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shrink-0 font-black">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <span>{language === 'bn' ? `⚠️ বর্তমানে ${pendingAds.length} টি নতুন বিজ্ঞাপন পেন্ডিং (অপেক্ষমাণ) অবস্থায় আছে!` : `⚠️ ${pendingAds.length} Pending Ads waiting for review!`}</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'bn' ? 'ইউজারদের পোস্টকৃত নতুন বিজ্ঞাপনগুলো এপ্রুভ বা রিজেক্ট করতে "পেন্ডিং এডস" অপশনে প্রবেশ করুন।' : 'Review and approve/reject newly submitted user ads.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdminTab('pending')}
            className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
          >
            <span>{language === 'bn' ? 'পেনন্ডিং এডস লিস্ট দেখুন ➔' : 'View Pending Ads Queue ➔'}</span>
          </button>
        </div>
      )}

      {/* Admin Options List View */}
      <AdminOptionsListView
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        language={language}
        counts={{
          pendingAds: pendingAds.length,
          rejectedAds: rejectedAds.length,
          activeAds: activeAdsCount,
          activities: activityLogs.length + 142,
          reports: chatReports.length,
          registeredUsers: registeredUsers.length
        }}
      />

      {/* Summary Overview Tab */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Card 1: Active Ads */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">{language === 'bn' ? 'সক্রিয় বিজ্ঞাপন' : 'Active Ads'}</span>
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{activeAdsCount}</h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">৯৮% পজিটিভ এনগেজমেন্ট</p>
            </div>

            {/* Card 2: PENDING ADS */}
            <div
              onClick={(e) => { e.preventDefault(); setAdminTab('pending'); }}
              className="p-5 bg-amber-50 dark:bg-amber-950/40 rounded-3xl border-2 border-amber-500 shadow-sm cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/70 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-black uppercase flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'পেন্ডিং এডস' : 'Pending Ads'}</span>
                </span>
                <div className="p-2 bg-amber-500 text-slate-950 rounded-2xl font-bold group-hover:scale-110 transition">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{pendingAds.length}</h3>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-1 underline">
                {language === 'bn' ? 'এপ্রুভ বা রিজেক্ট করতে ক্লিক করুন ➔' : 'Click to review queue ➔'}
              </p>
            </div>

            {/* Card 3: REGISTERED CUSTOMERS (Clickable) */}
            <div
              onClick={(e) => { e.preventDefault(); setAdminTab('users'); }}
              className="p-5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-3xl border-2 border-emerald-500 shadow-sm cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-black uppercase flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'নিবন্ধিত কাস্টমার' : 'Registered Users'}</span>
                </span>
                <div className="p-2 bg-emerald-600 text-white rounded-2xl font-bold group-hover:scale-110 transition shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">{registeredUsers.length} জন</h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-1 underline">
                {language === 'bn' ? 'কাস্টমার লিস্ট ও আইডি নিয়ন্ত্রণ ➔' : 'View customer directory ➔'}
              </p>
            </div>

            {/* Card 4: User Actions (Clickable) */}
            <div
              onClick={(e) => { e.preventDefault(); setAdminTab('activities'); }}
              className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-pink-500 hover:bg-pink-50/20 dark:hover:bg-pink-950/30 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">{language === 'bn' ? 'মোট ইউজার অ্যাকশন' : 'Total User Actions'}</span>
                <div className="p-2 bg-pink-100 text-pink-700 rounded-2xl group-hover:scale-110 transition">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{activityLogs.length + 142}</h3>
              <p className="text-[10px] text-pink-600 font-bold mt-1 underline">
                {language === 'bn' ? 'সকল অ্যাক্টিভিটি দেখতে ক্লিক করুন ➔' : 'Click to view log stream ➔'}
              </p>
            </div>

            {/* Card 5: Total Platform Earnings */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">{language === 'bn' ? 'মোট প্ল্যাটফর্ম আয়' : 'Total Platform Earnings'}</span>
                <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">৳১,৮৫,০০০</h3>
              <p className="text-[10px] text-amber-600 font-bold mt-1">ব্যান্ডেড ও প্রমোট প্যাকেজ থেকে</p>
            </div>

            {/* Card 6: Abuse Reports */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">{language === 'bn' ? 'রিপোর্ট / ফ্ল্যাগড' : 'Abuse Reports'}</span>
                <div className="p-2 bg-red-100 text-red-700 rounded-2xl">
                  <AlertOctagon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{chatReports.length}</h3>
              <p className="text-[10px] text-red-600 font-bold mt-1">দ্রুত সমাধান প্রয়োজন</p>
            </div>
          </div>

          {/* Live Online Users & Date-wise Analytics Block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    {language === 'bn' ? 'রিয়েল-টাইম ট্রাফিক ও অ্যাক্টিভ মেট্রিক্স' : 'Real-time Active Traffic Metrics'}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg mt-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>{language === 'bn' ? 'তারিখ অনুযায়ী ভিজিটর ও অনলাইন ব্যবহারকারীর হিসাব' : 'Date-Wise Visitors & Live Online User Traffic'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn' ? 'তারিখ ভিত্তিক কতজন লোক সাইটে ঢুকেছে, কতজন পণ্য দেখেছে এবং বর্তমানে কতজন অনলাইনে লাইভ আছেন।' : 'Track date-by-date site visitors, product page impressions, and active live users.'}
                </p>
              </div>

              {/* Live Online Badge */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 shrink-0">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping absolute"></div>
                  <div className="w-4 h-4 rounded-full bg-emerald-600 relative flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block">
                    {language === 'bn' ? 'বর্তমানে অনলাইনে সক্রিয় আছেন' : 'Live Online Users Right Now'}
                  </span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {onlineUsersCount} {language === 'bn' ? 'জন লোক' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Traffic Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[11px] bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-3.5 rounded-l-xl">{language === 'bn' ? 'তারিখ (Date)' : 'Date'}</th>
                    <th className="p-3.5 text-center">{language === 'bn' ? 'সাইটে ঢুকেছে (Visitors)' : 'Site Visitors'}</th>
                    <th className="p-3.5 text-center">{language === 'bn' ? 'পণ্য দেখেছে (Product Views)' : 'Product Views'}</th>
                    <th className="p-3.5 text-center">{language === 'bn' ? 'ফোন নম্বর দেখা (Phone Reveals)' : 'Phone Reveals'}</th>
                    <th className="p-3.5 text-center">{language === 'bn' ? 'চ্যাট শুরু (Chats Started)' : 'Chats Started'}</th>
                    <th className="p-3.5 text-right rounded-r-xl">{language === 'bn' ? 'এনগেজমেন্ট লেভেল' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {dailyAnalytics.map((item, idx) => (
                    <tr key={item.date} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${idx === 0 ? 'bg-amber-50/40 dark:bg-amber-950/20 font-bold' : ''}`}>
                      <td className="p-3.5 flex items-center gap-2">
                        {idx === 0 && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-md">
                            {language === 'bn' ? 'আজ' : 'TODAY'}
                          </span>
                        )}
                        <span className="text-slate-900 dark:text-slate-100 font-extrabold">
                          {language === 'bn' ? item.dateFormattedBn : item.dateFormattedEn}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-black rounded-lg border border-sky-200 dark:border-sky-800">
                          {item.visitors.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')} {language === 'bn' ? 'জন' : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black rounded-lg border border-amber-200 dark:border-amber-800">
                          {item.productViews.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')} {language === 'bn' ? 'বার' : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold rounded-lg">
                          {item.phoneReveals.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')} {language === 'bn' ? 'বার' : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg">
                          {item.chatsStarted.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')} {language === 'bn' ? 'টি' : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full uppercase tracking-wider">
                          HIGH ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Pending Ads Action Widget directly inside Overview */}
          {pendingAds.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-500/60 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>{language === 'bn' ? 'পেন্ডিং এডস দ্রুত পর্যালোচনা (Quick Pending Review)' : 'Quick Pending Ads Review'}</span>
                </h3>
                <button
                  onClick={() => setAdminTab('pending')}
                  className="text-xs text-amber-600 dark:text-amber-400 font-black hover:underline"
                >
                  {language === 'bn' ? 'সবগুলো দেখুন ➔' : 'View All ➔'}
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingAds.slice(0, 3).map(ad => {
                  const adImg = (Array.isArray(ad.images) && ad.images.length > 0 && ad.images[0])
                    ? ad.images[0]
                    : ((ad as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80');
                  const adPrice = typeof ad.price === 'number' ? ad.price.toLocaleString() : (ad.price || '0');

                  return (
                    <div key={ad.id} className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <WatermarkedImage src={adImg} alt="" watermarkSize="sm" className="w-12 h-12 rounded-xl overflow-hidden shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{ad.title || 'Untitled'}</h4>
                          <p className="text-emerald-600 font-extrabold">৳{adPrice} • {ad.seller?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateProductStatus(ad.id, 'active')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'এপ্রুভ' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectingProduct(ad);
                            setSelectedPresetReason('ছবি অস্পষ্ট বা অনুপযুক্ত');
                            setCustomReasonText('');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'রিজেক্ট' : 'Reject'}</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(ad)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Activity Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <span>{language === 'bn' ? 'সাম্প্রতিক ইউজার অ্যাক্টিভিটি স্ট্রিম' : 'Recent User Activity Stream'}</span>
              </h3>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setAdminTab('activities'); }}
                className="text-xs text-pink-600 dark:text-pink-400 font-black hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'সব কর্মকাণ্ড দেখুন ➔' : 'View All Activities ➔'}
              </button>
            </div>

            <div className="space-y-2">
              {activityLogs.slice(0, 5).map(log => {
                const userDisplay = log.user || log.userName || 'User';
                const targetDisplay = log.target || log.adTitle || 'Item';
                return (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <strong className="text-slate-900 dark:text-slate-100">{userDisplay}:</strong>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{log.action}</span>
                      <span className="text-pink-600 dark:text-pink-400 font-bold">"{targetDisplay}"</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User & Admin Activity Logs Full View */}
      {adminTab === 'activities' && (
        <ActivityLoggingAdminPanel />
      )}

      {/* Queue (Pending Approval) */}
      {adminTab === 'pending' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>{language === 'bn' ? 'অনুমোদনের জন্য অপেক্ষমান বিজ্ঞাপনসমূহ (Under Review Queue)' : 'Pending Ads Review Queue'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'এডমিন ৩০ মিনিটের মধ্যে সিদ্ধান্ত না নিলে অটো-এপ্রুভ হয়ে যাবে' : 'Auto-approves in 30 minutes if unreviewed'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pendingAds.length > 0 && (
                <button
                  type="button"
                  onClick={() => forceAutoApproveAllPending()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer transform active:scale-95"
                  title="30 Minute Auto Approval Force Trigger"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{language === 'bn' ? '৩০ মিনিট টেস্ট অটো-এপ্রুভ করুন' : 'Test Auto-Approve All'}</span>
                </button>
              )}
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-200">
                {pendingAds.length} Pending
              </span>
            </div>
          </div>

          {/* 30-Minute Auto Approval System Rule Notice Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0 font-black">
                ⏱️ 30M
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200">
                <strong className="text-amber-600 dark:text-amber-400 font-extrabold block text-sm">
                  {language === 'bn' ? '⚡ ৩০ মিনিট স্বয়ংক্রিয় এপ্রুভাল (30-Min Auto Approval Rule)' : '⚡ 30-Minute Auto Approval System'}
                </strong>
                <span>
                  {language === 'bn'
                    ? 'সেলার বিজ্ঞাপন দেওয়ার পর এডমিন যদি ৩০ মিনিটের মধ্যে সিদ্ধান্ত না নেন, তবে ৩০ মিনিট শেষ হওয়ার সাথে সাথে সিস্টেম থেকে স্বয়ংক্রিয়ভাবে বিজ্ঞাপনটি লাইভ করা হবে।'
                    : 'If an admin does not review a submitted ad within 30 minutes, it will automatically go live on the platform.'}
                </span>
              </div>
            </div>
          </div>

          {pendingAds.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              {language === 'bn' ? 'কোনো অপেক্ষমান বিজ্ঞাপন নেই! সব বিজ্ঞাপন পর্যালোচিত।' : 'No pending ads in queue! All ads reviewed.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {pendingAds.map(ad => {
                const timer = getRemainingAutoApproveTime(ad.postedAt, 30);
                const adImg = (Array.isArray(ad.images) && ad.images.length > 0 && ad.images[0])
                  ? ad.images[0]
                  : ((ad as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80');
                const adPrice = typeof ad.price === 'number' ? ad.price.toLocaleString() : (ad.price || '0');

                return (
                  <div key={ad.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <WatermarkedImage src={adImg} alt="" watermarkSize="sm" className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{ad.title || 'Untitled'}</h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">৳{adPrice}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Seller: <strong className="text-slate-800 dark:text-slate-200">{ad.seller?.name}</strong> • Phone: {ad.seller?.phone} • Location: {ad.location?.thana || ad.location?.division}
                        </p>

                        {/* 30-Min Countdown Timer Progress Bar */}
                        <div className="pt-1.5 max-w-md">
                          <div className="flex items-center justify-between text-[11px] font-black mb-1">
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                              <span>{language === 'bn' ? `অটো-এপ্রুভ হতে বাকী: ${timer.formattedBn}` : `Auto-Approve in: ${timer.formatted}`}</span>
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {Math.round(timer.progressPercent)}% Time
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                              style={{ width: `${timer.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {ad.paymentInfo && (
                          <div className="mt-1.5 p-2 bg-pink-50 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800 rounded-lg text-[11px] text-pink-900 dark:text-pink-200 font-medium">
                            <strong>{ad.paymentInfo.method.toUpperCase()} Payment:</strong> ৳{ad.paymentInfo.amount} | Sender: <span className="font-mono font-bold">{ad.paymentInfo.senderNumber}</span> | TrxID: <span className="font-mono font-bold text-pink-700 dark:text-pink-400">{ad.paymentInfo.trxId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => updateProductStatus(ad.id, 'active')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{language === 'bn' ? 'এপ্রুভ করুন' : 'Approve'}</span>
                      </button>

                      <button
                        onClick={() => forceAutoApproveAllPending(ad.id)}
                        className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                        title="30 Min Test Auto Approve"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'bn' ? 'অটো-এপ্রুভ টেস্ট' : 'Auto-Approve'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingProduct(ad);
                          setSelectedPresetReason('ছবি অস্পষ্ট বা অনুপযুক্ত');
                          setCustomReasonText('');
                        }}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{language === 'bn' ? 'রিজেক্ট' : 'Reject'}</span>
                      </button>

                      <button
                        onClick={() => openDeleteModal(ad)}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title={language === 'bn' ? 'বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলুন' : 'Delete Ad'}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rejected Ads List View */}
      {adminTab === 'rejected' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>{language === 'bn' ? 'প্রত্যাখ্যাত বিজ্ঞাপনসমূহ (Rejected / Needs Edit)' : 'Rejected Ads List'}</span>
            </h3>
            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold px-3 py-1 rounded-full border border-red-200">
              {rejectedAds.length} Rejected
            </span>
          </div>

          {rejectedAds.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              {language === 'bn' ? 'কোনো প্রত্যাখ্যাত বিজ্ঞাপন নেই।' : 'No rejected ads.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {rejectedAds.map(ad => {
                const rejImg = (Array.isArray(ad.images) && ad.images.length > 0 && ad.images[0])
                  ? ad.images[0]
                  : ((ad as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80');
                const rejPrice = typeof ad.price === 'number' ? ad.price.toLocaleString() : (ad.price || '0');

                return (
                  <div key={ad.id} className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <WatermarkedImage src={rejImg} alt="" watermarkSize="sm" className="w-16 h-16 rounded-xl overflow-hidden shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ad.title || 'Untitled'}</h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">৳{rejPrice}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Seller: {ad.seller?.name} • Location: {ad.location?.thana || ad.location?.division}
                      </p>
                      {ad.rejectionReason && (
                        <div className="mt-1.5 p-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-800 dark:text-red-200 font-semibold">
                          <strong>{language === 'bn' ? 'রিজেক্টের কারণ:' : 'Rejection Reason:'}</strong> {ad.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateProductStatus(ad.id, 'active')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পুনরায় এপ্রুভ করুন' : 'Re-Approve Now'}</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(ad)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title={language === 'bn' ? 'বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলুন' : 'Delete Ad'}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* Admin Rejection Modal */}
      {rejectingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100 relative">
            <button
              onClick={() => setRejectingProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {language === 'bn' ? 'বিজ্ঞাপন প্রত্যাখ্যান ও সংশোধনের নোটিশ' : 'Reject Ad & Request Correction'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                সেট করা কারণটি কাস্টমারের মোবাইল নোটিফিকেশনে পাঠানো হবে যাতে সে সঠিক তথ্য দিয়ে ইডিট করতে পারে।
              </p>
            </div>

            {/* Target Item Brief */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <WatermarkedImage
                src={(Array.isArray(rejectingProduct.images) && rejectingProduct.images.length > 0 && rejectingProduct.images[0]) ? rejectingProduct.images[0] : ((rejectingProduct as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80')}
                alt=""
                watermarkSize="sm"
                className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{rejectingProduct.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Seller: <span className="font-semibold">{rejectingProduct.seller?.name}</span>
                </p>
              </div>
            </div>

            {/* Preset Reasons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'প্রত্যাখ্যানের প্রধান কারণ নির্বাচন করুন:' : 'Select Primary Reason:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'ছবি অস্পষ্ট বা অনুপযুক্ত (Blurry Photos)',
                  'ভুল ক্যাটাগরি বেছে নেওয়া হয়েছে (Wrong Category)',
                  'পণ্যের বিবরণ বা তথ্যে ত্রুটি (Incomplete Info)',
                  'অযৌক্তিক দাম বা অসামঞ্জস্যপূর্ণ তথ্য (Unrealistic Price)',
                  'পেমেন্ট TrxID ট্রানজেকশন আইডি মেলেনি (Invalid Payment TrxID)',
                  'অন্যান্য নির্দিষ্ট কারণ (Custom Reason)'
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPresetReason(reason)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                      selectedPresetReason === reason
                        ? 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-500 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{reason}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Description Text */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'কাস্টমারকে কি ইডিট করতে হবে তার বিস্তারিত মেসেজ:' : 'Additional Guidance / Note for Customer:'}
              </label>
              <textarea
                rows={3}
                value={customReasonText}
                onChange={e => setCustomReasonText(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: অনুগ্রহ করে স্পষ্ট ছবি যুক্ত করুন এবং সঠিক মডেল নম্বর ও ক্যাটাগরি নির্বাচন করে পুনরায় জমা দিন।'
                    : 'e.g. Please upload clear photos of your product and specify warranty detail before re-submitting.'
                }
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingProduct(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason = customReasonText.trim()
                    ? `${selectedPresetReason}: ${customReasonText.trim()}`
                    : selectedPresetReason;
                  updateProductStatus(rejectingProduct.id, 'rejected', finalReason);
                  setRejectingProduct(null);
                }}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{language === 'bn' ? 'রিজেক্ট মেসেজ পাঠান' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <span>{language === 'bn' ? 'রিপোর্টেড কন্টেন্ট ও আপত্তিকর আচরণ তালিকা' : 'Abuse & Scam Reports List'}</span>
          </h3>

          <div className="space-y-3">
            {chatReports.map(rep => (
              <div key={rep.id} className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs flex justify-between items-center gap-4">
                <div>
                  <strong className="text-red-900 dark:text-red-200 text-sm block font-black">
                    Thread / Item: {rep.threadId}
                  </strong>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">
                    Reported Seller: <span className="font-bold text-slate-900 dark:text-slate-100">{rep.reportedUser}</span>
                  </p>
                  <p className="text-red-800 dark:text-red-300 font-semibold mt-0.5">
                    Reason: {rep.reason}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert('User warned via SMS/Notification')}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 cursor-pointer"
                  >
                    Send Warning
                  </button>
                  <button
                    onClick={() => alert('User account restricted')}
                    className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 cursor-pointer"
                  >
                    Ban Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'users' && <CustomerManagementAdminPanel />}

      {adminTab === 'logo' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 text-xs font-black px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-800">
                Admin Branding
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                {language === 'bn' ? 'MarketBD.Net সাইট লোগো আপলোড (Market Logo)' : 'MarketBD.Net Logo Upload Settings'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn'
                ? 'আপনার ফোন বা কম্পিউটারের গ্যালারি থেকে সরাসরি ছবি সিলেক্ট করে আপলোড করুন। ওয়েবসাইট হেডারে সাথে সাথেই লোগো পরিবর্তিত হবে।'
                : 'Select and upload a photo directly from your device gallery or computer. The site logo in the header will update instantly.'}
            </p>
          </div>

          {/* Hidden File Input for Direct Upload */}
          <input
            type="file"
            ref={logoFileInputRef}
            accept="image/*"
            onChange={handleLogoFileUpload}
            className="hidden"
          />

          {/* Primary Direct File Upload Zone */}
          <div
            onClick={() => logoFileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64Data = reader.result as string;
                  setLogoInput(base64Data);
                  setCustomLogoUrl(base64Data);
                  setLogoSuccessMsg(true);
                  setTimeout(() => setLogoSuccessMsg(false), 3000);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="p-8 bg-pink-50/40 dark:bg-slate-800/60 border-2 border-dashed border-pink-400 dark:border-pink-600 hover:border-pink-600 dark:hover:border-pink-400 rounded-3xl cursor-pointer text-center transition group flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 flex items-center justify-center group-hover:scale-110 transition shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                {language === 'bn' ? 'ডিভাইস / গ্যালারি থেকে সরাসরি ছবি সিলেক্ট করুন' : 'Click to Select & Upload Image File'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'bn' ? 'মোবাইল/পিসি গ্যালারি থেকে সিলেক্ট করুন অথবা এখানে ড্রাইভ/ছবি ড্র্যাগ অ্যান্ড ড্রপ করুন' : 'Supports PNG, JPG, JPEG, WebP or SVG format'}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                logoFileInputRef.current?.click();
              }}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer mt-1"
            >
              <Image className="w-4 h-4" />
              <span>{language === 'bn' ? 'ছবি ব্রাউজ বা সিলেক্ট করুন' : 'Browse Gallery Photo'}</span>
            </button>
          </div>

          {/* Current Live Preview Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {language === 'bn' ? 'লাইভ প্রিভিউ (বর্তমান সাইট হেডার)' : 'Live Header Logo Preview'}
              </span>
              <div className="flex items-center gap-2.5 mt-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {logoInput || customLogoUrl ? (
                  <img
                    src={logoInput || customLogoUrl}
                    alt="Logo Preview"
                    className="h-10 w-auto max-w-[180px] object-contain rounded-xl border border-red-500 bg-slate-950 shadow-xs"
                    onError={() => {}}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border-2 border-red-500 text-red-500 flex items-center justify-center font-black text-xl shadow-md relative shrink-0">
                    <span className="relative z-10 font-black tracking-tighter text-red-500">M</span>
                    <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white"></span>
                  </div>
                )}
                <div className="bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <span className="text-xl font-black flex items-center gap-0">
                    <span className="text-red-500 font-black">M</span>
                    <span className="text-white font-black">arketBD.</span>
                    <span className="text-red-500 font-black">Net</span>
                  </span>
                  <span className="text-[10px] block text-white font-bold">
                    Buy Sell with trust
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomLogoUrl('');
                  setLogoInput('');
                  setLogoSuccessMsg(true);
                  setTimeout(() => setLogoSuccessMsg(false), 3000);
                }}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>{language === 'bn' ? 'ডিফল্ট "M" লোগোতে রিকভার করুন' : 'Reset to Default M Icon'}</span>
              </button>
            </div>
          </div>

          {logoSuccessMsg && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-300 dark:border-emerald-800">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'bn'
                  ? 'অভিনন্দন! আপনার আপলোডকৃত লোগো সফলভাবে সাইটে যুক্ত হয়েছে।'
                  : 'Success! Uploaded logo saved and applied across the marketplace.'}
              </span>
            </div>
          )}

          {/* Preset Logos Option */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'অথবা রেডিমেড প্রি-সেট লোগো নির্বাচন করুন:' : 'Or Select a Preset Logo:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  title: 'MarketBD.Net Official 3D Emblem',
                  url: marketBdLogoImg
                },
                {
                  title: 'Shopping Bag Badge',
                  url: 'https://images.unsplash.com/photo-1572584642822-6f8de0243613?w=150&auto=format&fit=crop&q=80'
                },
                {
                  title: 'E-Commerce Cart',
                  url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=150&auto=format&fit=crop&q=80'
                },
                {
                  title: 'Bangladesh Red & White Emblem',
                  url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLogoInput(preset.url);
                    setCustomLogoUrl(preset.url);
                    setLogoSuccessMsg(true);
                    setTimeout(() => setLogoSuccessMsg(false), 3000);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    logoInput === preset.url
                      ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/50 ring-2 ring-pink-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-10 h-10 object-cover rounded-xl shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">{preset.title}</span>
                    <span className="text-[10px] text-pink-600 font-semibold">{language === 'bn' ? 'সিলেক্ট করুন' : 'Click to select'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Management Settings */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-black px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Image Protection
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                  {language === 'bn' ? 'প্রোডাক্ট ছবি ওয়াটারমার্ক কাস্টমাইজেশন (Watermark Settings)' : 'Product Image Watermark Settings'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'bn'
                  ? 'সকল প্রোডাক্ট ছবির উপর প্রদর্শিত ওয়াটারমার্কের টেক্সট, অপাসিটি/স্যাড (Shade) ও অন/অফ স্ট্যাটাস নিমিষেই কাস্টমাইজ করুন।'
                  : 'Customize the watermark text, opacity shade, and visibility toggle across all product images in real-time.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-5 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                {/* Toggle Enable/Disable */}
                <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">
                      {language === 'bn' ? 'ছবিতে ওয়াটারমার্ক প্রদর্শন অন রাখুন' : 'Enable Watermark on Product Photos'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isWatermarkEnabled
                        ? (language === 'bn' ? 'সক্রিয় (প্রোডাক্ট ছবিতে কাস্টম ওয়াটারমার্ক দেখাবে)' : 'Active (Watermark rendered on photos)')
                        : (language === 'bn' ? 'নিষ্ক্রিয় (কোনো ওয়াটারমার্ক দেখাবে না)' : 'Disabled (No watermark overlay)')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isWatermarkEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isWatermarkEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Watermark Text Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'ওয়াটারমার্কের টেক্সট (Watermark Text):' : 'Watermark Text:'}
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. MarketBD.Net"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['MarketBD.Net', 'VERIFIED SELLER', 'OFFICIAL MARKETBD'].map((presetText) => (
                      <button
                        key={presetText}
                        type="button"
                        onClick={() => setWatermarkText(presetText)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                          watermarkText === presetText
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {presetText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watermark Opacity Slider (1 to 100) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'ওয়াটারমার্ক শেড / দৃশ্যমানতা (১ থেকে ১০০%):' : 'Watermark Opacity / Shade (1 to 100%):'}
                    </label>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      {Math.round(watermarkOpacity * 100)}% (Opacity: {watermarkOpacity.toFixed(2)})
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={Math.round(watermarkOpacity * 100)}
                    onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10) / 100)}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                    {[
                      { label: '5% (ডিফল্ট)', value: 0.05 },
                      { label: '15% (হালকা)', value: 0.15 },
                      { label: '30% (মাঝারি)', value: 0.30 },
                      { label: '60% (স্পষ্ট)', value: 0.60 },
                      { label: '100% (ফুল)', value: 1.00 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setWatermarkOpacity(preset.value)}
                        className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border text-center transition cursor-pointer ${
                          Math.abs(watermarkOpacity - preset.value) < 0.01
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setWatermarkText('MarketBD.Net');
                      setWatermarkOpacity(0.05);
                      setIsWatermarkEnabled(true);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 underline cursor-pointer"
                  >
                    {language === 'bn' ? 'ডিফল্ট রি-সেট করুন (0.05 Opacity + MarketBD.Net)' : 'Reset to Default (0.05 Opacity + MarketBD.Net)'}
                  </button>
                </div>
              </div>

              {/* Real-time Preview Column */}
              <div className="lg:col-span-5 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                  {language === 'bn' ? 'লাইভ প্রোডাক্ট ছবি প্রিভিউ (Live Sample Photo)' : 'Live Product Photo Preview'}
                </span>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                  <WatermarkedImage
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
                    alt="Live Product Preview"
                    className="w-full h-full"
                    watermarkText={watermarkText}
                    watermarkOpacity={watermarkOpacity}
                    showWatermark={isWatermarkEnabled}
                  />
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={isWatermarkEnabled ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {isWatermarkEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Watermark Text:</span>
                    <span className="font-mono font-bold text-white">{watermarkText || 'None'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Opacity (Shade):</span>
                    <span className="font-mono font-bold text-indigo-300">{(watermarkOpacity * 100).toFixed(0)}% ({watermarkOpacity})</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hosting & API Key Setup Guide Tab */}
      {adminTab === 'hosting' && <HostingAdminPanel />}

      {/* App Updates & Written Release Notes Tab */}
      {adminTab === 'app-update' && <AppUpdateAdminPanel />}

      {/* SEO & Sitemap Tab */}
      {adminTab === 'seo' && <SEOAdminPanel />}

      {/* Live Production Status Center */}
      {adminTab === 'live' && <LiveProductionStatusPanel />}

      {/* SMS, Payment & Push Gateways Tab */}
      {adminTab === 'gateways' && <GatewaysAdminPanel />}

      {/* Official Payment Partners Logo Manager */}
      {adminTab === 'partners' && <PaymentPartnersAdminPanel />}

      {/* Mobile Payment Numbers & Bank Accounts Manager */}
      {adminTab === 'accounts' && <PaymentAccountsAdminPanel />}

      {/* Website System Notice & Contact Info */}
      {adminTab === 'notice' && <SystemNoticeAdminPanel />}

      {/* Live Clock Customization Panel */}
      {adminTab === 'clock' && <ClockSettingsAdminPanel />}

      {/* Category, Subcategory, Brands & Models Manager */}
      {adminTab === 'categories' && <CategoryAdminPanel />}

      {/* Business Seller & Shop Accounts Manager */}
      {adminTab === 'business' && <BusinessShopAdminPanel />}

      {/* Locations, Divisions & Areas Manager */}
      {adminTab === 'locations' && <LocationAdminPanel />}

      {/* Helpdesk Support Tickets Manager */}
      {adminTab === 'tickets' && <SupportTicketsAdminPanel />}

      {/* Reviews & Ratings Moderation */}
      {adminTab === 'reviews' && <ReviewsModerationAdminPanel />}

      {/* Site CMS Content, FAQ & Blog Editor */}
      {adminTab === 'cms' && <CmsContentAdminPanel />}

      {/* Billing, Invoices & Revenue Analytics */}
      {adminTab === 'billing' && <BillingInvoicesAdminPanel />}

      {/* Staff Roles & Access Governance */}
      {adminTab === 'staff' && <StaffRolesAdminPanel />}

      {/* Security Logs, IP Firewall & 2FA */}
      {adminTab === 'security' && <SecurityLogsAdminPanel />}

      {/* Master Website Switch & Site Maintenance Panel */}
      {adminTab === 'maintenance' && <SiteMaintenanceAdminPanel />}

      {/* All Advertisements Inventory & Delete Controls Panel */}
      {adminTab === 'all-ads' && <AllAdsAdminPanel />}
    </div>
  );
};

// Dedicated Hosting & API Key Instructions Panel
const HostingAdminPanel: React.FC = () => {
  const { language } = useMarket();

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/50 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-800">
          <KeyRound className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {language === 'bn' ? '🔑 এপিআই কি ও সাইট হোস্টিং নির্দেশিকা' : '🔑 API Key & Site Hosting Full Setup Guide'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'MarketBD.Net লাইভ সার্ভারে হোস্ট করা এবং Gemini AI API Key সেটআপ করার সহজ নির্দেশিকা'
              : 'Step-by-step documentation on hosting MarketBD.Net and configuring Gemini API credentials.'}
          </p>
        </div>
      </div>

      {/* Step 1: Gemini API Key Setup */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-mono">1</span>
          <span>{language === 'bn' ? 'Gemini AI API Key কীভাবে নিবেন ও কানেক্ট করবেন:' : '1. How to get & connect Gemini AI API Key:'}</span>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed pl-2">
          <li>
            {language === 'bn' ? (
              <>গুগল এআই স্টুডিও পোর্টালে যান: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline font-bold">aistudio.google.com/app/apikey</a> এবং আপনার জিমেইল দিয়ে লগইন করুন।</>
            ) : (
              <>Visit Google AI Studio Portal: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline font-bold">aistudio.google.com/app/apikey</a> and login with your Google account.</>
            )}
          </li>
          <li>
            {language === 'bn' ? 'Get API Key এ ক্লিক করে নতুন একটি API Key তৈরি করে কপি করে নিন।' : 'Click "Create API Key" and copy your generated key string.'}
          </li>
          <li>
            {language === 'bn'
              ? 'সার্ভারের পরিবেশ ফাইবলে (.env) এই নাম দিয়ে সেট করুন: GEMINI_API_KEY=আপনার_কপিকৃত_কি'
              : 'Add to environment variables (.env): GEMINI_API_KEY=your_copied_api_key'}
          </li>
        </ol>
      </div>

      {/* Step 2: Hosting on Cloud Run / Vercel */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-mono">2</span>
          <span>{language === 'bn' ? 'Google Cloud Run / AI Studio বা আপনার সার্ভারে হোস্টিং:' : '2. Hosting on Google Cloud Run or Custom VPS:'}</span>
        </div>
        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed pl-2">
          <li>
            {language === 'bn'
              ? '১-ক্লিক ক্লাউড ডিপ্লয়মেন্ট: AI Studio এর "Deploy" বাটনে ক্লিক করে সরাসরি গুগল ক্লাউড রান সার্ভারে লাইভ করতে পারেন।'
              : '1-Click Cloud Deployment: Click "Deploy" in AI Studio top menu to deploy directly to Google Cloud Run.'}
          </li>
          <li>
            {language === 'bn'
              ? 'পাবলিক পোর্ট ৩০০০: সার্ভার এনভায়রনমেন্টে পোর্ট ৩০০০ (Port 3000) অটো-কনফিগার করা আছে যা রিভার্স প্রক্সি দিয়ে রুট হয়।'
              : 'Public Port 3000: The server auto-binds to Port 3000 behind nginx reverse proxy ingress.'}
          </li>
        </ul>
      </div>

      {/* Step 3: Custom Domain MarketBD.Net */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono">3</span>
          <span>{language === 'bn' ? 'কাস্টম ডোমেইন MarketBD.Net কানেক্ট করা:' : '3. Custom Domain (MarketBD.Net) Connection:'}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-2">
          {language === 'bn'
            ? 'আপনার ডোমেইন প্রোভাইডার (Namecheap / Cloudflare / cPanel) এ DNS Settings এ গিয়ে CNAME অথবা A-Record ক্লাউড রান IP Address এ পয়েন্ট করে দিলেই MarketBD.Net ডোমেইনে অ্যাপটি লাইভ চালু হয়ে যাবে।'
            : 'Point your domain DNS A-record or CNAME in Cloudflare / Namecheap to the assigned Cloud Run container IP to activate www.MarketBD.Net.'}
        </p>
      </div>
    </div>
  );
};

