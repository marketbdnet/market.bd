import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '../src/data/categoriesData';
import {
  MAIN_CATEGORY_IMAGES,
  SUBCATEGORY_IMAGES,
  BRAND_SECOND_LEVEL_IMAGES,
  getCategoryImageUrl,
  getSubcategoryImageUrl,
  getSecondLevelImageUrl
} from '../src/utils/categoryImages';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';

describe('Image Catalog & Category Hierarchy Audit', () => {
  it('should have 20 main categories with valid non-empty images', () => {
    expect(CATEGORIES.length).toBe(20);
    CATEGORIES.forEach((cat) => {
      const img = getCategoryImageUrl(cat.id, cat.image);
      console.log(`Category: ${cat.id} -> ${img}`);
      expect(img).toBeDefined();
      expect(img.length).toBeGreaterThan(0);
      expect(typeof img).toBe('string');
    });
  });

  it('should have valid image resolution for all subcategories', () => {
    const missingSub: string[] = [];
    CATEGORIES.forEach((cat) => {
      cat.subcategories?.forEach((sub) => {
        const hasDirect = !!SUBCATEGORY_IMAGES[sub.id] || !!sub.image;
        if (!hasDirect) {
          missingSub.push(`[${cat.id}] -> sub [${sub.id}] (${sub.nameEn})`);
        }
        const img = getSubcategoryImageUrl(cat.id, sub.id, sub.image);
        expect(img).toBeDefined();
        expect(img.length).toBeGreaterThan(0);
      });
    });
    console.log(`Subcategories missing direct image entries (${missingSub.length}):`, missingSub);
  });

  it('should resolve second level categories with valid fallback hierarchy', () => {
    const missingSl: string[] = [];
    CATEGORIES.forEach((cat) => {
      cat.subcategories?.forEach((sub) => {
        sub.secondLevelCategories?.forEach((sl) => {
          const slNameKey = sl.nameEn.toLowerCase().trim().replace(/\s+/g, '_');
          const hasDirect = !!BRAND_SECOND_LEVEL_IMAGES[sl.id] || !!BRAND_SECOND_LEVEL_IMAGES[slNameKey] || !!sl.image;
          if (!hasDirect) {
            missingSl.push(`[${cat.id}/${sub.id}] -> [${sl.id}] (${sl.nameEn})`);
          }
          const img = getSecondLevelImageUrl(cat.id, sub.id, sl.id, sl.nameEn, sl.image);
          expect(img).toBeDefined();
          expect(img.length).toBeGreaterThan(0);
        });
      });
    });
    console.log(`Second-level categories without direct brand image (${missingSl.length}):`, missingSl.slice(0, 15), '...total:', missingSl.length);
  });

  it('should ensure all mock advertisements have valid non-empty image lists', () => {
    expect(INITIAL_PRODUCTS.length).toBeGreaterThan(0);
    INITIAL_PRODUCTS.forEach((prod) => {
      expect(prod.images).toBeDefined();
      expect(prod.images.length).toBeGreaterThan(0);
      prod.images.forEach((img) => {
        expect(img.length).toBeGreaterThan(0);
        expect(img.startsWith('http') || img.startsWith('/') || img.startsWith('data:') || img.includes('assets')).toBe(true);
      });
    });
  });
});
