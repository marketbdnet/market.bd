import { Category } from '../types';
import { MAIN_CATEGORY_DUAL_IMAGES, SUBCATEGORY_IMAGES } from '../utils/categoryImages';

export const CATEGORIES: Category[] = [
  // 1. Vehicles & Auto
  {
    id: 'vehicles',
    nameEn: 'Vehicles & Auto',
    nameBn: 'যানবাহন ও অটোমোবাইল',
    icon: 'Car',
    image: MAIN_CATEGORY_DUAL_IMAGES.vehicles[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.vehicles[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.vehicles,
    catVersion: 4,
    count: 0,
    popularBrands: ['Toyota', 'Yamaha', 'Honda', 'Suzuki', 'Bajaj', 'TVS', 'Hero', 'Royal Enfield', 'Nissan', 'Hyundai', 'Mitsubishi', 'Mercedes-Benz', 'BMW', 'Kia', 'Ford', 'Chevrolet', 'Audi', 'Tesla', 'Runner', 'KTM', 'Kawasaki', 'Lifan', 'Walton', 'Vespa'],
    subcategories: [
      {
        id: 'cars',
        nameEn: 'Cars',
        nameBn: 'কার ও প্রাইভেট কার',
        icon: 'Car',
        image: SUBCATEGORY_IMAGES.cars,
        count: 0,
        secondLevelCategories: [
          { id: 'toyota', nameEn: 'Toyota', nameBn: 'টোয়োটা', icon: 'Car', count: 0 },
          { id: 'honda', nameEn: 'Honda', nameBn: 'হোন্ডা', icon: 'Car', count: 0 },
          { id: 'nissan', nameEn: 'Nissan', nameBn: 'নিসান', icon: 'Car', count: 0 },
          { id: 'mitsubishi', nameEn: 'Mitsubishi', nameBn: 'মিটসুবিশি', icon: 'Car', count: 0 },
          { id: 'hyundai', nameEn: 'Hyundai', nameBn: 'হুন্দাই', icon: 'Car', count: 0 },
          { id: 'kia', nameEn: 'Kia', nameBn: 'কিয়া', icon: 'Car', count: 0 },
          { id: 'mazda', nameEn: 'Mazda', nameBn: 'মাজদা', icon: 'Car', count: 0 },
          { id: 'bmw', nameEn: 'BMW', nameBn: 'বিএমডব্লিউ', icon: 'Car', count: 0 },
          { id: 'mercedes_benz', nameEn: 'Mercedes-Benz', nameBn: 'মার্সিডিজ-বেঞ্জ', icon: 'Car', count: 0 },
          { id: 'audi', nameEn: 'Audi', nameBn: 'অডি', icon: 'Car', count: 0 },
          { id: 'tesla', nameEn: 'Tesla', nameBn: 'টেসলা', icon: 'Zap', count: 0 },
          { id: 'suzuki', nameEn: 'Suzuki', nameBn: 'সুজুকি', icon: 'Car', count: 0 },
          { id: 'ford', nameEn: 'Ford', nameBn: 'ফোর্ড', icon: 'Car', count: 0 },
          { id: 'chevrolet', nameEn: 'Chevrolet', nameBn: 'শেভ্রোলে', icon: 'Car', count: 0 },
          { id: 'other_cars', nameEn: 'Other Cars', nameBn: 'অন্যান্য গাড়ি', icon: 'Car', count: 0 }
        ]
      },
      {
        id: 'motorcycles_scooters',
        nameEn: 'Motorcycles & Scooters',
        nameBn: 'মোটরসাইকেল ও স্কুটার',
        icon: 'Bike',
        image: SUBCATEGORY_IMAGES.motorcycles_scooters,
        count: 0,
        secondLevelCategories: [
          { id: 'yamaha', nameEn: 'Yamaha', nameBn: 'ইয়ামাহা', icon: 'Bike', count: 0 },
          { id: 'honda_bike', nameEn: 'Honda', nameBn: 'হোন্ডা', icon: 'Bike', count: 0 },
          { id: 'suzuki_bike', nameEn: 'Suzuki', nameBn: 'সুজুকি', icon: 'Bike', count: 0 },
          { id: 'bajaj', nameEn: 'Bajaj', nameBn: 'বাজাজ', icon: 'Bike', count: 0 },
          { id: 'tvs', nameEn: 'TVS', nameBn: 'টিভিএস', icon: 'Bike', count: 0 },
          { id: 'hero', nameEn: 'Hero', nameBn: 'হিরো', icon: 'Bike', count: 0 },
          { id: 'runner', nameEn: 'Runner', nameBn: 'রানার', icon: 'Bike', count: 0 },
          { id: 'ktm', nameEn: 'KTM', nameBn: 'কেটিএম', icon: 'Bike', count: 0 },
          { id: 'royal_enfield', nameEn: 'Royal Enfield', nameBn: 'রয়্যাল এনফিল্ড', icon: 'Bike', count: 0 },
          { id: 'kawasaki', nameEn: 'Kawasaki', nameBn: 'কাওয়াসাকি', icon: 'Bike', count: 0 },
          { id: 'lifan', nameEn: 'Lifan', nameBn: 'লিফান', icon: 'Bike', count: 0 },
          { id: 'walton_bike', nameEn: 'Walton', nameBn: 'ওয়ালটন', icon: 'Bike', count: 0 },
          { id: 'vespa', nameEn: 'Vespa', nameBn: 'ভেসপা', icon: 'Bike', count: 0 },
          { id: 'other_motorcycles', nameEn: 'Other Motorcycles', nameBn: 'অন্যান্য মোটরসাইকেল', icon: 'Bike', count: 0 },
          { id: 'scooters', nameEn: 'Scooters', nameBn: 'স্কুটার', icon: 'Bike', count: 0 }
        ]
      },
      {
        id: 'buses_microbuses',
        nameEn: 'Buses & Microbuses',
        nameBn: 'বাস ও মাইক্রোবাস',
        icon: 'Bus',
        image: SUBCATEGORY_IMAGES.buses_microbuses,
        count: 0,
        secondLevelCategories: [
          { id: 'buses', nameEn: 'Buses', nameBn: 'বাস', icon: 'Bus', count: 0 },
          { id: 'mini_buses', nameEn: 'Mini Buses', nameBn: 'মিনি বাস', icon: 'Bus', count: 0 },
          { id: 'microbuses', nameEn: 'Microbuses & HiAce', nameBn: 'মাইক্রোবাস ও হায়েস', icon: 'Bus', count: 0 },
          { id: 'tourist_buses', nameEn: 'Tourist Buses', nameBn: 'ট্যুরিস্ট বাস', icon: 'Bus', count: 0 },
          { id: 'other_buses_microbuses', nameEn: 'Other Buses & Vans', nameBn: 'অন্যান্য বাস ও ভ্যান', icon: 'Bus', count: 0 }
        ]
      },
      {
        id: 'vehicle_parts_accessories',
        nameEn: 'Auto Parts & Accessories',
        nameBn: 'গাড়ির পার্টস ও অ্যাক্সেসরিজ',
        icon: 'Wrench',
        image: SUBCATEGORY_IMAGES.vehicle_parts_accessories,
        count: 0,
        secondLevelCategories: [
          { id: 'engine_drivetrain', nameEn: 'Engine & Drivetrain', nameBn: 'ইঞ্জিন ও পার্টস', icon: 'Wrench', count: 0 },
          { id: 'tires_wheels', nameEn: 'Tires & Alloy Wheels', nameBn: 'টায়ার ও চাকা', icon: 'Wrench', count: 0 },
          { id: 'batteries', nameEn: 'Batteries', nameBn: 'ব্যাটারি', icon: 'Wrench', count: 0 },
          { id: 'headlights_lighting', nameEn: 'Headlights & LED', nameBn: 'হেডলাইট ও লাইটিং', icon: 'Wrench', count: 0 },
          { id: 'motorcycle_parts', nameEn: 'Motorcycle Parts', nameBn: 'মোটরসাইকেল পার্টস', icon: 'Bike', count: 0 },
          { id: 'car_interior_accessories', nameEn: 'Interior & Multimedia', nameBn: 'ইন্টেরিয়র ও অ্যান্ড্রয়েড প্লেয়ার', icon: 'Wrench', count: 0 },
          { id: 'other_parts_accessories', nameEn: 'Other Parts', nameBn: 'অন্যান্য পার্টস', icon: 'Wrench', count: 0 }
        ]
      },
      {
        id: 'trucks_heavy_vehicles',
        nameEn: 'Trucks & Heavy Vehicles',
        nameBn: 'ট্রাক ও হেভি ভেহিকেল',
        icon: 'Truck',
        image: SUBCATEGORY_IMAGES.trucks_heavy_vehicles,
        count: 0,
        secondLevelCategories: [
          { id: 'pickup_trucks', nameEn: 'Pickup Trucks', nameBn: 'পিকআপ ট্রাক', icon: 'Truck', count: 0 },
          { id: 'covered_vans', nameEn: 'Covered Vans', nameBn: 'কাভার্ড ভ্যান', icon: 'Truck', count: 0 },
          { id: 'cargo_trucks', nameEn: 'Cargo Trucks', nameBn: 'কার্গো ট্রাক', icon: 'Truck', count: 0 },
          { id: 'dump_trucks', nameEn: 'Dump Trucks', nameBn: 'ডাম্প ট্রাক', icon: 'Truck', count: 0 },
          { id: 'heavy_machinery', nameEn: 'Heavy Machinery', nameBn: 'হেভি মেশিনারি', icon: 'Truck', count: 0 }
        ]
      },
      {
        id: 'bicycles',
        nameEn: 'Bicycles',
        nameBn: 'বাইসাইকেল',
        icon: 'Bike',
        image: SUBCATEGORY_IMAGES.bicycles,
        count: 0,
        secondLevelCategories: [
          { id: 'mountain_bikes', nameEn: 'Mountain Bikes (MTB)', nameBn: 'মাউন্টেন বাইক (MTB)', icon: 'Bike', count: 0 },
          { id: 'city_bikes', nameEn: 'City & Commuter Bikes', nameBn: 'সিটি বাইক', icon: 'Bike', count: 0 },
          { id: 'road_bikes', nameEn: 'Road Bikes', nameBn: 'রোড বাইক', icon: 'Bike', count: 0 },
          { id: 'kids_bicycles', nameEn: 'Kids Bicycles', nameBn: 'শিশুদের সাইকেল', icon: 'Bike', count: 0 },
          { id: 'electric_bicycles', nameEn: 'Electric Bicycles (E-Bike)', nameBn: 'ইলেকট্রিক সাইকেল', icon: 'Bike', count: 0 },
          { id: 'other_bicycles', nameEn: 'Other Bicycles & Parts', nameBn: 'অন্যান্য সাইকেল', icon: 'Bike', count: 0 }
        ]
      },
      {
        id: 'three_wheelers',
        nameEn: 'Three Wheelers & Auto',
        nameBn: 'থ্রি হুইলার ও অটোরিকশা',
        icon: 'Car',
        image: SUBCATEGORY_IMAGES.three_wheelers,
        count: 0,
        secondLevelCategories: [
          { id: 'cng_auto_rickshaw', nameEn: 'CNG Auto Rickshaw', nameBn: 'সিএনজি অটোরিকশা', icon: 'Car', count: 0 },
          { id: 'battery_auto_rickshaw', nameEn: 'Battery Auto Rickshaw', nameBn: 'ব্যাটারি অটোরিকশা', icon: 'Car', count: 0 },
          { id: 'easy_bike', nameEn: 'Easy Bike', nameBn: 'ইজি বাইক', icon: 'Car', count: 0 },
          { id: 'cargo_three_wheelers', nameEn: 'Cargo Three Wheelers', nameBn: 'কার্গো ভ্যান', icon: 'Car', count: 0 }
        ]
      },
      {
        id: 'tractors_agricultural_vehicles',
        nameEn: 'Tractors & Agri Vehicles',
        nameBn: 'ট্রাক্টর ও কৃষি যানবাহন',
        icon: 'Tractor',
        image: SUBCATEGORY_IMAGES.tractors_agricultural_vehicles,
        count: 0,
        secondLevelCategories: [
          { id: 'tractors', nameEn: 'Tractors', nameBn: 'ট্রাক্টর', icon: 'Tractor', count: 0 },
          { id: 'power_tillers', nameEn: 'Power Tillers', nameBn: 'পাওয়ার টিলার', icon: 'Tractor', count: 0 },
          { id: 'harvesters', nameEn: 'Combine Harvesters', nameBn: 'কম্বাইন হারভেস্টার', icon: 'Tractor', count: 0 },
          { id: 'tractor_parts', nameEn: 'Tractor Parts & Trailers', nameBn: 'ট্রাক্টর পার্টস', icon: 'Tractor', count: 0 }
        ]
      },
      {
        id: 'water_transport',
        nameEn: 'Water Transport',
        nameBn: 'নৌযান ও বোট',
        icon: 'Ship',
        image: SUBCATEGORY_IMAGES.water_transport,
        count: 0,
        secondLevelCategories: [
          { id: 'boats_trawlers', nameEn: 'Boats & Trawlers', nameBn: 'নৌকা ও ট্রলার', icon: 'Ship', count: 0 },
          { id: 'speed_boats', nameEn: 'Speed Boats & Jet Skis', nameBn: 'স্পিড বোট', icon: 'Ship', count: 0 },
          { id: 'launches_ships', nameEn: 'Launches & Passenger Boats', nameBn: 'লঞ্চ ও যাত্রীবাহী বোট', icon: 'Ship', count: 0 },
          { id: 'marine_engines', nameEn: 'Marine Engines & Parts', nameBn: 'মেরিন ইঞ্জিন ও পার্টস', icon: 'Ship', count: 0 }
        ]
      }
    ]
  },

  // 2. Property & Land
  {
    id: 'property',
    nameEn: 'Property & Land',
    nameBn: 'প্রপার্টি ও জমি',
    icon: 'Home',
    image: MAIN_CATEGORY_DUAL_IMAGES.property[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.property[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.property,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'apartments_sale',
        nameEn: 'Apartments for Sale',
        nameBn: 'ফ্ল্যাট বিক্রয়',
        icon: 'Home',
        image: SUBCATEGORY_IMAGES.apartments_sale,
        count: 0,
        secondLevelCategories: [
          { id: 'ready_flats', nameEn: 'Ready Flats', nameBn: 'রেডি ফ্ল্যাট', icon: 'Home', count: 0 },
          { id: 'under_construction_flats', nameEn: 'Under Construction Flats', nameBn: 'চলমান প্রজেক্ট', icon: 'Home', count: 0 },
          { id: 'duplex_luxury_flats', nameEn: 'Duplex & Penthouses', nameBn: 'ডুপ্লেক্স ও পেন্টহাউস', icon: 'Home', count: 0 },
          { id: 'studio_apartments', nameEn: 'Studio Apartments', nameBn: 'স্টুডিও অ্যাপার্টমেন্ট', icon: 'Home', count: 0 }
        ]
      },
      {
        id: 'apartments_rent',
        nameEn: 'Apartments for Rent',
        nameBn: 'ফ্ল্যাট ভাড়া',
        icon: 'Home',
        image: SUBCATEGORY_IMAGES.apartments_rent,
        count: 0,
        secondLevelCategories: [
          { id: 'family_apartments', nameEn: 'Family Apartments', nameBn: 'ফ্যামিলি ফ্ল্যাট', icon: 'Home', count: 0 },
          { id: 'bachelor_flats', nameEn: 'Bachelor Flats', nameBn: 'ব্যাচেলর বাসা', icon: 'Home', count: 0 },
          { id: 'furnished_apartments', nameEn: 'Furnished Service Flats', nameBn: 'ফার্নিশড ফ্ল্যাট', icon: 'Home', count: 0 }
        ]
      },
      {
        id: 'land',
        nameEn: 'Land & Plots',
        nameBn: 'জমি ও প্লট',
        icon: 'Layers',
        image: SUBCATEGORY_IMAGES.land,
        count: 0,
        secondLevelCategories: [
          { id: 'residential_plots', nameEn: 'Residential Plots', nameBn: 'আবাসিক প্লট', icon: 'Layers', count: 0 },
          { id: 'commercial_land', nameEn: 'Commercial Land', nameBn: 'বাণিজ্যিক জমি', icon: 'Layers', count: 0 },
          { id: 'agricultural_land_prop', nameEn: 'Agricultural Land', nameBn: 'কৃষি জমি', icon: 'Layers', count: 0 }
        ]
      },
      {
        id: 'commercial',
        nameEn: 'Commercial Property',
        nameBn: 'বাণিজ্যিক সম্পত্তি ও স্পেস',
        icon: 'Building2',
        image: SUBCATEGORY_IMAGES.commercial,
        count: 0,
        secondLevelCategories: [
          { id: 'office_space_comm', nameEn: 'Office Space', nameBn: 'অফিস স্পেস', icon: 'Building2', count: 0 },
          { id: 'shops_showrooms', nameEn: 'Shops & Showrooms', nameBn: 'দোকান ও শোরুম', icon: 'Building2', count: 0 },
          { id: 'warehouses_godowns', nameEn: 'Warehouses & Godowns', nameBn: 'গুদাম ও ফ্যাক্টরি', icon: 'Building2', count: 0 }
        ]
      },
      {
        id: 'houses',
        nameEn: 'Houses & Villas',
        nameBn: 'বাড়ি ও ভিলা',
        icon: 'Home',
        image: SUBCATEGORY_IMAGES.houses,
        count: 0,
        secondLevelCategories: [
          { id: 'duplex_houses', nameEn: 'Duplex Houses', nameBn: 'ডুপ্লেক্স বাড়ি', icon: 'Home', count: 0 },
          { id: 'complete_buildings', nameEn: 'Multi-Storey Buildings', nameBn: 'সম্পূর্ণ বিল্ডিং', icon: 'Home', count: 0 },
          { id: 'villas_farmhouses', nameEn: 'Luxury Villas & Farmhouses', nameBn: 'ভিলা ও বাগানবাড়ি', icon: 'Home', count: 0 }
        ]
      }
    ]
  },

  // 3. Phones & Accessories
  {
    id: 'mobiles',
    nameEn: 'Phones & Accessories',
    nameBn: 'ফোন ও অ্যাক্সেসরিজ',
    icon: 'Smartphone',
    image: MAIN_CATEGORY_DUAL_IMAGES.mobiles[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.mobiles[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.mobiles,
    catVersion: 4,
    count: 0,
    popularBrands: ['Apple', 'Samsung', 'Xiaomi', 'Redmi', 'POCO', 'OnePlus', 'Realme', 'Vivo', 'iQOO', 'OPPO', 'Google Pixel', 'Motorola', 'Huawei', 'Honor', 'Infinix', 'TECNO', 'itel', 'Walton', 'Symphony', 'Nothing', 'Sony', 'Nokia', 'ASUS'],
    subcategories: [
      {
        id: 'smartphones',
        nameEn: 'Mobile Phones',
        nameBn: 'স্মার্টফোন',
        icon: 'Smartphone',
        image: SUBCATEGORY_IMAGES.smartphones,
        count: 0,
        secondLevelCategories: [
          { id: 'apple', nameEn: 'Apple iPhone', nameBn: 'অ্যাপল আইফোন', icon: 'Smartphone', count: 0 },
          { id: 'samsung', nameEn: 'Samsung Galaxy', nameBn: 'স্যামসাং গ্যালাক্সি', icon: 'Smartphone', count: 0 },
          { id: 'xiaomi', nameEn: 'Xiaomi Flagship', nameBn: 'শাওমি ফ্ল্যাগশিপ', icon: 'Smartphone', count: 0 },
          { id: 'redmi', nameEn: 'Redmi Series', nameBn: 'রেডমি সিরিজ', icon: 'Smartphone', count: 0 },
          { id: 'poco', nameEn: 'POCO Performance', nameBn: 'পোকো গেমিং ও ৫জি', icon: 'Smartphone', count: 0 },
          { id: 'oneplus', nameEn: 'OnePlus & Nord', nameBn: 'ওয়ানপ্লাস ও নর্ড', icon: 'Smartphone', count: 0 },
          { id: 'realme', nameEn: 'Realme & Narzo', nameBn: 'রিয়েলমি ও নার্জো', icon: 'Smartphone', count: 0 },
          { id: 'vivo', nameEn: 'Vivo V & Y Series', nameBn: 'ভিভো ভি ও ওয়াই সিরিজ', icon: 'Smartphone', count: 0 },
          { id: 'iqoo', nameEn: 'iQOO Gaming', nameBn: 'আইকু গেমিং ফোন', icon: 'Smartphone', count: 0 },
          { id: 'oppo', nameEn: 'OPPO Reno & Find', nameBn: 'অপ্পো রেনো ও ফাইন্ড', icon: 'Smartphone', count: 0 },
          { id: 'google_pixel', nameEn: 'Google Pixel', nameBn: 'গুগল পিক্সেল', icon: 'Smartphone', count: 0 },
          { id: 'motorola', nameEn: 'Motorola Edge & G', nameBn: 'মটোরোলা এজ ও জি', icon: 'Smartphone', count: 0 },
          { id: 'huawei', nameEn: 'Huawei Mate & Pura', nameBn: 'হুয়াওয়ে মেট ও পুরা', icon: 'Smartphone', count: 0 },
          { id: 'honor', nameEn: 'Honor Magic & Number', nameBn: 'অনার ম্যাজিক ও ২০০ সিরিজ', icon: 'Smartphone', count: 0 },
          { id: 'infinix', nameEn: 'Infinix Note & GT', nameBn: 'ইনফিনিক্স নোট ও জিটি', icon: 'Smartphone', count: 0 },
          { id: 'tecno', nameEn: 'TECNO Camon & Spark', nameBn: 'টেকনো ক্যামন ও স্পার্ক', icon: 'Smartphone', count: 0 },
          { id: 'itel', nameEn: 'itel Curved & Budget', nameBn: 'আইটেল স্মার্টফোন', icon: 'Smartphone', count: 0 },
          { id: 'walton_phone', nameEn: 'Walton NEXG & Primo', nameBn: 'ওয়ালটন নেক্সজি ও প্রিমো', icon: 'Smartphone', count: 0 },
          { id: 'symphony', nameEn: 'Symphony Helio & Z', nameBn: 'সিম্ফনি হেলিও ও জেড', icon: 'Smartphone', count: 0 },
          { id: 'nothing_phone', nameEn: 'Nothing & CMF Phone', nameBn: 'নাথিং ও সিএমএফ ফোন', icon: 'Smartphone', count: 0 },
          { id: 'sony_phone', nameEn: 'Sony Xperia', nameBn: 'সনি এক্সপেরিয়া', icon: 'Smartphone', count: 0 },
          { id: 'asus_phone', nameEn: 'ASUS ROG & Zenfone', nameBn: 'আসুস আরওজি ফোন', icon: 'Smartphone', count: 0 },
          { id: 'nokia_smart', nameEn: 'Nokia & HMD', nameBn: 'নোকিয়া ও এইচএমডি', icon: 'Smartphone', count: 0 },
          { id: 'other_smartphones', nameEn: 'Other Smartphones', nameBn: 'অন্যান্য স্মার্টফোন', icon: 'Smartphone', count: 0 }
        ]
      },
      {
        id: 'feature_phones',
        nameEn: 'Feature Phones',
        nameBn: 'বাটন ফোন',
        icon: 'Smartphone',
        image: SUBCATEGORY_IMAGES.feature_phones,
        count: 0,
        secondLevelCategories: [
          { id: 'nokia_feature', nameEn: 'Nokia Classic 4G & 2G', nameBn: 'নোকিয়া বাটন ফোন', icon: 'Smartphone', count: 0 },
          { id: 'symphony_feature', nameEn: 'Symphony Keypad Phones', nameBn: 'সিম্ফনি বাটন ফোন', icon: 'Smartphone', count: 0 },
          { id: 'walton_feature', nameEn: 'Walton Olvio Keypad', nameBn: 'ওয়ালটন অলভিও বাটন ফোন', icon: 'Smartphone', count: 0 },
          { id: 'itel_feature', nameEn: 'itel Super Guru & Magic', nameBn: 'আইটেল বাটন ফোন', icon: 'Smartphone', count: 0 },
          { id: 'other_feature_phones', nameEn: 'Other Feature Phones', nameBn: 'অন্যান্য বাটন ফোন', icon: 'Smartphone', count: 0 }
        ]
      },
      {
        id: 'tablets',
        nameEn: 'Tablets & iPads',
        nameBn: 'ট্যাবলেট ও আইপ্যাড',
        icon: 'Tablet',
        image: SUBCATEGORY_IMAGES.tablets,
        count: 0,
        secondLevelCategories: [
          { id: 'apple_ipad', nameEn: 'Apple iPad (Pro / Air / Mini / Gen)', nameBn: 'অ্যাপল আইপ্যাড', icon: 'Tablet', count: 0 },
          { id: 'samsung_tab', nameEn: 'Samsung Galaxy Tab (S & A Series)', nameBn: 'স্যামসাং গ্যালাক্সি ট্যাব', icon: 'Tablet', count: 0 },
          { id: 'xiaomi_pad', nameEn: 'Xiaomi & Redmi Pad', nameBn: 'শাওমি ও রেডমি প্যাড', icon: 'Tablet', count: 0 },
          { id: 'lenovo_tab', nameEn: 'Lenovo Legion & Yoga Tab', nameBn: 'লেনোভো ট্যাব', icon: 'Tablet', count: 0 },
          { id: 'huawei_tab', nameEn: 'Huawei & Honor MatePad', nameBn: 'হুয়াওয়ে ও অনার প্যাড', icon: 'Tablet', count: 0 },
          { id: 'surface_tab', nameEn: 'Microsoft Surface Pro', nameBn: 'মাইক্রোসফট সারফেস প্রো', icon: 'Tablet', count: 0 },
          { id: 'other_tablets', nameEn: 'Other Tablets', nameBn: 'অন্যান্য ট্যাবলেট', icon: 'Tablet', count: 0 }
        ]
      },
      {
        id: 'smart_watches',
        nameEn: 'Wearables & Smart Watches',
        nameBn: 'স্মার্ট ঘড়ি ও ফিটনেস ব্যান্ড',
        icon: 'Watch',
        image: SUBCATEGORY_IMAGES.smart_watches,
        count: 0,
        secondLevelCategories: [
          { id: 'apple_watch', nameEn: 'Apple Watch Ultra & Series', nameBn: 'অ্যাপল ওয়াচ আল্ট্রা ও সিরিজ', icon: 'Watch', count: 0 },
          { id: 'samsung_watch', nameEn: 'Samsung Galaxy Watch Ultra & 7', nameBn: 'স্যামসাং গ্যালাক্সি ওয়াচ', icon: 'Watch', count: 0 },
          { id: 'amazfit', nameEn: 'Amazfit T-Rex, GTR & GTS', nameBn: 'অ্যামাজফিট টি-রেক্স ও জিটিআর', icon: 'Watch', count: 0 },
          { id: 'huawei_watch', nameEn: 'Huawei Watch GT & Fit', nameBn: 'হুয়াওয়ে ওয়াচ জিটি ও ফিট', icon: 'Watch', count: 0 },
          { id: 'garmin', nameEn: 'Garmin Fenix, Forerunner & Epix', nameBn: 'গারমিন মাল্টিস্পোর্ট জিপিএস', icon: 'Watch', count: 0 },
          { id: 'xiaomi_watch', nameEn: 'Xiaomi Watch, Haylou & Kieslect', nameBn: 'শাওমি, হাইলু ও কিসলেকট', icon: 'Watch', count: 0 },
          { id: 'other_smartwatches', nameEn: 'Other Smart Watches', nameBn: 'অন্যান্য স্মার্ট ওয়াচ', icon: 'Watch', count: 0 }
        ]
      },
      {
        id: 'earbuds_headphones',
        nameEn: 'Earbuds & Headphones',
        nameBn: 'ইয়ারবাডস ও হেডফোন',
        icon: 'Headphones',
        image: SUBCATEGORY_IMAGES.earbuds_headphones,
        count: 0,
        secondLevelCategories: [
          { id: 'apple_airpods', nameEn: 'Apple AirPods Pro & Max', nameBn: 'অ্যাপল এয়ারপডস প্রো', icon: 'Headphones', count: 0 },
          { id: 'samsung_buds', nameEn: 'Samsung Galaxy Buds3 Pro / FE', nameBn: 'স্যামসাং গ্যালাক্সি বাডস', icon: 'Headphones', count: 0 },
          { id: 'sony_headphones', nameEn: 'Sony WH-1000XM5 / WF-1000XM5', nameBn: 'সনি ১০০০০এক্সএম৫ হেডফোন', icon: 'Headphones', count: 0 },
          { id: 'anker_soundcore', nameEn: 'Anker Soundcore Space & Liberty', nameBn: 'অ্যাংকার সাউন্ডকোর', icon: 'Headphones', count: 0 },
          { id: 'jbl_bose_audio', nameEn: 'JBL & Bose Noise Canceling', nameBn: 'জেবিএল ও বোস হেডফোন', icon: 'Headphones', count: 0 },
          { id: 'other_earbuds', nameEn: 'Other TWS & Neckbands', nameBn: 'অন্যান্য ইয়ারবাডস ও নেকব্যান্ড', icon: 'Headphones', count: 0 }
        ]
      },
      {
        id: 'chargers_cables',
        nameEn: 'Chargers, Cables & Power Banks',
        nameBn: 'চার্জার, কেবল ও পাওয়ার ব্যাংক',
        icon: 'Zap',
        image: SUBCATEGORY_IMAGES.chargers_cables,
        count: 0,
        secondLevelCategories: [
          { id: 'fast_chargers', nameEn: 'GaN & 65W-120W Fast Chargers', nameBn: 'ফাস্ট চার্জার ও জিএএন অ্যাডাপ্টার', icon: 'Zap', count: 0 },
          { id: 'power_banks', nameEn: '10000mAh - 30000mAh Power Banks', nameBn: 'পাওয়ার ব্যাংক ও ম্যাগসেফ', icon: 'BatteryCharging', count: 0 },
          { id: 'type_c_cables', nameEn: 'Type-C, Lightning & Braided Cables', nameBn: 'টাইপ-সি ও লাইটনিং কেবল', icon: 'Zap', count: 0 },
          { id: 'wireless_chargers', nameEn: 'MagSafe & Wireless Charging Stands', nameBn: 'ওয়্যারলেস চার্জিং ডক', icon: 'Zap', count: 0 }
        ]
      },
      {
        id: 'mobile_cases_parts',
        nameEn: 'Mobile Accessories & Parts',
        nameBn: 'মোবাইল কভার, পার্টস ও সার্ভিস',
        icon: 'Shield',
        image: SUBCATEGORY_IMAGES.mobile_cases_parts,
        count: 0,
        secondLevelCategories: [
          { id: 'phone_cases', nameEn: 'Original Cases, Silicone & Armor', nameBn: 'প্রিমিয়াম ব্যাক কভার ও গ্লাস', icon: 'Shield', count: 0 },
          { id: 'displays_touch', nameEn: 'Original OLED & LCD Displays', nameBn: 'অরিজিনাল ডিসপ্লে ও টাচ', icon: 'Wrench', count: 0 },
          { id: 'phone_batteries', nameEn: 'High Capacity Phone Batteries', nameBn: 'অরিজিনাল ব্যাটারি', icon: 'BatteryCharging', count: 0 },
          { id: 'mobile_repair_service', nameEn: 'Mobile Repair & Servicing', nameBn: 'মোবাইল সার্ভিসিং ও মেরামত', icon: 'Wrench', count: 0 }
        ]
      }
    ]
  },

  // 4. Computers & Tech (Laptops, Desktops, Monitors, Printers & Home Electronics)
  {
    id: 'electronics',
    nameEn: 'Computers & Tech',
    nameBn: 'কম্পিউটার ও টেক',
    icon: 'Tv',
    image: MAIN_CATEGORY_DUAL_IMAGES.electronics[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.electronics[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.electronics,
    catVersion: 4,
    count: 0,
    popularBrands: ['Sony', 'Samsung', 'LG', 'TCL', 'Xiaomi', 'Apple MacBook', 'HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Gree', 'General', 'Daikin', 'Walton', 'Vision', 'JBL', 'Canon', 'DJI', 'PlayStation', 'Hikvision'],
    subcategories: [
      {
        id: 'laptops',
        nameEn: 'Laptops & MacBooks',
        nameBn: 'ল্যাপটপ ও ম্যাকবুক',
        icon: 'Laptop',
        image: SUBCATEGORY_IMAGES.laptops,
        count: 0,
        secondLevelCategories: [
          { id: 'apple_macbook', nameEn: 'Apple MacBook (M4 / M3 / M2 / M1)', nameBn: 'অ্যাপল ম্যাকবুক', icon: 'Laptop', count: 0 },
          { id: 'hp_laptop', nameEn: 'HP (Spectre / Envy / Victus / EliteBook)', nameBn: 'এইচপি ল্যাপটপ', icon: 'Laptop', count: 0 },
          { id: 'dell_laptop', nameEn: 'Dell (XPS / Alienware / Inspiron / Latitude)', nameBn: 'ডেল ল্যাপটপ', icon: 'Laptop', count: 0 },
          { id: 'lenovo_laptop', nameEn: 'Lenovo (ThinkPad / Legion / Yoga / LOQ)', nameBn: 'লেনোভো ল্যাপটপ', icon: 'Laptop', count: 0 },
          { id: 'asus_laptop', nameEn: 'ASUS (ROG Zephyrus / TUF / ZenBook)', nameBn: 'আসুস আরওজি ও জেনবুক', icon: 'Laptop', count: 0 },
          { id: 'acer_laptop', nameEn: 'Acer (Predator / Nitro / Swift / Aspire)', nameBn: 'এসার প্রেডেটর ও নাইট্রো', icon: 'Laptop', count: 0 },
          { id: 'msi_laptop', nameEn: 'MSI Gaming & Creator Series', nameBn: 'এমএসআই গেমিং ল্যাপটপ', icon: 'Laptop', count: 0 },
          { id: 'other_laptops', nameEn: 'Microsoft Surface & Other Laptops', nameBn: 'সারফেস ও অন্যান্য ল্যাপটপ', icon: 'Laptop', count: 0 }
        ]
      },
      {
        id: 'desktop_computers',
        nameEn: 'Desktop Computers',
        nameBn: 'ডেস্কটপ কম্পিউটার',
        icon: 'Monitor',
        image: SUBCATEGORY_IMAGES.desktop_computers,
        count: 0,
        secondLevelCategories: [
          { id: 'custom_gaming_pc', nameEn: 'Custom Gaming PC & Rigs', nameBn: 'কাস্টম গেমিং পিসি', icon: 'Monitor', count: 0 },
          { id: 'brand_pc', nameEn: 'Brand PC (HP, Dell, Lenovo)', nameBn: 'ব্র্যান্ড পিসি', icon: 'Monitor', count: 0 },
          { id: 'all_in_one_pc', nameEn: 'All-in-One Desktop PC', nameBn: 'অল-ইন-ওয়ান পিসি', icon: 'Monitor', count: 0 },
          { id: 'mini_pc', nameEn: 'Mini PC & Intel NUC', nameBn: 'মিনি পিসি ও অফিস পিসি', icon: 'Monitor', count: 0 },
          { id: 'workstation_server', nameEn: 'Server & Rendering Workstation', nameBn: 'সার্ভার ও এডিটিং ওয়ার্কস্টেশন', icon: 'Server', count: 0 }
        ]
      },
      {
        id: 'televisions',
        nameEn: 'TVs & Smart Displays',
        nameBn: 'স্মার্ট ও ফোরকে টিভি',
        icon: 'Tv',
        image: SUBCATEGORY_IMAGES.televisions,
        count: 0,
        secondLevelCategories: [
          { id: 'sony_bravia', nameEn: 'Sony BRAVIA (OLED, Mini LED, 4K)', nameBn: 'সনি ব্রাভিয়া ফোরকে ও ওলেড টিভি', icon: 'Tv', count: 0 },
          { id: 'samsung_tv', nameEn: 'Samsung (Neo QLED, OLED, Crystal 4K)', nameBn: 'স্যামসাং কিউলেড ও ক্রিস্টাল টিভি', icon: 'Tv', count: 0 },
          { id: 'lg_oled_tv', nameEn: 'LG (OLED evo, QNED, 4K UHD)', nameBn: 'এলজি ওলেড ইভো ও কিউনেড টিভি', icon: 'Tv', count: 0 },
          { id: 'tcl_qled_tv', nameEn: 'TCL & Hisense QD-Mini LED 4K', nameBn: 'টিসিএল ও হাইসেন্স ফোরকে টিভি', icon: 'Tv', count: 0 },
          { id: 'xiaomi_tv', nameEn: 'Xiaomi TV S Mini LED & A Pro Google TV', nameBn: 'শাওমি ফোরকে গুগল টিভি', icon: 'Tv', count: 0 },
          { id: 'walton_vision_tv', nameEn: 'Walton & Vision 4K Google TV', nameBn: 'ওয়ালটন ও ভিশন স্মার্ট টিভি', icon: 'Tv', count: 0 },
          { id: 'other_tvs', nameEn: 'Other Smart & LED TVs', nameBn: 'অন্যান্য এলইডি টিভি', icon: 'Tv', count: 0 }
        ]
      },
      {
        id: 'cameras_drones',
        nameEn: 'Cameras, Camcorders & Drones',
        nameBn: 'ক্যামেরা, ড্রোন ও অ্যাকশন ক্যামেরা',
        icon: 'Camera',
        image: SUBCATEGORY_IMAGES.cameras_drones,
        count: 0,
        secondLevelCategories: [
          { id: 'sony_alpha_cameras', nameEn: 'Sony Alpha Full-Frame & ZV Vlog Cams', nameBn: 'সনি আলফা ও ভ্লগ ক্যামেরা', icon: 'Camera', count: 0 },
          { id: 'canon_cameras', nameEn: 'Canon EOS R Series & DSLR Cameras', nameBn: 'ক্যানন ইওএস আর ও ডিএসএলআর', icon: 'Camera', count: 0 },
          { id: 'dji_drones_gimbals', nameEn: 'DJI Mavic, Mini, Avata & Pocket 3', nameBn: 'ডিজেআই ড্রোন ও পকেট ৩', icon: 'Camera', count: 0 },
          { id: 'gopro_insta360', nameEn: 'GoPro HERO 13/12 & Insta360 X4/Ace', nameBn: 'গোপ্রো ও ইন্সটা৩৬০ অ্যাকশন ক্যাম', icon: 'Camera', count: 0 },
          { id: 'nikon_fujifilm', nameEn: 'Nikon Z Series & Fujifilm X100/XT5', nameBn: 'নিকন ও ফুজিফিল্ম ক্যামেরা', icon: 'Camera', count: 0 }
        ]
      },
      {
        id: 'audio_sound',
        nameEn: 'Audio & Sound Systems',
        nameBn: 'অডিও, সাউন্ডবার ও স্পিকার',
        icon: 'Speaker',
        image: SUBCATEGORY_IMAGES.audio_sound,
        count: 0,
        secondLevelCategories: [
          { id: 'sony_soundbars', nameEn: 'Sony BRAVIA Soundbars & Party Speakers', nameBn: 'সনি সাউন্ডবার ও স্পিকার', icon: 'Speaker', count: 0 },
          { id: 'jbl_partybox', nameEn: 'JBL PartyBox, Boombox & Cinema Soundbars', nameBn: 'জেবিএল পার্টিবক্স ও সাউন্ডবার', icon: 'Speaker', count: 0 },
          { id: 'marshall_speakers', nameEn: 'Marshall Woburn, Stanmore & Emberton', nameBn: 'মার্শাল ব্লুটুথ স্পিকার', icon: 'Speaker', count: 0 },
          { id: 'bose_harman', nameEn: 'Bose QuietComfort & Harman Kardon Aura', nameBn: 'বোস ও হারম্যান কার্ডন', icon: 'Speaker', count: 0 },
          { id: 'edifier_microlab', nameEn: 'Edifier, Microlab & F&D 2.1 / 5.1 Systems', nameBn: 'এডিফায়ার ও মাইক্রোল্যাব স্পিকার', icon: 'Speaker', count: 0 },
          { id: 'studio_mics', nameEn: 'Shure, Rode & Studio Podcast Microphones', nameBn: 'স্টুডিও মাইক ও অডিও ইন্টারফেস', icon: 'Mic', count: 0 }
        ]
      },
      {
        id: 'computer_components',
        nameEn: 'Computer & Laptop Accessories',
        nameBn: 'কম্পিউটার ও ল্যাপটপ পার্টস',
        icon: 'Cpu',
        image: SUBCATEGORY_IMAGES.computer_components,
        count: 0,
        secondLevelCategories: [
          { id: 'intel_cpus', nameEn: 'Intel Core Ultra & Core i9/i7/i5 CPUs', nameBn: 'ইন্টেল প্রসেসর', icon: 'Cpu', count: 0 },
          { id: 'amd_ryzen_cpus', nameEn: 'AMD Ryzen 9/7/5 & 7800X3D CPUs', nameBn: 'এএমডি রাইজেন প্রসেসর', icon: 'Cpu', count: 0 },
          { id: 'nvidia_rtx_gpus', nameEn: 'NVIDIA RTX 50/40/30 Series GPUs', nameBn: 'এনভিডিয়া আরটিএক্স গ্রাফিক্স কার্ড', icon: 'Cpu', count: 0 },
          { id: 'amd_radeon_gpus', nameEn: 'AMD Radeon RX 7000/6000 GPUs', nameBn: 'এএমডি রেডিয়ন গ্রাফিক্স কার্ড', icon: 'Cpu', count: 0 },
          { id: 'motherboards', nameEn: 'Motherboards (ASUS / MSI / Gigabyte)', nameBn: 'মাদারবোর্ড', icon: 'Cpu', count: 0 },
          { id: 'coolers_psu_cases', nameEn: 'Liquid Coolers, PSU & RGB Cases', nameBn: 'কুলার, পাওয়ার সাপ্লাই ও কেসিং', icon: 'Cpu', count: 0 }
        ]
      },
      {
        id: 'ram_storage',
        nameEn: 'RAM, SSD & Storage',
        nameBn: 'র‍্যাম, এসএসডি ও হার্ডডিস্ক',
        icon: 'HardDrive',
        image: SUBCATEGORY_IMAGES.ram_storage,
        count: 0,
        secondLevelCategories: [
          { id: 'samsung_ssd', nameEn: 'Samsung 990 Pro / 980 Pro M.2 SSD', nameBn: 'স্যামসাং এনভিএমই এসএসডি', icon: 'HardDrive', count: 0 },
          { id: 'nvme_ssd', nameEn: 'Gen4/Gen5 PCIe M.2 NVMe SSDs', nameBn: 'এম.২ এনভিএমই এসএসডি', icon: 'HardDrive', count: 0 },
          { id: 'desktop_laptop_ram', nameEn: 'DDR5 & DDR4 RGB RAM Kits', nameBn: 'ডিডিআর৫ ও ডিডিআর৪ র‍্যাম', icon: 'HardDrive', count: 0 },
          { id: 'portable_external_hdd', nameEn: 'External HDD & Surveillance Drives', nameBn: 'এক্সটার্নাল হার্ডডিস্ক ও ব্যাকআপ', icon: 'HardDrive', count: 0 }
        ]
      },
      {
        id: 'monitors',
        nameEn: 'Monitors & Displays',
        nameBn: 'মনিটর ও ডিসপ্লে',
        icon: 'Tv',
        image: SUBCATEGORY_IMAGES.monitors,
        count: 0,
        secondLevelCategories: [
          { id: 'gaming_monitors', nameEn: '144Hz - 360Hz Fast IPS / OLED Gaming', nameBn: 'গেমিং মনিটর', icon: 'Tv', count: 0 },
          { id: '4k_curved_monitors', nameEn: '4K UHD, 5K & UltraWide Curved', nameBn: '৪কে ও আল্ট্রাওয়াইড মনিটর', icon: 'Tv', count: 0 },
          { id: 'asus_samsung_lg', nameEn: 'ASUS ROG, Samsung Odyssey & LG UltraGear', nameBn: 'স্যামসাং, এলজি ও আসুস মনিটর', icon: 'Tv', count: 0 },
          { id: 'office_monitors', nameEn: 'Dell UltraSharp & Standard IPS', nameBn: 'ডেল আল্ট্রাশার্প ও অফিস মনিটর', icon: 'Tv', count: 0 }
        ]
      },
      {
        id: 'routers_networking',
        nameEn: 'Networking & Wi-Fi Routers',
        nameBn: 'রাউটার ও নেটওয়ার্কিং',
        icon: 'Wifi',
        image: SUBCATEGORY_IMAGES.routers_networking,
        count: 0,
        secondLevelCategories: [
          { id: 'tplink_routers', nameEn: 'TP-Link Archer & Deco Mesh WiFi', nameBn: 'টিপি-লিঙ্ক আর্চার ও মেশ ওয়াইফাই', icon: 'Wifi', count: 0 },
          { id: 'wifi6_wifi7_routers', nameEn: 'Wi-Fi 7 & Wi-Fi 6 Gigabit Routers', nameBn: 'ওয়াইফাই ৭ ও ওয়াইফাই ৬ রাউটার', icon: 'Wifi', count: 0 },
          { id: 'mikrotik_enterprise', nameEn: 'MikroTik CCR & UniFi Enterprise', nameBn: 'মাইক্রোটিক ও ইউনিফাই নেটওয়ার্কিং', icon: 'Wifi', count: 0 },
          { id: 'tenda_asus_netgear', nameEn: 'Tenda, ASUS ROG & Netgear Routers', nameBn: 'টেন্ডা, আসুস ও নেটগিয়ার', icon: 'Wifi', count: 0 }
        ]
      },
      {
        id: 'printers_peripherals',
        nameEn: 'Photocopiers, Printers & Keyboards',
        nameBn: 'প্রিন্টার, ফটোকপিয়ার ও কীবোর্ড',
        icon: 'Printer',
        image: SUBCATEGORY_IMAGES.printers_peripherals,
        count: 0,
        secondLevelCategories: [
          { id: 'ink_tank_laser_printers', nameEn: 'Epson, Canon & HP Ink Tank / Laser', nameBn: 'এপসন, ক্যানন ও এইচপি প্রিন্টার', icon: 'Printer', count: 0 },
          { id: 'mechanical_keyboards_mice', nameEn: 'Custom Mechanical Keyboards & Mice', nameBn: 'মেকানিক্যাল কীবোর্ড ও গেমিং মাউস', icon: 'Keyboard', count: 0 },
          { id: 'barcode_pos_ups', nameEn: 'Barcode Scanners, POS & Offline UPS', nameBn: 'বারকোড স্ক্যানার ও ইউপিএস', icon: 'Printer', count: 0 },
          { id: 'it_services_support', nameEn: 'PC Repair, Windows & IT Services', nameBn: 'কম্পিউটার সার্ভিসিং ও সফটওয়্যার', icon: 'Wrench', count: 0 }
        ]
      },
      {
        id: 'air_conditioners',
        nameEn: 'Air Conditioners & Cooling',
        nameBn: 'এয়ার কন্ডিশনার (এসি)',
        icon: 'Wind',
        image: SUBCATEGORY_IMAGES.air_conditioners,
        count: 0,
        secondLevelCategories: [
          { id: 'gree_inverter_ac', nameEn: 'Gree Fairy & Pular Inverter AC', nameBn: 'গ্রী ইনভার্টার এসি', icon: 'Wind', count: 0 },
          { id: 'general_daikin_ac', nameEn: 'General & Daikin Heavy Duty AC', nameBn: 'জেনারেল ও ডাইকিন এসি', icon: 'Wind', count: 0 },
          { id: 'walton_vision_ac', nameEn: 'Walton & Vision Smart Inverter AC', nameBn: 'ওয়ালটন ও ভিশন স্মার্ট এসি', icon: 'Wind', count: 0 },
          { id: 'tonnage_split_ac', nameEn: '1.0 Ton / 1.5 Ton / 2.0 Ton Split & Cassette', nameBn: '১.৫ টন ও ২ টন স্প্লিট এসি', icon: 'Wind', count: 0 }
        ]
      },
      {
        id: 'refrigerators',
        nameEn: 'Refrigerators & Freezers',
        nameBn: 'রেফ্রিজারেটর ও ডিপ ফ্রিজ',
        icon: 'Layers',
        image: SUBCATEGORY_IMAGES.refrigerators,
        count: 0,
        secondLevelCategories: [
          { id: 'samsung_side_by_side', nameEn: 'Samsung Side-by-Side & Inverter Fridge', nameBn: 'স্যামসাং সাইড-বাই-সাইড ফ্রিজ', icon: 'Layers', count: 0 },
          { id: 'walton_fridge', nameEn: 'Walton Non-Frost & Direct Cool Fridge', nameBn: 'ওয়ালটন নন-ফ্রস্ট ইনভার্টার ফ্রিজ', icon: 'Layers', count: 0 },
          { id: 'lg_smart_fridge', nameEn: 'LG InstaView & Smart Inverter Fridge', nameBn: 'এলজি ইনস্টাভিউ স্মার্ট ফ্রিজ', icon: 'Layers', count: 0 },
          { id: 'deep_freezers', nameEn: 'Deep Freezers & Commercial Coolers', nameBn: 'ডিপ ফ্রিজ ও কমার্শিয়াল ফ্রিজার', icon: 'Layers', count: 0 }
        ]
      },
      {
        id: 'gaming_consoles',
        nameEn: 'Video Games & Consoles',
        nameBn: 'গেমিং কনসোল ও ভিআর',
        icon: 'Gamepad2',
        image: SUBCATEGORY_IMAGES.gaming_consoles,
        count: 0,
        secondLevelCategories: [
          { id: 'playstation_5', nameEn: 'PlayStation 5 Pro & PS5 Slim Consoles', nameBn: 'প্লেস্টেশন ৫ প্রো ও স্লিম', icon: 'Gamepad2', count: 0 },
          { id: 'xbox_series', nameEn: 'Xbox Series X & Series S Consoles', nameBn: 'এক্সবক্স সিরিজ এক্স ও এস', icon: 'Gamepad2', count: 0 },
          { id: 'nintendo_switch', nameEn: 'Nintendo Switch OLED & Lite', nameBn: 'নিনটেন্ডো সুইচ ওলেড', icon: 'Gamepad2', count: 0 },
          { id: 'handheld_gaming', nameEn: 'Steam Deck OLED & ROG Ally X', nameBn: 'স্টিম ডেক ও হ্যান্ডহেল্ড কনসোল', icon: 'Gamepad2', count: 0 },
          { id: 'playstation_4', nameEn: 'PlayStation 4 Pro & PS4 Slim', nameBn: 'প্লেস্টেশন ৪ প্রো', icon: 'Gamepad2', count: 0 }
        ]
      },
      {
        id: 'cctv_security',
        nameEn: 'Security Cameras & Smart Home',
        nameBn: 'সিসিটিভি ও স্মার্ট হোম',
        icon: 'Shield',
        image: SUBCATEGORY_IMAGES.cctv_security,
        count: 0,
        secondLevelCategories: [
          { id: 'hikvision_cctv', nameEn: 'Hikvision ColorVu 4K IP / HD Cameras', nameBn: 'হিকভিশন কালারভিউ ক্যামেরা', icon: 'Shield', count: 0 },
          { id: 'dahua_surveillance', nameEn: 'Dahua WizSense 5MP/4K CCTV Sets', nameBn: 'দাহুয়া সিসিটিভি ক্যামেরা', icon: 'Shield', count: 0 },
          { id: 'ezviz_imou_wifi', nameEn: 'EZVIZ, Imou & Tapo 360° WiFi IP Cams', nameBn: 'ইজভিজ ও আইমু ওয়াইফাই ক্যামেরা', icon: 'Shield', count: 0 },
          { id: 'washing_home_appliances', nameEn: 'Automatic Washing Machines & Microwaves', nameBn: 'ওয়াশিং মেশিন ও ওভেন', icon: 'RefreshCw', count: 0 }
        ]
      }
    ]
  },

  // 5. Home & Living
  {
    id: 'home_furniture',
    nameEn: 'Home & Living',
    nameBn: 'ঘর ও লিভিং',
    icon: 'Armchair',
    image: MAIN_CATEGORY_DUAL_IMAGES.home_furniture[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.home_furniture[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.home_furniture,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'sofas',
        nameEn: 'Sofas & Living Room',
        nameBn: 'সোফা ও ডিভান',
        icon: 'Armchair',
        image: SUBCATEGORY_IMAGES.sofas,
        count: 0,
        secondLevelCategories: [
          { id: 'l_shaped_sofas', nameEn: 'L-Shaped Sectional Sofas', nameBn: 'এল-শেপ সোফা', icon: 'Armchair', count: 0 },
          { id: 'sofa_sets_321', nameEn: '3+2+1 Sofa Sets', nameBn: '৩+২+১ সোফা সেট', icon: 'Armchair', count: 0 },
          { id: 'recliners_sofabeds', nameEn: 'Recliners & Sofa Beds', nameBn: 'রিক্লাইনার ও সোফা বেড', icon: 'Armchair', count: 0 }
        ]
      },
      {
        id: 'beds',
        nameEn: 'Beds & Mattresses',
        nameBn: 'খাট ও তোশক',
        icon: 'Bed',
        image: SUBCATEGORY_IMAGES.beds,
        count: 0,
        secondLevelCategories: [
          { id: 'king_queen_beds', nameEn: 'King & Queen Wooden Beds', nameBn: 'কাঠের কিং/কুইন খাট', icon: 'Bed', count: 0 },
          { id: 'orthopedic_mattresses', nameEn: 'Orthopedic & Spring Mattresses', nameBn: 'অর্থোপেডিক তোশক', icon: 'Bed', count: 0 },
          { id: 'bunk_storage_beds', nameEn: 'Hydraulic Storage & Bunk Beds', nameBn: 'স্টোরেজ ও বাঙ্ক বেড', icon: 'Bed', count: 0 }
        ]
      },
      {
        id: 'wardrobes',
        nameEn: 'Wardrobes & Cabinets',
        nameBn: 'আলমারি ও ওয়্যারড্রব',
        icon: 'Archive',
        image: SUBCATEGORY_IMAGES.wardrobes,
        count: 0,
        secondLevelCategories: [
          { id: '4_door_wardrobes', nameEn: '4-Door & 3-Door Wardrobes', nameBn: '৪/৩ পাল্লার ওয়্যারড্রব', icon: 'Archive', count: 0 },
          { id: 'sliding_wardrobes', nameEn: 'Sliding Modern Closets', nameBn: 'স্লাইডিং আলমারি', icon: 'Archive', count: 0 },
          { id: 'dressers_drawers', nameEn: 'Chest of Drawers & Dressing', nameBn: 'ড্রেসিং টেবিল ও ড্রয়ার', icon: 'Archive', count: 0 }
        ]
      },
      {
        id: 'dining_tables',
        nameEn: 'Dining Tables & Chairs',
        nameBn: 'ডাইনিং টেবিল ও চেয়ার',
        icon: 'Utensils',
        image: SUBCATEGORY_IMAGES.dining_tables,
        count: 0,
        secondLevelCategories: [
          { id: '6_chair_dining', nameEn: '6-Chair Dining Sets', nameBn: '৬ চেয়ারের ডাইনিং সেট', icon: 'Utensils', count: 0 },
          { id: 'marble_glass_dining', nameEn: 'Marble & Glass Top Dining', nameBn: 'মার্বেল ও গ্লাস টপ ডাইনিং', icon: 'Utensils', count: 0 },
          { id: '4_chair_dining', nameEn: '4-Chair Compact Dining', nameBn: '৪ চেয়ারের ডাইনিং', icon: 'Utensils', count: 0 }
        ]
      },
      {
        id: 'office_furniture',
        nameEn: 'Office Furniture & Appliances',
        nameBn: 'অফিস ফার্নিচার ও চেয়ার',
        icon: 'Briefcase',
        image: SUBCATEGORY_IMAGES.office_furniture,
        count: 0,
        secondLevelCategories: [
          { id: 'ergonomic_office_chairs', nameEn: 'Ergonomic Mesh Chairs', nameBn: 'এরগনোমিক অফিস চেয়ার', icon: 'Briefcase', count: 0 },
          { id: 'executive_desks', nameEn: 'Executive Director Desks', nameBn: 'এক্সিকিউটিভ অফিস টেবিল', icon: 'Briefcase', count: 0 },
          { id: 'file_cabinets_workstations', nameEn: 'File Cabinets & Workstations', nameBn: 'ওয়ার্কস্টেশন ও ক্যাবিনেট', icon: 'Briefcase', count: 0 }
        ]
      }
    ]
  },

  // 6. Fashion & Style
  {
    id: 'fashion',
    nameEn: 'Fashion & Style',
    nameBn: 'ফ্যাশন ও স্টাইল',
    icon: 'Shirt',
    image: MAIN_CATEGORY_DUAL_IMAGES.fashion[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.fashion[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.fashion,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'mens_clothing',
        nameEn: "Men's Clothing",
        nameBn: 'পুরুষদের পোশাক',
        icon: 'Shirt',
        image: SUBCATEGORY_IMAGES.mens_clothing,
        count: 0,
        secondLevelCategories: [
          { id: 'panjabi_pajama', nameEn: 'Panjabi & Pajama', nameBn: 'পাঞ্জাবি ও পায়জামা', icon: 'Shirt', count: 0 },
          { id: 'casual_formal_shirts', nameEn: 'Shirts & T-Shirts', nameBn: 'শার্ট ও টি-শার্ট', icon: 'Shirt', count: 0 },
          { id: 'jeans_trousers', nameEn: 'Jeans & Trousers', nameBn: 'জিন্স ও ট্রাউজার', icon: 'Shirt', count: 0 },
          { id: 'suits_blazers', nameEn: 'Suits & Blazers', nameBn: 'স্যুট ও ব্লেজার', icon: 'Shirt', count: 0 }
        ]
      },
      {
        id: 'womens_clothing',
        nameEn: "Women's Clothing",
        nameBn: 'নারীদের পোশাক',
        icon: 'Sparkles',
        image: SUBCATEGORY_IMAGES.womens_clothing,
        count: 0,
        secondLevelCategories: [
          { id: 'sharees', nameEn: 'Sharees (Jamdani/Silk/Kathan)', nameBn: 'শাড়ি', icon: 'Sparkles', count: 0 },
          { id: 'salwar_kameez_kurtis', nameEn: 'Salwar Kameez & Three-Piece', nameBn: 'থ্রি-পিস ও কুর্তি', icon: 'Sparkles', count: 0 },
          { id: 'abayas_hijabs', nameEn: 'Abayas & Hijabs', nameBn: 'বোরকা ও হিজাব', icon: 'Sparkles', count: 0 },
          { id: 'gowns_lehengas', nameEn: 'Lehengas & Party Gowns', nameBn: 'লেহেঙ্গা ও গাউন', icon: 'Sparkles', count: 0 }
        ]
      },
      {
        id: 'shoes',
        nameEn: 'Shoes & Footwear',
        nameBn: 'জুতা ও স্নিকার্স',
        icon: 'Footprints',
        image: SUBCATEGORY_IMAGES.shoes,
        count: 0,
        secondLevelCategories: [
          { id: 'sneakers_sports_shoes', nameEn: 'Sneakers & Running Shoes', nameBn: 'স্নিকার্স ও স্পোর্টস শু', icon: 'Footprints', count: 0 },
          { id: 'formal_leather_shoes', nameEn: 'Formal Leather Shoes & Loafers', nameBn: 'ফরমাল চামড়ার জুতা', icon: 'Footprints', count: 0 },
          { id: 'ladies_heels_flats', nameEn: "Ladies' Heels, Flats & Sandals", nameBn: 'লেডিস হিল ও স্যান্ডেল', icon: 'Footprints', count: 0 }
        ]
      },
      {
        id: 'watches',
        nameEn: 'Watches & Jewellery',
        nameBn: 'ঘড়ি ও জুয়েলারি',
        icon: 'Watch',
        image: SUBCATEGORY_IMAGES.watches,
        count: 0,
        secondLevelCategories: [
          { id: 'luxury_watches', nameEn: "Men's & Women's Watches", nameBn: 'ব্র্যান্ডেড ঘড়ি', icon: 'Watch', count: 0 },
          { id: 'gold_diamond_jewellery', nameEn: 'Gold & Diamond Jewellery', nameBn: 'স্বর্ণ ও ডায়মন্ড গহনা', icon: 'Sparkles', count: 0 },
          { id: 'sunglasses_belts', nameEn: 'Sunglasses, Belts & Wallets', nameBn: 'সানগ্লাস, বেল্ট ও ওয়ালেট', icon: 'Watch', count: 0 }
        ]
      }
    ]
  },

  // 7. Beauty & Care
  {
    id: 'health_beauty',
    nameEn: 'Beauty & Care',
    nameBn: 'সৌন্দর্য ও যত্ন',
    icon: 'Sparkles',
    image: MAIN_CATEGORY_DUAL_IMAGES.health_beauty[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.health_beauty[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.health_beauty,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'skin_care',
        nameEn: 'Skin Care & Creams',
        nameBn: 'ত্বকের যত্ন ও সেরাম',
        icon: 'Sparkles',
        image: SUBCATEGORY_IMAGES.skin_care,
        count: 0,
        secondLevelCategories: [
          { id: 'serums_toners', nameEn: 'Face Serums & Toners', nameBn: 'ফেস সেরাম ও টোনার', icon: 'Sparkles', count: 0 },
          { id: 'sunscreens_moisturizers', nameEn: 'Sunscreens & Moisturisers', nameBn: 'সানস্ক্রিন ও ময়েশ্চারাইজার', icon: 'Sparkles', count: 0 },
          { id: 'facewash_scrubs', nameEn: 'Facewash, Cleansers & Scrubs', nameBn: 'ফেসওয়াশ ও স্ক্রাব', icon: 'Sparkles', count: 0 }
        ]
      },
      {
        id: 'perfumes',
        nameEn: 'Perfumes & Fragrances',
        nameBn: 'পারফিউম ও আতর',
        icon: 'Sparkles',
        image: SUBCATEGORY_IMAGES.perfumes,
        count: 0,
        secondLevelCategories: [
          { id: 'mens_edp_cologne', nameEn: "Men's Luxury Perfumes (EDP)", nameBn: 'পুরুষদের পারফিউম', icon: 'Sparkles', count: 0 },
          { id: 'womens_perfumes', nameEn: "Women's Designer Perfumes", nameBn: 'নারীদের পারফিউম', icon: 'Sparkles', count: 0 },
          { id: 'attar_oud', nameEn: 'Concentrated Attar & Arabian Oud', nameBn: 'আতর ও এরাবিয়ান উদ', icon: 'Sparkles', count: 0 }
        ]
      },
      {
        id: 'makeup',
        nameEn: 'Makeup & Cosmetics',
        nameBn: 'মেকআপ ও কসমেটিক্স',
        icon: 'Sparkles',
        image: SUBCATEGORY_IMAGES.makeup,
        count: 0,
        secondLevelCategories: [
          { id: 'foundations_concealers', nameEn: 'Foundations & Concealers', nameBn: 'ফাউন্ডেশন ও কনসিলার', icon: 'Sparkles', count: 0 },
          { id: 'lipsticks_lipgloss', nameEn: 'Lipsticks & Lip Gloss', nameBn: 'লিপস্টিক ও লিপগ্লস', icon: 'Sparkles', count: 0 },
          { id: 'eye_makeup_palettes', nameEn: 'Eye Makeup & Palettes', nameBn: 'আইশ্যাডো ও মাশকারা', icon: 'Sparkles', count: 0 }
        ]
      },
      {
        id: 'hair_care',
        nameEn: 'Hair Care & Grooming',
        nameBn: 'চুলের যত্ন ও গ্রুমিং',
        icon: 'Scissors',
        image: SUBCATEGORY_IMAGES.hair_care,
        count: 0,
        secondLevelCategories: [
          { id: 'shampoos_hair_oils', nameEn: 'Shampoos, Conditioners & Oils', nameBn: 'শ্যাম্পু ও হেয়ার অয়েল', icon: 'Scissors', count: 0 },
          { id: 'trimmers_shavers', nameEn: 'Trimmers, Shavers & Straighteners', nameBn: 'ট্রিমার ও হেয়ার ড্রায়ার', icon: 'Scissors', count: 0 }
        ]
      }
    ]
  },

  // 8. Services & Training
  {
    id: 'services',
    nameEn: 'Services & Training',
    nameBn: 'সার্ভিস ও প্রশিক্ষণ',
    icon: 'Wrench',
    image: MAIN_CATEGORY_DUAL_IMAGES.services[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.services[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.services,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'website_development',
        nameEn: 'IT, Web & App Services',
        nameBn: 'ওয়েব ও আইটি সার্ভিস',
        icon: 'Code',
        image: SUBCATEGORY_IMAGES.website_development,
        count: 0,
        secondLevelCategories: [
          { id: 'ecommerce_website_design', nameEn: 'E-commerce & Shopify Stores', nameBn: 'ই-কমার্স ওয়েবসাইট তৈরি', icon: 'Code', count: 0 },
          { id: 'android_ios_app_dev', nameEn: 'Android & iOS App Development', nameBn: 'অ্যান্ড্রয়েড ও আইওএস অ্যাপ', icon: 'Code', count: 0 },
          { id: 'seo_digital_marketing_service', nameEn: 'SEO & Facebook Ads Marketing', nameBn: 'এসইও ও ফেসবুক বুস্টিং', icon: 'Code', count: 0 }
        ]
      },
      {
        id: 'delivery_services',
        nameEn: 'Shifting & Transport Services',
        nameBn: 'বাসা বদল ও ট্রান্সপোর্ট',
        icon: 'Truck',
        image: SUBCATEGORY_IMAGES.delivery_services,
        count: 0,
        secondLevelCategories: [
          { id: 'home_shifting_trucks', nameEn: 'House & Office Shifting Movers', nameBn: 'বাসা ও অফিস বদল', icon: 'Truck', count: 0 },
          { id: 'rent_a_car_pickup', nameEn: 'Pickup & Truck Rental', nameBn: 'পিকআপ ও ট্রাক ভাড়া', icon: 'Truck', count: 0 },
          { id: 'parcel_courier_delivery', nameEn: 'Express Parcel Delivery', nameBn: 'পার্সেল ও কুরিয়ার সেবা', icon: 'Truck', count: 0 }
        ]
      },
      {
        id: 'online_courses',
        nameEn: 'IT Training & Online Courses',
        nameBn: 'অনলাইন কোর্স ও ফ্রিল্যান্সিং',
        icon: 'GraduationCap',
        image: SUBCATEGORY_IMAGES.online_courses,
        count: 0,
        secondLevelCategories: [
          { id: 'fullstack_web_dev_course', nameEn: 'Full Stack Web & Python Bootcamp', nameBn: 'ওয়েব ডেভেলপমেন্ট কোর্স', icon: 'GraduationCap', count: 0 },
          { id: 'graphic_ui_design_course', nameEn: 'Graphic Design & Video Editing', nameBn: 'গ্রাফিক ও ভিডিও এডিটিং', icon: 'GraduationCap', count: 0 },
          { id: 'digital_marketing_course', nameEn: 'Digital Marketing & AI Masterclass', nameBn: 'ডিজিটাল মার্কেটিং কোর্স', icon: 'GraduationCap', count: 0 }
        ]
      },
      {
        id: 'language_learning',
        nameEn: 'Language & IELTS Coaching',
        nameBn: 'ভাষা শিক্ষা ও আইইএলটিএস',
        icon: 'GraduationCap',
        image: SUBCATEGORY_IMAGES.language_learning,
        count: 0,
        secondLevelCategories: [
          { id: 'ielts_pte_prep', nameEn: 'IELTS & PTE Academic Preparation', nameBn: 'আইইএলটিএস ও পিটিই প্রস্তুতি', icon: 'GraduationCap', count: 0 },
          { id: 'spoken_english_fluency', nameEn: 'Spoken English Fluency', nameBn: 'স্পোকেন ইংলিশ কোর্স', icon: 'GraduationCap', count: 0 },
          { id: 'arabic_japanese_german', nameEn: 'Arabic, Japanese & German Courses', nameBn: 'আরবি, জাপানি ও জার্মান ভাষা', icon: 'GraduationCap', count: 0 }
        ]
      },
      {
        id: 'admission_coaching',
        nameEn: 'Tuition & Coaching Services',
        nameBn: 'ভর্তি কোচিং ও টিউটর',
        icon: 'GraduationCap',
        image: SUBCATEGORY_IMAGES.admission_coaching,
        count: 0,
        secondLevelCategories: [
          { id: 'buet_medical_admission', nameEn: 'Medical & Engineering Admission', nameBn: 'মেডিকেল ও বুয়েট ভর্তি প্রস্তুতি', icon: 'GraduationCap', count: 0 },
          { id: 'bcs_bank_job_coaching', nameEn: 'BCS & Bank Job Coaching', nameBn: 'বিসিএস ও ব্যাংক জব কোচিং', icon: 'GraduationCap', count: 0 },
          { id: 'home_tutors_science', nameEn: 'Home Tutors (SSC/HSC/English Medium)', nameBn: 'হোম টিউটর ও প্রাইভেট শিক্ষক', icon: 'GraduationCap', count: 0 }
        ]
      }
    ]
  },

  // 9. Construction & Repair
  {
    id: 'repair_construction',
    nameEn: 'Construction & Repair',
    nameBn: 'নির্মাণ ও মেরামত',
    icon: 'Wrench',
    image: MAIN_CATEGORY_DUAL_IMAGES.repair_construction[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.repair_construction[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.repair_construction,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'home_repair',
        nameEn: 'Home Repair & AC Servicing',
        nameBn: 'হোম মেরামত ও এসি সার্ভিসিং',
        icon: 'Wrench',
        image: SUBCATEGORY_IMAGES.home_repair,
        count: 0,
        secondLevelCategories: [
          { id: 'ac_servicing_gas_charge', nameEn: 'AC Master Wash & Gas Refill', nameBn: 'এসি সার্ভিসিং ও গ্যাস রিফিল', icon: 'Wrench', count: 0 },
          { id: 'electrical_plumbing_fix', nameEn: 'Electrician & Plumbing Services', nameBn: 'ইলেকট্রিশিয়ান ও প্লাম্বার', icon: 'Wrench', count: 0 },
          { id: 'painting_home_renovation', nameEn: 'Painting & House Renovation', nameBn: 'পেইন্টিং ও ইন্টেরিয়র কাজ', icon: 'Wrench', count: 0 }
        ]
      },
      {
        id: 'construction_materials',
        nameEn: 'Building & Construction Materials',
        nameBn: 'নির্মাণ সামগ্রী (রড, সিমেন্ট, ইট)',
        icon: 'Building2',
        image: SUBCATEGORY_IMAGES.construction_materials,
        count: 0,
        secondLevelCategories: [
          { id: 'steel_rod_cement', nameEn: 'Steel Rod, BSRM & Cement', nameBn: 'রড ও সিমেন্ট', icon: 'Building2', count: 0 },
          { id: 'bricks_sand_stone', nameEn: 'Auto Bricks, Sand & Stone', nameBn: 'ইট, বালু ও পাথর', icon: 'Building2', count: 0 }
        ]
      },
      {
        id: 'sanitary_plumbing_hardware',
        nameEn: 'Tiles, Sanitary & Paints',
        nameBn: 'টাইলস, স্যানিটারি ও রং',
        icon: 'Sparkles',
        image: SUBCATEGORY_IMAGES.sanitary_plumbing_hardware,
        count: 0,
        secondLevelCategories: [
          { id: 'tiles_sanitary_fittings', nameEn: 'Floor Tiles, Commode & Basins', nameBn: 'টাইলস ও স্যানিটারি ফিটিংস', icon: 'Building2', count: 0 },
          { id: 'paints_waterproofing', nameEn: 'Wall Paints & Waterproofing', nameBn: 'রং ও ওয়াটারপ্রুফিং', icon: 'Sparkles', count: 0 }
        ]
      },
      {
        id: 'electrical_hardware_tools',
        nameEn: 'Power Tools & Electrical Fittings',
        nameBn: 'পাওয়ার টুলস ও ইলেকট্রিক ফিটিংস',
        icon: 'Zap',
        image: SUBCATEGORY_IMAGES.electrical_hardware_tools,
        count: 0,
        secondLevelCategories: [
          { id: 'power_drills_tools', nameEn: 'Drill Machines, Grinders & Toolkits', nameBn: 'ড্রিল মেশিন ও টুলস', icon: 'Wrench', count: 0 },
          { id: 'electrical_cables_boards', nameEn: 'Cables, Switchboards & Breakers', nameBn: 'কেবল, সুইচবোর্ড ও ব্রেকার', icon: 'Zap', count: 0 }
        ]
      }
    ]
  },

  // 10. Tools & Machinery
  {
    id: 'business_equipment',
    nameEn: 'Tools & Machinery',
    nameBn: 'টুলস ও মেশিনারি',
    icon: 'Building2',
    image: MAIN_CATEGORY_DUAL_IMAGES.business_equipment[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.business_equipment[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.business_equipment,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'industrial_machines',
        nameEn: 'Industrial & Sewing Machines',
        nameBn: 'শিল্প ও সেলাই মেশিন',
        icon: 'Cpu',
        image: SUBCATEGORY_IMAGES.industrial_machines,
        count: 0,
        secondLevelCategories: [
          { id: 'garments_sewing_machines', nameEn: 'Garments Sewing Machines (Juki)', nameBn: 'জুকি ও গার্মেন্টস মেশিন', icon: 'Cpu', count: 0 },
          { id: 'cnc_lathe_machines', nameEn: 'CNC & Lathe Machines', nameBn: 'লেদ ও সিএনসি মেশিন', icon: 'Cpu', count: 0 },
          { id: 'air_compressors', nameEn: 'Heavy Air Compressors', nameBn: 'এয়ার কম্প্রেসার', icon: 'Cpu', count: 0 }
        ]
      },
      {
        id: 'shop_equipment',
        nameEn: 'Shop, Office & POS Equipment',
        nameBn: 'দোকান ও পিওএস সরঞ্জাম',
        icon: 'ShoppingBag',
        image: SUBCATEGORY_IMAGES.shop_equipment,
        count: 0,
        secondLevelCategories: [
          { id: 'pos_terminals_scanners', nameEn: 'POS Touch Terminals & Scanners', nameBn: 'পিওএস ও বারকোড স্ক্যানার', icon: 'ShoppingBag', count: 0 },
          { id: 'supermarket_racks', nameEn: 'Supermarket Display Racks', nameBn: 'সুপারশপ ডিসপ্লে র‍্যাক', icon: 'ShoppingBag', count: 0 },
          { id: 'money_counters', nameEn: 'Money Counting & Fake Note Detectors', nameBn: 'টাকা গণনার মেশিন', icon: 'ShoppingBag', count: 0 }
        ]
      },
      {
        id: 'restaurant_equipment',
        nameEn: 'Restaurant & Bakery Equipment',
        nameBn: 'রেস্টুরেন্ট কিচেন সরঞ্জাম',
        icon: 'Utensils',
        image: SUBCATEGORY_IMAGES.restaurant_equipment,
        count: 0,
        secondLevelCategories: [
          { id: 'commercial_deep_fryers_ovens', nameEn: 'Commercial Ovens & Deep Fryers', nameBn: 'বাণিজ্যিক ওভেন ও ফ্রায়ার', icon: 'Utensils', count: 0 },
          { id: 'shawarma_pizza_machines', nameEn: 'Shawarma & Pizza Machines', nameBn: 'শরমা ও পিজ্জা ওভেন', icon: 'Utensils', count: 0 },
          { id: 'stainless_prep_tables', nameEn: 'Stainless Steel Counters & Sinks', nameBn: 'স্টেইনলেস স্টিল কাউন্টার', icon: 'Utensils', count: 0 }
        ]
      }
    ]
  },

  // 11. Sports & Hobbies
  {
    id: 'books_sports',
    nameEn: 'Sports & Hobbies',
    nameBn: 'খেলাধুলা ও শখ',
    icon: 'BookOpen',
    image: MAIN_CATEGORY_DUAL_IMAGES.books_sports[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.books_sports[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.books_sports,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'books',
        nameEn: 'Books & Magazines',
        nameBn: 'বই ও সাহিত্য',
        icon: 'BookOpen',
        image: SUBCATEGORY_IMAGES.books,
        count: 0,
        secondLevelCategories: [
          { id: 'fiction_novels', nameEn: 'Fiction, Novels & Literature', nameBn: 'উপন্যাস ও গল্প', icon: 'BookOpen', count: 0 },
          { id: 'islamic_religious_books', nameEn: 'Islamic & Religious Books', nameBn: 'ইসলামিক ও ধর্মীয় বই', icon: 'BookOpen', count: 0 },
          { id: 'academic_job_prep_books', nameEn: 'Academic, BCS & Textbooks', nameBn: 'বিসিএস ও টেক্সটবুক', icon: 'BookOpen', count: 0 },
          { id: 'self_help_business_books', nameEn: 'Self-Help & Business Books', nameBn: 'আত্মউন্নয়ন ও ব্যবসা', icon: 'BookOpen', count: 0 }
        ]
      },
      {
        id: 'sports_equipment',
        nameEn: 'Sports & Cricket Gear',
        nameBn: 'ক্রিকেট ও খেলার সরঞ্জাম',
        icon: 'Trophy',
        image: SUBCATEGORY_IMAGES.sports_equipment,
        count: 0,
        secondLevelCategories: [
          { id: 'cricket_bats_kits', nameEn: 'Cricket Bats, Balls & Full Kits', nameBn: 'ক্রিকেট ব্যাট ও কিটস', icon: 'Trophy', count: 0 },
          { id: 'footballs_jerseys', nameEn: 'Footballs, Boots & Club Jerseys', nameBn: 'ফুটবল ও জার্সি', icon: 'Trophy', count: 0 },
          { id: 'badminton_table_tennis', nameEn: 'Badminton Rackets & TT Sets', nameBn: 'ব্যাডমিন্টন ও টেবিল টেনিস', icon: 'Trophy', count: 0 }
        ]
      },
      {
        id: 'gym_equipment',
        nameEn: 'Gym & Fitness',
        nameBn: 'জিম ও ফিটনেস সরঞ্জাম',
        icon: 'Dumbbell',
        image: SUBCATEGORY_IMAGES.gym_equipment,
        count: 0,
        secondLevelCategories: [
          { id: 'treadmills_exercise_bikes', nameEn: 'Motorized Treadmills & Bikes', nameBn: 'ট্রেডমিল ও এক্সারসাইজ বাইক', icon: 'Dumbbell', count: 0 },
          { id: 'dumbbells_weight_sets', nameEn: 'Dumbbells, Barbells & Plates', nameBn: 'ডাম্বেল ও রড-প্লেট সেট', icon: 'Dumbbell', count: 0 },
          { id: 'home_gym_stations', nameEn: 'Multi Home Gyms & Yoga Mats', nameBn: 'মাল্টি জিম ও যোগব্যায়াম', icon: 'Dumbbell', count: 0 }
        ]
      },
      {
        id: 'musical_instruments',
        nameEn: 'Musical Instruments',
        nameBn: 'বাদ্যযন্ত্র ও গিটার',
        icon: 'Music',
        image: SUBCATEGORY_IMAGES.musical_instruments,
        count: 0,
        secondLevelCategories: [
          { id: 'acoustic_electric_guitars', nameEn: 'Acoustic & Electric Guitars', nameBn: 'অ্যাকোস্টিক ও ইলেকট্রিক গিটার', icon: 'Music', count: 0 },
          { id: 'keyboards_synthesizers', nameEn: 'Electronic Keyboards & Pianos', nameBn: 'কীবোর্ড ও পিয়ানো', icon: 'Music', count: 0 },
          { id: 'traditional_instruments', nameEn: 'Tabla, Harmonium & Flutes', nameBn: 'তবলা, হারমোনিয়াম ও বাঁশি', icon: 'Music', count: 0 }
        ]
      },
      {
        id: 'domestic_tours',
        nameEn: 'Bangladesh Tour Packages',
        nameBn: 'দেশীয় ট্যুর প্যাকেজ',
        icon: 'Plane',
        image: SUBCATEGORY_IMAGES.domestic_tours,
        count: 0,
        secondLevelCategories: [
          { id: 'coxs_bazar_sajek', nameEn: "Cox's Bazar & Sajek Valley Tours", nameBn: 'কক্সবাজার ও সাজেক ভ্যালি', icon: 'Plane', count: 0 },
          { id: 'sylhet_sreemangal', nameEn: 'Sylhet, Jaflong & Sreemangal', nameBn: 'সিলেট ও শ্রীমঙ্গল চা বাগান', icon: 'Plane', count: 0 },
          { id: 'saint_martin_sundarbans', nameEn: 'Saint Martin & Sundarbans Eco-Tours', nameBn: 'সেন্টমার্টিন ও সুন্দরবন', icon: 'Plane', count: 0 }
        ]
      },
      {
        id: 'international_tours',
        nameEn: 'International Travel & Tickets',
        nameBn: 'বিদেশ ভ্রমণ ও এয়ার টিকেট',
        icon: 'Plane',
        image: SUBCATEGORY_IMAGES.international_tours,
        count: 0,
        secondLevelCategories: [
          { id: 'thailand_malaysia_tours', nameEn: 'Thailand, Malaysia & Singapore', nameBn: 'থাইল্যান্ড, মালয়েশিয়া ও সিঙ্গাপুর', icon: 'Plane', count: 0 },
          { id: 'dubai_maldives_turkey', nameEn: 'Dubai Desert & Maldives Luxury', nameBn: 'দুবাই ও মালদ্বীপ লাক্সারি ট্যুর', icon: 'Plane', count: 0 },
          { id: 'flight_ticket_bookings', nameEn: 'Domestic & Global Flight Tickets', nameBn: 'এয়ার টিকেট বুকিং', icon: 'Plane', count: 0 }
        ]
      },
      {
        id: 'hajj_umrah',
        nameEn: 'Hajj, Umrah & Resorts',
        nameBn: 'হজ, ওমরাহ ও রিসোর্ট',
        icon: 'Building2',
        image: SUBCATEGORY_IMAGES.hajj_umrah,
        count: 0,
        secondLevelCategories: [
          { id: 'executive_umrah_packages', nameEn: 'VIP Executive Umrah Groups', nameBn: 'ভিআইপি ওমরাহ প্যাকেজ', icon: 'Building2', count: 0 },
          { id: 'resort_hotel_booking', nameEn: '5-Star Beach Resorts & Hotel Booking', nameBn: 'হোটেল ও রিসোর্ট বুকিং', icon: 'Building2', count: 0 },
          { id: 'car_rental_tours', nameEn: 'Tourist Microbus & Car Rental', nameBn: 'ট্যুরিস্ট মাইক্রোবাস ভাড়া', icon: 'Car', count: 0 }
        ]
      },
      {
        id: 'concert_tickets',
        nameEn: 'Events, Movies & Tickets',
        nameBn: 'কনসার্ট ও সিনেমা টিকেট',
        icon: 'Ticket',
        image: SUBCATEGORY_IMAGES.concert_tickets,
        count: 0,
        secondLevelCategories: [
          { id: 'live_concert_passes', nameEn: 'Rock & Live Music Concert Passes', nameBn: 'লাইভ মিউজিক কনসার্ট টিকেট', icon: 'Ticket', count: 0 },
          { id: 'cineplex_movie_tickets', nameEn: 'Star Cineplex & IMAX Tickets', nameBn: 'সিনেপ্লেক্স ও আইম্যাক্স টিকেট', icon: 'Ticket', count: 0 },
          { id: 'cricket_match_tickets', nameEn: 'BPL & Stadium Match Tickets', nameBn: 'বিপিএল ও ক্রিকেট খেলার টিকেট', icon: 'Ticket', count: 0 }
        ]
      },
      {
        id: 'wedding_services',
        nameEn: 'Wedding Events & Photography',
        nameBn: 'বিয়ের আয়োজন ও ডেকোরেশন',
        icon: 'Heart',
        image: SUBCATEGORY_IMAGES.wedding_services,
        count: 0,
        secondLevelCategories: [
          { id: 'wedding_convention_halls', nameEn: 'Convention Hall & Stage Decor', nameBn: 'কনভেনশন হল ও স্টেজ ডেকোরেশন', icon: 'Heart', count: 0 },
          { id: 'wedding_photography_crew', nameEn: 'Cinematography & Photo Coverage', nameBn: 'ওয়েডিং সিনেমাটোগ্রাফি ও ফটোগ্রাফি', icon: 'Camera', count: 0 },
          { id: 'catering_grand_events', nameEn: 'Kacchi & Grand Wedding Catering', nameBn: 'বিয়ের রাজকীয় ক্যাটারিং', icon: 'Utensils', count: 0 }
        ]
      },
      {
        id: 'seminars_workshops',
        nameEn: 'Seminars & Party Decor',
        nameBn: 'সেমিনার ও জন্মদিন অনুষ্ঠান',
        icon: 'Calendar',
        image: SUBCATEGORY_IMAGES.seminars_workshops,
        count: 0,
        secondLevelCategories: [
          { id: 'tech_business_seminars', nameEn: 'Tech Summits & Business Expos', nameBn: 'টেক সামিট ও বিজনেস সেমিনার', icon: 'Calendar', count: 0 },
          { id: 'kids_birthday_party_decor', nameEn: 'Birthday Themes & Magicians', nameBn: 'বার্থডে ডেকোরেশন ও ম্যাজিক শো', icon: 'Gift', count: 0 }
        ]
      }
    ]
  },

  // 12. Kids & Toys
  {
    id: 'baby_kids',
    nameEn: 'Kids & Toys',
    nameBn: 'শিশু ও খেলনা',
    icon: 'Baby',
    image: MAIN_CATEGORY_DUAL_IMAGES.baby_kids[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.baby_kids[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.baby_kids,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'toys',
        nameEn: 'Toys & Games',
        nameBn: 'খেলনা ও গেমস',
        icon: 'Gamepad2',
        image: SUBCATEGORY_IMAGES.toys,
        count: 0,
        secondLevelCategories: [
          { id: 'rc_cars_drones', nameEn: 'RC Cars, Drones & Robots', nameBn: 'রিমোট কন্ট্রোল গাড়ি', icon: 'Gamepad2', count: 0 },
          { id: 'educational_lego_puzzles', nameEn: 'Educational Toys & Building Blocks', nameBn: 'এডুকেশনাল খেলনা ও লেগো', icon: 'Gamepad2', count: 0 },
          { id: 'dolls_action_figures', nameEn: 'Dolls & Action Figures', nameBn: 'পুতুল ও অ্যাকশন ফিগার', icon: 'Gamepad2', count: 0 }
        ]
      },
      {
        id: 'strollers',
        nameEn: 'Strollers, Walkers & Seats',
        nameBn: 'স্ট্রলার, ওয়াকার ও সিট',
        icon: 'Baby',
        image: SUBCATEGORY_IMAGES.strollers,
        count: 0,
        secondLevelCategories: [
          { id: 'baby_strollers_prams', nameEn: 'Lightweight Strollers & Prams', nameBn: 'বেবি স্ট্রলার ও প্র্যাম', icon: 'Baby', count: 0 },
          { id: 'baby_walkers_rockers', nameEn: 'Baby Walkers & Rockers', nameBn: 'বেবি ওয়াকার ও রকার', icon: 'Baby', count: 0 },
          { id: 'car_safety_seats', nameEn: 'Car Safety Seats & High Chairs', nameBn: 'কার সিট ও হাই চেয়ার', icon: 'Baby', count: 0 }
        ]
      },
      {
        id: 'baby_clothing',
        nameEn: "Kids' Clothing & Care",
        nameBn: 'শিশুর পোশাক ও যত্ন',
        icon: 'Shirt',
        image: SUBCATEGORY_IMAGES.baby_clothing,
        count: 0,
        secondLevelCategories: [
          { id: 'newborn_rompers_sets', nameEn: 'Newborn Gift Sets & Rompers', nameBn: 'নবজাতকের পোশাক সেট', icon: 'Shirt', count: 0 },
          { id: 'baby_diapers_wipes', nameEn: 'Diapers, Wipes & Lotions', nameBn: 'ডায়াপার ও বেবি লোশন', icon: 'Baby', count: 0 },
          { id: 'feeding_bottles_pumps', nameEn: 'Feeding Bottles & Warmers', nameBn: 'ফিডিং বোতল ও পাম্প', icon: 'Baby', count: 0 }
        ]
      }
    ]
  },

  // 13. Food & Farming
  {
    id: 'agriculture',
    nameEn: 'Food & Farming',
    nameBn: 'খাবার ও কৃষি',
    icon: 'Sprout',
    image: MAIN_CATEGORY_DUAL_IMAGES.agriculture[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.agriculture[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.agriculture,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'seeds',
        nameEn: 'Seeds, Plants & Saplings',
        nameBn: 'বীজ ও চারাগাছ',
        icon: 'Sprout',
        image: SUBCATEGORY_IMAGES.seeds,
        count: 0,
        secondLevelCategories: [
          { id: 'hybrid_paddy_rice_seeds', nameEn: 'Hybrid Paddy & Rice Seeds', nameBn: 'উচ্চফলনশীল ধানের বীজ', icon: 'Sprout', count: 0 },
          { id: 'vegetable_seeds', nameEn: 'Vegetable & Fruit Seeds', nameBn: 'সবজি ও ফলের বীজ', icon: 'Sprout', count: 0 },
          { id: 'grafted_fruit_saplings', nameEn: 'Grafted Fruit & Flower Saplings', nameBn: 'কলম চারা ও ফুলগাছ', icon: 'Sprout', count: 0 }
        ]
      },
      {
        id: 'farm_machinery',
        nameEn: 'Farm Machinery & Pumps',
        nameBn: 'কৃষি যন্ত্রপাতি ও পাম্প',
        icon: 'Tractor',
        image: SUBCATEGORY_IMAGES.farm_machinery,
        count: 0,
        secondLevelCategories: [
          { id: 'power_tillers_harvesters', nameEn: 'Power Tillers & Harvesters', nameBn: 'পাওয়ার টিলার ও হারভেস্টার', icon: 'Tractor', count: 0 },
          { id: 'submersible_water_pumps', nameEn: 'Irrigation & Submersible Pumps', nameBn: 'সেচ পাম্প ও মোটর', icon: 'Tractor', count: 0 },
          { id: 'sprayers_cutters', nameEn: 'Sprayers & Grass Cutters', nameBn: 'স্প্রেয়ার ও গ্রাস কাটার', icon: 'Tractor', count: 0 }
        ]
      },
      {
        id: 'fertilizers',
        nameEn: 'Fertilizers & Animal Feed',
        nameBn: 'সার ও পশুখাদ্য',
        icon: 'Sprout',
        image: SUBCATEGORY_IMAGES.fertilizers,
        count: 0,
        secondLevelCategories: [
          { id: 'organic_vermicompost', nameEn: 'Organic Vermicompost & Manure', nameBn: 'জৈব ও ভার্মি কম্পোস্ট সার', icon: 'Sprout', count: 0 },
          { id: 'cattle_poultry_feed', nameEn: 'Cattle, Poultry & Fish Feed', nameBn: 'গবাদিপশু ও মাছের খাবার', icon: 'Sprout', count: 0 },
          { id: 'bio_pesticides', nameEn: 'Bio-Pesticides & Plant Vitamins', nameBn: 'কীটনাশক ও ভিটামিন', icon: 'Sprout', count: 0 }
        ]
      },
      {
        id: 'restaurants',
        nameEn: 'Fresh Meals & Restaurants',
        nameBn: 'রেস্টুরেন্ট ও বিরিয়ানি',
        icon: 'Utensils',
        image: SUBCATEGORY_IMAGES.restaurants,
        count: 0,
        secondLevelCategories: [
          { id: 'dhaka_kacchi_biryani', nameEn: 'Dhaka Kacchi & Morog Polao', nameBn: 'ঢাকাই কাচ্চি ও মোরগ পোলাও', icon: 'Utensils', count: 0 },
          { id: 'buffet_chinese_thai', nameEn: 'Chinese, Thai & Buffet Dining', nameBn: 'চাইনিজ ও বুফে রেস্টুরেন্ট', icon: 'Utensils', count: 0 },
          { id: 'rooftop_fine_dining', nameEn: 'Rooftop Cafe & Fine Dining', nameBn: 'রুফটপ ক্যাফে ও ডাইনিং', icon: 'Utensils', count: 0 }
        ]
      },
      {
        id: 'fast_food',
        nameEn: 'Fast Food, Pizza & Burgers',
        nameBn: 'বার্গার, পিজ্জা ও ফাস্ট ফুড',
        icon: 'Utensils',
        image: SUBCATEGORY_IMAGES.fast_food,
        count: 0,
        secondLevelCategories: [
          { id: 'gourmet_beef_burgers', nameEn: 'Gourmet Beef & Crispy Burgers', nameBn: 'স্ম্যাশ বার্গার ও ফ্রাইজ', icon: 'Utensils', count: 0 },
          { id: 'artisan_cheese_pizzas', nameEn: 'Cheesy & Pan Pizza Delivery', nameBn: 'চিজি পিজ্জা ও পাস্তা', icon: 'Utensils', count: 0 },
          { id: 'fried_chicken_shawarma', nameEn: 'Crispy Fried Chicken & Shawarma', nameBn: 'ফ্রাইড চিকেন ও শর্মা', icon: 'Utensils', count: 0 }
        ]
      },
      {
        id: 'cakes_bakery',
        nameEn: 'Cakes, Honey & Organic Food',
        nameBn: 'কেক, মধু ও খাঁটি খাবার',
        icon: 'Cake',
        image: SUBCATEGORY_IMAGES.cakes_bakery,
        count: 0,
        secondLevelCategories: [
          { id: 'custom_birthday_cakes', nameEn: 'Custom Birthday & Wedding Cakes', nameBn: 'কাস্টম বার্থডে ও ওয়েডিং কেক', icon: 'Cake', count: 0 },
          { id: 'traditional_bengali_sweets', nameEn: 'Chomchom, Rasgulla & Bogura Doi', nameBn: 'চমচম, রসগোল্লা ও বগুড়ার দই', icon: 'Utensils', count: 0 },
          { id: 'pure_honey_organic_ghee', nameEn: 'Sundarbans Honey & Organic Ghee', nameBn: 'সুন্দরবনের মধু ও খাঁটি ঘি', icon: 'Utensils', count: 0 }
        ]
      }
    ]
  },

  // 14. Pets & Animals
  {
    id: 'animal_pets',
    nameEn: 'Pets & Animals',
    nameBn: 'পোষা প্রাণী ও গবাদিপশু',
    icon: 'Dog',
    image: MAIN_CATEGORY_DUAL_IMAGES.animal_pets[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.animal_pets[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.animal_pets,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'cattle',
        nameEn: 'Cattle & Farm Animals',
        nameBn: 'গরু ও ষাঁড়',
        icon: 'Beef',
        image: SUBCATEGORY_IMAGES.cattle,
        count: 0,
        secondLevelCategories: [
          { id: 'qurbani_bulls', nameEn: 'Qurbani Bulls & Oxen', nameBn: 'কোরবানির ষাঁড়', icon: 'Beef', count: 0 },
          { id: 'dairy_cows', nameEn: 'Dairy Cows & Milk Breeds', nameBn: 'দুগ্ধবতী গাভী', icon: 'Beef', count: 0 },
          { id: 'calves_heifers', nameEn: 'Calves & Heifers', nameBn: 'বকনা ও বাছুর', icon: 'Beef', count: 0 }
        ]
      },
      {
        id: 'goats',
        nameEn: 'Goats & Sheep',
        nameBn: 'ছাগল ও ভেড়া',
        icon: 'Dog',
        image: SUBCATEGORY_IMAGES.goats,
        count: 0,
        secondLevelCategories: [
          { id: 'black_bengal_goats', nameEn: 'Black Bengal Goats', nameBn: 'ব্ল্যাক বেঙ্গল ছাগল', icon: 'Dog', count: 0 },
          { id: 'jamnapari_boer_goats', nameEn: 'Jamnapari & Boer Goats', nameBn: 'যমুনাপারি ও বোয়ার খাসি', icon: 'Dog', count: 0 },
          { id: 'dumba_sheep', nameEn: 'Dumba & Sheep', nameBn: 'দুম্বা ও ভেড়া', icon: 'Dog', count: 0 }
        ]
      },
      {
        id: 'cats',
        nameEn: 'Cats & Dogs',
        nameBn: 'বিড়াল ও কুকুর',
        icon: 'Cat',
        image: SUBCATEGORY_IMAGES.cats,
        count: 0,
        secondLevelCategories: [
          { id: 'persian_cats', nameEn: 'Persian Longhair Cats', nameBn: 'পার্শিয়ান বিড়াল', icon: 'Cat', count: 0 },
          { id: 'british_shorthair', nameEn: 'British Shorthair & Exotic', nameBn: 'ব্রিটিশ শর্টহেয়ার', icon: 'Cat', count: 0 },
          { id: 'rescue_kittens', nameEn: 'Deshi & Rescue Kittens', nameBn: 'দেশি বিড়ালছানা', icon: 'Cat', count: 0 }
        ]
      },
      {
        id: 'birds',
        nameEn: 'Birds, Pigeons & Pet Supplies',
        nameBn: 'পাখি, কবুতর ও খাদ্য',
        icon: 'Bird',
        image: SUBCATEGORY_IMAGES.birds,
        count: 0,
        secondLevelCategories: [
          { id: 'parrots_macaws', nameEn: 'Parrots, Cockatiels & Bajrikor', nameBn: 'তোতা, বাজরিগার ও ককাটেল', icon: 'Bird', count: 0 },
          { id: 'fancy_racing_pigeons', nameEn: 'Fancy & Racing Pigeons', nameBn: 'রেসিং ও ফেন্সি কবুতর', icon: 'Bird', count: 0 },
          { id: 'cages_feed_supplies', nameEn: 'Bird Cages & Nutrition Feed', nameBn: 'পাখির খাঁচা ও খাদ্য', icon: 'Bird', count: 0 }
        ]
      }
    ]
  },

  // 15. Jobs & Careers (consolidated Careers & Talent Profiles/CVs)
  {
    id: 'jobs',
    nameEn: 'Jobs & Careers',
    nameBn: 'চাকরি ও ক্যারিয়ার',
    icon: 'Briefcase',
    image: MAIN_CATEGORY_DUAL_IMAGES.jobs[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.jobs[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.jobs,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'it_jobs',
        nameEn: 'IT & Software Jobs',
        nameBn: 'আইটি ও সফটওয়্যার চাকরি',
        icon: 'Code',
        image: SUBCATEGORY_IMAGES.it_jobs,
        count: 0,
        secondLevelCategories: [
          { id: 'software_developers', nameEn: 'Full Stack & App Developers', nameBn: 'সফটওয়্যার ডেভেলপার', icon: 'Code', count: 0 },
          { id: 'graphic_ui_designers', nameEn: 'UI/UX & Graphic Designers', nameBn: 'গ্রাফিক ও ইউআই ডিজাইনার', icon: 'Code', count: 0 },
          { id: 'digital_marketers_seo', nameEn: 'Digital Marketers & SEO Specialists', nameBn: 'ডিজিটাল মার্কেটার', icon: 'Code', count: 0 }
        ]
      },
      {
        id: 'sales_jobs',
        nameEn: 'Sales & Marketing Jobs',
        nameBn: 'সেলস ও মার্কেটিং চাকরি',
        icon: 'Briefcase',
        image: SUBCATEGORY_IMAGES.sales_jobs,
        count: 0,
        secondLevelCategories: [
          { id: 'showroom_sales_executives', nameEn: 'Showroom & Retail Sales', nameBn: 'শোরুম সেলস এক্সিকিউটিভ', icon: 'Briefcase', count: 0 },
          { id: 'corporate_sales_managers', nameEn: 'Corporate Business Development', nameBn: 'কর্পোরেট সেলস ম্যানেজার', icon: 'Briefcase', count: 0 },
          { id: 'telemarketing_call_center', nameEn: 'Call Center & Telemarketing', nameBn: 'কল সেন্টার এজেন্ট', icon: 'Briefcase', count: 0 }
        ]
      },
      {
        id: 'office_jobs',
        nameEn: 'Office & Admin Jobs',
        nameBn: 'অফিস ও অ্যাকাউন্টস চাকরি',
        icon: 'FileText',
        image: SUBCATEGORY_IMAGES.office_jobs,
        count: 0,
        secondLevelCategories: [
          { id: 'accounts_finance_officers', nameEn: 'Accountants & Finance Officers', nameBn: 'হিসাবরক্ষক ও ক্যাশিয়ার', icon: 'FileText', count: 0 },
          { id: 'admin_receptionists', nameEn: 'Admin Officers & Receptionists', nameBn: 'অ্যাডমিন ও রিসেপশনিস্ট', icon: 'FileText', count: 0 },
          { id: 'data_entry_operators', nameEn: 'Data Entry & Computer Operators', nameBn: 'ডাটা এন্ট্রি অপারেটর', icon: 'FileText', count: 0 }
        ]
      },
      {
        id: 'it_cv_profiles',
        nameEn: 'IT, Design & Tech CVs',
        nameBn: 'আইটি ও ডিজাইন সিভি',
        icon: 'Code',
        image: SUBCATEGORY_IMAGES.it_cv_profiles,
        count: 0,
        secondLevelCategories: [
          { id: 'web_software_cv', nameEn: 'Web & Software Developer CVs', nameBn: 'ওয়েব ও সফটওয়্যার ডেভেলপার', icon: 'Code', count: 0 },
          { id: 'graphic_design_cv', nameEn: 'Graphic & Video Editor CVs', nameBn: 'গ্রাফিক ও ভিডিও এডিটর', icon: 'Code', count: 0 }
        ]
      },
      {
        id: 'sales_marketing_cvs',
        nameEn: 'Sales, Delivery & Rider CVs',
        nameBn: 'সেলস ও ডেলিভারি রাইডার সিভি',
        icon: 'Briefcase',
        image: SUBCATEGORY_IMAGES.sales_marketing_cvs,
        count: 0,
        secondLevelCategories: [
          { id: 'sales_executive_cv', nameEn: 'Sales & Marketing Executive CVs', nameBn: 'সেলস ও মার্কেটিং সিভি', icon: 'Briefcase', count: 0 },
          { id: 'delivery_rider_cv', nameEn: 'Delivery Rider & Logistics CVs', nameBn: 'ডেলিভারি রাইডার সিভি', icon: 'Truck', count: 0 }
        ]
      },
      {
        id: 'office_accounts_cvs',
        nameEn: 'Office, Admin & Accounts CVs',
        nameBn: 'অফিস ও অ্যাকাউন্টস সিভি',
        icon: 'FileText',
        image: SUBCATEGORY_IMAGES.office_accounts_cvs,
        count: 0,
        secondLevelCategories: [
          { id: 'accounts_admin_cv', nameEn: 'Accountant, Admin & Operator CVs', nameBn: 'হিসাবরক্ষক ও কম্পিউটার অপারেটর', icon: 'FileText', count: 0 }
        ]
      },
      {
        id: 'technical_driver_cvs',
        nameEn: 'Driver & Technical Worker CVs',
        nameBn: 'ড্রাইভার ও টেকনিশিয়ান সিভি',
        icon: 'Wrench',
        image: SUBCATEGORY_IMAGES.technical_driver_cvs,
        count: 0,
        secondLevelCategories: [
          { id: 'driver_technician_cv', nameEn: 'Professional Driver & Technician CVs', nameBn: 'প্রফেশনাল ড্রাইভার ও টেকনিশিয়ান', icon: 'Wrench', count: 0 }
        ]
      }
    ]
  },

  // 16. Business & Wholesale
  {
    id: 'business_industry',
    nameEn: 'Business & Wholesale',
    nameBn: 'ব্যবসা ও পাইকারি',
    icon: 'Package',
    image: MAIN_CATEGORY_DUAL_IMAGES.business_industry[0],
    secondaryImage: MAIN_CATEGORY_DUAL_IMAGES.business_industry[1],
    images: MAIN_CATEGORY_DUAL_IMAGES.business_industry,
    catVersion: 4,
    count: 0,
    subcategories: [
      {
        id: 'wholesale_bulk_lots',
        nameEn: 'Wholesale & Stock Lots',
        nameBn: 'হোলসেল ও স্টক লট',
        icon: 'Package',
        image: SUBCATEGORY_IMAGES.wholesale_bulk_lots,
        count: 0,
        secondLevelCategories: [
          { id: 'garments_stock_lots', nameEn: 'Garments Export Stock Lots', nameBn: 'গার্মেন্টস স্টক লট', icon: 'Package', count: 0 },
          { id: 'wholesale_fmcg_goods', nameEn: 'Wholesale Consumer Goods', nameBn: 'পাইকারি পণ্য সামগ্রী', icon: 'Package', count: 0 }
        ]
      },
      {
        id: 'packaging_raw_materials',
        nameEn: 'Packaging & Raw Materials',
        nameBn: 'প্যাকেজিং ও কাঁচামাল',
        icon: 'Layers',
        image: SUBCATEGORY_IMAGES.packaging_raw_materials,
        count: 0,
        secondLevelCategories: [
          { id: 'carton_packaging_supplies', nameEn: 'Carton Boxes, Poly & Packaging', nameBn: 'কার্টন বক্স ও প্যাকেজিং', icon: 'Package', count: 0 },
          { id: 'industrial_raw_materials', nameEn: 'Industrial Raw Materials & Chemicals', nameBn: 'শিল্প কাঁচামাল', icon: 'Layers', count: 0 }
        ]
      },
      {
        id: 'gift_items',
        nameEn: 'Corporate Gifts & Crafts',
        nameBn: 'কর্পোরেট গিফট ও হস্তশিল্প',
        icon: 'Gift',
        image: SUBCATEGORY_IMAGES.gift_items,
        count: 0,
        secondLevelCategories: [
          { id: 'custom_gift_hampers', nameEn: 'Personalized Mugs & Gift Boxes', nameBn: 'কাস্টমাইজড উপহার বক্স', icon: 'Gift', count: 0 },
          { id: 'handicrafts_artworks', nameEn: 'Traditional Handicrafts & Jute Arts', nameBn: 'হস্তশিল্প ও পাটজাত পণ্য', icon: 'Gift', count: 0 },
          { id: 'novelty_surprise_gifts', nameEn: 'Novelty & Birthday Surprise Gifts', nameBn: 'বার্থডে গিফট আইটেম', icon: 'Gift', count: 0 }
        ]
      },
      {
        id: 'antiques',
        nameEn: 'Antiques & Collectibles',
        nameBn: 'পুরাতন শখের জিনিস',
        icon: 'Archive',
        image: SUBCATEGORY_IMAGES.antiques,
        count: 0,
        secondLevelCategories: [
          { id: 'vintage_coins_currency', nameEn: 'Vintage Coins & Old Banknotes', nameBn: 'পুরাতন মুদ্রা ও নোট', icon: 'Archive', count: 0 },
          { id: 'antique_clocks_decor', nameEn: 'Antique Clocks & Brassware', nameBn: 'প্রাচীন ঘড়ি ও পিতলের সামগ্রী', icon: 'Archive', count: 0 },
          { id: 'rare_manuscripts_relics', nameEn: 'Rare Relics & Memorabilia', nameBn: 'দুর্লভ অ্যান্টিক জিনিস', icon: 'Archive', count: 0 }
        ]
      },
      {
        id: 'miscellaneous',
        nameEn: 'Other Industrial & Surplus',
        nameBn: 'বিবিধ ব্যবসা ও সারপ্লাস',
        icon: 'Package',
        image: SUBCATEGORY_IMAGES.miscellaneous,
        count: 0,
        secondLevelCategories: [
          { id: 'general_surplus_goods', nameEn: 'General Surplus & Lots', nameBn: 'সারপ্লাস ও লট আইটেম', icon: 'Package', count: 0 },
          { id: 'community_giveaways', nameEn: 'Free Community Giveaways', nameBn: 'ফ্রি আইটেম ও অনুদান', icon: 'Package', count: 0 }
        ]
      }
    ]
  }
];
