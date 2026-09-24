import React, { Suspense } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Navbar } from './components/Navbar/Navbar';
import { Live3DTickerBar } from './components/Navbar/Live3DTickerBar';
import { LocationModal } from './components/Navbar/LocationModal';
import { AuthModal } from './components/Auth/AuthModal';
import { Footer } from './components/Footer/Footer';
import { InAppNotificationBanner } from './components/Common/InAppNotificationBanner';
import { OfflineModal } from './components/Common/OfflineModal';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { MaintenanceScreen } from './components/Maintenance/MaintenanceScreen';
import { MasterLockdownScreen } from './components/Maintenance/MasterLockdownScreen';
import { ArrowLeft, ArrowRight, Home, Wrench, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';

// Resilient dynamic chunk loader that retries once and gracefully falls back without crashing
function resilientLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ [key: string]: any }>,
  namedExport: string
) {
  return React.lazy(async () => {
    try {
      const mod = await factory();
      return { default: mod[namedExport] || mod.default };
    } catch (err) {
      console.warn(`Initial chunk fetch failed for ${namedExport}, retrying...`, err);
      try {
        await new Promise(r => setTimeout(r, 400));
        const retryMod = await factory();
        return { default: retryMod[namedExport] || retryMod.default };
      } catch (retryErr) {
        console.error(`Chunk fetch failed for ${namedExport}:`, retryErr);
        return { default: (() => null) as unknown as T };
      }
    }
  });
}

// Code-split heavy secondary views & modals for instant initial launch on Android mobile
const ProductDetailModal = resilientLazy(() => import('./components/Product/ProductDetailModal'), 'ProductDetailModal');
const CategoryForms = resilientLazy(() => import('./components/Forms/CategoryForms'), 'CategoryForms');
const ChatDrawer = resilientLazy(() => import('./components/Chat/ChatDrawer'), 'ChatDrawer');
const CompareModal = resilientLazy(() => import('./components/Compare/CompareModal'), 'CompareModal');
const AISearchModal = resilientLazy(() => import('./components/AI/AISearchModal'), 'AISearchModal');
const DashboardPage = resilientLazy(() => import('./pages/DashboardPage'), 'DashboardPage');
const AdminPage = resilientLazy(() => import('./pages/AdminPage'), 'AdminPage');
const HelpPage = resilientLazy(() => import('./pages/HelpPage'), 'HelpPage');
const AboutContactPage = resilientLazy(() => import('./pages/AboutContactPage').then(m => ({ default: m.AboutContactPage })), 'AboutContactPage');
const PrivacyPolicyPage = resilientLazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })), 'PrivacyPolicyPage');
const TermsOfServicePage = resilientLazy(() => import('./pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })), 'TermsOfServicePage');
const CustomerCareChat = resilientLazy(() => import('./components/Chat/CustomerCareChat'), 'CustomerCareChat');
const AdDeleteModal = resilientLazy(() => import('./components/Forms/AdDeleteModal'), 'AdDeleteModal');
const InstallAppModal = resilientLazy(() => import('./components/InstallApp/InstallAppModal'), 'InstallAppModal');
const AppUpdateModal = resilientLazy(() => import('./components/AppUpdate/AppUpdateModal'), 'AppUpdateModal');

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedProduct,
    goBack,
    canGoBack,
    goForward,
    canGoForward,
    language,
    siteMaintenance,
    toggleSiteMaintenance,
    userRole,
    currentUser,
    isAISearchOpen,
    adToDelete,
    isInstallAppModalOpen
  } = useMarket();

  const isAdmin =
    userRole === 'admin' ||
    currentUser?.role === 'admin';

  const isMasterLockdownActive = siteMaintenance?.isMasterLockdown === true;
  const isMaintenanceActive = siteMaintenance?.isMaintenance === true;

  // 1. SWITCH 2: MASTER SWITCH (মাস্টার সুইচ)
  // When Master Lockdown is active, NO ONE (including Admins) can view the regular site
  if (isMasterLockdownActive) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <MasterLockdownScreen />
        <AuthModal />
      </div>
    );
  }

  // 2. SWITCH 1: STANDARD MAINTENANCE SWITCH (সাধারণ সুইচ)
  // When Standard Maintenance is active:
  // - Regular visitors will see the Maintenance Screen
  // - Admin CAN VIEW, EDIT, AND UPDATE THE ENTIRE WEBSITE freely!
  if (isMaintenanceActive && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <MaintenanceScreen />
        <AuthModal />
      </div>
    );
  }

  // Sync URL pathname with activeTab on initial mount and browser navigation
  React.useEffect(() => {
    const syncFromPath = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/about' || path === '/contact') {
        setActiveTab('about');
      } else if (path === '/privacy' || path === '/privacy-policy') {
        setActiveTab('privacy');
      } else if (path === '/terms' || path === '/terms-of-service') {
        setActiveTab('terms');
      } else if (path === '/help') {
        setActiveTab('help');
      }
    };
    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, [setActiveTab]);

  // Scroll to top of window whenever activeTab or selectedProduct changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, selectedProduct?.id]);

  const getPageTitle = () => {
    if (selectedProduct) {
      return language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Details';
    }
    switch (activeTab) {
      case 'search':
        return language === 'bn' ? 'বিজ্ঞাপন সমূহ' : 'Search Listings';
      case 'post-ad':
        return language === 'bn' ? 'বিজ্ঞাপন পোস্ট' : 'Post Ad';
      case 'chat':
        return language === 'bn' ? 'চ্যাট ও মেসেজ' : 'Messages';
      case 'compare':
        return language === 'bn' ? 'পণ্য তুলনা' : 'Compare Products';
      case 'dashboard':
        return language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Dashboard';
      case 'admin':
        return language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel';
      case 'help':
        return language === 'bn' ? 'সাহায্য কেন্দ্র' : 'Help Center';
      case 'about':
      case 'contact':
        return language === 'bn' ? 'আমাদের পরিচয় ও যোগাযোগ' : 'About Us & Contact';
      case 'privacy':
        return language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy';
      case 'terms':
        return language === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service';
      default:
        return language === 'bn' ? 'হোম' : 'Home';
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'product-details':
        return <ProductDetailModal />;
      case 'post-ad':
        return <CategoryForms />;
      case 'chat':
        return <ChatDrawer />;
      case 'compare':
        return <CompareModal />;
      case 'dashboard':
        return <DashboardPage />;
      case 'admin':
        return <AdminPage />;
      case 'help':
        return <HelpPage />;
      case 'about':
      case 'contact':
        return <AboutContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsOfServicePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors w-full max-w-full overflow-x-hidden">
      {/* Admin Maintenance Mode Notice Bar */}
      {isMaintenanceActive && isAdmin && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 py-2 text-xs font-black shadow-md flex items-center justify-between gap-2 z-50 sticky top-0">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1 justify-center">
            <span className="bg-slate-950 text-amber-400 text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0">
              🛠️ সাধারণ সুইচ অফ (Maintenance Active)
            </span>
            <span className="hidden sm:inline">
              {language === 'bn'
                ? 'সাধারণ গ্রাহকদের জন্য ওয়েবসাইট অফ (আন্ডার মেইনটেন্যান্স), কিন্তু এডমিন হিসেবে আপনার জন্য পরিবর্তন ও আপডেটের সুবিধার্থে পুরো ওয়েবসাইট উন্মুক্ত রয়েছে।'
                : 'Site is under maintenance for visitors, but fully open for Admin to review and update.'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleSiteMaintenance(false)}
              className="bg-slate-950 hover:bg-slate-900 text-emerald-400 hover:text-emerald-300 font-black text-[11px] px-2.5 py-1 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
              title="Make website live for everyone"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>{language === 'bn' ? 'সাইট লাইভ করুন' : 'Go Live'}</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="bg-white/90 hover:bg-white text-slate-900 font-black text-[11px] px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer"
            >
              {language === 'bn' ? 'এডমিন প্যানেল ➔' : 'Admin Panel ➔'}
            </button>
          </div>
        </div>
      )}

      <Navbar />
      <Live3DTickerBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 pb-24 md:pb-4">
        {/* Universal Sticky Top Navigation Bar for Back & Next */}
        {(canGoBack || canGoForward) && (
          <div className="mb-3 sticky top-1 z-30 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border-2 border-emerald-500 shadow-md transition-all">
            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer shrink-0"
                  title={language === 'bn' ? 'পেছনে যান (Back)' : 'Go Back'}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  <span>{language === 'bn' ? 'পেছনে যান (Back)' : 'Back'}</span>
                </button>
              )}

              {canGoForward && (
                <button
                  onClick={goForward}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer shrink-0"
                  title={language === 'bn' ? 'সামনে যান (Next)' : 'Go Next'}
                >
                  <span>{language === 'bn' ? 'সামনে যান (Next)' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                </button>
              )}
            </div>

            <div className="text-center px-2 truncate">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {getPageTitle()}
              </span>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{language === 'bn' ? 'হোমে যান' : 'Home'}</span>
            </button>
          </div>
        )}

        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {renderActiveView()}
        </Suspense>
      </main>

      <Footer />

      {/* Global Modals & Support */}
      <InAppNotificationBanner />
      <LocationModal />
      <AuthModal />
      <Suspense fallback={null}>
        <AppUpdateModal />
        {isAISearchOpen && <AISearchModal />}
        <CustomerCareChat />
        {adToDelete && <AdDeleteModal />}
        {isInstallAppModalOpen && <InstallAppModal />}
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainContent />
      <OfflineModal />
    </MarketProvider>
  );
}
