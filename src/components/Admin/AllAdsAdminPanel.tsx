import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Product } from '../../types';
import { WatermarkedImage } from '../Product/WatermarkedImage';
import {
  Package,
  Search,
  Filter,
  Trash2,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  AlertTriangle,
  Sparkles,
  Phone,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const AllAdsAdminPanel: React.FC = () => {
  const {
    language,
    products,
    updateProductStatus,
    openDeleteModal,
    setSelectedProduct,
    setEditingAd,
    setActiveTab,
    categories
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'sold'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Filter ads based on search and filters
  const filteredAds = useMemo(() => {
    return products.filter(ad => {
      // Status filter
      if (statusFilter !== 'all' && ad.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && ad.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ad.title?.toLowerCase().includes(q);
        const matchSellerName = ad.seller?.name?.toLowerCase().includes(q);
        const matchSellerPhone = ad.seller?.phone?.includes(q);
        const matchLocation = (ad.location?.district || ad.location?.division || ad.location?.thana || '').toLowerCase().includes(q);
        const matchId = ad.id?.toLowerCase().includes(q);
        const matchPrice = ad.price?.toString().includes(q);

        return matchTitle || matchSellerName || matchSellerPhone || matchLocation || matchId || matchPrice;
      }

      return true;
    });
  }, [products, statusFilter, categoryFilter, searchQuery]);

  const activeCount = products.filter(p => p.status === 'active').length;
  const pendingCount = products.filter(p => p.status === 'pending').length;
  const rejectedCount = products.filter(p => p.status === 'rejected').length;
  const soldCount = products.filter(p => p.status === 'sold').length;

  const handleSelectAll = () => {
    if (selectedAdIds.length === filteredAds.length) {
      setSelectedAdIds([]);
    } else {
      setSelectedAdIds(filteredAds.map(a => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedAdIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    selectedAdIds.forEach(id => updateProductStatus(id, 'active'));
    setSelectedAdIds([]);
    alert(language === 'bn' ? `✓ ${selectedAdIds.length} টি বিজ্ঞাপন সফলভাবে এপ্রুভ করা হয়েছে!` : `✓ ${selectedAdIds.length} ads approved!`);
  };

  const handleBulkDelete = () => {
    if (selectedAdIds.length === 0) return;
    const firstAd = products.find(p => p.id === selectedAdIds[0]);
    if (firstAd) {
      openDeleteModal(firstAd);
    }
  };

  const handleEdit = (ad: Product) => {
    setEditingAd(ad);
    setActiveTab('post-ad');
  };

  const handleView = (ad: Product) => {
    setSelectedProduct(ad);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 text-slate-900 dark:text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'bn' ? 'সকল বিজ্ঞাপন নিয়ন্ত্রণ ও অপসারণ প্যানেল (All Ads & Delete Control)' : 'All Ads Management & Delete Controls'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'ওয়েবসাইটের সকল লাইভ, অপেক্ষমাণ এবং পূর্বের বিজ্ঞাপন দেখুন, এডিট করুন বা চিরতরে মুছে (Delete) ফেলুন।'
                : 'Manage, search, edit, approve, and permanently remove any user advertisement.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-black px-3.5 py-1.5 bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 rounded-full border border-pink-200 dark:border-pink-800">
            {products.length} {language === 'bn' ? 'টি মোট বিজ্ঞাপন' : 'Total Ads'}
          </span>
        </div>
      </div>

      {/* Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-pink-300'
          }`}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
            {language === 'bn' ? 'সকল বিজ্ঞাপন' : 'All Ads'}
          </span>
          <strong className="text-xl font-black">{products.length}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white border-transparent shadow-md'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 hover:border-emerald-400'
          }`}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
            {language === 'bn' ? 'সক্রিয় / লাইভ' : 'Active Live'}
          </span>
          <strong className="text-xl font-black">{activeCount}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 border-transparent shadow-md'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 hover:border-amber-400'
          }`}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
            {language === 'bn' ? 'পেন্ডিং / অপেক্ষমাণ' : 'Pending Review'}
          </span>
          <strong className="text-xl font-black">{pendingCount}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-red-600 text-white border-transparent shadow-md'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300 hover:border-red-400'
          }`}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
            {language === 'bn' ? 'প্রত্যাখ্যাত / রিজেক্টেড' : 'Rejected'}
          </span>
          <strong className="text-xl font-black">{rejectedCount}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('sold')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'sold'
              ? 'bg-slate-700 text-white border-transparent shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
            {language === 'bn' ? 'সোলেড / বিক্রি সম্পন্ন' : 'Sold'}
          </span>
          <strong className="text-xl font-black">{soldCount}</strong>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'বিজ্ঞাপনের নাম, সেলারের নাম, ফোন নম্বর, জেলা দিয়ে খুঁজুন...'
                : 'Search ad title, seller name, phone, district, ID...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.nameBn : (c.nameEn || c.name || c.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (when selected) */}
      {selectedAdIds.length > 0 && (
        <div className="p-3 bg-pink-50 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-600 text-white font-black flex items-center justify-center text-[10px]">
              {selectedAdIds.length}
            </span>
            <strong className="text-pink-900 dark:text-pink-200">
              {language === 'bn' ? `${selectedAdIds.length} টি বিজ্ঞাপন সিলেক্ট করা হয়েছে` : `${selectedAdIds.length} ads selected`}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব এপ্রুভ করুন' : 'Approve All'}</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বিজ্ঞাপন মুছুন (Delete)' : 'Delete Ads'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs italic space-y-2">
          <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-1" />
          <p>{language === 'bn' ? 'কোনো বিজ্ঞাপন পাওয়া যায়নি।' : 'No advertisements match your search or filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAds.map(ad => {
            const isSelected = selectedAdIds.includes(ad.id);
            return (
              <div
                key={ad.id}
                className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-pink-50/70 dark:bg-pink-950/40 border-pink-400 dark:border-pink-800'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Left: Checkbox + Thumb + Ad Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(ad.id)}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 mt-1 cursor-pointer shrink-0"
                  />

                  <div className="relative shrink-0">
                    <WatermarkedImage
                      src={ad.images?.[0]}
                      alt={ad.title}
                      watermarkSize="sm"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    {ad.isFeatured && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                        ⭐ Top
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {ad.title}
                      </h4>
                      {/* Status Badge */}
                      {ad.status === 'active' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'bn' ? 'সক্রিয় / লাইভ' : 'Active'}</span>
                        </span>
                      )}
                      {ad.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>{language === 'bn' ? 'পেন্ডিং / অপেক্ষমাণ' : 'Pending'}</span>
                        </span>
                      )}
                      {ad.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>{language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}</span>
                        </span>
                      )}
                      {ad.status === 'sold' && (
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {language === 'bn' ? 'সোলেড' : 'Sold'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-black text-pink-600 dark:text-pink-400">
                      ৳{ad.price ? Number(ad.price).toLocaleString() : '0'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <strong>Seller:</strong> {ad.seller?.name || 'Seller'}
                      </span>
                      {ad.seller?.phone && (
                        <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                          <Phone className="w-3 h-3 text-pink-500" />
                          {ad.seller.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {ad.location?.thana || ad.location?.district || ad.location?.division || 'Bangladesh'}
                      </span>
                      <span>
                        • {ad.postedAt ? new Date(ad.postedAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>

                    {ad.rejectionReason && ad.status === 'rejected' && (
                      <div className="mt-1 p-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-lg text-[11px] text-red-800 dark:text-red-300">
                        <strong>{language === 'bn' ? 'রিজেক্টের কারণ:' : 'Reason:'}</strong> {ad.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/60 w-full md:w-auto justify-end">
                  {/* View Ad */}
                  <button
                    onClick={() => handleView(ad)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="View Ad Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{language === 'bn' ? 'দেখুন' : 'View'}</span>
                  </button>

                  {/* Edit Ad */}
                  <button
                    onClick={() => handleEdit(ad)}
                    className="p-2 bg-pink-50 dark:bg-pink-950/80 hover:bg-pink-100 dark:hover:bg-pink-900 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Edit Ad Information"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                  </button>

                  {/* Quick Approve (if not active) */}
                  {ad.status !== 'active' && (
                    <button
                      onClick={() => updateProductStatus(ad.id, 'active')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Approve Ad Live"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'এপ্রুভ' : 'Approve'}</span>
                    </button>
                  )}

                  {/* 🗑️ DELETE / REMOVE AD (PROMINENT) */}
                  <button
                    onClick={() => openDeleteModal(ad)}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition-all duration-150 hover:scale-105 cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title={language === 'bn' ? 'বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলুন (Delete Ad)' : 'Permanently remove this ad'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
