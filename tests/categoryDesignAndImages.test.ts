import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '../src/data/categoriesData';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import {
  MAIN_CATEGORY_DUAL_IMAGES,
  MAIN_CATEGORY_IMAGES,
  getCategoryDualImages
} from '../src/utils/categoryImages';
import { normalizeIncomingCategories } from '../src/context/MarketContext';
import { isProductPublicActive } from '../src/utils/productStatus';

const BIKROY_EXACT_EN_TITLES = new Set([
  'Vehicles',
  'Property',
  'Phones & Tablets',
  'Electronics',
  'Home, Furniture & Appliances',
  'Fashion',
  'Beauty & Personal Care',
  'Services',
  'Repair & Construction',
  'Commercial Equipment & Tools',
  'Leisure & Activities',
  'Babies & Kids',
  'Food, Agriculture & Farming',
  'Animals & Pets',
  'Jobs',
  'Seeking Work - CVs',
  'Business & Industry',
]);

describe('MarketBD Original Category Names & Dual-Image Architecture', () => {
  it('uses original MarketBD names instead of exact Bikroy category titles for all 17 categories', () => {
    expect(CATEGORIES.length).toBe(17);

    const seenEn = new Set<string>();
    const seenBn = new Set<string>();

    for (const cat of CATEGORIES) {
      expect(BIKROY_EXACT_EN_TITLES.has(cat.nameEn)).toBe(false);
      expect(cat.nameEn.trim().length).toBeGreaterThan(2);
      expect(cat.nameBn.trim().length).toBeGreaterThan(2);
      expect(seenEn.has(cat.nameEn)).toBe(false);
      expect(seenBn.has(cat.nameBn)).toBe(false);
      seenEn.add(cat.nameEn);
      seenBn.add(cat.nameBn);
    }
  });

  it('replaces legacy isolated Bikroy-style category icons and assigns >= 2 distinct item images per category', () => {
    for (const cat of CATEGORIES) {
      expect(cat.image).toBeTruthy();
      expect(cat.secondaryImage).toBeTruthy();
      expect(Array.isArray(cat.images)).toBe(true);
      expect(cat.images!.length).toBeGreaterThanOrEqual(2);

      // Must not reference old cat_*_isolated_* asset icons
      expect(String(cat.image)).not.toContain('_isolated_');
      expect(String(cat.secondaryImage)).not.toContain('_isolated_');
      expect(String(MAIN_CATEGORY_IMAGES[cat.id] || '')).not.toContain('_isolated_');

      // Dual images from both catalog and helper must be distinct
      const [first, second] = getCategoryDualImages(cat.id, cat.image, cat.secondaryImage, cat.images);
      expect(first).toBeTruthy();
      expect(second).toBeTruthy();
      expect(first).not.toBe(second);
      expect(MAIN_CATEGORY_DUAL_IMAGES[cat.id]).toBeDefined();
      expect(MAIN_CATEGORY_DUAL_IMAGES[cat.id][0]).not.toBe(MAIN_CATEGORY_DUAL_IMAGES[cat.id][1]);
    }
  });

  it('ensures every product across all 17 categories has at least 2 distinct images and maintains 416 active ads', () => {
    expect(INITIAL_PRODUCTS.length).toBe(416);
    expect(INITIAL_PRODUCTS.filter(isProductPublicActive).length).toBe(416);

    const categoriesRepresented = new Set<string>();
    for (const prod of INITIAL_PRODUCTS) {
      categoriesRepresented.add(prod.category);
      expect(Array.isArray(prod.images)).toBe(true);
      expect(prod.images.length).toBeGreaterThanOrEqual(2);
      const uniqueImgs = new Set(prod.images.map(u => u.trim()).filter(Boolean));
      expect(uniqueImgs.size).toBeGreaterThanOrEqual(2);
    }

    expect(categoriesRepresented.size).toBe(17);
  });

  it('upgrades stale unversioned Bikroy Firestore category payloads automatically', () => {
    const staleCloudCategories = CATEGORIES.map(c => ({
      ...c,
      nameEn: 'Vehicles',
      nameBn: 'যানবাহন ও গাড়ি',
      image: '/assets/cat_scooter_isolated_1785510882941.jpg',
      secondaryImage: undefined,
      images: undefined,
      catVersion: undefined,
    }));

    const migrated = normalizeIncomingCategories(staleCloudCategories);
    expect(migrated.length).toBe(17);
    const vehicles = migrated.find(c => c.id === 'vehicles');
    expect(vehicles?.nameEn).toBe('Motors & Mobility');
    expect(vehicles?.nameBn).toBe('মোটর ও যানবাহন জগৎ');
    expect(vehicles?.catVersion).toBe(2);
    expect(vehicles?.images?.length).toBeGreaterThanOrEqual(2);
    expect(String(vehicles?.image)).not.toContain('_isolated_');
  });
});
