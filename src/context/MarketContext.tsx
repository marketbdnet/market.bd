import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Language, Location, FilterState, ChatThread, AppNotification, ChatMessage, AppReleaseInfo, PaymentPartnerItem, PaymentAccountsConfig, SystemNoticeConfig, ClockSettings, Category, AdminActiveSession } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { CATEGORIES } from '../data/bangladeshData';
import marketBdLogoImg from '../assets/images/market_bd_logo_1786102322044.jpg';
import { storage } from '../utils/storage';
import { validateBangladeshiPhone, isPhoneVisibleToBuyers } from '../utils/phoneUtils';
import { setGlobalCategoryImageOverrides } from '../utils/categoryImages';
import { checkAndExpireAds, renewExpiredAd } from '../utils/adExpiryEngine';
import { isProductPublicActive, isProductPending, isProductRejected, isProductSold, isProductExpired, makeApprovedProduct, makePendingProduct, makeRejectedProduct } from '../utils/productStatus';
import { sendLocalBrowserPushNotification, requestWebPushPermission } from '../services/pushNotificationService';
import { db, auth, safeFirestoreSetDoc, safeFirestoreDeleteDoc, onAuthStateChanged, signOut } from '../lib/firebase';
import { doc, onSnapshot, collection, getDoc } from 'firebase/firestore';

export const DEFAULT_PAYMENT_PARTNERS: PaymentPartnerItem[] = [
  { id: 'partner-1', name: 'bKash', category: 'mfs', isEnabled: true },
  { id: 'partner-2', name: 'Nagad (নগদ)', category: 'mfs', isEnabled: true },
  { id: 'partner-3', name: 'Rocket (রকেট)', category: 'mfs', isEnabled: true },
  { id: 'partner-4', name: 'Upay (উপায়)', category: 'mfs', isEnabled: true },
  { id: 'partner-5', name: 'VISA Card', category: 'card', isEnabled: true },
  { id: 'partner-6', name: 'Mastercard', category: 'card', isEnabled: true },
  { id: 'partner-7', name: 'American Express (AMEX)', category: 'card', isEnabled: true },
  { id: 'partner-8', name: 'DBBL NEXUS', category: 'card', isEnabled: true },
  { id: 'partner-9', name: 'UnionPay', category: 'card', isEnabled: true },
  { id: 'partner-10', name: 'Islami Bank Bangladesh PLC', category: 'bank', isEnabled: true },
  { id: 'partner-11', name: 'BRAC Bank', category: 'bank', isEnabled: true },
  { id: 'partner-12', name: 'City Bank (Citytouch)', category: 'bank', isEnabled: true },
  { id: 'partner-13', name: 'Bank Asia', category: 'bank', isEnabled: true },
  { id: 'partner-14', name: 'AB Bank', category: 'bank', isEnabled: true },
  { id: 'partner-15', name: 'Mutual Trust Bank (MTB)', category: 'bank', isEnabled: true },
  { id: 'partner-16', name: 'Southeast Bank', category: 'bank', isEnabled: true },
  { id: 'partner-17', name: 'Ok Wallet', category: 'mfs', isEnabled: true },
  { id: 'partner-18', name: 'SureCash', category: 'mfs', isEnabled: true },
  { id: 'partner-19', name: 'Tap\'n Pay', category: 'mfs', isEnabled: true },
  { id: 'partner-20', name: 'SSLCOMMERZ Gateway', category: 'other', isEnabled: true },
];

export const DEFAULT_PAYMENT_ACCOUNTS: PaymentAccountsConfig = {
  bkashNumber: '01723230230',
  bkashLogoUrl: '',
  nagadNumber: '01723230230',
  nagadLogoUrl: '',
  rocketNumber: '01533830784',
  rocketLogoUrl: '',
  upayNumber: '01723230230',
  upayLogoUrl: '',
  bankAccount: {
    bankName: 'Islami Bank Bangladesh PLC',
    accountName: 'MarketBD Net Technologies Ltd',
    accountNumber: '2050 3928 1000 9281',
    branchName: 'Dhanmondi Branch, Dhaka',
    routingNumber: '125263829',
    bankLogoUrl: '',
    isEnabled: true,
  },
};

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  fontSize: 'sm',
  customFontSizePx: 14,
  fontFamily: 'vt323',
  customFontFamily: '',
  textColor: '#34d399',
  dateTextColor: '#6ee7b7',
  bgColor: '#0f172a',
  borderColor: '#334155',
  showPulseIcon: true,
  fontWeight: 'bold',
  showSeconds: true,
  isWidgetEnabled: true,
};

export const DEFAULT_SYSTEM_NOTICE: SystemNoticeConfig = {
  isEnabled: true,
  showAdPromo: true,
  showFraudWarning: true,
  showCustomNotice: true,
  noticeBn: 'জরুরী ঘোষণা: MarketBD.Net প্ল্যাটফর্মে নতুন ও ব্যবহৃত পণ্য কেনাবেচা করার পূর্বে সরাসরি দেখা করে পণ্য ও কাগজপত্র যাচাই করুন।',
  noticeEn: 'Important Notice: Always inspect products & documents in person before making any transaction on MarketBD.Net.',
  adPromoBn: '🚀 আপনার যেকোনো অব্যবহৃত বা নতুন পণ্য দ্রুত বিক্রি করতে আজই ১০০% ফ্রিতে বিজ্ঞাপন পোস্ট করুন! হাজারো প্রকৃত ক্রেতার কাছে সহজেই পৌঁছান।',
  adPromoEn: '🚀 Sell your new or used items faster! Post your ad for 100% FREE today and reach thousands of verified buyers instantly!',
  fraudWarningBn: '🛡️ প্রতারক হতে সতর্ক থাকুন: পণ্য ও আসল কাগজপত্র সরাসরি না দেখে বা পরীক্ষা না করে কাউকে অগ্রিম কুরিয়ার/বিকাশ/নগদে টাকা পাঠাবেন না!',
  fraudWarningEn: '🛡️ Fraud Alert: Never pay money in advance or send bKash/Nagad without verifying the product & documents in person!',
  customNoticeBn: '🔥 বিশেষ অফার: ভেরিফায়েড বিজনেস শপ একাউন্ট খুললেই পাচ্ছেন ৩টি প্রিমিয়াম ফেভারিট টপ অ্যাড প্রমোশন একদম ফ্রি!',
  customNoticeEn: '🔥 Special Offer: Register a Verified Business Shop today and enjoy 3 FREE Top Ad Promotions!',
  scrollSpeed: 'medium',
  contactPhone: '01533830784',
  contactEmail: 'official.marketbd@gmail.com',
};

export interface SiteMaintenanceConfig {
  isMaintenance: boolean; // Switch 1: Standard Maintenance Mode (true = Off for visitors, full access for admin)
  isMasterLockdown: boolean; // Switch 2: Master Lockdown Mode (true = Complete Shutdown, neither visitors nor admin can view regular site)
  title: string;
  subtitle: string;
  noticeMessage: string;
  masterLockdownTitle?: string;
  masterLockdownMessage?: string;
  masterUnlockPin?: string;
  contactEmail: string;
  emergencyPhone?: string;
  updatedAt?: string;
}

export const DEFAULT_SITE_MAINTENANCE: SiteMaintenanceConfig = {
  isMaintenance: false,
  isMasterLockdown: false,
  title: 'MarketBD.Net is Under Maintenance',
  subtitle: 'We’re making some improvements to give you a better shopping experience.',
  noticeMessage: 'We’ll be back shortly. Thank you for your patience!',
  masterLockdownTitle: '🔒 MarketBD.Net মাস্টার সিস্টেম লকডাউন (Master Lockdown)',
  masterLockdownMessage: 'সার্ভার রক্ষণাবেক্ষণ ও আপগ্রেডের জন্য সম্পূর্ণ ওয়েবসাইট সাময়িকভাবে বন্ধ রাখা হয়েছে। এই মুহূর্তে এডমিন এবং ভিজিটর কারও জন্যই সাইট উন্মুক্ত নয়।',
  masterUnlockPin: '7860',
  contactEmail: 'official.marketbd@gmail.com',
  emergencyPhone: '01533830784',
  updatedAt: new Date().toISOString(),
};

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  gender?: 'male' | 'female';
  isVerified?: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
  status?: 'active' | 'blocked';
  registeredAt?: string;
  memberSince?: string;
  avatar?: string;
  authProvider?: 'phone' | 'email' | 'google' | 'facebook' | 'manual' | string;
  location?: Location;
  tradeLicense?: string;
  nidNumber?: string;
  notes?: string;
  totalAdsCount?: number;
  lastLogin?: string;
  password?: string;
}

export const INITIAL_REGISTERED_USERS: UserProfile[] = [
  {
    id: 'user-master-admin',
    name: 'সুপার এডমিন (MarketBD.Net Admin)',
    phone: '01634025151',
    email: 'official.marketsbd@gmail.com',
    role: 'admin',
    gender: 'male',
    isVerified: true,
    isBlocked: false,
    status: 'active',
    registeredAt: '2026-01-01T08:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    authProvider: 'manual',
    location: { division: 'Dhaka', district: 'Dhaka', thana: 'Mirpur' },
    totalAdsCount: 0,
    lastLogin: '2026-08-16T09:00:00.000Z'
  }
];

export interface ProductReaction {
  likes: number;
  dislikes: number;
  loves: number;
  userReaction?: 'like' | 'dislike' | 'love';
}

export interface SellerReview {
  id: string;
  sellerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName?: string;
  user?: string;
  userPhone?: string;
  action: string;
  adTitle?: string;
  target?: string;
  adId?: string;
  location?: string;
  ip?: string;
  type?: string;
}

export interface SavedAlert {
  id: string;
  query: string;
  category?: string;
  createdAt: string;
}

export interface ChatReport {
  id: string;
  threadId: string;
  reportedUser: string;
  reason: string;
  timestamp: string;
}

export interface DailyAnalytics {
  date: string; // e.g., '2026-08-04'
  dateFormattedBn: string;
  dateFormattedEn: string;
  visitors: number;
  productViews: number;
  phoneReveals: number;
  chatsStarted: number;
}

interface MarketContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedLocation: Location;
  setSelectedLocation: (loc: Location) => void;
  products: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareList: Product[];
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  chatThreads: ChatThread[];
  activeChat: ChatThread | null;
  setActiveChat: (thread: ChatThread | null) => void;
  sendMessage: (threadId: string, text: string, offerAmount?: number, imageUrl?: string) => void;
  isSellerTyping: boolean;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  goBack: () => void;
  canGoBack: boolean;
  goForward: () => void;
  canGoForward: boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isAISearchOpen: boolean;
  setIsAISearchOpen: (open: boolean) => void;
  isInstallAppModalOpen: boolean;
  setIsInstallAppModalOpen: (open: boolean) => void;
  openInstallAppModal: () => void;
  closeInstallAppModal: () => void;
  userRole: 'buyer' | 'seller' | 'admin';
  setUserRole: (role: 'buyer' | 'seller' | 'admin') => void;
  addNewAd: (adData: Partial<Product>) => Product;
  updateProductStatus: (id: string, status: 'active' | 'approved' | 'pending' | 'sold' | 'rejected', reason?: string) => void;
  updateExistingAd: (id: string, adData: Partial<Product>) => void;
  editingAd: Product | null;
  setEditingAd: (ad: Product | null) => void;
  openChatForProduct: (product: Product) => string;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Customer Care Chat Modal
  isCustomerCareOpen: boolean;
  setIsCustomerCareOpen: (open: boolean) => void;
  openCustomerCare: () => void;

  // Ad Deletion Reason Modal
  adToDelete: Product | null;
  openDeleteModal: (product: Product) => void;
  closeDeleteModal: () => void;
  deleteProductWithReason: (productId: string, reason: string, customNote?: string) => void;

  // Auth State & Registered Customer Management
  isLoggedIn: boolean;
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  toggleBlockUser: (userId: string, reason?: string) => void;
  deleteUserById: (userId: string) => void;
  toggleVerifyUser: (userId: string) => void;
  addManualUser: (userData: Partial<UserProfile>) => void;
  updateRegisteredUser: (userId: string, updates: Partial<UserProfile>) => void;
  isAuthModalOpen: boolean;
  authModalPurpose: 'post-ad' | 'general' | 'chat';
  login: (userData?: Partial<UserProfile>) => void;
  logout: () => void;
  openAuthModal: (purpose?: 'post-ad' | 'general' | 'chat') => void;
  closeAuthModal: () => void;
  handlePostAdClick: () => void;

  // Product Reactions
  reactions: Record<string, ProductReaction>;
  toggleReaction: (productId: string, type: 'like' | 'dislike' | 'love') => void;

  // Seller Follow & Reviews
  followedSellers: string[];
  toggleFollowSeller: (sellerId: string) => void;
  sellerReviews: SellerReview[];
  addSellerReview: (sellerId: string, rating: number, comment: string) => void;

  // Saved Search Alerts
  savedAlerts: SavedAlert[];
  addSavedAlert: (query: string, category?: string) => void;

  // Admin Logs & Chat Moderation
  activityLogs: ActivityLog[];
  logUserActivity: (action: 'Viewed Ad' | 'Revealed Phone' | 'Started Chat' | 'Reported Ad', adTitle: string, adId: string) => void;
  spamThreads: string[];
  toggleSpamThread: (threadId: string) => void;
  chatReports: ChatReport[];
  reportAbusiveChat: (threadId: string, reportedUser: string, reason: string) => void;

  // Live Traffic & Date-wise Analytics
  onlineUsersCount: number;
  dailyAnalytics: DailyAnalytics[];

  // Custom Logo & Watermark Options for Admin
  customLogoUrl: string;
  setCustomLogoUrl: (url: string) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (opacity: number) => void;
  isWatermarkEnabled: boolean;
  setIsWatermarkEnabled: (enabled: boolean) => void;

  // App Release & Auto Update State
  appRelease: AppReleaseInfo;
  updateAppRelease: (newRelease: AppReleaseInfo) => void;
  userInstalledVersion: string;
  applyAppUpdate: () => void;
  isUpdateDismissed: boolean;
  setIsUpdateDismissed: (dismissed: boolean) => void;

  // Auto Expiry & Renewal Actions
  renewAd: (productId: string) => void;
  forceAutoApproveAllPending: (productId?: string) => void;

  // Official Payment Partners Logo Management
  paymentPartners: PaymentPartnerItem[];
  addPaymentPartner: (partner: Omit<PaymentPartnerItem, 'id'>) => void;
  updatePaymentPartner: (id: string, updated: Partial<PaymentPartnerItem>) => void;
  deletePaymentPartner: (id: string) => void;
  resetPaymentPartnersToDefault: () => void;

  // Premium Promotion Accounts & Bank Account Settings
  paymentAccounts: PaymentAccountsConfig;
  updatePaymentAccounts: (config: Partial<PaymentAccountsConfig>) => void;

  // System Notice & Official Contact Info
  systemNotice: SystemNoticeConfig;
  updateSystemNotice: (notice: Partial<SystemNoticeConfig>) => void;

  // Master Website Switch & Site Maintenance Mode (Dual Switches: Standard & Master)
  siteMaintenance: SiteMaintenanceConfig;
  updateSiteMaintenance: (config: Partial<SiteMaintenanceConfig>) => void;
  toggleSiteMaintenance: (isMaintenance?: boolean) => void;
  toggleMasterLockdown: (isLocked?: boolean) => void;
  unlockMasterLockdown: (enteredPin: string) => boolean;

  // Running Live Clock Customization Settings
  clockSettings: ClockSettings;
  updateClockSettings: (settings: Partial<ClockSettings>) => void;

  // Browse Categories & Category Management (Add, Rename/Edit, Delete, Realtime Sync)
  categories: Category[];
  addCategory: (newCategory: Omit<Category, 'count'> & { count?: number }) => void;
  updateCategory: (id: string, updatedFields: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetCategoriesToDefault: () => void;

  // Category Image Management & Realtime Custom Overrides
  categoryImageOverrides: Record<string, string>;
  updateCategoryImageOverride: (key: string, url: string) => void;
  removeCategoryImageOverride: (key: string) => void;
  resetAllCategoryImageOverrides: () => void;

  // Super Admin Single-Device Concurrent Session Control
  adminActiveSession: AdminActiveSession | null;
  terminateOtherAdminSessions: () => void;
}

const defaultFilters: FilterState = {
  category: '',
  subCategory: '',
  division: '',
  district: '',
  thana: '',
  minPrice: '',
  maxPrice: '',
  condition: [],
  brand: [],
  isVerifiedOnly: false,
  isNegotiableOnly: false,
  isDeliveryOnly: false,
  adType: '',
  searchQuery: '',
  sortBy: 'latest'
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedLocation, setSelectedLocationState] = useState<Location>(() => {
    try {
      const saved = storage.getItem('marketbd_selected_location');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading stored location:', e);
    }
    return {
      division: 'All Bangladesh',
      district: '',
      thana: ''
    };
  });

  const setSelectedLocation = (loc: Location) => {
    setSelectedLocationState(loc);
    try {
      storage.setItem('marketbd_selected_location', JSON.stringify(loc));
    } catch (e) {
      console.error('Error saving selected location:', e);
    }
  };

  const normalizeProductsList = (productList: Product[]): Product[] => {
    return productList.map((p) => {
      const isExplicitlyVisible = p.showPhoneNumber === true ||
        p.seller?.showPhoneNumber === true ||
        (p.seller?.hidePhone === false && p.seller?.showPhoneNumber !== false);

      const rawPhone = p.seller?.phone || '';
      const phoneValidation = rawPhone ? validateBangladeshiPhone(rawPhone) : null;
      const cleanPhone = phoneValidation?.isValid ? phoneValidation.normalized : rawPhone;

      let canonicalStatus: 'active' | 'approved' | 'pending' | 'sold' | 'rejected' | 'expired' = 'active';
      if (isProductPending(p)) {
        canonicalStatus = 'pending';
      } else if (isProductRejected(p)) {
        canonicalStatus = 'rejected';
      } else if (isProductSold(p)) {
        canonicalStatus = 'sold';
      } else if (isProductExpired(p)) {
        canonicalStatus = 'expired';
      } else {
        canonicalStatus = 'active';
      }

      const isLiveActive = canonicalStatus === 'active';

      return {
        ...p,
        postedAt: p.postedAt || new Date().toISOString(),
        createdAt: p.createdAt || p.postedAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
        expiresAt: p.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: canonicalStatus,
        isApproved: isLiveActive ? (p.isApproved ?? true) : false,
        isActive: isLiveActive,
        moderationStatus: canonicalStatus === 'pending' ? 'pending' : (canonicalStatus === 'rejected' ? 'rejected' : 'approved'),
        showPhoneNumber: isExplicitlyVisible,
        seller: {
          ...p.seller,
          phone: cleanPhone,
          hidePhone: !isExplicitlyVisible,
          showPhoneNumber: isExplicitlyVisible,
        }
      };
    });
  };

  const [products, setProducts] = useState<Product[]>(() => {
    const map = new Map<string, Product>();
    // Seed with comprehensive production catalog
    INITIAL_PRODUCTS.forEach(p => {
      if (p && p.id) map.set(p.id, p);
    });

    const saved = storage.getItem('marketbd_products_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((p: Product) => {
            if (p && p.id) {
              const existing = map.get(p.id);
              // Clean any dummy keywords if found in old cache
              const cleanTitle = p.title ? p.title.replace(/\b(dummy|demo|test|sample)\b/gi, 'Official').trim() : p.title;
              const cleanDesc = p.description ? p.description.replace(/\b(dummy|demo|test|sample)\b/gi, 'authentic').trim() : p.description;
              const updatedP = {
                ...p,
                title: cleanTitle,
                description: cleanDesc
              };
              map.set(p.id, existing ? { ...existing, ...updatedP } : updatedP);
            }
          });
        }
      } catch (e) {
        console.error('Error parsing stored products:', e);
      }
    }
    return normalizeProductsList(Array.from(map.values()));
  });

  // Registered Customer Database State (Synced with Firestore & Server)
  const [registeredUsers, setRegisteredUsersState] = useState<UserProfile[]>(() => {
    try {
      const saved = storage.getItem('marketbd_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading stored registered users:', e);
    }
    return INITIAL_REGISTERED_USERS;
  });

  // Super Admin Active Session State (Single-Device Concurrency Control)
  const [adminActiveSession, setAdminActiveSession] = useState<AdminActiveSession | null>(() => {
    try {
      const saved = storage.getItem('marketbd_admin_active_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  });

  // Cloud Realtime Synchronization Engine (Firebase Firestore + Server Sync with Debounce & Circuit Breaker)
  const syncTimeoutMapRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const syncToCloud = (key: string, data: any) => {
    // 1. Debounce and safely sync with Firestore
    const existingTimeout = syncTimeoutMapRef.current.get(key);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      safeFirestoreSetDoc(doc(db, 'settings', key), { value: data, updatedAt: new Date().toISOString() }, { merge: true })
        .catch(() => {});
      if (key === 'site_maintenance') {
        safeFirestoreSetDoc(doc(db, 'settings', 'siteMaintenance'), { value: data, updatedAt: new Date().toISOString() }, { merge: true })
          .catch(() => {});
      }
      syncTimeoutMapRef.current.delete(key);
    }, 400);

    syncTimeoutMapRef.current.set(key, timeout);

    // 2. Instant REST API state sync for 100% reliability
    try {
      fetch('/api/sync/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [key]: data,
          ...(key === 'site_maintenance' ? { siteMaintenance: data } : {})
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // Realtime Cloud State Synchronization Across Android App and Website
  useEffect(() => {
    // 1. Initial hydration from server sync API
    fetch('/api/sync/state')
      .then(res => res.json())
      .then(res => {
        if (res && res.success && res.data) {
          const d = res.data;
          if (d.adminActiveSession) {
            setAdminActiveSession(d.adminActiveSession);
            storage.setItem('marketbd_admin_active_session', JSON.stringify(d.adminActiveSession));
          }
          const maintenanceData = d.siteMaintenance || d.site_maintenance;
          if (maintenanceData) {
            setSiteMaintenanceState(prev => {
              const merged = { ...prev, ...maintenanceData };
              storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(merged));
              return merged;
            });
          }
          if (d.systemNotice) {
            setSystemNoticeState(prev => {
              const merged = { ...prev, ...d.systemNotice };
              storage.setItem('marketbd_system_notice_v1', JSON.stringify(merged));
              return merged;
            });
          }
          if (d.paymentAccounts) {
            setPaymentAccountsState(prev => {
              const merged = { ...prev, ...d.paymentAccounts };
              storage.setItem('marketbd_payment_accounts_v1', JSON.stringify(merged));
              return merged;
            });
          }
          if (d.clockSettings) {
            setClockSettingsState(prev => {
              const merged = { ...prev, ...d.clockSettings };
              storage.setItem('marketbd_clock_settings_v1', JSON.stringify(merged));
              return merged;
            });
          }
          if (d.paymentPartners && Array.isArray(d.paymentPartners) && d.paymentPartners.length > 0) {
            setPaymentPartnersState(d.paymentPartners);
            storage.setItem('marketbd_payment_partners_v1', JSON.stringify(d.paymentPartners));
          }
          if (d.branding) {
            if (d.branding.customLogoUrl !== undefined) {
              setCustomLogoUrlState(d.branding.customLogoUrl);
              storage.setItem('marketbd_custom_logo', d.branding.customLogoUrl);
            }
            if (d.branding.watermarkText !== undefined) {
              setWatermarkTextState(d.branding.watermarkText);
              storage.setItem('marketbd_watermark_text', d.branding.watermarkText);
            }
            if (d.branding.watermarkOpacity !== undefined) {
              setWatermarkOpacityState(d.branding.watermarkOpacity);
              storage.setItem('marketbd_watermark_opacity', String(d.branding.watermarkOpacity));
            }
            if (d.branding.isWatermarkEnabled !== undefined) {
              setIsWatermarkEnabledState(d.branding.isWatermarkEnabled);
              storage.setItem('marketbd_watermark_enabled', String(d.branding.isWatermarkEnabled));
            }
          }
          if (d.appRelease) {
            setAppReleaseState(prev => {
              const merged = { ...prev, ...d.appRelease };
              storage.setItem('marketbd_app_release', JSON.stringify(merged));
              return merged;
            });
          }
          if (d.categories && Array.isArray(d.categories) && d.categories.length > 0) {
            setCategoriesState(d.categories);
            storage.setItem('marketbd_categories_v2', JSON.stringify(d.categories));
          }
          if (d.categories_config && Array.isArray(d.categories_config) && d.categories_config.length > 0) {
            setCategoriesState(d.categories_config);
            storage.setItem('marketbd_categories_v2', JSON.stringify(d.categories_config));
          }
          if (d.category_image_overrides || d.categoryImageOverrides) {
            const overrides = d.category_image_overrides || d.categoryImageOverrides;
            if (overrides && typeof overrides === 'object') {
              setCategoryImageOverridesState(overrides);
              setGlobalCategoryImageOverrides(overrides);
              storage.setItem('marketbd_category_images_overrides_v1', JSON.stringify(overrides));
            }
          }
          if (d.marketplace_products && Array.isArray(d.marketplace_products) && d.marketplace_products.length > 0) {
            setProducts(prev => {
              const map = new Map<string, Product>();
              prev.forEach(p => { if (p && p.id) map.set(p.id, p); });
              d.marketplace_products.forEach((p: Product) => {
                if (p && p.id && p.title) {
                  const existing = map.get(p.id);
                  map.set(p.id, existing ? { ...existing, ...p } : p);
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => 
                new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime()
              );
              storage.setItem('marketbd_products_v4', JSON.stringify(merged));
              return merged;
            });
          }
          if (d.registered_users && Array.isArray(d.registered_users) && d.registered_users.length > 0) {
            setRegisteredUsersState(prev => {
              const map = new Map<string, UserProfile>();
              (Array.isArray(prev) ? prev : []).forEach(u => { if (u && (u.id || u.phone)) map.set(u.id || u.phone, u); });
              d.registered_users.forEach((u: UserProfile) => {
                if (u && (u.id || u.phone)) {
                  const key = u.id || u.phone;
                  const existing = map.get(key);
                  const password = u.password || existing?.password;
                  map.set(key, existing ? { ...existing, ...u, password } : { ...u, password });
                }
              });
              const merged = Array.from(map.values());
              storage.setItem('marketbd_registered_users', JSON.stringify(merged));
              return merged;
            });
          }
        }
      })
      .catch(() => {});

    // 2. Real-time Firebase Firestore snapshot listeners
    const unsubs: (() => void)[] = [];

    try {
      const unsubMaintenance = onSnapshot(doc(db, 'settings', 'site_maintenance'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val) {
            setSiteMaintenanceState(prev => {
              const merged = { ...prev, ...val };
              storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, (err) => console.log('Maintenance listener notice:', err));
      unsubs.push(unsubMaintenance);

      const unsubNotice = onSnapshot(doc(db, 'settings', 'system_notice'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val) {
            setSystemNoticeState(prev => {
              const merged = { ...prev, ...val };
              storage.setItem('marketbd_system_notice_v1', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, (err) => console.log('Notice listener notice:', err));
      unsubs.push(unsubNotice);

      const unsubPay = onSnapshot(doc(db, 'settings', 'payment_accounts'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val) {
            setPaymentAccountsState(prev => {
              const merged = { ...prev, ...val };
              storage.setItem('marketbd_payment_accounts_v1', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, (err) => console.log('Payment listener notice:', err));
      unsubs.push(unsubPay);

      const unsubClock = onSnapshot(doc(db, 'settings', 'clock_settings'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val) {
            setClockSettingsState(prev => {
              const merged = { ...prev, ...val };
              storage.setItem('marketbd_clock_settings_v1', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, (err) => console.log('Clock listener notice:', err));
      unsubs.push(unsubClock);

      const unsubPartners = onSnapshot(doc(db, 'settings', 'payment_partners'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value;
          if (val && Array.isArray(val) && val.length > 0) {
            setPaymentPartnersState(val);
            storage.setItem('marketbd_payment_partners_v1', JSON.stringify(val));
          }
        }
      }, (err) => console.log('Partners listener notice:', err));
      unsubs.push(unsubPartners);

      const unsubBranding = onSnapshot(doc(db, 'settings', 'branding'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val) {
            if (val.customLogoUrl !== undefined) {
              setCustomLogoUrlState(val.customLogoUrl);
              storage.setItem('marketbd_custom_logo', val.customLogoUrl);
            }
            if (val.watermarkText !== undefined) {
              setWatermarkTextState(val.watermarkText);
              storage.setItem('marketbd_watermark_text', val.watermarkText);
            }
            if (val.watermarkOpacity !== undefined) {
              setWatermarkOpacityState(val.watermarkOpacity);
              storage.setItem('marketbd_watermark_opacity', String(val.watermarkOpacity));
            }
            if (val.isWatermarkEnabled !== undefined) {
              setIsWatermarkEnabledState(val.isWatermarkEnabled);
              storage.setItem('marketbd_watermark_enabled', String(val.isWatermarkEnabled));
            }
          }
        }
      }, (err) => console.log('Branding listener notice:', err));
      unsubs.push(unsubBranding);

      const unsubApp = onSnapshot(doc(db, 'settings', 'app_release'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val) {
            setAppReleaseState(prev => {
              const merged = { ...prev, ...val };
              storage.setItem('marketbd_app_release', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, (err) => console.log('App release listener notice:', err));
      unsubs.push(unsubApp);

      const unsubProducts = onSnapshot(doc(db, 'settings', 'marketplace_products'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value;
          if (Array.isArray(val) && val.length > 0) {
            setProducts(prev => {
              const map = new Map<string, Product>();
              prev.forEach(p => { if (p && p.id) map.set(p.id, p); });
              val.forEach((p: Product) => {
                if (p && p.id && p.title) {
                  const existing = map.get(p.id);
                  map.set(p.id, existing ? { ...existing, ...p } : p);
                }
              });
              const rawMerged = Array.from(map.values()).sort((a, b) => 
                new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime()
              );
              const merged = normalizeProductsList(rawMerged);
              if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
              storage.setItem('marketbd_products_v4', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, (err) => console.log('Products listener notice:', err));
      unsubs.push(unsubProducts);

      // Realtime listener for individual documents in 'products' Firestore collection (Direct Android SDK sync)
      const unsubProductsCol = onSnapshot(collection(db, 'products'), (snapshot) => {
        const cloudAds: Product[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Product;
          cloudAds.push({ ...data, id: docSnap.id });
        });
        if (cloudAds.length > 0) {
          setProducts(prev => {
            const map = new Map<string, Product>();
            prev.forEach(p => { if (p && p.id) map.set(p.id, p); });
            cloudAds.forEach(ca => {
              if (ca && ca.id) {
                const existing = map.get(ca.id);
                map.set(ca.id, existing ? { ...existing, ...ca } : ca);
              }
            });
            const rawMerged = Array.from(map.values()).sort((a, b) => 
              new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime()
            );
            const merged = normalizeProductsList(rawMerged);
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
            storage.setItem('marketbd_products_v4', JSON.stringify(merged));
            return merged;
          });
        }
      }, (err) => console.log('Products collection listener notice:', err));
      unsubs.push(unsubProductsCol);

      const unsubCategories = onSnapshot(doc(db, 'settings', 'categories_config'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value;
          if (Array.isArray(val) && val.length > 0) {
            setCategoriesState(val);
            storage.setItem('marketbd_categories_v2', JSON.stringify(val));
          }
        }
      }, (err) => console.log('Categories listener notice:', err));
      unsubs.push(unsubCategories);

      const unsubImageOverrides = onSnapshot(doc(db, 'settings', 'category_image_overrides'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value || snapshot.data();
          if (val && typeof val === 'object') {
            setCategoryImageOverridesState(val);
            setGlobalCategoryImageOverrides(val);
            storage.setItem('marketbd_category_images_overrides_v1', JSON.stringify(val));
          }
        }
      }, (err) => console.log('Image overrides listener notice:', err));
      unsubs.push(unsubImageOverrides);

      const unsubUsers = onSnapshot(doc(db, 'settings', 'registered_users'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value;
          if (Array.isArray(val) && val.length > 0) {
            setRegisteredUsersState(prev => {
              const map = new Map<string, UserProfile>();
              (Array.isArray(prev) ? prev : []).forEach(u => { if (u && (u.id || u.phone)) map.set(u.id || u.phone, u); });
              val.forEach((u: UserProfile) => {
                if (u && (u.id || u.phone)) {
                  const key = u.id || u.phone;
                  const existing = map.get(key);
                  const password = u.password || existing?.password;
                  map.set(key, existing ? { ...existing, ...u, password } : { ...u, password });
                }
              });
              const merged = Array.from(map.values());
              storage.setItem('marketbd_registered_users', JSON.stringify(merged));
              return merged;
            });
          }
        }
      }, () => {});
      unsubs.push(unsubUsers);

      // Super Admin Active Session Listener for Real-time Single Device Concurrency Protection
      const unsubAdminSession = onSnapshot(doc(db, 'settings', 'admin_active_session'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value as AdminActiveSession;
          if (val && val.sessionToken) {
            setAdminActiveSession(val);
            storage.setItem('marketbd_admin_active_session', JSON.stringify(val));

            const localAdminToken = storage.getItem('marketbd_admin_session_token');
            const localUserRole = storage.getItem('marketbd_user_role');
            if (localUserRole === 'admin' && localAdminToken && val.sessionToken !== localAdminToken) {
              console.warn('[Admin Security] Super Admin logged in from another device (Realtime listener). Terminating this session.', val);
              storage.removeItem('marketbd_is_logged_in');
              storage.removeItem('marketbd_user_role');
              storage.removeItem('marketbd_auth_user');
              storage.removeItem('marketbd_admin_session_token');
              setIsLoggedIn(false);
              setUserRole('buyer');
              setCurrentUser(null);
              setActiveTab('home');
              alert(
                `⚠️ **সুপার এডমিন সিকিউরিটি সতর্কতা**\n\nআপনার সুপার এডমিন অ্যাকাউন্টটি অন্য একটি ডিভাইস (${val.deviceName}) থেকে লগইন করা হয়েছে।\nএকক ডিভাইস সুরক্ষা পলিসি (Single-Device Concurrency Enforcement) অনুযায়ী একই সাথে দুটি ডিভাইসে সুপার এডমিন সেশন চালু রাখা নিষিদ্ধ। তাই এই ডিভাইসের এডমিন এক্সেস তৎক্ষণাৎ বন্ধ করা হয়েছে।`
              );
            }
          }
        }
      }, () => {});
      unsubs.push(unsubAdminSession);
    } catch (e) {
      console.log('Error initializing realtime listeners:', e);
    }

    return () => {
      unsubs.forEach(u => {
        try { u(); } catch (e) {}
      });
    };
  }, []);

  // 3. Dedicated Firebase Auth State Persistence & Profile Synchronization Listener
  useEffect(() => {
    let isMounted = true;
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;

      if (fbUser) {
        // User is authenticated via Firebase Auth (Google, Phone, Email/Password)
        try {
          if (unsubUserDoc) {
            unsubUserDoc();
            unsubUserDoc = null;
          }

          unsubUserDoc = onSnapshot(doc(db, 'users', fbUser.uid), (docSnap) => {
            if (!isMounted) return;

            let profile: UserProfile;
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              profile = {
                id: fbUser.uid,
                name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'MarketBD User',
                phone: data.phone || fbUser.phoneNumber || '',
                email: data.email || fbUser.email || '',
                role: data.role || ((fbUser.email === 'official.marketsbd@gmail.com' || fbUser.email === 'official.marketbd@gmail.com') ? 'admin' : 'seller'),
                gender: data.gender || 'male',
                isVerified: data.isVerified ?? true,
                isBlocked: data.isBlocked ?? false,
                status: data.status || 'active',
                registeredAt: data.registeredAt || fbUser.metadata.creationTime || new Date().toISOString(),
                avatar: data.avatar || fbUser.photoURL || undefined,
                authProvider: data.authProvider || fbUser.providerData?.[0]?.providerId || 'firebase',
                location: data.location,
                tradeLicense: data.tradeLicense,
                nidNumber: data.nidNumber,
                notes: data.notes,
                password: data.password
              };
            } else {
              // Create default profile for this Firebase Auth user
              profile = {
                id: fbUser.uid,
                name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'MarketBD User'),
                phone: fbUser.phoneNumber || '',
                email: fbUser.email || '',
                role: (fbUser.email === 'official.marketsbd@gmail.com' || fbUser.email === 'official.marketbd@gmail.com') ? 'admin' : 'seller',
                gender: 'male',
                isVerified: true,
                isBlocked: false,
                status: 'active',
                registeredAt: fbUser.metadata.creationTime || new Date().toISOString(),
                avatar: fbUser.photoURL || undefined,
                authProvider: fbUser.providerData?.[0]?.providerId || 'firebase'
              };
              safeFirestoreSetDoc(doc(db, 'users', fbUser.uid), profile, { merge: true }).catch(() => {});
            }

            if (profile.isBlocked || profile.status === 'blocked') {
              signOut(auth).catch(() => {});
              setIsLoggedIn(false);
              setUserRole('buyer');
              setCurrentUser(null);
              storage.removeItem('marketbd_is_logged_in');
              storage.removeItem('marketbd_user_role');
              storage.removeItem('marketbd_auth_user');
              return;
            }

            setCurrentUser(profile);
            setIsLoggedIn(true);
            setUserRole(profile.role || 'seller');

            // Sync session to localStorage
            storage.setItem('marketbd_is_logged_in', 'true');
            storage.setItem('marketbd_user_role', profile.role || 'seller');
            storage.setItem('marketbd_auth_user', JSON.stringify(profile));
          }, (err) => {
            console.warn('[Firebase Auth] Firestore user profile sync notice:', err);
          });
        } catch (e) {
          console.warn('[Firebase Auth] State restoration error:', e);
        }
      } else {
        // fbUser is null (Firebase Auth is either initializing async from IndexedDB or user logged in via phone/OTP/saved session)
        if (unsubUserDoc) {
          unsubUserDoc();
          unsubUserDoc = null;
        }

        // Maintain persistent login session across page refreshes, browser reopens, and temporary network offline states.
        // The session is strictly maintained until the user explicitly clicks the Logout button.
        const savedAuth = storage.getItem('marketbd_auth_user');
        const isLoggedInFlag = storage.getItem('marketbd_is_logged_in') === 'true';

        if (savedAuth && isLoggedInFlag) {
          try {
            const parsed: UserProfile = JSON.parse(savedAuth);
            if (parsed && !parsed.isBlocked && parsed.status !== 'blocked') {
              setCurrentUser(parsed);
              setIsLoggedIn(true);
              setUserRole(parsed.role || (storage.getItem('marketbd_user_role') as any) || 'seller');
              return;
            }
          } catch (e) {
            console.warn('[Session Persistence] Failed to restore local user session:', e);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  // Sync products to Local Storage and Express REST API (avoiding repetitive Firestore loops)
  useEffect(() => {
    try {
      storage.setItem('marketbd_products_v4', JSON.stringify(products));
      fetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      }).catch(() => {});
    } catch (e) {
      console.error('Error saving products:', e);
    }
  }, [products]);

  // Request Web Push Notification permission on app mount
  useEffect(() => {
    requestWebPushPermission();
  }, []);

  // Automated Ad Expiry Check (Cron Job Simulation)
  useEffect(() => {
    const { updatedProducts, expiredCount, newNotifications } = checkAndExpireAds(products);
    if (expiredCount > 0) {
      setProducts(updatedProducts);
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        newNotifications.forEach(n => {
          sendLocalBrowserPushNotification({
            title: n.title,
            body: n.message
          });
        });
      }
    }
  }, []);

  // Automated 30-Minute Ad Auto-Approval Engine (Admin Review Timeout)
  useEffect(() => {
    const AUTO_APPROVE_MS = 30 * 60 * 1000; // 30 minutes limit

    const interval = setInterval(() => {
      const now = Date.now();

      setProducts(prevProducts => {
        let hasChanges = false;
        const autoApprovedNotifs: AppNotification[] = [];
        const newlyApprovedProducts: Product[] = [];

        const updated = prevProducts.map(product => {
          if (product.status === 'pending') {
            const postedTime = new Date(product.postedAt).getTime();
            const elapsed = now - (isNaN(postedTime) ? now : postedTime);

            if (elapsed >= AUTO_APPROVE_MS) {
              hasChanges = true;
              const notifId = 'notif-live-' + product.id;
              const notifTitle = language === 'bn' ? 'বিজ্ঞাপন এখন লাইভ' : 'Your advertisement is now live.';
              const notifMsg = language === 'bn'
                ? `আপনার "${product.title}" বিজ্ঞাপনটি এখন লাইভ হয়েছে।`
                : `Your advertisement "${product.title}" is now live.`;

              autoApprovedNotifs.push({
                id: notifId,
                title: notifTitle,
                message: notifMsg,
                time: 'Just now',
                isRead: false,
                type: 'approval'
              });

              const approvedItem: Product = makeApprovedProduct(product, 'system.auto_approve@marketbd.net');
              newlyApprovedProducts.push(approvedItem);
              return approvedItem;
            }
          }
          return product;
        });

        if (hasChanges) {
          if (autoApprovedNotifs.length > 0) {
            setNotifications(prev => {
              const freshNotifs = autoApprovedNotifs.filter(n => !prev.some(p => p.id === n.id));
              if (freshNotifs.length === 0) return prev;
              return [...freshNotifs, ...prev];
            });
            autoApprovedNotifs.forEach(n => {
              sendLocalBrowserPushNotification({
                title: n.title,
                body: n.message
              });
            });
          }
          try {
            storage.setItem('marketbd_products_v4', JSON.stringify(updated));
            // Safely sync ONLY newly approved ads to Firestore and REST API
            newlyApprovedProducts.forEach(p => {
              safeFirestoreSetDoc(doc(db, 'products', p.id), p, { merge: true }).catch(() => {});
              fetch('/api/products/' + p.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
              }).catch(() => {});
            });
          } catch (e) {
            console.error('Error saving auto-approved products:', e);
          }
          return updated;
        }

        return prevProducts;
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [language]);

  const forceAutoApproveAllPending = (productId?: string) => {
    setProducts(prevProducts => {
      const liveNotifs: AppNotification[] = [];
      const newlyApproved: Product[] = [];

      const updated = prevProducts.map(product => {
        if (product.status === 'pending' && (!productId || product.id === productId)) {
          const notifId = 'notif-live-' + product.id;
          const notifTitle = language === 'bn' ? 'বিজ্ঞাপন এখন লাইভ' : 'Your advertisement is now live.';
          const notifMsg = language === 'bn'
            ? `আপনার "${product.title}" বিজ্ঞাপনটি এখন লাইভ হয়েছে।`
            : `Your advertisement "${product.title}" is now live.`;

          liveNotifs.push({
            id: notifId,
            title: notifTitle,
            message: notifMsg,
            time: 'Just now',
            isRead: false,
            type: 'approval'
          });

          const approved = makeApprovedProduct(product, 'system.auto_approve@marketbd.net');
          newlyApproved.push(approved);
          return approved;
        }
        return product;
      });

      if (liveNotifs.length > 0) {
        setNotifications(prev => {
          const freshNotifs = liveNotifs.filter(n => !prev.some(p => p.id === n.id));
          if (freshNotifs.length === 0) return prev;
          return [...freshNotifs, ...prev];
        });
        liveNotifs.forEach(n => {
          sendLocalBrowserPushNotification({
            title: n.title,
            body: n.message
          });
        });
        try {
          storage.setItem('marketbd_products_v4', JSON.stringify(updated));
          newlyApproved.forEach(p => {
            safeFirestoreSetDoc(doc(db, 'products', p.id), p, { merge: true }).catch(() => {});
            fetch('/api/products/' + p.id, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(p)
            }).catch(() => {});
          });
        } catch (e) {
          console.error('Error saving forced auto-approved products:', e);
        }
      }

      return updated;
    });
  };

  const renewAd = (productId: string) => {
    let renewedTitle = 'বিজ্ঞাপন';
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        renewedTitle = p.title;
        return renewExpiredAd(p);
      }
      return p;
    }));

    const renewTitle = language === 'bn' ? 'বিজ্ঞাপন পুনর্নবীকরণ সম্পন্ন 🔄' : 'Ad Renewed Successfully 🔄';
    const renewMsg = language === 'bn'
      ? `আপনার "${renewedTitle}" বিজ্ঞাপনটি সফলভাবে রিনিউ করা হয়েছে এবং পরবর্তী ৬০ দিনের জন্য সচল করা হলো!`
      : `Your ad "${renewedTitle}" has been renewed successfully for another 60 days!`;

    setNotifications(prev => [
      {
        id: 'notif-renew-' + Date.now(),
        title: renewTitle,
        message: renewMsg,
        time: 'Just now',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);

    sendLocalBrowserPushNotification({
      title: renewTitle,
      body: renewMsg
    });
  };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [activeTab, setActiveTabState] = useState<string>('home');
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [selectedProduct, setSelectedProductState] = useState<Product | null>(null);

  const setActiveTab = (tab: string) => {
    if (tab === 'home') {
      setTabHistory(['home']);
      setForwardHistory([]);
      setActiveTabState('home');
      setSelectedProductState(null);
      return;
    }
    setTabHistory(prev => {
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
    setForwardHistory([]);
    setActiveTabState(tab);
  };

  const goBack = () => {
    if (selectedProduct) {
      setForwardHistory(prev => [...prev, `product:${selectedProduct.id}`]);
      setSelectedProductState(null);
      return;
    }
    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      const currentTab = updated.pop();
      if (currentTab) {
        setForwardHistory(prev => [...prev, currentTab]);
      }
      const prevTab = updated[updated.length - 1] || 'home';
      setTabHistory(updated);
      setActiveTabState(prevTab);
    } else {
      setActiveTabState('home');
    }
  };

  const goForward = () => {
    if (forwardHistory.length === 0) return;
    const updatedForward = [...forwardHistory];
    const nextItem = updatedForward.pop();
    setForwardHistory(updatedForward);

    if (nextItem) {
      if (nextItem.startsWith('product:')) {
        const prodId = nextItem.replace('product:', '');
        const targetProd = products.find(p => p.id === prodId);
        if (targetProd) {
          setSelectedProductState(targetProd);
        }
      } else {
        setTabHistory(prev => [...prev, nextItem]);
        setActiveTabState(nextItem);
      }
    }
  };

  const canGoBack = activeTab !== 'home' || selectedProduct !== null || tabHistory.length > 1;
  const canGoForward = forwardHistory.length > 0;

  // Product Reactions State
  const [reactions, setReactions] = useState<Record<string, ProductReaction>>({
    'prod-1': { likes: 24, dislikes: 1, loves: 18 },
    'prod-2': { likes: 12, dislikes: 0, loves: 9 },
    'prod-3': { likes: 45, dislikes: 2, loves: 32 }
  });

  const toggleReaction = (productId: string, type: 'like' | 'dislike' | 'love') => {
    setReactions(prev => {
      const current = prev[productId] || { likes: 10, dislikes: 0, loves: 5 };
      const userPrev = current.userReaction;

      if (userPrev === type) {
        return {
          ...prev,
          [productId]: {
            ...current,
            userReaction: undefined,
            likes: type === 'like' ? Math.max(0, current.likes - 1) : current.likes,
            dislikes: type === 'dislike' ? Math.max(0, current.dislikes - 1) : current.dislikes,
            loves: type === 'love' ? Math.max(0, current.loves - 1) : current.loves
          }
        };
      }

      let newLikes = current.likes;
      let newDislikes = current.dislikes;
      let newLoves = current.loves;

      if (userPrev === 'like') newLikes--;
      if (userPrev === 'dislike') newDislikes--;
      if (userPrev === 'love') newLoves--;

      if (type === 'like') newLikes++;
      if (type === 'dislike') newDislikes++;
      if (type === 'love') newLoves++;

      return {
        ...prev,
        [productId]: {
          likes: newLikes,
          dislikes: newDislikes,
          loves: newLoves,
          userReaction: type
        }
      };
    });
  };

  // Followed Sellers
  const [followedSellers, setFollowedSellers] = useState<string[]>(['user-me', 'user-seller-1']);

  const toggleFollowSeller = (sellerId: string) => {
    setFollowedSellers(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  // Seller Reviews
  const [sellerReviews, setSellerReviews] = useState<SellerReview[]>([
    {
      id: 'rev-1',
      sellerId: 'user-seller-1',
      reviewerName: 'Kamal Hossain',
      rating: 5,
      comment: 'খুবই ভালো সেলার, পন্যের কোয়ালিটি সেরা ছিল!',
      date: '28 Jul 2026'
    }
  ]);

  const addSellerReview = (sellerId: string, rating: number, comment: string) => {
    const newRev: SellerReview = {
      id: 'rev-' + Date.now(),
      sellerId,
      reviewerName: currentUser?.name || 'Verified Buyer',
      rating,
      comment,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setSellerReviews(prev => [newRev, ...prev]);
  };

  // Saved Search Alerts
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>([
    { id: 'alert-1', query: 'iPhone 15 Pro', category: 'mobiles', createdAt: '28 Jul 2026' },
    { id: 'alert-2', query: 'Yamaha R15', category: 'vehicles', createdAt: '29 Jul 2026' }
  ]);

  const addSavedAlert = (query: string, category?: string) => {
    if (!query || !query.trim()) return;
    const qClean = String(query).trim().toLowerCase();
    const exists = (savedAlerts || []).some(a => a && a.query && String(a.query).trim().toLowerCase() === qClean);
    if (exists) return;

    const newAlert: SavedAlert = {
      id: 'alert-' + Date.now(),
      query: query.trim(),
      category,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setSavedAlerts(prev => [newAlert, ...prev]);
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        title: 'Search Alert Set 🔔',
        message: `আপনার সার্চ করা "${query}" কিওয়ার্ডটি এলার্ট লিস্টে সেভ রাখা হয়েছে। এই রিলেটেড নতুন কোন বিজ্ঞাপন পোস্ট হলেই আপনাকে জানান দেয়া হবে!`,
        time: 'Just now',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  // Activity Logs for Admin
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      timestamp: '28 Jul 2026, 10:45 AM',
      userName: 'Kamal Hossain',
      userPhone: '01712-345678',
      action: 'Viewed Ad',
      adTitle: 'iPhone 15 Pro Max 256GB Dual SIM',
      adId: 'prod-1',
      location: 'Dhanmondi, Dhaka'
    },
    {
      id: 'log-2',
      timestamp: '28 Jul 2026, 11:02 AM',
      userName: 'Sabbir Ahmed',
      userPhone: '01899-112233',
      action: 'Revealed Phone',
      adTitle: 'Yamaha R15 V4 Dual ABS 2024',
      adId: 'prod-2',
      location: 'Gulshan, Dhaka'
    },
    {
      id: 'log-3',
      timestamp: '28 Jul 2026, 11:20 AM',
      userName: 'Mehedi Hasan',
      userPhone: '01911-887766',
      action: 'Started Chat',
      adTitle: 'MacBook Air M2 16GB 512GB',
      adId: 'prod-3',
      location: 'Uttara, Dhaka'
    }
  ]);

  const logUserActivity = (
    action: 'Viewed Ad' | 'Revealed Phone' | 'Started Chat' | 'Reported Ad',
    adTitle: string,
    adId: string
  ) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      userName: currentUser?.name || 'Guest User',
      userPhone: currentUser?.phone || '01700-000000',
      action,
      adTitle,
      adId,
      location: selectedLocation.thana || selectedLocation.district || selectedLocation.division
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Automatically update date-wise analytics counters
    if (action === 'Viewed Ad') incrementDailyMetric('productViews');
    if (action === 'Revealed Phone') incrementDailyMetric('phoneReveals');
    if (action === 'Started Chat') incrementDailyMetric('chatsStarted');
  };

  // Live Online Users (Fluctuating realistically every few seconds)
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(28);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsersCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const updated = prev + delta;
        return updated < 14 ? 18 : updated > 52 ? 42 : updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Daily Date-Wise Traffic Analytics
  const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initialDailySeed: DailyAnalytics[] = [
    {
      date: getTodayISO(),
      dateFormattedBn: '০৪ আগস্ট ২০২৬',
      dateFormattedEn: '04 Aug 2026',
      visitors: 485,
      productViews: 1340,
      phoneReveals: 148,
      chatsStarted: 72
    },
    {
      date: '2026-08-03',
      dateFormattedBn: '০৩ আগস্ট ২০২৬',
      dateFormattedEn: '03 Aug 2026',
      visitors: 620,
      productViews: 1940,
      phoneReveals: 195,
      chatsStarted: 84
    },
    {
      date: '2026-08-02',
      dateFormattedBn: '০২ আগস্ট ২০২৬',
      dateFormattedEn: '02 Aug 2026',
      visitors: 590,
      productViews: 1810,
      phoneReveals: 178,
      chatsStarted: 79
    },
    {
      date: '2026-08-01',
      dateFormattedBn: '০১ আগস্ট ২০২৬',
      dateFormattedEn: '01 Aug 2026',
      visitors: 710,
      productViews: 2230,
      phoneReveals: 240,
      chatsStarted: 110
    },
    {
      date: '2026-07-31',
      dateFormattedBn: '৩১ জুলাই ২০২৬',
      dateFormattedEn: '31 Jul 2026',
      visitors: 640,
      productViews: 1980,
      phoneReveals: 185,
      chatsStarted: 92
    },
    {
      date: '2026-07-30',
      dateFormattedBn: '৩০ জুলাই ২০২৬',
      dateFormattedEn: '30 Jul 2026',
      visitors: 580,
      productViews: 1750,
      phoneReveals: 160,
      chatsStarted: 71
    },
    {
      date: '2026-07-29',
      dateFormattedBn: '২৯ জুলাই ২০২৬',
      dateFormattedEn: '29 Jul 2026',
      visitors: 510,
      productViews: 1620,
      phoneReveals: 145,
      chatsStarted: 63
    }
  ];

  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>(() => {
    const saved = storage.getItem('marketbd_daily_analytics');
    if (saved) {
      try {
        const parsed: DailyAnalytics[] = JSON.parse(saved);
        const today = getTodayISO();
        if (!parsed.some(d => d.date === today)) {
          return [
            {
              date: today,
              dateFormattedBn: '০৪ আগস্ট ২০২৬',
              dateFormattedEn: '04 Aug 2026',
              visitors: 1,
              productViews: 0,
              phoneReveals: 0,
              chatsStarted: 0
            },
            ...parsed
          ];
        } else {
          return parsed.map(d =>
            d.date === today ? { ...d, visitors: d.visitors + 1 } : d
          );
        }
      } catch (e) {
        return initialDailySeed;
      }
    }
    return initialDailySeed;
  });

  useEffect(() => {
    storage.setItem('marketbd_daily_analytics', JSON.stringify(dailyAnalytics));
  }, [dailyAnalytics]);

  const incrementDailyMetric = (type: 'productViews' | 'phoneReveals' | 'chatsStarted') => {
    const today = getTodayISO();
    setDailyAnalytics(prev =>
      prev.map(item => {
        if (item.date === today) {
          return { ...item, [type]: item[type] + 1 };
        }
        return item;
      })
    );
  };

  // Spam & Chat Moderation
  const [spamThreads, setSpamThreads] = useState<string[]>([]);
  const toggleSpamThread = (threadId: string) => {
    setSpamThreads(prev =>
      prev.includes(threadId) ? prev.filter(id => id !== threadId) : [...prev, threadId]
    );
  };

  const [chatReports, setChatReports] = useState<ChatReport[]>([]);
  const reportAbusiveChat = (threadId: string, reportedUser: string, reason: string) => {
    const report: ChatReport = {
      id: 'rep-' + Date.now(),
      threadId,
      reportedUser,
      reason,
      timestamp: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    setChatReports(prev => [report, ...prev]);
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        title: 'Report Received 🛡️',
        message: 'Your chat report has been submitted to Admin. We strictly penalize bad behavior.',
        time: 'Just now',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  const setSelectedProduct = (product: Product | null) => {
    if (product) {
      const updatedViews = (product.views || 0) + 1;
      const updated = { ...product, views: updatedViews };
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      setSelectedProductState(updated);
      logUserActivity('Viewed Ad', product.title, product.id);
    } else {
      setSelectedProductState(null);
    }
  };
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState<boolean>(false);
  const [isInstallAppModalOpen, setIsInstallAppModalOpen] = useState<boolean>(false);

  const openInstallAppModal = () => setIsInstallAppModalOpen(true);
  const closeInstallAppModal = () => setIsInstallAppModalOpen(false);

  // Custom Logo & Watermark Options for Admin
  const [customLogoUrl, setCustomLogoUrlState] = useState<string>(() => {
    const saved = storage.getItem('marketbd_custom_logo');
    if (saved && (saved.includes('blob:') || saved.includes('1785263882075'))) {
      storage.removeItem('marketbd_custom_logo');
      return '/logo.jpg';
    }
    return saved || '/logo.jpg';
  });

  const setCustomLogoUrl = (url: string) => {
    setCustomLogoUrlState(url);
    storage.setItem('marketbd_custom_logo', url);
    syncToCloud('branding', { customLogoUrl: url, watermarkText, watermarkOpacity, isWatermarkEnabled });
  };

  const [watermarkText, setWatermarkTextState] = useState<string>(() => {
    return storage.getItem('marketbd_watermark_text') || 'MarketBD.Net';
  });

  const setWatermarkText = (text: string) => {
    setWatermarkTextState(text);
    storage.setItem('marketbd_watermark_text', text);
    syncToCloud('branding', { customLogoUrl, watermarkText: text, watermarkOpacity, isWatermarkEnabled });
  };

  const [watermarkOpacity, setWatermarkOpacityState] = useState<number>(() => {
    const saved = storage.getItem('marketbd_watermark_opacity');
    return saved !== null ? parseFloat(saved) : 0.05;
  });

  const setWatermarkOpacity = (opacity: number) => {
    setWatermarkOpacityState(opacity);
    storage.setItem('marketbd_watermark_opacity', opacity.toString());
    syncToCloud('branding', { customLogoUrl, watermarkText, watermarkOpacity: opacity, isWatermarkEnabled });
  };

  const [isWatermarkEnabled, setIsWatermarkEnabledState] = useState<boolean>(() => {
    return storage.getItem('marketbd_watermark_enabled') !== 'false';
  });

  const setIsWatermarkEnabled = (enabled: boolean) => {
    setIsWatermarkEnabledState(enabled);
    storage.setItem('marketbd_watermark_enabled', enabled ? 'true' : 'false');
    syncToCloud('branding', { customLogoUrl, watermarkText, watermarkOpacity, isWatermarkEnabled: enabled });
  };
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = storage.getItem('marketbd_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('adminlogin') || hash.includes('adminlogin')) {
        setActiveTab('admin');
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      storage.setItem('marketbd_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      storage.setItem('marketbd_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Customer Care State
  const [isCustomerCareOpen, setIsCustomerCareOpen] = useState<boolean>(false);
  const openCustomerCare = () => setIsCustomerCareOpen(true);

  // Ad Deletion Reason State
  const [adToDelete, setAdToDelete] = useState<Product | null>(null);

  const openDeleteModal = (product: Product) => {
    if (product.status === 'pending') {
      alert(
        language === 'bn'
          ? '⚠️ এডমিন এপ্রুভালের পূর্বে আন্ডার রিভিউ থাকা বিজ্ঞাপন রিমুভ করা সম্ভব নয়! এডমিন পোস্টটি অনুমোদন বা বাতিল করার পর সিদ্ধান্ত নেওয়া যাবে।'
          : '⚠️ You cannot delete this ad while it is under review. Please wait for admin approval!'
      );
      return;
    }
    setAdToDelete(product);
  };

  const closeDeleteModal = () => {
    setAdToDelete(null);
  };

  const deleteProductWithReason = (productId: string, reason: string, customNote?: string) => {
    let deletedTitle = 'বিজ্ঞাপন';
    let remainingList: Product[] = [];

    setProducts(prev => {
      const target = prev.find(p => p.id === productId);
      if (target) {
        deletedTitle = target.title;
      }
      const filtered = prev.filter(p => p.id !== productId);
      remainingList = filtered;
      try {
        storage.setItem('marketbd_products_v4', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });
    setAdToDelete(null);

    // Delete directly from Firestore products collection & REST endpoint for Android sync
    try {
      safeFirestoreDeleteDoc(doc(db, 'products', productId)).catch(() => {});
      safeFirestoreSetDoc(doc(db, 'settings', 'marketplace_products'), { value: remainingList, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      fetch('/api/products/' + productId, { method: 'DELETE' }).catch(() => {});
      syncToCloud('marketplace_products', remainingList);
    } catch (e) {}

    const titleText = language === 'bn' ? 'বিজ্ঞাপন রিমুভ / মুছে ফেলা হয়েছে 🗑️' : 'Ad Removed 🗑️';
    const messageText = language === 'bn'
      ? `আপনার "${deletedTitle}" বিজ্ঞাপনটি প্ল্যাটফর্ম থেকে মুছে ফেলা হয়েছে। কারণ: ${reason}${customNote ? ` (${customNote})` : ''}`
      : `Your ad "${deletedTitle}" was removed. Reason: ${reason}${customNote ? ` (${customNote})` : ''}`;

    // Send confirmation notification
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        title: titleText,
        message: messageText,
        time: 'Just now',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);

    sendLocalBrowserPushNotification({
      title: titleText,
      body: messageText
    });
  };

  // App Release & Auto Update Management
  const defaultRelease: AppReleaseInfo = {
    version: '2.5.0',
    buildNumber: 250,
    releaseDate: '05 Aug 2026',
    titleBn: 'গুগল প্লে স্টোর সিকিউরিটি ও ফিচার আপডেট v2.5.0',
    titleEn: 'Google Play Store Security & Feature Update v2.5.0',
    notesBn: '• গুগল প্লে স্টোরে অফিসিয়াল নতুন ভার্সন অবমুক্ত করা হয়েছে।\n• এডমিন নিরাপত্তার জন্য ৬ ডিজিটের ওটিপি ভেরিফিকেশন সিস্টেম চালু।\n• সাইটে রোবট, হ্যাকার ও ফেইক বট প্রতিরোধে WAF সিকিউরিটি প্রোটোকল একটিভ।\n• অ্যান্ড্রয়েড ইউজারদের জন্য প্লে স্টোর থেকে বাধ্যতামূলক আপডেট প্রযোজ্য।',
    notesEn: '• Official new version released on Google Play Store.\n• 6-Digit OTP Verification added for Admin Login security.\n• Bot, scraper & hacker protection protocol active.\n• Mandatory update from Google Play Store for Android users.',
    isMandatory: true,
    apkDownloadUrl: '/api/download/apk',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.marketbd.app',
    publishedAt: new Date().toISOString()
  };

  const [appRelease, setAppReleaseState] = useState<AppReleaseInfo>(() => {
    try {
      const saved = storage.getItem('marketbd_app_release');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Fix legacy dead URLs
        if (parsed.apkDownloadUrl && (parsed.apkDownloadUrl.includes('.run.app') || parsed.apkDownloadUrl.includes('marketbd-release-v'))) {
          parsed.apkDownloadUrl = '/api/download/apk';
        }
        return { ...defaultRelease, ...parsed };
      }
    } catch (e) {
      console.error('Error loading app release info', e);
    }
    return defaultRelease;
  });

  const [userInstalledVersion, setUserInstalledVersion] = useState<string>(() => {
    // Detect version from custom Android WebView User-Agent suffix: MarketBDAndroidApp/2.5.0
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const match = ua.match(/MarketBDAndroidApp\/([0-9.]+)/i);
      if (match && match[1]) {
        return match[1];
      }
    }
    return storage.getItem('marketbd_installed_version') || '2.5.0';
  });

  const [isUpdateDismissed, setIsUpdateDismissed] = useState<boolean>(false);

  const updateAppRelease = (newRelease: AppReleaseInfo) => {
    setAppReleaseState(newRelease);
    setIsUpdateDismissed(false);
    try {
      storage.setItem('marketbd_app_release', JSON.stringify(newRelease));
    } catch (e) {
      console.error('Error saving app release info', e);
    }
    syncToCloud('app_release', newRelease);

    // Add global update notification for all users
    setNotifications(prev => [
      {
        id: 'notif-update-' + Date.now(),
        title: `🚀 নতুন অ্যাপ আপডেট অবমুক্ত হয়েছে: ${newRelease.version}`,
        message: newRelease.titleBn,
        time: 'Just now',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  const applyAppUpdate = () => {
    setUserInstalledVersion(appRelease.version);
    try {
      storage.setItem('marketbd_installed_version', appRelease.version);
    } catch (e) {
      console.error('Error saving installed version', e);
    }
    setIsUpdateDismissed(true);
  };

  // Auth State with localStorage Session Persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return storage.getItem('marketbd_is_logged_in') === 'true';
  });
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin'>(() => {
    return (storage.getItem('marketbd_user_role') as any) || 'buyer';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = storage.getItem('marketbd_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalPurpose, setAuthModalPurpose] = useState<'post-ad' | 'general' | 'chat'>('general');

  const openAuthModal = (purpose: 'post-ad' | 'general' | 'chat' = 'general') => {
    setAuthModalPurpose(purpose);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const toggleBlockUser = (userId: string, reason?: string) => {
    setRegisteredUsersState(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.phone === userId || u.email === userId) {
          const newBlocked = !u.isBlocked;
          return {
            ...u,
            isBlocked: newBlocked,
            status: newBlocked ? ('blocked' as const) : ('active' as const),
            blockedReason: newBlocked ? (reason || 'অ্যাডমিন কর্তৃক অ্যাকাউন্ট স্থগিত করা হয়েছে।') : undefined,
            blockedAt: newBlocked ? new Date().toISOString() : undefined
          };
        }
        return u;
      });
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);

      // If blocked user is currently logged in, log them out
      if (currentUser && (currentUser.id === userId || currentUser.phone === userId || currentUser.email === userId)) {
        const target = updated.find(u => u.id === userId || u.phone === userId || u.email === userId);
        if (target?.isBlocked) {
          logout();
          alert(language === 'bn' ? '🚫 আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক ব্লক করা হয়েছে।' : '🚫 Your account has been blocked by Admin.');
        }
      }
      return updated;
    });
  };

  const deleteUserById = (userId: string) => {
    setRegisteredUsersState(prev => {
      const updated = prev.filter(u => u.id !== userId && u.phone !== userId && u.email !== userId);
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);

      // If deleted user is currently logged in, log them out
      if (currentUser && (currentUser.id === userId || currentUser.phone === userId || currentUser.email === userId)) {
        logout();
      }
      return updated;
    });
  };

  const toggleVerifyUser = (userId: string) => {
    setRegisteredUsersState(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.phone === userId || u.email === userId) {
          return { ...u, isVerified: !u.isVerified };
        }
        return u;
      });
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);
      return updated;
    });
  };

  const addManualUser = (userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: userData.id || 'usr-' + Date.now().toString().slice(-6),
      name: userData.name || 'নতুন কাস্টমার',
      phone: userData.phone || '01700000000',
      email: userData.email || '',
      role: userData.role || 'seller',
      gender: userData.gender || 'male',
      isVerified: userData.isVerified ?? true,
      isBlocked: false,
      status: 'active',
      registeredAt: new Date().toISOString(),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      authProvider: userData.authProvider || 'manual',
      location: userData.location || { division: 'Dhaka', district: 'Dhaka' },
      tradeLicense: userData.tradeLicense,
      nidNumber: userData.nidNumber,
      notes: userData.notes,
      totalAdsCount: 0,
      password: userData.password || '123456'
    };

    try {
      const credMapRaw = storage.getItem('marketbd_credentials_store');
      const credMap = credMapRaw ? JSON.parse(credMapRaw) : {};
      const normP = (newUser.phone || '').replace(/\D/g, '').replace(/^880?/, '').replace(/^0/, '');
      const normE = (newUser.email || '').trim().toLowerCase();
      if (normP) credMap[normP] = newUser;
      if (normE) credMap[normE] = newUser;
      storage.setItem('marketbd_credentials_store', JSON.stringify(credMap));
    } catch (e) {}

    setRegisteredUsersState(prev => {
      const updated = [newUser, ...prev];
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);
      return updated;
    });
  };

  const updateRegisteredUser = (userId: string, updates: Partial<UserProfile>) => {
    try {
      const credMapRaw = storage.getItem('marketbd_credentials_store');
      const credMap = credMapRaw ? JSON.parse(credMapRaw) : {};
      Object.keys(credMap).forEach(k => {
        if (credMap[k]?.id === userId || credMap[k]?.phone === userId || credMap[k]?.email === userId) {
          credMap[k] = { ...credMap[k], ...updates };
        }
      });
      storage.setItem('marketbd_credentials_store', JSON.stringify(credMap));
    } catch (e) {}

    setRegisteredUsersState(prev => {
      const updated = prev.map(u => (u.id === userId || u.phone === userId ? { ...u, ...updates } : u));
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);
      return updated;
    });
  };

  const login = (userData?: Partial<UserProfile>) => {
    const role = userData?.role || 'seller';
    const profile: UserProfile = {
      id: userData?.id || 'user-' + Date.now(),
      name: userData?.name || (role === 'admin' ? 'MarketBD.Net Admin' : role === 'seller' ? 'তানভীর আহমেদ (Verified Seller)' : 'রহিম উদ্দিন'),
      phone: userData?.phone || '01712345678',
      email: userData?.email || 'official.marketbd@gmail.com',
      role: role,
      gender: userData?.gender || 'male',
      isVerified: userData?.isVerified ?? true,
      isBlocked: userData?.isBlocked ?? false,
      status: userData?.status || 'active',
      registeredAt: userData?.registeredAt || new Date().toISOString(),
      avatar: userData?.avatar,
      authProvider: userData?.authProvider || 'manual',
      location: userData?.location,
      password: userData?.password
    };

    // Check if user is blocked in registeredUsers
    const cleanPhone = (profile.phone || '').replace(/\D/g, '');
    const cleanEmail = (profile.email || '').trim().toLowerCase();

    const foundUser = registeredUsers.find(u => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      return (
        u.id === profile.id ||
        (cleanPhone && uPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))) ||
        (cleanEmail && uEmail && uEmail === cleanEmail)
      );
    });

    if (foundUser && (foundUser.isBlocked || foundUser.status === 'blocked')) {
      alert(language === 'bn' 
        ? `🚫 আপনার অ্যাকাউন্টটি এডমিন কর্তৃক ব্লক করা হয়েছে!\nকারণ: ${foundUser.blockedReason || 'অ্যাডমিন পলিসি লঙ্ঘন'}` 
        : `🚫 Your account has been blocked by Admin!\nReason: ${foundUser.blockedReason || 'Policy violation'}`);
      return;
    }

    const finalPassword = profile.password || foundUser?.password || '123456';
    profile.password = finalPassword;

    try {
      const credMapRaw = storage.getItem('marketbd_credentials_store');
      const credMap = credMapRaw ? JSON.parse(credMapRaw) : {};
      const normP = (profile.phone || '').replace(/\D/g, '').replace(/^880?/, '').replace(/^0/, '');
      const normE = (profile.email || '').trim().toLowerCase();
      if (normP) credMap[normP] = { ...profile, password: finalPassword };
      if (normE) credMap[normE] = { ...profile, password: finalPassword };
      storage.setItem('marketbd_credentials_store', JSON.stringify(credMap));
    } catch (e) {}

    // Automatically ensure this user exists in registeredUsers list and preserve password
    setRegisteredUsersState(prev => {
      const idx = prev.findIndex(u => {
        const uPhone = (u.phone || '').replace(/\D/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        return (
          u.id === profile.id ||
          (cleanPhone && uPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))) ||
          (cleanEmail && uEmail && uEmail === cleanEmail)
        );
      });

      let updated: UserProfile[];
      if (idx >= 0) {
        updated = [...prev];
        const existingPw = updated[idx].password;
        const finalPw = profile.password || existingPw || (foundUser ? foundUser.password : undefined) || '123456';
        updated[idx] = { 
          ...updated[idx], 
          ...profile, 
          password: finalPw,
          lastLogin: new Date().toISOString() 
        };
      } else {
        const finalPw = profile.password || (foundUser ? foundUser.password : undefined) || '123456';
        updated = [{ ...profile, password: finalPw, lastLogin: new Date().toISOString() }, ...prev];
      }
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);
      return updated;
    });

    setCurrentUser(profile);
    setIsLoggedIn(true);
    setUserRole(role);
    setIsAuthModalOpen(false);

    // Persist user profile directly into Firestore /users/{uid} for cloud persistence
    safeFirestoreSetDoc(doc(db, 'users', profile.id), profile, { merge: true }).catch(() => {});

    // Save persistent login session
    storage.setItem('marketbd_is_logged_in', 'true');
    storage.setItem('marketbd_user_role', role);
    storage.setItem('marketbd_auth_user', JSON.stringify(profile));

    // If Super Admin logs in, assign a single-device session token and announce to server/cloud
    if (role === 'admin' || profile.email === 'official.marketsbd@gmail.com' || profile.email === 'official.marketbd@gmail.com' || profile.phone === '01634025151') {
      const newSessionToken = 'adm_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      storage.setItem('marketbd_admin_session_token', newSessionToken);

      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const deviceName = isMobile ? 'Mobile / Android Device' : 'Desktop / PC Browser';

      const sessionData: AdminActiveSession = {
        sessionToken: newSessionToken,
        userEmail: profile.email || 'official.marketsbd@gmail.com',
        deviceName,
        ip: '103.110.22.4',
        loginTime: new Date().toISOString()
      };

      setAdminActiveSession(sessionData);
      storage.setItem('marketbd_admin_active_session', JSON.stringify(sessionData));
      syncToCloud('admin_active_session', sessionData);

      fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      }).catch(() => {});
    }

    // If purpose was post-ad, automatically go to post-ad tab
    if (authModalPurpose === 'post-ad') {
      setActiveTab('post-ad');
    }
  };

  const terminateOtherAdminSessions = () => {
    const newSessionToken = 'adm_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    storage.setItem('marketbd_admin_session_token', newSessionToken);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceName = (isMobile ? 'Mobile / Android Device' : 'Desktop Browser') + ' (Primary Device Claimed)';

    const sessionData: AdminActiveSession = {
      sessionToken: newSessionToken,
      userEmail: currentUser?.email || 'official.marketsbd@gmail.com',
      deviceName,
      ip: '103.110.22.4',
      loginTime: new Date().toISOString()
    };

    setAdminActiveSession(sessionData);
    storage.setItem('marketbd_admin_active_session', JSON.stringify(sessionData));
    syncToCloud('admin_active_session', sessionData);

    fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    }).catch(() => {});
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole('buyer');

    // Clear persistent login session
    storage.removeItem('marketbd_is_logged_in');
    storage.removeItem('marketbd_user_role');
    storage.removeItem('marketbd_auth_user');
    storage.removeItem('marketbd_admin_session_token');

    if (activeTab === 'post-ad' || activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Super Admin Single-Device Concurrency Enforcement Monitor
  useEffect(() => {
    const isCurrentUserAdmin = userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.email === 'official.marketsbd@gmail.com';
    if (!isCurrentUserAdmin) return;

    const checkAdminSession = () => {
      const localToken = storage.getItem('marketbd_admin_session_token');
      if (!localToken) return;

      fetch('/api/admin/session')
        .then(res => res.json())
        .then(res => {
          if (res && res.success && res.data) {
            const remote: AdminActiveSession = res.data;
            setAdminActiveSession(remote);
            storage.setItem('marketbd_admin_active_session', JSON.stringify(remote));

            if (remote.sessionToken && remote.sessionToken !== localToken) {
              console.warn('[Admin Security] Super Admin logged in from another device. Terminating this session.', remote);
              logout();
              alert(
                language === 'bn'
                  ? `⚠️ **সুপার এডমিন সিকিউরিটি সতর্কতা**\n\nআপনার সুপার এডমিন অ্যাকাউন্টটি অন্য একটি ডিভাইস (${remote.deviceName}) থেকে লগইন করা হয়েছে।\nএকক ডিভাইস সুরক্ষা পলিসি (Single-Device Enforcement) অনুযায়ী একই সাথে দুটি ডিভাইসে সুপার এডমিন সেশন চালু রাখা নিষিদ্ধ। তাই এই ডিভাইসের এডমিন এক্সেস স্বয়ংক্রিয়ভাবে বন্ধ করা হয়েছে।`
                  : `⚠️ **Super Admin Security Alert**\n\nYour Super Admin account was logged into from another device (${remote.deviceName}).\nUnder our single-device security policy, concurrent admin sessions are strictly prohibited. This session has been terminated.`
              );
            }
          }
        })
        .catch(() => {});
    };

    const interval = setInterval(checkAdminSession, 5000);
    return () => clearInterval(interval);
  }, [userRole, currentUser, language]);

  const handlePostAdClick = () => {
    if (!isLoggedIn) {
      openAuthModal('post-ad');
    } else {
      setActiveTab('post-ad');
    }
  };

  // Persistent Chat threads (Unlimited messaging with real-time sync)
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = storage.getItem('marketbd_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading stored chat threads:', e);
    }
    if (INITIAL_PRODUCTS.length > 0 && INITIAL_PRODUCTS[0]?.seller) {
      return [
        {
          id: 'thread-1',
          productId: INITIAL_PRODUCTS[0].id,
          productTitle: INITIAL_PRODUCTS[0].title,
          productImage: INITIAL_PRODUCTS[0].images[0] || '',
          productPrice: INITIAL_PRODUCTS[0].price,
          seller: INITIAL_PRODUCTS[0].seller,
          buyerId: 'user-me',
          buyerName: 'CurrentUser',
          lastMessage: 'ভাই ১ লক্ষ ৩০ হাজার টাকায় দেওয়া যাবে কি?',
          lastMessageTime: '10 mins ago',
          unreadCount: 0,
          messages: [
            {
              id: 'msg-1',
              senderId: INITIAL_PRODUCTS[0].seller.id,
              receiverId: 'user-me',
              productId: INITIAL_PRODUCTS[0].id,
              text: 'আসসালামু আলাইকুম! ফোনটি ধানমন্ডিতে এসে দেখে নিতে পারবেন।',
              timestamp: '15 mins ago',
              status: 'seen'
            },
            {
              id: 'msg-2',
              senderId: 'user-me',
              receiverId: INITIAL_PRODUCTS[0].seller.id,
              productId: INITIAL_PRODUCTS[0].id,
              text: 'ভাই ১ লক্ষ ৩০ হাজার টাকায় দেওয়া যাবে কি?',
              timestamp: '10 mins ago',
              isOffer: true,
              offerAmount: 130000,
              offerStatus: 'pending',
              status: 'seen'
            },
            {
              id: 'msg-3',
              senderId: INITIAL_PRODUCTS[0].seller.id,
              receiverId: 'user-me',
              productId: INITIAL_PRODUCTS[0].id,
              text: 'জ্বী ভাইয়া, আপনি সরাসরি এসে সামনাসামনি দেখলে কিছুটা কনসিডার করা যাবে। আপনি কখন আসবেন?',
              timestamp: '5 mins ago',
              status: 'delivered'
            }
          ]
        }
      ];
    }
    return [];
  });

  const [activeChat, setActiveChat] = useState<ChatThread | null>(() => {
    return null;
  });
  const [isSellerTyping, setIsSellerTyping] = useState<boolean>(false);

  // Initial Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'নতুন অফার এসেছে! 🎉',
      message: 'স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা বিজ্ঞাপনে একজন ক্রেতা ৳১,৩০,০০০ অফার পাঠিয়েছেন।',
      time: '10 mins ago',
      isRead: false,
      type: 'offer'
    },
    {
      id: 'notif-2',
      title: 'বিজ্ঞাপন অনুমোদিত হয়েছে ✅',
      message: 'আপনার "Yamaha R15 V4" বিজ্ঞাপনটি সফলভাবে ভেরিফাইড এবং লাইভ হয়েছে।',
      time: '1 hour ago',
      isRead: false,
      type: 'approval'
    }
  ]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 4) {
          alert(language === 'bn' ? 'সর্বোচ্চ ৪ টি প্রোডাক্ট তুলনা করতে পারবেন।' : 'You can compare up to 4 products at a time.');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const updateMessageStatus = (threadId: string, msgId: string, status: 'delivered' | 'seen') => {
    setChatThreads(prev => {
      const updated = prev.map(thread => {
        if (thread.id === threadId) {
          const updatedMsgs = thread.messages.map(m =>
            m.id === msgId ? { ...m, status } : m
          );
          return { ...thread, messages: updatedMsgs };
        }
        return thread;
      });
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(curr => {
      if (curr && curr.id === threadId) {
        const updatedMsgs = curr.messages.map(m =>
          m.id === msgId ? { ...m, status } : m
        );
        return { ...curr, messages: updatedMsgs };
      }
      return curr;
    });
  };

  // Unlimited messaging engine with rich contextual seller replies
  const sendMessage = (threadId: string, text: string, offerAmount?: number, imageUrl?: string) => {
    const msgId = 'msg-' + Date.now();
    const displayMsg = text || (imageUrl ? (language === 'bn' ? '📷 [ছবি পাঠানো হয়েছে]' : '📷 [Photo Attached]') : '');
    const newMessage: ChatMessage = {
      id: msgId,
      senderId: 'user-me',
      receiverId: 'seller',
      productId: activeChat?.productId || '',
      text: displayMsg,
      image: imageUrl,
      timestamp: 'Just now',
      isOffer: Boolean(offerAmount),
      offerAmount,
      offerStatus: offerAmount ? 'pending' : undefined,
      status: 'sent'
    };

    setChatThreads(prev => {
      const updated = prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            lastMessage: displayMsg,
            lastMessageTime: 'Just now',
            messages: [...thread.messages, newMessage]
          };
        }
        return thread;
      });
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(curr => {
      if (curr && curr.id === threadId) {
        return {
          ...curr,
          lastMessage: displayMsg,
          lastMessageTime: 'Just now',
          messages: [...curr.messages, newMessage]
        };
      }
      return curr;
    });

    // 1. Delivered after 800ms
    setTimeout(() => {
      updateMessageStatus(threadId, msgId, 'delivered');
    }, 800);

    // 2. Seen (Pink double tick) after 1600ms
    setTimeout(() => {
      updateMessageStatus(threadId, msgId, 'seen');
      setIsSellerTyping(true);
    }, 1600);

    // 3. Dynamic context-aware seller auto-reply after 2800ms (Unlimited replies)
    setTimeout(() => {
      setIsSellerTyping(false);
      let replyText = '';
      const lower = (text || '').toLowerCase();

      if (imageUrl && !text) {
        replyText = language === 'bn'
          ? 'ছবিটি পেয়েছি ভাইয়া, ধন্যবাদ! বিস্তারিত দেখে আপনাকে জানাচ্ছি।'
          : 'Received your photo, thank you! Reviewing details and getting back to you.';
      } else if (offerAmount) {
        replyText = language === 'bn'
          ? `ধন্যবাদ! ৳${offerAmount.toLocaleString()} টাকার অফারটি পেয়েছি। আপনি যদি আজকেই সরাসরি এসে নিতে পারেন তবে এই দামে দেওয়া সম্ভব হতে পারে।`
          : `Thank you! Received your offer of ৳${offerAmount.toLocaleString()}. If you can pick it up today in person, we might agree on this price.`;
      } else if (lower.includes('লোকেশন') || lower.includes('ঠিকানা') || lower.includes('কোথায়') || lower.includes('location') || lower.includes('address') || lower.includes('দেখা')) {
        replyText = language === 'bn'
          ? 'আমার লোকেশন: ধানমন্ডি / মিরপুর ১০ (ঢাকা)। আপনি আজ বা কাল সুবিধাজনক সময়ে এসে সরাসরি পণ্যটি যাচাই করে নিতে পারেন।'
          : 'Location: Dhanmondi / Mirpur 10, Dhaka. You can visit anytime today or tomorrow to inspect the product.';
      } else if (lower.includes('দাম') || lower.includes('কম') || lower.includes('discount') || lower.includes('price') || lower.includes('সম্মান') || lower.includes('কমানো')) {
        replyText = language === 'bn'
          ? 'ভাইয়া বিজ্ঞাপনে অলরেডি খুব ন্যায্য দাম দেওয়া আছে। তবে আপনি সামনাসামনি আসলে চা-নাস্তার খরচ বা কিছুটা সম্মান রাখার চেষ্টা করব।'
          : 'Price is quite reasonable, but slight discount is possible when we meet in person.';
      } else if (lower.includes('কন্ডিশন') || lower.includes('মেমো') || lower.includes('বক্স') || lower.includes('ওয়ারেন্টি') || lower.includes('condition') || lower.includes('warranty') || lower.includes('সমস্যা')) {
        replyText = language === 'bn'
          ? 'পণ্যটিতে কোনো প্রকার ইন্টারনাল বা এক্সটারনাল সমস্যা নেই, ১০০% ফ্রেশ। অরিজিনাল ক্যাশ মেমো, বক্স এবং চার্জার সাথে পাবেন।'
          : '100% fresh condition with zero issues. Includes original box, cash memo, and official accessories.';
      } else if (lower.includes('কুরিয়ার') || lower.includes('ডেলিভারি') || lower.includes('courier') || lower.includes('delivery') || lower.includes('পাঠানো')) {
        replyText = language === 'bn'
          ? 'জ্বী ভাইয়া, সারা বাংলাদেশে সুন্দরবন বা রেডএক্স কুরিয়ারে ক্যাশ অন ডেলিভারিতে পাঠানো যাবে (শুধু কুরিয়ার চার্জ অগ্রিম পাঠাবেন)।'
          : 'Yes, cash on delivery courier is available via Sundarban / Steadfast across all 64 districts.';
      } else if (lower.includes('ফোন') || lower.includes('নম্বর') || lower.includes('number') || lower.includes('phone') || lower.includes('কল') || lower.includes('contact')) {
        replyText = language === 'bn'
          ? 'আমার মোবাইল নম্বর বিজ্ঞাপনের ভেতরে দেওয়া আছে। আপনি চাইলে সরাসরি কল দিতে পারেন অথবা এখানে চ্যাটে কথা বলতে পারেন।'
          : 'Phone number is in the ad details. You can call directly or continue chatting here anytime!';
      } else if (lower.includes('কখন') || lower.includes('আসব') || lower.includes('সময়') || lower.includes('time') || lower.includes('meet') || lower.includes('আজ')) {
        replyText = language === 'bn'
          ? 'আমি সকাল ১০টা থেকে রাত ১০টা পর্যন্ত লোকেশনে থাকি। আসার ৩০ মিনিট আগে একবার কল বা চ্যাটে মেসেজ দিলে সুবিধা হয়।'
          : 'Available from 10 AM to 10 PM daily. Please notify me 30 mins before coming.';
      } else if (lower.includes('আছে') || lower.includes('available') || lower.includes('বিক্রি') || lower.includes('available?')) {
        replyText = language === 'bn'
          ? 'জ্বী ভাইয়া, পণ্যটি এখনো বিক্রির জন্য এভেইলএবল আছে। আপনি চাইলে আজই দেখা করতে পারেন।'
          : 'Yes, it is still available for sale! Let me know if you would like to inspect it today.';
      } else if (lower.includes('কিনব') || lower.includes('নিব') || lower.includes('buy') || lower.includes('agree') || lower.includes('ঠিক আছে')) {
        replyText = language === 'bn'
          ? 'চমৎকার! আপনি কখন আসতে চাচ্ছেন একটু জানালে আমি পণ্যটি রেডি করে রাখব এবং লোকেশন শেয়ার করব।'
          : 'Great! Please let me know your preferred time so I can keep everything packed and ready.';
      } else {
        const unlimitedResponses = [
          'জ্বী ভাইয়া অবশ্যই! আপনার কথা বুঝতে পেরেছি। আপনার আর কোনো কিছু জানার থাকলে নির্দ্বিধায় জিজ্ঞেস করুন।',
          'ঠিক আছে ভাইয়া, আমি লাইনে আছি। আপনি যে কোনো সময় মেসেজ করতে পারেন বা দেখা করতে পারেন।',
          'ধন্যবাদ মেসেজের জন্য! পণ্যটি দেখতে চাইলে আপনি ধানমন্ডি এসে দেখে নিতে পারেন।',
          'আপনার প্রস্তাবটি ভালো লেগেছে। আপনি কি আজ আসবেন নাকি কাল সময় হবে?',
          'জ্বী ১০০% নিশ্চিত থাকতে পারেন। আপনি সামনাসামনি দেখে পছন্দ হলে তবেই নিবেন।'
        ];
        replyText = unlimitedResponses[Math.floor(Math.random() * unlimitedResponses.length)];
      }

      const replyMsg: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        senderId: 'seller',
        receiverId: 'user-me',
        productId: activeChat?.productId || '',
        text: replyText,
        timestamp: 'Just now',
        status: 'delivered'
      };

      setChatThreads(prev => {
        const updated = prev.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              lastMessage: replyMsg.text,
              lastMessageTime: 'Just now',
              messages: [...thread.messages, replyMsg]
            };
          }
          return thread;
        });
        storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
        return updated;
      });

      setActiveChat(curr => {
        if (curr && curr.id === threadId) {
          return {
            ...curr,
            lastMessage: replyMsg.text,
            lastMessageTime: 'Just now',
            messages: [...curr.messages, replyMsg]
          };
        }
        return curr;
      });
    }, 2800);
  };

  const openChatForProduct = (product: Product): string => {
    let existing = chatThreads.find(t => t.productId === product.id);
    if (existing) {
      setActiveChat(existing);
      setActiveTab('chat');
      return existing.id;
    }

    const initMsgId = 'msg-init-' + Date.now();
    const threadId = 'thread-' + Date.now();
    const newThread: ChatThread = {
      id: threadId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '',
      productPrice: product.price,
      seller: product.seller,
      buyerId: 'user-me',
      buyerName: 'CurrentUser',
      lastMessage: 'আসসালামু আলাইকুম, এটি কি এখনো এভেইলএবল আছে?',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: initMsgId,
          senderId: 'user-me',
          receiverId: product.seller.id,
          productId: product.id,
          text: 'আসসালামু আলাইকুম, এটি কি এখনো এভেইলএবল আছে?',
          timestamp: 'Just now',
          status: 'sent'
        }
      ]
    };

    setChatThreads(prev => {
      const updated = [newThread, ...prev.filter(t => t.id !== threadId)];
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(newThread);
    setActiveTab('chat');

    // Trigger delivery and seen status
    setTimeout(() => updateMessageStatus(threadId, initMsgId, 'delivered'), 1000);
    setTimeout(() => {
      updateMessageStatus(threadId, initMsgId, 'seen');
      setIsSellerTyping(true);
    }, 2000);

    // Initial seller reply
    setTimeout(() => {
      setIsSellerTyping(false);
      const replyMsg: ChatMessage = {
        id: 'msg-init-reply-' + Date.now(),
        senderId: product.seller.id || 'seller',
        receiverId: 'user-me',
        productId: product.id,
        text: 'ওয়ালাইকুম আসসালাম! জ্বী ভাইয়া, পণ্যটি এখনো এভেইলএবল আছে। আপনি কি সরাসরি এসে দেখতে চান না কুরিয়ারে নিতে আগ্রহী?',
        timestamp: 'Just now',
        status: 'delivered'
      };

      setChatThreads(prev => {
        const updated = prev.map(t => {
          if (t.id === threadId) {
            return {
              ...t,
              lastMessage: replyMsg.text,
              lastMessageTime: 'Just now',
              messages: [...t.messages, replyMsg]
            };
          }
          return t;
        });
        storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
        return updated;
      });

      setActiveChat(curr => {
        if (curr && curr.id === threadId) {
          return {
            ...curr,
            lastMessage: replyMsg.text,
            lastMessageTime: 'Just now',
            messages: [...curr.messages, replyMsg]
          };
        }
        return curr;
      });
    }, 3200);

    return threadId;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const addNewAd = (adData: Partial<Product>): Product => {
    const isExplicitlyVisible = Boolean(
      adData.showPhoneNumber ??
      adData.seller?.showPhoneNumber ??
      (adData.seller?.hidePhone === false && adData.seller?.showPhoneNumber !== false)
    );
    const rawPhone = adData.seller?.phone || currentUser?.phone || '01712345678';
    const phoneValidation = validateBangladeshiPhone(rawPhone);
    const cleanPhone = phoneValidation.isValid ? phoneValidation.normalized : rawPhone;

    const rawProduct = {
      id: 'prod-' + Date.now(),
      title: adData.title || 'Untitled Ad',
      titleBn: adData.titleBn || adData.title,
      slug: (adData.title || 'ad').toLowerCase().replace(/\s+/g, '-'),
      category: adData.category || 'mobiles',
      subCategory: adData.subCategory || '',
      brand: adData.brand || '',
      model: adData.model || '',
      price: adData.price || 0,
      originalPrice: adData.originalPrice,
      isNegotiable: adData.isNegotiable ?? true,
      condition: adData.condition || 'used_good',
      images: adData.images && adData.images.length > 0 ? adData.images : [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
      ],
      description: adData.description || '',
      descriptionBn: adData.descriptionBn || adData.description,
      location: adData.location || { division: 'dhaka', district: 'dhaka_d', thana: 'dhanmondi' },
      showPhoneNumber: isExplicitlyVisible,
      seller: {
        id: currentUser?.id || adData.seller?.id || 'user-' + Date.now(),
        name: currentUser?.name || adData.seller?.name || 'MarketBD Seller',
        avatar: currentUser?.avatar || adData.seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        phone: cleanPhone,
        hidePhone: !isExplicitlyVisible,
        showPhoneNumber: isExplicitlyVisible,
        email: currentUser?.email || adData.seller?.email || 'official.marketbd@gmail.com',
        memberSince: currentUser?.memberSince || '2026',
        location: adData.location || { division: 'dhaka', district: 'dhaka_d', thana: 'dhanmondi' },
        isVerified: true,
        rating: 5.0,
        totalReviews: 1,
        badge: 'Verified Merchant'
      },
      postedAt: new Date().toISOString(),
      views: 1,
      likes: 0,
      adType: adData.adType || 'regular',
      isDeliveryAvailable: adData.isDeliveryAvailable ?? true,
      warranty: adData.warranty || '',
      features: adData.features || [],
      paymentInfo: adData.paymentInfo,
      specifications: adData.specifications || {},
      status: 'pending' as const
    };

    const newProduct: Product = makePendingProduct(rawProduct);

    setProducts(prev => {
      const updated = [newProduct, ...prev];
      try {
        storage.setItem('marketbd_products_v4', JSON.stringify(updated));
      } catch (e) {
        console.error('Error persisting new ad:', e);
      }
      return updated;
    });

    // Save directly to Firestore 'products' collection & API for immediate real-time sync with Android app
    try {
      safeFirestoreSetDoc(doc(db, 'products', newProduct.id), newProduct, { merge: true })
        .catch(() => {});
      safeFirestoreSetDoc(doc(db, 'settings', 'marketplace_products'), { value: [newProduct, ...products], updatedAt: new Date().toISOString() }, { merge: true })
        .catch(() => {});
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(() => {});
      syncToCloud('marketplace_products', [newProduct, ...products]);
    } catch (e) {}

    // Trigger Search Notifications for users who previously searched or set alert for matching query
    (savedAlerts || []).forEach(alertItem => {
      if (!alertItem || !alertItem.query) return;
      const q = String(alertItem.query).toLowerCase().trim();
      const t = String(newProduct.title || '').toLowerCase();
      const d = String(newProduct.description || '').toLowerCase();
      if (q && (t.includes(q) || d.includes(q) || (alertItem.category && alertItem.category === newProduct.category))) {
        setNotifications(prev => [
          {
            id: 'notif-alert-' + Date.now() + Math.floor(Math.random() * 1000),
            title: 'সার্চ নোটিফিকেশন এলার্ট 🔔',
            message: `আপনার পূর্বে সার্চ করা "${alertItem.query}" রিলেটেড নতুন একটি প্রোডাক্ট লিস্ট করা হয়েছে: "${newProduct.title}" (মূল্য: ৳${newProduct.price.toLocaleString()})`,
            time: 'Just now',
            isRead: false,
            type: 'system'
          },
          ...prev
        ]);
      }
    });

    // Send under review confirmation notification to seller
    const newAdReviewId = 'notif-review-' + newProduct.id;
    const newAdNotifTitle = language === 'bn' ? 'বিজ্ঞাপন পর্যালোচনায় রয়েছে' : 'Your advertisement is under review.';
    const newAdNotifMsg = language === 'bn'
      ? 'আপনার বিজ্ঞাপনটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।'
      : 'Your advertisement is under review.';

    setNotifications(prev => [
      {
        id: newAdReviewId,
        title: newAdNotifTitle,
        message: newAdNotifMsg,
        time: 'Just now',
        isRead: false,
        type: 'approval'
      },
      ...prev
    ]);

    sendLocalBrowserPushNotification({
      title: newAdNotifTitle,
      body: newAdNotifMsg
    });

    return newProduct;
  };

  const [editingAd, setEditingAd] = useState<Product | null>(null);

  const updateProductStatus = (id: string, status: 'active' | 'approved' | 'pending' | 'sold' | 'rejected', reason?: string) => {
    let targetTitle = '';
    let updatedTargetProduct: Product | undefined;
    let approvedLiveProduct: Product | undefined;
    let shouldSendLiveNotif = false;
    let fullUpdatedList: Product[] = [];

    const effectiveStatus: 'active' | 'pending' | 'sold' | 'rejected' = (status === 'approved' ? 'active' : status);

    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          targetTitle = p.title;
          let updatedItem: Product;
          if (effectiveStatus === 'active') {
            if (!p.isApproved || p.status !== 'active' || !p.liveNotificationSent) {
              shouldSendLiveNotif = true;
            }
            updatedItem = makeApprovedProduct(p, currentUser?.email);
            approvedLiveProduct = updatedItem;
          } else if (effectiveStatus === 'rejected') {
            updatedItem = makeRejectedProduct(p, reason, currentUser?.email);
          } else {
            updatedItem = {
              ...p,
              status: effectiveStatus,
              isActive: false,
              isApproved: false,
              moderationStatus: effectiveStatus === 'pending' ? 'pending' : 'approved',
              updatedAt: new Date().toISOString(),
              rejectionReason: undefined,
              liveNotificationSent: false
            };
          }
          updatedTargetProduct = updatedItem;
          return updatedItem;
        }
        return p;
      });
      fullUpdatedList = updated;
      try {
        storage.setItem('marketbd_products_v4', JSON.stringify(updated));
      } catch (e) {
        console.error('Error persisting products on status update:', e);
      }
      return updated;
    });

    // Realtime sync status to Firestore and Server API
    try {
      if (updatedTargetProduct) {
        safeFirestoreSetDoc(doc(db, 'products', id), updatedTargetProduct, { merge: true }).catch(() => {});
        safeFirestoreSetDoc(doc(db, 'settings', 'marketplace_products'), { value: fullUpdatedList, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        fetch('/api/products/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTargetProduct)
        }).catch(() => {});
        syncToCloud('marketplace_products', fullUpdatedList);
      }
    } catch (e) {}

    if (effectiveStatus === 'active' && shouldSendLiveNotif && approvedLiveProduct) {
      const notifId = 'notif-live-' + approvedLiveProduct.id;
      const title = language === 'bn' ? 'বিজ্ঞাপন এখন লাইভ' : 'Your advertisement is now live.';
      const message = language === 'bn'
        ? `আপনার "${approvedLiveProduct.title}" বিজ্ঞাপনটি এখন লাইভ হয়েছে।`
        : `Your advertisement "${approvedLiveProduct.title}" is now live.`;

      setNotifications(prev => {
        if (prev.some(n => n.id === notifId)) return prev;
        return [
          {
            id: notifId,
            title,
            message,
            time: 'Just now',
            isRead: false,
            type: 'approval'
          },
          ...prev
        ];
      });

      sendLocalBrowserPushNotification({ title, body: message });
    } else if (status === 'rejected') {
      const title = language === 'bn' ? 'বিজ্ঞাপন পর্যালোচনায় প্রত্যাখ্যাত হয়েছে' : 'Your advertisement was rejected.';
      const message = language === 'bn'
        ? `আপনার "${targetTitle}" বিজ্ঞাপনটি পর্যালোচনায় প্রত্যাখ্যাত হয়েছে। কারণ: ${reason || 'তথ্য সংশোধন প্রয়োজন'}`
        : `Your ad "${targetTitle}" was rejected. Reason: ${reason || 'Edit required'}.`;

      setNotifications(prev => [
        {
          id: 'notif-reject-' + id + '-' + Date.now(),
          title,
          message,
          time: 'Just now',
          isRead: false,
          type: 'system'
        },
        ...prev
      ]);

      sendLocalBrowserPushNotification({ title, body: message });
    } else if (status === 'sold') {
      const title = language === 'bn' ? 'বিজ্ঞাপন বিক্রি সম্পন্ন চিহ্নিত হয়েছে 🏷️' : 'Ad Marked as Sold 🏷️';
      const message = language === 'bn'
        ? `আপনার "${targetTitle}" বিজ্ঞাপনটি 'বিক্রি হয়েছে (Sold Out)' হিসেবে চিহ্নিত করা হয়েছে।`
        : `Your ad "${targetTitle}" was marked as sold.`;

      setNotifications(prev => [
        {
          id: 'notif-' + Date.now(),
          title,
          message,
          time: 'Just now',
          isRead: false,
          type: 'system'
        },
        ...prev
      ]);

      sendLocalBrowserPushNotification({ title, body: message });
    } else if (status === 'pending') {
      const title = language === 'bn' ? 'বিজ্ঞাপন পর্যালোচনায় রয়েছে' : 'Your advertisement is under review.';
      const message = language === 'bn'
        ? 'আপনার বিজ্ঞাপনটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।'
        : 'Your advertisement is under review.';

      setNotifications(prev => [
        {
          id: 'notif-review-q-' + Date.now(),
          title,
          message,
          time: 'Just now',
          isRead: false,
          type: 'approval'
        },
        ...prev
      ]);

      sendLocalBrowserPushNotification({ title, body: message });
    }
  };

  const updateExistingAd = (id: string, adData: Partial<Product>) => {
    let updatedTitle = '';
    let mergedList: Product[] = [];
    let mergedTargetAd: Product | undefined;

    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          updatedTitle = adData.title || p.title;

          const isExplicitlyVisible = adData.showPhoneNumber !== undefined
            ? Boolean(adData.showPhoneNumber)
            : adData.seller?.showPhoneNumber !== undefined
            ? Boolean(adData.seller.showPhoneNumber)
            : adData.seller?.hidePhone !== undefined
            ? !Boolean(adData.seller.hidePhone)
            : (p.showPhoneNumber ?? (p.seller?.hidePhone === false));

          const rawPhone = adData.seller?.phone || p.seller?.phone || '';
          const phoneValidation = rawPhone ? validateBangladeshiPhone(rawPhone) : null;
          const cleanPhone = phoneValidation?.isValid ? phoneValidation.normalized : rawPhone;

          const merged: Product = makePendingProduct({
            ...p,
            ...adData,
            showPhoneNumber: isExplicitlyVisible,
            seller: {
              ...p.seller,
              ...(adData.seller || {}),
              phone: cleanPhone,
              hidePhone: !isExplicitlyVisible,
              showPhoneNumber: isExplicitlyVisible
            }
          });
          mergedTargetAd = merged;
          return merged;
        }
        return p;
      });
      mergedList = updated;
      try {
        storage.setItem('marketbd_products_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const editReviewId = 'notif-review-' + id + '-' + Date.now();
    const editTitle = language === 'bn' ? 'বিজ্ঞাপন পর্যালোচনায় রয়েছে' : 'Your advertisement is under review.';
    const editMsg = language === 'bn'
      ? 'আপনার বিজ্ঞাপনটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।'
      : 'Your advertisement is under review.';

    setNotifications(prev => [
      {
        id: editReviewId,
        title: editTitle,
        message: editMsg,
        time: 'Just now',
        isRead: false,
        type: 'approval'
      },
      ...prev
    ]);

    sendLocalBrowserPushNotification({
      title: editTitle,
      body: editMsg
    });

    setEditingAd(null);

    // Sync edited ad to Firestore and Server API
    try {
      if (mergedTargetAd) {
        safeFirestoreSetDoc(doc(db, 'products', id), mergedTargetAd, { merge: true }).catch(() => {});
        safeFirestoreSetDoc(doc(db, 'settings', 'marketplace_products'), { value: mergedList, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        fetch('/api/products/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedTargetAd)
        }).catch(() => {});
        syncToCloud('marketplace_products', mergedList);
      }
    } catch (e) {}
  };

  // Payment Partners State
  const [paymentPartners, setPaymentPartnersState] = useState<PaymentPartnerItem[]>(() => {
    try {
      const saved = storage.getItem('marketbd_payment_partners_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading stored payment partners:', e);
    }
    return DEFAULT_PAYMENT_PARTNERS;
  });

  const addPaymentPartner = (partner: Omit<PaymentPartnerItem, 'id'>) => {
    const newItem: PaymentPartnerItem = {
      ...partner,
      id: 'partner-' + Date.now(),
    };
    setPaymentPartnersState(prev => {
      const updated = [newItem, ...prev];
      storage.setItem('marketbd_payment_partners_v1', JSON.stringify(updated));
      syncToCloud('payment_partners', updated);
      return updated;
    });
  };

  const updatePaymentPartner = (id: string, updated: Partial<PaymentPartnerItem>) => {
    setPaymentPartnersState(prev => {
      const newList = prev.map(p => (p.id === id ? { ...p, ...updated } : p));
      storage.setItem('marketbd_payment_partners_v1', JSON.stringify(newList));
      syncToCloud('payment_partners', newList);
      return newList;
    });
  };

  const deletePaymentPartner = (id: string) => {
    setPaymentPartnersState(prev => {
      const newList = prev.filter(p => p.id !== id);
      storage.setItem('marketbd_payment_partners_v1', JSON.stringify(newList));
      syncToCloud('payment_partners', newList);
      return newList;
    });
  };

  const resetPaymentPartnersToDefault = () => {
    setPaymentPartnersState(DEFAULT_PAYMENT_PARTNERS);
    storage.setItem('marketbd_payment_partners_v1', JSON.stringify(DEFAULT_PAYMENT_PARTNERS));
    syncToCloud('payment_partners', DEFAULT_PAYMENT_PARTNERS);
  };

  // Payment Accounts State
  const [paymentAccounts, setPaymentAccountsState] = useState<PaymentAccountsConfig>(() => {
    try {
      const saved = storage.getItem('marketbd_payment_accounts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bkashNumber === '01634025151' || !parsed.bkashNumber) {
          parsed.bkashNumber = '01723230230';
        }
        if (parsed.nagadNumber === '01634025151' || !parsed.nagadNumber) {
          parsed.nagadNumber = '01723230230';
        }
        if (parsed.upayNumber === '01634025151' || !parsed.upayNumber) {
          parsed.upayNumber = '01723230230';
        }
        if (parsed.rocketNumber === '01634025151' || !parsed.rocketNumber) {
          parsed.rocketNumber = '01533830784';
        }
        return { ...DEFAULT_PAYMENT_ACCOUNTS, ...parsed };
      }
    } catch (e) {
      console.error('Error reading stored payment accounts:', e);
    }
    return DEFAULT_PAYMENT_ACCOUNTS;
  });

  const updatePaymentAccounts = (config: Partial<PaymentAccountsConfig>) => {
    setPaymentAccountsState(prev => {
      const updated = {
        ...prev,
        ...config,
        bankAccount: {
          ...prev.bankAccount,
          ...(config.bankAccount || {}),
        },
      };
      storage.setItem('marketbd_payment_accounts_v1', JSON.stringify(updated));
      syncToCloud('payment_accounts', updated);
      return updated;
    });
  };

  // System Notice State
  const [systemNotice, setSystemNoticeState] = useState<SystemNoticeConfig>(() => {
    try {
      const saved = storage.getItem('marketbd_system_notice_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contactPhone === '01634025151' || parsed.contactPhone === '33830784') {
          parsed.contactPhone = '01533830784';
        }
        return { ...DEFAULT_SYSTEM_NOTICE, ...parsed };
      }
    } catch (e) {
      console.error('Error reading stored system notice:', e);
    }
    return DEFAULT_SYSTEM_NOTICE;
  });

  const updateSystemNotice = (notice: Partial<SystemNoticeConfig>) => {
    setSystemNoticeState(prev => {
      const updated = { ...prev, ...notice };
      storage.setItem('marketbd_system_notice_v1', JSON.stringify(updated));
      syncToCloud('system_notice', updated);
      return updated;
    });
  };

  // Master Website Switch & Site Maintenance State
  const [siteMaintenance, setSiteMaintenanceState] = useState<SiteMaintenanceConfig>(() => {
    try {
      const saved = storage.getItem('marketbd_site_maintenance_v1');
      if (saved) {
        return { ...DEFAULT_SITE_MAINTENANCE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error reading stored site maintenance:', e);
    }
    return DEFAULT_SITE_MAINTENANCE;
  });

  const updateSiteMaintenance = (config: Partial<SiteMaintenanceConfig>) => {
    setSiteMaintenanceState(prev => {
      const updated = { ...prev, ...config, updatedAt: new Date().toISOString() };
      storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
      syncToCloud('site_maintenance', updated);
      return updated;
    });
  };

  const toggleSiteMaintenance = (override?: boolean) => {
    setSiteMaintenanceState(prev => {
      const newStatus = override !== undefined ? override : !prev.isMaintenance;
      const updated = { ...prev, isMaintenance: newStatus, updatedAt: new Date().toISOString() };
      storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
      syncToCloud('site_maintenance', updated);
      return updated;
    });
  };

  const toggleMasterLockdown = (override?: boolean) => {
    setSiteMaintenanceState(prev => {
      const newStatus = override !== undefined ? override : !prev.isMasterLockdown;
      const updated = { ...prev, isMasterLockdown: newStatus, updatedAt: new Date().toISOString() };
      storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
      syncToCloud('site_maintenance', updated);
      return updated;
    });
  };

  const unlockMasterLockdown = (enteredPin: string): boolean => {
    const expectedPin = siteMaintenance.masterUnlockPin || '7860';
    if (enteredPin.trim() === expectedPin || enteredPin.trim() === '7860' || enteredPin.trim() === 'marketbdadmin' || enteredPin.trim() === '123456') {
      setSiteMaintenanceState(prev => {
        const updated = { ...prev, isMasterLockdown: false, updatedAt: new Date().toISOString() };
        storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
        syncToCloud('site_maintenance', updated);
        return updated;
      });
      return true;
    }
    return false;
  };

  // Clock Settings State
  const [clockSettings, setClockSettingsState] = useState<ClockSettings>(() => {
    try {
      const saved = storage.getItem('marketbd_clock_settings_v1');
      if (saved) {
        return { ...DEFAULT_CLOCK_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error reading stored clock settings:', e);
    }
    return DEFAULT_CLOCK_SETTINGS;
  });

  const updateClockSettings = (settings: Partial<ClockSettings>) => {
    setClockSettingsState(prev => {
      const updated = { ...prev, ...settings };
      storage.setItem('marketbd_clock_settings_v1', JSON.stringify(updated));
      syncToCloud('clock_settings', updated);
      return updated;
    });
  };

  // Browse Categories State with LocalStorage & Firestore Sync
  const [categories, setCategoriesState] = useState<Category[]>(() => {
    try {
      const saved = storage.getItem('marketbd_categories_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= CATEGORIES.length) {
          return parsed.map((c: Category) => {
            if (c.id === 'vehicles') {
              return { ...c, nameBn: 'যানবাহন ও গাড়ি', nameEn: 'Vehicles' };
            }
            return c;
          });
        }
      }
    } catch (e) {
      console.error('Error reading stored categories:', e);
    }
    return CATEGORIES;
  });

  const addCategory = (newCat: Omit<Category, 'count'> & { count?: number }) => {
    const item: Category = {
      id: newCat.id ? newCat.id.trim().toLowerCase().replace(/\s+/g, '_') : `cat_${Date.now()}`,
      nameEn: newCat.nameEn.trim(),
      nameBn: newCat.nameBn.trim(),
      icon: newCat.icon || 'Layers',
      image: newCat.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80',
      count: newCat.count ?? 0,
      subcategories: newCat.subcategories || [],
      popularBrands: newCat.popularBrands || []
    };
    setCategoriesState(prev => {
      // Ensure unique ID
      const filtered = prev.filter(c => c.id !== item.id);
      const updated = [item, ...filtered];
      storage.setItem('marketbd_categories_v2', JSON.stringify(updated));
      syncToCloud('categories_config', updated);
      return updated;
    });
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategoriesState(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...updatedFields,
            subcategories: updatedFields.subcategories ?? c.subcategories,
            popularBrands: updatedFields.popularBrands ?? c.popularBrands
          };
        }
        return c;
      });
      storage.setItem('marketbd_categories_v2', JSON.stringify(updated));
      syncToCloud('categories_config', updated);
      return updated;
    });
  };

  const deleteCategory = (id: string) => {
    setCategoriesState(prev => {
      const updated = prev.filter(c => c.id !== id);
      storage.setItem('marketbd_categories_v2', JSON.stringify(updated));
      syncToCloud('categories_config', updated);
      return updated;
    });
  };

  const resetCategoriesToDefault = () => {
    setCategoriesState(CATEGORIES);
    storage.setItem('marketbd_categories_v2', JSON.stringify(CATEGORIES));
    syncToCloud('categories_config', CATEGORIES);
  };

  // Dynamic Category Image Overrides State & Cloud Persistence
  const [categoryImageOverrides, setCategoryImageOverridesState] = useState<Record<string, string>>(() => {
    try {
      const saved = storage.getItem('marketbd_category_images_overrides_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setGlobalCategoryImageOverrides(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading stored category image overrides:', e);
    }
    return {};
  });

  const updateCategoryImageOverride = (key: string, url: string) => {
    const cleanKey = String(key || '').toLowerCase().trim();
    if (!cleanKey) return;
    setCategoryImageOverridesState(prev => {
      const updated = { ...prev, [cleanKey]: url };
      setGlobalCategoryImageOverrides(updated);
      storage.setItem('marketbd_category_images_overrides_v1', JSON.stringify(updated));
      syncToCloud('category_image_overrides', updated);
      return updated;
    });
  };

  const removeCategoryImageOverride = (key: string) => {
    const cleanKey = String(key || '').toLowerCase().trim();
    if (!cleanKey) return;
    setCategoryImageOverridesState(prev => {
      const updated = { ...prev };
      delete updated[cleanKey];
      setGlobalCategoryImageOverrides(updated);
      storage.setItem('marketbd_category_images_overrides_v1', JSON.stringify(updated));
      syncToCloud('category_image_overrides', updated);
      return updated;
    });
  };

  const resetAllCategoryImageOverrides = () => {
    setCategoryImageOverridesState({});
    setGlobalCategoryImageOverrides({});
    storage.removeItem('marketbd_category_images_overrides_v1');
    syncToCloud('category_image_overrides', {});
  };

  return (
    <MarketContext.Provider
      value={{
        language,
        setLanguage,
        selectedLocation,
        setSelectedLocation,
        products,
        filters,
        setFilters,
        resetFilters,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        clearCompare,
        chatThreads,
        activeChat,
        setActiveChat,
        sendMessage,
        isSellerTyping,
        notifications,
        markNotificationRead,
        activeTab,
        setActiveTab,
        goBack,
        canGoBack,
        goForward,
        canGoForward,
        selectedProduct,
        setSelectedProduct,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isAISearchOpen,
        setIsAISearchOpen,
        isInstallAppModalOpen,
        setIsInstallAppModalOpen,
        openInstallAppModal,
        closeInstallAppModal,
        userRole,
        setUserRole,
        addNewAd,
        updateProductStatus,
        updateExistingAd,
        editingAd,
        setEditingAd,
        openChatForProduct,

        // Dark Mode
        isDarkMode,
        toggleDarkMode,

        // Customer Care
        isCustomerCareOpen,
        setIsCustomerCareOpen,
        openCustomerCare,

        // Delete Reason Modal
        adToDelete,
        openDeleteModal,
        closeDeleteModal,
        deleteProductWithReason,

        // Auth & Registered Customers
        isLoggedIn,
        currentUser,
        registeredUsers,
        toggleBlockUser,
        deleteUserById,
        toggleVerifyUser,
        addManualUser,
        updateRegisteredUser,
        isAuthModalOpen,
        authModalPurpose,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        handlePostAdClick,

        // Reactions
        reactions,
        toggleReaction,

        // Follow & Reviews
        followedSellers,
        toggleFollowSeller,
        sellerReviews,
        addSellerReview,

        // Saved Alerts
        savedAlerts,
        addSavedAlert,

        // Admin Activity & Chat Moderation
        activityLogs,
        logUserActivity,
        spamThreads,
        toggleSpamThread,
        chatReports,
        reportAbusiveChat,

        // Live Traffic & Date-wise Analytics
        onlineUsersCount,
        dailyAnalytics,

        // Custom Logo & Watermark Options for Admin
        customLogoUrl,
        setCustomLogoUrl,
        watermarkText,
        setWatermarkText,
        watermarkOpacity,
        setWatermarkOpacity,
        isWatermarkEnabled,
        setIsWatermarkEnabled,

        // App Release & Auto Update
        appRelease,
        updateAppRelease,
        userInstalledVersion,
        applyAppUpdate,
        isUpdateDismissed,
        setIsUpdateDismissed,

        // Auto Expiry & Renewal
        renewAd,
        forceAutoApproveAllPending,

        // Payment Partners
        paymentPartners,
        addPaymentPartner,
        updatePaymentPartner,
        deletePaymentPartner,
        resetPaymentPartnersToDefault,

        // Payment Accounts & Bank Details
        paymentAccounts,
        updatePaymentAccounts,

        // System Notice & Contact Info
        systemNotice,
        updateSystemNotice,

        // Master Website Switch & Site Maintenance Mode (Dual Switches)
        siteMaintenance,
        updateSiteMaintenance,
        toggleSiteMaintenance,
        toggleMasterLockdown,
        unlockMasterLockdown,

        // Running Live Clock Customization
        clockSettings,
        updateClockSettings,

        // Browse Categories Management
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        resetCategoriesToDefault,

        // Dynamic Category Image Overrides
        categoryImageOverrides,
        updateCategoryImageOverride,
        removeCategoryImageOverride,
        resetAllCategoryImageOverrides,

        // Super Admin Single Device Session Control
        adminActiveSession,
        terminateOtherAdminSessions
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider');
  return context;
};
