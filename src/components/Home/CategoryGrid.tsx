import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { getCategoryImageUrl } from '../../utils/categoryImages';
import { ChevronRight, Layers } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { language, setFilters, setActiveTab, categories } = useMarket();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryClick = (catId: string, subCatId: string = '') => {
    setFilters(prev => ({ ...prev, category: catId, subCategory: subCatId, searchQuery: '' }));
    setActiveTab('search');
  };

  return (
    <div className="w-full relative">
      {/* Category Sidebar Title */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-pink-500/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">
            {language === 'bn' ? 'ব্রাউজ ক্যাটাগরি' : 'Browse Categories'}
          </h2>
        </div>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, category: '', subCategory: '' }));
            setActiveTab('search');
          }}
          className="text-xs font-black text-pink-600 dark:text-pink-400 hover:underline shrink-0 cursor-pointer"
        >
          {language === 'bn' ? 'সবগুলো →' : 'All →'}
        </button>
      </div>

      {/* Grid of Categories - Image on top and Name below inside single frame with Pink Border */}
      <div className="grid grid-cols-2 gap-2 relative">
        {categories.map(cat => {
          const isHovered = hoveredCategory === cat.id;
          const catSingleImage = getCategoryImageUrl(cat.id, cat.image);

          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="relative"
            >
              {/* Single Frame with Pink Border containing both Image and Category Name */}
              <button
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-xl border-2 border-pink-500 dark:border-pink-500/90 transition-all duration-200 cursor-pointer group text-center bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-pink-600 hover:scale-[1.02] active:scale-95 overflow-hidden ${
                  isHovered ? 'bg-pink-50/70 dark:bg-pink-950/40 border-pink-600' : ''
                }`}
              >
                {/* Enlarged Image maximizing space inside compact frame */}
                <div className="w-full h-20 sm:h-22 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50/60 dark:bg-slate-800/40 p-1">
                  <img
                    src={getOptimizedImageUrl(catSingleImage, 300)}
                    alt={cat.nameEn}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-2xs"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.retried) {
                        target.dataset.retried = 'true';
                        target.src = getOptimizedImageUrl(getCategoryImageUrl('others'), 300);
                      }
                    }}
                  />
                </div>

                {/* Category Name Caption inside the frame */}
                <span className="w-full font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-slate-100 mt-1 leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1 px-0.5">
                  {language === 'bn' ? cat.nameBn : cat.nameEn}
                </span>
              </button>

              {/* Sub-categories flyout on hover */}
              {isHovered && cat.subcategories && cat.subcategories.length > 0 && (
                <div className="absolute z-50 left-full top-0 ml-2 w-60 bg-white dark:bg-slate-900 border border-pink-500/40 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100 dark:border-slate-800">
                    <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-pink-400">
                    {cat.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(cat.id, sub.id);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-pink-600 hover:text-white transition flex items-center justify-between group/sub cursor-pointer"
                      >
                        <span className="truncate">
                          {language === 'bn' ? sub.nameBn : sub.nameEn}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-white shrink-0" />
                      </button>
                    ))}
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
  const { language, setFilters, setActiveTab, categories } = useMarket();

  const handleCategoryClick = (catId: string) => {
    setFilters(prev => ({ ...prev, category: catId, subCategory: '', searchQuery: '' }));
    setActiveTab('search');
  };

  return (
    <div className="w-full relative">
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-pink-500/30">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-pink-600 text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
            <Layers className="w-3 h-3" />
          </div>
          <h2 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
            {language === 'bn' ? 'ব্রাউজ ক্যাটাগরি' : 'Browse Categories'}
          </h2>
        </div>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, category: '', subCategory: '' }));
            setActiveTab('search');
          }}
          className="text-[10px] font-black text-pink-600 dark:text-pink-400 hover:underline shrink-0 cursor-pointer"
        >
          {language === 'bn' ? 'সবগুলো →' : 'All →'}
        </button>
      </div>

      {/* Multi-Row Fully Visible Grid with Pink Bordered Card Frames */}
      <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 py-1">
        {categories.map(cat => {
          const catSingleImage = getCategoryImageUrl(cat.id, cat.image);

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="w-full flex flex-col items-center justify-between p-1 rounded-xl border-2 border-pink-500 dark:border-pink-500/90 bg-white dark:bg-slate-900 text-center group cursor-pointer shadow-xs transition hover:border-pink-600 active:scale-95 hover:bg-pink-50/50 dark:hover:bg-slate-800/80 overflow-hidden"
            >
              {/* Category Image: Enlarged to maximize space inside compact frame */}
              <div className="w-full h-16 xs:h-18 sm:h-20 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50/60 dark:bg-slate-800/40 p-1">
                <img
                  src={getOptimizedImageUrl(catSingleImage, 250)}
                  alt={cat.nameEn}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-2xs"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.retried) {
                      target.dataset.retried = 'true';
                      target.src = getOptimizedImageUrl(getCategoryImageUrl('others'), 250);
                    }
                  }}
                />
              </div>

              {/* Caption Category Name inside the pink border frame */}
              <span className="w-full font-extrabold text-[10.5px] xs:text-[11px] text-slate-900 dark:text-slate-100 mt-1 leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1 px-0.5">
                {language === 'bn' ? cat.nameBn : cat.nameEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
