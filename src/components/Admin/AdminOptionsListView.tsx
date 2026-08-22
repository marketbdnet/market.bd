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
  Power
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

interface AdminOptionItem {
  id: AdminTabType;
  labelBn: string;
  labelEn: string;
  descBn: string;
  descEn: string;
  categoryBn: string;
  categoryEn: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  const adminOptions: AdminOptionItem[] = [
    // Category 1: মডারেশন ও বিজ্ঞাপন (Moderation & Ads)
    {
      id: 'all-ads',
      labelBn: '📦 সকল বিজ্ঞাপন ও মুছুন (All Ads & Delete)',
      labelEn: '📦 All Ads & Delete Control',
      descBn: 'ওয়েবসাইটের সকল বিজ্ঞাপন তালিকা, সার্চ, এডিট এবং ১-ক্লিকে স্থায়ীভাবে ডিলিট (মুছে ফেলা)',
      descEn: 'Full inventory of all ads with search, live filters, instant edit, and permanent delete controls',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: Package,
      badge: `${counts.activeAds + counts.pendingAds} টি বিজ্ঞাপন`,
      highlight: true
    },
    {
      id: 'pending',
      labelBn: '⏳ পেন্ডিং এডস কিউ (Pending Ads)',
      labelEn: '⏳ Pending Ads Queue',
      descBn: 'ইউজারদের পোস্টকৃত নতুন বিজ্ঞাপন দ্রুত যাচাই, এপ্রুভ বা রিজেক্ট করুন',
      descEn: 'Review, approve, or reject newly submitted user advertisements',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: Clock,
      badge: counts.pendingAds > 0 ? `${counts.pendingAds} টি পেন্ডিং` : '0',
      highlight: counts.pendingAds > 0
    },
    {
      id: 'overview',
      labelBn: '📊 সার্বিক তথ্য ও সামারি ড্যাশবোর্ড',
      labelEn: '📊 Overview & Analytics Summary',
      descBn: 'মোট একটিভ বিজ্ঞাপন, ইউজার অ্যাকশন এবং প্ল্যাটফর্ম আয়ের পূর্ণাঙ্গ পরিসংখ্যান',
      descEn: 'Platform high-level analytics, active ads, revenue, and metrics',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: BarChart3,
      badge: `${counts.activeAds} Active`
    },
    {
      id: 'rejected',
      labelBn: '❌ প্রত্যাখ্যাত বিজ্ঞাপন (Rejected Ads)',
      labelEn: '❌ Rejected Ads Archive',
      descBn: 'বাতিলকৃত বিজ্ঞাপনের কারণসহ তালিকা এবং সেলারদের নোটিফিকেশন হিস্ট্রি',
      descEn: 'List of rejected ads with specific rejection reasons and logs',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: AlertOctagon,
      badge: counts.rejectedAds
    },
    {
      id: 'activities',
      labelBn: '📜 ইউজারদের লাইভ অ্যাক্টিভিটি লগস',
      labelEn: '📜 Real-time User Activity Logs',
      descBn: 'বিজ্ঞাপন ভিউ, সার্চ, ফিল্টার ও ইউজারদের সকল লাইভ কার্যক্রমের বিস্তারিত লগ',
      descEn: 'Live chronological stream of user searches, clicks, and activities',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: Activity,
      badge: counts.activities
    },
    {
      id: 'users',
      labelBn: '👥 নিবন্ধিত কাস্টমার লিস্ট ও আইডি নিয়ন্ত্রণ',
      labelEn: '👥 Registered Customers & ID Control',
      descBn: 'সকল নিবন্ধিত গ্রাহকদের তালিকা, আইডি ব্লক/আনব্লক, ডিলিট ও ভেরিফিকেশন ম্যানেজমেন্ট',
      descEn: 'Complete list of registered customers with admin controls to block, unblock, verify, or remove user IDs',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: Users,
      badge: counts.registeredUsers ? `${counts.registeredUsers} কাস্টমার` : undefined,
      highlight: true
    },
    {
      id: 'reports',
      labelBn: '🚩 রিপোর্টেড কন্টেন্ট ও প্রতারণা প্রতিরোধ',
      labelEn: '🚩 Abuse Reports & Fraud Protection',
      descBn: 'ইউজারদের পাঠানো অভিযোগ, ফেক বিজ্ঞাপন ও প্রতারণামূলক সেলারদের বিরুদ্ধে ব্যবস্থা',
      descEn: 'Review reported ads, fraudulent chats, and enforce safety bans',
      categoryBn: 'মডারেশন ও বিজ্ঞাপন',
      categoryEn: 'Moderation & Ads',
      icon: ShieldAlert,
      badge: counts.reports
    },

    // Category 2: সিস্টেম, অ্যাপস ও লাইভ (System, App & Live Setup)
    {
      id: 'maintenance',
      labelBn: '🛑 সমগ্র ওয়েবসাইট সুইচ ও মেইনটেন্যান্স (Site Switch)',
      labelEn: '🛑 Master Website Switch & Maintenance',
      descBn: 'এক ক্লিকে পুরো ওয়েবসাইট অন (Live) অথবা অফ (Under Maintenance) করুন',
      descEn: 'Master switch to turn the entire marketplace online or offline into maintenance mode',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: Power,
      highlight: true
    },
    {
      id: 'live',
      labelBn: '🚀 ১০-স্টেপ লাইভ প্রোডাকশন সেন্টার',
      labelEn: '🚀 10-Step Live Production Center',
      descBn: 'ফায়ারবেস, ডোমেন, হোস্টিং, সিকিউরিটি ও লাইভ ডিপ্লয়মেন্টের ১০টি ধাপের স্ট্যাটাস',
      descEn: 'Production readiness checklists, database, rules, and deployment state',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: ShieldCheck,
      badge: '10/10 READY'
    },
    {
      id: 'app-update',
      labelBn: '📱 অ্যান্ড্রয়েড অ্যাপস ও পারমিশন কন্ট্রোল',
      labelEn: '📱 Android App & Permissions Center',
      descBn: 'অ্যান্ড্রয়েড ১০টি পারমিশন, Manifest.xml, লাইভ টেস্টার ও স্বয়ংক্রিয় রিলিজ নোটস',
      descEn: 'Android 10 permissions, Manifest.xml generator, and live release notes',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: Smartphone,
      badge: '10 Perms'
    },
    {
      id: 'clock',
      labelBn: '⏰ রানিং ঘড়ির সাইজ, ফন্ট ও কালার',
      labelEn: '⏰ Running Clock Customization',
      descBn: 'শীর্ষ ব্যানারের লাইভ ডিজিটাল ঘড়ির সাইজ, ব্যাকগ্রাউন্ড ও টেক্সট কালার নিয়ন্ত্রণ',
      descEn: 'Live clock display customization, styling, and background controls',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: Clock,
      badge: 'LIVE'
    },
    {
      id: 'logo',
      labelBn: '🖼️ লোগো ও অটো-ওয়াটারমার্ক সেটিংস',
      labelEn: '🖼️ Logo & Watermark Settings',
      descBn: 'ওয়েবসাইটের মূল লোগো পরিবর্তন এবং বিজ্ঞাপনের ছবিতে ওয়াটারমার্ক সংযোজন',
      descEn: 'Upload custom marketplace logo and toggle ad image watermarking',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: ImageIcon,
      badge: 'BRAND'
    },
    {
      id: 'seo',
      labelBn: '🌐 এসইও, সাইটম্যাপ ও মেটাট্যাগ সিস্টেম',
      labelEn: '🌐 SEO, Sitemap & Meta Tags',
      descBn: 'গুগল সার্চ ইনডেক্সিং, সোশ্যাল শেয়ার প্রিভিউ এবং ডাইনামিক সাইটম্যাপ জেনারেটর',
      descEn: 'Google search indexing, dynamic sitemap XML, and social meta previews',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: Globe,
      badge: 'XML'
    },
    {
      id: 'hosting',
      labelBn: '🔑 এপিআই কি ও ক্লাউড হোস্টিং গাইড',
      labelEn: '🔑 API Key & Hosting Guide',
      descBn: 'গুগল এআই স্টুডিও API Key ও ক্লাউড রান ডিপ্লয়মেন্ট ও ডোমেন কানেকশন গাইড',
      descEn: 'Gemini API key setup, Cloud Run configuration, and domain connection',
      categoryBn: 'সিস্টেম, অ্যাপস ও লাইভ',
      categoryEn: 'System, App & Live',
      icon: KeyRound,
      badge: 'GUIDE'
    },

    // Category 3: পেমেন্ট গেটওয়ে ও বিলিং (Payments, Gateways & Billing)
    {
      id: 'gateways',
      labelBn: '⚡ এসএমএস, অটো-পেমেন্ট ও পুশ গেটওয়ে',
      labelEn: '⚡ SMS, Payment & Push Gateways',
      descBn: 'এসএমএস ওয়ান-টাইম ওটিপি, পুশ নোটিফিকেশন ও অটো বিজ্ঞাপন মেয়াদ উত্তীর্ণ নিয়ন্ত্রণ',
      descEn: 'SMS gateway, Push notifications, and auto-expiry engines',
      categoryBn: 'পেমেন্ট ও গেটওয়ে',
      categoryEn: 'Payments & Gateways',
      icon: Sparkles,
      badge: 'GATEWAYS'
    },
    {
      id: 'partners',
      labelBn: '💳 অফিশিয়াল পেমেন্ট পার্টনারস লোগো',
      labelEn: '💳 Official Payment Partners Logos',
      descBn: 'বিকাশ, নগদ, রকেট, উপায়, ভিসা ও মাস্টারকার্ড পার্টনার লোগো ও ব্যানার',
      descEn: 'Manage official trusted payment partner badges and checkout banners',
      categoryBn: 'পেমেন্ট ও গেটওয়ে',
      categoryEn: 'Payments & Gateways',
      icon: DollarSign,
      badge: 'LOGOS'
    },
    {
      id: 'accounts',
      labelBn: '📱 বিকাশ, নগদ নম্বর ও ব্যাংক একাউন্ট',
      labelEn: '📱 Payment Numbers & Bank Accounts',
      descBn: 'সেলারদের ফি ও বুস্টিং পেমেন্ট রিসিভ করার জন্য বিকাশ, নগদ ও ব্যাংক নম্বর',
      descEn: 'Configure official bKash, Nagad, Rocket, and Bank transfer accounts',
      categoryBn: 'পেমেন্ট ও গেটওয়ে',
      categoryEn: 'Payments & Gateways',
      icon: Smartphone,
      badge: 'ACTIVE'
    },
    {
      id: 'billing',
      labelBn: '💰 পেমেন্ট হিস্ট্রি, ইনভয়েস ও রেভিনিউ',
      labelEn: '💰 Billing, Invoices & Revenue',
      descBn: 'সকল বুস্টিং পেমেন্ট ট্রানজেকশন, মানি রিসিট ইনভয়েস ও রিফান্ড অনুমোদন',
      descEn: 'Platform transaction history, invoice generation, and revenue balance',
      categoryBn: 'পেমেন্ট ও গেটওয়ে',
      categoryEn: 'Payments & Gateways',
      icon: TrendingUp,
      badge: '৳১.৮৫L'
    },

    // Category 4: মার্কেটপ্লেস ডেটা ও কন্টেন্ট (Marketplace Data & Content)
    {
      id: 'notice',
      labelBn: '📢 ওয়েবসাইট সিস্টেম নোটিশ ও হেল্পলাইন',
      labelEn: '📢 System Notice & Hotline Banner',
      descBn: 'হেডারের জরুরি নোটিশ স্ক্রল ও অফিসিয়াল হেল্পলাইন কন্টাক্ট নম্বর পরিবর্তন',
      descEn: 'Update scrolling marquee notice and official customer support helpline',
      categoryBn: 'মার্কেটপ্লেস ও কন্টেন্ট',
      categoryEn: 'Marketplace & Content',
      icon: Activity,
      badge: 'NOTICE'
    },
    {
      id: 'categories',
      labelBn: '📂 ক্যাটাগরি, সাব-ক্যাটাগরি ও ব্র্যান্ডস',
      labelEn: '📂 Categories & Brands Manager',
      descBn: 'নতুন ক্যাটাগরি, সাব-ক্যাটাগরি যোগ, আইকন পরিবর্তন ও জনপ্রিয় ব্র্যান্ড যুক্ত করুন',
      descEn: 'Manage multi-level category taxonomy, custom icons, and brand tags',
      categoryBn: 'মার্কেটপ্লেস ও কন্টেন্ট',
      categoryEn: 'Marketplace & Content',
      icon: Package,
      badge: 'CAT'
    },
    {
      id: 'business',
      labelBn: '🏪 বিজনেস সেলার ও অফিসিয়াল শপ একাউন্ট',
      labelEn: '🏪 Business Seller & Shop Accounts',
      descBn: 'ভেরিফাইড বিজনেস শপ, মেম্বারশিপ প্যাকেজ এবং কর্পোরেট সেলার অ্যাকাউন্ট',
      descEn: 'Manage premium business seller storefronts, badges, and memberships',
      categoryBn: 'মার্কেটপ্লেস ও কন্টেন্ট',
      categoryEn: 'Marketplace & Content',
      icon: Users,
      badge: 'SHOPS'
    },
    {
      id: 'locations',
      labelBn: '📍 লোকেশন, বিভাগ ও থানা এলাকা তালিকা',
      labelEn: '📍 Locations & Thana Areas',
      descBn: 'বাংলাদেশের ৮টি বিভাগ, ৬৪ জেলা ও সকল থানার লিস্ট এবং নতুন এলাকা যুক্তকরণ',
      descEn: 'Configure Bangladesh 8 divisions, 64 districts, and local thana areas',
      categoryBn: 'মার্কেটপ্লেস ও কন্টেন্ট',
      categoryEn: 'Marketplace & Content',
      icon: Globe,
      badge: '64 Dist'
    },
    {
      id: 'cms',
      labelBn: '📝 সাইট CMS, FAQ, ব্লগ ও নীতিমালা এডিটর',
      labelEn: '📝 Site CMS, FAQ & Blog Editor',
      descBn: 'শর্তাবলী, গোপনীয়তা নীতিমালা, প্রশ্ন-উত্তর (FAQ) এবং সহায়তা গাইড পেজ এডিটর',
      descEn: 'Edit Terms & Conditions, Privacy Policy, FAQs, and help center articles',
      categoryBn: 'মার্কেটপ্লেস ও কন্টেন্ট',
      categoryEn: 'Marketplace & Content',
      icon: BarChart3,
      badge: 'CMS'
    },
    {
      id: 'reviews',
      labelBn: '⭐ সেলার রিভিউ ও রেটিং মডারেশন',
      labelEn: '⭐ Reviews & Ratings Moderation',
      descBn: 'ক্রেতাদের দেয়া সেলার রিভিউ ও রেটিং পর্যবেক্ষণ, অপ্রীতিকর কমেন্ট ফিল্টারিং',
      descEn: 'Moderate buyer ratings, verify genuine feedback, and filter spam reviews',
      categoryBn: 'মার্কেটপ্লেস ও কন্টেন্ট',
      categoryEn: 'Marketplace & Content',
      icon: Star,
      badge: 'MOD'
    },

    // Category 5: সিকিউরিটি, সাপোর্ট ও স্টাফ (Security, Support & Staff)
    {
      id: 'tickets',
      labelBn: '🎧 কাস্টমার সাপোর্ট ও হেল্পডেস্ক টিকিট',
      labelEn: '🎧 Customer Support Tickets',
      descBn: 'ইউজারদের পাঠানো হেল্পডেস্ক টিকিট ও কাস্টমার সহায়তার লাইভ রিপ্লাই সিস্টেম',
      descEn: 'Live helpdesk support ticketing queue and user grievance resolution',
      categoryBn: 'সিকিউরিটি ও স্টাফ',
      categoryEn: 'Security & Staff',
      icon: MessageSquare,
      badge: 'SUPPORT'
    },
    {
      id: 'staff',
      labelBn: '👥 এডমিন স্টাফ রোলস ও পারমিশন কন্ট্রোল',
      labelEn: '👥 Staff Roles & Access Governance',
      descBn: 'সাব-এডমিন, মডারেটর এবং সাপোর্ট এজেন্টদের পৃথক রোল ও এক্সেস পারমিশন',
      descEn: 'Assign granular staff permissions for moderators and finance agents',
      categoryBn: 'সিকিউরিটি ও স্টাফ',
      categoryEn: 'Security & Staff',
      icon: Users,
      badge: 'STAFF'
    },
    {
      id: 'security',
      labelBn: '🛡️ সিকিউরিটি লগস, আইপি ফায়ারওয়াল ও ২FA',
      labelEn: '🛡️ Security Logs, IP Firewall & 2FA',
      descBn: 'অনুপ্রবেশ প্রতিরোধ, ব্রুট-ফোর্স লক, আইপি ব্যান ও এডমিন দ্বি-স্তর বিশিষ্ট সুরক্ষা',
      descEn: 'Audit trails, IP blacklist/whitelist, brute-force logs, and 2FA auth',
      categoryBn: 'সিকিউরিটি ও স্টাফ',
      categoryEn: 'Security & Staff',
      icon: Lock,
      badge: '2FA'
    }
  ];

  const categories = [
    { id: 'all', labelBn: 'সকল অপশন (All)', labelEn: 'All Options' },
    { id: 'মডারেশন ও বিজ্ঞাপন', labelBn: 'মডারেশন ও এডস', labelEn: 'Moderation & Ads' },
    { id: 'সিস্টেম, অ্যাপস ও লাইভ', labelBn: 'সিস্টেম ও লাইভ', labelEn: 'System & Live' },
    { id: 'পেমেন্ট ও গেটওয়ে', labelBn: 'পেমেন্ট ও গেটওয়ে', labelEn: 'Payments & Billing' },
    { id: 'মার্কেটপ্লেস ও কন্টেন্ট', labelBn: 'ক্যাটাগরি ও কন্টেন্ট', labelEn: 'Marketplace Data' },
    { id: 'সিকিউরিটি ও স্টাফ', labelBn: 'সিকিউরিটি ও সাপোর্ট', labelEn: 'Security & Staff' }
  ];

  const filteredOptions = adminOptions.filter(opt => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      opt.labelBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.descBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.descEn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      opt.categoryBn === selectedCategory ||
      (selectedCategory === 'মডারেশন ও বিজ্ঞাপন' && opt.categoryBn.includes('মডারেশন')) ||
      (selectedCategory === 'সিস্টেম, অ্যাপস ও লাইভ' && opt.categoryBn.includes('সিস্টেম')) ||
      (selectedCategory === 'পেমেন্ট ও গেটওয়ে' && opt.categoryBn.includes('পেমেন্ট')) ||
      (selectedCategory === 'মার্কেটপ্লেস ও কন্টেন্ট' && opt.categoryBn.includes('মার্কেটপ্লেস')) ||
      (selectedCategory === 'সিকিউরিটি ও স্টাফ' && opt.categoryBn.includes('সিকিউরিটি'));

    return matchesSearch && matchesCategory;
  });

  const activeOptionObj = adminOptions.find(o => o.id === adminTab) || adminOptions[0];

  return (
    <div className="space-y-4">
      {/* Mobile Top Option Selector Trigger */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="p-2 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 shrink-0">
            <LayoutList className="w-4 h-4" />
          </span>
          <div className="truncate">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">
              {language === 'bn' ? 'বর্তমান অপশন' : 'Active Admin Option'}
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
          <span>{language === 'bn' ? 'সকল অপশন তালিকা' : 'View All Options'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileListOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main List View Card - Clean Standard Light Mode */}
      <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 text-slate-800 dark:text-slate-100 ${
        isMobileListOpen ? 'block' : 'hidden lg:block'
      }`}>
        {/* List Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-red-600 text-white rounded-2xl shadow-xs">
              <LayoutList className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'bn' ? '📋 এডমিন অপশন তালিকা (Admin Options List)' : '📋 Admin Options List View'}</span>
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-2 py-0.5 rounded-full font-bold border border-red-200 dark:border-red-800">
                  {adminOptions.length} Tools
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'উপর থেকে নিচে সকল এডমিন কন্ট্রোল অপশন সুবিন্যস্ত রয়েছে। যে কোনো অপশনে ক্লিক করে কাজ করুন।'
                  : 'All 25 enterprise management tools organized vertically in an intuitive list view.'}
              </p>
            </div>
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'এডমিন অপশন খুঁজুন (Search)...' : 'Search admin options...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-red-500" />
            <span>{language === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}</span>
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 text-xs flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* The Vertical List View Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredOptions.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              {language === 'bn' ? '❌ কোনো অপশন পাওয়া যায়নি। অন্য কিছু দিয়ে সার্চ করুন।' : '❌ No matching admin option found.'}
            </div>
          ) : (
            filteredOptions.map((opt) => {
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
                  className={`text-left p-3.5 rounded-2xl transition cursor-pointer border flex items-start gap-3 group relative ${
                    isActive
                      ? 'bg-red-50/90 dark:bg-red-950/40 border-2 border-red-600 shadow-xs ring-1 ring-red-500/20'
                      : 'bg-gray-50/70 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border-gray-200/80 dark:border-slate-700/80 hover:border-red-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 transition ${
                    isActive
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 group-hover:text-red-600 group-hover:border-red-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                        {language === 'bn' ? opt.categoryBn : opt.categoryEn}
                      </span>
                      {opt.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                          opt.highlight
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : isActive
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-black truncate mt-0.5 ${
                      isActive ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white group-hover:text-red-600'
                    }`}>
                      {language === 'bn' ? opt.labelBn : opt.labelEn}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                      {language === 'bn' ? opt.descBn : opt.descEn}
                    </p>
                  </div>

                  {/* Active Check Indicator */}
                  {isActive && (
                    <div className="shrink-0 self-center">
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
