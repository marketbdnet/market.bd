/**
 * MarketBD Comprehensive Category Image Catalog
 * High-resolution, authentic category-matched dual item photography
 * for all 17 MarketBD Categories, Subcategories, and Second-Level Categories.
 */

import { storage } from './storage';

import subThreeWheelersImg from '../assets/images/sub_three_wheelers_1794926944301.jpg';
import subWaterTransportImg from '../assets/images/sub_water_transport_1794926943794.jpg';
import subFeaturePhonesImg from '../assets/images/sub_feature_phones_1794926944480.jpg';
import subAutoPartsImg from '../assets/images/sub_auto_parts_1794926945153.jpg';
import subAirConditionerImg from '../assets/images/sub_air_conditioner_1794926945829.jpg';
import subOfficeFurnitureImg from '../assets/images/sub_office_furniture_1794926946106.jpg';
import subShopPosImg from '../assets/images/sub_shop_pos_1794926946004.jpg';
import subDomesticToursImg from '../assets/images/sub_domestic_tours_1794926946621.jpg';
import subHajjUmrahImg from '../assets/images/sub_hajj_umrah_1794926967162.jpg';
import subBirdsPetsImg from '../assets/images/sub_birds_pets_1794926967942.jpg';
import subFertilizersFeedImg from '../assets/images/sub_fertilizers_feed_1794926968218.jpg';
import subBabyStrollerImg from '../assets/images/sub_baby_stroller_1794926968956.jpg';
import subSalesJobsImg from '../assets/images/sub_sales_jobs_1794926968772.jpg';
import subAntiquesImg from '../assets/images/sub_antiques_1794926968955.jpg';
import subSurplusMiscImg from '../assets/images/sub_surplus_misc_1794926968901.jpg';
import subMobileCasesImg from '../assets/images/sub_mobile_cases_1794926969537.jpg';
import subJeansTrousersImg from '../assets/images/sub_jeans_trousers_1794927046573.jpg';

// 17 Bespoke Composite Dual-Object Category Images (2 category items together on 1 clean studio background)
import catComboVehiclesImg from '../assets/images/cat_combo_vehicles_1795795289666.jpg';
import catComboPropertyImg from '../assets/images/cat_combo_property_1795795290974.jpg';
import catComboMobilesImg from '../assets/images/cat_combo_mobiles_1795795291977.jpg';
import catComboElectronicsImg from '../assets/images/cat_combo_electronics_1795795292375.jpg';
import catComboHomeFurnitureImg from '../assets/images/cat_combo_home_furniture_1795795292055.jpg';
import catComboFashionImg from '../assets/images/cat_combo_fashion_1795795292987.jpg';
import catComboHealthBeautyImg from '../assets/images/cat_combo_health_beauty_1795795308981.jpg';
import catComboServicesImg from '../assets/images/cat_combo_services_1795795309451.jpg';
import catComboRepairConstructionImg from '../assets/images/cat_combo_repair_construction_1795795310065.jpg';
import catComboBusinessEquipmentImg from '../assets/images/cat_combo_business_equipment_1795795326816.jpg';
import catComboBooksSportsImg from '../assets/images/cat_combo_books_sports_1795795327824.jpg';
import catComboBabyKidsImg from '../assets/images/cat_combo_baby_kids_1795795328725.jpg';
import catComboAgricultureImg from '../assets/images/cat_combo_agriculture_1795795357637.jpg';
import catComboAnimalPetsImg from '../assets/images/cat_combo_animal_pets_1795795358757.jpg';
import catComboJobsImg from '../assets/images/cat_combo_jobs_1795795358702.jpg';
import catComboSeekingWorkImg from '../assets/images/cat_combo_seeking_work_1795795360188.jpg';
import catComboBusinessIndustryImg from '../assets/images/cat_combo_business_industry_1795795359394.jpg';

// Legacy v2 Unsplash URLs that should auto-upgrade to composite cat_combo_* studio thumbnails
const LEGACY_V2_MAIN_UNSPLASH_URLS = new Set([
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=500&q=80'
]);

// In-memory cache for dynamic category image overrides
let activeImageOverrides: Record<string, string> = {};

// Load saved overrides on initialization
try {
  const saved = storage.getItem('marketbd_category_images_overrides_v1');
  if (saved) {
    activeImageOverrides = JSON.parse(saved);
  }
} catch (e) {
  console.error('Error loading category image overrides:', e);
}

/**
 * Set active category image overrides cache
 */
export function setGlobalCategoryImageOverrides(overrides: Record<string, string>) {
  activeImageOverrides = { ...overrides };
}

/**
 * 1. Level 1: Composite Dual-Object Category Images (index 0 = unified 2-objects-on-1-background studio image)
 *    plus a secondary item photo (index 1) for multi-image fallbacks.
 */
export const MAIN_CATEGORY_DUAL_IMAGES: Record<string, [string, string]> = {
  vehicles: [
    catComboVehiclesImg,
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=80'
  ],
  property: [
    catComboPropertyImg,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80'
  ],
  mobiles: [
    catComboMobilesImg,
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80'
  ],
  electronics: [
    catComboElectronicsImg,
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80'
  ],
  home_furniture: [
    catComboHomeFurnitureImg,
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80'
  ],
  fashion: [
    catComboFashionImg,
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=500&q=80'
  ],
  health_beauty: [
    catComboHealthBeautyImg,
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80'
  ],
  services: [
    catComboServicesImg,
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80'
  ],
  repair_construction: [
    catComboRepairConstructionImg,
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80'
  ],
  business_equipment: [
    catComboBusinessEquipmentImg,
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80'
  ],
  books_sports: [
    catComboBooksSportsImg,
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80'
  ],
  baby_kids: [
    catComboBabyKidsImg,
    subBabyStrollerImg
  ],
  agriculture: [
    catComboAgricultureImg,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80'
  ],
  animal_pets: [
    catComboAnimalPetsImg,
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80'
  ],
  jobs: [
    catComboJobsImg,
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=80'
  ],
  seeking_work: [
    catComboSeekingWorkImg,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80'
  ],
  business_industry: [
    catComboBusinessIndustryImg,
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80'
  ],

  // Legacy fallback aliases
  computers: [
    catComboElectronicsImg,
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80'
  ],
  others: [
    catComboBusinessIndustryImg,
    subAntiquesImg
  ],
  education_courses: [
    catComboServicesImg,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80'
  ],
  travel_tours: [
    catComboBooksSportsImg,
    subDomesticToursImg
  ],
  food_restaurants: [
    catComboAgricultureImg,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'
  ],
  events_tickets: [
    catComboBooksSportsImg,
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80'
  ]
};

export const MAIN_CATEGORY_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(MAIN_CATEGORY_DUAL_IMAGES).map(([key, pair]) => [key, pair[0]])
);

/**
 * 2. Level 2: Subcategory Images (Strict Category & Item Match)
 */
export const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Phones & Tablets
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
  feature_phones: subFeaturePhonesImg,
  tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
  smart_watches: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80',
  earbuds_headphones: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
  chargers_cables: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80',
  chargers: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80',
  power_banks: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80',
  mobile_cases_parts: subMobileCasesImg,
  mobile_cases: subMobileCasesImg,
  screen_protectors: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=500&q=80',
  mobile_parts: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80',

  // Electronics (includes Computers & IT)
  laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',
  desktop_computers: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80',
  computer_components: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80',
  ram_storage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80',
  monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
  routers_networking: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80',
  routers: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80',
  printers_peripherals: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80',
  printers: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80',
  keyboards: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80',
  mouse: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80',
  televisions: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80',
  audio_sound: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80',
  speakers: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80',
  cameras_drones: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
  cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
  air_conditioners: subAirConditionerImg,
  refrigerators: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=500&q=80',
  gaming_consoles: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
  cctv_security: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80',
  cctv: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80',
  washing_machines: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80',

  // Vehicles
  cars: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80',
  motorcycles_scooters: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=80',
  vehicle_parts_accessories: subAutoPartsImg,
  bicycles: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80',
  three_wheelers: subThreeWheelersImg,
  tractors_agricultural_vehicles: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=500&q=80',
  trucks_heavy_vehicles: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=500&q=80',
  buses_microbuses: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500&q=80',
  water_transport: subWaterTransportImg,

  // Property
  apartments_sale: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80',
  apartments_rent: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80',
  houses: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80',
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80',

  // Home, Furniture & Appliances
  sofas: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
  beds: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80',
  wardrobes: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80',
  dining_tables: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=500&q=80',
  office_furniture: subOfficeFurnitureImg,
  chairs: subOfficeFurnitureImg,

  // Fashion
  mens_clothing: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=500&q=80',
  womens_clothing: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
  watches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
  bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',

  // Beauty & Personal Care
  skin_care: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
  perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80',
  makeup: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
  hair_care: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=500&q=80',

  // Babies & Kids
  toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80',
  strollers: subBabyStrollerImg,
  baby_clothing: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80',

  // Leisure & Activities (Books, Sports, Travel, Events)
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80',
  sports_equipment: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80',
  gym_equipment: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80',
  musical_instruments: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80',
  domestic_tours: subDomesticToursImg,
  international_tours: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=500&q=80',
  hajj_umrah: subHajjUmrahImg,
  concert_tickets: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
  wedding_services: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80',
  seminars_workshops: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=500&q=80',

  // Animals & Pets
  cattle: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=500&q=80',
  goats: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=500&q=80',
  cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80',
  birds: subBirdsPetsImg,

  // Food, Agriculture & Farming
  seeds: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=500&q=80',
  farm_machinery: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=500&q=80',
  fertilizers: subFertilizersFeedImg,
  restaurants: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
  fast_food: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=500&q=80',
  cakes_bakery: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',

  // Commercial Equipment & Tools
  industrial_machines: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
  shop_equipment: subShopPosImg,
  restaurant_equipment: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',

  // Services (includes Education & Courses)
  website_development: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80',
  delivery_services: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=500&q=80',
  online_courses: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
  language_learning: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=80',
  admission_coaching: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80',

  // Repair & Construction
  home_repair: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80',
  construction_materials: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80',
  sanitary_plumbing_hardware: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
  electrical_hardware_tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=500&q=80',

  // Jobs
  it_jobs: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
  sales_jobs: subSalesJobsImg,
  office_jobs: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=80',

  // Seeking Work - CVs
  it_cv_profiles: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=500&q=80',
  sales_marketing_cvs: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
  office_accounts_cvs: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80',
  technical_driver_cvs: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=500&q=80',

  // Business & Industry
  wholesale_bulk_lots: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=500&q=80',
  packaging_raw_materials: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80',
  gift_items: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80',
  antiques: subAntiquesImg,
  miscellaneous: subSurplusMiscImg
};

/**
 * 3. Level 3: Second-Level Categories & Brands
 */
export const BRAND_SECOND_LEVEL_IMAGES: Record<string, string> = {
  // Mobile Phone Brands
  apple: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80',
  samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
  xiaomi: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  redmi: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  poco: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  oneplus: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
  realme: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
  vivo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
  iqoo: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
  oppo: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=400&q=80',
  google_pixel: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  motorola: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  huawei: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
  honor: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
  infinix: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  tecno: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  itel: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=400&q=80',
  walton_phone: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
  symphony: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=400&q=80',
  nothing_phone: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  sony_phone: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80',
  asus_phone: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  nokia_smart: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=400&q=80',

  // Feature Phones
  nokia_feature: subFeaturePhonesImg,
  symphony_feature: subFeaturePhonesImg,
  walton_feature: subFeaturePhonesImg,
  itel_feature: subFeaturePhonesImg,

  // Tablets
  apple_ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  samsung_tab: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  xiaomi_pad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',

  // Smart Watches
  apple_watch: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
  samsung_watch: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
  amazfit: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',

  // Earbuds
  apple_airpods: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
  samsung_buds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
  sony_headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',

  // Chargers
  fast_chargers: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
  power_banks_item: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80',

  // Laptops
  apple_macbook: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  macbook: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  hp_laptop: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
  dell_laptop: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80',
  lenovo_laptop: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=400&q=80',
  asus_laptop: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80',
  acer_laptop: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
  msi_laptop: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80',

  // Desktop PCs & Components
  custom_gaming_pc: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80',
  brand_pc: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80',
  all_in_one_pc: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80',
  intel_cpus: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
  amd_ryzen_cpus: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
  nvidia_rtx_gpus: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
  motherboards: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
  samsung_ssd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80',
  desktop_laptop_ram: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=400&q=80',

  // Monitors
  gaming_monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
  '4k_curved_monitors': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
  office_monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',

  // Routers
  tplink_routers: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  wifi6_wifi7_routers: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',

  // Printers & Keyboards
  ink_tank_laser_printers: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80',
  mechanical_keyboards_mice: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',

  // Televisions
  sony_bravia: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  samsung_tv: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  lg_oled_tv: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  tcl_qled_tv: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  xiaomi_tv: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  walton_vision_tv: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',

  // Sound & Speakers
  sony_soundbars: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80',
  jbl_partybox: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80',
  marshall_speakers: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80',

  // Cameras & Drones
  sony_alpha_cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
  canon_cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
  dji_drones_gimbals: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
  gopro_insta360: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',

  // AC & Cooling
  gree_inverter_ac: subAirConditionerImg,
  general_daikin_ac: subAirConditionerImg,
  walton_vision_ac: subAirConditionerImg,
  tonnage_split_ac: subAirConditionerImg,

  // Refrigerators
  samsung_side_by_side: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80',
  walton_fridge: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80',
  lg_smart_fridge: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80',
  deep_freezers: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80',

  // Gaming Consoles
  playstation_5: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
  xbox_series: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
  nintendo_switch: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',

  // Tablets & Accessories
  lenovo_tab: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  huawei_tab: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  surface_tab: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  other_tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
  other_smartphones: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
  other_feature_phones: subFeaturePhonesImg,

  // Wearables & Audio
  huawei_watch: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
  garmin: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
  xiaomi_watch: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
  other_smartwatches: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80',
  anker_soundcore: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
  jbl_bose_audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
  other_earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
  power_banks: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80',
  type_c_cables: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
  wireless_chargers: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',

  // CCTV & Security
  hikvision_cctv: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
  dahua_surveillance: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
  ezviz_imou_wifi: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
  washing_home_appliances: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',

  // Cars & Vehicles
  toyota: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
  honda: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=80',
  nissan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
  mitsubishi: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
  hyundai: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80',
  mercedes_benz: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=80',
  bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80',
  audi: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=400&q=80',

  // Motorcycles
  yamaha: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  honda_bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  suzuki_bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  bajaj: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  tvs: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  hero: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  royal_enfield: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',

  // Furniture Items
  l_shaped_sofas: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  sofa_sets_321: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  recliners_sofabeds: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  king_queen_beds: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
  orthopedic_mattresses: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
  bunk_storage_beds: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
  '4_door_wardrobes': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
  sliding_wardrobes: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
  dressers_drawers: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
  '6_chair_dining': 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=400&q=80',
  ergonomic_office_chairs: subOfficeFurnitureImg,

  // Fashion Items
  panjabi_pajama: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
  casual_formal_shirts: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
  jeans_trousers: subJeansTrousersImg,
  suits_blazers: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
  sharees: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
  salwar_kameez_kurtis: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
  abayas_hijabs: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80',
  gowns_lehengas: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80',
  sneakers_sports_shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
  formal_leather_shoes: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80',
  luxury_watches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
  gold_diamond_jewellery: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80',
  sunglasses_belts: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',

  // Beauty Items
  serums_toners: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
  mens_edp_cologne: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80',
  womens_perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80',
  lipsticks_lipgloss: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',

  // Baby & Toys
  rc_cars_drones: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80',
  baby_strollers_prams: subBabyStrollerImg,

  // Sports Items
  cricket_bats_kits: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80',
  treadmills_exercise_bikes: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
  acoustic_electric_guitars: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80',

  // Animals
  qurbani_bulls: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80',
  black_bengal_goats: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80',
  persian_cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',

  // Food Items
  dhaka_kacchi_biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
  gourmet_beef_burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  custom_birthday_cakes: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',

  // Repair & Construction
  steel_rod_cement: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
  bricks_sand_stone: 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&w=400&q=80',
  tiles_sanitary_fittings: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
  paints_waterproofing: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
  power_drills_tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=80',
  electrical_cables_boards: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=400&q=80',

  // Seeking Work - CVs
  web_software_cv: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80',
  graphic_design_cv: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80',
  sales_executive_cv: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  delivery_rider_cv: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=400&q=80',
  accounts_admin_cv: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
  driver_technician_cv: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80',

  // Business & Industry
  garments_stock_lots: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
  wholesale_fmcg_goods: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=400&q=80',
  carton_packaging_supplies: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
  industrial_raw_materials: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
};

/**
 * Get high-resolution realistic image for any Category (Level 1)
 */
export function getCategoryImageUrl(categoryId: string, explicitImage?: string): string {
  const key = String(categoryId || '').toLowerCase().trim();
  if (activeImageOverrides[key]) {
    return activeImageOverrides[key];
  }
  const canonicalPair = MAIN_CATEGORY_DUAL_IMAGES[key] || MAIN_CATEGORY_DUAL_IMAGES.business_industry;
  if (
    explicitImage &&
    explicitImage.trim() !== '' &&
    !explicitImage.includes('_isolated_') &&
    !explicitImage.startsWith('/assets/cat_') &&
    !LEGACY_V2_MAIN_UNSPLASH_URLS.has(explicitImage.trim())
  ) {
    return explicitImage;
  }
  return canonicalPair[0];
}

/**
 * Get at least 2 distinct realistic item photos for any Category (Level 1)
 */
export function getCategoryDualImages(
  categoryId: string,
  explicitPrimary?: string,
  explicitSecondary?: string,
  explicitImages?: string[]
): [string, string] {
  const key = String(categoryId || '').toLowerCase().trim();
  const canonicalPair = MAIN_CATEGORY_DUAL_IMAGES[key] || MAIN_CATEGORY_DUAL_IMAGES.business_industry;
  const cleanExplicit = (url?: string) => {
    const trimmed = url ? url.trim() : '';
    if (
      !trimmed ||
      trimmed.includes('_isolated_') ||
      trimmed.startsWith('/assets/cat_') ||
      LEGACY_V2_MAIN_UNSPLASH_URLS.has(trimmed)
    ) {
      return '';
    }
    return trimmed;
  };

  const overridePrimary = activeImageOverrides[key]?.trim() || '';
  const arrFirst = Array.isArray(explicitImages) ? cleanExplicit(explicitImages[0]) : '';
  const arrSecond = Array.isArray(explicitImages) ? cleanExplicit(explicitImages[1]) : '';

  const first = overridePrimary || cleanExplicit(explicitPrimary) || arrFirst || canonicalPair[0];
  let second = cleanExplicit(explicitSecondary) || arrSecond || canonicalPair[1];

  if (!second || second === first) {
    second = canonicalPair[1] !== first ? canonicalPair[1] : canonicalPair[0];
  }
  if (!second || second === first) {
    second = MAIN_CATEGORY_DUAL_IMAGES.electronics[1];
  }

  return [first, second];
}

/**
 * Get high-resolution realistic image for any Subcategory (Level 2)
 */
export function getSubcategoryImageUrl(
  categoryId: string,
  subCategoryId: string,
  explicitImage?: string
): string {
  const subKey = String(subCategoryId || '').toLowerCase().trim();
  if (activeImageOverrides[subKey]) {
    return activeImageOverrides[subKey];
  }
  if (explicitImage && explicitImage.trim() !== '') return explicitImage;
  if (SUBCATEGORY_IMAGES[subKey]) return SUBCATEGORY_IMAGES[subKey];
  return getCategoryImageUrl(categoryId);
}

/**
 * Get high-resolution realistic image for any Second-Level Category (Level 3)
 */
export function getSecondLevelImageUrl(
  categoryId: string,
  subCategoryId: string,
  secondLevelId: string,
  secondLevelNameEn?: string,
  explicitImage?: string
): string {
  const slKey = String(secondLevelId || '').toLowerCase().trim();
  if (activeImageOverrides[slKey]) {
    return activeImageOverrides[slKey];
  }

  const nameKey = String(secondLevelNameEn || '').toLowerCase().trim().replace(/\s+/g, '_');
  if (activeImageOverrides[nameKey]) {
    return activeImageOverrides[nameKey];
  }

  if (explicitImage && explicitImage.trim() !== '') return explicitImage;

  if (BRAND_SECOND_LEVEL_IMAGES[slKey]) return BRAND_SECOND_LEVEL_IMAGES[slKey];
  if (BRAND_SECOND_LEVEL_IMAGES[nameKey]) return BRAND_SECOND_LEVEL_IMAGES[nameKey];

  return getSubcategoryImageUrl(categoryId, subCategoryId);
}

/**
 * Interface representing a manageable item in the hierarchy
 */
export interface CategoryImageItemCatalog {
  key: string;
  level: 'main' | 'subcategory' | 'second_level';
  nameEn: string;
  nameBn: string;
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
