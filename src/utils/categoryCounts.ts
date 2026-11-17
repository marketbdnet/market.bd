import { Product } from '../types';
import { isProductPublicActive } from './productStatus';
import { isCategoryMatched } from './categoryMapping';

const SUBCATEGORY_ALIASES: Record<string, string[]> = {
  motorcycles_scooters: ['motorcycles_scooters', 'motorcycles', 'scooters'],
  buses_microbuses: ['buses_microbuses', 'buses', 'microbuses'],
  vehicle_parts_accessories: ['vehicle_parts_accessories', 'spare_parts', 'tyres_wheels', 'vehicle_acc'],
  trucks_heavy_vehicles: ['trucks_heavy_vehicles', 'trucks'],
  three_wheelers: ['three_wheelers', 'auto_rickshaws'],
  water_transport: ['water_transport', 'boats'],
  earbuds_headphones: ['earbuds_headphones', 'earbuds', 'headphones'],
  chargers_cables: ['chargers_cables', 'chargers', 'power_banks'],
  mobile_cases_parts: ['mobile_cases_parts', 'mobile_cases', 'screen_protectors', 'mobile_parts'],
  computer_components: ['computer_components', 'ram_storage'],
  routers_networking: ['routers_networking', 'routers'],
  printers_peripherals: ['printers_peripherals', 'printers', 'keyboards', 'mouse'],
  audio_sound: ['audio_sound', 'speakers'],
  cameras_drones: ['cameras_drones', 'cameras'],
  cctv_security: ['cctv_security', 'cctv'],
  office_furniture: ['office_furniture', 'chairs'],
  strollers: ['strollers', 'baby_strollers_prams'],
};

export function isSubcategoryMatched(productSubCategory: string | undefined, targetSubId: string): boolean {
  const pSub = String(productSubCategory || '').toLowerCase().trim();
  const sLower = String(targetSubId || '').toLowerCase().trim();
  if (!pSub || !sLower) return false;
  if (pSub === sLower) return true;
  const aliases = SUBCATEGORY_ALIASES[sLower];
  return Array.isArray(aliases) ? aliases.includes(pSub) : false;
}

export function getLiveCategoryCount(
  products: readonly Partial<Product>[] | null | undefined,
  categoryId: string
): number {
  if (!Array.isArray(products) || !categoryId) return 0;
  return products.filter(
    p => p && isProductPublicActive(p) && isCategoryMatched(p.category, categoryId, p.subCategory)
  ).length;
}

export function getLiveSubcategoryCount(
  products: readonly Partial<Product>[] | null | undefined,
  categoryId: string,
  subCategoryId: string
): number {
  if (!Array.isArray(products) || !categoryId || !subCategoryId) return 0;
  return products.filter(p => {
    if (!p || !isProductPublicActive(p)) return false;
    if (!isCategoryMatched(p.category, categoryId, p.subCategory)) return false;
    return isSubcategoryMatched(p.subCategory, subCategoryId);
  }).length;
}

export function getLiveSecondLevelCount(
  products: readonly Partial<Product>[] | null | undefined,
  categoryId: string,
  _subCategoryId: string,
  slId: string,
  slNameEn?: string
): number {
  if (!Array.isArray(products) || !categoryId || !slId) return 0;
  const sIdLower = String(slId || '').toLowerCase().trim();
  const sNameLower = String(slNameEn || '').toLowerCase().trim();

  return products.filter(p => {
    if (!p || !isProductPublicActive(p)) return false;
    if (!isCategoryMatched(p.category, categoryId, p.subCategory)) return false;

    const pSL = String(p.secondLevelCategory || '').toLowerCase().trim();
    if (pSL && pSL === sIdLower) return true;

    const pBrand = String(p.brand || '').toLowerCase().trim();
    if (pBrand && (pBrand === sIdLower || (sNameLower && pBrand === sNameLower))) return true;

    const pTitle = String(p.title || '').toLowerCase();
    if (sNameLower && pTitle && pTitle.includes(sNameLower)) return true;

    const pDesc = String(p.description || '').toLowerCase();
    if (sNameLower && pDesc && pDesc.includes(sNameLower)) return true;
    return false;
  }).length;
}
