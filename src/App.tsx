import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Navbar } from './components/Navbar/Navbar';
import { Live3DTickerBar } from './components/Navbar/Live3DTickerBar';
import { LocationModal } from './components/Navbar/LocationModal';
import { AuthModal } from './components/Auth/AuthModal';
import { Footer } from './components/Footer/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailModal } from './components/Product/ProductDetailModal';
import { CategoryForms } from './components/Forms/CategoryForms';
import { ChatDrawer } from './components/Chat/ChatDrawer';
import { CompareModal } from './components/Compare/CompareModal';
import { AISearchModal } from './components/AI/AISearchModal';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { HelpPage } from './pages/HelpPage';
import { CustomerCareChat } from './components/Chat/CustomerCareChat';
import { AdDeleteModal } from './components/Forms/AdDeleteModal';
import { AppUpdateModal } from './components/AppUpdate/AppUpdateModal';
import { InstallAppModal } from './components/InstallApp/InstallAppModal';
import { MaintenanceScreen } from './components/Maintenance/MaintenanceScreen';
import { MasterLockdownScreen } from './components/Maintenance/MasterLockdownScreen';
import { ArrowLeft, ArrowRight, Home, Wrench, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';

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
    currentUser
  } = useMarket();

  const isAdmin =
    userRole === 'admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.email === 'official.marketsbd@gmail.com' ||
    currentUser?.email === 'official.marketbd@gmail.com';

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

        {renderActiveView()}
      </main>

      <Footer />

      {/* Global Modals & Support */}
      <LocationModal />
      <AISearchModal />
      <AuthModal />
      <CustomerCareChat />
      <AdDeleteModal />
      <AppUpdateModal />
      <InstallAppModal />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainContent />
    </MarketProvider>
  );
}
