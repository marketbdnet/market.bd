import React, { useState, useEffect } from 'react';
import ReactPullToRefresh from 'react-pull-to-refresh';
import { useMarket } from '../context/MarketContext';
import { CATEGORIES, BANGLADESH_DIVISIONS, CONDITION_OPTIONS } from '../data/bangladeshData';
import { ProductCard } from '../components/Product/ProductCard';
import { Product } from '../types';
import { isProductPublicActive } from '../utils/productStatus';
import { SEOHelmet } from '../components/SEO/SEOHelmet';
import { CategoryHierarchyView } from '../components/Category/CategoryHierarchyView';
import {
  Filter,
  Grid,
  List,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  Zap,
  MapPin,
  ChevronDown,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Layers
} from 'lucide-react';

// Comprehensive synonym mapping for Bangla & English search terms
const QUERY_CATEGORY_SYNONYMS: Record<string, string[]> = {
  mobiles: ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones', 'à¦®à§‹à¦¬à¦¾à¦‡à¦²', 'à¦«à§‹à¦¨', 'à¦¸à§à¦®à¦¾à¦°à§à¦Ÿà¦«à§‹à¦¨', 'à¦—à§à¦¯à¦¾à¦œà§‡à¦Ÿ', 'à¦†à¦‡à¦«à§‹à¦¨', 'iphone', 'samsung', 'vivo', 'xiaomi', 'realme', 'oppo', 'à¦¬à¦¾à¦Ÿà¦¨ à¦«à§‹à¦¨', 'à¦Ÿà§à¦¯à¦¾à¦¬à¦²à§‡à¦Ÿ', 'à¦Ÿà§à¦¯à¦¾à¦¬', 'à¦¸à§à¦¯à¦¾à¦®à¦¸à¦¾à¦‚', 'à¦­à¦¿à¦­à§‹', 'à¦¶à¦¾à¦“à¦®à¦¿', 'à¦°à§‡à¦¡à¦®à¦¿'],
  computers: ['computer', 'computers', 'laptop', 'laptops', 'pc', 'desktop', 'à¦•à¦®à§à¦ªà¦¿à¦‰à¦Ÿà¦¾à¦°', 'à¦²à§à¦¯à¦¾à¦ªà¦Ÿà¦ª', 'à¦ªà¦¿à¦¸à¦¿', 'à¦®à¦¨à¦¿à¦Ÿà¦°', 'à¦ªà§à¦°à¦¸à§‡à¦¸à¦°', 'à¦†à¦‡à¦Ÿà¦¿', 'à¦®à§à¦¯à¦¾à¦•à¦¬à§à¦•', 'macbook', 'à¦¡à§‡à¦¸à§à¦•à¦Ÿà¦ª'],
  electronics: ['electronics', 'tv', 'fridge', 'ac', 'refrigerator', 'washing machine', 'à¦‡à¦²à§‡à¦•à¦Ÿà§à¦°à¦¨à¦¿à¦•à§à¦¸', 'à¦Ÿà¦¿à¦­à¦¿', 'à¦«à§à¦°à¦¿à¦œ', 'à¦à¦¸à¦¿', 'à¦°à§‡à¦«à§à¦°à¦¿à¦œà¦¾à¦°à§‡à¦Ÿà¦°'],
  vehicles: ['vehicle', 'vehicles', 'car', 'cars', 'bike', 'bikes', 'motorcycle', 'scooter', 'à¦—à¦¾à§œà¦¿', 'à¦—à¦¾à¦¡à¦¼à¦¿', 'à¦¬à¦¾à¦‡à¦•', 'à¦®à§‹à¦Ÿà¦°à¦¸à¦¾à¦‡à¦•à§‡à¦²', 'à¦¸à§à¦•à§à¦Ÿà¦¾à¦°', 'à¦¯à¦¾à¦¨à¦¬à¦¾à¦¹à¦¨', 'à¦°à§Ÿà§à¦¯à¦¾à¦² à¦à¦¨à¦¾à¦«à¦¿à¦²à§à¦¡', 'à¦¬à¦¾à¦‡à¦¸à¦¾à¦‡à¦•à§‡à¦²', 'à¦¸à¦¾à¦‡à¦•à§‡à¦²', 'à¦ªà§à¦°à¦¾à¦‡à¦­à§‡à¦Ÿ à¦•à¦¾à¦°', 'à¦ªà§à¦°à¦¾à¦‡à¦­à§‡à¦Ÿà¦•à¦¾à¦°', 'à¦Ÿà¦¯à¦¼à§‹à¦Ÿà¦¾', 'toyota', 'corolla'],
  property: ['property', 'properties', 'flat', 'flats', 'apartment', 'house', 'land', 'plot', 'à¦«à§à¦²à§à¦¯à¦¾à¦Ÿ', 'à¦¬à¦¾à§œà¦¿', 'à¦¬à¦¾à¦¸à¦¾', 'à¦œà¦®à¦¿', 'à¦ªà§à¦²à¦Ÿ', 'à¦ªà§à¦°à¦ªà¦¾à¦°à§à¦Ÿà¦¿', 'à¦à¦ªà¦¾à¦°à§à¦Ÿà¦®à§‡à¦¨à§à¦Ÿ'],
  home_furniture: ['living', 'furniture', 'sofa', 'bed', 'table', 'chair', 'à¦†à¦¸à¦¬à¦¾à¦¬à¦ªà¦¤à§à¦°', 'à¦¸à§‹à¦«à¦¾', 'à¦–à¦¾à¦Ÿ', 'à¦Ÿà§‡à¦¬à¦¿à¦²', 'à¦šà§‡à¦¯à¦¼à¦¾à¦°', 'à¦«à¦¾à¦°à§à¦¨à¦¿à¦šà¦¾à¦°', 'à¦˜à¦° à¦“ à¦†à¦¸à¦¬à¦¾à¦¬', 'home_furniture'],
  fashion: ['fashion', 'clothes', 'dress', 'shoes', 'sneakers', 'watch', 'à¦œà§à¦¤à¦¾', 'à¦˜à§œà¦¿', 'à¦ªà§‹à¦¶à¦¾à¦•', 'à¦¶à¦¾à§œà¦¿', 'à¦ªà¦¾à¦žà§à¦œà¦¾à¦¬à¦¿', 'à¦«à§à¦¯à¦¾à¦¶à¦¨', 'à¦¬à§à¦¯à¦¾à¦—'],
  health_beauty: ['health', 'beauty', 'perfume', 'à¦•à§‹à¦¸à¦®à§‡à¦Ÿà¦¿à¦•à¦¸', 'à¦ªà¦¾à¦°à¦«à¦¿à¦‰à¦®', 'à¦¹à§‡à¦²à¦¥', 'à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦“ à¦¸à§Œà¦¨à§à¦¦à¦°à§à¦¯', 'health_beauty'],
  baby_kids: ['baby', 'kids', 'child', 'children', 'stroller', 'toy', 'toys', 'à¦¶à¦¿à¦¶à§ à¦¸à¦¾à¦®à¦—à§à¦°à§€', 'à¦–à§‡à¦²à¦¨à¦¾', 'baby_kids'],
  books_sports: ['book', 'books', 'sports', 'cricket', 'bat', 'stationery', 'à¦¬à¦‡', 'à¦¬à¦‡à¦ªà¦¤à§à¦°', 'à¦¸à§à¦Ÿà§‡à¦¶à¦¨à¦¾à¦°à¦¿', 'à¦–à§‡à¦²à¦¾à¦§à§à¦²à¦¾', 'à¦¬à¦‡ à¦“ à¦–à§‡à¦²à¦¾à¦§à§à¦²à¦¾', 'books_sports'],
  animal_pets: ['pet', 'pets', 'cat', 'dog', 'bird', 'cow', 'qurbani', 'à¦ªà¦¶à§', 'à¦ªà¦¾à¦–à¦¿', 'à¦¬à¦¿à§œà¦¾à¦²', 'à¦•à§à¦•à§à¦°', 'à¦ªà§‹à¦·à¦¾ à¦ªà§à¦°à¦¾à¦£à§€', 'à¦ªà¦¶à§à¦ªà¦¾à¦–à¦¿', 'animal_pets'],
  agriculture: ['agriculture', 'agri', 'farm', 'tractor', 'krishi', 'à¦•à§ƒà¦·à¦¿', 'à¦–à¦¾à¦®à¦¾à¦°', 'à¦Ÿà§à¦°à¦¾à¦•à§à¦Ÿà¦°', 'à¦¬à§€à¦œ'],
  business_equipment: ['business', 'equipment', 'machinery', 'espresso', 'coffee', 'à¦¬à§à¦¯à¦¬à¦¸à¦¾à¦° à¦¸à¦°à¦žà§à¦œà¦¾à¦®', 'à¦®à§‡à¦¶à¦¿à¦¨à¦¾à¦°à¦¿'],
  services: ['service', 'services', 'repair', 'servicing', 'à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸', 'à¦¸à§‡à¦¬à¦¾', 'à¦®à§‡à¦°à¦¾à¦®à¦¤'],
  jobs: ['job', 'jobs', 'developer', 'hiring', 'salary', 'à¦šà¦¾à¦•à¦°à¦¿', 'à¦¨à¦¿à¦¯à¦¼à§‹à¦—'],
  education_courses: ['education', 'course', 'courses', 'coaching', 'training', 'IELTS', 'MERN', 'à¦¶à¦¿à¦•à§à¦·à¦¾ à¦“ à¦•à§‹à¦°à§à¦¸', 'à¦•à§‹à¦°à§à¦¸'],
  travel_tours: ['travel', 'tour', 'tours', 'tourism', 'sajek', 'resort', 'à¦­à§à¦°à¦®à¦£ à¦“ à¦Ÿà§à¦¯à§à¦°', 'à¦Ÿà§à¦¯à§à¦°', 'à¦­à§à¦°à¦®à¦£'],
  food_restaurants: ['food', 'restaurant', 'honey', 'organic', 'biryani', 'à¦–à¦¾à¦¬à¦¾à¦° à¦“ à¦°à§‡à¦¸à§à¦Ÿà§à¦°à§‡à¦¨à§à¦Ÿ', 'à¦–à¦¾à¦¬à¦¾à¦°', 'à¦®à¦§à§'],
  events_tickets: ['event', 'events', 'ticket', 'tickets', 'concert', 'pass', 'à¦‡à¦­à§‡à¦¨à§à¦Ÿ à¦“ à¦Ÿà¦¿à¦•à§‡à¦Ÿ', 'à¦Ÿà¦¿à¦•à¦¿à¦Ÿ', 'à¦•à¦¨à¦¸à¦¾à¦°à§à¦Ÿ'],
  others: ['others', 'antique', 'antiques', 'vintage', 'à¦…à¦¨à§à¦¯à¦¾à¦¨à§à¦¯', 'à¦…à§à¦¯à¦¾à¦¨à§à¦Ÿà¦¿à¦•']
};

// Flexible category match helper
const isCategoryMatch = (productCategory?: string, filterCategory?: string): boolean => {
  if (!productCategory || !filterCategory) return false;
  const targetLower = String(filterCategory).trim().toLowerCase();
  const pLower = String(productCategory).trim().toLowerCase();

  if (pLower === targetLower) return true;

  const catObj = CATEGORIES.find(c => 
    (c.id && c.id.toLowerCase() === targetLower) || 
    (c.nameEn && c.nameEn.toLowerCase() === targetLower) || 
    (c.nameBn && c.nameBn.toLowerCase() === targetLower)
  );

  const pCatObj = CATEGORIES.find(c => 
    (c.id && c.id.toLowerCase() === pLower) || 
    (c.nameEn && c.nameEn.toLowerCase() === pLower) || 
    (c.nameBn && c.nameBn.toLowerCase() === pLower)
  );

  if (catObj && pCatObj) {
    return catObj.id === pCatObj.id;
  }
  if (catObj) {
    return (
      pLower === (catObj.id || '').toLowerCase() ||
      pLower === (catObj.nameEn || '').toLowerCase() ||
      pLower === (catObj.nameBn || '').toLowerCase()
    );
  }
  return false;
};

// Helper for exact or word-boundary text matching to avoid false positives (e.g., 'car' matching 'charger' or 'scratches')
const isWordInText = (term?: string, text?: string) => {
  if (!text || !term) return false;
  const lowerText = String(text).toLowerCase();
  const lowerTerm = String(term).toLowerCase().trim();
  if (!lowerTerm) return false;

  // For short alphanumeric terms (1-3 chars like 'car', 'ac', 'tv', 'pc'), require word boundaries
  if (/^[a-z0-9]{1,3}$/i.test(lowerTerm)) {
    const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s|[,./\\-()])${escaped}(?:$|\\s|[,./\\-()])`, 'i');
    return regex.test(lowerText);
  }

  return lowerText.includes(lowerTerm);
};

// Helper to get location names in En & Bn for a given product
const getLocationNamesForProduct = (p: Product) => {
  let divEn = p?.location?.division || '';
  let divBn = '';
  let distEn = p?.location?.district || '';
  let distBn = '';
  let thanaEn = p?.location?.thana || '';
  let thanaBn = '';

  const divObj = BANGLADESH_DIVISIONS.find(
    d => (d.id && d.id.toLowerCase() === String(divEn).toLowerCase()) ||
         (d.nameEn && d.nameEn.toLowerCase() === String(divEn).toLowerCase()) ||
         d.nameBn === divEn
  );
  if (divObj) {
    divEn = divObj.nameEn || divEn;
    divBn = divObj.nameBn || '';
    if (distEn && Array.isArray(divObj.districts)) {
      const distObj = divObj.districts.find(
        dt => (dt.id && dt.id.toLowerCase() === String(distEn).toLowerCase()) ||
              (dt.nameEn && dt.nameEn.toLowerCase() === String(distEn).toLowerCase()) ||
              dt.nameBn === distEn
      );
      if (distObj) {
        distEn = distObj.nameEn || distEn;
        distBn = distObj.nameBn || '';
        if (thanaEn && Array.isArray(distObj.thanas)) {
          const thanaObj = distObj.thanas.find(
            th => (th.id && th.id.toLowerCase() === String(thanaEn).toLowerCase()) ||
                  (th.nameEn && th.nameEn.toLowerCase() === String(thanaEn).toLowerCase()) ||
                  th.nameBn === thanaEn
          );
          if (thanaObj) {
            thanaEn = thanaObj.nameEn || thanaEn;
            thanaBn = thanaObj.nameBn || '';
          }
        }
      }
    }
  }

  return { divEn, divBn, distEn, distBn, thanaEn, thanaBn };
};

export const SearchPage: React.FC = () => {
  const {
    language,
    products,
    refreshProducts,
    filters,
    setFilters,
    resetFilters,
    selectedLocation,
    goBack,
    categories
  } = useMarket();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      await new Promise(r => setTimeout(r, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter products & calculate search match score
  const qRaw = (filters.searchQuery || '').trim().toLowerCase();

  // Find if qRaw matches a category or synonym
  let queryMatchedCategory: string | null = null;
  if (qRaw.length > 0) {
    for (const [catId, synonyms] of Object.entries(QUERY_CATEGORY_SYNONYMS)) {
      if (synonyms.some(s => s.toLowerCase() === qRaw || (qRaw.length >= 3 && isWordInText(qRaw, s)))) {
        queryMatchedCategory = catId;
        break;
      }
    }
  }

  // Determine active location rules
  const activeDivision = filters.division || (selectedLocation.division !== 'All Bangladesh' ? selectedLocation.division : '');
  const activeDistrict = filters.district || selectedLocation.district || '';
  const activeThana = filters.thana || selectedLocation.thana || '';

  const scoredProducts: { product: Product; score: number }[] = [];

  products.forEach(p => {
    // Only show active or unflagged approved products publicly
    if (!isProductPublicActive(p)) return;

    // Category match
    if (filters.category && !queryMatchedCategory) {
      if (!isCategoryMatch(p.category, filters.category)) return;
    } else if (filters.category && queryMatchedCategory) {
      if (!isCategoryMatch(p.category, queryMatchedCategory) && !isCategoryMatch(p.category, filters.category)) return;
    }

    // Subcategory match
    if (filters.subCategory) {
      const targetSub = filters.subCategory.toLowerCase();
      const pSub = (p.subCategory || '').toLowerCase();
      const subMatch = (
        pSub === targetSub ||
        (targetSub === 'motorcycles_scooters' && (pSub === 'motorcycles' || pSub === 'scooters' || pSub === 'motorcycles_scooters')) ||
        (targetSub === 'buses_microbuses' && (pSub === 'buses' || pSub === 'microbuses' || pSub === 'buses_microbuses')) ||
        (targetSub === 'vehicle_parts_accessories' && (pSub === 'spare_parts' || pSub === 'tyres_wheels' || pSub === 'vehicle_acc' || pSub === 'vehicle_parts_accessories')) ||
        (targetSub === 'trucks_heavy_vehicles' && (pSub === 'trucks' || pSub === 'trucks_heavy_vehicles')) ||
        (targetSub === 'three_wheelers' && (pSub === 'auto_rickshaws' || pSub === 'three_wheelers')) ||
        (targetSub === 'water_transport' && (pSub === 'boats' || pSub === 'water_transport'))
      );
      if (!subMatch) return;
    }

    // Second-level Category match
    if (filters.secondLevelCategory) {
      const targetSL = filters.secondLevelCategory.toLowerCase();
      const pSL = (p.secondLevelCategory || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();
      const pModel = (p.model || '').toLowerCase();
      const pTitle = (p.title || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();

      const slMatch = (
        pSL === targetSL ||
        pBrand === targetSL ||
        pBrand.includes(targetSL) ||
        pModel.includes(targetSL) ||
        pTitle.includes(targetSL) ||
        pDesc.includes(targetSL)
      );
      if (!slMatch) return;
    }

    // Location Division match (applied unless overridden by search query containing location)
    const locNames = getLocationNamesForProduct(p);
    if (activeDivision && !qRaw) {
      const matchDiv =
        p.location.division.toLowerCase() === activeDivision.toLowerCase() ||
        locNames.divEn.toLowerCase() === activeDivision.toLowerCase() ||
        locNames.divBn === activeDivision;
      if (!matchDiv) return;
    }

    // Location District match
    if (activeDistrict && !qRaw) {
      const matchDist =
        (p.location.district && p.location.district.toLowerCase() === activeDistrict.toLowerCase()) ||
        locNames.distEn.toLowerCase() === activeDistrict.toLowerCase() ||
        locNames.distBn === activeDistrict;
      if (!matchDist) return;
    }

    // Location Thana match
    if (activeThana && !qRaw) {
      const matchThana =
        (p.location.thana && p.location.thana.toLowerCase() === activeThana.toLowerCase()) ||
        locNames.thanaEn.toLowerCase() === activeThana.toLowerCase() ||
        locNames.thanaBn === activeThana;
      if (!matchThana) return;
    }

    // Price match
    if (filters.minPrice !== '' && p.price < Number(filters.minPrice)) return;
    if (filters.maxPrice !== '' && p.price > Number(filters.maxPrice)) return;
    // Condition match
    if (filters.condition.length > 0 && !filters.condition.includes(p.condition)) return;
    // Verified seller
    if (filters.isVerifiedOnly && !p.seller?.isVerified) return;
    // Negotiable
    if (filters.isNegotiableOnly && !p.isNegotiable) return;
    // Delivery
    if (filters.isDeliveryOnly && !p.isDeliveryAvailable) return;

    let score = 100; // Base score when no search query

    if (qRaw.length > 0) {
      const q = qRaw;
      score = 0;

      // Tokenize search query for multi-word queries e.g. "iPhone Mirpur" or "à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦šà¦Ÿà§à¦Ÿà¦—à§à¦°à¦¾à¦®"
      const tokens = q.split(/\s+/).filter(t => t.length > 0);

      tokens.forEach(token => {
        // 1. Location match
        const isLocMatch =
          isWordInText(token, locNames.divEn) ||
          isWordInText(token, locNames.divBn) ||
          isWordInText(token, locNames.distEn) ||
          isWordInText(token, locNames.distBn) ||
          isWordInText(token, locNames.thanaEn) ||
          isWordInText(token, locNames.thanaBn) ||
          isWordInText(token, p.location.division) ||
          isWordInText(token, p.location.district || '') ||
          isWordInText(token, p.location.thana || '');

        if (isLocMatch) {
          score += 120;
        }

        // 2. Title Match (English & Bangla)
        const isTitleMatch = isWordInText(token, p.title) || (p.titleBn && isWordInText(token, p.titleBn));
        if (isTitleMatch) {
          score += 150;
        }

        // 3. Brand & Model Match
        const isBrandMatch = p.brand ? isWordInText(token, p.brand) : false;
        const isModelMatch = p.model ? isWordInText(token, p.model) : false;
        if (isModelMatch) score += 130;
        if (isBrandMatch) score += 110;

        // 4. Seller Name Match
        const isSellerMatch = p.seller && p.seller.name ? isWordInText(token, p.seller.name) : false;
        if (isSellerMatch) score += 90;

        // 5. Category Metadata Match
        const matchedCat = CATEGORIES.find(c =>
          (c.id && c.id.toLowerCase() === token) ||
          (c.nameEn && c.nameEn.toLowerCase().includes(token)) ||
          (c.nameBn && c.nameBn.toLowerCase().includes(token)) ||
          (Array.isArray(c.subcategories) && c.subcategories.some((s: any) => {
            if (!s) return false;
            const sId = typeof s === 'string' ? (s as string).toLowerCase() : String(s?.id || '').toLowerCase();
            const sEn = typeof s === 'string' ? (s as string).toLowerCase() : String(s?.nameEn || '').toLowerCase();
            const sBn = typeof s === 'string' ? (s as string) : String(s?.nameBn || '');
            return sId === token || sEn.includes(token) || sBn.includes(token);
          }))
        );
        const isCategoryMeta = matchedCat && isCategoryMatch(p.category, matchedCat.id);
        if (isCategoryMeta) score += 80;

        // 6. Direct Synonym / Category Match
        if (queryMatchedCategory && isCategoryMatch(p.category, queryMatchedCategory)) {
          score += 70;
        }

        // 7. Description Match
        const isDescMatch = isWordInText(token, p.description) || (p.descriptionBn && isWordInText(token, p.descriptionBn));
        if (isDescMatch) score += 40;
      });

      // Full query match bonus
      if (isWordInText(q, p.title) || (p.titleBn && isWordInText(q, p.titleBn))) {
        score += 100;
      }

      // 8. Related Product Fallback:
      // If query matched a category/synonym, but product title/brand didn't match directly,
      // give it a small score (+15) so it appears AT THE END as a related product!
      if (score === 0 && queryMatchedCategory && isCategoryMatch(p.category, queryMatchedCategory)) {
        score = 15;
      }

      if (score === 0) return; // Exclude non-matching products
    }

    scoredProducts.push({ product: p, score });
  });

  // Sorting
  const sortedProducts = [...scoredProducts].sort((a, b) => {
    if (filters.sortBy === 'price_low') return a.product.price - b.product.price;
    if (filters.sortBy === 'price_high') return b.product.price - a.product.price;
    if (filters.sortBy === 'popular') return b.product.views - a.product.views;
    // Default sorting: Relevance score descending!
    return b.score - a.score;
  }).map(sp => sp.product);

  const activeCategoryObj = (categories || []).find(c => c.id === filters.category);

  // Division & District objects for location dropdown cascades
  const selectedDivisionObj = BANGLADESH_DIVISIONS.find(
    d => d.id === filters.division || (d.nameEn && filters.division && d.nameEn.toLowerCase() === String(filters.division).toLowerCase()) || d.nameBn === filters.division
  );
  const selectedDistrictObj = selectedDivisionObj?.districts?.find(
    dt => dt.id === filters.district || (dt.nameEn && filters.district && dt.nameEn.toLowerCase() === String(filters.district).toLowerCase()) || dt.nameBn === filters.district
  );

  // Render Filter Sidebar Content
  const renderFilterSidebar = () => (
    <div className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-pink-500 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span>{language === 'bn' ? 'à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦¸à¦®à§‚à¦¹' : 'Filter Products'}</span>
        </h3>

        <button
          onClick={resetFilters}
          className="text-[11px] text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          {language === 'bn' ? 'à¦°à¦¿à¦¸à§‡à¦Ÿ' : 'Reset'}
        </button>
      </div>

      {/* Search Query Filter Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
          {language === 'bn' ? 'à¦•à§€à¦“à§Ÿà¦¾à¦°à§à¦¡ à¦¬à¦¾ à¦ªà¦¨à§à¦¯à§‡à¦° à¦¨à¦¾à¦®' : 'Search Keyword / Product'}
        </label>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={language === 'bn' ? 'à¦¯à§‡à¦®à¦¨: à¦®à§‹à¦¬à¦¾à¦‡à¦², à¦¬à¦¾à¦‡à¦•, à¦®à¦¿à¦°à¦ªà§à¦°...' : 'e.g. mobile, bike, Mirpur...'}
            className="w-full pl-8 pr-7 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2 p-1 text-gray-400 hover:text-red-500 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category, Subcategory & Second-Level Category Filters */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
            {language === 'bn' ? 'à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿' : 'Category'}
          </label>
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value, subCategory: '', secondLevelCategory: '' }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
          >
            <option value="">{language === 'bn' ? 'à¦¸à¦¬ à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿' : 'All Categories'}</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.nameBn : c.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory dropdown if activeCategoryObj exists */}
        {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
              {language === 'bn' ? 'à¦¸à¦¾à¦¬-à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿' : 'Sub-Category'}
            </label>
            <select
              value={filters.subCategory}
              onChange={e => setFilters(prev => ({ ...prev, subCategory: e.target.value, secondLevelCategory: '' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
            >
              <option value="">{language === 'bn' ? 'à¦¸à¦¬ à¦¸à¦¾à¦¬-à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿' : 'All Sub-Categories'}</option>
              {activeCategoryObj.subcategories.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {language === 'bn' ? sc.nameBn : sc.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Second-Level Category dropdown (Brands / Types) if selected subcategory has them */}
        {activeCategoryObj && filters.subCategory && (() => {
          const activeSub = activeCategoryObj.subcategories?.find(s => s.id === filters.subCategory);
          if (activeSub && activeSub.secondLevelCategories && activeSub.secondLevelCategories.length > 0) {
            return (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
                  {language === 'bn' ? 'à¦¬à§à¦°à§à¦¯à¦¾à¦¨à§à¦¡ / à¦§à¦°à¦£ (à§¨à¦¯à¦¼ à¦¸à§à¦¤à¦°)' : 'Brand / Type (2nd Level)'}
                </label>
                <select
                  value={filters.secondLevelCategory || ''}
                  onChange={e => setFilters(prev => ({ ...prev, secondLevelCategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-pink-400 dark:border-pink-600 rounded-xl text-xs bg-pink-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-pink-600 cursor-pointer"
                >
                  <option value="">{language === 'bn' ? 'à¦¸à¦¬ à¦¬à§à¦°à§à¦¯à¦¾à¦¨à§à¦¡ à¦“ à¦§à¦°à¦£' : 'All Brands & Types'}</option>
                  {activeSub.secondLevelCategories.map(sl => (
                    <option key={sl.id} value={sl.id}>
                      {language === 'bn' ? sl.nameBn : sl.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Location Filter: Division, District, Thana */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
        <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
          <span>{language === 'bn' ? 'à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨ / à¦à¦²à¦¾à¦•à¦¾ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨' : 'Location Filter'}</span>
        </label>

        {/* Division */}
        <select
          value={filters.division}
          onChange={e => setFilters(prev => ({ ...prev, division: e.target.value, district: '', thana: '' }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
        >
          <option value="">{language === 'bn' ? 'à¦¸à¦¬ à¦¬à¦¿à¦­à¦¾à¦— (All Bangladesh)' : 'All Divisions'}</option>
          {BANGLADESH_DIVISIONS.map(div => (
            <option key={div.id} value={div.nameEn}>
              {language === 'bn' ? div.nameBn : div.nameEn}
            </option>
          ))}
        </select>

        {/* District */}
        {selectedDivisionObj && (
          <select
            value={filters.district}
            onChange={e => setFilters(prev => ({ ...prev, district: e.target.value, thana: '' }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
          >
            <option value="">{language === 'bn' ? 'à¦¸à¦¬ à¦œà§‡à¦²à¦¾' : 'All Districts'}</option>
            {selectedDivisionObj.districts.map(dist => (
              <option key={dist.id} value={dist.nameEn}>
                {language === 'bn' ? dist.nameBn : dist.nameEn}
              </option>
            ))}
          </select>
        )}

        {/* Thana */}
        {selectedDistrictObj && selectedDistrictObj.thanas.length > 0 && (
          <select
            value={filters.thana}
            onChange={e => setFilters(prev => ({ ...prev, thana: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
          >
            <option value="">{language === 'bn' ? 'à¦¸à¦¬ à¦¥à¦¾à¦¨à¦¾ / à¦à¦²à¦¾à¦•à¦¾' : 'All Thanas / Areas'}</option>
            {selectedDistrictObj.thanas.map(th => (
              <option key={th.id} value={th.nameEn}>
                {language === 'bn' ? th.nameBn : th.nameEn}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Price Range */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
        <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
          {language === 'bn' ? 'à¦ªà§à¦°à¦¾à¦‡à¦¸ à¦°à§‡à¦žà§à¦œ (à¦Ÿà¦¾à¦•à¦¾ à§³)' : 'Price Range (BDT)'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={language === 'bn' ? 'à¦¸à¦°à§à¦¬à¦¨à¦¿à¦®à§à¦¨' : 'Min'}
            value={filters.minPrice}
            onChange={e => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : '' }))}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-600"
          />
          <input
            type="number"
            placeholder={language === 'bn' ? 'à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š' : 'Max'}
            value={filters.maxPrice}
            onChange={e => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : '' }))}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-600"
          />
        </div>
      </div>

      {/* Condition Checkboxes */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
        <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
          {language === 'bn' ? 'à¦•à¦¨à§à¦¡à¦¿à¦¶à¦¨' : 'Condition'}
        </label>
        <div className="space-y-1.5 text-xs text-gray-700 dark:text-slate-300">
          {CONDITION_OPTIONS.map(opt => {
            const isChecked = filters.condition.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => {
                    const val = opt.value;
                    setFilters(prev => ({
                      ...prev,
                      condition: isChecked
                        ? prev.condition.filter(c => c !== val)
                        : [...prev.condition, val]
                    }));
                  }}
                  className="rounded text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                />
                <span>{language === 'bn' ? opt.labelBn : opt.labelEn}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs font-medium text-gray-700 dark:text-slate-300">
        <label className="flex items-center justify-between cursor-pointer">
          <span>{language === 'bn' ? 'à¦­à§‡à¦°à¦¿à¦«à¦¾à¦‡à¦¡ à¦¬à¦¿à¦•à§à¦°à§‡à¦¤à¦¾' : 'Verified Sellers Only'}</span>
          <input
            type="checkbox"
            checked={filters.isVerifiedOnly}
            onChange={e => setFilters(prev => ({ ...prev, isVerifiedOnly: e.target.checked }))}
            className="rounded text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span>{language === 'bn' ? 'à¦¦à¦¾à¦® à¦†à¦²à§‹à¦šà¦¨à¦¾ à¦¸à¦¾à¦ªà§‡à¦•à§à¦·' : 'Negotiable Only'}</span>
          <input
            type="checkbox"
            checked={filters.isNegotiableOnly}
            onChange={e => setFilters(prev => ({ ...prev, isNegotiableOnly: e.target.checked }))}
            className="rounded text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span>{language === 'bn' ? 'à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿ à¦¸à§à¦¬à¦¿à¦§à¦¾' : 'Delivery Available'}</span>
          <input
            type="checkbox"
            checked={filters.isDeliveryOnly}
            onChange={e => setFilters(prev => ({ ...prev, isDeliveryOnly: e.target.checked }))}
            className="rounded text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  return (
    <ReactPullToRefresh
      onRefresh={handleRefresh}
      className="ptr-wrapper w-full"
      icon={
        <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-pink-200 dark:border-pink-900/50">
          <RefreshCw className="w-4 h-4 text-pink-600 dark:text-pink-400 genericon" />
          <span>{language === 'bn' ? 'à¦Ÿà§‡à¦¨à§‡ à¦°à¦¿à¦«à§à¦°à§‡à¦¶ à¦•à¦°à§à¦¨' : 'Pull down to refresh'}</span>
        </div>
      }
      loading={
        <div className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-pink-300 dark:border-pink-800 animate-pulse">
          <RefreshCw className="w-4 h-4 text-pink-600 dark:text-pink-400 animate-spin" />
          <span>{language === 'bn' ? 'à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¹à¦šà§à¦›à§‡...' : 'Updating listings...'}</span>
        </div>
      }
    >
      <div className="py-6 space-y-5">
        <SEOHelmet category={filters.category} />

        {/* Multi-Level Dynamic Category Hierarchy & Breadcrumb Navigation */}
        <CategoryHierarchyView />

        {/* Top Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>
                {activeCategoryObj
                  ? (language === 'bn' ? activeCategoryObj.nameBn : activeCategoryObj.nameEn)
                  : (language === 'bn' ? 'à¦¸à¦¬ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨' : 'All Listings')}
              </span>
              <span className="text-xs bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-300 font-bold px-2.5 py-0.5 rounded-full border border-pink-300 dark:border-pink-800">
                {sortedProducts.length} {language === 'bn' ? 'à¦Ÿà¦¿ à¦†à¦‡à¦Ÿà§‡à¦®' : 'items'}
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-600" />
              <span>
                {activeThana || activeDistrict || activeDivision || (selectedLocation.division !== 'All Bangladesh' ? selectedLocation.division : (language === 'bn' ? 'à¦¸à¦®à¦—à§à¦° à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶' : 'All Bangladesh'))}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Manual Refresh / Force Sync Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-pink-300 dark:border-pink-800 transition cursor-pointer active:scale-95 ${
                isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title={language === 'bn' ? 'à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦°à¦¿à¦«à§à¦°à§‡à¦¶ à¦•à¦°à§à¦¨' : 'Refresh Listings'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-pink-600 dark:text-pink-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing 
                  ? (language === 'bn' ? 'à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¹à¦šà§à¦›à§‡...' : 'Updating...') 
                  : (language === 'bn' ? 'à¦°à¦¿à¦«à§à¦°à§‡à¦¶' : 'Refresh')}
              </span>
            </button>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{language === 'bn' ? 'à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦°' : 'Filter'}</span>
            </button>

            {/* Sorting */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{language === 'bn' ? 'à¦¸à¦¾à¦œà¦¾à¦¨:' : 'Sort:'}</span>
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-gray-50 dark:bg-slate-800 border-2 border-pink-500 text-gray-800 dark:text-slate-100 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-pink-600 cursor-pointer"
              >
                <option value="latest">{language === 'bn' ? 'à¦¸à¦°à§à¦¬à¦¶à§‡à¦· à¦ªà§à¦°à¦•à¦¾à¦¶à¦¿à¦¤' : 'Latest'}</option>
                <option value="price_low">{language === 'bn' ? 'à¦•à¦® à¦¦à¦¾à¦® à¦¥à§‡à¦•à§‡ à¦¬à§‡à¦¶à¦¿' : 'Price: Low to High'}</option>
                <option value="price_high">{language === 'bn' ? 'à¦¬à§‡à¦¶à¦¿ à¦¦à¦¾à¦® à¦¥à§‡à¦•à§‡ à¦•à¦®' : 'Price: High to Low'}</option>
                <option value="popular">{language === 'bn' ? 'à¦¸à¦¬à¦šà§‡à¦¯à¦¼à§‡ à¦œà¦¨à¦ªà§à¦°à¦¿à§Ÿ' : 'Most Popular'}</option>
              </select>
            </div>

            {/* Grid / List Layout toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-pink-300 dark:border-pink-800">
              <button
                onClick={() => setLayoutView('grid')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  layoutView === 'grid' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'bn' ? 'à¦—à§à¦°à¦¿à¦¡ à¦­à¦¿à¦‰' : 'Grid View'}</span>
              </button>
              <button
                onClick={() => setLayoutView('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  layoutView === 'list' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Up-Down / List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'bn' ? 'à¦‰à¦ªà¦°à§‡-à¦¨à¦¿à¦šà§‡ à¦­à¦¿à¦‰' : 'List View'}</span>
              </button>
            </div>
          </div>
        </div>

      {/* Mobile Filter Drawer / Collapsible */}
      {showMobileFilter && (
        <div className="lg:hidden bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border-2 border-pink-500 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {language === 'bn' ? 'à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à¦°à§à¦¨' : 'Adjust Search Filters'}
            </h3>
            <button
              onClick={() => setShowMobileFilter(false)}
              className="p-1 text-gray-500 hover:text-red-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderFilterSidebar()}
          <button
            onClick={() => setShowMobileFilter(false)}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            {language === 'bn' ? 'à¦ªà§à¦°à§Ÿà§‹à¦— à¦•à¦°à§à¦¨' : 'Apply Filters'}
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 h-fit">
          {renderFilterSidebar()}
        </div>

        {/* Product Results */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-pink-500 space-y-3">
              <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600" />
              <h3 className="font-bold text-gray-800 dark:text-white text-base">
                {language === 'bn' ? 'à¦•à§‹à¦¨à§‹ à¦¬à¦¿à¦œà§à¦žà¦¾à¦ªà¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿' : 'No listings found'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
                {language === 'bn' ? 'à¦†à¦ªà¦¨à¦¾à¦° à¦¸à¦¾à¦°à§à¦š à¦•à¦¿à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦¬à¦¾ à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à¦°à§‡ à¦ªà§à¦¨à¦°à¦¾à§Ÿ à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤' : 'Try adjusting your search filters or keywords.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                {language === 'bn' ? 'à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦°à¦¿à¦¸à§‡à¦Ÿ à¦•à¦°à§à¦¨' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div
              className={
                layoutView === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {sortedProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} layout={layoutView} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </ReactPullToRefresh>
  );
};

