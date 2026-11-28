import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from '../src/data/categoriesData';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import { LIVE_SYNCED_ADS } from '../src/data/liveSyncedAds';
import { getSubcategoryImageUrl, SUBCATEGORY_IMAGES } from '../src/utils/categoryImages';
import { normalizeCategoryId } from '../src/utils/categoryMapping';
import { mergeAndDeduplicateProducts, filterPublicActiveProducts } from '../src/utils/productSyncCatalog';
import {
  DEFAULT_LISTING_SNAPSHOT,
  pushNavHistoryEntry,
  popNavHistoryEntry,
  type NavHistoryEntry,
} from '../src/utils/navigationState';
import { formatOtpMessage } from '../api/sms';

describe('Tasks 1–5 End-to-End Verification', () => {
  it('Task 1: Smart Back Navigation preserves exact scrollY and listing snapshot without clearing previous page state', () => {
    let stack: NavHistoryEntry[] = [{ tab: 'home', scrollY: 0 }];

    // Scroll down on home page and open search
    stack = pushNavHistoryEntry(stack, { tab: 'search' }, 840);
    expect(stack[0]).toEqual({ tab: 'home', scrollY: 840 });
    expect(stack[1]).toEqual({ tab: 'search', productId: null, scrollY: 0 });

    // Scroll down on search page and click a product
    stack = pushNavHistoryEntry(stack, { tab: 'product-details', productId: 'prod-123' }, 1420);
    expect(stack[1].scrollY).toBe(1420);
    expect(stack[2]).toEqual({ tab: 'product-details', productId: 'prod-123', scrollY: 0 });

    // Back from product details restores search + scrollY 1420
    const backToSearch = popNavHistoryEntry(stack);
    expect(backToSearch.popped?.productId).toBe('prod-123');
    expect(backToSearch.target).toEqual({ tab: 'search', productId: null, scrollY: 1420 });

    // Back from search restores home + scrollY 840
    const backToHome = popNavHistoryEntry(backToSearch.nextStack);
    expect(backToHome.target).toEqual({ tab: 'home', scrollY: 840 });

    // Snapshot defaults preserve layout, filter, sort, and visible item count
    expect(DEFAULT_LISTING_SNAPSHOT).toEqual({
      homeAdViewMode: 'grid',
      homeRecentCategory: 'all',
      homeRecentSort: 'newest',
      homeVisibleRecentCount: 16,
      searchLayoutView: 'grid',
    });

    const appSource = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf-8');
    expect(appSource).toContain('consumePendingRestoreScroll');
    expect(appSource).toContain('requestAnimationFrame');
    expect(appSource).toContain('goBack(false)');
  });

  it('Task 2: All 95 subcategories across 16 categories use bespoke combined sub_combo studio images', () => {
    const subIds = new Set<string>();
    const imageValues = new Set<string>();

    for (const cat of CATEGORIES) {
      for (const sub of cat.subcategories) {
        subIds.add(sub.id);
        const directImg = String(sub.image || '');
        const resolvedImg = getSubcategoryImageUrl(cat.id, sub.id, directImg);
        const upgradedUnsplash = getSubcategoryImageUrl(
          cat.id,
          sub.id,
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
        );

        expect(directImg).toContain('sub_combo_');
        expect(resolvedImg).toContain('sub_combo_');
        expect(upgradedUnsplash).toContain('sub_combo_');
        expect(resolvedImg).not.toContain('unsplash.com');
        expect(SUBCATEGORY_IMAGES[sub.id]).toBeTruthy();

        imageValues.add(resolvedImg);
      }
    }

    expect(subIds.size).toBe(95);
    expect(imageValues.size).toBe(95);
  });

  it('Task 3: Exactly 16 renamed categories in requested order, CVs merged into Jobs & Careers, and MobileGrid shows all 16 cleanly', () => {
    const expectedNames = [
      'Vehicles & Auto',
      'Property & Land',
      'Phones & Accessories',
      'Computers & Tech',
      'Home & Living',
      'Fashion & Style',
      'Beauty & Care',
      'Services & Training',
      'Construction & Repair',
      'Tools & Machinery',
      'Sports & Hobbies',
      'Kids & Toys',
      'Food & Farming',
      'Pets & Animals',
      'Jobs & Careers',
      'Business & Wholesale',
    ];

    expect(CATEGORIES.map(c => c.nameEn)).toEqual(expectedNames);
    expect(CATEGORIES.some(c => c.id === 'seeking_work')).toBe(false);
    expect(normalizeCategoryId('seeking_work')).toBe('jobs');

    const jobsCat = CATEGORIES.find(c => c.id === 'jobs');
    expect(jobsCat).toBeDefined();
    const jobSubIds = new Set(jobsCat!.subcategories.map(s => s.id));
    expect(jobSubIds.has('it_cv_profiles')).toBe(true);
    expect(jobSubIds.has('sales_marketing_cvs')).toBe(true);
    expect(jobSubIds.has('office_accounts_cvs')).toBe(true);
    expect(jobSubIds.has('technical_driver_cvs')).toBe(true);

    const gridSource = fs.readFileSync(path.join(process.cwd(), 'src/components/Home/CategoryGrid.tsx'), 'utf-8');
    expect(gridSource).not.toContain('Careers & Trade');
  });

  it('Task 4: Multiline 3-line OTP template preserves line breaks within 70 chars', () => {
    const template3Line = "MarketBD-OTP:{otp}\nDon't Share Code\nBuy/Sell & Exch with Trust";
    const formatted = formatOtpMessage(template3Line, '583920', true);

    expect(formatted).toBe("MarketBD-OTP:583920\nDon't Share Code\nBuy/Sell & Exch with Trust");
    expect(formatted.split('\n').length).toBe(3);
    expect(formatted.length).toBeLessThanOrEqual(70);
  });

  it('Task 5: Website and Android canonical advertisement catalog merges cleanly to 439 unique active ads without duplicates', () => {
    expect(INITIAL_PRODUCTS.length).toBe(416);
    expect(LIVE_SYNCED_ADS.length).toBe(23);

    const merged = mergeAndDeduplicateProducts({
      canonicalProducts: INITIAL_PRODUCTS,
      supplementalProducts: LIVE_SYNCED_ADS,
      apiProducts: INITIAL_PRODUCTS,
    });
    const active = filterPublicActiveProducts(merged);

    expect(merged.length).toBe(439);
    expect(active.length).toBe(439);

    const uniqueIds = new Set(active.map(p => p.id));
    expect(uniqueIds.size).toBe(439);
  });
});
