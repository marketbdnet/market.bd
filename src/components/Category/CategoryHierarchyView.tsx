import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { getSubcategoryImageUrl, getSecondLevelImageUrl } from '../../utils/categoryImages';
import { isProductPublicActive } from '../../utils/productStatus';
import {
  ChevronRight,
  Home,
  Layers,
  Car,
  Bike,
  Bus,
  Truck,
  Wrench,
  Ship,
  Tractor,
  CircleDot,
  BatteryCharging,
  Lightbulb,
  Zap,
  Armchair,
  Shield,
  Speaker,
  ShieldCheck,
  Sparkles,
  Package,
  Cog,
  Disc,
  GitCommit,
  Anchor,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  Server,
  HardDrive,
  Printer,
  Cpu,
  Monitor,
  Wifi,
  Radio,
  Video,
  Mic,
  Laptop,
  Tv,
  Building2,
  Sofa,
  Shirt,
  HeartPulse,
  Baby,
  BookOpen,
  Dog,
  Briefcase,
  GraduationCap,
  Plane,
  Utensils,
  Ticket,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { Category, SubCategory, SecondLevelCategory } from '../../types';

// Map icon string to Lucide component
const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Bike,
  Bus,
  Truck,
  Wrench,
  Ship,
  Tractor,
  CircleDot,
  BatteryCharging,
  Lightbulb,
  Zap,
  Armchair,
  Shield,
  Speaker,
  ShieldCheck,
  Sparkles,
  Package,
  Cog,
  Disc,
  GitCommit,
  Anchor,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  Server,
  HardDrive,
  Printer,
  Cpu,
  Monitor,
  Wifi,
  Radio,
  Video,
  Mic,
  Laptop,
  Tv,
  Building2,
  Home: Building2,
  Sofa,
  Shirt,
  HeartPulse,
  Baby,
  BookOpen,
  Dog,
  Briefcase,
  GraduationCap,
  Plane,
  Utensils,
  Ticket,
  MoreHorizontal,
  Layers
};

const getCategoryIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return Layers;
  return ICON_MAP[iconName] || Layers;
};

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

  // Calculate live product counts for subcategories
  const getSubcategoryCount = (catId: string, subId: string) => {
    const cLower = String(catId || '').toLowerCase();
    const sLower = String(subId || '').toLowerCase();
    return (products || []).filter(p => {
      if (!p) return false;
      if (!isProductPublicActive(p)) return false;
      const pCat = String(p.category || '').toLowerCase();
      const catMatch = pCat === cLower;
      if (!catMatch) return false;
      
      const pSub = String(p.subCategory || '').toLowerCase();
      // Flexible subcategory matching
      if (sLower === 'motorcycles_scooters') {
        return pSub === 'motorcycles_scooters' || pSub === 'motorcycles' || pSub === 'scooters';
      }
      if (sLower === 'buses_microbuses') {
        return pSub === 'buses_microbuses' || pSub === 'buses' || pSub === 'microbuses';
      }
      if (sLower === 'vehicle_parts_accessories') {
        return pSub === 'vehicle_parts_accessories' || pSub === 'spare_parts' || pSub === 'tyres_wheels' || pSub === 'vehicle_acc';
      }
      if (sLower === 'trucks_heavy_vehicles') {
        return pSub === 'trucks_heavy_vehicles' || pSub === 'trucks';
      }
      if (sLower === 'three_wheelers') {
        return pSub === 'three_wheelers' || pSub === 'auto_rickshaws';
      }
      if (sLower === 'water_transport') {
        return pSub === 'water_transport' || pSub === 'boats';
      }
      
      return pSub === sLower;
    }).length;
  };

  // Calculate live product count for second-level category
  const getSecondLevelCount = (catId: string, subId: string, slId: string, slNameEn: string) => {
    const cLower = String(catId || '').toLowerCase();
    const sIdLower = String(slId || '').toLowerCase();
    const sNameLower = String(slNameEn || '').toLowerCase();

    return (products || []).filter(p => {
      if (!p) return false;
      if (!isProductPublicActive(p)) return false;
      const pCat = String(p.category || '').toLowerCase();
      const catMatch = pCat === cLower;
      if (!catMatch) return false;

      const pSL = String(p.secondLevelCategory || '').toLowerCase();
      if (pSL && pSL === sIdLower) return true;
      
      const pBrand = String(p.brand || '').toLowerCase();
      if (pBrand && (pBrand === sIdLower || (sNameLower && pBrand === sNameLower))) return true;
      
      const pTitle = String(p.title || '').toLowerCase();
      if (sNameLower && pTitle && pTitle.includes(sNameLower)) return true;

      const pDesc = String(p.description || '').toLowerCase();
      if (sNameLower && pDesc && pDesc.includes(sNameLower)) return true;
      return false;
    }).length;
  };

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

  // 1. Breadcrumb Component
  const renderBreadcrumb = () => {
    return (
      <nav aria-label="Category Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300 py-1.5 px-3 bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl border border-pink-200 dark:border-slate-700 shadow-2xs">
        <button
          onClick={() => {
            setActiveTab('home');
          }}
          className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <button
          onClick={() => {
            handleNavClick('', '', '');
          }}
          className={`font-bold transition cursor-pointer ${
            !activeCategory
              ? 'text-pink-600 dark:text-pink-400 font-extrabold'
              : 'hover:text-pink-600 dark:hover:text-pink-400'
          }`}
        >
          {language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
        </button>

        {activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => handleNavClick(activeCategory.id, '', '')}
              className={`font-bold transition cursor-pointer ${
                !activeSubcategory
                  ? 'text-pink-600 dark:text-pink-400 font-extrabold'
                  : 'hover:text-pink-600 dark:hover:text-pink-400'
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
              onClick={() => handleNavClick(activeCategory.id, activeSubcategory.id, '')}
              className={`font-bold transition cursor-pointer ${
                !activeSecondLevel
                  ? 'text-pink-600 dark:text-pink-400 font-extrabold'
                  : 'hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              {language === 'bn' ? activeSubcategory.nameBn : activeSubcategory.nameEn}
            </button>
          </>
        )}

        {activeSecondLevel && activeSubcategory && activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-black text-pink-600 dark:text-pink-400 truncate max-w-[150px]">
              {language === 'bn' ? activeSecondLevel.nameBn : activeSecondLevel.nameEn}
            </span>
          </>
        )}
      </nav>
    );
  };

  // If no category is selected and showAllIfNoCategory is false, just render breadcrumb or return null
  if (!activeCategory && !showAllIfNoCategory) {
    return renderBreadcrumb();
  }

  // 2. Render Subcategories Grid (when Main Category is active, but Subcategory is not selected yet)
  const renderSubcategories = () => {
    if (!activeCategory) return null;
    const subs = activeCategory.subcategories || [];

    const MainIcon = getCategoryIconComponent(activeCategory.icon);

    return (
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border-2 border-pink-500/80 shadow-sm">
        {/* Category Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-xs">
              <MainIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {language === 'bn' ? activeCategory.nameBn : activeCategory.nameEn}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? `সাব-ক্যাটাগরি বেছে নিন (${subs.length}টি বিভাগ রয়েছে)`
                  : `Select a Subcategory (${subs.length} available)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 rounded-full border border-pink-200 dark:border-pink-800">
              {activeCategory.count ? `${activeCategory.count.toLocaleString()}+` : ''} {language === 'bn' ? 'বিজ্ঞাপন' : 'Ads'}
            </span>
          </div>
        </div>

        {/* 9 Subcategories (or category subs) Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
          {subs.map(sub => {
            const SubIcon = getCategoryIconComponent(sub.icon);
            const count = getSubcategoryCount(activeCategory.id, sub.id);
            const imgUrl = getSubcategoryImageUrl(activeCategory.id, sub.id, sub.image);

            return (
              <button
                key={sub.id}
                onClick={() => handleNavClick(activeCategory.id, sub.id, '')}
                className="flex flex-col items-center justify-between p-2 rounded-2xl border-2 border-pink-400/70 dark:border-pink-500/60 bg-white dark:bg-slate-800/90 hover:bg-pink-50/70 dark:hover:bg-pink-950/30 hover:border-pink-600 transition duration-200 cursor-pointer text-center group shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 overflow-hidden"
              >
                {/* Visual Image / Icon Container */}
                <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-700/40 relative flex items-center justify-center p-1.5">
                  <img
                    src={getOptimizedImageUrl(imgUrl, 350)}
                    alt={sub.nameEn}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-xs"
                    onError={e => {
                      const target = e.currentTarget;
                      if (!target.dataset.retried) {
                        target.dataset.retried = 'true';
                        target.src = getOptimizedImageUrl(activeCategory.image || '', 350);
                      }
                    }}
                  />
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-center text-pink-600 shadow-2xs">
                    <SubIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Subcategory Label & Count */}
                <div className="w-full mt-2">
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
                    {language === 'bn' ? sub.nameBn : sub.nameEn}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {count > 0 ? `${count} ${language === 'bn' ? 'টি আইটেম' : 'items'}` : (language === 'bn' ? 'ব্রাউজ করুন' : 'Browse')}
                    </span>
                    <ChevronRight className="w-3 h-3 text-pink-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Render Second-Level Categories Grid (when Subcategory is selected)
  const renderSecondLevelCategories = () => {
    if (!activeCategory || !activeSubcategory) return null;
    const secondLevels = activeSubcategory.secondLevelCategories || [];
    if (secondLevels.length === 0) return null;

    const SubIcon = getCategoryIconComponent(activeSubcategory.icon);

    return (
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border-2 border-pink-500/80 shadow-sm">
        {/* Header with Subcategory title & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-xs">
              <SubIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {language === 'bn' ? activeSubcategory.nameBn : activeSubcategory.nameEn}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? `নির্দিষ্ট ব্র্যান্ড বা টাইপ নির্বাচন করুন (${secondLevels.length}টি অপশন)`
                  : `Select a Brand or Type (${secondLevels.length} options)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavClick(activeCategory.id, '', '')}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-pink-600 underline cursor-pointer"
            >
              ← {language === 'bn' ? 'সব সাব-ক্যাটাগরি' : 'All Subcategories'}
            </button>
          </div>
        </div>

        {/* Second-Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {secondLevels.map(sl => {
            const isSelected = activeSecondLevel?.id === sl.id;
            const SLIcon = getCategoryIconComponent(sl.icon || activeSubcategory.icon);
            const count = getSecondLevelCount(activeCategory.id, activeSubcategory.id, sl.id, sl.nameEn);
            const slImg = getSecondLevelImageUrl(activeCategory.id, activeSubcategory.id, sl.id, sl.nameEn, sl.image);

            return (
              <button
                key={sl.id}
                onClick={() => {
                  if (isSelected) {
                    handleNavClick(activeCategory.id, activeSubcategory.id, '');
                  } else {
                    handleNavClick(activeCategory.id, activeSubcategory.id, sl.id);
                  }
                }}
                className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 transition duration-150 cursor-pointer text-center group shadow-2xs hover:shadow-sm active:scale-95 overflow-hidden ${
                  isSelected
                    ? 'bg-pink-600 text-white border-pink-700 shadow-md scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-pink-300/80 dark:border-pink-600/50 hover:bg-pink-50/70 hover:border-pink-600'
                }`}
              >
                {/* Visual Product Image Preview filling 80-90% frame */}
                <div className={`w-full h-18 sm:h-20 rounded-xl overflow-hidden relative flex items-center justify-center p-1 mb-1.5 ${
                  isSelected ? 'bg-white/10' : 'bg-white dark:bg-slate-700/50'
                }`}>
                  <img
                    src={getOptimizedImageUrl(slImg, 250)}
                    alt={sl.nameEn}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-2xs"
                    onError={e => {
                      const target = e.currentTarget;
                      if (!target.dataset.retried) {
                        target.dataset.retried = 'true';
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div className={`absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-pink-600 shadow-2xs'
                  }`}>
                    <SLIcon className="w-3 h-3" />
                  </div>
                </div>

                <span
                  className={`font-bold text-xs leading-tight line-clamp-1 w-full px-1 ${
                    isSelected ? 'text-white font-black' : 'text-slate-900 dark:text-white group-hover:text-pink-600'
                  }`}
                >
                  {language === 'bn' ? sl.nameBn : sl.nameEn}
                </span>

                {count > 0 && (
                  <span
                    className={`text-[10px] mt-1 px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300'
                    }`}
                  >
                    {count} {language === 'bn' ? 'টি' : 'items'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Breadcrumb bar */}
      {renderBreadcrumb()}

      {/* 2. Subcategory Grid (when Main Category is chosen but Subcategory is not) */}
      {activeCategory && !activeSubcategory && renderSubcategories()}

      {/* 3. Second-Level Category Grid (when Subcategory is chosen) */}
      {activeCategory && activeSubcategory && renderSecondLevelCategories()}
    </div>
  );
};
