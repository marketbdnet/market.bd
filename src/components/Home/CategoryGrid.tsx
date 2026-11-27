import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { getCategoryImageUrl, getSubcategoryImageUrl } from '../../utils/categoryImages';
import { getLiveCategoryCount, getLiveSubcategoryCount } from '../../utils/categoryCounts';
import { toBengaliNumber } from '../../utils/dateUtils';
import { ChevronDown, ChevronRight, Layers, X } from 'lucide-react';

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
      {/* MarketBD Category Header */}
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

      {/* MarketBD Vertical Category List (Single Clean Composite Photo Left + Name & Ad Count Right) */}
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
                  className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer group"
                >
                  <div className="w-16 h-11 rounded-lg bg-[#F4F7FA] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(catSingleImage, 160)}
                      alt={language === 'bn' ? cat.nameBn : cat.nameEn}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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

  // Merge Business & Industry into Jobs on mobile so all 16 categories sit in a clean 4x4 grid
  const businessCat = categories.find(c => c.id === 'business_industry');
  const mobileCategories = categories
    .filter(c => c.id !== 'business_industry')
    .map(cat => {
      if (cat.id === 'jobs' && businessCat) {
        const mergedSubs = [
          ...(Array.isArray(cat.subcategories) ? cat.subcategories : []).map(sub => ({
            ...sub,
            parentCatId: cat.id
          })),
          ...(Array.isArray(businessCat.subcategories) ? businessCat.subcategories : []).map(sub => ({
            ...sub,
            parentCatId: businessCat.id
          }))
        ];
        const jobsImg = getCategoryImageUrl(cat.id, cat.image);
        return {
          ...cat,
          nameBn: 'ক্যারিয়ার ও বাণিজ্য',
          nameEn: 'Careers & Trade',
          image: jobsImg,
          mergedBusinessId: businessCat.id,
          mergedSubcategories: mergedSubs
        };
      }
      return {
        ...cat,
        mergedBusinessId: undefined as string | undefined,
        mergedSubcategories: (Array.isArray(cat.subcategories) ? cat.subcategories : []).map(sub => ({
          ...sub,
          parentCatId: cat.id
        }))
      };
    });

  // Chunk into rows of 4 (16 items = 4 full rows of 4)
  const categoryRows: Array<typeof mobileCategories> = [];
  for (let i = 0; i < mobileCategories.length; i += 4) {
    categoryRows.push(mobileCategories.slice(i, i + 4));
  }

  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
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
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer min-h-[36px] px-1 flex items-center"
        >
          {language === 'bn' ? 'সবগুলো' : 'See all'}
        </button>
      </div>

      {/* 4-Column Horizontal Category Rows + Row-Anchored Subcategory Tray */}
      <div className="space-y-2">
        {categoryRows.map((rowCats, rowIdx) => {
          const activeRowCat = rowCats.find(
            c => c.id === expandedCatId && c.mergedSubcategories.length > 0
          );

          return (
            <div key={`mob-cat-row-${rowIdx}`} className="space-y-2">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {rowCats.map(cat => {
                  const catImg = getCategoryImageUrl(cat.id, cat.image);
                  const hasSubs = cat.mergedSubcategories.length > 0;
                  const isExpanded = expandedCatId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (hasSubs) {
                          setExpandedCatId(prev => (prev === cat.id ? null : cat.id));
                        } else {
                          handleCategoryClick(cat.id);
                        }
                      }}
                      aria-expanded={hasSubs ? isExpanded : undefined}
                      aria-label={`${language === 'bn' ? cat.nameBn : cat.nameEn}${
                        hasSubs ? (language === 'bn' ? ' - সাব-ক্যাটাগরি দেখুন' : ' - View subcategories') : ''
                      }`}
                      className={`flex flex-col items-center justify-between p-1 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer active:scale-[0.97] overflow-hidden ${
                        isExpanded
                          ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500'
                      }`}
                    >
                      {/* Unified Studio Showcase (2 category items together on 1 seamless background) */}
                      <div className="w-full aspect-[4/3] rounded-lg bg-[#F4F7FA] dark:bg-slate-800/90 overflow-hidden">
                        <img
                          src={getOptimizedImageUrl(catImg, 240)}
                          alt={language === 'bn' ? cat.nameBn : cat.nameEn}
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.retried) {
                              target.dataset.retried = 'true';
                              target.src = getOptimizedImageUrl(getCategoryImageUrl('business_industry'), 240);
                            }
                          }}
                        />
                      </div>

                      {/* Category Name + Subcategory Disclosure Arrow Below Image */}
                      <div className="w-full pt-1 pb-0.5 px-0.5 flex items-center justify-center gap-0.5 min-w-0">
                        <span
                          className={`text-[10.5px] sm:text-xs font-bold leading-tight line-clamp-2 break-words ${
                            isExpanded
                              ? 'text-emerald-800 dark:text-emerald-300'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {language === 'bn' ? cat.nameBn : cat.nameEn}
                        </span>
                        {hasSubs && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
                              isExpanded
                                ? 'rotate-180 text-emerald-700 dark:text-emerald-300'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expanded Subcategory Drawer directly under the tapped 4-column row */}
              {activeRowCat && (
                <div className="rounded-xl border-2 border-emerald-500/70 dark:border-emerald-500/60 bg-slate-50/95 dark:bg-slate-800/60 p-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-700/80">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {language === 'bn' ? activeRowCat.nameBn : activeRowCat.nameEn}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        ·{' '}
                        {formatAdCount(
                          getLiveCategoryCount(products, activeRowCat.id) +
                            (activeRowCat.mergedBusinessId
                              ? getLiveCategoryCount(products, activeRowCat.mergedBusinessId)
                              : 0)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(activeRowCat.id)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <span>{language === 'bn' ? 'সব দেখুন' : 'View all'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedCatId(null)}
                        aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close subcategories'}
                        className="min-w-[32px] min-h-[32px] rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {activeRowCat.mergedSubcategories.map(sub => {
                      const parentCatId = sub.parentCatId || activeRowCat.id;
                      const parentImg = getCategoryImageUrl(parentCatId, activeRowCat.image);
                      const subImg = getSubcategoryImageUrl(parentCatId, sub.id, sub.image);
                      const subLiveCount = getLiveSubcategoryCount(products, parentCatId, sub.id);

                      return (
                        <button
                          key={`${parentCatId}-${sub.id}`}
                          type="button"
                          onClick={() => handleCategoryClick(parentCatId, sub.id)}
                          className="min-h-[50px] flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-600/80 hover:border-emerald-500 dark:hover:border-emerald-500 transition text-left cursor-pointer group/sub active:scale-[0.98]"
                        >
                          <img
                            src={getOptimizedImageUrl(subImg, 160)}
                            alt={language === 'bn' ? sub.nameBn : sub.nameEn}
                            loading="eager"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-md object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.dataset.retried) {
                                target.dataset.retried = 'true';
                                target.src = getOptimizedImageUrl(parentImg, 160);
                              }
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 group-hover/sub:text-emerald-700 dark:group-hover/sub:text-emerald-400 line-clamp-2 leading-tight">
                              {language === 'bn' ? sub.nameBn : sub.nameEn}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
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

