import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from '../src/data/categoriesData';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import {
  MAIN_CATEGORY_DUAL_IMAGES,
  MAIN_CATEGORY_IMAGES,
  getCategoryImageUrl,
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

describe('MarketBD Original Category Names & Composite Dual-Object Image Architecture', () => {
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

  it('assigns a bespoke unified composite studio photo (2 items on 1 clean background) to every one of the 17 categories', () => {
    const seenCompositeImages = new Set<string>();

    for (const cat of CATEGORIES) {
      expect(cat.image).toBeTruthy();
      expect(cat.secondaryImage).toBeTruthy();
      expect(Array.isArray(cat.images)).toBe(true);
      expect(cat.images!.length).toBeGreaterThanOrEqual(2);
      expect(cat.catVersion).toBe(3);

      // Must reference bespoke composite cat_combo_* asset (not old isolated icons or split raw Unsplash URLs)
      expect(String(cat.image)).toContain('cat_combo_');
      expect(String(MAIN_CATEGORY_IMAGES[cat.id])).toContain('cat_combo_');
      expect(String(cat.image)).not.toContain('_isolated_');
      expect(String(cat.secondaryImage)).not.toContain('_isolated_');
      expect(seenCompositeImages.has(String(cat.image))).toBe(false);
      seenCompositeImages.add(String(cat.image));

      // Stale v2 Unsplash main URLs auto-upgrade via getCategoryImageUrl
      expect(
        getCategoryImageUrl(cat.id, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80')
      ).toContain('cat_combo_');

      // Secondary fallback item photo stays distinct from primary composite image
      const [first, second] = getCategoryDualImages(cat.id, cat.image, cat.secondaryImage, cat.images);
      expect(first).toContain('cat_combo_');
      expect(second).toBeTruthy();
      expect(first).not.toBe(second);
      expect(MAIN_CATEGORY_DUAL_IMAGES[cat.id]).toBeDefined();
      expect(MAIN_CATEGORY_DUAL_IMAGES[cat.id][0]).not.toBe(MAIN_CATEGORY_DUAL_IMAGES[cat.id][1]);
    }
  });

  it('renders a single unified category image in CategoryGrid and CategoryHierarchyView without grid-cols-2 split boxes', () => {
    const gridSource = fs.readFileSync(path.join(process.cwd(), 'src/components/Home/CategoryGrid.tsx'), 'utf-8');
    const hierarchySource = fs.readFileSync(path.join(process.cwd(), 'src/components/Category/CategoryHierarchyView.tsx'), 'utf-8');

    expect(gridSource).not.toContain('grid-cols-2 gap-0.5');
    expect(gridSource).not.toContain('getCategoryDualImages');
    expect(hierarchySource).not.toContain('grid-cols-2 gap-0.5');
    expect(hierarchySource).not.toContain('getCategoryDualImages');
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

  it('upgrades stale v2/unversioned Firestore category payloads automatically to v3 composite images', () => {
    const staleCloudCategories = CATEGORIES.map(c => ({
      ...c,
      nameEn: 'Vehicles',
      nameBn: 'যানবাহন ও গাড়ি',
      image: '/assets/cat_scooter_isolated_1785510882941.jpg',
      secondaryImage: undefined,
      images: undefined,
      catVersion: 2,
    }));

    const migrated = normalizeIncomingCategories(staleCloudCategories);
    expect(migrated.length).toBe(17);
    const vehicles = migrated.find(c => c.id === 'vehicles');
    expect(vehicles?.nameEn).toBe('Motors & Mobility');
    expect(vehicles?.nameBn).toBe('মোটর ও যানবাহন জগৎ');
    expect(vehicles?.catVersion).toBe(3);
    expect(vehicles?.images?.length).toBeGreaterThanOrEqual(2);
    expect(String(vehicles?.image)).toContain('cat_combo_vehicles');
    expect(String(vehicles?.image)).not.toContain('_isolated_');
  });
});
