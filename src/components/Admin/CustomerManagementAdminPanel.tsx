import React, { useState, useMemo } from 'react';
import { useMarket, UserProfile } from '../../context/MarketContext';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Lock,
  Unlock,
  ExternalLink,
  Eye,
  Edit,
  X,
  FileText,
  UserPlus
} from 'lucide-react';

export const CustomerManagementAdminPanel: React.FC = () => {
  const {
    language,
    registeredUsers,
    toggleBlockUser,
    deleteUserById,
    toggleVerifyUser,
    addManualUser,
    updateRegisteredUser,
    products,
    setFilters,
    setActiveTab
  } = useMarket();

  // Search, Filter & Sort State
  const [searchFilter, setSearchFilter] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'active' | 'blocked' | 'seller' | 'buyer' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_ads' | 'name' | 'blocked_first'>('newest');

  // Copy ID feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [blockingUser, setBlockingUser] = useState<UserProfile | null>(null);
  const [blockReasonPreset, setBlockReasonPreset] = useState<string>('স্প্যামিং বা ভুয়া বিজ্ঞাপন পোস্ট করার কারণে');
  const [customBlockReason, setCustomBlockReason] = useState<string>('');

  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'seller' | 'buyer'>('seller');
  const [newUserDivision, setNewUserDivision] = useState('Dhaka');
  const [newUserDistrict, setNewUserDistrict] = useState('Dhaka');
  const [newUserThana, setNewUserThana] = useState('Mirpur');
  const [newUserVerified, setNewUserVerified] = useState(true);
  const [newUserNotification, setNewUserNotification] = useState('');

  // Handle Copy ID
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preset Block Reasons
  const blockReasonsList = [
    { bn: 'স্প্যামিং বা ভুয়া/প্রতারণামূলক বিজ্ঞাপন পোস্ট', en: 'Posting fake or spam advertisements' },
    { bn: 'অশ্লীল ও আপত্তিকর চ্যাট/মেসেজ পাঠানো', en: 'Inappropriate or abusive behavior in chat' },
    { bn: 'পেমেন্ট প্রতারণা বা অগ্রিম টাকা দাবির অভিযোগ', en: 'Fraudulent payment or illegal advance money request' },
    { bn: 'ডুপ্লিকেট বা ক্লোন আইডি ব্যবহার', en: 'Creating multiple clone or duplicate accounts' },
    { bn: 'নিষিদ্ধ পণ্য বা অবৈধ আইটেম বিক্রি করার চেষ্টা', en: 'Attempting to sell prohibited or illegal items' },
    { bn: 'অন্যান্য কাস্টম কারণ...', en: 'Other custom reason...' }
  ];

  // Filtered & Sorted Registered Users
  const filteredUsers = useMemo(() => {
    let result = [...registeredUsers];

    // Filter by Tab
    if (activeStatusTab === 'active') {
      result = result.filter(u => !u.isBlocked && u.status !== 'blocked');
    } else if (activeStatusTab === 'blocked') {
      result = result.filter(u => u.isBlocked || u.status === 'blocked');
    } else if (activeStatusTab === 'seller') {
      result = result.filter(u => u.role === 'seller');
    } else if (activeStatusTab === 'buyer') {
      result = result.filter(u => u.role === 'buyer');
    } else if (activeStatusTab === 'verified') {
      result = result.filter(u => u.isVerified);
    } else if (activeStatusTab === 'unverified') {
      result = result.filter(u => !u.isVerified);
    }

    // Filter by Search Query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.replace(/[- ]/g, '').includes(q.replace(/[- ]/g, '')) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q) ||
        u.location?.district?.toLowerCase().includes(q) ||
        u.location?.division?.toLowerCase().includes(q) ||
        u.location?.thana?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.registeredAt || 0).getTime() - new Date(b.registeredAt || 0).getTime();
      }
      if (sortBy === 'most_ads') {
        const countA = a.totalAdsCount ?? products.filter(p => p.seller?.phone === a.phone || p.seller?.id === a.id).length;
        const countB = b.totalAdsCount ?? products.filter(p => p.seller?.phone === b.phone || p.seller?.id === b.id).length;
        return countB - countA;
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'blocked_first') {
        const isBlockedA = a.isBlocked || a.status === 'blocked' ? 1 : 0;
        const isBlockedB = b.isBlocked || b.status === 'blocked' ? 1 : 0;
        return isBlockedB - isBlockedA;
      }
      return 0;
    });

    return result;
  }, [registeredUsers, activeStatusTab, searchFilter, sortBy, products]);

  // Statistics
  const totalCount = registeredUsers.length;
  const activeCount = registeredUsers.filter(u => !u.isBlocked && u.status !== 'blocked').length;
  const blockedCount = registeredUsers.filter(u => u.isBlocked || u.status === 'blocked').length;
  const verifiedCount = registeredUsers.filter(u => u.isVerified).length;
  const sellerCount = registeredUsers.filter(u => u.role === 'seller').length;

  // Confirm Block Action
  const handleConfirmBlock = () => {
    if (!blockingUser) return;
    const finalReason = blockReasonPreset === 'অন্যান্য কাস্টম কারণ...' || blockReasonPreset === 'Other custom reason...'
      ? customBlockReason.trim() || 'পলিসি লঙ্ঘনের জন্য অ্যাকাউন্ট সাময়িকভাবে বন্ধ করা হলো।'
      : blockReasonPreset;

    toggleBlockUser(blockingUser.id, finalReason);
    setBlockingUser(null);
    setCustomBlockReason('');
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteUserById(deletingUser.id);
    setDeletingUser(null);
  };

  // Handle Add Manual User Submit
  const handleCreateManualUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      setNewUserNotification(language === 'bn' ? 'দয়া করে নাম এবং ফোন নম্বর পূরণ করুন।' : 'Please enter Name and Phone number.');
      return;
    }

    addManualUser({
      name: newUserName.trim(),
      phone: newUserPhone.trim(),
      email: newUserEmail.trim() || `${newUserPhone.trim()}@marketbd.net`,
      role: newUserRole,
      password: newUserPassword || '123456',
      isVerified: newUserVerified,
      location: {
        division: newUserDivision,
        district: newUserDistrict,
        thana: newUserThana
      }
    });

    // Reset & Close
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setNewUserPassword('');
    setIsAddUserModalOpen(false);
    setNewUserNotification('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Phone', 'Email', 'Role', 'Status', 'Verified', 'Registered At', 'Location', 'Block Reason'];
    const rows = registeredUsers.map(u => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.phone || ''}"`,
      `"${u.email || ''}"`,
      u.role || 'buyer',
      u.isBlocked || u.status === 'blocked' ? 'Blocked' : 'Active',
      u.isVerified ? 'Yes' : 'No',
      u.registeredAt || '',
      `"${u.location?.district || ''}, ${u.location?.division || ''}"`,
      `"${(u.blockedReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marketbd_registered_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get user's posted ads
  const getUserAds = (user: UserProfile) => {
    return products.filter(p => p.seller?.phone === user.phone || p.seller?.id === user.id || p.seller?.email === user.email);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? '👥 নিবন্ধিত কাস্টমার ও ইউজার লিস্ট' : '👥 Registered Customers & User Management'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {totalCount} {language === 'bn' ? 'গ্রাহক' : 'Users'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'কাস্টমার যত রেজিস্টার করবে সবার তালিকা এখানে থাকবে। এডমিন যেকোনো আইডি ব্লক, আনব্লক বা স্থায়ীভাবে রিমুভ করতে পারবেন।'
                  : 'All registered customer profiles with admin controls to block, unblock, verify, or permanently delete user accounts.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {language === 'bn' ? 'নতুন কাস্টমার যুক্ত করুন' : 'Add New Customer'}
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Download customer list as CSV"
            >
              <Download className="w-4 h-4" />
              {language === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'মোট নিবন্ধিত' : 'Total Users'}
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {language === 'bn' ? 'সক্রিয় অ্যাকাউন্ট' : 'Active Accounts'}
              </span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {activeCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                {language === 'bn' ? 'ব্লক করা আইডি' : 'Blocked Users'}
              </span>
              <UserX className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
              {blockedCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                {language === 'bn' ? 'ভেরিফাইড মার্চেন্ট' : 'Verified Merchants'}
              </span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {verifiedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search input & Sort Select */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              name="admin_customer_search_filter"
              id="admin-customer-search-filter"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="search"
              data-lpignore="true"
              data-form-type="other"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder={language === 'bn' ? 'কাস্টমারের নাম, ফোন নম্বর, ইমেইল বা ইউজার আইডি দিয়ে খুঁজুন...' : 'Search by name, phone, email or user ID...'}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              {language === 'bn' ? 'সর্ট:' : 'Sort:'}
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              aria-label={language === 'bn' ? 'গ্রাহক সাজানোর ক্রম নির্বাচন করুন' : 'Select user sorting order'}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="newest">{language === 'bn' ? 'সর্বশেষ রেজিস্টার্ড আগে' : 'Newest Registration'}</option>
              <option value="oldest">{language === 'bn' ? 'সবচেয়ে পুরাতন আগে' : 'Oldest Registration'}</option>
              <option value="most_ads">{language === 'bn' ? 'সর্বাধিক বিজ্ঞাপনদাতা' : 'Most Ads Posted'}</option>
              <option value="name">{language === 'bn' ? 'নাম অনুসারে (A-Z)' : 'Name (A-Z)'}</option>
              <option value="blocked_first">{language === 'bn' ? 'ব্লক করা আইডি আগে' : 'Blocked First'}</option>
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', labelBn: 'সকল ইউজার', labelEn: 'All Users', count: totalCount },
            { id: 'active', labelBn: '🟢 সক্রিয়', labelEn: '🟢 Active', count: activeCount },
            { id: 'blocked', labelBn: '🔴 ব্লক করা', labelEn: '🔴 Blocked', count: blockedCount },
            { id: 'seller', labelBn: 'বিক্রেতা (Sellers)', labelEn: 'Sellers', count: sellerCount },
            { id: 'buyer', labelBn: 'ক্রেতা (Buyers)', labelEn: 'Buyers', count: totalCount - sellerCount },
            { id: 'verified', labelBn: '⭐ ভেরিফাইড', labelEn: '⭐ Verified', count: verifiedCount },
            { id: 'unverified', labelBn: 'সাধারণ', labelEn: 'Unverified', count: totalCount - verifiedCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStatusTab === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeStatusTab === tab.id
                  ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Display */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'কোনো কাস্টমার অ্যাকাউন্ট পাওয়া যায়নি!' : 'No customer profiles found!'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {language === 'bn'
              ? 'আপনার অনুসন্ধান বা ফিল্টারের সাথে মিল রয়েছে এমন কোনো নিবন্ধিত কাস্টমার নেই।'
              : 'Try adjusting your search criteria or switch filter tabs.'}
          </p>
          {(searchFilter || activeStatusTab !== 'all') && (
            <button
              onClick={() => { setSearchFilter(''); setActiveStatusTab('all'); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">{language === 'bn' ? 'কাস্টমার প্রোফাইল' : 'Customer Profile'}</th>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'যোগাযোগ ও আইডি' : 'Contact & ID'}</th>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'ঠিকানা ও তথ্য' : 'Location & Reg.'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'bn' ? 'মোট বিজ্ঞাপন' : 'Posted Ads'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'এডমিন অ্যাকশন' : 'Admin Controls'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredUsers.map(user => {
                  const isBlocked = user.isBlocked || user.status === 'blocked';
                  const userAds = getUserAds(user);
                  const adsCount = user.totalAdsCount ?? userAds.length;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Customer Profile Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={
                                user.avatar ||
                                `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`
                              }
                              alt={user.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                            {/* Online/Blocked Status Dot */}
                            <span
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                isBlocked ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              title={isBlocked ? 'Blocked Account' : 'Active Account'}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {user.name || 'Unknown User'}
                              </span>
                              {user.isVerified && (
                                <span
                                  className="inline-flex items-center text-amber-500 dark:text-amber-400"
                                  title="Verified Merchant Gold Badge"
                                >
                                  <ShieldCheck className="w-4 h-4 fill-amber-500/20" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                    : user.role === 'seller'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {user.role === 'admin' ? 'এডমিন' : user.role === 'seller' ? 'বিক্রেতা' : 'ক্রেতা'}
                              </span>
                              {user.authProvider && (
                                <span className="text-[10px] text-slate-400 font-medium capitalize">
                                  via {user.authProvider}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & ID Column */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(user.id, user.id)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Click to copy User ID"
                            >
                              <span>#{user.id}</span>
                              {copiedId === user.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <a href={`tel:${user.phone}`} className="hover:underline">
                              {user.phone || 'No phone'}
                            </a>
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <a href={`mailto:${user.email}`} className="hover:underline truncate max-w-[150px]">
                                {user.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location & Reg Column */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {user.location?.thana ? `${user.location.thana}, ` : ''}
                              {user.location?.district || user.location?.division || 'বাংলাদেশ'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {user.registeredAt
                                ? new Date(user.registeredAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })
                                : 'পূর্বে নিবন্ধিত'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Posted Ads Count Column */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setInspectingUser(user)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          title="View user ads"
                        >
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          <span>{adsCount}</span>
                        </button>
                      </td>

                      {/* Status Badge Column */}
                      <td className="py-4 px-4 text-center">
                        {isBlocked ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <Lock className="w-3 h-3" />
                              {language === 'bn' ? 'ব্লকড' : 'Blocked'}
                            </span>
                            {user.blockedReason && (
                              <span className="text-[10px] text-rose-500 max-w-[130px] truncate mt-0.5" title={user.blockedReason}>
                                {user.blockedReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            {language === 'bn' ? 'সক্রিয়' : 'Active'}
                          </span>
                        )}
                      </td>

                      {/* Admin Controls Column */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect / View Full Details */}
                          <button
                            onClick={() => setInspectingUser(user)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            title={language === 'bn' ? 'প্রোফাইল ও বিজ্ঞাপন দেখুন' : 'View Profile & Ads'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Verified Badge */}
                          <button
                            onClick={() => toggleVerifyUser(user.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              user.isVerified
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title={user.isVerified ? 'ভেরিফাইড ব্যাজ বাতিল করুন' : 'ভেরিফাইড ব্যাজ দিন'}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Block / Unblock Button */}
                          <button
                            onClick={() => {
                              if (isBlocked) {
                                toggleBlockUser(user.id);
                              } else {
                                setBlockingUser(user);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                            title={isBlocked ? 'আনব্লক করুন' : 'অ্যাকাউন্ট ব্লক করুন'}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'আনব্লক' : 'Unblock'}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'ব্লক' : 'Block'}</span>
                              </>
                            )}
                          </button>

                          {/* Delete ID Button */}
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                            title={language === 'bn' ? 'আইডি চিরতরে ডিলিট করুন' : 'Delete user ID'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map(user => {
              const isBlocked = user.isBlocked || user.status === 'blocked';
              const userAds = getUserAds(user);
              const adsCount = user.totalAdsCount ?? userAds.length;

              return (
                <div
                  key={user.id}
                  className={`p-4 space-y-3.5 ${isBlocked ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            user.avatar ||
                            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`
                          }
                          alt={user.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            isBlocked ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {user.name}
                          </h4>
                          {user.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            #{user.id}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {user.role === 'seller' ? 'বিক্রেতা' : 'ক্রেতা'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isBlocked ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        ব্লকড
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        সক্রিয়
                      </span>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a href={`tel:${user.phone}`} className="font-bold truncate">
                        {user.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{adsCount} টি বিজ্ঞাপন</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {user.location?.thana ? `${user.location.thana}, ` : ''}
                        {user.location?.district || user.location?.division || 'বাংলাদেশ'}
                      </span>
                    </div>
                  </div>

                  {isBlocked && user.blockedReason && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <strong>ব্লকের কারণ:</strong> {user.blockedReason}
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setInspectingUser(user)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                    </button>

                    <button
                      onClick={() => toggleVerifyUser(user.id)}
                      className={`p-2 rounded-xl text-xs font-bold cursor-pointer ${
                        user.isVerified ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}
                      title="Toggle Verify"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (isBlocked) {
                          toggleBlockUser(user.id);
                        } else {
                          setBlockingUser(user);
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer ${
                        isBlocked
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isBlocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'আনব্লক' : 'Unblock'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'ব্লক' : 'Block'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDeletingUser(user)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Delete User ID"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚫 MODAL 1: BLOCK USER CONFIRMATION & REASON SELECTOR                      */}
      {/* ========================================================================= */}
      {blockingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {language === 'bn' ? 'কাস্টমার অ্যাকাউন্ট ব্লক নিশ্চিতকরণ' : 'Confirm Customer Account Block'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {blockingUser.name} ({blockingUser.phone})
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              ⚠️ <strong>সতর্কতা:</strong> এই আইডিটি ব্লক করলে ব্যবহারকারী ওয়েবসাইট বা অ্যাপে লগইন করতে পারবেন না এবং কোনো নতুন বিজ্ঞাপন দিতে পারবেন না।
            </div>

            {/* Block Reason Presets */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'ব্লক করার কারণ নির্বাচন করুন:' : 'Select Block Reason:'}
              </label>
              <div className="space-y-1.5">
                {blockReasonsList.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      blockReasonPreset === (language === 'bn' ? reason.bn : reason.en)
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="block_reason"
                      checked={blockReasonPreset === (language === 'bn' ? reason.bn : reason.en)}
                      onChange={() => setBlockReasonPreset(language === 'bn' ? reason.bn : reason.en)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{language === 'bn' ? reason.bn : reason.en}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason input */}
            {(blockReasonPreset === 'অন্যান্য কাস্টম কারণ...' || blockReasonPreset === 'Other custom reason...') && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {language === 'bn' ? 'নির্দিষ্ট কারণটি লিখুন:' : 'Write Specific Reason:'}
                </label>
                <textarea
                  value={customBlockReason}
                  onChange={e => setCustomBlockReason(e.target.value)}
                  placeholder={language === 'bn' ? 'কেন এই আইডি ব্লক করা হচ্ছে বিস্তারিত লিখুন...' : 'Enter full reason for blocking...'}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBlockingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {language === 'bn' ? '🔴 নিশ্চিত ব্লক করুন' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🗑️ MODAL 2: PERMANENT USER DELETE CONFIRMATION                              */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  {language === 'bn' ? 'কাস্টমার আইডি রিমুভ নিশ্চিতকরণ' : 'Delete Customer Account'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  #{deletingUser.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'bn' ? (
                <>
                  আপনি কি নিশ্চিত যে <strong>{deletingUser.name}</strong> ({deletingUser.phone}) এর কাস্টমার আইডিটি সম্পূর্ণ ডিলিট করতে চান? এটি রিভার্স করা যাবে না।
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete <strong>{deletingUser.name}</strong> ({deletingUser.phone})? This action cannot be undone.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {language === 'bn' ? '🗑️ ডিলিট করুন' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👁️ MODAL 3: FULL USER PROFILE & ADS INSPECTOR                               */}
      {/* ========================================================================= */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingUser.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`}
                  alt={inspectingUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                      {inspectingUser.name}
                    </h3>
                    {inspectingUser.isVerified && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: #{inspectingUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{inspectingUser.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{language === 'bn' ? 'ইমেইল এড্রেস:' : 'Email:'}</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{inspectingUser.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{language === 'bn' ? 'অ্যাকাউন্ট টাইপ / রোল:' : 'Role:'}</span>
                <span className="font-extrabold text-slate-900 dark:text-white capitalize">{inspectingUser.role || 'Buyer'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{language === 'bn' ? 'ঠিকানা:' : 'Location:'}</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {inspectingUser.location?.thana ? `${inspectingUser.location.thana}, ` : ''}
                  {inspectingUser.location?.district || inspectingUser.location?.division || 'বাংলাদেশ'}
                </span>
              </div>
              {inspectingUser.nidNumber && (
                <div>
                  <span className="text-slate-400 block font-semibold">{language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID):' : 'NID Number:'}</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-white">{inspectingUser.nidNumber}</span>
                </div>
              )}
              {inspectingUser.tradeLicense && (
                <div>
                  <span className="text-slate-400 block font-semibold">{language === 'bn' ? 'ট্রেড লাইসেন্স:' : 'Trade License:'}</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-white">{inspectingUser.tradeLicense}</span>
                </div>
              )}
            </div>

            {/* User's Posted Ads List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'এই কাস্টমারের পোস্টকৃত বিজ্ঞাপনসমূহ:' : 'Ads Posted by this User:'}</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {getUserAds(inspectingUser).length} {language === 'bn' ? 'টি বিজ্ঞাপন' : 'Ads'}
                </span>
              </div>

              {getUserAds(inspectingUser).length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-400">
                  {language === 'bn' ? 'এই ব্যবহারকারী এখনও কোনো বিজ্ঞাপন পোস্ট করেননি।' : 'This customer has not posted any classified ads yet.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {getUserAds(inspectingUser).map(ad => (
                    <div
                      key={ad.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=100&q=80'}
                          alt={ad.title}
                          className="w-10 h-10 rounded-xl object-cover border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {language === 'bn' ? ad.titleBn || ad.title : ad.title}
                          </p>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            ৳{ad.price?.toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ad.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : ad.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {ad.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ➕ MODAL 4: MANUAL CUSTOMER CREATION                                      */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {language === 'bn' ? 'নতুন কাস্টমার একাউন্ট যুক্ত করুন' : 'Register New Customer Account'}
                  </h3>
                  <p className="text-xs text-slate-400">Admin Customer Provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newUserNotification && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {newUserNotification}
              </div>
            )}

            <form onSubmit={handleCreateManualUser} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'bn' ? 'কাস্টমারের নাম *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'অ্যাকাউন্ট টাইপ' : 'Role'}
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e: any) => setNewUserRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="seller">সেলার / বিক্রেতা (Seller)</option>
                    <option value="buyer">বায়ার / ক্রেতা (Buyer)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="ডিফল্ট: 123456"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <input
                  type="checkbox"
                  id="verify_badge"
                  checked={newUserVerified}
                  onChange={e => setNewUserVerified(e.target.checked)}
                  className="rounded-sm text-emerald-600"
                />
                <label htmlFor="verify_badge" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'bn' ? 'ভেরিফাইড মার্চেন্ট ব্যাজ দিন (Verified Badge)' : 'Grant Verified Merchant Badge'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
