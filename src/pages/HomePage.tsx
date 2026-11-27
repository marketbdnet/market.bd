import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { OFFICIAL_SLOGAN } from '../constants/branding';
import { isProductPublicActive } from '../utils/productStatus';
import { CategoryGrid, MobileCategoryGrid } from '../components/Home/CategoryGrid';
import { FlashSale } from '../components/Home/FlashSale';
import { ProductCard } from '../components/Product/ProductCard';
import { isCategoryMatched } from '../utils/categoryMapping';
import { getCategoryImageUrl, getSubcategoryImageUrl, getSecondLevelImageUrl } from '../utils/categoryImages';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { formatPostDateTime } from '../utils/dateUtils';
import { WatermarkedImage } from '../components/Product/WatermarkedImage';
import { getAutoAdjustedShowcaseCardClass, getAutoAdjustedRecentCardClass } from '../utils/gridLayout';
import { SEOHelmet } from '../components/SEO/SEOHelmet';
import {
  Zap,
  LayoutGrid,
  Rows,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Clock,
  Flame,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowUpDown,
  MapPin,
  PlusCircle,
  Star
} from 'lucide-react';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshData';

export const HomePage: React.FC = () => {
  const {
    language,
    products,
    refreshProducts,
    categories,
    setActiveTab,
    setFilters,
    selectedLocation,
    setIsLocationModalOpen,
    setSelectedProduct,
    handlePostAdClick,
  } = useMarket();

  const resolvedLocationLabel = (() => {
    const divId = selectedLocation?.division;
    const distId = selectedLocation?.district;
    const thanaId = selectedLocation?.thana;
    if (!divId && !distId && !thanaId) {
      return language === 'bn' ? 'সারা বাংলাদেশ' : 'All of Bangladesh';
    }
    const divObj = BANGLADESH_DIVISIONS.find(d => d.id === divId || d.nameEn === divId || d.nameBn === divId);
    const distObj = divObj?.districts.find(d => d.id === distId || d.nameEn === distId || d.nameBn === distId);
    const thanaObj = distObj?.thanas.find(t => t.id === thanaId || t.nameEn === thanaId || t.nameBn === thanaId);
    if (thanaObj) return language === 'bn' ? thanaObj.nameBn : thanaObj.nameEn;
    if (distObj) return language === 'bn' ? distObj.nameBn : distObj.nameEn;
    if (divObj) return language === 'bn' ? divObj.nameBn : divObj.nameEn;
    return thanaId || distId || divId || (language === 'bn' ? 'সারা বাংলাদেশ' : 'All of Bangladesh');
  })();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adViewMode, setAdViewMode] = useState<'grid' | 'list'>('grid');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Smart Recent Posts interactive filter & pagination state
  const [recentCategory, setRecentCategory] = useState<string>('all');
  const [recentSort, setRecentSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [visibleRecentCount, setVisibleRecentCount] = useState<number>(16);

  // Filter Featured & Urgent Ads
  let featuredAds = products.filter(
    p => (p.adType === 'featured' || p.adType === 'urgent' || p.isFeatured || p.isUrgent) && isProductPublicActive(p)
  );
  if (featuredAds.length < 6) {
    const remainingActive = products.filter(
      p => isProductPublicActive(p) && !featuredAds.some(fa => fa.id === p.id)
    );
    featuredAds = [...featuredAds, ...remainingActive];
  }

  // Responsive auto-adjust showcase: 6 on mobile/sm (2x3 / 3x2), 4 on md, 5 on desktop lg (zero empty slots)
  const displayedFeatured = featuredAds.slice(0, 6);

  // Active products for Recent Posts (respects selectedLocation if narrowed from All Bangladesh)
  const isAllBangladesh =
    !selectedLocation?.division ||
    selectedLocation.division === 'All Bangladesh' ||
    selectedLocation.division === 'all';

  const matchesSelectedLocation = (p: typeof products[number]) => {
    if (isAllBangladesh) return true;
    const divObj = BANGLADESH_DIVISIONS.find(
      d =>
        d.id === selectedLocation.division ||
        d.nameEn === selectedLocation.division ||
        d.nameBn === selectedLocation.division
    );
    const pDiv = String(p.location?.division || '').toLowerCase();
    const selDivId = String(divObj?.id || selectedLocation.division || '').toLowerCase();
    const selDivEn = String(divObj?.nameEn || selectedLocation.division || '').toLowerCase();
    if (pDiv && pDiv !== selDivId && pDiv !== selDivEn && !pDiv.includes(selDivId)) {
      return false;
    }
    if (selectedLocation.district) {
      const distObj = divObj?.districts.find(
        d =>
          d.id === selectedLocation.district ||
          d.nameEn === selectedLocation.district ||
          d.nameBn === selectedLocation.district
      );
      const pDist = String(p.location?.district || '').toLowerCase();
      const selDistId = String(distObj?.id || selectedLocation.district || '').toLowerCase();
      const selDistEn = String(distObj?.nameEn || selectedLocation.district || '').toLowerCase();
      if (pDist && pDist !== selDistId && pDist !== selDistEn && !pDist.includes(selDistId)) {
        return false;
      }
    }
    return true;
  };

  const activeProducts = products.filter(p => isProductPublicActive(p) && matchesSelectedLocation(p));

  // Filter Recent by category
  let filteredRecent = activeProducts.filter(p => {
    if (recentCategory === 'all') return true;
    return isCategoryMatched(p.category, recentCategory, p.subCategory);
  });

  // Sort Recent
  filteredRecent = [...filteredRecent].sort((a, b) => {
    if (recentSort === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (recentSort === 'price-desc') return (b.price || 0) - (a.price || 0);
    const timeA = new Date(a.postedAt || 0).getTime();
    const timeB = new Date(b.postedAt || 0).getTime();
    return timeB - timeA;
  });

  const displayedRecent = filteredRecent.slice(0, visibleRecentCount);
  const hasMoreRecent = filteredRecent.length > visibleRecentCount;

  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6 pb-12">
        <SEOHelmet />

      {/* MARKETBD SIGNATURE RED TOP FRONT-PAGE BAR */}
      <section className="bg-[#FF0000] dark:bg-[#B91C1C] text-white rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 border border-[#CC0000] dark:border-red-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
            {OFFICIAL_SLOGAN}
          </h1>
          <p className="text-xs sm:text-[13px] font-semibold text-amber-100 mt-0.5">
            {language === 'bn'
              ? 'যেকোনো ক্যাটাগরিতে আপনার পছন্দের পণ্য খুঁজুন অথবা ফ্রি বিজ্ঞাপন দিন'
              : 'Browse 17 simple categories or post your free ad in seconds'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs px-3 py-2 rounded-lg shadow-xs transition cursor-pointer border border-white"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF0000] shrink-0" />
            <span className="truncate max-w-[160px]">{resolvedLocationLabel}</span>
          </button>

          <button
            type="button"
            onClick={handlePostAdClick}
            className="inline-flex items-center gap-1.5 bg-[#FFC800] hover:bg-[#FFD836] text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg shadow-xs transition cursor-pointer border border-amber-300"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[2.5]" />
            <span>{language === 'bn' ? 'ফ্রি বিজ্ঞাপন দিন' : 'Post Your Ad'}</span>
          </button>
        </div>
      </section>

      {/* MOBILE / ANDROID APP VIEW: Category Grid Box placed right below Navbar */}
      <div className="block lg:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs">
        <MobileCategoryGrid />
      </div>

      {/* Main Container Layout - Unified for Computer, Tablet & Mobile */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* LEFT SIDEBAR: Vertical Browse Categories (DESKTOP / LAPTOP ONLY) */}
        <aside className="hidden lg:block lg:w-80 xl:w-88 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs">
          <CategoryGrid />
        </aside>

        {/* RIGHT CONTENT: Flash Sale & Sellers' Posts (Promoted & Recent Listings) */}
        <main className="flex-1 w-full min-w-0 space-y-6">
          
          {/* 1. Flash Sale Banner (5 Items with 5-minute Auto Rotation) */}
          <FlashSale />

          {/* 2. Featured & Urgent Boosted Ads Section (Same 5-card single-row layout as Flash Deals) */}
          <section className="bg-white dark:bg-slate-900 border-2 border-amber-400/80 dark:border-amber-600/70 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {language === 'bn' ? 'ফিচার্ড ও জরুরি বিজ্ঞাপন' : 'Featured & Urgent Ads'}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'বিশেষ বুস্টেড ও জরুরি বিজ্ঞাপন' : 'Top boosted & urgent listings'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, adType: 'featured' }));
                  setActiveTab('search');
                }}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer shrink-0 self-start sm:self-auto"
              >
                {language === 'bn' ? 'সবগুলো →' : 'See all →'}
              </button>
            </div>

            {/* Featured Ads Rendering: Auto-adjusted across mobile (6 = 2x3), tablet (6/4), and desktop (5x1) with zero empty gaps */}
            {displayedFeatured.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {displayedFeatured.map((prod, idx) => {
                  if (!prod) return null;
                  const fallbackImg =
                    getSecondLevelImageUrl(prod.category, prod.subCategory || '', prod.secondLevelCategory || '', prod.model || prod.title) ||
                    getSubcategoryImageUrl(prod.category, prod.subCategory || '') ||
                    getCategoryImageUrl(prod.category) ||
                    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                  const prodImg =
                    Array.isArray(prod.images) && prod.images.length > 0 && prod.images[0]
                      ? prod.images[0]
                      : ((prod as any).image || fallbackImg);
                  const prodPrice = typeof prod.price === 'number' ? prod.price.toLocaleString() : (prod.price || '0');
                  const isUrgent = prod.adType === 'urgent' || prod.isUrgent;
                  const visibilitySpanClass = getAutoAdjustedShowcaseCardClass(idx, displayedFeatured.length);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setActiveTab('product-details');
                      }}
                      className={`bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl p-2 border border-amber-300 dark:border-amber-700/70 shadow-xs hover:shadow-md hover:border-amber-500 transition cursor-pointer group flex-col justify-between relative overflow-hidden active:scale-95 ${visibilitySpanClass}`}
                    >
                      {/* Badge */}
                      <div className="absolute top-1.5 left-1.5 z-10">
                        {isUrgent ? (
                          <span className="bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-white" />
                            {language === 'bn' ? 'জরুরি' : 'URGENT'}
                          </span>
                        ) : (
                          <span className="bg-amber-400 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-slate-950" />
                            {language === 'bn' ? 'ফিচার্ড' : 'FEATURED'}
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden mb-1.5 bg-slate-100 dark:bg-slate-900 relative">
                        <WatermarkedImage
                          src={getOptimizedImageUrl(prodImg, 300)}
                          alt={prod.title || 'Product'}
                          loading={idx < 4 ? 'eager' : 'lazy'}
                          watermarkSize="sm"
                          imgClassName="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-slate-200 dark:bg-slate-800"
                          className="w-full h-full"
                        />
                      </div>

                      {/* Compact Details matching Flash Deals */}
                      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700 space-y-1 text-[10px]">
                        <div className="grid grid-cols-[44px_1fr] items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-0.5">
                          <span className="text-sky-600 dark:text-sky-400 font-black text-[9px]">
                            {language === 'bn' ? 'পণ্য' : 'Name'}
                          </span>
                          <span className="text-slate-900 dark:text-amber-300 font-black text-left truncate text-[10px]">
                            {language === 'bn' && prod.titleBn ? prod.titleBn : (prod.title || 'Product')}
                          </span>
                        </div>

                        <div className="grid grid-cols-[44px_1fr] items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-0.5">
                          <span className="text-sky-600 dark:text-sky-400 font-black text-[9px]">
                            {language === 'bn' ? 'দাম' : 'Price'}
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 font-black text-left text-[10px] truncate">
                            ৳{prodPrice}
                          </span>
                        </div>

                        <div className="grid grid-cols-[44px_1fr] items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-black text-[9px]">
                            {language === 'bn' ? 'পোস্ট' : 'Time'}
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-left text-[8.5px] leading-tight truncate">
                            {formatPostDateTime(prod.postedAt, language)}
                          </span>
                        </div>

                        <div className="grid grid-cols-[44px_1fr] items-center gap-1">
                          <span className="text-sky-600 dark:text-sky-400 font-black text-[9px]">
                            {language === 'bn' ? 'স্থান' : 'Place'}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold text-left text-[9px] truncate">
                            {prod.location.thana || prod.location.district || prod.location.division}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`rounded-xl p-2 border border-amber-200/60 dark:border-amber-800/40 bg-slate-50 dark:bg-slate-800/60 animate-pulse space-y-2 flex-col ${getAutoAdjustedShowcaseCardClass(slot, 6)}`}
                  >
                    <div className="w-full h-24 sm:h-28 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4 font-bold">
                {language === 'bn' ? 'বর্তমানে কোন ফিচার্ড বিজ্ঞাপন নেই' : 'No featured ads currently available.'}
              </p>
            )}
          </section>

          {/* 3. Smart Recent Posts Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3.5 sm:p-5 space-y-4">
            {/* Header: Title + Live Counter + Sort & View Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {language === 'bn' ? 'সাম্প্রতিক বিজ্ঞাপন' : 'Recent Listings'}
                    </h2>
                    <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                      {filteredRecent.length.toLocaleString()} {language === 'bn' ? 'টি বিজ্ঞাপন' : 'Ads'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'সারাদেশ থেকে বিক্রেতাদের সর্বশেষ আপলোডকৃত ও ভেরিফাইড পোস্টসমূহ'
                      : 'Latest verified items posted by sellers across all 64 districts'}
                  </p>
                </div>
              </div>

              {/* Controls: Sorting Dropdown & View Mode */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* Smart Sort */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <select
                    value={recentSort}
                    onChange={e => setRecentSort(e.target.value as any)}
                    className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="newest">{language === 'bn' ? 'নতুনতম আগে' : 'Newest First'}</option>
                    <option value="price-asc">{language === 'bn' ? 'কম দাম আগে' : 'Price: Low to High'}</option>
                    <option value="price-desc">{language === 'bn' ? 'বেশি দাম আগে' : 'Price: High to Low'}</option>
                  </select>
                </div>

                {/* View Layout Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setAdViewMode('grid')}
                    className={`p-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      adViewMode === 'grid'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAdViewMode('list')}
                    className={`p-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      adViewMode === 'list'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                    title="List View"
                  >
                    <Rows className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips (Horizontal Scrollable with Thumbnails) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setRecentCategory('all');
                  setVisibleRecentCount(16);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border tabular-nums ${
                  recentCategory === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {language === 'bn' ? `সব ক্যাটাগরি (${activeProducts.length})` : `All (${activeProducts.length})`}
              </button>

              {categories.map(cat => {
                const count = activeProducts.filter(p => isCategoryMatched(p.category, cat.id, p.subCategory)).length;
                const isSelected = recentCategory === cat.id;
                const catImg = getCategoryImageUrl(cat.id, cat.image);

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setRecentCategory(cat.id);
                      setVisibleRecentCount(16);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <img
                      src={catImg}
                      alt={language === 'bn' ? cat.nameBn : cat.nameEn}
                      className="w-5 h-5 rounded object-contain bg-white p-0.5 shrink-0"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ads Grid or List Display */}
            {displayedRecent.length > 0 ? (
              <div
                className={
                  adViewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5'
                    : 'flex flex-col gap-3 sm:gap-4'
                }
              >
                {displayedRecent.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layoutMode={adViewMode}
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    className={adViewMode === 'grid' ? getAutoAdjustedRecentCardClass(idx, displayedRecent.length) : ''}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-indigo-200 dark:border-slate-700 space-y-2">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {language === 'bn' ? 'এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় বিজ্ঞাপন নেই' : 'No active listings found in this category'}
                </p>
                <button
                  onClick={() => setRecentCategory('all')}
                  className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'সকল বিজ্ঞাপন দেখুন →' : 'View all ads →'}
                </button>
              </div>
            )}

            {/* Bottom Actions: Load More / Explore All Button */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold tabular-nums">
                {language === 'bn'
                  ? `মোট ${filteredRecent.length} টির মধ্যে ${displayedRecent.length} টি দেখানো হচ্ছে`
                  : `Showing ${displayedRecent.length} of ${filteredRecent.length} listings`}
              </div>

              <div className="flex items-center gap-2">
                {hasMoreRecent && (
                  <button
                    onClick={() => setVisibleRecentCount(prev => prev + 16)}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition border border-slate-300 dark:border-slate-600 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `আরও ${Math.min(16, filteredRecent.length - visibleRecentCount)} টি দেখুন`
                        : `Load ${Math.min(16, filteredRecent.length - visibleRecentCount)} More`}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      category: recentCategory === 'all' ? '' : recentCategory,
                      subCategory: ''
                    }));
                    setActiveTab('search');
                  }}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সকল বিজ্ঞাপন পেজে যান' : 'Explore All Ads'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Trust Banner / Verified Marketplace */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {language === 'bn' ? 'ভেরিফাইড ও ১০০% নিরাপদ কেনাবেচা' : '100% Safe & Verified Deals'}
                </h3>
                <p className="text-xs text-slate-300 font-normal">
                  {language === 'bn'
                    ? 'সরাসরি চ্যাটে দামাদামি করুন এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।'
                    : 'Chat live with sellers, inspect products before payment, and shop securely.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('post-ad')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-lg text-xs transition shrink-0 cursor-pointer"
            >
              {language === 'bn' ? 'বিজ্ঞাপন দিন' : 'Post Free Ad'}
            </button>
          </div>

        </main>
      </div>
    </div>
    </div>
  );
};

