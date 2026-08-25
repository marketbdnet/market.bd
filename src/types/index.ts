export type Language = 'bn' | 'en';

export interface Location {
  division: string;
  district?: string;
  thana?: string;
}

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

export type AdType = 'regular' | 'featured' | 'urgent' | 'top_ad';

export type Condition = 'brand_new' | 'used_like_new' | 'used_good' | 'refurbished';

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  hidePhone?: boolean;
  showPhoneNumber?: boolean;
  email: string;
  memberSince: string;
  location: Location;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  badge?: 'Gold Seller' | 'Platinum Seller' | 'Verified Merchant' | 'Top Rated' | 'Verified Employer' | string;
  responseRate?: string;
  responseTime?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  askedBy: string;
  askedDate: string;
  answer?: string;
  answeredDate?: string;
}

export interface Product {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;
  category: string; // e.g. 'mobiles', 'electronics', 'vehicles', 'property', 'living', 'fashion', 'books', 'jobs', 'services'
  subCategory?: string;
  secondLevelCategory?: string;
  brand?: string;
  model?: string;
  price: number;
  originalPrice?: number;
  isNegotiable: boolean;
  condition: Condition;
  images: string[];
  description: string;
  descriptionBn?: string;
  location: Location;
  seller: Seller;
  sellerId?: string;
  showPhoneNumber?: boolean;
  postedAt: string;
  views: number;
  likes: number;
  adType: AdType;
  isFeatured?: boolean;
  isUrgent?: boolean;
  isFlashSale?: boolean;
  isDeliveryAvailable: boolean;
  warranty?: string;
  features?: string[];
  paymentInfo?: {
    method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'bank' | string;
    senderNumber: string;
    trxId: string;
    amount: number;
  };
  specifications: Record<string, string>;
  status: 'active' | 'approved' | 'pending' | 'sold' | 'rejected' | 'expired';
  isApproved?: boolean;
  isActive?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  expiryDate?: string;
  rejectionReason?: string;
  liveNotificationSent?: boolean;
  reviews?: Review[];
  questions?: QuestionAnswer[];
}

export interface SecondLevelCategory {
  id: string;
  nameEn: string;
  nameBn: string;
  image?: string;
  icon?: string;
  count?: number;
  models?: { en: string; bn: string }[];
}

export interface SubCategory {
  id: string;
  nameEn: string;
  nameBn: string;
  image?: string;
  icon?: string;
  count?: number;
  secondLevelCategories?: SecondLevelCategory[];
}

export interface Category {
  id: string;
  name?: string;
  nameEn: string;
  nameBn: string;
  icon: string; // lucide icon name
  image?: string; // photo/picture URL for category visual
  count?: number;
  subcategories: SubCategory[];
  popularBrands?: string[];
}

export interface AppReleaseInfo {
  version: string;
  buildNumber: number;
  releaseDate: string;
  titleBn: string;
  titleEn: string;
  notesBn: string;
  notesEn: string;
  isMandatory: boolean;
  apkDownloadUrl: string;
  playStoreUrl?: string;
  publishedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId: string;
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined';
  image?: string;
  status?: 'sent' | 'delivered' | 'seen';
}

export interface ChatThread {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  seller: Seller;
  buyerId: string;
  buyerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'message' | 'offer' | 'approval' | 'promotion' | 'system';
  link?: string;
}

export interface PaymentPartnerItem {
  id: string;
  name: string;
  logoUrl?: string;
  category: 'mfs' | 'card' | 'bank' | 'other';
  isEnabled: boolean;
}

export interface BankAccountInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber: string;
  bankLogoUrl?: string;
  isEnabled: boolean;
}

export interface PaymentAccountsConfig {
  bkashNumber: string;
  bkashLogoUrl?: string;
  nagadNumber: string;
  nagadLogoUrl?: string;
  rocketNumber: string;
  rocketLogoUrl?: string;
  upayNumber: string;
  upayLogoUrl?: string;
  bankAccount: BankAccountInfo;
}

export interface ClockSettings {
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
  customFontSizePx?: number;
  fontFamily: 'vt323' | 'orbitron' | 'sharetech' | 'firacode' | 'pressstart' | 'siliguri' | 'sans' | 'serif' | 'custom';
  customFontFamily?: string;
  textColor: string;
  dateTextColor: string;
  bgColor: string;
  borderColor: string;
  showPulseIcon: boolean;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  showSeconds: boolean;
  isWidgetEnabled: boolean;
}

export interface SystemNoticeConfig {
  isEnabled: boolean;
  showAdPromo?: boolean;
  showFraudWarning?: boolean;
  showCustomNotice?: boolean;
  noticeBn: string;
  noticeEn: string;
  adPromoBn?: string;
  adPromoEn?: string;
  fraudWarningBn?: string;
  fraudWarningEn?: string;
  customNoticeBn?: string;
  customNoticeEn?: string;
  scrollSpeed?: 'slow' | 'medium' | 'fast';
  contactPhone: string;
  contactEmail: string;
}

export interface FilterState {
  category: string;
  subCategory: string;
  secondLevelCategory?: string;
  division: string;
  district: string;
  thana: string;
  minPrice: number | '';
  maxPrice: number | '';
  condition: string[];
  brand: string[];
  isVerifiedOnly: boolean;
  isNegotiableOnly: boolean;
  isDeliveryOnly: boolean;
  adType: string;
  searchQuery: string;
  sortBy: 'latest' | 'price_low' | 'price_high' | 'popular';
}

export interface AdminActiveSession {
  sessionToken: string;
  userEmail: string;
  deviceName: string;
  ip: string;
  loginTime: string;
}

export interface ActivityLog {
  id: string;
  user?: string;
  userName?: string;
  userPhone?: string;
  action: string;
  target?: string;
  adTitle?: string;
  adId?: string;
  location?: string;
  timestamp: string;
  ip?: string;
  type?: string;
}

