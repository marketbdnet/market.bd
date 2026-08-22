import { CATEGORIES } from '../data/categoriesData';
import { CATEGORY_BRANDS_MODELS } from '../data/bangladeshData';
import { LAPTOP_BRANDS_CATALOG, DESKTOP_PC_COMPONENTS_CATALOG } from '../data/computerMasterCatalog';

console.log('================ AUDIT SCRIPT START ================');

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of arr) {
    const norm = item.trim().toLowerCase();
    if (seen.has(norm)) {
      duplicates.add(item);
    }
    seen.add(norm);
  }
  return Array.from(duplicates);
}

// 1. Category IDs
console.log('\n--- 1. CATEGORIES HIERARCHY ID DUPLICATION CHECK ---');
const allCategoryIds: string[] = [];
CATEGORIES.forEach(cat => {
  allCategoryIds.push(cat.id);
  cat.subcategories.forEach(sub => {
    allCategoryIds.push(sub.id);
    if (sub.secondLevelCategories) {
      sub.secondLevelCategories.forEach(sec => {
        allCategoryIds.push(sec.id);
      });
    }
  });
});
const dupCatIds = findDuplicates(allCategoryIds);
console.log('Total Category Hierarchy IDs:', allCategoryIds.length);
console.log('Duplicate Category IDs:', dupCatIds.length > 0 ? dupCatIds : 'NONE');

// 2. Mobile Analysis
console.log('\n--- 2. MOBILE DATA ANALYSIS ---');
const mobileBrands = CATEGORY_BRANDS_MODELS['mobiles'] || [];
const mobileBrandNames = mobileBrands.map(b => b.brandEn);
const dupMobileBrands = findDuplicates(mobileBrandNames);

let totalMobileModels = 0;
const allMobileModelNames: string[] = [];
const uniqueMobileSeriesSet = new Set<string>();

mobileBrands.forEach(b => {
  b.models.forEach(m => {
    totalMobileModels++;
    allMobileModelNames.push(b.brandEn + ' ' + m.en);
    const words = m.en.split(' ');
    // e.g. iPhone 16, Galaxy S24, Redmi Note, etc.
    if (words.length >= 2) {
      uniqueMobileSeriesSet.add(b.brandEn + ' ' + words[0] + ' ' + words[1]);
    } else {
      uniqueMobileSeriesSet.add(b.brandEn + ' ' + words[0]);
    }
  });
});

console.log('Mobile Brands Count:', mobileBrands.length);
console.log('Mobile Brands:', mobileBrandNames.join(', '));
console.log('Mobile Series (Unique Est):', uniqueMobileSeriesSet.size);
console.log('Mobile Models Total:', totalMobileModels);
console.log('Duplicate Mobile Brands:', dupMobileBrands.length > 0 ? dupMobileBrands : 'NONE');

const requiredMobileBrands = [
  'Apple', 'Samsung', 'Xiaomi', 'Redmi', 'POCO', 'Huawei', 'Honor', 'OPPO',
  'Vivo', 'iQOO', 'OnePlus', 'Realme', 'Motorola', 'Google Pixel',
  'Sony', 'ASUS', 'Nokia', 'TECNO', 'Infinix', 'itel', 'Nothing',
  'Walton', 'Symphony'
];
const missingMobileBrands = requiredMobileBrands.filter(req => 
  !mobileBrandNames.some(b => b.toLowerCase().includes(req.toLowerCase()))
);
console.log('Major Required Brands Missing in Mobile:', missingMobileBrands.length > 0 ? missingMobileBrands : 'NONE (ALL PRESENT)');

// 3. Computers & IT Analysis
console.log('\n--- 3. COMPUTERS & IT DATA ANALYSIS ---');
const compBrands = [
  ...LAPTOP_BRANDS_CATALOG,
  ...DESKTOP_PC_COMPONENTS_CATALOG
];
const compBrandNames = compBrands.map(b => b.brandEn);
let totalCompModels = 0;
const allCompModelNames: string[] = [];
const uniqueCompSeriesSet = new Set<string>();

compBrands.forEach(b => {
  b.models.forEach(m => {
    totalCompModels++;
    allCompModelNames.push(b.brandEn + ' ' + m.en);
    const words = m.en.split(' ');
    if (words.length >= 2) {
      uniqueCompSeriesSet.add(b.brandEn + ' ' + words[0] + ' ' + words[1]);
    } else {
      uniqueCompSeriesSet.add(b.brandEn + ' ' + words[0]);
    }
  });
});

console.log('Computers & IT Brands/Sections Count:', compBrands.length);
console.log('Computers & IT Series Count:', uniqueCompSeriesSet.size);
console.log('Computers & IT Models/Specs Count:', totalCompModels);
console.log('Computers & IT Catalog Headers:', compBrandNames.join(' | '));

// 4. Electronics Analysis
console.log('\n--- 4. ELECTRONICS DATA ANALYSIS ---');
const elecBrandGroups = CATEGORY_BRANDS_MODELS['electronics'] || [];
const elecBrandNames = elecBrandGroups.map(b => b.brandEn);
let totalElecModels = 0;
const allElecModelNames: string[] = [];
const uniqueElecSeriesSet = new Set<string>();

elecBrandGroups.forEach(b => {
  b.models.forEach(m => {
    totalElecModels++;
    allElecModelNames.push(b.brandEn + ' ' + m.en);
    const words = m.en.split(' ');
    if (words.length >= 2) {
      uniqueElecSeriesSet.add(b.brandEn + ' ' + words[0] + ' ' + words[1]);
    } else {
      uniqueElecSeriesSet.add(b.brandEn + ' ' + words[0]);
    }
  });
});

console.log('Electronics Sections/Brands Count:', elecBrandGroups.length);
console.log('Electronics Series Count:', uniqueElecSeriesSet.size);
console.log('Electronics Models/Specs Count:', totalElecModels);
console.log('Electronics Catalog Headers:', elecBrandNames.join(' | '));

console.log('\n================ AUDIT SCRIPT COMPLETE ================');
