import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Language, Location, FilterState, ChatThread, AppNotification, ChatMessage, AppReleaseInfo, PaymentPartnerItem, PaymentAccountsConfig, SystemNoticeConfig, ClockSettings, Category, AdminActiveSession, AdminActivityLog, AdminActionType } from '../types';
import { KNOWN_JUNK_PRODUCT_IDS } from '../utils/knownJunkProductIds';
import { CATEGORIES } from '../data/bangladeshData';
import marketBdLogoImg from '../assets/images/market_bd_logo_1786102322044.jpg';
import { storage } from '../utils/storage';
import { validateBangladeshiPhone, isPhoneVisibleToBuyers } from '../utils/phoneUtils';
import { setGlobalCategoryImageOverrides, getSecondLevelImageUrl, getSubcategoryImageUrl, getCategoryImageUrl } from '../utils/categoryImages';
import { checkAndExpireAds, renewExpiredAd } from '../utils/adExpiryEngine';
import { isProductPublicActive, isProductPending, isProductRejected, isProductSold, isProductExpired, makeApprovedProduct, makePendingProduct, makeRejectedProduct } from '../utils/productStatus';
import { sendLocalBrowserPushNotification, requestWebPushPermission } from '../services/pushNotificationService';
import { db, auth, safeFirestoreSetDoc, safeFirestoreDeleteDoc, onAuthStateChanged, signOut } from '../lib/firebase';
import { doc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { INITIAL_ADMIN_LOGS, saveAdminLogToFirestore, subscribeToFirestoreAdminLogs, fetchAllAdminLogsFromFirestore, formatAdminLogTimestamp } from '../services/adminLogService';
import {
  REACTIONS_STORAGE_KEY,
  loadStoredReactions,
  computeNextReactions,
  extractGlobalReactionCounts,
  mergeServerReactionCounts,
  type ProductReaction
} from '../utils/reactionUtils';
import {
  isDummyChatThread,
  filterUserChatThreads,
} from '../utils/chatUtils';

const CATEGORY_STORAGE_KEY = 'marketbd_categories_v3_bikroy17';

const isBikroy17CategoryList = (list: unknown): list is Category[] => {
  if (!Array.isArray(list) || list.length < 15) return false;
  const ids = new Set(list.map((c: any) => c?.id).filter(Boolean));
  const hasLegacyRoot =
    ids.has('computers') ||
    ids.has('education_courses') ||
    ids.has('travel_tours') ||
    ids.has('food_restaurants') ||
    ids.has('events_tickets') ||
    ids.has('others');
  return !hasLegacyRoot && ids.has('seeking_work') && ids.has('repair_construction') && ids.has('business_industry');
};

export const DEFAULT_PAYMENT_PARTNERS: PaymentPartnerItem[] = [
  { id: 'partner-1', name: 'bKash', category: 'mfs', isEnabled: true },
  { id: 'partner-2', name: 'Nagad (নগদ)', category: 'mfs', isEnabled: true },
  { id: 'partner-3', name: 'Rocket (রকেট)', category: 'mfs', isEnabled: true },
  { id: 'partner-4', name: 'Upay (উপায়)', category: 'mfs', isEnabled: false },
  { id: 'partner-5', name: 'VISA Card', category: 'card', isEnabled: false },
  { id: 'partner-6', name: 'Mastercard', category: 'card', isEnabled: false },
  { id: 'partner-7', name: 'American Express (AMEX)', category: 'card', isEnabled: false },
  { id: 'partner-8', name: 'DBBL NEXUS', category: 'card', isEnabled: false },
  { id: 'partner-9', name: 'UnionPay', category: 'card', isEnabled: false },
  { id: 'partner-10', name: 'Islami Bank Bangladesh PLC', category: 'bank', isEnabled: false },
  { id: 'partner-11', name: 'BRAC Bank', category: 'bank', isEnabled: false },
  { id: 'partner-12', name: 'City Bank (Citytouch)', category: 'bank', isEnabled: false },
  { id: 'partner-13', name: 'Bank Asia', category: 'bank', isEnabled: false },
  { id: 'partner-14', name: 'AB Bank', category: 'bank', isEnabled: false },
  { id: 'partner-15', name: 'Mutual Trust Bank (MTB)', category: 'bank', isEnabled: false },
  { id: 'partner-16', name: 'Southeast Bank', category: 'bank', isEnabled: false },
  { id: 'partner-17', name: 'Ok Wallet', category: 'mfs', isEnabled: false },
  { id: 'partner-18', name: 'SureCash', category: 'mfs', isEnabled: false },
  { id: 'partner-19', name: 'Tap\'n Pay', category: 'mfs', isEnabled: false },
  { id: 'partner-20', name: 'SSLCOMMERZ Gateway', category: 'other', isEnabled: false },
];

export const DEFAULT_PAYMENT_ACCOUNTS: PaymentAccountsConfig = {
  bkashNumber: '01723230230',
  bkashLogoUrl: '',
  bkashEnabled: true,
  nagadNumber: '01723230230',
  nagadLogoUrl: '',
  nagadEnabled: true,
  rocketNumber: '01533830784',
  rocketLogoUrl: '',
  rocketEnabled: true,
  upayNumber: '01723230230',
  upayLogoUrl: '',
  upayEnabled: false,
  bankAccount: {
    bankName: 'Islami Bank Bangladesh PLC',
    accountName: 'MarketBD Net Technologies Ltd',
    accountNumber: '2050 3928 1000 9281',
    branchName: 'Dhanmondi Branch, Dhaka',
    routingNumber: '125263829',
    bankLogoUrl: '',
    isEnabled: false,
  },
};

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  fontSize: 'sm',
  customFontSizePx: 14,
  fontFamily: 'vt323',
  customFontFamily: '',
  textColor: '#00FF66',
  dateTextColor: '#FFFFFF',
  bgColor: '#090d16',
  borderColor: '#ef4444',
  showPulseIcon: true,
  fontWeight: 'black',
  showSeconds: true,
  isWidgetEnabled: true,
  glowEffect: true,
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
  masterUnlockPin: '', // SECURITY: no default PIN — admin must set one explicitly in settings
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

export type { ProductReaction } from '../utils/reactionUtils';

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
  refreshProducts: () => Promise<void>;
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
  markChatThreadRead: (threadId: string) => void;
  deleteChatThread: (threadId: string) => void;
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
  openChatWithCustomer: (customer: UserProfile, product?: Product) => string;

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
  adminActivityLogs: AdminActivityLog[];
  logAdminAction: (entry: {
    action: string;
    actionType: AdminActionType;
    targetId?: string;
    targetTitle?: string;
    details?: string;
    metadata?: Record<string, any>;
  }) => void;
  refreshAdminLogsFromCloud: () => Promise<void>;
  clearAdminLogs: () => void;
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

// Persistent per-browser / per-Android-WebView device identifier.
// Stored in localStorage so refreshing, opening new tabs, or relaunching the
// Android app on the same device never alters the device ID and triggers false
// "logged in from another device" logouts.
const getOrCreateDeviceSessionId = (): string => {
  try {
    const existing = storage.getItem('marketbd_device_session_id');
    if (existing && existing.length >= 8) return existing;
    const created =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    storage.setItem('marketbd_device_session_id', created);
    return created;
  } catch {
    return `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};

const THIS_DEVICE_SESSION_ID: string = getOrCreateDeviceSessionId();

const compareSemver = (a?: string, b?: string): number => {
  const pa = String(a || '0.0.0').replace(/[^\d.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b || '0.0.0').replace(/[^\d.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

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

      // Audit and ensure high-resolution valid image array
      const fallbackImg1 = getSecondLevelImageUrl(p.category, p.subCategory || '', p.secondLevelCategory || '', p.model || p.title);
      const fallbackImg2 = getSubcategoryImageUrl(p.category, p.subCategory || '');
      const validImages = Array.isArray(p.images)
        ? p.images.filter(img => typeof img === 'string' && img.trim() !== '')
        : [];
      const guaranteedImages = validImages.length > 0 ? validImages : [fallbackImg1, fallbackImg2].filter(Boolean);

      return {
        ...p,
        images: guaranteedImages,
        postedAt: p.postedAt || '2026-09-01T12:00:00.000Z',
        createdAt: p.createdAt || p.postedAt || '2026-09-01T12:00:00.000Z',
        updatedAt: p.updatedAt || p.createdAt || p.postedAt || '2026-09-01T12:00:00.000Z',
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
          isOnline: p.seller?.isOnline ?? true,
        }
      };
    });
  };

  const canonicalProductsCacheRef = React.useRef<Product[] | null>(null);
  const canonicalIdMapRef = React.useRef<Map<string, Product>>(new Map());
  const canonicalLoadPromiseRef = React.useRef<Promise<Product[]> | null>(null);

  const ensureCanonicalProducts = React.useCallback((): Promise<Product[]> => {
    if (canonicalProductsCacheRef.current) {
      return Promise.resolve(canonicalProductsCacheRef.current);
    }
    if (!canonicalLoadPromiseRef.current) {
      canonicalLoadPromiseRef.current = import('../data/mockProducts').then((mod) => {
        const list = Array.isArray(mod.INITIAL_PRODUCTS) ? mod.INITIAL_PRODUCTS : [];
        canonicalProductsCacheRef.current = list;
        const idMap = new Map<string, Product>();
        list.forEach((p) => {
          if (p && p.id) idMap.set(p.id, p);
        });
        canonicalIdMapRef.current = idMap;
        return list;
      });
    }
    return canonicalLoadPromiseRef.current;
  }, []);

  const persistCompactProductsCache = (list: Product[]) => {
    try {
      storage.removeItem('marketbd_products_v4');

      // Store a tiny 16-item fast-boot snapshot (<15KB) for 0ms repeat launches on Android
      const activeFastSeed = list
        .filter((p) => p && p.id && isProductPublicActive(p))
        .slice(0, 16)
        .map((p) => ({
          ...p,
          images: Array.isArray(p.images)
            ? p.images.filter((img) => typeof img === 'string' && img.length < 32768).slice(0, 1)
            : [],
        }));
      if (activeFastSeed.length > 0) {
        storage.setItem('marketbd_fast_seed_v1', JSON.stringify(activeFastSeed));
      }

      // Wait until the canonical catalog chunk has loaded before writing delta cache
      if (canonicalIdMapRef.current.size === 0) {
        return;
      }

      const customOrModified: Product[] = [];
      const presentCanonicalIds = new Set<string>();
      for (const p of list) {
        if (!p || !p.id) continue;
        const base = canonicalIdMapRef.current.get(p.id);
        const isModified =
          !base || p.status !== 'active' || p.title !== base.title || p.price !== base.price;
        if (isModified) {
          const compactImages = Array.isArray(p.images)
            ? p.images.filter((img) => typeof img === 'string' && img.length < 32768)
            : [];
          customOrModified.push({
            ...p,
            images: compactImages.length > 0 ? compactImages : p.images?.slice(0, 1) || [],
          });
        }
        if (base) {
          presentCanonicalIds.add(p.id);
        }
      }
      const deletedCanonicalIds: string[] = [];
      canonicalIdMapRef.current.forEach((_v, id) => {
        if (!presentCanonicalIds.has(id)) deletedCanonicalIds.push(id);
      });
      storage.setItem(
        'marketbd_custom_products_v5',
        JSON.stringify({ custom: customOrModified.slice(0, 80), deleted: deletedCanonicalIds })
      );
    } catch {
      // Non-fatal if storage quota restricted
    }
  };

  const areProductListsEquivalent = (a: Product[], b: Product[]) => {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (
        a[i].id !== b[i].id ||
        a[i].status !== b[i].status ||
        a[i].updatedAt !== b[i].updatedAt ||
        a[i].price !== b[i].price
      ) {
        return false;
      }
    }
    return true;
  };

  const [products, setProducts] = useState<Product[]>(() => {
    const map = new Map<string, Product>();
    const nowTime = Date.now();
    const oneYearLater = new Date(nowTime + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Instant 0ms boot seed from compact storage (avoids blocking initial render on 977KB catalog chunk)
    const fastSeedSaved = storage.getItem('marketbd_fast_seed_v1');
    if (fastSeedSaved) {
      try {
        const parsedSeed = JSON.parse(fastSeedSaved);
        if (Array.isArray(parsedSeed)) {
          parsedSeed.forEach((p: Product) => {
            if (p && p.id && p.title && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
              map.set(p.id, p);
            }
          });
        }
      } catch {
        storage.removeItem('marketbd_fast_seed_v1');
      }
    }

    // Load compact custom/modified delta cache immediately
    const compactSaved = storage.getItem('marketbd_custom_products_v5');
    if (compactSaved) {
      try {
        const parsed = JSON.parse(compactSaved);
        if (Array.isArray(parsed?.deleted)) {
          parsed.deleted.forEach((id: string) => map.delete(id));
        }
        if (Array.isArray(parsed?.custom)) {
          parsed.custom.forEach((p: Product) => {
            if (p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
              const existing = map.get(p.id);
              map.set(p.id, existing ? { ...existing, ...p } : p);
            }
          });
        }
      } catch (e) {
        storage.removeItem('marketbd_custom_products_v5');
      }
    } else {
      const legacySaved = storage.getItem('marketbd_products_v4');
      if (legacySaved) {
        try {
          const parsed = JSON.parse(legacySaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((p: Product) => {
              if (p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
                const existing = map.get(p.id);
                const isPending = isProductPending(p);
                const isRejected = isProductRejected(p);
                const isSold = isProductSold(p);
                const effectiveStatus = isPending ? 'pending' : isRejected ? 'rejected' : isSold ? 'sold' : (p.status || 'active');
                const updatedP: Product = {
                  ...p,
                  status: effectiveStatus,
                  isApproved: effectiveStatus === 'active' ? (p.isApproved ?? true) : false,
                  isActive: effectiveStatus === 'active',
                  moderationStatus: effectiveStatus === 'pending' ? 'pending' : effectiveStatus === 'rejected' ? 'rejected' : 'approved',
                  postedAt: p.postedAt || existing?.postedAt || '2026-09-01T12:00:00.000Z',
                  createdAt: p.createdAt || p.postedAt || existing?.createdAt || '2026-09-01T12:00:00.000Z',
                  updatedAt: p.updatedAt || existing?.updatedAt || p.createdAt || p.postedAt || '2026-09-01T12:00:00.000Z',
                  expiresAt: p.expiresAt || existing?.expiresAt || oneYearLater,
                  expiryDate: undefined
                };
                map.set(p.id, existing ? { ...existing, ...updatedP } : updatedP);
              }
            });
          }
        } catch (e) {
          console.error('Error migrating legacy stored products:', e);
        }
        storage.removeItem('marketbd_products_v4');
      }
    }
    return normalizeProductsList(Array.from(map.values()));
  });

  // Load the canonical 400-item catalog right after initial paint so first screen appears instantly
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      ensureCanonicalProducts().then((baseList) => {
        if (cancelled || !Array.isArray(baseList) || baseList.length === 0) return;
        const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        setProducts((prev) => {
          const map = new Map<string, Product>();
          baseList.forEach((p) => {
            if (p && p.id) {
              map.set(p.id, {
                ...p,
                status: p.status || 'active',
                isApproved: p.isApproved ?? true,
                isActive: p.isActive ?? true,
                moderationStatus: p.moderationStatus || 'approved',
                postedAt: p.postedAt || '2026-09-01T12:00:00.000Z',
                createdAt: p.createdAt || p.postedAt || '2026-09-01T12:00:00.000Z',
                updatedAt: p.updatedAt || p.createdAt || p.postedAt || '2026-09-01T12:00:00.000Z',
                expiresAt: p.expiresAt || oneYearLater
              });
            }
          });
          // Apply local deleted/custom cache
          const compactSaved = storage.getItem('marketbd_custom_products_v5');
          if (compactSaved) {
            try {
              const parsed = JSON.parse(compactSaved);
              if (Array.isArray(parsed?.deleted)) {
                parsed.deleted.forEach((id: string) => map.delete(id));
              }
              if (Array.isArray(parsed?.custom)) {
                parsed.custom.forEach((p: Product) => {
                  if (p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
                    const existing = map.get(p.id);
                    map.set(p.id, existing ? { ...existing, ...p } : p);
                  }
                });
              }
            } catch {}
          }
          // Preserve any Firestore/user items already in `prev`
          prev.forEach((p) => {
            if (p && p.id && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
              const existing = map.get(p.id);
              map.set(p.id, existing ? { ...existing, ...p } : p);
            }
          });
          const merged = normalizeProductsList(Array.from(map.values()));
          if (areProductListsEquivalent(prev, merged)) return prev;
          return merged;
        });
      }).catch(() => {});
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [ensureCanonicalProducts]);

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
    // 1. Initial lightweight hydration from server sync API with 4s timeout guard
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const fetchTimer = controller ? setTimeout(() => controller.abort(), 4000) : null;
    fetch('/api/sync/state?lite=1', controller ? { signal: controller.signal } : undefined)
      .then(res => res.json())
      .then(res => {
        if (fetchTimer) clearTimeout(fetchTimer);
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
            const migrated = storage.getItem('marketbd_payment_defaults_v2_only_bnr') === '1';
            setPaymentAccountsState(prev => {
              const incoming = d.paymentAccounts;
              const merged = {
                ...DEFAULT_PAYMENT_ACCOUNTS,
                ...prev,
                ...incoming,
                bankAccount: {
                  ...DEFAULT_PAYMENT_ACCOUNTS.bankAccount,
                  ...(prev.bankAccount || {}),
                  ...(incoming.bankAccount || {}),
                },
              };
              if (!migrated && incoming.upayEnabled === undefined) {
                merged.upayEnabled = false;
                merged.bankAccount.isEnabled = false;
              }
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
            const migrated = storage.getItem('marketbd_payment_defaults_v2_only_bnr') === '1';
            const listToUse = !migrated && d.paymentPartners.every((p: any) => p.isEnabled !== false)
              ? DEFAULT_PAYMENT_PARTNERS
              : d.paymentPartners;
            setPaymentPartnersState(listToUse);
            storage.setItem('marketbd_payment_partners_v1', JSON.stringify(listToUse));
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
          if (isBikroy17CategoryList(d.categories)) {
            setCategoriesState(d.categories);
            storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(d.categories));
          }
          if (isBikroy17CategoryList(d.categories_config)) {
            setCategoriesState(d.categories_config);
            storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(d.categories_config));
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
            ensureCanonicalProducts().then((baseList) => {
              setProducts(prev => {
                const map = new Map<string, Product>();
                baseList.forEach(p => { if (p && p.id) map.set(p.id, { ...p, status: 'active', isApproved: true, isActive: true }); });
                d.marketplace_products.forEach((p: Product) => {
                  if (p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
                    const existing = map.get(p.id);
                    map.set(p.id, existing ? { ...existing, ...p } : p);
                  }
                });
                const rawMerged = Array.from(map.values()).sort((a, b) => 
                  new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime()
                );
                const merged = normalizeProductsList(rawMerged);
                if (areProductListsEquivalent(prev, merged)) return prev;
                persistCompactProductsCache(merged);
                return merged;
              });
            }).catch(() => {});
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
          if (d.product_reactions && typeof d.product_reactions === 'object') {
            setReactions(prev => {
              const merged = mergeServerReactionCounts(prev, d.product_reactions);
              storage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(merged));
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

      // One-time-per-session legacy migration check
      if (typeof sessionStorage === 'undefined' || !sessionStorage.getItem('marketbd_legacy_products_checked')) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('marketbd_legacy_products_checked', '1');
        getDoc(doc(db, 'settings', 'marketplace_products')).then(snap => {
          if (snap.exists()) {
            const legacyArr = snap.data()?.value;
            if (Array.isArray(legacyArr) && legacyArr.length > 0 && legacyArr.length <= 30) {
              legacyArr.forEach((legacyItem: Product) => {
                if (legacyItem && legacyItem.id && legacyItem.title) {
                  safeFirestoreSetDoc(doc(db, 'products', legacyItem.id), legacyItem, { merge: true }).catch(() => {});
                }
              });
            }
          }
        }).catch(() => {});
      }

      // Authoritative Realtime listener for individual documents in 'products' Firestore collection (Direct Android & Web sync)
      const unsubProductsCol = onSnapshot(collection(db, 'products'), (snapshot) => {
        const cloudAds: Product[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Product;
          if (data && docSnap.id) {
            cloudAds.push({ ...data, id: docSnap.id });
          }
        });
        const docChanges = snapshot.docChanges();

        // Cross-Device Realtime Live Notification Trigger:
        // Detects when any ad posted from this device/account transitions to active/approved
        try {
          const myPostedAdsRaw = storage.getItem('marketbd_my_posted_ads');
          const myPostedAds: string[] = myPostedAdsRaw ? JSON.parse(myPostedAdsRaw) : [];
          
          cloudAds.forEach(ca => {
            const isMine = (
              myPostedAds.includes(ca.id) ||
              (currentUser?.email && ca.seller?.email === currentUser.email) ||
              (currentUser?.phone && ca.seller?.phone === currentUser.phone)
            );

            if (isMine && (ca.status === 'active' || ca.isApproved) && !storage.getItem('marketbd_notified_live_' + ca.id)) {
              storage.setItem('marketbd_notified_live_' + ca.id, 'true');
              const liveTitle = language === 'bn' ? '🎉 বিজ্ঞাপন এখন লাইভ!' : '🎉 Your advertisement is now live!';
              const liveMsg = language === 'bn' 
                ? `আপনার "${ca.title}" বিজ্ঞাপনটি সফলভাবে অনুমোদিত হয়েছে এবং ক্রেতাদের জন্য লাইভ প্রদর্শিত হচ্ছে।`
                : `Your advertisement "${ca.title}" has been approved and is now live.`;

              const notifId = 'notif-live-' + ca.id;
              setNotifications(prev => {
                if (prev.some(n => n.id === notifId)) return prev;
                return [
                  {
                    id: notifId,
                    title: liveTitle,
                    message: liveMsg,
                    time: 'Just now',
                    isRead: false,
                    type: 'approval'
                  },
                  ...prev
                ];
              });

              sendLocalBrowserPushNotification({
                title: liveTitle,
                body: liveMsg,
                url: `#/product/${ca.id}`
              });
            }
          });
        } catch (e) {
          console.warn('Realtime live notification check note:', e);
        }

        ensureCanonicalProducts().then((baseList) => {
          setProducts(prev => {
            const map = new Map<string, Product>();
            baseList.forEach(p => { if (p && p.id) map.set(p.id, { ...p, status: 'active', isApproved: true, isActive: true }); });
            cloudAds.forEach(ca => {
              if (ca && ca.id && ca.title && ca.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(ca.id)) {
                const existing = map.get(ca.id);
                map.set(ca.id, existing ? { ...existing, ...ca } : ca);
              }
            });
            docChanges.forEach(change => {
              if (change.type === 'removed') {
                map.delete(change.doc.id);
              }
            });

            const rawMerged = Array.from(map.values()).sort((a, b) => 
              new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime()
            );
            const merged = normalizeProductsList(rawMerged);
            if (areProductListsEquivalent(prev, merged)) return prev;
            persistCompactProductsCache(merged);
            return merged;
          });
        }).catch(() => {});
      }, (err) => console.log('Products collection listener notice:', err));
      unsubs.push(unsubProductsCol);

      const unsubCategories = onSnapshot(doc(db, 'settings', 'categories_config'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value;
          if (isBikroy17CategoryList(val)) {
            setCategoriesState(val);
            storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(val));
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

      // Authoritative Realtime listener for cross-device User Notifications (e.g. ad approval on Web delivered to Android)
      const unsubUserNotifications = onSnapshot(collection(db, 'user_notifications'), (snapshot) => {
        try {
          const myPostedAdsRaw = storage.getItem('marketbd_my_posted_ads');
          const myPostedAds: string[] = myPostedAdsRaw ? JSON.parse(myPostedAdsRaw) : [];

          snapshot.docChanges().forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              if (!data) return;

              const isMine = (
                (data.targetProductId && myPostedAds.includes(data.targetProductId)) ||
                (currentUser?.email && data.sellerEmail === currentUser.email) ||
                (currentUser?.phone && data.sellerPhone === currentUser.phone)
              );

              if (isMine && !storage.getItem('marketbd_notif_seen_' + change.doc.id)) {
                storage.setItem('marketbd_notif_seen_' + change.doc.id, 'true');

                setNotifications(prev => {
                  if (prev.some(n => n.id === change.doc.id)) return prev;
                  return [
                    {
                      id: change.doc.id,
                      title: data.title || 'বিজ্ঞাপন আপডেট',
                      message: data.message || '',
                      time: 'Just now',
                      isRead: false,
                      type: data.type || 'approval'
                    },
                    ...prev
                  ];
                });

                sendLocalBrowserPushNotification({
                  title: data.title || 'বিজ্ঞাপন আপডেট',
                  body: data.message || '',
                  url: data.targetProductId ? `#/product/${data.targetProductId}` : '/'
                });
              }
            }
          });
        } catch (err) {
          console.warn('User notifications listener note:', err);
        }
      }, () => {});
      unsubs.push(unsubUserNotifications);

      // Explicit Super Admin Remote Session Revocation Listener (triggers ONLY when
      // an admin explicitly presses "Terminate Other Sessions", never on normal web/Android login).
      const unsubAdminSession = onSnapshot(doc(db, 'settings', 'admin_active_session'), (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data()?.value as (AdminActiveSession & { revokedBeforeMs?: number }) | undefined;
          if (val && val.sessionToken) {
            setAdminActiveSession(val);
            storage.setItem('marketbd_admin_active_session', JSON.stringify(val));

            const localAdminToken = storage.getItem('marketbd_admin_session_token');
            const localUserRole = storage.getItem('marketbd_user_role');
            const localLoginAtMs = Number(storage.getItem('marketbd_admin_login_at_ms') || 0);
            const revokedBeforeMs = Number(val.revokedBeforeMs || 0);
            if (
              localUserRole === 'admin' &&
              localAdminToken &&
              val.sessionToken !== localAdminToken &&
              revokedBeforeMs > 0 &&
              localLoginAtMs > 0 &&
              localLoginAtMs < revokedBeforeMs
            ) {
              console.warn('[Admin Security] Admin session revoked remotely via Terminate Other Sessions.');
              storage.removeItem('marketbd_is_logged_in');
              storage.removeItem('marketbd_user_role');
              storage.removeItem('marketbd_auth_user');
              storage.removeItem('marketbd_admin_session_token');
              storage.removeItem('marketbd_admin_login_at_ms');
              setIsLoggedIn(false);
              setUserRole('buyer');
              setCurrentUser(null);
              setActiveTab('home');
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
                role: data.role || 'seller',
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
                role: 'seller',
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

            if (typeof window !== 'undefined' && window.sessionStorage?.getItem('marketbd_2fa_pending') === 'true') {
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
            if (err?.code !== 'cancelled') {
              console.warn('[Firebase Auth] Firestore user profile sync notice:', err?.message || err);
            }
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

  // Manual / Pull-to-Refresh listings updater
  const refreshProducts = async (): Promise<void> => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const productArray = Array.isArray(data.data) ? data.data : (Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : null));
        if (productArray && productArray.length > 0) {
          const baseList = await ensureCanonicalProducts();
          const map = new Map<string, Product>();
          baseList.forEach(p => { if (p && p.id) map.set(p.id, { ...p, status: 'active', isApproved: true, isActive: true }); });
          productArray.forEach((p: Product) => {
            if (p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
              const existing = map.get(p.id);
              map.set(p.id, existing ? { ...existing, ...p } : p);
            }
          });
          const normalized = normalizeProductsList(Array.from(map.values()));
          setProducts(normalized);
          persistCompactProductsCache(normalized);
        }
      }
    } catch (e) {
      console.warn('Error manual refreshing products:', e);
    }
  };

  // Persist compact custom-products delta cleanly without flooding /api/products/sync on mount
  useEffect(() => {
    const t = setTimeout(() => {
      persistCompactProductsCache(products);
    }, 400);
    return () => clearTimeout(t);
  }, [products]);

  // Defer Web Push Notification permission prompt so first paint on Android WebView is unblocked
  useEffect(() => {
    const t = setTimeout(() => {
      requestWebPushPermission();
    }, 4000);
    return () => clearTimeout(t);
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
            persistCompactProductsCache(updated);
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
          persistCompactProductsCache(updated);
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
    if (tab !== 'product-details') {
      setSelectedProductState(null);
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

  // Product Reactions State (Zero dummy reacts; only real user reactions are stored & synced)
  const [reactions, setReactions] = useState<Record<string, ProductReaction>>(() =>
    loadStoredReactions(storage.getItem(REACTIONS_STORAGE_KEY))
  );

  const toggleReaction = (productId: string, type: 'like' | 'dislike' | 'love') => {
    setReactions(prev => {
      const next = computeNextReactions(prev, productId, type);
      try {
        storage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      try {
        fetch('/api/sync/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_reactions: extractGlobalReactionCounts(next),
          }),
        }).catch(() => {});
      } catch {}
      return next;
    });
  };

  // Followed Sellers (persisted, starts clean)
  const [followedSellers, setFollowedSellers] = useState<string[]>(() => {
    try {
      const saved = storage.getItem('marketbd_followed_sellers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage parse issues
    }
    return [];
  });

  const toggleFollowSeller = (sellerId: string) => {
    setFollowedSellers(prev => {
      const next = prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId];
      storage.setItem('marketbd_followed_sellers', JSON.stringify(next));
      return next;
    });
  };

  // Seller Reviews (persisted, zero dummy reviews)
  const [sellerReviews, setSellerReviews] = useState<SellerReview[]>(() => {
    try {
      const saved = storage.getItem('marketbd_seller_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage parse issues
    }
    return [];
  });

  const addSellerReview = (sellerId: string, rating: number, comment: string) => {
    const newRev: SellerReview = {
      id: 'rev-' + Date.now(),
      sellerId,
      reviewerName: currentUser?.name || 'Verified Buyer',
      rating,
      comment,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setSellerReviews(prev => {
      const next = [newRev, ...prev];
      storage.setItem('marketbd_seller_reviews', JSON.stringify(next));
      return next;
    });
  };

  // Saved Search Alerts (persisted, zero dummy alerts)
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>(() => {
    try {
      const saved = storage.getItem('marketbd_saved_alerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage parse issues
    }
    return [];
  });

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
    setSavedAlerts(prev => {
      const next = [newAlert, ...prev];
      storage.setItem('marketbd_saved_alerts', JSON.stringify(next));
      return next;
    });
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

  // Activity Logs for Admin (persisted, zero dummy logs)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = storage.getItem('marketbd_activity_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage parse issues
    }
    return [];
  });

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
      userPhone: currentUser?.phone || '',
      action,
      adTitle,
      adId,
      location: selectedLocation.thana || selectedLocation.district || selectedLocation.division
    };
    setActivityLogs(prev => {
      const next = [newLog, ...prev];
      storage.setItem('marketbd_activity_logs', JSON.stringify(next));
      return next;
    });

    // Automatically update date-wise analytics counters
    if (action === 'Viewed Ad') incrementDailyMetric('productViews');
    if (action === 'Revealed Phone') incrementDailyMetric('phoneReveals');
    if (action === 'Started Chat') incrementDailyMetric('chatsStarted');
  };

  // Admin Activity & Audit Logs (Real-time Firestore persistence & multi-device sync)
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>(() => {
    try {
      const saved = storage.getItem('marketbd_admin_activity_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((l: any) => l && !String(l.timestamp || '').includes('28 Jul 2026') && !String(l.timestamp || '').includes('27 Jul 2026'));
        }
      }
    } catch (e) {
      console.error('Error reading stored admin activity logs:', e);
    }
    return INITIAL_ADMIN_LOGS;
  });

  // Real-time Firestore sync listener for admin_logs collection
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreAdminLogs((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setAdminActivityLogs(prev => {
          const map = new Map<string, AdminActivityLog>();
          remoteLogs.forEach(l => map.set(l.id, l));
          prev.forEach(l => {
            if (!map.has(l.id)) map.set(l.id, l);
          });
          const merged = Array.from(map.values()).sort((a, b) => {
            const tA = new Date(a.createdAt || a.timestamp).getTime() || 0;
            const tB = new Date(b.createdAt || b.timestamp).getTime() || 0;
            return tB - tA;
          });
          try {
            storage.setItem('marketbd_admin_activity_logs', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshAdminLogsFromCloud = async () => {
    try {
      const freshLogs = await fetchAllAdminLogsFromFirestore();
      if (freshLogs && freshLogs.length > 0) {
        setAdminActivityLogs(prev => {
          const map = new Map<string, AdminActivityLog>();
          freshLogs.forEach(l => map.set(l.id, l));
          prev.forEach(l => {
            if (!map.has(l.id)) map.set(l.id, l);
          });
          const merged = Array.from(map.values()).sort((a, b) => {
            const tA = new Date(a.createdAt || a.timestamp).getTime() || 0;
            const tB = new Date(b.createdAt || b.timestamp).getTime() || 0;
            return tB - tA;
          });
          try {
            storage.setItem('marketbd_admin_activity_logs', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (e) {}
  };

  const clearAdminLogs = () => {
    setAdminActivityLogs([]);
    try {
      storage.removeItem('marketbd_admin_activity_logs');
    } catch (e) {}
  };

  const logAdminAction = (entry: {
    action: string;
    actionType: AdminActionType;
    targetId?: string;
    targetTitle?: string;
    details?: string;
    metadata?: Record<string, any>;
  }) => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const device = isMobile ? 'Android / Mobile App' : 'Desktop / PC Browser';

    const newLog: AdminActivityLog = {
      id: 'adm-log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      adminId: currentUser?.id || 'admin-master',
      adminName: currentUser?.name || 'Official Super Admin',
      adminEmail: currentUser?.email || 'official.marketbd@gmail.com',
      action: entry.action,
      actionType: entry.actionType,
      targetId: entry.targetId,
      targetTitle: entry.targetTitle,
      details: entry.details,
      timestamp: formatAdminLogTimestamp(),
      createdAt: new Date().toISOString(),
      device,
      metadata: entry.metadata
    };

    setAdminActivityLogs(prev => {
      const updated = [newLog, ...prev.filter(l => l.id !== newLog.id)];
      try {
        storage.setItem('marketbd_admin_activity_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Write to Firestore collection 'admin_logs'
    saveAdminLogToFirestore(newLog).catch(() => {});

    // Sync to REST API for multi-platform sync
    try {
      fetch('/api/sync/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latestAdminLog: newLog })
      }).catch(() => {});
    } catch (e) {}
  };

  // Real Active Users Count from server (no fake random jitter)
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const syncActiveCount = () => {
      fetch('/api/health')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (!cancelled && data && typeof data.activeConnections === 'number') {
            setOnlineUsersCount(Math.max(1, data.activeConnections));
          }
        })
        .catch(() => {});
    };
    syncActiveCount();
    const interval = setInterval(syncActiveCount, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Daily Date-Wise Real Traffic Analytics (zero fake visitor numbers)
  const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatRealDateLabels = (dateObj = new Date()) => {
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsBn = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const toBn = (s: string | number) => String(s).replace(/\d/g, d => bnDigits[Number(d)]);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const yyyy = String(dateObj.getFullYear());
    return {
      dateFormattedEn: `${dd} ${monthsEn[dateObj.getMonth()]} ${yyyy}`,
      dateFormattedBn: `${toBn(dd)} ${monthsBn[dateObj.getMonth()]} ${toBn(yyyy)}`
    };
  };

  const LEGACY_DUMMY_ANALYTICS_DATES = new Set([
    '2026-07-29',
    '2026-07-30',
    '2026-07-31',
    '2026-08-01',
    '2026-08-02',
    '2026-08-03'
  ]);

  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>(() => {
    const today = getTodayISO();
    const labels = formatRealDateLabels(new Date());
    const saved = storage.getItem('marketbd_daily_analytics');
    if (saved) {
      try {
        const parsed: DailyAnalytics[] = JSON.parse(saved).filter(
          (d: DailyAnalytics) => d && !LEGACY_DUMMY_ANALYTICS_DATES.has(d.date)
        );
        if (!parsed.some(d => d.date === today)) {
          return [
            {
              date: today,
              ...labels,
              visitors: 1,
              productViews: 0,
              phoneReveals: 0,
              chatsStarted: 0
            },
            ...parsed
          ];
        }
        return parsed.map(d =>
          d.date === today ? { ...d, ...labels, visitors: d.visitors + 1 } : d
        );
      } catch {
        // Fallback below
      }
    }
    return [
      {
        date: today,
        ...labels,
        visitors: 1,
        productViews: 0,
        phoneReveals: 0,
        chatsStarted: 0
      }
    ];
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
        persistCompactProductsCache(filtered);
      } catch (e) {}
      return filtered;
    });
    setAdToDelete(null);

    // Delete directly from Firestore products collection & REST endpoint for Android sync
    try {
      safeFirestoreDeleteDoc(doc(db, 'products', productId)).catch(() => {});
      fetch('/api/products/' + productId, { method: 'DELETE' }).catch(() => {});
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

    // 🛡️ Log Admin Action in Firestore
    logAdminAction({
      action: 'Deleted Ad',
      actionType: 'ad_moderation',
      targetId: productId,
      targetTitle: deletedTitle,
      details: `Ad permanently removed from marketplace. Reason: ${reason}${customNote ? ` (${customNote})` : ''}`,
      metadata: { productId, reason, customNote }
    });
  };

  // App Release & Auto Update Management
  const defaultRelease: AppReleaseInfo = {
    version: '2.5.0',
    buildNumber: 250,
    releaseDate: '05 Aug 2026',
    titleBn: 'গুগল প্লে স্টোর সিকিউরিটি ও ফিচার আপডেট v2.5.0',
    titleEn: 'Google Play Store Security & Feature Update v2.5.0',
    notesBn: '• গুগল প্লে স্টোরে অফিসিয়াল নতুন ভার্সন অবমুক্ত করা হয়েছে।\n• এডমিন নিরাপত্তার জন্য ৬ ডিজিটের ওটিপি ভেরিফিকেশন সিস্টেম চালু।\n• সাইটে রোবট, হ্যাকার ও ফেইক বট প্রতিরোধে WAF সিকিউরিটি প্রোটোকল একটিভ।\n• অ্যান্ড্রয়েড ইউজারদের জন্য প্লে স্টোর থেকে আপডেট উপলব্ধ।',
    notesEn: '• Official new version released on Google Play Store.\n• 6-Digit OTP Verification added for Admin Login security.\n• Bot, scraper & hacker protection protocol active.\n• Play Store update available for Android users.',
    isMandatory: false,
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
    const storedVersion = storage.getItem('marketbd_installed_version') || '';
    let uaVersion = '';
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const match = ua.match(/MarketBDAndroidApp\/([0-9.]+)/i);
      if (match && match[1]) {
        uaVersion = match[1];
      }
    }
    if (storedVersion && uaVersion) {
      return compareSemver(storedVersion, uaVersion) >= 0 ? storedVersion : uaVersion;
    }
    return storedVersion || uaVersion || '2.5.0';
  });

  const [isUpdateDismissed, setIsUpdateDismissed] = useState<boolean>(() => {
    const dismissedVer = storage.getItem('marketbd_dismissed_update_version');
    return Boolean(dismissedVer && compareSemver(dismissedVer, defaultRelease.version) >= 0);
  });

  useEffect(() => {
    const dismissedVer = storage.getItem('marketbd_dismissed_update_version');
    if (dismissedVer) {
      setIsUpdateDismissed(compareSemver(dismissedVer, appRelease.version) >= 0);
    }
  }, [appRelease.version]);

  const updateAppRelease = (newRelease: AppReleaseInfo) => {
    setAppReleaseState(newRelease);
    setIsUpdateDismissed(false);
    try {
      storage.setItem('marketbd_app_release', JSON.stringify(newRelease));
      storage.removeItem('marketbd_dismissed_update_version');
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
      storage.setItem('marketbd_dismissed_update_version', appRelease.version);
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
    const savedRole = storage.getItem('marketbd_user_role') as any;
    const savedUser = storage.getItem('marketbd_auth_user');
    if (savedRole === 'admin' && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id !== 'admin-master') {
          return 'seller';
        }
      } catch (e) {}
    }
    return savedRole || 'buyer';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = storage.getItem('marketbd_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id !== 'admin-master' && parsed.role === 'admin') {
          parsed.role = 'seller';
          storage.setItem('marketbd_auth_user', JSON.stringify(parsed));
          storage.setItem('marketbd_user_role', 'seller');
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalPurpose, setAuthModalPurpose] = useState<'post-ad' | 'general' | 'chat'>('general');
  const pendingChatProductRef = React.useRef<Product | null>(null);

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

      // 🛡️ Log Admin Action in Firestore
      const targetUser = updated.find(u => u.id === userId || u.phone === userId || u.email === userId);
      const isNowBlocked = targetUser?.isBlocked;
      logAdminAction({
        action: isNowBlocked ? 'Blocked User' : 'Unblocked User',
        actionType: 'user_management',
        targetId: userId,
        targetTitle: targetUser?.name || userId,
        details: isNowBlocked
          ? `User account suspended and blocked. Reason: ${reason || 'Admin policy suspension'}`
          : 'User account unblocked and restored to active state.'
      });

      return updated;
    });
  };

  const deleteUserById = (userId: string) => {
    setRegisteredUsersState(prev => {
      const targetUser = prev.find(u => u.id === userId || u.phone === userId || u.email === userId);
      const updated = prev.filter(u => u.id !== userId && u.phone !== userId && u.email !== userId);
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);

      // If deleted user is currently logged in, log them out
      if (currentUser && (currentUser.id === userId || currentUser.phone === userId || currentUser.email === userId)) {
        logout();
      }

      // 🛡️ Log Admin Action in Firestore
      logAdminAction({
        action: 'Deleted User Account',
        actionType: 'user_management',
        targetId: userId,
        targetTitle: targetUser?.name || userId,
        details: `Customer account (${targetUser?.name || 'N/A'}, Phone: ${targetUser?.phone || 'N/A'}) permanently removed.`
      });

      return updated;
    });
  };

  const toggleVerifyUser = (userId: string) => {
    setRegisteredUsersState(prev => {
      let isVerifiedNow = false;
      let targetName = userId;
      const updated = prev.map(u => {
        if (u.id === userId || u.phone === userId || u.email === userId) {
          isVerifiedNow = !u.isVerified;
          targetName = u.name;
          return { ...u, isVerified: isVerifiedNow };
        }
        return u;
      });
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);

      // 🛡️ Log Admin Action in Firestore
      logAdminAction({
        action: isVerifiedNow ? 'Verified Merchant' : 'Revoked Verification',
        actionType: 'user_management',
        targetId: userId,
        targetTitle: targetName,
        details: isVerifiedNow
          ? 'Merchant verification gold badge approved and activated.'
          : 'Merchant verification badge removed.'
      });

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

    // 🛡️ Log Admin Action in Firestore
    logAdminAction({
      action: 'Created Customer Account',
      actionType: 'user_management',
      targetId: newUser.id,
      targetTitle: newUser.name,
      details: `New ${newUser.role} user created manually (Phone: ${newUser.phone}, Location: ${newUser.location?.district || 'Dhaka'}).`
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

    let targetUserName = userId;
    setRegisteredUsersState(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.phone === userId) {
          targetUserName = u.name;
          return { ...u, ...updates };
        }
        return u;
      });
      storage.setItem('marketbd_registered_users', JSON.stringify(updated));
      syncToCloud('registered_users', updated);
      return updated;
    });

    // 🛡️ Log Admin Action in Firestore
    logAdminAction({
      action: updates.role ? 'Changed User Role' : 'Updated User Profile',
      actionType: 'user_management',
      targetId: userId,
      targetTitle: targetUserName,
      details: updates.role
        ? `User role updated to "${updates.role.toUpperCase()}".`
        : `Customer account details updated: ${Object.keys(updates).join(', ')}.`
    });
  };

  const login = (userData?: Partial<UserProfile>) => {
    const role = userData?.role || 'seller';
    const profile: UserProfile = {
      id: userData?.id || 'user-' + Date.now(),
      name: userData?.name || (role === 'admin' ? 'MarketBD.Net Admin' : role === 'seller' ? 'তানভীর আহমেদ (Verified Seller)' : 'রহিম উদ্দিন'),
      phone: userData?.phone || '01712345678',
      email: userData?.email !== undefined ? userData.email : (role === 'admin' ? 'official.marketbd@gmail.com' : ''),
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

    const loginTimeMs = Date.now();
    if (typeof window !== 'undefined') {
      window.sessionStorage?.removeItem('marketbd_2fa_pending');
    }
    storage.setItem('marketbd_this_device_session_id', THIS_DEVICE_SESSION_ID);
    storage.setItem('marketbd_session_login_at_ms', String(loginTimeMs));
    storage.setItem('marketbd_is_logged_in', 'true');
    storage.setItem('marketbd_user_role', role);
    storage.setItem('marketbd_auth_user', JSON.stringify(profile));

    setCurrentUser(profile);
    setIsLoggedIn(true);
    setUserRole(role);
    setIsAuthModalOpen(false);

    // Persist user profile directly into Firestore /users/{uid} for cloud persistence
    safeFirestoreSetDoc(
      doc(db, 'users', profile.id),
      {
        ...profile,
        activeSessionId: THIS_DEVICE_SESSION_ID,
        activeSessionUpdatedAt: new Date(loginTimeMs).toISOString(),
      },
      { merge: true }
    ).catch(() => {});

    // Record active Admin session metadata without auto-evicting Web & Android companions
    if (role === 'admin' || (profile.role === 'admin' && profile.id === 'admin-master')) {
      const newSessionToken = 'adm_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      storage.setItem('marketbd_admin_session_token', newSessionToken);
      storage.setItem('marketbd_admin_login_at_ms', String(loginTimeMs));

      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const deviceName = isMobile ? 'Mobile / Android Device' : 'Desktop / PC Browser';

      const sessionData: AdminActiveSession = {
        sessionToken: newSessionToken,
        userEmail: profile.email || 'official.marketsbd@gmail.com',
        deviceName,
        ip: 'Current Network',
        loginTime: new Date().toISOString()
      };

      setAdminActiveSession(sessionData);
      storage.setItem('marketbd_admin_active_session', JSON.stringify(sessionData));
      syncToCloud('admin_active_session', sessionData);
    }

    // Resume intended flow after login
    if (authModalPurpose === 'post-ad') {
      setSelectedProductState(null);
      setActiveTab('post-ad');
    } else if (authModalPurpose === 'chat' || pendingChatProductRef.current) {
      const pendingProduct = pendingChatProductRef.current;
      pendingChatProductRef.current = null;
      if (pendingProduct) {
        const buyerId = profile.id || 'user-me';
        const threadId = `thread-${pendingProduct.id}-${buyerId}`;
        const existing = rawChatThreads.find(
          t => !isDummyChatThread(t) && (t.id === threadId || (t.productId === pendingProduct.id && t.buyerId === buyerId))
        );
        if (existing) {
          setActiveChat(existing);
        } else {
          const nowIso = new Date().toISOString();
          const newThread: ChatThread = {
            id: threadId,
            productId: pendingProduct.id,
            productTitle: language === 'bn' && pendingProduct.titleBn ? pendingProduct.titleBn : pendingProduct.title,
            productImage: pendingProduct.images?.[0] || customLogoUrl || '/logo.jpg',
            productPrice: pendingProduct.price || 0,
            seller: pendingProduct.seller,
            buyerId,
            buyerName: profile.name || (language === 'bn' ? 'ক্রেতা' : 'Buyer'),
            buyerPhone: profile.phone,
            buyerEmail: profile.email,
            lastMessage: '',
            lastMessageTime: nowIso,
            unreadCount: 0,
            messages: []
          };
          setRawChatThreads(prev => {
            const updated = [newThread, ...prev.filter(t => t.id !== threadId && !isDummyChatThread(t))];
            storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
            return updated;
          });
          setActiveChat(newThread);
          if (typeof fetch !== 'undefined') {
            fetch('/api/chats/thread', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ thread: newThread })
            }).catch(() => {});
          }
          safeFirestoreSetDoc(doc(db, 'chats', threadId), newThread, { merge: true }).catch(() => {});
        }
      }
      setSelectedProductState(null);
      setActiveTab('chat');
    }
  };

  const terminateOtherAdminSessions = () => {
    const newSessionToken = 'adm_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const nowMs = Date.now();
    storage.setItem('marketbd_admin_session_token', newSessionToken);
    storage.setItem('marketbd_admin_login_at_ms', String(nowMs));

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceName = (isMobile ? 'Mobile / Android Device' : 'Desktop Browser') + ' (Primary Device Claimed)';

    const sessionData: AdminActiveSession & { revokedBeforeMs?: number } = {
      sessionToken: newSessionToken,
      userEmail: currentUser?.email || 'official.marketsbd@gmail.com',
      deviceName,
      ip: 'Primary Device',
      loginTime: new Date().toISOString(),
      revokedBeforeMs: nowMs,
    };

    setAdminActiveSession(sessionData);
    storage.setItem('marketbd_admin_active_session', JSON.stringify(sessionData));
    syncToCloud('admin_active_session', sessionData);
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
    storage.removeItem('marketbd_admin_login_at_ms');
    storage.removeItem('marketbd_session_login_at_ms');
    storage.removeItem('marketbd_this_device_session_id');

    if (activeTab === 'post-ad' || activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Multi-device friendly account state sync: allows using both Web & Android App
  // smoothly with the same account without false cross-device logout alerts.
  // Only respects explicit remote account blocking (isBlocked / status === 'blocked').
  useEffect(() => {
    if (!currentUser?.id || !isLoggedIn) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.id),
      (snap) => {
        const data = snap.data();
        if (data && (data.isBlocked === true || data.status === 'blocked')) {
          logout();
        }
      },
      () => {}
    );

    return () => unsubscribe();
  }, [currentUser?.id, isLoggedIn]);

  const handlePostAdClick = () => {
    if (!isLoggedIn) {
      openAuthModal('post-ad');
    } else {
      setActiveTab('post-ad');
    }
  };

  // Clean Bikroy-style real-time chat state (server-authoritative via /api/chats + SSE, dummy threads purged)
  const [rawChatThreads, setRawChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = storage.getItem('marketbd_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(t => !isDummyChatThread(t));
          if (cleaned.length !== parsed.length) {
            storage.setItem('marketbd_chat_threads', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {
      console.error('Error reading stored chat threads:', e);
    }
    return [];
  });

  const chatThreads = React.useMemo(
    () => (isLoggedIn ? filterUserChatThreads(rawChatThreads, currentUser) : []),
    [isLoggedIn, rawChatThreads, currentUser]
  );

  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const isSellerTyping = false;

  // Real notifications only (start clean with no dummy seeded notifications)
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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

  // Sync chats from Express/Vercel API + Firestore real-time collection + SSE updates
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoggedIn || !currentUser) return;

    let cancelled = false;
    const mergeIncomingThreads = (incomingList: ChatThread[]) => {
      if (cancelled || incomingList.length === 0) return;
      const validIncoming = incomingList
        .filter(t => t && !isDummyChatThread(t))
        .map(t => ({
          ...t,
          messages: Array.isArray(t.messages) ? t.messages : [],
          unreadCount: typeof t.unreadCount === 'number' ? t.unreadCount : 0,
        }));
      if (validIncoming.length === 0) return;

      setRawChatThreads(prev => {
        const mergedMap = new Map<string, ChatThread>();
        for (const t of prev) {
          if (!isDummyChatThread(t)) {
            mergedMap.set(t.id, {
              ...t,
              messages: Array.isArray(t.messages) ? t.messages : [],
            });
          }
        }
        for (const inc of validIncoming) {
          const cur = mergedMap.get(inc.id);
          if (!cur) {
            mergedMap.set(inc.id, inc);
          } else {
            const curLen = cur.messages?.length || 0;
            const incLen = inc.messages?.length || 0;
            const incNewer =
              incLen > curLen ||
              (incLen === curLen && String(inc.lastMessageTime || '') >= String(cur.lastMessageTime || ''));
            if (incNewer) {
              mergedMap.set(inc.id, inc);
            }
          }
        }
        const next = Array.from(mergedMap.values()).sort((a, b) =>
          String(b.lastMessageTime || '').localeCompare(String(a.lastMessageTime || ''))
        );
        storage.setItem('marketbd_chat_threads', JSON.stringify(next));
        return next;
      });

      setActiveChat(curr => {
        if (!curr) return curr;
        const match = validIncoming.find(t => t.id === curr.id);
        if (!match) return curr;
        const currLen = curr.messages?.length || 0;
        const matchLen = match.messages?.length || 0;
        return matchLen >= currLen ? match : curr;
      });
    };

    const params = new URLSearchParams();
    if (currentUser.id) params.set('userId', currentUser.id);
    if (currentUser.phone) params.set('phone', currentUser.phone);
    if (currentUser.email) params.set('email', currentUser.email);

    fetch(`/api/chats?${params.toString()}`)
      .then(async res => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) return null;
        return res.json();
      })
      .then(payload => {
        if (!cancelled && payload && Array.isArray(payload.data)) {
          mergeIncomingThreads(payload.data);
        }
      })
      .catch(() => {});

    // Real-time Firestore listener so buyer <-> seller <-> admin chats work across Web, Android & Vercel
    let unsubFirestoreChats: (() => void) | null = null;
    try {
      unsubFirestoreChats = onSnapshot(
        collection(db, 'chats'),
        snapshot => {
          if (cancelled) return;
          const fsThreads: ChatThread[] = [];
          snapshot.forEach(d => {
            const data = d.data() as ChatThread;
            if (data && data.id) {
              fsThreads.push({
                ...data,
                messages: Array.isArray(data.messages) ? data.messages : [],
              });
            }
          });
          mergeIncomingThreads(fsThreads);
        },
        () => {}
      );
    } catch {
      // Non-fatal if Firestore listener is unavailable
    }

    let es: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      try {
        es = new EventSource('/api/chats/stream');
        es.onmessage = evt => {
          try {
            const data = JSON.parse(evt.data);
            if (!data || !data.type) return;

            if (data.type === 'chat:updated' && data.thread && !isDummyChatThread(data.thread)) {
              const incoming: ChatThread = {
                ...data.thread,
                messages: Array.isArray(data.thread.messages) ? data.thread.messages : [],
              };
              mergeIncomingThreads([incoming]);
            } else if (data.type === 'chat:deleted' && data.threadId) {
              const deletedId = String(data.threadId);
              setRawChatThreads(prev => {
                const next = prev.filter(t => t.id !== deletedId);
                storage.setItem('marketbd_chat_threads', JSON.stringify(next));
                return next;
              });
              setActiveChat(curr => (curr && curr.id === deletedId ? null : curr));
            }
          } catch {
            // Ignore malformed keepalive/event frames
          }
        };
        es.onerror = () => {
          // Close cleanly on hosts without SSE streaming (e.g. static/serverless)
          try { es?.close(); } catch {}
        };
      } catch {}
    }

    return () => {
      cancelled = true;
      try { es?.close(); } catch {}
      try { unsubFirestoreChats?.(); } catch {}
    };
  }, [isLoggedIn, currentUser?.id, currentUser?.phone, currentUser?.email]);

  const markChatThreadRead = (threadId: string) => {
    if (!threadId) return;
    const readerId = currentUser?.id || 'user-me';

    setRawChatThreads(prev => {
      const updated = prev.map(thread => {
        if (thread.id !== threadId) return thread;
        const updatedMsgs = (thread.messages || []).map(m =>
          m.senderId !== readerId ? { ...m, status: 'seen' as const } : m
        );
        return { ...thread, unreadCount: 0, messages: updatedMsgs };
      });
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(curr => {
      if (!curr || curr.id !== threadId) return curr;
      const updatedMsgs = (curr.messages || []).map(m =>
        m.senderId !== readerId ? { ...m, status: 'seen' as const } : m
      );
      return { ...curr, unreadCount: 0, messages: updatedMsgs };
    });

    if (typeof fetch !== 'undefined') {
      fetch('/api/chats/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, readerId })
      }).catch(() => {});
    }
    const targetThread =
      rawChatThreads.find(t => t.id === threadId) ||
      (activeChat?.id === threadId ? activeChat : undefined);

    if (targetThread) {
      safeFirestoreSetDoc(
        doc(db, 'chats', threadId),
        {
          id: threadId,
          productId: targetThread.productId || 'general',
          buyerId: targetThread.buyerId || readerId,
          unreadCount: 0,
        },
        { merge: true }
      ).catch(() => {});
    }
  };

  const deleteChatThread = (threadId: string) => {
    if (!threadId) return;
    setRawChatThreads(prev => {
      const updated = prev.filter(t => t.id !== threadId);
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });
    setActiveChat(curr => (curr && curr.id === threadId ? null : curr));

    if (typeof fetch !== 'undefined') {
      fetch(`/api/chats/${encodeURIComponent(threadId)}`, { method: 'DELETE' }).catch(() => {});
    }
    safeFirestoreDeleteDoc(doc(db, 'chats', threadId)).catch(() => {});
  };

  useEffect(() => {
    if (activeChat && activeChat.unreadCount > 0) {
      markChatThreadRead(activeChat.id);
    }
  }, [activeChat?.id]);

  // Real-time messaging (server-authoritative via /api/chats/message + Firestore)
  const sendMessage = (threadId: string, text: string, offerAmount?: number, imageUrl?: string) => {
    const trimmedText = (text || '').trim();
    const displayMsg = trimmedText || (imageUrl ? (language === 'bn' ? '📷 [ছবি]' : '📷 [Photo]') : '');
    if (!threadId || !displayMsg) return;

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();
    const senderId = currentUser?.id || 'user-me';
    const currentThread =
      rawChatThreads.find(t => t.id === threadId) ||
      (activeChat?.id === threadId ? activeChat : undefined);

    const newMessage: ChatMessage = {
      id: msgId,
      senderId,
      receiverId:
        currentThread?.seller?.id === senderId
          ? currentThread?.buyerId || 'buyer'
          : currentThread?.seller?.id || 'seller',
      productId: currentThread?.productId || '',
      text: displayMsg,
      image: imageUrl,
      timestamp: nowIso,
      isOffer: Boolean(offerAmount),
      offerAmount,
      offerStatus: offerAmount ? 'pending' : undefined,
      status: 'sent'
    };

    let updatedSnapshot: ChatThread | undefined = currentThread
      ? {
          ...currentThread,
          lastMessage: displayMsg,
          lastMessageTime: nowIso,
          messages: [...(currentThread.messages || []), newMessage]
        }
      : undefined;

    setRawChatThreads(prev => {
      const hasThread = prev.some(t => t.id === threadId);
      const source = hasThread ? prev : updatedSnapshot ? [updatedSnapshot, ...prev] : prev;
      const updated = source.map(thread => {
        if (thread.id !== threadId) return thread;
        const msgs = Array.isArray(thread.messages) ? thread.messages : [];
        const nextMsgs = msgs.some(m => m.id === msgId) ? msgs : [...msgs, newMessage];
        const nextThread: ChatThread = {
          ...thread,
          lastMessage: displayMsg,
          lastMessageTime: nowIso,
          messages: nextMsgs
        };
        updatedSnapshot = nextThread;
        return nextThread;
      });
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(curr => {
      if (!curr || curr.id !== threadId) return curr;
      const currMsgs = Array.isArray(curr.messages) ? curr.messages : [];
      return {
        ...curr,
        lastMessage: displayMsg,
        lastMessageTime: nowIso,
        messages: [...currMsgs, newMessage]
      };
    });

    if (typeof fetch !== 'undefined') {
      fetch('/api/chats/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          message: newMessage,
          threadSnapshot: currentThread
        })
      })
        .then(async res => {
          const ct = res.headers.get('content-type') || '';
          if (!res.ok || !ct.includes('application/json')) return null;
          return res.json();
        })
        .then(payload => {
          if (!payload || !payload.data) return;
          const serverThread: ChatThread = {
            ...payload.data,
            messages: Array.isArray(payload.data.messages) ? payload.data.messages : [],
            unreadCount: 0,
          };
          setRawChatThreads(prev => {
            const next = prev.map(t => (t.id === threadId ? serverThread : t));
            storage.setItem('marketbd_chat_threads', JSON.stringify(next));
            return next;
          });
          setActiveChat(curr => (curr && curr.id === threadId ? serverThread : curr));
        })
        .catch(() => {});
    }

    if (updatedSnapshot) {
      safeFirestoreSetDoc(doc(db, 'chats', threadId), updatedSnapshot, { merge: true }).catch(() => {});
    }
  };

  const openChatForProduct = (product: Product): string => {
    if (!isLoggedIn) {
      pendingChatProductRef.current = product;
      openAuthModal('chat');
      return '';
    }

    const buyerId = currentUser?.id || 'user-me';
    const existing = chatThreads.find(
      t => t.productId === product.id && (t.buyerId === buyerId || t.seller?.id === buyerId)
    );
    if (existing) {
      const normalized = {
        ...existing,
        messages: Array.isArray(existing.messages) ? existing.messages : [],
      };
      setActiveChat(normalized);
      setSelectedProductState(null);
      setActiveTab('chat');
      if (normalized.unreadCount > 0) {
        markChatThreadRead(normalized.id);
      }
      return normalized.id;
    }

    const threadId = `thread-${product.id}-${buyerId}`;
    const nowIso = new Date().toISOString();
    const newThread: ChatThread = {
      id: threadId,
      productId: product.id,
      productTitle: language === 'bn' && product.titleBn ? product.titleBn : product.title,
      productImage: product.images?.[0] || customLogoUrl || '/logo.jpg',
      productPrice: product.price || 0,
      seller: product.seller,
      buyerId,
      buyerName: currentUser?.name || (language === 'bn' ? 'ক্রেতা' : 'Buyer'),
      buyerPhone: currentUser?.phone,
      buyerEmail: currentUser?.email,
      lastMessage: '',
      lastMessageTime: nowIso,
      unreadCount: 0,
      messages: []
    };

    setRawChatThreads(prev => {
      const updated = [newThread, ...prev.filter(t => t.id !== threadId && !isDummyChatThread(t))];
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(newThread);
    setSelectedProductState(null);
    setActiveTab('chat');

    if (typeof fetch !== 'undefined') {
      fetch('/api/chats/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread: newThread })
      }).catch(() => {});
    }

    safeFirestoreSetDoc(doc(db, 'chats', threadId), newThread, { merge: true }).catch(() => {});

    return threadId;
  };

  const openChatWithCustomer = (customer: UserProfile, product?: Product): string => {
    if (!isLoggedIn) {
      openAuthModal('chat');
      return '';
    }

    const safeCustomerId = String(customer.id || customer.phone || 'customer').replace(/[^a-zA-Z0-9_-]/g, '_');
    const threadId = product
      ? `thread-${product.id}-${safeCustomerId}`
      : `thread-customer-${safeCustomerId}`;

    const existing = rawChatThreads.find(
      t =>
        !isDummyChatThread(t) &&
        (t.id === threadId ||
          t.buyerId === customer.id ||
          (customer.phone && (t.buyerPhone === customer.phone || t.seller?.phone === customer.phone)))
    );

    if (existing) {
      const normalized: ChatThread = {
        ...existing,
        messages: Array.isArray(existing.messages) ? existing.messages : [],
      };
      setActiveChat(normalized);
      setSelectedProductState(null);
      setActiveTab('chat');
      if (normalized.unreadCount > 0) {
        markChatThreadRead(normalized.id);
      }
      return normalized.id;
    }

    const nowIso = new Date().toISOString();
    const isAdminInitiator = currentUser?.role === 'admin' || currentUser?.id === 'admin-master';
    const isSupportThread = !product;
    const senderSeller = isAdminInitiator
      ? {
          id: currentUser?.id || 'admin-master',
          name: currentUser?.name || (language === 'bn' ? 'MarketBD সাপোর্ট ও এডমিন' : 'MarketBD Support & Admin'),
          avatar: currentUser?.avatar || customLogoUrl || '/logo.jpg',
          phone: currentUser?.phone || systemNotice.contactPhone || '01533830784',
          hidePhone: false,
          showPhoneNumber: true,
          email: currentUser?.email || systemNotice.contactEmail || 'official.marketsbd@gmail.com',
          memberSince: currentUser?.memberSince || '2024',
          location: currentUser?.location || { division: 'Dhaka', district: 'Dhaka' },
          isVerified: true,
          rating: 5,
          totalReviews: 0,
        }
      : {
          id: 'admin-master',
          name: language === 'bn' ? 'MarketBD সাপোর্ট ও এডমিন' : 'MarketBD Support & Admin',
          avatar: customLogoUrl || '/logo.jpg',
          phone: systemNotice.contactPhone || '01533830784',
          hidePhone: false,
          showPhoneNumber: true,
          email: systemNotice.contactEmail || 'official.marketsbd@gmail.com',
          memberSince: '2024',
          location: { division: 'Dhaka', district: 'Dhaka' },
          isVerified: true,
          rating: 5,
          totalReviews: 0,
        };

    const newThread: ChatThread = {
      id: threadId,
      productId: product?.id || 'customer-support',
      productTitle: product
        ? (language === 'bn' && product.titleBn ? product.titleBn : product.title)
        : (language === 'bn' ? `কাস্টমার চ্যাট: ${customer.name || customer.phone}` : `Customer Chat: ${customer.name || customer.phone}`),
      productImage: product?.images?.[0] || customer.avatar || customLogoUrl || '/logo.jpg',
      productPrice: product?.price || 0,
      seller: senderSeller,
      buyerId: customer.id || safeCustomerId,
      buyerName: customer.name || customer.phone || (language === 'bn' ? 'কাস্টমার' : 'Customer'),
      buyerPhone: customer.phone,
      buyerEmail: customer.email,
      isCustomerCare: isSupportThread,
      lastMessage: '',
      lastMessageTime: nowIso,
      unreadCount: 0,
      messages: [],
    };

    setRawChatThreads(prev => {
      const updated = [newThread, ...prev.filter(t => t.id !== threadId && !isDummyChatThread(t))];
      storage.setItem('marketbd_chat_threads', JSON.stringify(updated));
      return updated;
    });

    setActiveChat(newThread);
    setSelectedProductState(null);
    setActiveTab('chat');

    if (typeof fetch !== 'undefined') {
      fetch('/api/chats/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread: newThread })
      }).catch(() => {});
    }
    safeFirestoreSetDoc(doc(db, 'chats', threadId), newThread, { merge: true }).catch(() => {});

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
      status: 'pending' as const,
      isApproved: false,
      isActive: false,
      moderationStatus: 'pending'
    };

    // FIX: new ads were previously force-set to status:'active' /
    // isApproved:true / moderationStatus:'approved' right here, so every ad
    // (free or paid) went live instantly and admin approval was never
    // actually required. Now every new ad starts pending — the existing
    // auto-approval timer / admin panel is what promotes it to active.
    const newProduct: Product = makePendingProduct(rawProduct as Product);

    setProducts(prev => {
      const updated = [newProduct, ...prev];
      try {
        persistCompactProductsCache(updated);
      } catch (e) {
        console.error('Error persisting new ad:', e);
      }
      return updated;
    });

    // Save directly to Firestore 'products' collection & API for immediate real-time sync with Android app
    try {
      safeFirestoreSetDoc(doc(db, 'products', newProduct.id), newProduct, { merge: true })
        .catch(() => {});
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(() => {});
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
    try {
      const myPostedAdsRaw = storage.getItem('marketbd_my_posted_ads');
      const myPostedAds: string[] = myPostedAdsRaw ? JSON.parse(myPostedAdsRaw) : [];
      if (!myPostedAds.includes(newProduct.id)) {
        myPostedAds.push(newProduct.id);
        storage.setItem('marketbd_my_posted_ads', JSON.stringify(myPostedAds));
      }
    } catch (e) {}

    const newAdReviewId = 'notif-review-' + newProduct.id;
    const newAdNotifTitle = language === 'bn' ? 'বিজ্ঞাপন পর্যালোচনায় রয়েছে' : 'Your advertisement is under review.';
    const newAdNotifMsg = language === 'bn'
      ? `আপনার "${newProduct.title}" বিজ্ঞাপনটি পর্যালোচনার জন্য জমা হয়েছে। অ্যাডমিন অনুমোদন করলেই লাইভ হবে।`
      : `Your advertisement "${newProduct.title}" is submitted for review. It will go live once approved.`;

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

    try {
      const notifDoc = {
        id: newAdReviewId,
        title: newAdNotifTitle,
        message: newAdNotifMsg,
        time: new Date().toISOString(),
        targetProductId: newProduct.id,
        sellerPhone: newProduct.seller?.phone || '',
        sellerEmail: newProduct.seller?.email || '',
        type: 'approval',
        isRead: false
      };
      safeFirestoreSetDoc(doc(db, 'user_notifications', newAdReviewId), notifDoc, { merge: true }).catch(() => {});
    } catch (e) {}

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
        persistCompactProductsCache(updated);
      } catch (e) {
        console.error('Error persisting products on status update:', e);
      }
      return updated;
    });

    // Realtime sync status to Firestore and Server API
    try {
      if (updatedTargetProduct) {
        safeFirestoreSetDoc(doc(db, 'products', id), updatedTargetProduct, { merge: true }).catch(() => {});
        fetch('/api/products/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTargetProduct)
        }).catch(() => {});
      }
    } catch (e) {}

    // 🛡️ Log Admin Action in Firestore
    logAdminAction({
      action: effectiveStatus === 'active' ? 'Approved Ad' : effectiveStatus === 'rejected' ? 'Rejected Ad' : effectiveStatus === 'sold' ? 'Marked Ad as Sold' : 'Updated Ad Status',
      actionType: 'ad_moderation',
      targetId: id,
      targetTitle: targetTitle || id,
      details: effectiveStatus === 'active'
        ? `Ad approved and published to live marketplace queue.`
        : effectiveStatus === 'rejected'
        ? `Ad rejected. Reason: ${reason || 'Terms violation'}`
        : `Ad status updated to ${effectiveStatus}.`
    });

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

      sendLocalBrowserPushNotification({ title, body: message, url: `#/product/${approvedLiveProduct.id}` });

      try {
        const notifDoc = {
          id: notifId,
          title,
          message,
          time: new Date().toISOString(),
          targetProductId: approvedLiveProduct.id,
          sellerPhone: approvedLiveProduct.seller?.phone || '',
          sellerEmail: approvedLiveProduct.seller?.email || '',
          type: 'approval',
          isRead: false
        };
        safeFirestoreSetDoc(doc(db, 'user_notifications', notifId), notifDoc, { merge: true }).catch(() => {});
      } catch (e) {}
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
        persistCompactProductsCache(updated);
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
        fetch('/api/products/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedTargetAd)
        }).catch(() => {});
      }
    } catch (e) {}
  };

  // Payment Partners State (One-time migration to bKash, Nagad, Rocket active by default)
  const [paymentPartners, setPaymentPartnersState] = useState<PaymentPartnerItem[]>(() => {
    try {
      const migrated = storage.getItem('marketbd_payment_defaults_v2_only_bnr') === '1';
      const saved = storage.getItem('marketbd_payment_partners_v1');
      if (saved && migrated) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      if (!migrated) {
        storage.setItem('marketbd_payment_partners_v1', JSON.stringify(DEFAULT_PAYMENT_PARTNERS));
        storage.setItem('marketbd_payment_defaults_v2_only_bnr', '1');
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
      storage.setItem('marketbd_payment_defaults_v2_only_bnr', '1');
      syncToCloud('payment_partners', updated);
      return updated;
    });
  };

  const updatePaymentPartner = (id: string, updated: Partial<PaymentPartnerItem>) => {
    setPaymentPartnersState(prev => {
      const newList = prev.map(p => (p.id === id ? { ...p, ...updated } : p));
      storage.setItem('marketbd_payment_partners_v1', JSON.stringify(newList));
      storage.setItem('marketbd_payment_defaults_v2_only_bnr', '1');
      syncToCloud('payment_partners', newList);
      return newList;
    });
  };

  const deletePaymentPartner = (id: string) => {
    setPaymentPartnersState(prev => {
      const newList = prev.filter(p => p.id !== id);
      storage.setItem('marketbd_payment_partners_v1', JSON.stringify(newList));
      storage.setItem('marketbd_payment_defaults_v2_only_bnr', '1');
      syncToCloud('payment_partners', newList);
      return newList;
    });
  };

  const resetPaymentPartnersToDefault = () => {
    setPaymentPartnersState(DEFAULT_PAYMENT_PARTNERS);
    storage.setItem('marketbd_payment_partners_v1', JSON.stringify(DEFAULT_PAYMENT_PARTNERS));
    storage.setItem('marketbd_payment_defaults_v2_only_bnr', '1');
    syncToCloud('payment_partners', DEFAULT_PAYMENT_PARTNERS);
  };

  // Payment Accounts State (Default: only bKash, Nagad, Rocket active; Upay & Bank disabled until Admin activates)
  const [paymentAccounts, setPaymentAccountsState] = useState<PaymentAccountsConfig>(() => {
    try {
      const migrated = storage.getItem('marketbd_payment_defaults_v2_accounts') === '1';
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
        const merged: PaymentAccountsConfig = {
          ...DEFAULT_PAYMENT_ACCOUNTS,
          ...parsed,
          bankAccount: {
            ...DEFAULT_PAYMENT_ACCOUNTS.bankAccount,
            ...(parsed.bankAccount || {}),
          },
        };
        if (!migrated) {
          merged.bkashEnabled = true;
          merged.nagadEnabled = true;
          merged.rocketEnabled = true;
          merged.upayEnabled = false;
          merged.bankAccount.isEnabled = false;
          storage.setItem('marketbd_payment_accounts_v1', JSON.stringify(merged));
          storage.setItem('marketbd_payment_defaults_v2_accounts', '1');
        }
        return merged;
      }
      storage.setItem('marketbd_payment_defaults_v2_accounts', '1');
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
      storage.setItem('marketbd_payment_defaults_v2_accounts', '1');
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

      // 🛡️ Log Admin Action in Firestore
      logAdminAction({
        action: 'Updated System Notice',
        actionType: 'system_settings',
        details: `System notice headline and contact info updated.`
      });

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

      // 🛡️ Log Admin Action in Firestore
      logAdminAction({
        action: 'Updated Maintenance Settings',
        actionType: 'site_maintenance',
        details: `Maintenance message & contact details configured (Title: "${config.title || prev.title}").`
      });

      return updated;
    });
  };

  const toggleSiteMaintenance = (override?: boolean) => {
    setSiteMaintenanceState(prev => {
      const newStatus = override !== undefined ? override : !prev.isMaintenance;
      const updated = { ...prev, isMaintenance: newStatus, updatedAt: new Date().toISOString() };
      storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
      syncToCloud('site_maintenance', updated);

      // 🛡️ Log Admin Action in Firestore
      logAdminAction({
        action: 'Updated Site Status',
        actionType: 'site_maintenance',
        targetTitle: 'Website Production Switch',
        details: newStatus
          ? 'Standard Maintenance Mode ENABLED: Site is offline for general visitors; Admins have exclusive access.'
          : 'Standard Maintenance Mode DISABLED: Website is 100% LIVE and open for all visitors.'
      });

      return updated;
    });
  };

  const toggleMasterLockdown = (override?: boolean) => {
    setSiteMaintenanceState(prev => {
      const newStatus = override !== undefined ? override : !prev.isMasterLockdown;
      const updated = { ...prev, isMasterLockdown: newStatus, updatedAt: new Date().toISOString() };
      storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
      syncToCloud('site_maintenance', updated);

      // 🛡️ Log Admin Action in Firestore
      logAdminAction({
        action: 'Updated Master Lockdown',
        actionType: 'security',
        targetTitle: 'Master Emergency Lockdown Switch',
        details: newStatus
          ? 'Master Lockdown ACTIVATED: Full platform lockdown enabled with PIN requirement.'
          : 'Master Lockdown DEACTIVATED: Full access restored.'
      });

      return updated;
    });
  };

  const unlockMasterLockdown = (enteredPin: string): boolean => {
    // SECURITY FIX: previously fell back to '7860' and also accepted the
    // hardcoded strings 'marketbdadmin' and '123456' as universal bypass
    // codes, regardless of what PIN the admin had actually configured. Those
    // were visible to anyone in the shipped JS bundle. Now only the PIN the
    // admin explicitly set in site settings is accepted. Note: this check
    // still runs client-side, so treat it as a UI gate, not real security —
    // for real protection, verify the PIN in a server/Cloud Function call
    // instead of comparing it in the browser.
    const expectedPin = siteMaintenance.masterUnlockPin;
    if (!!expectedPin && enteredPin.trim() === expectedPin) {
      setSiteMaintenanceState(prev => {
        const updated = { ...prev, isMasterLockdown: false, updatedAt: new Date().toISOString() };
        storage.setItem('marketbd_site_maintenance_v1', JSON.stringify(updated));
        syncToCloud('site_maintenance', updated);

        // 🛡️ Log Admin Action in Firestore
        logAdminAction({
          action: 'Unlocked Master Lockdown',
          actionType: 'security',
          targetTitle: 'PIN Unlock Protocol',
          details: 'Master lockdown unlocked successfully via PIN authentication.'
        });

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
      const saved = storage.getItem(CATEGORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isBikroy17CategoryList(parsed) && parsed.length >= CATEGORIES.length) {
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
      storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
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
      storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
      syncToCloud('categories_config', updated);
      return updated;
    });
  };

  const deleteCategory = (id: string) => {
    setCategoriesState(prev => {
      const updated = prev.filter(c => c.id !== id);
      storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
      syncToCloud('categories_config', updated);
      return updated;
    });
  };

  const resetCategoriesToDefault = () => {
    setCategoriesState(CATEGORIES);
    storage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(CATEGORIES));
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
        refreshProducts,
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
        markChatThreadRead,
        deleteChatThread,
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
        openChatWithCustomer,

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
        adminActivityLogs,
        logAdminAction,
        refreshAdminLogsFromCloud,
        clearAdminLogs,
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
