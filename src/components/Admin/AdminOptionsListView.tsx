import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Lock,
  MessageSquare,
  Package,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronDown,
  LayoutList,
  Layers,
  Filter,
  Check,
  Power,
  FolderTree,
  Tag,
  Bell,
  Settings,
  Shield,
  FileText,
  HelpCircle,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export type AdminTabType =
  | 'overview'
  | 'all-ads'
  | 'pending'
  | 'rejected'
  | 'activities'
  | 'users'
  | 'reports'
  | 'maintenance'
  | 'logo'
  | 'seo'
  | 'live'
  | 'app-update'
  | 'hosting'
  | 'gateways'
  | 'partners'
  | 'accounts'
  | 'notice'
  | 'clock'
  | 'categories'
  | 'business'
  | 'locations'
  | 'tickets'
  | 'reviews'
  | 'cms'
  | 'billing'
  | 'staff'
  | 'security';

export interface AdminOptionItem {
  id: AdminTabType;
  indexNum: number;
  labelBn: string;
  labelEn: string;
  descBn: string;
  descEn: string;
  groupId: 'ADVERTISEMENT' | 'USER' | 'CATEGORY' | 'SYSTEM' | 'ADDITIONAL';
  groupBn: string;
  groupEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

interface AdminOptionsListViewProps {
  adminTab: AdminTabType;
  setAdminTab: (tab: AdminTabType) => void;
  language: 'bn' | 'en';
  counts: {
    pendingAds: number;
    rejectedAds: number;
    activeAds: number;
    activities: number;
    reports: number;
    registeredUsers?: number;
  };
}

export const AdminOptionsListView: React.FC<AdminOptionsListViewProps> = ({
  adminTab,
  setAdminTab,
  language,
  counts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [showAdditionalTools, setShowAdditionalTools] = useState(false);

  // 16 Primary Admin Items strictly ordered and categorized as requested
  const primaryAdminOptions: AdminOptionItem[] = [
    // --- GROUP 1: ADVERTISEMENT (বিজ্ঞাপন ও মডারেশন) ---
    {
      id: 'overview',
      indexNum: 1,
      labelBn: '১. ড্যাশবোর্ড ও সার্বিক পরিসংখ্যান (Dashboard)',
      labelEn: '1. Overview Dashboard & Analytics',
      descBn: 'মোট সক্রিয় বিজ্ঞাপন, ইউজার অ্যাকশন এবং প্ল্যাটফর্মের সার্বিক পারফরম্যান্স পরিসংখ্যান',
      descEn: 'Platform high-level analytics, ad counts, user metrics, and revenue summary',
      groupId: 'ADVERTISEMENT',
      groupBn: 'ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা)',
      groupEn: 'ADVERTISEMENT MANAGEMENT',
      icon: BarChart3,
      badge: `${counts.activeAds} Active`
    },
    {
      id: 'all-ads',
      indexNum: 2,
      labelBn: '২. বিজ্ঞাপন ব্যবস্থাপনা ও সকল বিজ্ঞাপন (All Ads)',
      labelEn: '2. Advertisement Management & Inventory',
      descBn: 'ওয়েবসাইটের সকল বিজ্ঞাপন তালিকা, লাইভ সার্চ, ফিল্টার, এডিট ও স্থায়ীভাবে ডিলিট কন্ট্রোল',
      descEn: 'Complete advertisement inventory with search, filtering, and instant delete controls',
      groupId: 'ADVERTISEMENT',
      groupBn: 'ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা)',
      groupEn: 'ADVERTISEMENT MANAGEMENT',
      icon: Package,
      badge: `${counts.activeAds + counts.pendingAds} Ads`,
      highlight: true
    },
    {
      id: 'pending',
      indexNum: 3,
      labelBn: '৩. পেন্ডিং / রিভিউাধীন বিজ্ঞাপন (Pending Ads)',
      labelEn: '3. Pending & Under Review Ads',
      descBn: 'ইউজারদের পোস্টকৃত নতুন বিজ্ঞাপন দ্রুত পর্যালোচনা, এক ক্লিকে এপ্রুভ বা রিজেক্ট করুন',
      descEn: 'Review and quickly approve or reject newly submitted user advertisements',
      groupId: 'ADVERTISEMENT',
      groupBn: 'ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা)',
      groupEn: 'ADVERTISEMENT MANAGEMENT',
      icon: Clock,
      badge: counts.pendingAds > 0 ? `${counts.pendingAds} টি পেন্ডিং` : '0',
      highlight: counts.pendingAds > 0
    },
    {
      id: 'live',
      indexNum: 4,
      labelBn: '৪. সক্রিয় ও লাইভ বিজ্ঞাপন (Active / Live Ads)',
      labelEn: '4. Active & Live Ads Production',
      descBn: 'সরাসরি লাইভ প্রোডাকশন স্ট্যাটাস, ফায়ারবেস ডেটাবেস সিঙ্ক ও লাইভ কন্টেন্ট ভেরিফিকেশন',
      descEn: 'Live published advertisements queue and production readiness center',
      groupId: 'ADVERTISEMENT',
      groupBn: 'ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা)',
      groupEn: 'ADVERTISEMENT MANAGEMENT',
      icon: ShieldCheck,
      badge: '10/10 READY'
    },
    {
      id: 'rejected',
      indexNum: 5,
      labelBn: '৫. প্রত্যাখ্যাত বিজ্ঞাপন (Rejected Ads)',
      labelEn: '5. Rejected Ads Archive',
      descBn: 'বাতিলকৃত বিজ্ঞাপনের তালিকা, রিজেকশন কারণ ও সেলারদের পাঠানো নোটিফিকেশন হিস্ট্রি',
      descEn: 'Archive of rejected advertisements with admin reasons and seller logs',
      groupId: 'ADVERTISEMENT',
      groupBn: 'ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা)',
      groupEn: 'ADVERTISEMENT MANAGEMENT',
      icon: AlertOctagon,
      badge: counts.rejectedAds
    },
    {
      id: 'all-ads',
      indexNum: 6,
      labelBn: '৬. সোলেড ও মেয়াদোত্তীর্ণ বিজ্ঞাপন (Sold / Expired)',
      labelEn: '6. Sold & Expired Ads Management',
      descBn: 'বিক্রি সম্পন্ন এবং ৩০ দিন অতিক্রম করা মেয়াদোত্তীর্ণ বিজ্ঞাপনের স্ট্যাটাস ফিল্টারিং',
      descEn: 'Filter and manage completed sales and expired marketplace listings',
      groupId: 'ADVERTISEMENT',
      groupBn: 'ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা)',
      groupEn: 'ADVERTISEMENT MANAGEMENT',
      icon: CheckCircle2,
      badge: 'FILTER'
    },

    // --- GROUP 2: USER (ইউজার ও নিরাপত্তা) ---
    {
      id: 'users',
      indexNum: 7,
      labelBn: '৭. কাস্টমার ও ইউজার ম্যানেজমেন্ট (User Management)',
      labelEn: '7. User & Customer Management',
      descBn: 'সকল নিবন্ধিত ক্রেতা-বিক্রেতাদের তালিকা, আইডি ভেরিফিকেশন, ব্লক/আনব্লক ও আইডি কন্ট্রোল',
      descEn: 'Manage all registered buyers and sellers, phone IDs, verification, and blocking',
      groupId: 'USER',
      groupBn: 'USER (ইউজার ও গ্রাহক ব্যবস্থাপনা)',
      groupEn: 'USER MANAGEMENT',
      icon: Users,
      badge: counts.registeredUsers ? `${counts.registeredUsers} কাস্টমার` : undefined,
      highlight: true
    },
    {
      id: 'reports',
      indexNum: 8,
      labelBn: '৮. রিপোর্টেড বিজ্ঞাপন ও প্রতারণা রিপোর্ট (Abuse Reports)',
      labelEn: '8. Reported Ads & User Abuse Reports',
      descBn: 'গ্রাহকদের পাঠানো অভিযোগ, স্প্যাম ও ভুয়া বিজ্ঞাপন প্রতিরোধে সরাসরি ব্যান ব্যবস্থা',
      descEn: 'Review user-flagged scam advertisements, chat reports, and ban offenders',
      groupId: 'USER',
      groupBn: 'USER (ইউজার ও গ্রাহক ব্যবস্থাপনা)',
      groupEn: 'USER MANAGEMENT',
      icon: ShieldAlert,
      badge: counts.reports
    },

    // --- GROUP 3: CATEGORY (ক্যাটাগরি ও ব্র্যান্ডস) ---
    {
      id: 'categories',
      indexNum: 9,
      labelBn: '৯. মূল ক্যাটাগরি ম্যানেজমেন্ট (Categories)',
      labelEn: '9. Primary Categories Manager',
      descBn: 'মার্কেটপ্লেসের মূল ক্যাটাগরি তালিকা, নতুন ক্যাটাগরি যুক্ত, আইকন ও লেআউট কনফিগার',
      descEn: 'Manage main marketplace categories, create new groups, and organize layout',
      groupId: 'CATEGORY',
      groupBn: 'CATEGORY (ক্যাটাগরি ও কন্টেন্ট)',
      groupEn: 'CATEGORY MANAGEMENT',
      icon: FolderTree,
      badge: 'PRIMARY'
    },
    {
      id: 'categories',
      indexNum: 10,
      labelBn: '১০. সাব-ক্যাটাগরি ম্যানেজমেন্ট (Subcategories)',
      labelEn: '10. Subcategories Manager',
      descBn: 'প্রতিটি মূল ক্যাটাগরির অধীনে নির্দিষ্ট সাব-ক্যাটাগরি তৈরি, এডিট ও ক্রমানুসারে সাজানো',
      descEn: 'Configure structured subcategories under each primary category node',
      groupId: 'CATEGORY',
      groupBn: 'CATEGORY (ক্যাটাগরি ও কন্টেন্ট)',
      groupEn: 'CATEGORY MANAGEMENT',
      icon: Layers,
      badge: 'SUB-CAT'
    },
    {
      id: 'categories',
      indexNum: 11,
      labelBn: '১১. সেকেন্ড-লেভেল ক্যাটাগরি ও ব্র্যান্ডস (2nd-Level)',
      labelEn: '11. Second-Level Categories & Brands',
      descBn: 'নির্দিষ্ট মডেল, ব্র্যান্ড এবং ৩য় স্তরের ফিল্টারিং ট্যাগ ও ক্যাটাগরি বিন্যাস',
      descEn: 'Brand-level filtering, model taxonomy, and third-tier deep catalog trees',
      groupId: 'CATEGORY',
      groupBn: 'CATEGORY (ক্যাটাগরি ও কন্টেন্ট)',
      groupEn: 'CATEGORY MANAGEMENT',
      icon: Tag,
      badge: 'BRANDS'
    },
    {
      id: 'logo',
      indexNum: 12,
      labelBn: '১২. ক্যাটাগরি ইমেজ ও লোগো ম্যানেজমেন্ট (Category Images)',
      labelEn: '12. Category Image & Logo Management',
      descBn: 'ক্যাটাগরি ব্যানার, অফিশিয়াল ওয়েবসাইট লোগো পরিবর্তন ও বিজ্ঞাপনের ফটোতে ওয়াটারমার্ক',
      descEn: 'Manage category artwork, marketplace logo, and automated image watermarking',
      groupId: 'CATEGORY',
      groupBn: 'CATEGORY (ক্যাটাগরি ও কন্টেন্ট)',
      groupEn: 'CATEGORY MANAGEMENT',
      icon: ImageIcon,
      badge: 'BRANDING'
    },

    // --- GROUP 4: SYSTEM (সিস্টেম ও সেটিংস) ---
    {
      id: 'notice',
      indexNum: 13,
      labelBn: '১৩. নোটিফিকেশন ও সিস্টেম নোটিশ (Notifications)',
      labelEn: '13. Notifications & System Notices',
      descBn: 'হেডারের জরুরি নোটিশ স্ক্রল, হেল্পলাইন কন্টাক্ট এবং পুশ নোটিফিকেশন এলার্ট বার্তা',
      descEn: 'Manage live scrolling banner marquee, hotline phone, and push announcements',
      groupId: 'SYSTEM',
      groupBn: 'SYSTEM (সিস্টেম, সেটিংস ও সিকিউরিটি)',
      groupEn: 'SYSTEM & SETTINGS',
      icon: Bell,
      badge: 'NOTICE'
    },
    {
      id: 'staff',
      indexNum: 14,
      labelBn: '১৪. এডমিন রোলস ও পারমিশন কন্ট্রোল (Admin Roles)',
      labelEn: '14. Admin Roles & Staff Access Control',
      descBn: 'মডারেটর, সাব-এডমিন ও সাপোর্ট স্টাফদের নির্দিষ্ট এক্সেস পারমিশন ও রোল ম্যানেজমেন্ট',
      descEn: 'Assign custom role privileges for moderators, support agents, and finance staff',
      groupId: 'SYSTEM',
      groupBn: 'SYSTEM (সিস্টেম, সেটিংস ও সিকিউরিটি)',
      groupEn: 'SYSTEM & SETTINGS',
      icon: Shield,
      badge: 'ROLES'
    },
    {
      id: 'maintenance',
      indexNum: 15,
      labelBn: '১৫. ওয়েবসাইট সেটিংস ও মেইনটেন্যান্স (Site Settings)',
      labelEn: '15. Site Settings & Maintenance Switch',
      descBn: '১ম সুইচ (সাধারণ মেইনটেন্যান্স) ও ২য় সুইচ (মাস্টার লকডাউন) দিয়ে সাইট লাইভ/অফ করুন',
      descEn: 'Master switches to set marketplace live or offline with pin-locked security',
      groupId: 'SYSTEM',
      groupBn: 'SYSTEM (সিস্টেম, সেটিংস ও সিকিউরিটি)',
      groupEn: 'SYSTEM & SETTINGS',
      icon: Power,
      highlight: true
    },
    {
      id: 'activities',
      indexNum: 16,
      labelBn: '১৬. অ্যাক্টিভিটি ও সিকিউরিটি অডিট লগস (Activity Logs)',
      labelEn: '16. Activity & Security Audit Logs',
      descBn: 'ইউজারদের লাইভ সার্চ, ভিউ, পোস্ট এবং এডমিন অ্যাকশন সমূহের ক্রমানুসারিক অডিট ট্রেইল',
      descEn: 'Live chronological stream of user activity events, IP logs, and system actions',
      groupId: 'SYSTEM',
      groupBn: 'SYSTEM (সিস্টেম, সেটিংস ও সিকিউরিটি)',
      groupEn: 'SYSTEM & SETTINGS',
      icon: Activity,
      badge: counts.activities
    }
  ];

  // Additional Enterprise Support Tools (preserved without loss)
  const additionalAdminOptions: AdminOptionItem[] = [
    {
      id: 'gateways',
      indexNum: 17,
      labelBn: '⚡ এসএমএস, পেমেন্ট ও পুশ গেটওয়ে',
      labelEn: '⚡ SMS, Payment & Push Gateways',
      descBn: 'এসএমএস ওটিপি কনফিগারেশন, পুশ নোটিফিকেশন ও অটো এক্সপায়ারি ইঞ্জিন',
      descEn: 'SMS gateway, push alerts, and auto-expiration engine parameters',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Sparkles,
      badge: 'GATEWAYS'
    },
    {
      id: 'accounts',
      indexNum: 18,
      labelBn: '📱 বিকাশ, নগদ ও ব্যাংক একাউন্ট নম্বর',
      labelEn: '📱 Payment Accounts & Bank Numbers',
      descBn: 'বুস্টিং ও ভেরিফিকেশন ফি রিসিভ করার অফিশিয়াল বিকাশ ও নগদ মার্চেন্ট নম্বর',
      descEn: 'Configure official bKash, Nagad, Rocket, and Bank transfer accounts',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Smartphone,
      badge: 'ACCOUNTS'
    },
    {
      id: 'partners',
      indexNum: 19,
      labelBn: '💳 অফিশিয়াল পেমেন্ট পার্টনারস লোগো',
      labelEn: '💳 Official Payment Partner Logos',
      descBn: 'বিকাশ, নগদ, ভিসা ও মাস্টারকার্ড পার্টনার ট্রাস্টেড ব্যাজ ব্যানার',
      descEn: 'Manage official trusted payment partner badges and checkout banners',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: DollarSign,
      badge: 'LOGOS'
    },
    {
      id: 'billing',
      indexNum: 20,
      labelBn: '💰 পেমেন্ট হিস্ট্রি, ইনভয়েস ও রেভিনিউ',
      labelEn: '💰 Billing, Invoices & Revenue',
      descBn: 'সকল বুস্টিং পেমেন্ট ট্রানজেকশন, মানি রিসিট ইনভয়েস ও রিফান্ড অনুমোদন',
      descEn: 'Platform transaction history, invoice generation, and revenue balance',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: TrendingUp,
      badge: '৳১.৮৫L'
    },
    {
      id: 'clock',
      indexNum: 21,
      labelBn: '⏰ রানিং ঘড়ির সাইজ, ফন্ট ও কালার',
      labelEn: '⏰ Running Clock Customization',
      descBn: 'শীর্ষ ব্যানারের লাইভ ডিজিটাল ঘড়ির সাইজ, ব্যাকগ্রাউন্ড ও টেক্সট কালার নিয়ন্ত্রণ',
      descEn: 'Live clock display customization, styling, and background controls',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Clock,
      badge: 'CLOCK'
    },
    {
      id: 'seo',
      indexNum: 22,
      labelBn: '🌐 এসইও, সাইটম্যাপ ও মেটাট্যাগ',
      labelEn: '🌐 SEO, Sitemap & Meta Tags',
      descBn: 'গুগল সার্চ ইনডেক্সিং, সোশ্যাল শেয়ার প্রিভিউ এবং ডাইনামিক সাইটম্যাপ জেনারেটর',
      descEn: 'Google search indexing, dynamic sitemap XML, and social meta previews',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Globe,
      badge: 'SEO'
    },
    {
      id: 'locations',
      indexNum: 23,
      labelBn: '📍 লোকেশন, বিভাগ ও থানা এলাকা',
      labelEn: '📍 Locations & Thana Areas',
      descBn: 'বাংলাদেশের ৮টি বিভাগ, ৬৪ জেলা ও সকল থানার তালিকা ও নতুন এলাকা যুক্তকরণ',
      descEn: 'Configure Bangladesh 8 divisions, 64 districts, and local thana areas',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Globe,
      badge: '64 Dist'
    },
    {
      id: 'business',
      indexNum: 24,
      labelBn: '🏪 বিজনেস সেলার ও শপ একাউন্ট',
      labelEn: '🏪 Business Seller & Shop Accounts',
      descBn: 'ভেরিফাইড বিজনেস শপ, মেম্বারশিপ প্যাকেজ এবং কর্পোরেট সেলার অ্যাকাউন্ট',
      descEn: 'Manage premium business seller storefronts, badges, and memberships',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Users,
      badge: 'SHOPS'
    },
    {
      id: 'tickets',
      indexNum: 25,
      labelBn: '🎧 কাস্টমার সাপোর্ট ও হেল্পডেস্ক টিকিট',
      labelEn: '🎧 Customer Support Tickets',
      descBn: 'ইউজারদের পাঠানো হেল্পডেস্ক টিকিট ও কাস্টমার সহায়তার লাইভ রিপ্লাই সিস্টেম',
      descEn: 'Live helpdesk support ticketing queue and user grievance resolution',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: MessageSquare,
      badge: 'SUPPORT'
    },
    {
      id: 'reviews',
      indexNum: 26,
      labelBn: '⭐ সেলার রিভিউ ও রেটিং মডারেশন',
      labelEn: '⭐ Reviews & Ratings Moderation',
      descBn: 'ক্রেতাদের দেয়া সেলার রিভিউ ও রেটিং পর্যবেক্ষণ, অপ্রীতিকর কমেন্ট ফিল্টারিং',
      descEn: 'Moderate buyer ratings, verify genuine feedback, and filter spam reviews',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Star,
      badge: 'REVIEWS'
    },
    {
      id: 'cms',
      indexNum: 27,
      labelBn: '📝 সাইট CMS, FAQ ও নীতিমালা এডিটর',
      labelEn: '📝 Site CMS, FAQ & Policy Editor',
      descBn: 'শর্তাবলী, গোপনীয়তা নীতিমালা, প্রশ্ন-উত্তর (FAQ) এবং সহায়তা গাইড পেজ এডিটর',
      descEn: 'Edit Terms & Conditions, Privacy Policy, FAQs, and help center articles',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: FileText,
      badge: 'CMS'
    },
    {
      id: 'security',
      indexNum: 28,
      labelBn: '🛡️ সিকিউরিটি লগস, আইপি ফায়ারওয়াল ও ২FA',
      labelEn: '🛡️ Security Logs, IP Firewall & 2FA',
      descBn: 'অনুপ্রবেশ প্রতিরোধ, ব্রুট-ফোর্স লক, আইপি ব্যান ও এডমিন দ্বি-স্তর বিশিষ্ট সুরক্ষা',
      descEn: 'Audit trails, IP blacklist/whitelist, brute-force logs, and 2FA auth',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Lock,
      badge: '2FA'
    },
    {
      id: 'app-update',
      indexNum: 29,
      labelBn: '📱 অ্যান্ড্রয়েড অ্যাপস ও পারমিশন',
      labelEn: '📱 Android App & Permissions Center',
      descBn: 'অ্যান্ড্রয়েড ১০টি পারমিশন, Manifest.xml, লাইভ টেস্টার ও স্বয়ংক্রিয় রিলিজ নোটস',
      descEn: 'Android 10 permissions, Manifest.xml generator, and live release notes',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: Smartphone,
      badge: 'ANDROID'
    },
    {
      id: 'hosting',
      indexNum: 30,
      labelBn: '🔑 এপিআই কি ও ক্লাউড হোস্টিং গাইড',
      labelEn: '🔑 API Key & Hosting Guide',
      descBn: 'গুগল এআই স্টুডিও API Key ও ক্লাউড রান ডিপ্লয়মেন্ট ও ডোমেন কানেকশন গাইড',
      descEn: 'Gemini API key setup, Cloud Run configuration, and domain connection',
      groupId: 'ADDITIONAL',
      groupBn: 'অতিরিক্ত সিস্টেম টুলস',
      groupEn: 'Additional Tools',
      icon: KeyRound,
      badge: 'GUIDE'
    }
  ];

  const allOptions = [...primaryAdminOptions, ...additionalAdminOptions];

  const filterGroups = [
    { id: 'all', labelBn: 'সকল ১৬টি অপশন (All)', labelEn: 'All 16 Options' },
    { id: 'ADVERTISEMENT', labelBn: 'বিজ্ঞাপন (Ads)', labelEn: 'Advertisement' },
    { id: 'USER', labelBn: 'ইউজার (Users)', labelEn: 'User Management' },
    { id: 'CATEGORY', labelBn: 'ক্যাটাগরি (Categories)', labelEn: 'Categories' },
    { id: 'SYSTEM', labelBn: 'সিস্টেম (System)', labelEn: 'System Settings' }
  ];

  const filteredPrimary = primaryAdminOptions.filter(opt => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      opt.labelBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.descBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.descEn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'all' || opt.groupId === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  const filteredAdditional = additionalAdminOptions.filter(opt => {
    if (searchQuery.trim() === '') return true;
    return (
      opt.labelBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.descBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.descEn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeOptionObj = allOptions.find(o => o.id === adminTab) || primaryAdminOptions[0];

  // Group definitions for clear vertical display
  const groupHeaders = [
    {
      groupId: 'ADVERTISEMENT',
      titleBn: '📦 ADVERTISEMENT (বিজ্ঞাপন ব্যবস্থাপনা ও মডারেশন)',
      titleEn: '📦 ADVERTISEMENT MANAGEMENT & MODERATION',
      descBn: 'ড্যাশবোর্ড, সকল বিজ্ঞাপন, পেন্ডিং রিভিউ, লাইভ এডস, রিজেক্টেড ও সোলেড বিজ্ঞাপন কন্ট্রোল',
      descEn: 'Dashboard overview, ad inventory, pending approvals, live production, rejected and sold items'
    },
    {
      groupId: 'USER',
      titleBn: '👥 USER (ইউজার ও গ্রাহক ব্যবস্থাপনা)',
      titleEn: '👥 USER & CUSTOMER MANAGEMENT',
      descBn: 'নিবন্ধিত কাস্টমার তালিকা, আইডি ব্লক/আনব্লক ও প্রতারণা প্রতিরোধ রিপোর্ট',
      descEn: 'Registered customer directory, account verification, ID control, and abuse resolution'
    },
    {
      groupId: 'CATEGORY',
      titleBn: '📂 CATEGORY (ক্যাটাগরি ও কন্টেন্ট)',
      titleEn: '📂 CATEGORY & CONTENT MANAGEMENT',
      descBn: 'মূল ক্যাটাগরি, সাব-ক্যাটাগরি, ২য় স্তর ব্র্যান্ডস এবং ক্যাটাগরি ছবি ও ওয়াটারমার্ক',
      descEn: 'Primary categories, subcategories, second-level brands, category images, and watermark branding'
    },
    {
      groupId: 'SYSTEM',
      titleBn: '⚙️ SYSTEM (সিস্টেম, সেটিংস ও সিকিউরিটি)',
      titleEn: '⚙️ SYSTEM, SETTINGS & SECURITY',
      descBn: 'সিস্টেম নোটিশ, এডমিন স্টাফ রোলস, ওয়েবসাইট মেইনটেন্যান্স সুইচ ও লাইভ অ্যাক্টিভিটি লগস',
      descEn: 'System announcements, role privileges, master site switch, and chronological audit logs'
    }
  ];

  return (
    <div className="space-y-4" id="admin-vertical-options-container">
      {/* Mobile Top Option Selector Trigger */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="p-2 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 shrink-0">
            <LayoutList className="w-4 h-4" />
          </span>
          <div className="truncate">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">
              {language === 'bn' ? 'বর্তমান সক্রিয় অপশন' : 'Active Admin Option'}
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
              {language === 'bn' ? activeOptionObj.labelBn : activeOptionObj.labelEn}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileListOpen(!isMobileListOpen)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
        >
          <span>{language === 'bn' ? 'সকল ১৬টি অপশন' : 'View 16 Options'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileListOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Vertical List View Card */}
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 text-slate-800 dark:text-slate-100 ${
          isMobileListOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* List Header & Anti-Autofill Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-red-600 text-white rounded-2xl shadow-xs">
              <LayoutList className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'bn' ? '📋 এডমিন অপশন তালিকা (Vertical List View)' : '📋 Admin Options Vertical List View'}</span>
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-2.5 py-0.5 rounded-full font-black border border-red-200 dark:border-red-800">
                  ১৬টি প্রধান অপশন
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'উপর থেকে নিচে ১৬টি এডমিন ফিচার ৪টি প্রধান ক্যাটাগরিতে সাজানো রয়েছে।'
                  : '16 enterprise management features logically organized into 4 primary groups.'}
              </p>
            </div>
          </div>

          {/* Secure Search Bar with strict non-phone attributes */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              name="admin_quick_search_no_autofill"
              id="admin-search-input-field"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="search"
              data-lpignore="true"
              data-form-type="other"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'এডমিন অপশন খুঁজুন (Search)...' : 'Search admin options...'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white dark:focus:bg-slate-900 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold p-0.5"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Group Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            <span>{language === 'bn' ? 'গ্রুপ ফিল্টার:' : 'Filter:'}</span>
          </span>
          {filterGroups.map(group => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroup(group.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 text-xs flex items-center gap-1 ${
                selectedGroup === group.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{language === 'bn' ? group.labelBn : group.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Vertical List View Content */}
        <div className="space-y-6 max-h-[580px] overflow-y-auto pr-1">
          {filteredPrimary.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              {language === 'bn' ? '❌ কোনো অপশন পাওয়া যায়নি। অন্য কিছু দিয়ে সার্চ করুন।' : '❌ No matching admin option found.'}
            </div>
          ) : (
            groupHeaders.map(group => {
              const groupItems = filteredPrimary.filter(item => item.groupId === group.groupId);
              if (groupItems.length === 0) return null;

              return (
                <div key={group.groupId} className="space-y-2.5">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{language === 'bn' ? group.titleBn : group.titleEn}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                          {groupItems.length} টি
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'bn' ? group.descBn : group.descEn}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {groupItems.map(opt => {
                      const Icon = opt.icon;
                      const isActive = adminTab === opt.id;

                      return (
                        <button
                          key={`${opt.groupId}-${opt.indexNum}-${opt.id}`}
                          type="button"
                          id={`admin-option-btn-${opt.indexNum}`}
                          onClick={() => {
                            setAdminTab(opt.id);
                            setIsMobileListOpen(false);
                          }}
                          className={`text-left p-3.5 rounded-2xl transition cursor-pointer border flex items-start gap-3 group relative ${
                            isActive
                              ? 'bg-red-50/90 dark:bg-red-950/40 border-2 border-red-600 shadow-xs ring-1 ring-red-500/20'
                              : 'bg-slate-50/70 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 hover:border-red-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {/* Numerical Step / Index & Icon */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {opt.indexNum}
                            </span>
                            <div className={`p-2 rounded-xl border shrink-0 transition ${
                              isActive
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 group-hover:text-red-600 group-hover:border-red-300'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className={`text-xs font-black truncate ${
                                isActive ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white group-hover:text-red-600'
                              }`}>
                                {language === 'bn' ? opt.labelBn : opt.labelEn}
                              </h5>
                              {opt.badge && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                                  opt.highlight
                                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                                    : isActive
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                }`}>
                                  {opt.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-snug">
                              {language === 'bn' ? opt.descBn : opt.descEn}
                            </p>
                          </div>

                          {/* Active Indicator */}
                          {isActive && (
                            <div className="shrink-0 self-center">
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Additional Enterprise Tools Accordion */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdditionalTools(!showAdditionalTools)}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-500" />
                <span>
                  {language === 'bn'
                    ? `🔧 অতিরিক্ত সিস্টেম ও পেমেন্ট টুলস (${additionalAdminOptions.length}টি)`
                    : `🔧 Additional System & Payment Gateways (${additionalAdminOptions.length} Tools)`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdditionalTools ? 'rotate-180' : ''}`} />
            </button>

            {showAdditionalTools && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3 animate-in fade-in">
                {filteredAdditional.map(opt => {
                  const Icon = opt.icon;
                  const isActive = adminTab === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAdminTab(opt.id);
                        setIsMobileListOpen(false);
                      }}
                      className={`text-left p-3 rounded-2xl transition cursor-pointer border flex items-start gap-2.5 group ${
                        isActive
                          ? 'bg-red-50/90 dark:bg-red-950/40 border-2 border-red-600 shadow-xs ring-1 ring-red-500/20'
                          : 'bg-slate-50/60 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-700/70'
                      }`}
                    >
                      <div className={`p-2 rounded-xl border shrink-0 transition ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h6 className={`text-xs font-bold truncate ${isActive ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                            {language === 'bn' ? opt.labelBn : opt.labelEn}
                          </h6>
                          {opt.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold shrink-0">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {language === 'bn' ? opt.descBn : opt.descEn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
