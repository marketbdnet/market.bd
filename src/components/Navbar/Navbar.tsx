import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useMarket } from '../../context/MarketContext';
import { UserProfileModal } from '../Auth/UserProfileModal';
import { LiveClockWidget } from '../Common/LiveClockWidget';
import {
  MapPin,
  Search,
  Plus,
  PlusCircle,
  Heart,
  MessageCircle,
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
  const [isFloatingSearchOpen, setIsFloatingSearchOpen] = useState(false);
  const floatingSearchInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isFloatingSearchOpen) {
      const timer = window.setTimeout(() => {
        floatingSearchInputRef.current?.focus();
      }, 80);
      return () => window.clearTimeout(timer);
    }
  }, [isFloatingSearchOpen]);

  const unreadChats = chatThreads.reduce((acc, t) => acc + Number(t?.unreadCount || 0), 0);
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
      <header className="sticky top-0 z-40 bg-[#FF0000] dark:bg-[#B91C1C] text-white border-b-2 border-[#CC0000] dark:border-red-950 transition-colors shadow-md w-full relative pt-[max(2px,env(safe-area-inset-top))] backdrop-blur-md">
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
              <div className="h-7.5 w-7.5 sm:h-8 sm:w-8 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-lg border-2 border-white shadow-sm bg-white">
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
                  <span className="text-[#FFE600]">M</span><span className="text-white">arketBD.</span><span className="text-[#FFE600]">Net</span>
                </span>
                <span className="text-[8px] sm:text-[9px] text-amber-100 font-bold whitespace-nowrap">
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
                className="rounded-full bg-[#FFC800] hover:bg-[#FFD836] active:scale-95 h-8 sm:h-8.5 flex items-center justify-center gap-1.5 px-3.5 sm:px-4 text-slate-950 font-black border-2 border-white shadow-md transition cursor-pointer text-xs sm:text-[13px] shrink-0"
                title={language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন' : 'Sell / Post Ad'}
              >
                <PlusCircle className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap font-black text-slate-950">{language === 'bn' ? 'সেল / এড পোস্ট' : 'Sell / Post Ad'}</span>
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

        {/* DESKTOP ROW 2 (MERGED): Nav buttons (compact) + Search Bar on a single line, per request #9 */}
        <div className="w-full flex items-center gap-1 sm:gap-1.5">
          {/* Compact Nav Buttons - shrunk, icon-first, no fixed width, so they fit alongside search */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap ${
                activeTab === 'home' ? 'liquid-btn-active' : ''
              }`}
              title={language === 'bn' ? 'হোম' : 'Home'}
            >
              <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xl:inline">{language === 'bn' ? 'হোম' : 'Home'}</span>
            </button>

            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, category: '' }));
                setActiveTab('search');
              }}
              className={`liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap ${
                activeTab === 'search' && !filters.category ? 'liquid-btn-active' : ''
              }`}
              title={language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Ads'}
            >
              <Search className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden xl:inline">{language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Ads'}</span>
            </button>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap"
              title="Location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xl:inline truncate max-w-[80px]">
                {selectedLocation.thana || selectedLocation.district || selectedLocation.division || (language === 'bn' ? 'বাংলাদেশ' : 'BD')}
              </span>
            </button>

            <button
              onClick={() => setIsAISearchOpen(true)}
              className="liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap"
              title="Ask AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
              <span className="hidden xl:inline">{language === 'bn' ? 'AI' : 'AI'}</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap relative ${
                activeTab === 'chat' ? 'liquid-btn-active-sky' : ''
              }`}
              title={language === 'bn' ? 'লাইভ চ্যাট ও ইনবক্স' : 'Live Chat & Inbox'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="hidden xl:inline">{language === 'bn' ? 'চ্যাট' : 'Chat'}</span>
              {unreadChats > 0 && (
                <span className="bg-pink-600 text-white font-black text-[8px] px-1 py-0.2 rounded-full leading-none shrink-0 animate-pulse">
                  {unreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap relative ${
                activeTab === 'dashboard' ? 'liquid-btn-active-pink' : ''
              }`}
              title={language === 'bn' ? 'পছন্দের তালিকা' : 'Saved Wishlist'}
            >
              <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="hidden xl:inline">{language === 'bn' ? 'পছন্দ' : 'Saved'}</span>
              {wishlist.length > 0 && (
                <span className="bg-pink-600 text-white font-bold text-[8px] px-1 py-0.2 rounded-full leading-none shrink-0">
                  {wishlist.length}
                </span>
              )}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap ${
                    siteMaintenance.isMasterLockdown
                      ? 'liquid-btn-red animate-pulse'
                      : siteMaintenance.isMaintenance
                      ? 'bg-amber-600/90 text-white border-white/70'
                      : 'liquid-btn-emerald'
                  }`}
                  title={language === 'bn' ? 'সাধারণ ও মাস্টার সুইচ কন্ট্রোল প্যানেল' : 'Site Switches Control'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">
                    {siteMaintenance.isMasterLockdown ? '🔒' : siteMaintenance.isMaintenance ? '🟡' : '🟢'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`liquid-btn flex items-center justify-center gap-1 h-6 sm:h-6.5 px-2 cursor-pointer text-[10px] sm:text-[11px] font-black shrink-0 whitespace-nowrap ${
                    activeTab === 'admin' ? 'liquid-btn-active-pink' : 'text-pink-600 hover:text-pink-700'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span className="hidden xl:inline">{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
                </button>
              </>
            )}
          </div>

          {/* Search Bar - takes remaining space on the same line */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 min-w-0 relative flex items-center"
          >
            <div className="relative w-full h-6 sm:h-6.5 bg-white dark:bg-slate-800/95 border border-white/95 dark:border-slate-700 hover:border-amber-300 focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-300/40 rounded-full text-slate-800 dark:text-white transition px-2.5 sm:px-3 flex items-center shadow-sm overflow-hidden">
              <Search className="w-3 h-3 text-[#FF0000] dark:text-red-400 mr-1.5 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'কী খুঁজছেন?'
                    : 'Search...'
                }
                className="w-full h-full text-[10px] sm:text-[11px] focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium bg-transparent min-w-0"
              />

              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className="p-0.5 text-slate-500 hover:text-[#FF0000] hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-full transition cursor-pointer"
                  title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                >
                  <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#FFC800] hover:bg-[#FFD836] active:scale-95 text-slate-950 font-black px-2.5 sm:px-3 transition text-[10px] sm:text-[11px] flex items-center gap-1 shrink-0 cursor-pointer h-5 sm:h-5.5 whitespace-nowrap border border-amber-500/40 shadow-2xs"
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
      <div className="block lg:hidden px-2 py-1.5 space-y-1.5 w-full bg-transparent text-white">
        {/* MOBILE ROW 1: Logo + Live Clock (Favorite Clock Always Visible!) */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 text-left group cursor-pointer shrink-0 select-none"
            title="MarketBD.Net Home"
          >
            <div className="h-7 w-7 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-md border-2 border-white shadow-sm bg-white">
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
                <span className="text-[#FFE600]">M</span><span className="text-white">arketBD.</span><span className="text-[#FFE600]">Net</span>
              </span>
              <span className="text-[7.5px] text-amber-100 font-bold whitespace-nowrap mt-0.5">
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
            className="rounded-full bg-[#FFC800] hover:bg-[#FFD836] active:scale-95 h-8 px-2.5 sm:px-3 flex items-center justify-center gap-1.5 text-slate-950 font-black border-2 border-white shadow-md transition cursor-pointer text-[11.5px] sm:text-xs shrink-0 whitespace-nowrap"
            title={language === 'bn' ? 'বিজ্ঞাপন দিন বা সেল করুন' : 'Sell / Post Ad'}
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap font-black text-slate-950">
              {language === 'bn' ? 'সেল / এড পোস্ট' : 'Sell / Post Ad'}
            </span>
          </button>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 min-w-0 relative flex items-center"
          >
            <div className="relative w-full h-8 bg-white dark:bg-slate-800/95 border border-white/95 dark:border-slate-700 focus-within:border-amber-300 rounded-full text-slate-800 dark:text-white transition px-2.5 flex items-center shadow-sm overflow-hidden">
              <Search className="w-3.5 h-3.5 text-[#FF0000] dark:text-red-400 mr-1 shrink-0" />
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
                  className="p-0.5 text-slate-500 hover:text-[#FF0000] rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
                  title={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                >
                  <Mic className="w-3 h-3" />
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#FFC800] hover:bg-[#FFD836] active:scale-95 text-slate-950 font-black px-2.5 sm:px-3 py-0.5 transition text-[10px] sm:text-[10.5px] flex items-center gap-0.5 shrink-0 cursor-pointer h-6 whitespace-nowrap border border-amber-500/40 shadow-2xs"
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
                      setFilters(prev => ({ ...prev, category: 'electronics', subCategory: 'laptops' }));
                      setActiveTab('search');
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-200 transition text-left cursor-pointer border border-slate-700/50"
                  >
                    <Laptop className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{language === 'bn' ? 'ল্যাপটপ ও কম্পিউটার' : 'Laptops & PCs'}</span>
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

    {/* Floating Mobile Search Pill & Animated Capsule Navigation Dock */}
    {(() => {
      const navTransition = shouldReduceMotion
        ? { duration: 0.01 }
        : { type: 'spring' as const, stiffness: 430, damping: 32, mass: 0.85 };

      const activeMobileNavKey = isProfileModalOpen
        ? 'profile'
        : activeTab === 'home'
        ? 'home'
        : activeTab === 'search'
        ? 'search'
        : activeTab === 'post-ad'
        ? 'create'
        : activeTab === 'chat'
        ? 'chat'
        : activeTab === 'admin' && isAdmin
        ? 'admin'
        : activeTab === 'dashboard'
        ? 'profile'
        : '';

      const navItems: Array<{
        key: string;
        label: string;
        icon: 'home' | 'search' | 'create' | 'chat' | 'admin' | 'profile';
        badge?: number;
        onClick: () => void;
      }> = [
        {
          key: 'home',
          label: language === 'bn' ? 'হোম' : 'Home',
          icon: 'home',
          onClick: () => {
            setIsFloatingSearchOpen(false);
            setActiveTab('home');
          },
        },
        {
          key: 'search',
          label: language === 'bn' ? 'খুঁজুন' : 'Search',
          icon: 'search',
          onClick: () => {
            setFilters(prev => ({ ...prev, category: '' }));
            setIsFloatingSearchOpen(prev => (activeTab === 'search' ? !prev : true));
            setActiveTab('search');
          },
        },
        {
          key: 'create',
          label: language === 'bn' ? 'এড পোস্ট' : 'Ad post',
          icon: 'create',
          onClick: () => {
            setIsFloatingSearchOpen(false);
            handlePostAdClick();
          },
        },
        {
          key: 'chat',
          label: language === 'bn' ? 'ইনবক্স' : 'Inbox',
          icon: 'chat',
          badge: unreadChats,
          onClick: () => {
            setIsFloatingSearchOpen(false);
            setActiveTab('chat');
          },
        },
        ...(isAdmin
          ? [
              {
                key: 'admin',
                label: language === 'bn' ? 'এডমিন' : 'Admin',
                icon: 'admin' as const,
                onClick: () => {
                  setIsFloatingSearchOpen(false);
                  setActiveTab('admin');
                },
              },
            ]
          : []),
        {
          key: 'profile',
          label: isLoggedIn
            ? language === 'bn'
              ? 'প্রোফাইল'
              : 'Profile'
            : language === 'bn'
            ? 'লগ ইন'
            : 'Login',
          icon: 'profile',
          onClick: () => {
            setIsFloatingSearchOpen(false);
            if (isLoggedIn) {
              setIsProfileModalOpen(true);
            } else {
              openAuthModal('general');
            }
          },
        },
      ];

      const renderDockIcon = (
        iconName: 'home' | 'search' | 'create' | 'chat' | 'admin' | 'profile',
        isActive: boolean
      ) => {
        const cls = `w-[18px] h-[18px] transition-transform duration-200 ${
          isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.9]'
        }`;
        switch (iconName) {
          case 'home':
            return <Home className={cls} />;
          case 'search':
            return <Search className={cls} />;
          case 'create':
            return <Plus className={cls} />;
          case 'chat':
            return <MessageCircle className={cls} />;
          case 'admin':
            return <LayoutDashboard className={cls} />;
          case 'profile':
            return <User className={cls} />;
        }
      };

      return (
        <>
          {/* Floating Dark Search Pill */}
          <AnimatePresence>
            {isFloatingSearchOpen && (
              <motion.form
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={e => {
                  handleSearchSubmit(e);
                  setIsFloatingSearchOpen(false);
                }}
                className="fixed bottom-[calc(82px+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 sm:left-3.5 sm:right-3.5 mx-auto max-w-md z-50 md:hidden h-12 px-3.5 rounded-full bg-[#151519]/95 backdrop-blur-md border border-white/12 shadow-[0_14px_34px_rgba(0,0,0,0.48)] flex items-center gap-2.5 transform-gpu"
                role="search"
                aria-label={language === 'bn' ? 'পণ্য খুঁজুন' : 'Search products'}
              >
                <Search className="w-4.5 h-4.5 text-[#DC2626] shrink-0" strokeWidth={2.4} />
                <input
                  ref={floatingSearchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchInput(val);
                    setFilters(prev => ({ ...prev, searchQuery: val }));
                  }}
                  placeholder={language === 'bn' ? 'যেকোনো পণ্য খুঁজুন...' : 'Search anything...'}
                  className="flex-1 bg-transparent text-white placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (searchInput.trim()) {
                      setSearchInput('');
                      setFilters(prev => ({ ...prev, searchQuery: '' }));
                      floatingSearchInputRef.current?.focus();
                    } else {
                      setIsFloatingSearchOpen(false);
                    }
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                  aria-label={language === 'bn' ? 'বন্ধ বা পরিষ্কার করুন' : 'Clear or close search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Floating Animated Capsule Navigation Dock */}
          <nav
            aria-label="Mobile Navigation"
            className="fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 sm:left-3 sm:right-3 mx-auto max-w-md z-50 md:hidden select-none transform-gpu"
          >
            <div
              className={`relative rounded-full overflow-hidden p-1.5 transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-[#141418]/[0.97] border border-white/10 shadow-[0_16px_40px_-6px_rgba(0,0,0,0.82)] backdrop-blur-md'
                  : 'bg-white/[0.97] border border-slate-200/90 shadow-[0_14px_36px_-6px_rgba(15,23,42,0.22)] backdrop-blur-md'
              }`}
            >
              {/* Dark mode bottom continuous crimson accent rail */}
              {isDarkMode && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 inset-x-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#DC2626] to-transparent opacity-90"
                />
              )}

              <div className="relative flex items-center justify-between gap-0.5">
                {navItems.map(item => {
                  const isActive = activeMobileNavKey === item.key;

                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      onClick={item.onClick}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.93 }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative flex-1 min-w-0 h-[48px] flex flex-col items-center justify-center gap-1 rounded-full px-0.5 sm:px-1 cursor-pointer focus:outline-none ${
                        isDarkMode
                          ? isActive
                            ? 'text-[#FF2E4C]'
                            : 'text-slate-200/85 hover:text-white'
                          : isActive
                          ? 'text-white'
                          : 'text-slate-700 hover:text-[#B91C1C]'
                      }`}
                    >
                      {/* Light Mode Sliding Crimson Pill Indicator */}
                      {!isDarkMode && isActive && (
                        <motion.span
                          layoutId="mobileNavActivePill"
                          transition={navTransition}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-gradient-to-b from-[#DC2626] to-[#B91C1C] shadow-[0_6px_16px_rgba(220,38,38,0.42)]"
                        />
                      )}

                      {/* Dark Mode Glowing Crimson Bell-Curve Wave Indicator */}
                      {isDarkMode && isActive && (
                        <motion.span
                          layoutId="mobileNavActiveWave"
                          transition={navTransition}
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-y-1 inset-x-0 flex items-end justify-center overflow-hidden"
                        >
                          <svg
                            viewBox="0 0 100 56"
                            preserveAspectRatio="none"
                            className="w-full h-full"
                          >
                            <defs>
                              <linearGradient id="navWaveGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF1E42" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.04" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M0,54 C18,54 24,8 50,8 C76,8 82,54 100,54 L100,56 L0,56 Z"
                              fill="url(#navWaveGlow)"
                            />
                            <path
                              d="M2,54 C19,54 25,8 50,8 C75,8 81,54 98,54"
                              fill="none"
                              stroke="#FF1E42"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </motion.span>
                      )}

                      {/* Icon + Optional Unread Notification Dot */}
                      <span className="relative z-10 inline-flex items-center justify-center shrink-0">
                        {renderDockIcon(item.icon, isActive)}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[8px] font-black flex items-center justify-center border ${
                              !isDarkMode && isActive
                                ? 'bg-white text-[#DC2626] border-[#DC2626]'
                                : 'bg-[#FF1E42] text-white border-white dark:border-[#141418]'
                            }`}
                          >
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </span>

                      {/* Crisp Single-Line Label Centered Consistently Across Android & Desktop */}
                      <span
                        className={`relative z-10 text-[9.5px] sm:text-[10px] leading-none whitespace-nowrap truncate max-w-full transition-colors ${
                          isActive ? 'font-extrabold' : 'font-semibold'
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Dark mode glowing center dot */}
                      {isDarkMode && isActive && (
                        <motion.span
                          layoutId="mobileNavDarkDot"
                          transition={navTransition}
                          aria-hidden="true"
                          className="relative z-10 w-1 h-1 rounded-full bg-[#FF1E42] shadow-[0_0_8px_#FF1E42]"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </nav>
        </>
      );
    })()}

    {/* Global User Profile Edit & Deactivate Modal */}
    <UserProfileModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
    />
  </>
  );
};

