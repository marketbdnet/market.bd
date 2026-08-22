import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { UserProfileModal } from '../Auth/UserProfileModal';
import { LiveClockWidget } from '../Common/LiveClockWidget';
import {
  MapPin,
  Search,
  PlusCircle,
  Heart,
  MessageSquare,
  Sparkles,
  User,
  Globe,
  Mic,
  LayoutDashboard,
  Moon,
  Sun,
  Headphones,
  Home,
  LogOut,
  Menu,
  X,
  Smartphone,
  Download,
  Power,
  ShieldCheck,
  Tag,
  Briefcase,
  Car,
  Laptop,
  Tv,
  Layers,
  ChevronRight,
  HelpCircle,
  Flame,
  PhoneCall,
  Settings,
  Grid,
  Package
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    language,
    setLanguage,
    selectedLocation,
    setIsLocationModalOpen,
    wishlist,
    chatThreads,
    activeTab,
    setActiveTab,
    setIsAISearchOpen,
    userRole,
    filters,
    setFilters,
    isLoggedIn,
    currentUser,
    openAuthModal,
    logout,
    handlePostAdClick,
    isDarkMode,
    toggleDarkMode,
    openCustomerCare,
    openInstallAppModal,
    customLogoUrl,
    siteMaintenance,
    toggleSiteMaintenance
  } = useMarket();

  const [searchInput, setSearchInput] = useState('');

  const unreadChats = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      searchQuery: searchInput,
      category: '',
      subCategory: ''
    }));
    setActiveTab('search');
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      alert(language === 'bn' ? 'ভয়েস সার্চ মোড অন করা হয়েছে। কথা বলুন...' : 'Voice Search activated. Please speak...');
    } else {
      alert(language === 'bn' ? 'আপনার ব্রাউজারে ভয়েস ফিচার সাপোর্ট নেই।' : 'Voice search is not supported in this browser.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070d19] dark:bg-slate-950 text-white border-b border-emerald-500/30 dark:border-emerald-500/40 transition-colors shadow-xl w-full relative pt-[max(2px,env(safe-area-inset-top))]">
      {/* ================= DESKTOP & TABLET LAYOUT (Hidden on mobile < sm) ================= */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 py-1 sm:py-1.5 flex flex-col gap-1 sm:gap-1.5 relative z-20 w-full">
          {/* DESKTOP ROW 1: Brand Logo + Clock + Theme + Lang + Log In/Out + Sell / Post Ad + Menu */}
          <div className="flex items-center justify-between gap-1.5 w-full flex-wrap">
            {/* Brand Logo */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1.5 text-left group cursor-pointer shrink-0 select-none py-0"
              title="MarketBD.Net Home"
            >
              <div className="h-7.5 w-7.5 sm:h-8 sm:w-8 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg border border-white/80 shadow-sm bg-slate-900">
                <img
                  src={customLogoUrl || '/logo.jpg'}
                  alt="MarketBD.Net Logo"
                  className="w-full h-full object-cover shrink-0"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.jpg';
                  }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-tight drop-shadow-sm whitespace-nowrap">
                  <span className="text-red-500">M</span><span className="text-white">arketBD.</span><span className="text-red-500">Net</span>
                </span>
                <span className="text-[8px] sm:text-[9px] text-emerald-300/90 font-bold whitespace-nowrap">
                  {language === 'bn' ? 'বিশ্বস্ত মার্কেটপ্লেস' : 'Trusted Marketplace'}
                </span>
              </div>
            </button>

            {/* Controls: Live Clock, Theme, Lang, Log In/Out, Post Ad */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
              {/* Live Clock Widget */}
              <div className="shrink-0 flex items-center">
                <LiveClockWidget />
              </div>

              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="h-7.5 sm:h-8 px-2 sm:px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 hover:border-white transition cursor-pointer text-[11px] font-bold shrink-0 active:scale-95 shadow-sm flex items-center justify-center gap-1"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                <span className="hidden md:inline">{isDarkMode ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'ডার্ক' : 'Dark')}</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="h-7.5 sm:h-8 px-2 sm:px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 hover:border-white transition cursor-pointer text-[11px] font-black shrink-0 active:scale-95 shadow-sm flex items-center justify-center gap-1"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="text-amber-400">{language === 'bn' ? 'EN' : 'বাংলা'}</span>
              </button>

              {/* Log In/Out Button */}
              {isLoggedIn ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="h-7.5 sm:h-8 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 hover:border-white transition cursor-pointer text-[11px] font-bold shrink-0 active:scale-95 shadow-sm"
                  title={currentUser?.name || 'Account'}
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="inline max-w-[70px] sm:max-w-[100px] md:max-w-[120px] truncate">
                    {currentUser?.name || (userRole === 'admin' ? 'Admin' : (language === 'bn' ? 'প্রোফাইল' : 'Profile'))}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('general')}
                  className="h-7.5 sm:h-8 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 hover:border-white transition cursor-pointer text-[11px] font-bold shrink-0 active:scale-95 shadow-sm"
                  title="Log In/Out"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">{language === 'bn' ? 'লগ ইন/আউট' : 'Log In/Out'}</span>
                </button>
              )}

              {/* Prominent Sell / Post Ad Button */}
              <button
                onClick={handlePostAdClick}
                className="h-7.5 sm:h-8 flex items-center justify-center gap-1.5 px-3 sm:px-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-lg transition cursor-pointer text-xs shrink-0 shadow-md border border-white"
                title={language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন' : 'Sell / Post Ad'}
              >
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap font-black text-white">{language === 'bn' ? 'সেল / এড পোস্ট' : 'Sell / Post Ad'}</span>
              </button>

              {/* Menu Drawer Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-7.5 sm:h-8 px-2 sm:px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 hover:border-white transition cursor-pointer text-[11px] font-bold shrink-0 active:scale-95 shadow-sm flex items-center justify-center gap-1"
                title={language === 'bn' ? 'মেনু' : 'Menu'}
              >
                {isMobileMenuOpen ? <X className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Menu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span className="hidden sm:inline">{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              </button>
            </div>
          </div>

          {/* DESKTOP ROW 2: Search Bar */}
          <div className="w-full">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center"
            >
              <div className="relative w-full h-7.5 sm:h-8 bg-slate-900/90 border border-white/90 hover:border-white focus-within:border-white focus-within:ring-1 focus-within:ring-white/20 rounded-lg text-white transition px-2 sm:px-2.5 flex items-center shadow-inner overflow-hidden">
                <Search className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'কী খুঁজছেন? যেমন: iPhone, বাইক, কার, ফ্ল্যাট, ল্যাপটপ...'
                      : 'Search e.g. iPhone, Bike, Car, Flat, Laptop...'
                  }
                  className="w-full h-full text-[11px] sm:text-xs focus:outline-none text-white placeholder-slate-400 font-medium bg-transparent min-w-0"
                />

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition rounded cursor-pointer"
                    title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                  >
                    <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-2.5 sm:px-3 py-0.5 rounded-md transition text-[11px] sm:text-xs flex items-center gap-1 shrink-0 shadow-sm cursor-pointer h-6 sm:h-6.5 whitespace-nowrap border border-white"
                  >
                    {language === 'bn' ? 'খুঁজুন' : 'Search'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* DESKTOP Tier 2 Feature & Navigation Strip */}
        <nav className="bg-slate-950/95 border-t border-slate-800/90 px-2 sm:px-3 py-1 sm:py-1.5 relative z-20 backdrop-blur-md shadow-md w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-1.5 text-[11px] font-bold flex-wrap py-0">
            {/* Main Navigation Items */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap shrink-0 max-w-full">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 rounded-lg transition cursor-pointer text-[11px] font-bold border border-white/90 shrink-0 active:scale-95 whitespace-nowrap shadow-sm ${
                  activeTab === 'home'
                    ? 'bg-emerald-950/90 text-emerald-300 shadow-sm ring-1 ring-white/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
              </button>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: '' }));
                  setActiveTab('search');
                }}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 rounded-lg transition cursor-pointer text-[11px] font-bold border border-white/90 shrink-0 active:scale-95 whitespace-nowrap shadow-sm ${
                  activeTab === 'search' && !filters.category
                    ? 'bg-emerald-950/90 text-emerald-300 shadow-sm ring-1 ring-white/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Ads'}</span>
              </button>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 transition cursor-pointer text-[11px] font-bold shrink-0 active:scale-95 whitespace-nowrap shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-[130px] md:max-w-[160px]">
                  {selectedLocation.thana || selectedLocation.district || selectedLocation.division || (language === 'bn' ? 'সমগ্র বাংলাদেশ' : 'All Bangladesh')}
                </span>
              </button>

              <button
                onClick={openInstallAppModal}
                className="flex items-center justify-center gap-1 px-2 sm:px-2.5 h-7.5 sm:h-8 bg-slate-900 hover:bg-slate-800 text-emerald-200 rounded-lg border border-white/90 transition cursor-pointer text-[11px] font-black shrink-0 active:scale-95 shadow-sm whitespace-nowrap"
                title={language === 'bn' ? 'মার্কেটবিডি অ্যান্ড্রয়েড অ্যাপ ডাউনলোড' : 'Download Android App'}
              >
                <Smartphone className="w-3.5 h-3.5 text-yellow-300 animate-bounce shrink-0" />
                <span>{language === 'bn' ? 'অ্যাপ' : 'App'}</span>
                <span className="bg-yellow-400 text-slate-950 text-[8px] font-black px-1 py-0.2 rounded-full uppercase leading-none">
                  APK
                </span>
              </button>

              <button
                onClick={() => setIsAISearchOpen(true)}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-white/90 transition cursor-pointer text-[11px] font-extrabold shrink-0 active:scale-95 shadow-sm whitespace-nowrap"
                title="Ask AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <span>{language === 'bn' ? 'আস্ক AI' : 'Ask AI'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 rounded-lg transition cursor-pointer text-[11px] font-bold border border-white/90 shrink-0 active:scale-95 whitespace-nowrap shadow-sm relative ${
                  activeTab === 'chat'
                    ? 'bg-sky-950/90 text-sky-300 shadow-sm ring-1 ring-white/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
                title={language === 'bn' ? 'লাইভ চ্যাট ও ইনবক্স' : 'Live Chat & Inbox'}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{language === 'bn' ? 'চ্যাট' : 'Chat'}</span>
                {unreadChats > 0 && (
                  <span className="bg-pink-600 text-white font-black text-[8px] px-1 py-0.2 rounded-full leading-none shrink-0 animate-pulse">
                    {unreadChats}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 rounded-lg transition cursor-pointer text-[11px] font-bold border border-white/90 shrink-0 active:scale-95 whitespace-nowrap shadow-sm relative ${
                  activeTab === 'dashboard'
                    ? 'bg-pink-950/80 text-pink-300 shadow-sm ring-1 ring-white/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                }`}
                title={language === 'bn' ? 'পছন্দের তালিকা' : 'Saved Wishlist'}
              >
                <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{language === 'bn' ? 'পছন্দ' : 'Saved'}</span>
                {wishlist.length > 0 && (
                  <span className="bg-pink-600 text-white font-bold text-[8px] px-1 py-0.2 rounded-full leading-none shrink-0">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={openCustomerCare}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-white/90 transition cursor-pointer text-[11px] font-bold shrink-0 active:scale-95 whitespace-nowrap shadow-sm"
                title={language === 'bn' ? 'হেল্প ও কাস্টমার কেয়ার' : 'Help & Support'}
              >
                <Headphones className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{language === 'bn' ? 'হেল্প ২৪/৭' : 'Help 24/7'}</span>
              </button>
            </div>

            {/* Admin Controls */}
            {(userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.email === 'official.marketsbd@gmail.com' || currentUser?.email === 'official.marketbd@gmail.com') && (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                  }}
                  className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 rounded-lg transition cursor-pointer text-[11px] font-black border border-white/90 shrink-0 active:scale-95 whitespace-nowrap shadow-sm ${
                    siteMaintenance.isMasterLockdown
                      ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                      : siteMaintenance.isMaintenance
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title={language === 'bn' ? 'সাধারণ ও মাস্টার সুইচ কন্ট্রোল প্যানেল' : 'Site Switches Control'}
                >
                  <Power className="w-3 h-3" />
                  <span>
                    {siteMaintenance.isMasterLockdown
                      ? (language === 'bn' ? 'মাস্টার লক 🔒' : 'Master Lock 🔒')
                      : siteMaintenance.isMaintenance
                      ? (language === 'bn' ? 'সাধারণ সুইচ অফ 🟡' : 'Standard Maint 🟡')
                      : (language === 'bn' ? 'সাইট লাইভ 🟢' : 'Site Live 🟢')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 h-7.5 sm:h-8 rounded-lg transition cursor-pointer text-[11px] font-extrabold border border-white/90 shrink-0 active:scale-95 whitespace-nowrap shadow-sm ${
                    activeTab === 'admin'
                      ? 'bg-pink-950 text-pink-300 shadow-sm ring-1 ring-white/40'
                      : 'bg-pink-950/70 hover:bg-pink-900/80 text-pink-300'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>{language === 'bn' ? 'এডমিন 👑' : 'Admin 👑'}</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ================= MOBILE DEDICATED 5-ROW STRUCTURE (Shown ONLY on mobile < sm) ================= */}
      <div className="block sm:hidden px-2 py-1.5 space-y-1.5 w-full bg-[#070d19] dark:bg-slate-950">
        {/* MOBILE ROW 1: Logo + Live Clock (Favorite Clock Always Visible!) */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 text-left group cursor-pointer shrink-0 select-none"
            title="MarketBD.Net Home"
          >
            <div className="h-7 w-7 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-md border border-white/80 shadow-sm bg-slate-900">
              <img
                src={customLogoUrl || '/logo.jpg'}
                alt="MarketBD.Net Logo"
                className="w-full h-full object-cover shrink-0"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight drop-shadow-sm whitespace-nowrap">
                <span className="text-red-500">M</span><span className="text-white">arketBD.</span><span className="text-red-500">Net</span>
              </span>
              <span className="text-[7.5px] text-emerald-300/90 font-bold whitespace-nowrap mt-0.5">
                {language === 'bn' ? 'বিশ্বস্ত মার্কেটপ্লেস' : 'Trusted Market'}
              </span>
            </div>
          </button>

          {/* Favorite Live Clock Widget - Prominent on Mobile */}
          <div className="shrink-0 flex items-center scale-95 origin-right">
            <LiveClockWidget />
          </div>
        </div>

        {/* MOBILE ROW 2: Theme + Lang + Log In/Out + Sell / Post Ad + Menu Drawer */}
        <div className="grid grid-cols-5 gap-1 w-full items-center">
          {/* 1. Dark/Light Mode */}
          <button
            onClick={toggleDarkMode}
            className="h-7 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-bold shrink-0 active:scale-95 shadow-sm flex items-center justify-center gap-0.5"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3 h-3 text-amber-400 shrink-0" /> : <Moon className="w-3 h-3 text-sky-400 shrink-0" />}
            <span className="text-[9px]">{isDarkMode ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'ডার্ক' : 'Dark')}</span>
          </button>

          {/* 2. Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="h-7 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-black shrink-0 active:scale-95 shadow-sm flex items-center justify-center gap-0.5"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-pink-400 shrink-0" />
            <span className="text-[8.5px] text-amber-400 font-bold whitespace-nowrap">{language === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* 3. Log In/Out */}
          {isLoggedIn ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="h-7 flex items-center justify-center gap-0.5 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-bold shrink-0 active:scale-95 shadow-sm"
              title={currentUser?.name || 'Account'}
            >
              <User className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[9px] truncate max-w-[38px]">
                {currentUser?.name || (language === 'bn' ? 'ইউজার' : 'User')}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('general')}
              className="h-7 flex items-center justify-center gap-0.5 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-bold shrink-0 active:scale-95 shadow-sm"
              title="Log In/Out"
            >
              <User className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[9px] whitespace-nowrap">{language === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          )}

          {/* 4. Sell / Post Ad */}
          <button
            onClick={handlePostAdClick}
            className="h-7 flex items-center justify-center gap-0.5 px-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-md transition cursor-pointer text-[10px] shrink-0 shadow-md border border-white"
            title={language === 'bn' ? 'বিজ্ঞাপন দিন' : 'Post Ad'}
          >
            <PlusCircle className="w-3 h-3 text-white shrink-0 stroke-[2.5]" />
            <span className="text-[9px] whitespace-nowrap font-black text-white">{language === 'bn' ? 'এড দিন' : 'Post Ad'}</span>
          </button>

          {/* 5. Menu Drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-7 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-bold shrink-0 active:scale-95 shadow-sm flex items-center justify-center gap-0.5"
            title={language === 'bn' ? 'মেনু' : 'Menu'}
          >
            {isMobileMenuOpen ? <X className="w-3 h-3 text-emerald-400 shrink-0" /> : <Menu className="w-3 h-3 text-emerald-400 shrink-0" />}
            <span className="text-[9px]">{language === 'bn' ? 'মেনু' : 'Menu'}</span>
          </button>
        </div>

        {/* MOBILE ROW 3: Compact Search Bar with Voice and Submit */}
        <div className="w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative flex items-center"
          >
            <div className="relative w-full h-7 bg-slate-900/95 border border-white/90 focus-within:border-white rounded-md text-white transition px-2 flex items-center shadow-inner overflow-hidden">
              <Search className="w-3 h-3 text-emerald-400 mr-1 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'কী খুঁজছেন? যেমন: iPhone, বাইক, ল্যাপটপ...'
                    : 'Search iPhone, Bike, Laptop...'
                }
                className="w-full h-full text-[10.5px] focus:outline-none text-white placeholder-slate-400 font-medium bg-transparent min-w-0"
              />

              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className="p-0.5 text-slate-400 hover:text-emerald-400 transition rounded cursor-pointer"
                  title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                >
                  <Mic className="w-3 h-3" />
                </button>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-2 py-0.5 rounded transition text-[10px] flex items-center gap-0.5 shrink-0 shadow-sm cursor-pointer h-5.5 whitespace-nowrap border border-white/80"
                >
                  {language === 'bn' ? 'খুঁজুন' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* MOBILE ROW 4: Home + All Ads + Location */}
        <div className="grid grid-cols-3 gap-1.5 w-full items-center">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center justify-center gap-1 h-7 rounded-md transition cursor-pointer text-[10px] font-bold border border-white/80 shrink-0 active:scale-95 whitespace-nowrap shadow-sm px-1 ${
              activeTab === 'home'
                ? 'bg-emerald-950 text-emerald-300 ring-1 ring-white/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Home className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{language === 'bn' ? 'হোম' : 'Home'}</span>
          </button>

          {/* 2. All Ads */}
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, category: '' }));
              setActiveTab('search');
            }}
            className={`flex items-center justify-center gap-1 h-7 rounded-md transition cursor-pointer text-[10px] font-bold border border-white/80 shrink-0 active:scale-95 whitespace-nowrap shadow-sm px-1 ${
              activeTab === 'search' && !filters.category
                ? 'bg-emerald-950 text-emerald-300 ring-1 ring-white/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Search className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{language === 'bn' ? 'সব এড' : 'All Ads'}</span>
          </button>

          {/* 3. Location */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center justify-center gap-1 h-7 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-bold shrink-0 active:scale-95 whitespace-nowrap shadow-sm px-1"
            title="Location"
          >
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[65px]">
              {selectedLocation.district || selectedLocation.division || (language === 'bn' ? 'লোকেশন' : 'City')}
            </span>
          </button>
        </div>

        {/* MOBILE ROW 5: Ask AI + Chat + Saved + Help 24/7 (and Admin if authorized) */}
        <div className={`grid ${(userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.email === 'official.marketsbd@gmail.com' || currentUser?.email === 'official.marketbd@gmail.com') ? 'grid-cols-5' : 'grid-cols-4'} gap-1 w-full items-center`}>
          {/* 1. Ask AI */}
          <button
            onClick={() => setIsAISearchOpen(true)}
            className="flex items-center justify-center gap-0.5 h-7 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-extrabold shrink-0 active:scale-95 shadow-sm whitespace-nowrap px-1"
            title="Ask AI"
          >
            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
            <span>AI</span>
          </button>

          {/* 2. Chat */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center gap-0.5 h-7 rounded-md transition cursor-pointer text-[10px] font-bold border border-white/80 shrink-0 active:scale-95 whitespace-nowrap shadow-sm px-1 relative ${
              activeTab === 'chat'
                ? 'bg-sky-950 text-sky-300 ring-1 ring-white/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
            }`}
            title={language === 'bn' ? 'চ্যাট' : 'Chat'}
          >
            <MessageSquare className="w-3 h-3 text-sky-400 shrink-0" />
            <span>{language === 'bn' ? 'চ্যাট' : 'Chat'}</span>
            {unreadChats > 0 && (
              <span className="bg-pink-600 text-white font-black text-[7px] px-1 py-0.2 rounded-full leading-none shrink-0 animate-pulse">
                {unreadChats}
              </span>
            )}
          </button>

          {/* 3. Saved */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center justify-center gap-0.5 h-7 rounded-md transition cursor-pointer text-[10px] font-bold border border-white/80 shrink-0 active:scale-95 whitespace-nowrap shadow-sm px-1 relative ${
              activeTab === 'dashboard'
                ? 'bg-pink-950 text-pink-300 ring-1 ring-white/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
            }`}
            title={language === 'bn' ? 'পছন্দ' : 'Saved'}
          >
            <Heart className="w-3 h-3 text-red-400 shrink-0" />
            <span>{language === 'bn' ? 'পছন্দ' : 'Saved'}</span>
            {wishlist.length > 0 && (
              <span className="bg-pink-600 text-white font-bold text-[7px] px-1 py-0.2 rounded-full leading-none shrink-0">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* 4. Help 24/7 */}
          <button
            onClick={openCustomerCare}
            className="flex items-center justify-center gap-0.5 h-7 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md border border-white/80 transition cursor-pointer text-[10px] font-bold shrink-0 active:scale-95 whitespace-nowrap px-1"
            title={language === 'bn' ? 'হেল্প' : 'Help'}
          >
            <Headphones className="w-3 h-3 text-sky-400 shrink-0" />
            <span>{language === 'bn' ? 'হেল্প' : 'Help'}</span>
          </button>

          {/* 5. Admin (if authorized) */}
          {(userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.email === 'official.marketsbd@gmail.com' || currentUser?.email === 'official.marketbd@gmail.com') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center justify-center gap-0.5 h-7 rounded-md transition cursor-pointer text-[10px] font-extrabold border border-white/80 shrink-0 active:scale-95 whitespace-nowrap shadow-sm px-1 ${
                activeTab === 'admin'
                  ? 'bg-pink-950 text-pink-300 ring-1 ring-white/50'
                  : 'bg-pink-950/80 text-pink-300'
              }`}
              title="Admin Panel"
            >
              <LayoutDashboard className="w-3 h-3 text-pink-400 shrink-0" />
              <span>{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Comprehensive Drawer Menu (Accessible on Mobile, Tablet & Desktop when user clicks Menu button) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          {/* Backdrop click area */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Menu"
          />

          <div className="w-[88vw] max-w-sm sm:max-w-md bg-slate-900 text-white h-full p-4 flex flex-col justify-between shadow-2xl border-l border-slate-700 overflow-y-auto z-10">
            <div className="space-y-4">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-500 shadow-md">
                    <img src={customLogoUrl || '/logo.jpg'} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white flex items-center gap-1">
                      <span className="text-red-500">M</span>arketBD.<span className="text-red-500">Net</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                        {language === 'bn' ? 'মেনু' : 'Menu'}
                      </span>
                    </span>
                    <p className="text-[9px] text-slate-400">
                      {language === 'bn' ? 'বাংলাদেশের বিশ্বস্ত ক্রয়-বিক্রয় মাধ্যম' : "Bangladesh's Trusted Marketplace"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer active:scale-95"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. User profile / Auth section in drawer */}
              <div className="p-3 bg-gradient-to-r from-slate-800/90 to-slate-800/60 rounded-2xl border border-slate-700 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/40 shadow-inner">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white truncate max-w-[140px]">
                      {isLoggedIn ? (currentUser?.name || (userRole === 'admin' ? 'Admin' : 'User')) : (language === 'bn' ? 'গেস্ট ইউজার' : 'Guest User')}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {isLoggedIn ? (currentUser?.email || currentUser?.phone || 'Verified User') : (language === 'bn' ? 'লগইন করে সব সুবিধা নিন' : 'Login to explore')}
                    </p>
                  </div>
                </div>

                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
                  >
                    {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('general');
                    }}
                    className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
                  >
                    {language === 'bn' ? 'লগ ইন / সাইন আপ' : 'Login / Sign Up'}
                  </button>
                )}
              </div>

              {/* 2. Prominent Post Free Ad / Sell Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handlePostAdClick();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm border-2 border-red-400/80 shadow-lg transition cursor-pointer active:scale-98"
              >
                <span className="flex items-center gap-2.5">
                  <PlusCircle className="w-5 h-5 text-white stroke-[2.5]" />
                  <span className="text-white text-sm font-black">{language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন (ফ্রি)' : 'Post Free Ad / Sell'}</span>
                </span>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {language === 'bn' ? 'ফ্রি' : 'Free'}
                </span>
              </button>

              {/* 3. Primary Menu Navigation Links */}
              <div className="space-y-1">
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>{language === 'bn' ? 'মূল মেনু ও সেবা' : 'Core Navigation'}</span>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab('home');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'হোম পেজ' : 'Home Page'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setFilters(prev => ({ ...prev, category: '' }));
                    setActiveTab('search');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'সব বিজ্ঞাপন দেখুন' : 'All Classified Ads'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLocationModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'লোকেশন নির্বাচন ও শহর' : 'Change Location / City'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30 truncate max-w-[100px]">
                    {selectedLocation.district || selectedLocation.division || (language === 'bn' ? 'সমগ্র বাংলাদেশ' : 'All BD')}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAISearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'আস্ক এআই (AI সার্চ সহকারী)' : 'Ask AI Search Assistant'}</span>
                  </span>
                  <span className="text-[9px] bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                    AI Smart
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab('chat');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <MessageSquare className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'লাইভ চ্যাট ও ইনবক্স' : 'Live Chat & Inbox'}</span>
                  </span>
                  {unreadChats > 0 ? (
                    <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                      {unreadChats} {language === 'bn' ? 'নতুন' : 'new'}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isLoggedIn) {
                      setIsProfileModalOpen(true);
                    } else {
                      openAuthModal('general');
                    }
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group bg-pink-950/40 border border-pink-500/30"
                >
                  <span className="flex items-center gap-2.5 text-xs font-black text-pink-300">
                    <Package className="w-4 h-4 text-pink-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'মাই এড (আমার বিজ্ঞাপন ও এডিট)' : 'My Ads & Listings'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab('dashboard');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <Heart className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'পছন্দের তালিকা (Wishlist)' : 'Saved Ads / Wishlist'}</span>
                  </span>
                  {wishlist.length > 0 ? (
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      {wishlist.length}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              </div>

              {/* 4. Popular Category Quick Jump Grid */}
              <div className="space-y-1.5">
                <div className="px-2 pt-2 pb-0.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-3 h-3 text-amber-400" />
                  <span>{language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি ব্রাউজ' : 'Popular Categories'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setFilters(prev => ({ ...prev, category: 'mobiles', subCategory: '' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'মোবাইল ও গ্যাজেট' : 'Mobiles'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setFilters(prev => ({ ...prev, category: 'vehicles', subCategory: '' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Car className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'ভিহিকল/কার' : 'Vehicles / Cars'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setFilters(prev => ({ ...prev, category: 'property', subCategory: '' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'প্রোপার্টি ও ফ্ল্যাট' : 'Property'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setFilters(prev => ({ ...prev, category: 'electronics', subCategory: '' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Tv className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'ইলেকট্রনিক্স ও টিভি' : 'Electronics'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setFilters(prev => ({ ...prev, category: 'computers', subCategory: '' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Laptop className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'ল্যাপটপ ও আইটি' : 'Computers'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setFilters(prev => ({ ...prev, category: 'jobs', subCategory: '' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'চাকরি ও ক্যারিয়ার' : 'Jobs'}</span>
                  </button>
                </div>
              </div>

              {/* 5. Android App Download Banner Card */}
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openInstallAppModal();
                }}
                className="p-3 bg-gradient-to-br from-emerald-950/90 via-teal-900/80 to-slate-900 border-2 border-emerald-500/70 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer hover:border-emerald-400 transition shadow-lg group active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                    <Smartphone className="w-5 h-5 animate-bounce text-slate-950" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-white">MarketBD App</span>
                      <span className="bg-emerald-500 text-slate-950 text-[8.5px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        Android APK
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-300 font-bold mt-0.5">
                      {language === 'bn' ? '📲 ফ্রিতে অ্যাপ ডাউনলোড ও ইনস্টল' : '📲 Install Free Mobile App'}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white p-2 rounded-xl shrink-0 shadow-md">
                  <Download className="w-4 h-4" />
                </div>
              </div>

              {/* 6. Help, Safety & Support */}
              <div className="space-y-1">
                <div className="px-2 pt-2 pb-0.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3 text-sky-400" />
                  <span>{language === 'bn' ? 'সাপোর্ট ও নিরাপত্তা' : 'Help & Safety'}</span>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openCustomerCare();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <Headphones className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? '২৪/৭ কাস্টমার কেয়ার ও হেল্প' : 'Customer Support & Help'}</span>
                  </span>
                  <span className="text-[10px] text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
                    24/7 Live
                  </span>
                </button>

                <a
                  href="https://wa.me/8801533830784"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold">
                    <PhoneCall className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span>{language === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপ সাপোর্ট' : 'WhatsApp Support Hotline'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    01533830784 (Helpline 24/7)
                  </span>
                </a>
              </div>

              {/* 7. Theme & Language Controls */}
              <div className="space-y-1.5 pt-1">
                <div className="px-2 pb-0.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3 h-3 text-purple-400" />
                  <span>{language === 'bn' ? 'সেটিংস ও কন্ট্রোল' : 'Settings & Preferences'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  <button
                    onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
                  >
                    <Globe className="w-4 h-4 text-pink-500" />
                    <span className="text-amber-400">{language === 'bn' ? 'English' : 'বাংলা'}</span>
                  </button>
                </div>

                {/* Admin and Master Switch (if authorized) */}
                {(userRole === 'admin' || currentUser?.role === 'admin') && (
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveTab('admin');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-700 text-pink-300 font-bold transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 text-xs font-black">
                        <LayoutDashboard className="w-4 h-4 text-pink-400" />
                        <span>{language === 'bn' ? 'এডমিন কন্ট্রোল প্যানেল 👑' : 'Admin Control Panel 👑'}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-pink-400" />
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveTab('admin');
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                        siteMaintenance.isMasterLockdown
                          ? 'bg-red-950/80 border-red-600 text-red-300 animate-pulse'
                          : siteMaintenance.isMaintenance
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                          : 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Power className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'সুইচ কন্ট্রোল (Dual Switches)' : 'Site Switches'}</span>
                      </span>
                      <span className="text-[10px] font-black">
                        {siteMaintenance.isMasterLockdown
                          ? (language === 'bn' ? 'মাস্টার লক 🔒' : 'Master Lock 🔒')
                          : siteMaintenance.isMaintenance
                          ? (language === 'bn' ? 'সাধারণ সুইচ অফ 🟡' : 'Standard Maint 🟡')
                          : (language === 'bn' ? 'সাইট লাইভ 🟢' : 'Site Live 🟢')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer & Logout */}
            <div className="pt-4 mt-4 border-t border-slate-800 text-center space-y-2">
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold text-xs rounded-xl border border-red-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লগআউট করুন' : 'Log Out'}</span>
                </button>
              )}
              <p className="text-[10px] text-slate-500">
                MarketBD.Net © {new Date().getFullYear()} • Bangladesh's Trusted Platform
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] px-3 flex items-center justify-between shadow-2xl md:hidden text-[10px] font-bold">
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        {/* All Ads */}
        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, category: '' }));
            setActiveTab('search');
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'search' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Ads'}</span>
        </button>

        {/* Sell / Post Ad (Center Highlighted Floating Emerald Circle) */}
        <button
          onClick={handlePostAdClick}
          className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-12 h-12 rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition active:scale-95 cursor-pointer shrink-0"
          title="Post Free Ad"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Chat / Support */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
            activeTab === 'chat' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{language === 'bn' ? 'চ্যাট' : 'Chat'}</span>
          {unreadChats > 0 && (
            <span className="absolute -top-1 right-0 bg-emerald-600 text-white font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {unreadChats}
            </span>
          )}
        </button>

        {/* Admin Panel (ONLY Visible if user is logged in as Admin) */}
        {(userRole === 'admin' || currentUser?.role === 'admin') && (
          <button
            onClick={() => {
              setActiveTab('admin');
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'admin' ? 'text-pink-500 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-pink-400'
            }`}
            title="Admin Panel"
          >
            <LayoutDashboard className="w-4 h-4 text-pink-500" />
            <span className="text-[9px] font-black text-pink-500">{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
          </button>
        )}

        {/* Account / Profile Modal Trigger */}
        <button
          onClick={() => (isLoggedIn ? setIsProfileModalOpen(true) : openAuthModal('general'))}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isLoggedIn ? (language === 'bn' ? 'প্রোফাইল' : 'Profile') : (language === 'bn' ? 'লগ ইন/আউট' : 'Login/Out')}</span>
        </button>
      </div>

      {/* Global User Profile Edit & Deactivate Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};

