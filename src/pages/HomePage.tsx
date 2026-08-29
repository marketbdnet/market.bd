import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { isProductPublicActive } from '../utils/productStatus';
import { CategoryGrid, MobileCategoryGrid } from '../components/Home/CategoryGrid';
import { FlashSale } from '../components/Home/FlashSale';
import { ProductCard } from '../components/Product/ProductCard';
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
  ArrowUpDown
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    language,
    products,
    categories,
    setActiveTab,
    setFilters,
  } = useMarket();

  const [adViewMode, setAdViewMode] = useState<'grid' | 'list'>('grid');
  const [featuredOffset, setFeaturedOffset] = useState(0);

  // Smart Recent Posts interactive filter & pagination state
  const [recentCategory, setRecentCategory] = useState<string>('all');
  const [recentSort, setRecentSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [visibleRecentCount, setVisibleRecentCount] = useState<number>(9);

  // Filter Featured & Urgent Ads
  let featuredAds = products.filter(
    p => (p.adType === 'featured' || p.adType === 'urgent' || p.isFeatured || p.isUrgent) && isProductPublicActive(p)
  );
  if (featuredAds.length < 5) {
    const remainingActive = products.filter(
      p => isProductPublicActive(p) && !featuredAds.some(fa => fa.id === p.id)
    );
    featuredAds = [...featuredAds, ...remainingActive];
  }

  // Auto-rotate 5 Featured/Urgent items every 5 minutes if there are > 5 items
  useEffect(() => {
    if (featuredAds.length <= 5) return;
    const interval = setInterval(() => {
      setFeaturedOffset(prev => prev + 5);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [featuredAds.length]);

  // Sliced rotated 5 items
  const getDisplayFeatured = () => {
    if (featuredAds.length <= 5) return featuredAds.slice(0, 5);
    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(featuredAds[(featuredOffset + i) % featuredAds.length]);
    }
    return result;
  };

  const displayedFeatured = getDisplayFeatured();

  // Active products for Recent Posts
  const activeProducts = products.filter(p => isProductPublicActive(p));

  // Filter Recent by category
  let filteredRecent = activeProducts.filter(p => {
    if (recentCategory === 'all') return true;
    return p.category === recentCategory;
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
    <>
      <div className="space-y-4 sm:space-y-6 pb-12">
        <SEOHelmet />

      {/* MOBILE / ANDROID APP VIEW: 3-Row Category Grid Box placed right below Navbar */}
      <div className="block lg:hidden bg-white dark:bg-slate-900 border-2 border-pink-500/70 dark:border-pink-500/60 rounded-xl p-2 sm:p-3 shadow-md">
        <MobileCategoryGrid />
      </div>

      {/* Main Container Layout - Unified for Computer, Tablet & Mobile */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* LEFT SIDEBAR: Vertical Browse Categories (DESKTOP / LAPTOP ONLY) */}
        <aside className="hidden lg:block lg:w-80 xl:w-88 shrink-0 bg-white dark:bg-slate-900 border-2 border-pink-500/70 dark:border-pink-500/60 rounded-2xl p-3 sm:p-4 shadow-xl">
          <CategoryGrid />
        </aside>

        {/* RIGHT CONTENT: Flash Sale & Sellers' Posts (Promoted & Recent Listings) */}
        <main className="flex-1 w-full min-w-0 space-y-6">
          
          {/* 1. Flash Sale Banner (5 Items with 5-minute Auto Rotation) */}
          <FlashSale />

          {/* 2. Featured & Urgent Boosted Ads Section (5 Items with 5-minute Auto Rotation) */}
          <section className="bg-white dark:bg-slate-900 border-2 border-pink-500/70 dark:border-pink-500/60 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600 fill-red-600 animate-pulse shrink-0" />
                  <span>{language === 'bn' ? 'à¦«à¦¿à¦šà¦¾à¦°à§à¦¡ à¦“ à¦œà¦°à§à¦°à¦¿ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨' : 'Featured & Urgent Ads'}</span>
                </h2>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn' ? 'à¦¬à¦¿à¦¶à§‡à¦· à¦¬à§à¦¸à§à¦Ÿà§‡à¦¡ à¦œà¦°à§à¦°à¦¿ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨' : 'Top boosted listings with priority visibility'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* View Layout Toggle Bar */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-pink-300 dark:border-pink-800">
                  <button
                    onClick={() => setAdViewMode('grid')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      adViewMode === 'grid'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'à¦—à§à¦°à¦¿à¦¡' : 'Grid'}</span>
                  </button>
                  <button
                    onClick={() => setAdViewMode('list')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      adViewMode === 'list'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                    title="Up-Down / List View"
                  >
                    <Rows className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'à¦‰à¦ªà¦°à§‡-à¦¨à¦¿à¦šà§‡' : 'List'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, adType: 'featured' }));
                    setActiveTab('search');
                  }}
                  className="text-xs font-black text-pink-600 dark:text-pink-400 hover:underline cursor-pointer shrink-0"
                >
                  {language === 'bn' ? 'à¦¸à¦¬à¦—à§à¦²à§‹ â†’' : 'See all â†’'}
                </button>
              </div>
            </div>

            {/* Featured Ads Rendering: Exactly 5 items */}
            {displayedFeatured.length > 0 ? (
              <div
                className={
                  adViewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'
                    : 'flex flex-col gap-3 sm:gap-4'
                }
              >
                {displayedFeatured.map(product => (
                  <ProductCard key={product.id} product={product} layoutMode={adViewMode} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4 font-bold">
                {language === 'bn' ? 'à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨à§‡ à¦•à§‹à¦¨ à¦«à¦¿à¦šà¦¾à¦°à§à¦¡ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦¨à§‡à¦‡' : 'No featured ads currently available.'}
              </p>
            )}
          </section>

          {/* 3. Smart Recent Posts Section (à¦šà¦¿à¦¤à§à¦¤à¦¾à¦•à¦°à§à¦·à¦• à¦“ à¦†à¦§à§à¦¨à¦¿à¦• à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦• à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦¹à¦¾à¦¬) */}
          <section className="bg-gradient-to-b from-sky-50/50 via-white to-white dark:from-slate-900/95 dark:via-slate-900 dark:to-slate-900 rounded-2xl border-2 border-indigo-500/70 dark:border-indigo-500/60 shadow-xl p-3.5 sm:p-5 space-y-4 relative overflow-hidden">
            {/* Top Multi-Gradient Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

            {/* Header: Title + Live Counter + Sort & View Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-100 dark:border-slate-800 pb-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-md shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦• à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨' : 'Recent Listings'}</span>
                    </h2>
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>{filteredRecent.length} {language === 'bn' ? 'à¦Ÿà¦¿ à¦¤à¦¾à¦œà¦¾ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨' : 'Live Fresh Ads'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'à¦¸à¦¾à¦°à¦¾à¦¦à§‡à¦¶ à¦¥à§‡à¦•à§‡ à¦¬à¦¿à¦•à§à¦°à§‡à¦¤à¦¾à¦¦à§‡à¦° à¦¸à¦°à§à¦¬à¦¶à§‡à¦· à¦†à¦ªà¦²à§‹à¦¡à¦•à§ƒà¦¤ à¦“ à¦­à§‡à¦°à¦¿à¦«à¦¾à¦‡à¦¡ à¦ªà§‹à¦¸à§à¦Ÿà¦¸à¦®à§‚à¦¹'
                      : 'Latest verified items posted by sellers across all 64 districts'}
                  </p>
                </div>
              </div>

              {/* Controls: Sorting Dropdown & View Mode */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* Smart Sort */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <select
                    value={recentSort}
                    onChange={e => setRecentSort(e.target.value as any)}
                    className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="newest">{language === 'bn' ? 'âœ¨ à¦¨à¦¤à§à¦¨à¦¤à¦® à¦†à¦—à§‡' : 'âœ¨ Newest First'}</option>
                    <option value="price-asc">{language === 'bn' ? 'ðŸ“‰ à¦•à¦® à¦¦à¦¾à¦® à¦†à¦—à§‡' : 'ðŸ“‰ Price: Low to High'}</option>
                    <option value="price-desc">{language === 'bn' ? 'ðŸ“ˆ à¦¬à§‡à¦¶à¦¿ à¦¦à¦¾à¦® à¦†à¦—à§‡' : 'ðŸ“ˆ Price: High to Low'}</option>
                  </select>
                </div>

                {/* View Layout Toggle */}
                <div className="flex items-center bg-indigo-50 dark:bg-slate-800 p-0.5 rounded-xl border border-indigo-200 dark:border-slate-700">
                  <button
                    onClick={() => setAdViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      adViewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAdViewMode('list')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      adViewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400'
                    }`}
                    title="List View"
                  >
                    <Rows className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Category Filter Chips (Horizontal Scrollable with Rich Colors) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setRecentCategory('all');
                  setVisibleRecentCount(9);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  recentCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-indigo-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {language === 'bn' ? `à¦¸à¦¬ à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿ (${activeProducts.length})` : `All (${activeProducts.length})`}
              </button>

              {categories.slice(0, 8).map(cat => {
                const count = activeProducts.filter(p => p.category === cat.id).length;
                const isSelected = recentCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setRecentCategory(cat.id);
                      setVisibleRecentCount(9);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-indigo-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
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
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'
                    : 'flex flex-col gap-3 sm:gap-4'
                }
              >
                {displayedRecent.map(product => (
                  <ProductCard key={product.id} product={product} layoutMode={adViewMode} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-indigo-200 dark:border-slate-700 space-y-2">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {language === 'bn' ? 'à¦à¦‡ à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿à¦¤à§‡ à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨à§‡ à¦•à§‹à¦¨à§‹ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦¨à§‡à¦‡' : 'No active listings found in this category'}
                </p>
                <button
                  onClick={() => setRecentCategory('all')}
                  className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'à¦¸à¦•à¦² à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦¦à§‡à¦–à§à¦¨ â†’' : 'View all ads â†’'}
                </button>
              </div>
            )}

            {/* Bottom Actions: Load More / Explore All Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-indigo-100 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                {language === 'bn'
                  ? `à¦®à§‹à¦Ÿ ${filteredRecent.length} à¦Ÿà¦¿à¦° à¦®à¦§à§à¦¯à§‡ ${displayedRecent.length} à¦Ÿà¦¿ à¦¦à§‡à¦–à¦¾à¦¨à§‹ à¦¹à¦šà§à¦›à§‡`
                  : `Showing ${displayedRecent.length} of ${filteredRecent.length} listings`}
              </div>

              <div className="flex items-center gap-2">
                {hasMoreRecent && (
                  <button
                    onClick={() => setVisibleRecentCount(prev => prev + 6)}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-indigo-700 dark:text-indigo-300 text-xs font-black px-4 py-2 rounded-xl transition border-2 border-indigo-200 dark:border-indigo-800 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `à¦†à¦°à¦“ ${Math.min(6, filteredRecent.length - visibleRecentCount)} à¦Ÿà¦¿ à¦¦à§‡à¦–à§à¦¨`
                        : `Load ${Math.min(6, filteredRecent.length - visibleRecentCount)} More`}
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
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-black px-4.5 py-2 rounded-xl transition shadow-md cursor-pointer"
                >
                  <span>{language === 'bn' ? 'à¦¸à¦•à¦² à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦ªà§‡à¦œà§‡ à¦¯à¦¾à¦¨' : 'Explore All Ads'}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </section>

          {/* Trust Banner / Verified Marketplace */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border-2 border-pink-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-white">
                  {language === 'bn' ? 'à¦­à§‡à¦°à¦¿à¦«à¦¾à¦‡à¦¡ à¦“ à§§à§¦à§¦% à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦•à§‡à¦¨à¦¾à¦¬à§‡à¦šà¦¾' : '100% Safe & Verified Deals'}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {language === 'bn'
                    ? 'à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦šà§à¦¯à¦¾à¦Ÿà§‡ à¦¦à¦¾à¦®à¦¾à¦¦à¦¾à¦®à¦¿ à¦•à¦°à§à¦¨ à¦à¦¬à¦‚ à¦ªà¦£à§à¦¯ à¦¹à¦¾à¦¤à§‡ à¦ªà§‡à§Ÿà§‡ à¦®à§‚à¦²à§à¦¯ à¦ªà¦°à¦¿à¦¶à§‹à¦§ à¦•à¦°à§à¦¨à¥¤'
                    : 'Chat live with sellers, inspect products before payment, and shop securely.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('post-ad')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs transition shrink-0 cursor-pointer shadow-md"
            >
              {language === 'bn' ? 'à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦¦à¦¿à¦¨' : 'Post Free Ad'}
            </button>
          </div>

        </main>
      </div>
    </div>
    </>
  );
};


