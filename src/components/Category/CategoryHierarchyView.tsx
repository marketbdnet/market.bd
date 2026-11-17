import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { getCategoryImageUrl, getSubcategoryImageUrl, getSecondLevelImageUrl } from '../../utils/categoryImages';
import { getLiveCategoryCount, getLiveSubcategoryCount, getLiveSecondLevelCount } from '../../utils/categoryCounts';
import { toBengaliNumber } from '../../utils/dateUtils';
import { ChevronRight, Home } from 'lucide-react';
import { Category, SubCategory, SecondLevelCategory } from '../../types';

interface CategoryHierarchyViewProps {
  onCategorySelect?: (categoryId: string, subCategoryId?: string, secondLevelId?: string) => void;
  className?: string;
  showAllIfNoCategory?: boolean;
}

export const CategoryHierarchyView: React.FC<CategoryHierarchyViewProps> = ({
  onCategorySelect,
  className = '',
  showAllIfNoCategory = false
}) => {
  const { language, categories, filters, setFilters, setActiveTab, products } = useMarket();

  // Find active category
  const activeCategory: Category | undefined = (categories || []).find(
    c => c.id === filters.category || (c.nameEn && (filters.category || '') && c.nameEn.toLowerCase() === (filters.category || '').toLowerCase())
  );

  // Find active subcategory
  const activeSubcategory: SubCategory | undefined = activeCategory?.subcategories?.find(
    s => s.id === filters.subCategory || (s.nameEn && (filters.subCategory || '') && s.nameEn.toLowerCase() === (filters.subCategory || '').toLowerCase())
  );

  // Find active second-level category
  const activeSecondLevel: SecondLevelCategory | undefined = activeSubcategory?.secondLevelCategories?.find(
    sl => sl.id === filters.secondLevelCategory || (sl.nameEn && (filters.secondLevelCategory || '') && sl.nameEn.toLowerCase() === (filters.secondLevelCategory || '').toLowerCase())
  );

  const getSubcategoryCount = (catId: string, subId: string) =>
    getLiveSubcategoryCount(products, catId, subId);

  const getSecondLevelCount = (catId: string, subId: string, slId: string, slNameEn: string) =>
    getLiveSecondLevelCount(products, catId, subId, slId, slNameEn);

  const handleNavClick = (catId: string = '', subId: string = '', slId: string = '') => {
    if (onCategorySelect) {
      onCategorySelect(catId, subId, slId);
    } else {
      setFilters(prev => ({
        ...prev,
        category: catId,
        subCategory: subId,
        secondLevelCategory: slId
      }));
    }
  };

  const formatCountLabel = (count?: number) => {
    const num = (count || 0).toLocaleString('en-US');
    return language === 'bn' ? `${toBengaliNumber(num)}টি` : `${num} ads`;
  };

  // 1. Clean Bikroy-style Breadcrumb Bar
  const renderBreadcrumb = () => {
    return (
      <nav
        aria-label="Category Breadcrumb"
        className="flex items-center flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300 py-2 px-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <button
          type="button"
          onClick={() => handleNavClick('', '', '')}
          className={`font-semibold transition cursor-pointer ${
            !activeCategory
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'hover:text-emerald-700 dark:hover:text-emerald-400'
          }`}
        >
          {language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
        </button>

        {activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => handleNavClick(activeCategory.id, '', '')}
              className={`font-semibold transition cursor-pointer ${
                !activeSubcategory
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              {language === 'bn' ? activeCategory.nameBn : activeCategory.nameEn}
            </button>
          </>
        )}

        {activeSubcategory && activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => handleNavClick(activeCategory.id, activeSubcategory.id, '')}
              className={`font-semibold transition cursor-pointer ${
                !activeSecondLevel
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              {language === 'bn' ? activeSubcategory.nameBn : activeSubcategory.nameEn}
            </button>
          </>
        )}

        {activeSecondLevel && activeSubcategory && activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[160px]">
              {language === 'bn' ? activeSecondLevel.nameBn : activeSecondLevel.nameEn}
            </span>
          </>
        )}
      </nav>
    );
  };

  if (!activeCategory && !showAllIfNoCategory) {
    return renderBreadcrumb();
  }

  // 2. Render Clean All-17 Categories Grid when showAllIfNoCategory is true & no category selected
  const renderAllCategories = () => {
    return (
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {categories.map(cat => {
            const catImg = getCategoryImageUrl(cat.id, cat.image);
            const liveCatCount = getLiveCategoryCount(products, cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleNavClick(cat.id, '', '')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(catImg, 160)}
                      alt={cat.nameEn}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatCountLabel(liveCatCount)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Render Subcategories (Horizontal row cards with Image right next to Subcategory Name)
  const renderSubcategories = () => {
    if (!activeCategory) return null;
    const subs = activeCategory.subcategories || [];
    const mainCatImg = getCategoryImageUrl(activeCategory.id, activeCategory.image);

    return (
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={getOptimizedImageUrl(mainCatImg, 140)}
                alt={activeCategory.nameEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {language === 'bn' ? activeCategory.nameBn : activeCategory.nameEn}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? `সাব-ক্যাটাগরি নির্বাচন করুন (${toBengaliNumber(subs.length)}টি)`
                  : `Select a subcategory (${subs.length})`}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
            {formatCountLabel(getLiveCategoryCount(products, activeCategory.id))}
          </span>
        </div>

        {/* Subcategory Horizontal Cards: Image on Left right next to Subcategory Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {subs.map(sub => {
            const count = getSubcategoryCount(activeCategory.id, sub.id);
            const imgUrl = getSubcategoryImageUrl(activeCategory.id, sub.id, sub.image);

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleNavClick(activeCategory.id, sub.id, '')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-emerald-500 transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                    <img
                      src={getOptimizedImageUrl(imgUrl, 160)}
                      alt={sub.nameEn}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={e => {
                        const target = e.currentTarget;
                        if (!target.dataset.retried) {
                          target.dataset.retried = 'true';
                          target.src = getOptimizedImageUrl(mainCatImg, 160);
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {language === 'bn' ? sub.nameBn : sub.nameEn}
                    </h3>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                      {language === 'bn' ? `${toBengaliNumber(count)}টি বিজ্ঞাপন` : `${count} ads`}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 4. Render Second-Level Categories (Image next to name in clean horizontal rows)
  const renderSecondLevelCategories = () => {
    if (!activeCategory || !activeSubcategory) return null;
    const secondLevels = activeSubcategory.secondLevelCategories || [];
    if (secondLevels.length === 0) return null;
    const subImg = getSubcategoryImageUrl(activeCategory.id, activeSubcategory.id, activeSubcategory.image);

    return (
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={getOptimizedImageUrl(subImg, 140)}
              alt={activeSubcategory.nameEn}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {language === 'bn' ? activeSubcategory.nameBn : activeSubcategory.nameEn}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? `ব্র্যান্ড বা ধরন বেছে নিন (${toBengaliNumber(secondLevels.length)}টি)`
                  : `Select brand or type (${secondLevels.length})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavClick(activeCategory.id, '', '')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            ← {language === 'bn' ? 'সব সাব-ক্যাটাগরি' : 'All Subcategories'}
          </button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {secondLevels.map(sl => {
            const isSelected = activeSecondLevel?.id === sl.id;
            const count = getSecondLevelCount(activeCategory.id, activeSubcategory.id, sl.id, sl.nameEn);
            const slImg = getSecondLevelImageUrl(activeCategory.id, activeSubcategory.id, sl.id, sl.nameEn, sl.image);

            return (
              <button
                key={sl.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    handleNavClick(activeCategory.id, activeSubcategory.id, '');
                  } else {
                    handleNavClick(activeCategory.id, activeSubcategory.id, sl.id);
                  }
                }}
                className={`flex items-center justify-between gap-2.5 p-2 rounded-xl border transition cursor-pointer text-left group ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <img
                    src={getOptimizedImageUrl(slImg, 120)}
                    alt={sl.nameEn}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-md object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    onError={e => {
                      const target = e.currentTarget;
                      if (!target.dataset.retried) {
                        target.dataset.retried = 'true';
                        target.src = getOptimizedImageUrl(subImg, 120);
                      }
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`font-semibold text-xs leading-tight truncate ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {language === 'bn' ? sl.nameBn : sl.nameEn}
                    </div>
                    <div
                      className={`text-[10px] tabular-nums mt-0.5 ${
                        isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {language === 'bn' ? `${toBengaliNumber(count)}টি` : `${count} ads`}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {renderBreadcrumb()}
      {!activeCategory && showAllIfNoCategory && renderAllCategories()}
      {activeCategory && !activeSubcategory && renderSubcategories()}
      {activeCategory && activeSubcategory && renderSecondLevelCategories()}
    </div>
  );
};
