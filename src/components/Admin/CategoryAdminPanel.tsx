import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { CATEGORIES } from '../../data/categoriesData';
import {
  getCategoryImageUrl,
  getSubcategoryImageUrl,
  getSecondLevelImageUrl,
  MAIN_CATEGORY_IMAGES,
  SUBCATEGORY_IMAGES,
  BRAND_SECOND_LEVEL_IMAGES
} from '../../utils/categoryImages';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Tag,
  Layers,
  Search,
  Sparkles,
  ChevronRight,
  Grid,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CatalogItem {
  key: string;
  nameEn: string;
  nameBn: string;
  level: 'main' | 'sub' | 'second_level';
  parentCatId: string;
  parentCatNameEn: string;
  parentCatNameBn: string;
  subCatId?: string;
  subCatNameEn?: string;
  subCatNameBn?: string;
  defaultImageUrl: string;
  currentImageUrl: string;
  isCustom: boolean;
}

export const CategoryAdminPanel: React.FC = () => {
  const {
    language,
    categoryImageOverrides,
    updateCategoryImageOverride,
    removeCategoryImageOverride,
    resetAllCategoryImageOverrides
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'images' | 'hierarchy'>('images');

  // Images Manager States
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'main' | 'sub' | 'second_level' | 'custom'>('all');
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('all');
  
  // Modal for Image Upload / Edit
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Build flattened catalog from CATEGORIES data
  const fullCatalog: CatalogItem[] = useMemo(() => {
    const list: CatalogItem[] = [];

    CATEGORIES.forEach((cat) => {
      const catKey = cat.id.toLowerCase().trim();
      const catCustom = !!categoryImageOverrides[catKey];
      const catDefault = MAIN_CATEGORY_IMAGES[catKey] || MAIN_CATEGORY_IMAGES.others;
      const catCurrent = getCategoryImageUrl(cat.id, cat.image);

      list.push({
        key: catKey,
        nameEn: cat.nameEn,
        nameBn: cat.nameBn,
        level: 'main',
        parentCatId: cat.id,
        parentCatNameEn: cat.nameEn,
        parentCatNameBn: cat.nameBn,
        defaultImageUrl: catDefault,
        currentImageUrl: catCurrent,
        isCustom: catCustom
      });

      // Subcategories
      if (Array.isArray(cat.subcategories)) {
        cat.subcategories.forEach((sub) => {
          const subKey = sub.id.toLowerCase().trim();
          const subCustom = !!categoryImageOverrides[subKey];
          const subDefault = SUBCATEGORY_IMAGES[subKey] || catDefault;
          const subCurrent = getSubcategoryImageUrl(cat.id, sub.id, sub.image);

          list.push({
            key: subKey,
            nameEn: sub.nameEn,
            nameBn: sub.nameBn,
            level: 'sub',
            parentCatId: cat.id,
            parentCatNameEn: cat.nameEn,
            parentCatNameBn: cat.nameBn,
            subCatId: sub.id,
            subCatNameEn: sub.nameEn,
            subCatNameBn: sub.nameBn,
            defaultImageUrl: subDefault,
            currentImageUrl: subCurrent,
            isCustom: subCustom
          });

          // Second Level Categories / Brands
          if (Array.isArray(sub.secondLevelCategories)) {
            sub.secondLevelCategories.forEach((sl) => {
              const slKey = sl.id.toLowerCase().trim();
              const slNameKey = sl.nameEn.toLowerCase().trim().replace(/\s+/g, '_');
              const slCustom = !!categoryImageOverrides[slKey] || !!categoryImageOverrides[slNameKey];
              const slDefault = BRAND_SECOND_LEVEL_IMAGES[slKey] || BRAND_SECOND_LEVEL_IMAGES[slNameKey] || subDefault;
              const slCurrent = getSecondLevelImageUrl(cat.id, sub.id, sl.id, sl.nameEn, sl.image);

              list.push({
                key: slKey,
                nameEn: sl.nameEn,
                nameBn: sl.nameBn,
                level: 'second_level',
                parentCatId: cat.id,
                parentCatNameEn: cat.nameEn,
                parentCatNameBn: cat.nameBn,
                subCatId: sub.id,
                subCatNameEn: sub.nameEn,
                subCatNameBn: sub.nameBn,
                defaultImageUrl: slDefault,
                currentImageUrl: slCurrent,
                isCustom: slCustom
              });
            });
          }
        });
      }
    });

    return list;
  }, [categoryImageOverrides]);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return fullCatalog.filter((item) => {
      // Search match
      const query = imageSearchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.nameEn.toLowerCase().includes(query) ||
        item.nameBn.toLowerCase().includes(query) ||
        item.parentCatNameEn.toLowerCase().includes(query) ||
        item.parentCatNameBn.toLowerCase().includes(query) ||
        (item.subCatNameEn && item.subCatNameEn.toLowerCase().includes(query)) ||
        (item.subCatNameBn && item.subCatNameBn.toLowerCase().includes(query));

      if (!matchQuery) return false;

      // Parent category filter
      if (selectedParentFilter !== 'all' && item.parentCatId !== selectedParentFilter) {
        return false;
      }

      // Level filter
      if (levelFilter === 'main') return item.level === 'main';
      if (levelFilter === 'sub') return item.level === 'sub';
      if (levelFilter === 'second_level') return item.level === 'second_level';
      if (levelFilter === 'custom') return item.isCustom;

      return true;
    });
  }, [fullCatalog, imageSearchQuery, levelFilter, selectedParentFilter]);

  const customOverridesCount = useMemo(() => {
    return Object.keys(categoryImageOverrides || {}).length;
  }, [categoryImageOverrides]);

  // Open Edit/Upload Modal
  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setInputImageUrl(item.isCustom ? item.currentImageUrl : '');
    setPreviewImageUrl(item.currentImageUrl);
    setUploadError('');
  };

  // Handle File Upload to Base64 Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError(
        language === 'bn'
          ? 'ছবির সাইজ ৪ মেগাবাইট (4MB)-এর বেশি হতে পারবে না।'
          : 'Image file size must be less than 4MB.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setInputImageUrl(dataUrl);
        setPreviewImageUrl(dataUrl);
        setUploadError('');
      }
    };
    reader.onerror = () => {
      setUploadError(
        language === 'bn' ? 'ফাইল পড়তে সমস্যা হয়েছে।' : 'Error reading image file.'
      );
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Image Change
  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalUrl = (inputImageUrl || previewImageUrl).trim();
    if (!finalUrl) {
      setUploadError(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ছবির লিঙ্ক দিন বা ছবি আপলোড করুন।'
          : 'Please provide a valid image URL or upload a file.'
      );
      return;
    }

    updateCategoryImageOverride(editingItem.key, finalUrl);
    setToastMsg(
      language === 'bn'
        ? `✓ "${editingItem.nameBn}" এর ছবি সফলভাবে আপডেট করা হয়েছে!`
        : `✓ Image for "${editingItem.nameEn}" updated successfully!`
    );
    setEditingItem(null);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Handle Reset Single Image to Default
  const handleResetSingleImage = (item: CatalogItem) => {
    removeCategoryImageOverride(item.key);
    setToastMsg(
      language === 'bn'
        ? `✓ "${item.nameBn}" এর ছবি ডিফল্টে ফিরিয়ে নেওয়া হয়েছে।`
        : `✓ Image for "${item.nameEn}" restored to default.`
    );
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Handle Reset All Images to Defaults
  const handleResetAll = () => {
    if (
      confirm(
        language === 'bn'
          ? 'আপনি কি নিশ্চিত যে সমস্ত কাস্টম ক্যাটাগরি ছবি মুছে ডিফল্টে রিসেট করতে চান?'
          : 'Are you sure you want to reset ALL category images to factory defaults?'
      )
    ) {
      resetAllCategoryImageOverrides();
      setToastMsg(
        language === 'bn'
          ? '✓ সমস্ত ক্যাটাগরি ছবি ডিফল্টে সফলভাবে রিসেট করা হয়েছে।'
          : '✓ All category images reset to defaults.'
      );
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Realtime Image Manager
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn'
                ? '🖼️ ক্যাটাগরি ছবি ও ভিজ্যুয়াল ম্যানেজমেন্ট'
                : '🖼️ Category Images & Visual Asset Manager'}
            </h2>
          </div>
          <p className="text-xs text-emerald-200/90 max-w-2xl">
            {language === 'bn'
              ? 'ওয়েবসাইট এবং অ্যাপের সমস্ত মেইন ক্যাটাগরি, সাব-ক্যাটাগরি ও ব্র্যান্ডের ছবি সরাসরি আপলোড, পরিবর্তন এবং ইনস্ট্যান্ট প্রিভিউ করুন।'
              : 'Directly upload, replace, and audit realistic isolated images for all categories, subcategories, and brands with realtime persistence.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'images'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ছবি ও আইকন লাইভ এডিটর' : 'Image & Icon Manager'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-black rounded-2xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Overview Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">
              {language === 'bn' ? 'মেইন ক্যাটাগরি' : 'Main Categories'}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {CATEGORIES.length}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">
              {language === 'bn' ? 'মোট আইটেম / নোড' : 'Total Image Nodes'}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {fullCatalog.length}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">
              {language === 'bn' ? 'কাস্টম আপলোড' : 'Custom Uploaded'}
            </div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
              {customOverridesCount}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-slate-500">
              {language === 'bn' ? 'ফ্যাক্টরি ডিফল্ট' : 'Factory Reset'}
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {language === 'bn' ? 'সকল ছবি রিস্টোর' : 'Reset all images'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            disabled={customOverridesCount === 0}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="search"
            name="admin_category_search_filter"
            id="admin-category-search-filter"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            inputMode="search"
            data-lpignore="true"
            data-form-type="other"
            value={imageSearchQuery}
            onChange={(e) => setImageSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'ক্যাটাগরি বা ব্র্যান্ডের নাম খুঁজুন...'
                : 'Search category or brand name...'
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {imageSearchQuery && (
            <button
              type="button"
              onClick={() => setImageSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Filters & Category Parent Dropdown */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <select
            value={selectedParentFilter}
            onChange={(e) => setSelectedParentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">
              {language === 'bn' ? 'সকল মেইন গ্রুপ (All Groups)' : 'All Main Groups'}
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.nameBn : c.nameEn}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer whitespace-nowrap ${
                levelFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সব' : 'All'} ({fullCatalog.length})
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('main')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer whitespace-nowrap ${
                levelFilter === 'main'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? 'মেইন' : 'Main'} ({CATEGORIES.length})
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('sub')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer whitespace-nowrap ${
                levelFilter === 'sub'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সাব' : 'Sub'}
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('second_level')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer whitespace-nowrap ${
                levelFilter === 'second_level'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? 'ব্র্যান্ড/আইটেম' : 'Brands & Items'}
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('custom')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer whitespace-nowrap ${
                levelFilter === 'custom'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 dark:text-amber-400 hover:text-amber-900'
              }`}
            >
              {language === 'bn' ? 'কাস্টম' : 'Custom'} ({customOverridesCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Catalog Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCatalog.map((item) => (
          <div
            key={item.key}
            className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 p-4 flex flex-col justify-between group hover:shadow-lg ${
              item.isCustom
                ? 'border-amber-400 dark:border-amber-500/60 ring-2 ring-amber-400/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="space-y-3">
              {/* Card Header Badge & Type */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.level === 'main'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : item.level === 'sub'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.level === 'main'
                    ? (language === 'bn' ? 'মেইন ক্যাটাগরি' : 'Main Category')
                    : item.level === 'sub'
                    ? (language === 'bn' ? 'সাব-ক্যাটাগরি' : 'Sub-Category')
                    : (language === 'bn' ? 'লেভেল-৩ / ব্র্যান্ড' : 'Brand / Item')}
                </span>

                {item.isCustom && (
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{language === 'bn' ? 'কাস্টম' : 'Custom'}</span>
                  </span>
                )}
              </div>

              {/* Image Preview Box (Clean isolated view) */}
              <div className="relative w-full aspect-video bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 flex items-center justify-center p-2 group-hover:border-emerald-500/40 transition">
                <img
                  src={item.currentImageUrl}
                  alt={item.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = item.defaultImageUrl;
                  }}
                />
              </div>

              {/* Title & Hierarchy Breadcrumbs */}
              <div>
                <h4 className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">
                  {language === 'bn' ? item.nameBn : item.nameEn}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold line-clamp-1">
                  {item.nameEn}
                </p>

                {/* Path */}
                <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                  <span>{item.parentCatNameBn}</span>
                  {item.subCatNameBn && (
                    <>
                      <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{item.subCatNameBn}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal(item)}
                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ছবি আপলোড / পরিবর্তন' : 'Edit / Upload'}</span>
              </button>

              {item.isCustom && (
                <button
                  type="button"
                  title={language === 'bn' ? 'ডিফল্ট ছবিতে ফিরুন' : 'Reset to default'}
                  onClick={() => handleResetSingleImage(item)}
                  className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/60 dark:text-slate-300 dark:hover:text-red-400 rounded-xl transition cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCatalog.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-black text-sm text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'কোনো ক্যাটাগরি বা ছবি পাওয়া যায়নি' : 'No categories or images found'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'bn'
              ? 'অনুগ্রহ করে ভিন্ন কোনো নাম দিয়ে খুঁজুন বা ফিল্টার পরিবর্তন করুন।'
              : 'Try searching with another keyword or adjust your filters.'}
          </p>
        </div>
      )}

      {/* Edit / Upload Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/40">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                  Update Category Visual Asset
                </span>
                <h3 className="font-black text-base">
                  {language === 'bn' ? editingItem.nameBn : editingItem.nameEn} ({editingItem.nameEn})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveImage} className="p-6 space-y-5">
              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Live Preview Box */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {language === 'bn' ? '১. লাইভ ইমেজ প্রিভিউ' : '1. Live Image Preview'}
                </label>
                <div className="w-full h-44 bg-slate-100 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-3 overflow-hidden relative">
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                      onError={() => {
                        setUploadError(
                          language === 'bn'
                            ? 'ছবিটি লোড করা সম্ভব হচ্ছে না। অনুগ্রহ করে সঠিক URL বা ফাইল দিন।'
                            : 'Unable to render image. Check the URL or upload a file.'
                        );
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-400 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                      <p className="text-xs font-bold">
                        {language === 'bn' ? 'কোনো ছবি নির্বাচন করা হয়নি' : 'No image selected'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Option */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {language === 'bn'
                    ? '২. কম্পিউটার / ডিভাইস থেকে ছবি আপলোড করুন'
                    : '2. Upload Image File from Device'}
                </label>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'ফাইল সিলেক্ট করুন (PNG, JPG, WebP - Max 4MB)' : 'Select Image (PNG, JPG, WebP - Max 4MB)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct Image URL Option */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {language === 'bn' ? '৩. অথবা সরাসরি ছবির লিংক (URL) দিন' : '3. Or Enter Direct Image URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputImageUrl}
                    onChange={(e) => {
                      setInputImageUrl(e.target.value);
                      setPreviewImageUrl(e.target.value);
                      setUploadError('');
                    }}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImageUrl(inputImageUrl)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    {language === 'bn' ? 'চেক' : 'Check'}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black hover:bg-slate-200 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সংরক্ষণ ও প্রয়োগ করুন' : 'Save & Apply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
