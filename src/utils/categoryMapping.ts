export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  computers: 'electronics',
  computer: 'electronics',
  it: 'electronics',
  electronic: 'electronics',
  gadgets: 'electronics',
  education_courses: 'services',
  education: 'services',
  travel_tours: 'books_sports',
  events_tickets: 'books_sports',
  books: 'books_sports',
  sports: 'books_sports',
  food_restaurants: 'agriculture',
  food_grocery: 'agriculture',
  food: 'agriculture',
  others: 'business_industry',
  furniture: 'home_furniture',
  living: 'home_furniture',
  home_appliances: 'home_furniture',
  health: 'health_beauty',
  beauty: 'health_beauty',
  pets: 'animal_pets',
  business: 'business_equipment',
  construction: 'repair_construction',
  cars: 'vehicles',
  car: 'vehicles',
  motorcycles: 'vehicles',
  bike: 'vehicles',
  bikes: 'vehicles',
  vehicle: 'vehicles',
  baby: 'baby_kids',
  seeking_work: 'jobs',
  cv: 'jobs',
  cvs: 'jobs',
  'vehicles & auto': 'vehicles',
  'property & land': 'property',
  'phones & accessories': 'mobiles',
  'computers & tech': 'electronics',
  'home & living': 'home_furniture',
  'fashion & style': 'fashion',
  'beauty & care': 'health_beauty',
  'services & training': 'services',
  'construction & repair': 'repair_construction',
  'tools & machinery': 'business_equipment',
  'sports & hobbies': 'books_sports',
  'kids & toys': 'baby_kids',
  'food & farming': 'agriculture',
  'pets & animals': 'animal_pets',
  'jobs & careers': 'jobs',
  'business & wholesale': 'business_industry'
};

export function normalizeCategoryId(category?: string, subCategory?: string): string {
  const cat = String(category || '').trim().toLowerCase();
  const sub = String(subCategory || '').trim().toLowerCase();
  if (cat === 'services' && sub === 'home_repair') {
    return 'repair_construction';
  }
  return LEGACY_CATEGORY_MAP[cat] || cat;
}

export function isCategoryMatched(
  productCategory?: string,
  filterCategory?: string,
  productSubCategory?: string
): boolean {
  if (!productCategory || !filterCategory) return false;
  const normalizedFilter = normalizeCategoryId(filterCategory);
  const normalizedProduct = normalizeCategoryId(productCategory, productSubCategory);
  if (normalizedProduct === normalizedFilter) return true;

  const pRaw = String(productCategory).trim().toLowerCase();
  const fRaw = String(filterCategory).trim().toLowerCase();
  return pRaw === fRaw;
}
