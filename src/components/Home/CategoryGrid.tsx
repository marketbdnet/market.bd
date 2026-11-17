import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { getCategoryImageUrl, getSubcategoryImageUrl } from '../../utils/categoryImages';
import { getLiveCategoryCount, getLiveSubcategoryCount } from '../../utils/categoryCounts';
import { toBengaliNumber } from '../../utils/dateUtils';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { language, setFilters, setActiveTab, categories, products } = useMarket();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (catId: string, subCatId: string = '') => {
    setFilters(prev => ({
      ...prev,
      category: catId,
      subCategory: subCatId,
      secondLevelCategory: '',
      searchQuery: ''
    }));
    setActiveTab('search');
  };

  const formatAdCount = (count?: number) => {
    const val = (count || 0).toLocaleString('en-US');
    return language === 'bn' ? `${toBengaliNumber(val)}টি বিজ্ঞাপন` : `${val} ads`;
  };

  return (
    <div className="w-full relative">
      {/* Clean Bikroy-style Header */}
      <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন' : 'Browse items by category'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilters(prev => ({ ...prev, category: '', subCategory: '', secondLevelCategory: '' }));
            setActiveTab('search');
          }}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
        >
          {language === 'bn' ? 'সবগুলো' : 'See all'}
        </button>
      </div>

      {/* Simple Bikroy-style Vertical Category List (Image Left + Name & Ad Count Right) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 relative">
        {categories.map(cat => {
          const isHovered = hoveredCategory === cat.id;
          const isExpanded = expandedCategory === cat.id;
          const catSingleImage = getCategoryImageUrl(cat.id, cat.image);
          const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
          const liveCatCount = getLiveCategoryCount(products, cat.id);

          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="relative"
            >
              <div className="flex items-center justify-between gap-2 py-2 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(catSingleImage, 160)}
                      alt={cat.nameEn}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.retried) {
                          target.dataset.retried = 'true';
                          target.src = getOptimizedImageUrl(getCategoryImageUrl('business_industry'), 160);
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatAdCount(liveCatCount)}
                    </div>
                  </div>
                </button>

                {hasSubs && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCategory(prev => (prev === cat.id ? null : cat.id));
                    }}
                    aria-label={language === 'bn' ? 'সাব-ক্যাটাগরি দেখুন' : 'Toggle subcategories'}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition cursor-pointer shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Inline Expanded Subcategories (with Image right next to Subcategory Name) */}
              {isExpanded && hasSubs && (
                <div className="ml-4 pl-3 pb-2 pt-1 space-y-1 border-l border-slate-200 dark:border-slate-700">
                  {cat.subcategories.map(sub => {
                    const subImg = getSubcategoryImageUrl(cat.id, sub.id, sub.image);
                    const subLiveCount = getLiveSubcategoryCount(products, cat.id, sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.id, sub.id)}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition cursor-pointer group/sub"
                      >
                        <img
                          src={getOptimizedImageUrl(subImg, 120)}
                          alt={sub.nameEn}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-md object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.retried) {
                              target.dataset.retried = 'true';
                              target.src = getOptimizedImageUrl(catSingleImage, 120);
                            }
                          }}
                        />
                        <span className="flex-1 min-w-0 text-xs font-medium text-slate-700 dark:text-slate-200 group-hover/sub:text-emerald-700 dark:group-hover/sub:text-emerald-400 truncate">
                          {language === 'bn' ? sub.nameBn : sub.nameEn}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                          {formatAdCount(subLiveCount)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Desktop Hover Flyout showing Subcategory Image next to Subcategory Name */}
              {isHovered && !isExpanded && hasSubs && (
                <div className="hidden lg:block absolute z-50 left-full top-0 ml-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {formatAdCount(liveCatCount)}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
                    {cat.subcategories.map(sub => {
                      const subImg = getSubcategoryImageUrl(cat.id, sub.id, sub.image);
                      const subLiveCount = getLiveSubcategoryCount(products, cat.id, sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryClick(cat.id, sub.id);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition flex items-center gap-2.5 group/sub cursor-pointer"
                        >
                          <img
                            src={getOptimizedImageUrl(subImg, 120)}
                            alt={sub.nameEn}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-md object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.dataset.retried) {
                                target.dataset.retried = 'true';
                                target.src = getOptimizedImageUrl(catSingleImage, 120);
                              }
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold">
                              {language === 'bn' ? sub.nameBn : sub.nameEn}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                              {formatAdCount(subLiveCount)}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-emerald-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MobileCategoryGrid: React.FC = () => {
  const { language, setFilters, setActiveTab, categories, products } = useMarket();
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  const handleCategoryClick = (catId: string, subCatId: string = '') => {
    setFilters(prev => ({
      ...prev,
      category: catId,
      subCategory: subCatId,
      secondLevelCategory: '',
      searchQuery: ''
    }));
    setActiveTab('search');
  };

  const formatAdCount = (count?: number) => {
    const val = (count || 0).toLocaleString('en-US');
    return language === 'bn' ? `${toBengaliNumber(val)}টি` : `${val} ads`;
  };

  return (
    <div className="w-full relative">
      {/* Simple Bikroy-style Mobile Category Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন' : 'Browse items by category'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilters(prev => ({ ...prev, category: '', subCategory: '', secondLevelCategory: '' }));
            setActiveTab('search');
          }}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
        >
          {language === 'bn' ? 'সবগুলো' : 'See all'}
        </button>
      </div>

      {/* Simple Bikroy-style Clean Cards Grid (Image Left + Name & Count Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {categories.map(cat => {
          const catSingleImage = getCategoryImageUrl(cat.id, cat.image);
          const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
          const isExpanded = expandedCatId === cat.id;
          const liveCatCount = getLiveCategoryCount(products, cat.id);

          return (
            <div
              key={cat.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 p-2">
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(catSingleImage, 160)}
                      alt={cat.nameEn}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.retried) {
                          target.dataset.retried = 'true';
                          target.src = getOptimizedImageUrl(getCategoryImageUrl('business_industry'), 160);
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatAdCount(liveCatCount)}
                    </div>
                  </div>
                </button>

                {hasSubs && (
                  <button
                    type="button"
                    onClick={() => setExpandedCatId(prev => (prev === cat.id ? null : cat.id))}
                    aria-label={language === 'bn' ? 'সাব-ক্যাটাগরি দেখুন' : 'Toggle subcategories'}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Inline Subcategory List with Image right next to Subcategory Name */}
              {isExpanded && hasSubs && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-2.5 py-2 space-y-1">
                  {cat.subcategories.map(sub => {
                    const subImg = getSubcategoryImageUrl(cat.id, sub.id, sub.image);
                    const subLiveCount = getLiveSubcategoryCount(products, cat.id, sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.id, sub.id)}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 hover:border-emerald-500 transition text-left cursor-pointer group/sub"
                      >
                        <img
                          src={getOptimizedImageUrl(subImg, 120)}
                          alt={sub.nameEn}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-md object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.retried) {
                              target.dataset.retried = 'true';
                              target.src = getOptimizedImageUrl(catSingleImage, 120);
                            }
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover/sub:text-emerald-700 dark:group-hover/sub:text-emerald-400 truncate">
                            {language === 'bn' ? sub.nameBn : sub.nameEn}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatAdCount(subLiveCount)}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
