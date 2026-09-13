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
    customLogoUrl,
    siteMaintenance,
    toggleSiteMaintenance
  } = useMarket();

  const [searchInput, setSearchInput] = useState('');

  const unreadChats = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);
  const isAdmin = Boolean(isLoggedIn && (userRole === 'admin' || currentUser?.role === 'admin'));

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
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-md w-full relative pt-[max(2px,env(safe-area-inset-top))] backdrop-blur-md">
      {/* ================= DESKTOP & TABLET LAYOUT (Hidden on mobile & tablet < lg) ================= */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 py-1 sm:py-1.5 flex flex-col gap-1 sm:gap-1.5 relative z-20 w-full">
          {/* DESKTOP ROW 1: Brand Logo (Left) + Clock & Date/Month (Center) + Controls (Right) */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full flex-wrap">
            {/* Brand Logo */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1.5 text-left group cursor-pointer shrink-0 select-none py-0"
              title="MarketBD.Net Home"
            >
              <div className="h-7.5 w-7.5 sm:h-8 sm:w-8 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
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
                  <span className="text-red-600">M</span><span className="text-slate-900 dark:text-white">arketBD.</span><span className="text-red-600">Net</span>
                </span>
                <span className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                  {language === 'bn' ? 'বিশ্বস্ত মার্কেটপ্লেস' : 'Trusted Marketplace'}
                </span>
              </div>
            </button>

            {/* Navbar Center: Live Clock and Date/Month Widget */}
            <div className="flex-1 flex items-center justify-center px-1 sm:px-2 min-w-0">
              <LiveClockWidget />
            </div>

            {/* Controls: Theme, Lang, Log In/Out, Post Ad */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="liquid-btn h-8 sm:h-8.5 px-3 cursor-pointer text-xs font-black shrink-0 flex items-center justify-center gap-1.5"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 shrink-0 drop-shadow-sm" /> : <Moon className="w-4 h-4 text-sky-500 shrink-0 drop-shadow-sm" />}
                <span className="hidden md:inline">{isDarkMode ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'ডার্ক' : 'Dark')}</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="liquid-btn h-8 sm:h-8.5 px-3 cursor-pointer text-xs font-black shrink-0 flex items-center justify-center gap-1.5"
                title="Switch Language"
              >
                <Globe className="w-4 h-4 text-pink-500 shrink-0 drop-shadow-sm" />
                <span className="text-amber-700 dark:text-amber-400 font-black">{language === 'bn' ? 'EN' : 'বাংলা'}</span>
              </button>

              {/* Log In/Out Button */}
              {isLoggedIn ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="liquid-btn h-8 sm:h-8.5 flex items-center justify-center gap-1.5 px-3 cursor-pointer text-xs font-black shrink-0"
                    title={currentUser?.name || 'Account'}
                  >
                    <User className="w-4 h-4 text-emerald-600 shrink-0 drop-shadow-sm" />
                    <span className="inline max-w-[85px] sm:max-w-[110px] md:max-w-[130px] truncate">
                      {currentUser?.name || (userRole === 'admin' ? 'Admin' : (language === 'bn' ? 'প্রোফাইল' : 'Profile'))}
                    </span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="liquid-btn h-8 sm:h-8.5 flex items-center justify-center gap-1 px-2.5 cursor-pointer text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition shrink-0"
                    title={language === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট করুন' : 'Log Out of Account'}
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="hidden xl:inline">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('general')}
                  className="liquid-btn h-8 sm:h-8.5 flex items-center justify-center gap-1.5 px-3.5 cursor-pointer text-xs font-black shrink-0"
                  title="Log In/Out"
                >
                  <User className="w-4 h-4 text-emerald-600 shrink-0 drop-shadow-sm" />
                  <span className="whitespace-nowrap">{language === 'bn' ? 'লগ ইন/আউট' : 'Log In/Out'}</span>
                </button>
              )}

              {/* Prominent Sell / Post Ad Button */}
              <button
                onClick={handlePostAdClick}
                className="liquid-btn liquid-btn-red live-beacon-pulse h-8 sm:h-8.5 flex items-center justify-center gap-1.5 px-3.5 sm:px-4 text-white font-black cursor-pointer text-xs sm:text-[13px] shrink-0"
                title={language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন' : 'Sell / Post Ad'}
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
                </span>
                <PlusCircle className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap font-black text-white">{language === 'bn' ? 'সেল / এড পোস্ট' : 'Sell / Post Ad'}</span>
              </button>

              {/* Menu Drawer Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="liquid-btn h-8 sm:h-8.5 px-3 cursor-pointer text-xs font-black shrink-0 flex items-center justify-center gap-1.5"
                title={language === 'bn' ? 'মেনু' : 'Menu'}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 text-emerald-600 shrink-0" /> : <Menu className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span className="hidden sm:inline">{language === 'bn' ? 'মেনু' : 'Menu'}</span>
              </button>
            </div>
          </div>

        {/* DESKTOP Tier 2 Feature & Navigation Strip */}
        <nav className="bg-slate-50/95 dark:bg-slate-800/95 border-t border-slate-200 dark:border-slate-700 px-2 sm:px-3 py-1 sm:py-1.5 relative z-20 backdrop-blur-md shadow-sm w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-1.5 text-[11px] font-bold flex-wrap py-0">
            {/* Main Navigation Items */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap shrink-0 max-w-full">
              <button
                onClick={() => setActiveTab('home')}
                className={`liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap ${
                  activeTab === 'home'
                    ? 'liquid-btn-active'
                    : ''
                }`}
              >
                <Home className="w-4 h-4 text-emerald-600 shrink-0 drop-shadow-sm" />
                <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
              </button>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: '' }));
                  setActiveTab('search');
                }}
                className={`liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap ${
                  activeTab === 'search' && !filters.category
                    ? 'liquid-btn-active'
                    : ''
                }`}
              >
                <Search className="w-4 h-4 text-amber-600 shrink-0 drop-shadow-sm" />
                <span>{language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Ads'}</span>
              </button>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap"
                title="Location"
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 drop-shadow-sm" />
                <span className="truncate max-w-[108px]">
                  {selectedLocation.thana || selectedLocation.district || selectedLocation.division || (language === 'bn' ? 'সমগ্র বাংলাদেশ' : 'All Bangladesh')}
                </span>
              </button>

              <button
                onClick={() => setIsAISearchOpen(true)}
                className="liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap"
                title="Ask AI"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse drop-shadow-sm" />
                <span>{language === 'bn' ? 'আস্ক AI' : 'Ask AI'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap relative ${
                  activeTab === 'chat'
                    ? 'liquid-btn-active-sky'
                    : ''
                }`}
                title={language === 'bn' ? 'লাইভ চ্যাট ও ইনবক্স' : 'Live Chat & Inbox'}
              >
                <MessageSquare className="w-4 h-4 text-sky-600 shrink-0 drop-shadow-sm" />
                <span>{language === 'bn' ? 'চ্যাট' : 'Chat'}</span>
                {unreadChats > 0 && (
                  <span className="bg-pink-600 text-white font-black text-[8.5px] px-1.5 py-0.2 rounded-full leading-none shrink-0 animate-pulse shadow-sm">
                    {unreadChats}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap relative ${
                  activeTab === 'dashboard'
                    ? 'liquid-btn-active-pink'
                    : ''
                }`}
                title={language === 'bn' ? 'পছন্দের তালিকা' : 'Saved Wishlist'}
              >
                <Heart className="w-4 h-4 text-red-500 shrink-0 drop-shadow-sm" />
                <span>{language === 'bn' ? 'পছন্দ' : 'Saved'}</span>
                {wishlist.length > 0 && (
                  <span className="bg-pink-600 text-white font-bold text-[8.5px] px-1.5 py-0.2 rounded-full leading-none shrink-0 shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Admin Controls (Shown only to verified logged in Admin) */}
            {isAdmin && (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                  }}
                  className={`liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap ${
                    siteMaintenance.isMasterLockdown
                      ? 'liquid-btn-red animate-pulse'
                      : siteMaintenance.isMaintenance
                      ? 'bg-amber-600/90 text-white border-white/70 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)]'
                      : 'liquid-btn-emerald'
                  }`}
                  title={language === 'bn' ? 'সাধারণ ও মাস্টার সুইচ কন্ট্রোল প্যানেল' : 'Site Switches Control'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {siteMaintenance.isMasterLockdown
                      ? (language === 'bn' ? 'মাস্টার লক 🔒' : 'Master Lock 🔒')
                      : siteMaintenance.isMaintenance
                      ? (language === 'bn' ? 'মেইনটেন্যান্স 🟡' : 'Maintenance 🟡')
                      : (language === 'bn' ? 'সাইট লাইভ 🟢' : 'Site Live 🟢')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`liquid-btn flex items-center justify-center gap-1.5 w-[140px] sm:w-[146px] h-8 sm:h-8.5 cursor-pointer text-xs sm:text-[12.5px] font-black shrink-0 whitespace-nowrap ${
                    activeTab === 'admin'
                      ? 'liquid-btn-active-pink'
                      : 'text-pink-600 hover:text-pink-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-pink-600 shrink-0 drop-shadow-sm" />
                  <span>{language === 'bn' ? 'এডমিন 👑' : 'Admin 👑'}</span>
                </button>
              </div>
            )}
          </div>
        </nav>

          {/* DESKTOP ROW 2: Search Bar (shrunk — tab row now sits above it) */}
          <div className="w-full">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center"
            >
              <div className="relative w-full h-6 sm:h-6.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 hover:border-slate-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-full text-slate-800 dark:text-white transition px-2.5 sm:px-3 flex items-center shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden">
                <Search className="w-3 h-3 text-emerald-600 mr-1.5 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'কী খুঁজছেন? যেমন: iPhone, বাইক, কার, ফ্ল্যাট, ল্যাপটপ...'
                      : 'Search e.g. iPhone, Bike, Car, Flat, Laptop...'
                  }
                  className="w-full h-full text-[10px] sm:text-[11px] focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium bg-transparent min-w-0"
                />

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className="p-0.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-full transition cursor-pointer"
                    title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                  >
                    <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>

                  <button
                    type="submit"
                    className="liquid-btn liquid-btn-emerald active:scale-95 text-white font-bold px-2.5 sm:px-3 transition text-[10px] sm:text-[11px] flex items-center gap-1 shrink-0 cursor-pointer h-5 sm:h-5.5 whitespace-nowrap"
                  >
                    {language === 'bn' ? 'খুঁজুন' : 'Search'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ================= MOBILE & TABLET DEDICATED STRUCTURE (Shown on all mobile & tablet < lg) ================= */}
      <div className="block lg:hidden px-2 py-1.5 space-y-1.5 w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800">
        {/* MOBILE ROW 1: Logo + Live Clock (Favorite Clock Always Visible!) */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 text-left group cursor-pointer shrink-0 select-none"
            title="MarketBD.Net Home"
          >
            <div className="h-7 w-7 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
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
                <span className="text-red-600">M</span><span className="text-slate-900 dark:text-white">arketBD.</span><span className="text-red-600">Net</span>
              </span>
              <span className="text-[7.5px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap mt-0.5">
                {language === 'bn' ? 'বিশ্বস্ত মার্কেটপ্লেস' : 'Trusted Market'}
              </span>
            </div>
          </button>

          {/* Favorite Live Clock Widget in Navbar Center/Right */}
          <div className="flex-1 flex items-center justify-end sm:justify-center min-w-0">
            <LiveClockWidget />
          </div>
        </div>

        {/* MOBILE ROW 2A: Quick Utilities (Theme, Lang, Login/Profile, Menu) - 4 Equal Columns */}
        <div className="grid grid-cols-4 gap-1.5 w-full items-center">
          {/* 1. Dark/Light Mode */}
          <button
            onClick={toggleDarkMode}
            className="liquid-btn h-8 px-1.5 cursor-pointer text-[11px] font-black shrink-0 flex items-center justify-center gap-1"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
            <span className="truncate">{isDarkMode ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'ডার্ক' : 'Dark')}</span>
          </button>

          {/* 2. Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="liquid-btn h-8 px-1.5 cursor-pointer text-[11px] font-black shrink-0 flex items-center justify-center gap-1"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400 font-black whitespace-nowrap">{language === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* 3. Log In/Out */}
          {isLoggedIn ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="liquid-btn h-8 flex items-center justify-center gap-1 px-1.5 cursor-pointer text-[11px] font-black shrink-0"
              title={currentUser?.name || 'Account'}
            >
              <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[55px]">
                {currentUser?.name || (language === 'bn' ? 'প্রোফাইল' : 'Profile')}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('general')}
              className="liquid-btn h-8 flex items-center justify-center gap-1 px-1.5 cursor-pointer text-[11px] font-black shrink-0"
              title="Log In/Out"
            >
              <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">{language === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          )}

          {/* 4. Menu Drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="liquid-btn h-8 px-1.5 cursor-pointer text-[11px] font-black shrink-0 flex items-center justify-center gap-1"
            title={language === 'bn' ? 'মেনু' : 'Menu'}
          >
            {isMobileMenuOpen ? <X className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Menu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            <span>{language === 'bn' ? 'মেনু' : 'Menu'}</span>
          </button>
        </div>

        {/* MOBILE & TABLET ROW 2B: Sell Post Button and Search Bar Side by Side on the Same Line */}
        <div className="w-full flex items-center gap-1.5">
          {/* Sell Post Button */}
          <button
            onClick={handlePostAdClick}
            className="liquid-btn liquid-btn-red live-beacon-pulse h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1.5 text-white font-black cursor-pointer text-[11.5px] sm:text-xs shrink-0 whitespace-nowrap"
            title={language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন' : 'Sell / Post Ad'}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
            </span>
            <PlusCircle className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap font-black text-white">
              {language === 'bn' ? 'সেল / এড পোস্ট' : 'Sell / Post Ad'}
            </span>
          </button>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 min-w-0 relative flex items-center"
          >
            <div className="relative w-full h-8 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 focus-within:border-emerald-500 rounded-full text-slate-800 dark:text-white transition px-2.5 flex items-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_1.5px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <Search className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'কী খুঁজছেন? iPhone, বাইক...'
                    : 'Search iPhone, Bike...'
                }
                className="w-full h-full text-[10.5px] sm:text-xs focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium bg-transparent min-w-0"
              />

              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className="p-0.5 text-slate-500 hover:text-emerald-600 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
                  title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                >
                  <Mic className="w-3 h-3" />
                </button>

                <button
                  type="submit"
                  className="liquid-btn liquid-btn-emerald active:scale-95 text-white font-bold px-2 sm:px-2.5 py-0.5 transition text-[10px] sm:text-[10.5px] flex items-center gap-0.5 shrink-0 cursor-pointer h-6 whitespace-nowrap"
                >
                  {language === 'bn' ? 'খুঁজুন' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* MOBILE NAVIGATION BUTTONS: 3 Rows of 3 Equal-Width Columns (9 Buttons matching Desktop Strip without APK) */}
        <div className="grid grid-cols-3 gap-1.5 w-full items-center pt-0.5">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5 ${
              activeTab === 'home'
                ? 'liquid-btn-active'
                : ''
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0 drop-shadow-xs" />
            <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
          </button>

          {/* 2. All Ads */}
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, category: '' }));
              setActiveTab('search');
            }}
            className={`liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5 ${
              activeTab === 'search' && !filters.category
                ? 'liquid-btn-active'
                : ''
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-600 shrink-0 drop-shadow-xs" />
            <span>{language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Ads'}</span>
          </button>

          {/* 3. Location */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5"
            title="Location"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 drop-shadow-xs" />
            <span className="truncate max-w-[82px]">
              {selectedLocation.district || selectedLocation.division || (language === 'bn' ? 'বাংলাদেশ' : 'Location')}
            </span>
          </button>

          {/* 4. Ask AI */}
          <button
            onClick={() => setIsAISearchOpen(true)}
            className="liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5"
            title="Ask AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse drop-shadow-xs" />
            <span>{language === 'bn' ? 'আস্ক AI' : 'Ask AI'}</span>
          </button>

          {/* 5. Chat */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5 relative ${
              activeTab === 'chat'
                ? 'liquid-btn-active-sky'
                : ''
            }`}
            title={language === 'bn' ? 'লাইভ চ্যাট ও মেসেজ' : 'Chat'}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-600 shrink-0 drop-shadow-xs" />
            <span>{language === 'bn' ? 'লাইভ চ্যাট' : 'Chat'}</span>
            {unreadChats > 0 && (
              <span className="bg-pink-600 text-white font-black text-[7.5px] px-1 py-0.2 rounded-full leading-none shrink-0 animate-pulse shadow-xs">
                {unreadChats}
              </span>
            )}
          </button>

          {/* 6. Saved Wishlist */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5 relative ${
              activeTab === 'dashboard'
                ? 'liquid-btn-active-pink'
                : ''
            }`}
            title={language === 'bn' ? 'পছন্দের তালিকা' : 'Saved'}
          >
            <Heart className="w-3.5 h-3.5 text-red-500 shrink-0 drop-shadow-xs" />
            <span>{language === 'bn' ? 'পছন্দ' : 'Saved'}</span>
            {wishlist.length > 0 && (
              <span className="bg-pink-600 text-white font-bold text-[7.5px] px-1 py-0.2 rounded-full leading-none shrink-0 shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* 7. Site Switches (Master & Maintenance Switch) - ONLY for Admin */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5 ${
                siteMaintenance.isMasterLockdown
                  ? 'liquid-btn-red animate-pulse'
                  : siteMaintenance.isMaintenance
                  ? 'bg-amber-600/90 text-white border-white/70 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)]'
                  : 'liquid-btn-emerald'
              }`}
              title={language === 'bn' ? 'সাধারণ ও মাস্টার সুইচ কন্ট্রোল প্যানেল' : 'Site Switches Control'}
            >
              <Power className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[85px]">
                {siteMaintenance.isMasterLockdown
                  ? (language === 'bn' ? 'মাস্টার লক 🔒' : 'Lock 🔒')
                  : siteMaintenance.isMaintenance
                  ? (language === 'bn' ? 'মেইনটেন্যান্স 🟡' : 'Maintenance 🟡')
                  : (language === 'bn' ? 'সাইট লাইভ 🟢' : 'Live 🟢')}
              </span>
            </button>
          )}

          {/* 8. Admin Panel - ONLY for Admin */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`liquid-btn flex items-center justify-center gap-1 h-8 cursor-pointer text-[11px] font-black shrink-0 whitespace-nowrap px-1.5 ${
                activeTab === 'admin'
                  ? 'liquid-btn-active-pink'
                  : 'text-pink-600 hover:text-pink-700'
              }`}
              title={language === 'bn' ? 'এডমিন প্যানেল 👑' : 'Admin Panel 👑'}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-pink-600 shrink-0 drop-shadow-xs" />
              <span>{language === 'bn' ? 'এডমিন 👑' : 'Admin 👑'}</span>
            </button>
          )}
        </div>
      </div>
    </header>

    {/* Comprehensive Drawer Menu - Mounted at root level with z-[100] so it is never trapped behind header or other elements */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-[11px] bg-red-600/30 hover:bg-red-600/40 text-red-300 font-bold px-2.5 py-1.5 rounded-xl border border-red-500/40 transition cursor-pointer active:scale-95 flex items-center gap-1"
                      title={language === 'bn' ? 'লগআউট' : 'Log Out'}
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                    </button>
                  </div>
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

              {/* 5. Help, Safety & Support */}
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
                {isAdmin && (
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

    {/* Fixed Mobile Bottom Navigation Bar - Mounted directly to document root viewport */}
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))] px-3 flex items-center justify-between shadow-2xl md:hidden text-[10px] font-bold select-none"
    >
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

      {/* Sell / Post Ad (Center Highlighted Floating Red Circle with Live Beacon & Label) */}
      <button
        onClick={handlePostAdClick}
        className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white w-13 h-13 rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition active:scale-95 cursor-pointer shrink-0 live-beacon-pulse relative"
        title={language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন' : 'Sell / Post Ad'}
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-90"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-white"></span>
        </span>
        <PlusCircle className="w-5 h-5 text-white stroke-[2.5]" />
        <span className="text-[8.5px] font-black text-white whitespace-nowrap -mt-0.5">
          {language === 'bn' ? 'সেল / এড পোস্ট' : 'Sell / Post Ad'}
        </span>
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

      {/* Admin Panel (ONLY Visible if user is explicitly logged in as Admin) */}
      {isAdmin && (
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
        <span>{isLoggedIn ? (language === 'bn' ? 'প্রোফাইল' : 'Profile') : (language === 'bn' ? 'লগ ইন' : 'Login')}</span>
      </button>
    </nav>

    {/* Global User Profile Edit & Deactivate Modal */}
    <UserProfileModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
    />
  </>
  );
};

