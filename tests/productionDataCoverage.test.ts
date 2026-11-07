import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '../src/data/categoriesData';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import { isProductPublicActive } from '../src/utils/productStatus';

describe('MarketBD Production Listing & Category Coverage Audit', () => {
  it('should verify 20 main categories defined', () => {
    expect(CATEGORIES.length).toBe(20);
  });

  it('guarantees 100% coverage across Main, Sub, and Second-Level categories', () => {
    let totalSubs = 0;
    let totalSecondLevel = 0;

    const mainCatMap = new Map<string, number>();
    const subCatMap = new Map<string, number>();
    const slCatMap = new Map<string, number>();

    const categoryReport: Array<{
      category: string;
      nameBn: string;
      subcategoriesCount: number;
      secondLevelCount: number;
      liveAdsCount: number;
    }> = [];

    CATEGORIES.forEach(cat => {
      mainCatMap.set(cat.id, 0);
      let catSubsCount = 0;
      let catSlCount = 0;

      cat.subcategories?.forEach(sub => {
        totalSubs++;
        catSubsCount++;
        const subKey = `${cat.id}:::${sub.id}`;
        subCatMap.set(subKey, 0);
        sub.secondLevelCategories?.forEach(sl => {
          totalSecondLevel++;
          catSlCount++;
          const slKey = `${cat.id}:::${sub.id}:::${sl.id}`;
          slCatMap.set(slKey, 0);
        });
      });

      categoryReport.push({
        category: cat.nameEn,
        nameBn: cat.nameBn,
        subcategoriesCount: catSubsCount,
        secondLevelCount: catSlCount,
        liveAdsCount: 0
      });
    });

    INITIAL_PRODUCTS.forEach(p => {
      if (isProductPublicActive(p)) {
        if (p.category && mainCatMap.has(p.category)) {
          mainCatMap.set(p.category, (mainCatMap.get(p.category) || 0) + 1);
        }
        if (p.category && p.subCategory) {
          const subKey = `${p.category}:::${p.subCategory}`;
          if (subCatMap.has(subKey)) {
            subCatMap.set(subKey, (subCatMap.get(subKey) || 0) + 1);
          }
        }
        if (p.category && p.subCategory && p.secondLevelCategory) {
          const slKey = `${p.category}:::${p.subCategory}:::${p.secondLevelCategory}`;
          if (slCatMap.has(slKey)) {
            slCatMap.set(slKey, (slCatMap.get(slKey) || 0) + 1);
          }
        }
      }
    });

    // Populate categoryReport live ads counts
    CATEGORIES.forEach((cat, index) => {
      const adsCount = mainCatMap.get(cat.id) || 0;
      categoryReport[index].liveAdsCount = adsCount;
    });

    console.table(categoryReport);

    const uncoveredMain: string[] = [];
    mainCatMap.forEach((count, id) => {
      if (count === 0) uncoveredMain.push(id);
    });

    const uncoveredSub: string[] = [];
    subCatMap.forEach((count, key) => {
      if (count === 0) uncoveredSub.push(key);
    });

    const uncoveredSl: string[] = [];
    slCatMap.forEach((count, key) => {
      if (count === 0) uncoveredSl.push(key);
    });

    expect(uncoveredMain.length).toBe(0);
    expect(uncoveredSub.length).toBe(0);
    expect(uncoveredSl.length).toBe(0);

    const mainCoveragePercent = ((CATEGORIES.length - uncoveredMain.length) / CATEGORIES.length) * 100;
    const subCoveragePercent = ((totalSubs - uncoveredSub.length) / totalSubs) * 100;
    const slCoveragePercent = ((totalSecondLevel - uncoveredSl.length) / totalSecondLevel) * 100;

    expect(mainCoveragePercent).toBe(100);
    expect(subCoveragePercent).toBe(100);
    expect(slCoveragePercent).toBe(100);

    console.log(`Coverage Results:`);
    console.log(`- Main Categories: 20/20 (100%)`);
    console.log(`- Subcategories: ${totalSubs}/${totalSubs} (100%)`);
    console.log(`- Second-Level Categories: ${totalSecondLevel}/${totalSecondLevel} (100%)`);
    console.log(`- Total Live Published Ads: ${INITIAL_PRODUCTS.length}`);
  });

  it('guarantees zero dummy/demo placeholder keywords across all live products', () => {
    const forbiddenWords = ['dummy', 'demo product', 'test listing', 'sample product', 'sample listing', 'test product', 'demo ad'];
    const issues: string[] = [];

    INITIAL_PRODUCTS.forEach(p => {
      const text = `${p.title} ${p.description} ${p.seller?.name || ''}`.toLowerCase();
      forbiddenWords.forEach(word => {
        if (text.includes(word)) {
          issues.push(`Product [${p.id}] contains '${word}': "${p.title}"`);
        }
      });
    });

    expect(issues.length).toBe(0);
  });

  it('ensures all INITIAL_PRODUCTS have canonical active live status', () => {
    INITIAL_PRODUCTS.forEach(p => {
      expect(p.status).toBe('active');
      expect(p.isActive).toBe(true);
      expect(p.isApproved).toBe(true);
      expect(p.moderationStatus).toBe('approved');
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
      expect(p.location).toBeDefined();
      expect(p.location.division).toBeTruthy();
      expect(p.seller).toBeDefined();
      expect(p.seller.phone).toBeTruthy();
    });
  });
});
