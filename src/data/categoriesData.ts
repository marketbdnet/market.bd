import { Category } from '../types';
import catHouseImg from '../assets/images/cat_house_isolated_1785510865762.jpg';
import catScooterImg from '../assets/images/cat_scooter_isolated_1785510882941.jpg';
import catMobileImg from '../assets/images/cat_mobile_isolated_1785510896303.jpg';
import catLaptopImg from '../assets/images/cat_laptop_isolated_1785510910798.jpg';
import catSofaImg from '../assets/images/cat_sofa_isolated_1785510923610.jpg';
import catSneakerImg from '../assets/images/cat_sneaker_isolated_1785510934540.jpg';
import catTvImg from '../assets/images/cat_tv_isolated_1785510949732.jpg';
import catPerfumeImg from '../assets/images/cat_perfume_isolated_1785510963843.jpg';
import catTeddyImg from '../assets/images/cat_teddy_isolated_1785510975065.jpg';
import catBooksImg from '../assets/images/cat_books_isolated_1785510988963.jpg';
import catCatImg from '../assets/images/cat_cat_isolated_1785511000333.jpg';
import catPlantImg from '../assets/images/cat_plant_isolated_1785511014721.jpg';
import catDrillImg from '../assets/images/cat_drill_isolated_1785511025652.jpg';
import catToolboxImg from '../assets/images/cat_toolbox_isolated_1785511040837.jpg';
import catBriefcaseImg from '../assets/images/cat_briefcase_isolated_1785511054136.jpg';
import catGiftImg from '../assets/images/cat_gift_isolated_1785511065334.jpg';

export const CATEGORIES: Category[] = [
  // 1. Mobile & Gadgets
  {
    id: 'mobiles',
    nameEn: 'Mobile & Gadgets',
    nameBn: 'মোবাইল ও গ্যাজেট',
    icon: 'Smartphone',
    image: catMobileImg,
    count: 14250,
    popularBrands: ['Apple', 'Samsung', 'Xiaomi', 'Redmi', 'POCO', 'OnePlus', 'Realme', 'Vivo', 'iQOO', 'OPPO', 'Google Pixel', 'Motorola', 'Huawei', 'Honor', 'Infinix', 'TECNO', 'itel', 'Walton', 'Symphony', 'Nothing', 'Sony', 'Nokia', 'ASUS'],
    subcategories: [
      {
        id: 'smartphones',
        nameEn: 'Smartphones',
        nameBn: 'স্মার্টফোন',
        icon: 'Smartphone',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
        count: 7850,
        secondLevelCategories: [
          { id: 'apple', nameEn: 'Apple iPhone', nameBn: 'অ্যাপল আইফোন', icon: 'Smartphone', count: 2450 },
          { id: 'samsung', nameEn: 'Samsung Galaxy', nameBn: 'স্যামসাং গ্যালাক্সি', icon: 'Smartphone', count: 1820 },
          { id: 'xiaomi', nameEn: 'Xiaomi Flagship', nameBn: 'শাওমি ফ্ল্যাগশিপ', icon: 'Smartphone', count: 740 },
          { id: 'redmi', nameEn: 'Redmi Series', nameBn: 'রেডমি সিরিজ', icon: 'Smartphone', count: 960 },
          { id: 'poco', nameEn: 'POCO Performance', nameBn: 'পোকো গেমিং ও ৫জি', icon: 'Smartphone', count: 480 },
          { id: 'oneplus', nameEn: 'OnePlus & Nord', nameBn: 'ওয়ানপ্লাস ও নর্ড', icon: 'Smartphone', count: 520 },
          { id: 'realme', nameEn: 'Realme & Narzo', nameBn: 'রিয়েলমি ও নার্জো', icon: 'Smartphone', count: 680 },
          { id: 'vivo', nameEn: 'Vivo V & Y Series', nameBn: 'ভিভো ভি ও ওয়াই সিরিজ', icon: 'Smartphone', count: 490 },
          { id: 'iqoo', nameEn: 'iQOO Gaming', nameBn: 'আইকু গেমিং ফোন', icon: 'Smartphone', count: 240 },
          { id: 'oppo', nameEn: 'OPPO Reno & Find', nameBn: 'অপ্পো রেনো ও ফাইন্ড', icon: 'Smartphone', count: 420 },
          { id: 'google_pixel', nameEn: 'Google Pixel', nameBn: 'গুগল পিক্সেল', icon: 'Smartphone', count: 380 },
          { id: 'motorola', nameEn: 'Motorola Edge & G', nameBn: 'মটোরোলা এজ ও জি', icon: 'Smartphone', count: 210 },
          { id: 'huawei', nameEn: 'Huawei Mate & Pura', nameBn: 'হুয়াওয়ে মেট ও পুরা', icon: 'Smartphone', count: 190 },
          { id: 'honor', nameEn: 'Honor Magic & Number', nameBn: 'অনার ম্যাজিক ও ২০০ সিরিজ', icon: 'Smartphone', count: 260 },
          { id: 'infinix', nameEn: 'Infinix Note & GT', nameBn: 'ইনফিনিক্স নোট ও জিটি', icon: 'Smartphone', count: 320 },
          { id: 'tecno', nameEn: 'TECNO Camon & Spark', nameBn: 'টেকনো ক্যামন ও স্পার্ক', icon: 'Smartphone', count: 290 },
          { id: 'itel', nameEn: 'itel Curved & Budget', nameBn: 'আইটেল স্মার্টফোন', icon: 'Smartphone', count: 180 },
          { id: 'walton_phone', nameEn: 'Walton NEXG & Primo', nameBn: 'ওয়ালটন নেক্সজি ও প্রিমো', icon: 'Smartphone', count: 210 },
          { id: 'symphony', nameEn: 'Symphony Helio & Z', nameBn: 'সিম্ফনি হেলিও ও জেড', icon: 'Smartphone', count: 160 },
          { id: 'nothing_phone', nameEn: 'Nothing & CMF Phone', nameBn: 'নাথিং ও সিএমএফ ফোন', icon: 'Smartphone', count: 170 },
          { id: 'sony_phone', nameEn: 'Sony Xperia', nameBn: 'সনি এক্সপেরিয়া', icon: 'Smartphone', count: 90 },
          { id: 'asus_phone', nameEn: 'ASUS ROG & Zenfone', nameBn: 'আসুস আরওজি ফোন', icon: 'Smartphone', count: 85 },
          { id: 'nokia_smart', nameEn: 'Nokia & HMD', nameBn: 'নোকিয়া ও এইচএমডি', icon: 'Smartphone', count: 95 },
          { id: 'other_smartphones', nameEn: 'Other Smartphones', nameBn: 'অন্যান্য স্মার্টফোন', icon: 'Smartphone', count: 70 },
        ]
      },
      {
        id: 'feature_phones',
        nameEn: 'Feature Phones',
        nameBn: 'বাটন ফোন',
        icon: 'Smartphone',
        image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'nokia_feature', nameEn: 'Nokia Classic 4G & 2G', nameBn: 'নোকিয়া বাটন ফোন', icon: 'Smartphone', count: 420 },
          { id: 'symphony_feature', nameEn: 'Symphony Keypad Phones', nameBn: 'সিম্ফনি বাটন ফোন', icon: 'Smartphone', count: 210 },
          { id: 'walton_feature', nameEn: 'Walton Olvio Keypad', nameBn: 'ওয়ালটন অলভিও বাটন ফোন', icon: 'Smartphone', count: 180 },
          { id: 'itel_feature', nameEn: 'itel Super Guru & Magic', nameBn: 'আইটেল বাটন ফোন', icon: 'Smartphone', count: 110 },
          { id: 'other_feature_phones', nameEn: 'Other Feature Phones', nameBn: 'অন্যান্য বাটন ফোন', icon: 'Smartphone', count: 60 }
        ]
      },
      {
        id: 'tablets',
        nameEn: 'Tablets & iPads',
        nameBn: 'ট্যাবলেট ও আইপ্যাড',
        icon: 'Tablet',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'apple_ipad', nameEn: 'Apple iPad (Pro / Air / Mini / Gen)', nameBn: 'অ্যাপল আইপ্যাড', icon: 'Tablet', count: 490 },
          { id: 'samsung_tab', nameEn: 'Samsung Galaxy Tab (S & A Series)', nameBn: 'স্যামসাং গ্যালাক্সি ট্যাব', icon: 'Tablet', count: 290 },
          { id: 'xiaomi_pad', nameEn: 'Xiaomi & Redmi Pad', nameBn: 'শাওমি ও রেডমি প্যাড', icon: 'Tablet', count: 140 },
          { id: 'lenovo_tab', nameEn: 'Lenovo Legion & Yoga Tab', nameBn: 'লেনোভো ট্যাব', icon: 'Tablet', count: 85 },
          { id: 'huawei_tab', nameEn: 'Huawei & Honor MatePad', nameBn: 'হুয়াওয়ে ও অনার প্যাড', icon: 'Tablet', count: 55 },
          { id: 'surface_tab', nameEn: 'Microsoft Surface Pro', nameBn: 'মাইক্রোসফট সারফেস প্রো', icon: 'Tablet', count: 35 },
          { id: 'other_tablets', nameEn: 'Other Tablets', nameBn: 'অন্যান্য ট্যাবলেট', icon: 'Tablet', count: 25 }
        ]
      },
      {
        id: 'smart_watches',
        nameEn: 'Smart Watches & Bands',
        nameBn: 'স্মার্ট ঘড়ি ও ফিটনেস ব্যান্ড',
        icon: 'Watch',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80',
        count: 1450,
        secondLevelCategories: [
          { id: 'apple_watch', nameEn: 'Apple Watch Ultra & Series', nameBn: 'অ্যাপল ওয়াচ আল্ট্রা ও সিরিজ', icon: 'Watch', count: 460 },
          { id: 'samsung_watch', nameEn: 'Samsung Galaxy Watch Ultra & 7', nameBn: 'স্যামসাং গ্যালাক্সি ওয়াচ', icon: 'Watch', count: 310 },
          { id: 'amazfit', nameEn: 'Amazfit T-Rex, GTR & GTS', nameBn: 'অ্যামাজফিট টি-রেক্স ও জিটিআর', icon: 'Watch', count: 240 },
          { id: 'huawei_watch', nameEn: 'Huawei Watch GT & Fit', nameBn: 'হুয়াওয়ে ওয়াচ জিটি ও ফিট', icon: 'Watch', count: 180 },
          { id: 'garmin', nameEn: 'Garmin Fenix, Forerunner & Epix', nameBn: 'গারমিন মাল্টিস্পোর্ট জিপিএস', icon: 'Watch', count: 90 },
          { id: 'xiaomi_watch', nameEn: 'Xiaomi Watch, Haylou & Kieslect', nameBn: 'শাওমি, হাইলু ও কিসলেকট', icon: 'Watch', count: 110 },
          { id: 'other_smartwatches', nameEn: 'Other Smart Watches', nameBn: 'অন্যান্য স্মার্ট ওয়াচ', icon: 'Watch', count: 60 }
        ]
      },
      {
        id: 'earbuds_headphones',
        nameEn: 'Earbuds & Headphones',
        nameBn: 'ইয়ারবাডস ও হেডফোন',
        icon: 'Headphones',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
        count: 1680,
        secondLevelCategories: [
          { id: 'apple_airpods', nameEn: 'Apple AirPods Pro & Max', nameBn: 'অ্যাপল এয়ারপডস প্রো', icon: 'Headphones', count: 480 },
          { id: 'samsung_buds', nameEn: 'Samsung Galaxy Buds3 Pro / FE', nameBn: 'স্যামসাং গ্যালাক্সি বাডস', icon: 'Headphones', count: 310 },
          { id: 'sony_headphones', nameEn: 'Sony WH-1000XM5 / WF-1000XM5', nameBn: 'সনি ১০০০০এক্সএম৫ হেডফোন', icon: 'Headphones', count: 290 },
          { id: 'anker_soundcore', nameEn: 'Anker Soundcore Space & Liberty', nameBn: 'অ্যাংকার সাউন্ডকোর', icon: 'Headphones', count: 260 },
          { id: 'jbl_bose_audio', nameEn: 'JBL & Bose Noise Canceling', nameBn: 'জেবিএল ও বোস হেডফোন', icon: 'Headphones', count: 210 },
          { id: 'other_earbuds', nameEn: 'Other TWS & Neckbands', nameBn: 'অন্যান্য ইয়ারবাডস ও নেকব্যান্ড', icon: 'Headphones', count: 130 }
        ]
      },
      {
        id: 'chargers_cables',
        nameEn: 'Chargers, Cables & Power Banks',
        nameBn: 'চার্জার, কেবল ও পাওয়ার ব্যাংক',
        icon: 'Zap',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80',
        count: 1220,
        secondLevelCategories: [
          { id: 'fast_chargers', nameEn: 'GaN & 65W-120W Fast Chargers', nameBn: 'ফাস্ট চার্জার ও জিএএন অ্যাডাপ্টার', icon: 'Zap', count: 410 },
          { id: 'power_banks', nameEn: '10000mAh - 30000mAh Power Banks', nameBn: 'পাওয়ার ব্যাংক ও ম্যাগসেফ', icon: 'BatteryCharging', count: 380 },
          { id: 'type_c_cables', nameEn: 'Type-C, Lightning & Braided Cables', nameBn: 'টাইপ-সি ও লাইটনিং কেবল', icon: 'Zap', count: 270 },
          { id: 'wireless_chargers', nameEn: 'MagSafe & Wireless Charging Stands', nameBn: 'ওয়্যারলেস চার্জিং ডক', icon: 'Zap', count: 160 }
        ]
      },
      {
        id: 'mobile_cases_parts',
        nameEn: 'Cases, Parts & Services',
        nameBn: 'মোবাইল কভার, পার্টস ও সার্ভিস',
        icon: 'Shield',
        image: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=500&q=80',
        count: 950,
        secondLevelCategories: [
          { id: 'phone_cases', nameEn: 'Original Cases, Silicone & Armor', nameBn: 'প্রিমিয়াম ব্যাক কভার ও গ্লাস', icon: 'Shield', count: 410 },
          { id: 'displays_touch', nameEn: 'Original OLED & LCD Displays', nameBn: 'অরিজিনাল ডিসপ্লে ও টাচ', icon: 'Wrench', count: 260 },
          { id: 'phone_batteries', nameEn: 'High Capacity Phone Batteries', nameBn: 'অরিজিনাল ব্যাটারি', icon: 'BatteryCharging', count: 160 },
          { id: 'mobile_repair_service', nameEn: 'Mobile Repair & Servicing', nameBn: 'মোবাইল সার্ভিসিং ও মেরামত', icon: 'Wrench', count: 120 }
        ]
      }
    ]
  },

  // 2. Computers & IT
  {
    id: 'computers',
    nameEn: 'Computers & IT',
    nameBn: 'কম্পিউটার ও আইটি',
    icon: 'Laptop',
    image: catLaptopImg,
    count: 12480,
    popularBrands: ['Apple MacBook', 'HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Gigabyte', 'Intel', 'AMD', 'NVIDIA', 'Samsung', 'Kingston', 'Corsair', 'TP-Link', 'Epson', 'Canon', 'Brother', 'Walton'],
    subcategories: [
      {
        id: 'laptops',
        nameEn: 'Laptops & MacBooks',
        nameBn: 'ল্যাপটপ ও ম্যাকবুক',
        icon: 'Laptop',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',
        count: 4680,
        secondLevelCategories: [
          { id: 'apple_macbook', nameEn: 'Apple MacBook (M4 / M3 / M2 / M1)', nameBn: 'অ্যাপল ম্যাকবুক', icon: 'Laptop', count: 1480 },
          { id: 'hp_laptop', nameEn: 'HP (Spectre / Envy / Victus / EliteBook)', nameBn: 'এইচপি ল্যাপটপ', icon: 'Laptop', count: 980 },
          { id: 'dell_laptop', nameEn: 'Dell (XPS / Alienware / Inspiron / Latitude)', nameBn: 'ডেল ল্যাপটপ', icon: 'Laptop', count: 740 },
          { id: 'lenovo_laptop', nameEn: 'Lenovo (ThinkPad / Legion / Yoga / LOQ)', nameBn: 'লেনোভো ল্যাপটপ', icon: 'Laptop', count: 610 },
          { id: 'asus_laptop', nameEn: 'ASUS (ROG Zephyrus / TUF / ZenBook)', nameBn: 'আসুস আরওজি ও জেনবুক', icon: 'Laptop', count: 490 },
          { id: 'acer_laptop', nameEn: 'Acer (Predator / Nitro / Swift / Aspire)', nameBn: 'এসার প্রেডেটর ও নাইট্রো', icon: 'Laptop', count: 210 },
          { id: 'msi_laptop', nameEn: 'MSI Gaming & Creator Series', nameBn: 'এমএসআই গেমিং ল্যাপটপ', icon: 'Laptop', count: 110 },
          { id: 'other_laptops', nameEn: 'Microsoft Surface & Other Laptops', nameBn: 'সারফেস ও অন্যান্য ল্যাপটপ', icon: 'Laptop', count: 60 }
        ]
      },
      {
        id: 'desktop_computers',
        nameEn: 'Desktop PCs & Workstations',
        nameBn: 'ডেস্কটপ পিসি ও ওয়ার্কস্টেশন',
        icon: 'Monitor',
        image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80',
        count: 2480,
        secondLevelCategories: [
          { id: 'custom_gaming_pc', nameEn: 'Custom Gaming PC & Rigs', nameBn: 'কাস্টম গেমিং পিসি', icon: 'Monitor', count: 1150 },
          { id: 'brand_pc', nameEn: 'Brand PC (HP, Dell, Lenovo)', nameBn: 'ব্র্যান্ড পিসি', icon: 'Monitor', count: 580 },
          { id: 'all_in_one_pc', nameEn: 'All-in-One Desktop PC', nameBn: 'অল-ইন-ওয়ান পিসি', icon: 'Monitor', count: 390 },
          { id: 'mini_pc', nameEn: 'Mini PC & Intel NUC', nameBn: 'মিনি পিসি ও অফিস পিসি', icon: 'Monitor', count: 240 },
          { id: 'workstation_server', nameEn: 'Server & Rendering Workstation', nameBn: 'সার্ভার ও এডিটিং ওয়ার্কস্টেশন', icon: 'Server', count: 120 }
        ]
      },
      {
        id: 'computer_components',
        nameEn: 'PC Components (CPU, GPU, MB)',
        nameBn: 'প্রসেসর, গ্রাফিক্স কার্ড ও মাদারবোর্ড',
        icon: 'Cpu',
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80',
        count: 1890,
        secondLevelCategories: [
          { id: 'intel_cpus', nameEn: 'Intel Core Ultra & Core i9/i7/i5 CPUs', nameBn: 'ইন্টেল প্রসেসর', icon: 'Cpu', count: 480 },
          { id: 'amd_ryzen_cpus', nameEn: 'AMD Ryzen 9/7/5 & 7800X3D CPUs', nameBn: 'এএমডি রাইজেন প্রসেসর', icon: 'Cpu', count: 450 },
          { id: 'nvidia_rtx_gpus', nameEn: 'NVIDIA RTX 50/40/30 Series GPUs', nameBn: 'এনভিডিয়া আরটিএক্স গ্রাফিক্স কার্ড', icon: 'Cpu', count: 520 },
          { id: 'amd_radeon_gpus', nameEn: 'AMD Radeon RX 7000/6000 GPUs', nameBn: 'এএমডি রেডিয়ন গ্রাফিক্স কার্ড', icon: 'Cpu', count: 160 },
          { id: 'motherboards', nameEn: 'Motherboards (ASUS / MSI / Gigabyte)', nameBn: 'মাদারবোর্ড', icon: 'Cpu', count: 180 },
          { id: 'coolers_psu_cases', nameEn: 'Liquid Coolers, PSU & RGB Cases', nameBn: 'কুলার, পাওয়ার সাপ্লাই ও কেসিং', icon: 'Cpu', count: 100 }
        ]
      },
      {
        id: 'ram_storage',
        nameEn: 'RAM, SSD & Hard Drives',
        nameBn: 'র‍্যাম, এসএসডি ও হার্ডডিস্ক',
        icon: 'HardDrive',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80',
        count: 1340,
        secondLevelCategories: [
          { id: 'samsung_ssd', nameEn: 'Samsung 990 Pro / 980 Pro M.2 SSD', nameBn: 'স্যামসাং এনভিএমই এসএসডি', icon: 'HardDrive', count: 420 },
          { id: 'nvme_ssd', nameEn: 'Gen4/Gen5 PCIe M.2 NVMe SSDs', nameBn: 'এম.২ এনভিএমই এসএসডি', icon: 'HardDrive', count: 360 },
          { id: 'desktop_laptop_ram', nameEn: 'DDR5 & DDR4 RGB RAM Kits', nameBn: 'ডিডিআর৫ ও ডিডিআর৪ র‍্যাম', icon: 'HardDrive', count: 310 },
          { id: 'portable_external_hdd', nameEn: 'External HDD & Surveillance Drives', nameBn: 'এক্সটার্নাল হার্ডডিস্ক ও ব্যাকআপ', icon: 'HardDrive', count: 250 }
        ]
      },
      {
        id: 'monitors',
        nameEn: 'Monitors & Displays',
        nameBn: 'মনিটর ও ডিসপ্লে',
        icon: 'Tv',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'gaming_monitors', nameEn: '144Hz - 360Hz Fast IPS / OLED Gaming', nameBn: 'গেমিং মনিটর', icon: 'Tv', count: 480 },
          { id: '4k_curved_monitors', nameEn: '4K UHD, 5K & UltraWide Curved', nameBn: '৪কে ও আল্ট্রাওয়াইড মনিটর', icon: 'Tv', count: 340 },
          { id: 'asus_samsung_lg', nameEn: 'ASUS ROG, Samsung Odyssey & LG UltraGear', nameBn: 'স্যামসাং, এলজি ও আসুস মনিটর', icon: 'Tv', count: 210 },
          { id: 'office_monitors', nameEn: 'Dell UltraSharp & Standard IPS', nameBn: 'ডেল আল্ট্রাশার্প ও অফিস মনিটর', icon: 'Tv', count: 90 }
        ]
      },
      {
        id: 'routers_networking',
        nameEn: 'Routers & Networking',
        nameBn: 'রাউটার ও নেটওয়ার্কিং',
        icon: 'Wifi',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'tplink_routers', nameEn: 'TP-Link Archer & Deco Mesh WiFi', nameBn: 'টিপি-লিঙ্ক আর্চার ও মেশ ওয়াইফাই', icon: 'Wifi', count: 460 },
          { id: 'wifi6_wifi7_routers', nameEn: 'Wi-Fi 7 & Wi-Fi 6 Gigabit Routers', nameBn: 'ওয়াইফাই ৭ ও ওয়াইফাই ৬ রাউটার', icon: 'Wifi', count: 280 },
          { id: 'mikrotik_enterprise', nameEn: 'MikroTik CCR & UniFi Enterprise', nameBn: 'মাইক্রোটিক ও ইউনিফাই নেটওয়ার্কিং', icon: 'Wifi', count: 140 },
          { id: 'tenda_asus_netgear', nameEn: 'Tenda, ASUS ROG & Netgear Routers', nameBn: 'টেন্ডা, আসুস ও নেটগিয়ার', icon: 'Wifi', count: 100 }
        ]
      },
      {
        id: 'printers_peripherals',
        nameEn: 'Printers, Keyboards & Accessories',
        nameBn: 'প্রিন্টার, কীবোর্ড ও এক্সেসরিজ',
        icon: 'Printer',
        image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=80',
        count: 880,
        secondLevelCategories: [
          { id: 'ink_tank_laser_printers', nameEn: 'Epson, Canon & HP Ink Tank / Laser', nameBn: 'এপসন, ক্যানন ও এইচপি প্রিন্টার', icon: 'Printer', count: 360 },
          { id: 'mechanical_keyboards_mice', nameEn: 'Custom Mechanical Keyboards & Mice', nameBn: 'মেকানিক্যাল কীবোর্ড ও গেমিং মাউস', icon: 'Keyboard', count: 310 },
          { id: 'barcode_pos_ups', nameEn: 'Barcode Scanners, POS & Offline UPS', nameBn: 'বারকোড স্ক্যানার ও ইউপিএস', icon: 'Printer', count: 130 },
          { id: 'it_services_support', nameEn: 'PC Repair, Windows & IT Services', nameBn: 'কম্পিউটার সার্ভিসিং ও সফটওয়্যার', icon: 'Wrench', count: 80 }
        ]
      }
    ]
  },

  // 3. Electronics
  {
    id: 'electronics',
    nameEn: 'Electronics',
    nameBn: 'ইলেকট্রনিক্স',
    icon: 'Tv',
    image: catTvImg,
    count: 11860,
    popularBrands: ['Sony', 'Samsung', 'LG', 'TCL', 'Xiaomi', 'Gree', 'General', 'Daikin', 'Walton', 'Vision', 'Singer', 'JBL', 'Marshall', 'Bose', 'Canon', 'Nikon', 'Fujifilm', 'DJI', 'GoPro', 'PlayStation', 'Xbox', 'Hikvision', 'Dahua', 'EZVIZ'],
    subcategories: [
      {
        id: 'televisions',
        nameEn: 'Televisions & Smart Displays',
        nameBn: 'স্মার্ট ও ফোরকে টিভি',
        icon: 'Tv',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80',
        count: 3120,
        secondLevelCategories: [
          { id: 'sony_bravia', nameEn: 'Sony BRAVIA (OLED, Mini LED, 4K)', nameBn: 'সনি ব্রাভিয়া ফোরকে ও ওলেড টিভি', icon: 'Tv', count: 740 },
          { id: 'samsung_tv', nameEn: 'Samsung (Neo QLED, OLED, Crystal 4K)', nameBn: 'স্যামসাং কিউলেড ও ক্রিস্টাল টিভি', icon: 'Tv', count: 680 },
          { id: 'lg_oled_tv', nameEn: 'LG (OLED evo, QNED, 4K UHD)', nameBn: 'এলজি ওলেড ইভো ও কিউনেড টিভি', icon: 'Tv', count: 510 },
          { id: 'tcl_qled_tv', nameEn: 'TCL & Hisense QD-Mini LED 4K', nameBn: 'টিসিএল ও হাইসেন্স ফোরকে টিভি', icon: 'Tv', count: 410 },
          { id: 'xiaomi_tv', nameEn: 'Xiaomi TV S Mini LED & A Pro Google TV', nameBn: 'শাওমি ফোরকে গুগল টিভি', icon: 'Tv', count: 320 },
          { id: 'walton_vision_tv', nameEn: 'Walton & Vision 4K Google TV', nameBn: 'ওয়ালটন ও ভিশন স্মার্ট টিভি', icon: 'Tv', count: 340 },
          { id: 'other_tvs', nameEn: 'Other Smart & LED TVs', nameBn: 'অন্যান্য এলইডি টিভি', icon: 'Tv', count: 120 }
        ]
      },
      {
        id: 'audio_sound',
        nameEn: 'Audio, Soundbars & Speakers',
        nameBn: 'অডিও, সাউন্ডবার ও পার্টি স্পিকার',
        icon: 'Speaker',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80',
        count: 2240,
        secondLevelCategories: [
          { id: 'sony_soundbars', nameEn: 'Sony BRAVIA Soundbars & Party Speakers', nameBn: 'সনি সাউন্ডবার ও স্পিকার', icon: 'Speaker', count: 520 },
          { id: 'jbl_partybox', nameEn: 'JBL PartyBox, Boombox & Cinema Soundbars', nameBn: 'জেবিএল পার্টিবক্স ও সাউন্ডবার', icon: 'Speaker', count: 610 },
          { id: 'marshall_speakers', nameEn: 'Marshall Woburn, Stanmore & Emberton', nameBn: 'মার্শাল ব্লুটুথ স্পিকার', icon: 'Speaker', count: 410 },
          { id: 'bose_harman', nameEn: 'Bose QuietComfort & Harman Kardon Aura', nameBn: 'বোস ও হারম্যান কার্ডন', icon: 'Speaker', count: 320 },
          { id: 'edifier_microlab', nameEn: 'Edifier, Microlab & F&D 2.1 / 5.1 Systems', nameBn: 'এডিফায়ার ও মাইক্রোল্যাব স্পিকার', icon: 'Speaker', count: 260 },
          { id: 'studio_mics', nameEn: 'Shure, Rode & Studio Podcast Microphones', nameBn: 'স্টুডিও মাইক ও অডিও ইন্টারফেস', icon: 'Mic', count: 120 }
        ]
      },
      {
        id: 'cameras_drones',
        nameEn: 'Cameras, Drones & Action Cams',
        nameBn: 'ক্যামেরা, ড্রোন ও অ্যাকশন ক্যামেরা',
        icon: 'Camera',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
        count: 1780,
        secondLevelCategories: [
          { id: 'sony_alpha_cameras', nameEn: 'Sony Alpha Full-Frame & ZV Vlog Cams', nameBn: 'সনি আলফা ও ভ্লগ ক্যামেরা', icon: 'Camera', count: 580 },
          { id: 'canon_cameras', nameEn: 'Canon EOS R Series & DSLR Cameras', nameBn: 'ক্যানন ইওএস আর ও ডিএসএলআর', icon: 'Camera', count: 460 },
          { id: 'dji_drones_gimbals', nameEn: 'DJI Mavic, Mini, Avata & Pocket 3', nameBn: 'ডিজেআই ড্রোন ও পকেট ৩', icon: 'Camera', count: 340 },
          { id: 'gopro_insta360', nameEn: 'GoPro HERO 13/12 & Insta360 X4/Ace', nameBn: 'গোপ্রো ও ইন্সটা৩৬০ অ্যাকশন ক্যাম', icon: 'Camera', count: 210 },
          { id: 'nikon_fujifilm', nameEn: 'Nikon Z Series & Fujifilm X100/XT5', nameBn: 'নিকন ও ফুজিফিল্ম ক্যামেরা', icon: 'Camera', count: 190 }
        ]
      },
      {
        id: 'air_conditioners',
        nameEn: 'Air Conditioners & Cooling',
        nameBn: 'এয়ার কন্ডিশনার (এসি)',
        icon: 'Wind',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80',
        count: 1690,
        secondLevelCategories: [
          { id: 'gree_inverter_ac', nameEn: 'Gree Fairy & Pular Inverter AC', nameBn: 'গ্রী ইনভার্টার এসি', icon: 'Wind', count: 680 },
          { id: 'general_daikin_ac', nameEn: 'General & Daikin Heavy Duty AC', nameBn: 'জেনারেল ও ডাইকিন এসি', icon: 'Wind', count: 390 },
          { id: 'walton_vision_ac', nameEn: 'Walton & Vision Smart Inverter AC', nameBn: 'ওয়ালটন ও ভিশন স্মার্ট এসি', icon: 'Wind', count: 340 },
          { id: 'tonnage_split_ac', nameEn: '1.0 Ton / 1.5 Ton / 2.0 Ton Split & Cassette', nameBn: '১.৫ টন ও ২ টন স্প্লিট এসি', icon: 'Wind', count: 280 }
        ]
      },
      {
        id: 'refrigerators',
        nameEn: 'Refrigerators & Freezers',
        nameBn: 'রেফ্রিজারেটর ও ডিপ ফ্রিজ',
        icon: 'Layers',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=500&q=80',
        count: 1980,
        secondLevelCategories: [
          { id: 'samsung_side_by_side', nameEn: 'Samsung Side-by-Side & Inverter Fridge', nameBn: 'স্যামসাং সাইড-বাই-সাইড ফ্রিজ', icon: 'Layers', count: 560 },
          { id: 'walton_fridge', nameEn: 'Walton Non-Frost & Direct Cool Fridge', nameBn: 'ওয়ালটন নন-ফ্রস্ট ইনভার্টার ফ্রিজ', icon: 'Layers', count: 690 },
          { id: 'lg_smart_fridge', nameEn: 'LG InstaView & Smart Inverter Fridge', nameBn: 'এলজি ইনস্টাভিউ স্মার্ট ফ্রিজ', icon: 'Layers', count: 380 },
          { id: 'deep_freezers', nameEn: 'Deep Freezers & Commercial Coolers', nameBn: 'ডিপ ফ্রিজ ও কমার্শিয়াল ফ্রিজার', icon: 'Layers', count: 350 }
        ]
      },
      {
        id: 'gaming_consoles',
        nameEn: 'Gaming Consoles & VR',
        nameBn: 'গেমিং কনসোল ও কন্ট্রোলার',
        icon: 'Gamepad2',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80',
        count: 1150,
        secondLevelCategories: [
          { id: 'playstation_5', nameEn: 'PlayStation 5 Pro & PS5 Slim Consoles', nameBn: 'প্লেস্টেশন ৫ প্রো ও স্লিম', icon: 'Gamepad2', count: 540 },
          { id: 'xbox_series', nameEn: 'Xbox Series X & Series S Consoles', nameBn: 'এক্সবক্স সিরিজ এক্স ও এস', icon: 'Gamepad2', count: 230 },
          { id: 'nintendo_switch', nameEn: 'Nintendo Switch OLED & Lite', nameBn: 'নিনটেন্ডো সুইচ ওলেড', icon: 'Gamepad2', count: 180 },
          { id: 'handheld_gaming', nameEn: 'Steam Deck OLED & ROG Ally X', nameBn: 'স্টিম ডেক ও হ্যান্ডহেল্ড কনসোল', icon: 'Gamepad2', count: 120 },
          { id: 'playstation_4', nameEn: 'PlayStation 4 Pro & PS4 Slim', nameBn: 'প্লেস্টেশন ৪ প্রো', icon: 'Gamepad2', count: 80 }
        ]
      },
      {
        id: 'cctv_security',
        nameEn: 'CCTV, Security & Smart Home',
        nameBn: 'সিসিটিভি, সিকিউরিটি ও হোম অ্যাপ্লায়েন্স',
        icon: 'Shield',
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80',
        count: 1210,
        secondLevelCategories: [
          { id: 'hikvision_cctv', nameEn: 'Hikvision ColorVu 4K IP / HD Cameras', nameBn: 'হিকভিশন কালারভিউ ক্যামেরা', icon: 'Shield', count: 480 },
          { id: 'dahua_surveillance', nameEn: 'Dahua WizSense 5MP/4K CCTV Sets', nameBn: 'দাহুয়া সিসিটিভি ক্যামেরা', icon: 'Shield', count: 290 },
          { id: 'ezviz_imou_wifi', nameEn: 'EZVIZ, Imou & Tapo 360° WiFi IP Cams', nameBn: 'ইজভিজ ও আইমু ওয়াইফাই ক্যামেরা', icon: 'Shield', count: 260 },
          { id: 'washing_home_appliances', nameEn: 'Automatic Washing Machines & Microwaves', nameBn: 'ওয়াশিং মেশিন ও ওভেন', icon: 'RefreshCw', count: 180 }
        ]
      }
    ]
  },

  // 4. Vehicles (Master Template)
  {
    id: 'vehicles',
    nameEn: 'Vehicles',
    nameBn: 'যানবাহন ও গাড়ি',
    icon: 'Car',
    image: catScooterImg,
    count: 7620,
    popularBrands: ['Toyota', 'Yamaha', 'Honda', 'Suzuki', 'Bajaj', 'TVS', 'Hero', 'Royal Enfield', 'Nissan', 'Hyundai', 'Mitsubishi', 'Mercedes-Benz', 'BMW', 'Kia', 'Ford', 'Chevrolet', 'Audi', 'Tesla', 'Runner', 'KTM', 'Kawasaki', 'Lifan', 'Walton', 'Vespa'],
    subcategories: [
      {
        id: 'cars',
        nameEn: 'Cars',
        nameBn: 'কার ও প্রাইভেট কার',
        icon: 'Car',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80',
        count: 2840,
        secondLevelCategories: [
          { id: 'toyota', nameEn: 'Toyota', nameBn: 'টোয়োটা', icon: 'Car', count: 980 },
          { id: 'honda', nameEn: 'Honda', nameBn: 'হোন্ডা', icon: 'Car', count: 420 },
          { id: 'nissan', nameEn: 'Nissan', nameBn: 'নিসান', icon: 'Car', count: 310 },
          { id: 'mitsubishi', nameEn: 'Mitsubishi', nameBn: 'মিটসুবিশি', icon: 'Car', count: 230 },
          { id: 'hyundai', nameEn: 'Hyundai', nameBn: 'হুন্দাই', icon: 'Car', count: 195 },
          { id: 'kia', nameEn: 'Kia', nameBn: 'কিয়া', icon: 'Car', count: 140 },
          { id: 'mazda', nameEn: 'Mazda', nameBn: 'মাজদা', icon: 'Car', count: 95 },
          { id: 'bmw', nameEn: 'BMW', nameBn: 'বিএমডব্লিউ', icon: 'Car', count: 110 },
          { id: 'mercedes_benz', nameEn: 'Mercedes-Benz', nameBn: 'মার্সিডিজ-বেঞ্জ', icon: 'Car', count: 105 },
          { id: 'audi', nameEn: 'Audi', nameBn: 'অডি', icon: 'Car', count: 75 },
          { id: 'tesla', nameEn: 'Tesla', nameBn: 'টেসলা', icon: 'Zap', count: 45 },
          { id: 'suzuki', nameEn: 'Suzuki', nameBn: 'সুজুকি', icon: 'Car', count: 160 },
          { id: 'ford', nameEn: 'Ford', nameBn: 'ফোর্ড', icon: 'Car', count: 60 },
          { id: 'chevrolet', nameEn: 'Chevrolet', nameBn: 'শেভ্রোলে', icon: 'Car', count: 40 },
          { id: 'other_cars', nameEn: 'Other Cars', nameBn: 'অন্যান্য গাড়ি', icon: 'Car', count: 135 },
        ]
      },
      {
        id: 'motorcycles_scooters',
        nameEn: 'Motorcycles & Scooters',
        nameBn: 'মোটরসাইকেল ও স্কুটার',
        icon: 'Bike',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=80',
        count: 2450,
        secondLevelCategories: [
          { id: 'yamaha', nameEn: 'Yamaha', nameBn: 'ইয়ামাহা', icon: 'Bike', count: 680 },
          { id: 'honda_bike', nameEn: 'Honda', nameBn: 'হোন্ডা', icon: 'Bike', count: 520 },
          { id: 'suzuki_bike', nameEn: 'Suzuki', nameBn: 'সুজুকি', icon: 'Bike', count: 410 },
          { id: 'bajaj', nameEn: 'Bajaj', nameBn: 'বাজাজ', icon: 'Bike', count: 460 },
          { id: 'tvs', nameEn: 'TVS', nameBn: 'টিভিএস', icon: 'Bike', count: 320 },
          { id: 'hero', nameEn: 'Hero', nameBn: 'হিরো', icon: 'Bike', count: 290 },
          { id: 'runner', nameEn: 'Runner', nameBn: 'রানার', icon: 'Bike', count: 110 },
          { id: 'ktm', nameEn: 'KTM', nameBn: 'কেটিএম', icon: 'Bike', count: 85 },
          { id: 'royal_enfield', nameEn: 'Royal Enfield', nameBn: 'রয়্যাল এনফিল্ড', icon: 'Bike', count: 95 },
          { id: 'kawasaki', nameEn: 'Kawasaki', nameBn: 'কাওয়াসাকি', icon: 'Bike', count: 70 },
          { id: 'lifan', nameEn: 'Lifan', nameBn: 'লিফান', icon: 'Bike', count: 55 },
          { id: 'walton_bike', nameEn: 'Walton', nameBn: 'ওয়ালটন', icon: 'Bike', count: 40 },
          { id: 'vespa', nameEn: 'Vespa', nameBn: 'ভেসপা', icon: 'Bike', count: 65 },
          { id: 'other_motorcycles', nameEn: 'Other Motorcycles', nameBn: 'অন্যান্য মোটরসাইকেল', icon: 'Bike', count: 80 },
          { id: 'scooters', nameEn: 'Scooters', nameBn: 'স্কুটার', icon: 'Bike', count: 120 },
        ]
      },
      {
        id: 'buses_microbuses',
        nameEn: 'Buses & Microbuses',
        nameBn: 'বাস ও মাইক্রোবাস',
        icon: 'Bus',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500&q=80',
        count: 530,
        secondLevelCategories: [
          { id: 'buses', nameEn: 'Buses', nameBn: 'বাস', icon: 'Bus', count: 140 },
          { id: 'mini_buses', nameEn: 'Mini Buses', nameBn: 'মিনি বাস', icon: 'Bus', count: 90 },
          { id: 'microbuses', nameEn: 'Microbuses & HiAce', nameBn: 'মাইক্রোবাস ও হায়েস', icon: 'Bus', count: 210 },
          { id: 'tourist_buses', nameEn: 'Tourist Buses', nameBn: 'ট্যুরিস্ট বাস', icon: 'Bus', count: 45 },
          { id: 'other_buses_microbuses', nameEn: 'Other Buses & Vans', nameBn: 'অন্যান্য বাস ও ভ্যান', icon: 'Bus', count: 45 },
        ]
      },
      {
        id: 'vehicle_parts_accessories',
        nameEn: 'Vehicle Parts & Accessories',
        nameBn: 'গাড়ির পার্টস ও অ্যাক্সেসরিজ',
        icon: 'Wrench',
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=500&q=80',
        count: 1420,
        secondLevelCategories: [
          { id: 'engine_drivetrain', nameEn: 'Engine & Drivetrain', nameBn: 'ইঞ্জিন ও পার্টস', icon: 'Wrench', count: 180 },
          { id: 'tires_wheels', nameEn: 'Tires & Alloy Wheels', nameBn: 'টায়ার ও চাকা', icon: 'Wrench', count: 260 },
          { id: 'batteries', nameEn: 'Batteries', nameBn: 'ব্যাটারি', icon: 'Wrench', count: 175 },
          { id: 'headlights_lighting', nameEn: 'Headlights & LED', nameBn: 'হেডলাইট ও লাইটিং', icon: 'Wrench', count: 140 },
          { id: 'motorcycle_parts', nameEn: 'Motorcycle Parts', nameBn: 'মোটরসাইকেল পার্টস', icon: 'Bike', count: 190 },
          { id: 'car_interior_accessories', nameEn: 'Interior & Multimedia', nameBn: 'ইন্টেরিয়র ও অ্যান্ড্রয়েড প্লেয়ার', icon: 'Wrench', count: 165 },
          { id: 'other_parts_accessories', nameEn: 'Other Parts', nameBn: 'অন্যান্য পার্টস', icon: 'Wrench', count: 310 },
        ]
      },
      {
        id: 'trucks_heavy_vehicles',
        nameEn: 'Trucks & Heavy Vehicles',
        nameBn: 'ট্রাক ও হেভি ভেহিকেল',
        icon: 'Truck',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=500&q=80',
        count: 480,
        secondLevelCategories: [
          { id: 'pickup_trucks', nameEn: 'Pickup Trucks', nameBn: 'পিকআপ ট্রাক', icon: 'Truck', count: 130 },
          { id: 'covered_vans', nameEn: 'Covered Vans', nameBn: 'কাভার্ড ভ্যান', icon: 'Truck', count: 110 },
          { id: 'cargo_trucks', nameEn: 'Cargo Trucks', nameBn: 'কার্গো ট্রাক', icon: 'Truck', count: 95 },
          { id: 'dump_trucks', nameEn: 'Dump Trucks', nameBn: 'ডাম্প ট্রাক', icon: 'Truck', count: 45 },
          { id: 'heavy_machinery', nameEn: 'Heavy Machinery', nameBn: 'হেভি মেশিনারি', icon: 'Truck', count: 100 },
        ]
      },
      {
        id: 'bicycles',
        nameEn: 'Bicycles',
        nameBn: 'বাইসাইকেল',
        icon: 'Bike',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80',
        count: 620,
        secondLevelCategories: [
          { id: 'mountain_bikes', nameEn: 'Mountain Bikes (MTB)', nameBn: 'মাউন্টেন বাইক (MTB)', icon: 'Bike', count: 220 },
          { id: 'city_bikes', nameEn: 'City & Commuter Bikes', nameBn: 'সিটি বাইক', icon: 'Bike', count: 110 },
          { id: 'road_bikes', nameEn: 'Road Bikes', nameBn: 'রোড বাইক', icon: 'Bike', count: 95 },
          { id: 'kids_bicycles', nameEn: 'Kids Bicycles', nameBn: 'শিশুদের সাইকেল', icon: 'Bike', count: 85 },
          { id: 'electric_bicycles', nameEn: 'Electric Bicycles (E-Bike)', nameBn: 'ইলেকট্রিক সাইকেল', icon: 'Bike', count: 50 },
          { id: 'other_bicycles', nameEn: 'Other Bicycles & Parts', nameBn: 'অন্যান্য সাইকেল', icon: 'Bike', count: 60 },
        ]
      },
      {
        id: 'three_wheelers',
        nameEn: 'Three Wheelers & Auto',
        nameBn: 'থ্রি হুইলার ও অটোরিকশা',
        icon: 'Car',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80',
        count: 390,
        secondLevelCategories: [
          { id: 'cng_auto_rickshaw', nameEn: 'CNG Auto Rickshaw', nameBn: 'সিএনজি অটোরিকশা', icon: 'Car', count: 140 },
          { id: 'battery_auto_rickshaw', nameEn: 'Battery Auto Rickshaw', nameBn: 'ব্যাটারি অটোরিকশা', icon: 'Car', count: 110 },
          { id: 'easy_bike', nameEn: 'Easy Bike', nameBn: 'ইজি বাইক', icon: 'Car', count: 95 },
          { id: 'cargo_three_wheelers', nameEn: 'Cargo Three Wheelers', nameBn: 'কার্গো ভ্যান', icon: 'Car', count: 45 },
        ]
      },
      {
        id: 'tractors_agricultural_vehicles',
        nameEn: 'Tractors & Agri Vehicles',
        nameBn: 'ট্রাক্টর ও কৃষি যানবাহন',
        icon: 'Tractor',
        image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=500&q=80',
        count: 290,
        secondLevelCategories: [
          { id: 'tractors', nameEn: 'Tractors', nameBn: 'ট্রাক্টর', icon: 'Tractor', count: 110 },
          { id: 'power_tillers', nameEn: 'Power Tillers', nameBn: 'পাওয়ার টিলার', icon: 'Tractor', count: 70 },
          { id: 'harvesters', nameEn: 'Combine Harvesters', nameBn: 'কম্বাইন হারভেস্টার', icon: 'Tractor', count: 60 },
          { id: 'tractor_parts', nameEn: 'Tractor Parts & Trailers', nameBn: 'ট্রাক্টর পার্টস', icon: 'Tractor', count: 50 },
        ]
      },
      {
        id: 'water_transport',
        nameEn: 'Water Transport',
        nameBn: 'নৌযান ও বোট',
        icon: 'Ship',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=500&q=80',
        count: 240,
        secondLevelCategories: [
          { id: 'boats_trawlers', nameEn: 'Boats & Trawlers', nameBn: 'নৌকা ও ট্রলার', icon: 'Ship', count: 75 },
          { id: 'speed_boats', nameEn: 'Speed Boats & Jet Skis', nameBn: 'স্পিড বোট', icon: 'Ship', count: 45 },
          { id: 'launches_ships', nameEn: 'Launches & Passenger Boats', nameBn: 'লঞ্চ ও যাত্রীবাহী বোট', icon: 'Ship', count: 55 },
          { id: 'marine_engines', nameEn: 'Marine Engines & Parts', nameBn: 'মেরিন ইঞ্জিন ও পার্টস', icon: 'Ship', count: 65 },
        ]
      }
    ]
  },

  // 5. Property
  {
    id: 'property',
    nameEn: 'Property',
    nameBn: 'জমি ও বাসস্থান',
    icon: 'Home',
    image: catHouseImg,
    count: 5120,
    subcategories: [
      {
        id: 'apartments_sale',
        nameEn: 'Apartments for Sale',
        nameBn: 'ফ্ল্যাট বিক্রয়',
        icon: 'Home',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80',
        count: 1650,
        secondLevelCategories: [
          { id: 'ready_flats', nameEn: 'Ready Flats', nameBn: 'রেডি ফ্ল্যাট', icon: 'Home', count: 720 },
          { id: 'under_construction_flats', nameEn: 'Under Construction Flats', nameBn: 'চলমান প্রজেক্ট', icon: 'Home', count: 460 },
          { id: 'duplex_luxury_flats', nameEn: 'Duplex & Penthouses', nameBn: 'ডুপ্লেক্স ও পেন্টহাউস', icon: 'Home', count: 280 },
          { id: 'studio_apartments', nameEn: 'Studio Apartments', nameBn: 'স্টুডিও অ্যাপার্টমেন্ট', icon: 'Home', count: 190 }
        ]
      },
      {
        id: 'apartments_rent',
        nameEn: 'Apartments for Rent',
        nameBn: 'ফ্ল্যাট ভাড়া',
        icon: 'Home',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80',
        count: 1420,
        secondLevelCategories: [
          { id: 'family_apartments', nameEn: 'Family Apartments', nameBn: 'ফ্যামিলি ফ্ল্যাট', icon: 'Home', count: 820 },
          { id: 'bachelor_flats', nameEn: 'Bachelor Flats', nameBn: 'ব্যাচেলর বাসা', icon: 'Home', count: 320 },
          { id: 'furnished_apartments', nameEn: 'Furnished Service Flats', nameBn: 'ফার্নিশড ফ্ল্যাট', icon: 'Home', count: 280 }
        ]
      },
      {
        id: 'land',
        nameEn: 'Land & Plots',
        nameBn: 'জমি ও প্লট',
        icon: 'Layers',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'residential_plots', nameEn: 'Residential Plots', nameBn: 'আবাসিক প্লট', icon: 'Layers', count: 540 },
          { id: 'commercial_land', nameEn: 'Commercial Land', nameBn: 'বাণিজ্যিক জমি', icon: 'Layers', count: 240 },
          { id: 'agricultural_land_prop', nameEn: 'Agricultural Land', nameBn: 'কৃষি জমি', icon: 'Layers', count: 200 }
        ]
      },
      {
        id: 'commercial',
        nameEn: 'Commercial Property',
        nameBn: 'বাণিজ্যিক সম্পত্তি ও স্পেস',
        icon: 'Building2',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80',
        count: 640,
        secondLevelCategories: [
          { id: 'office_space_comm', nameEn: 'Office Space', nameBn: 'অফিস স্পেস', icon: 'Building2', count: 280 },
          { id: 'shops_showrooms', nameEn: 'Shops & Showrooms', nameBn: 'দোকান ও শোরুম', icon: 'Building2', count: 220 },
          { id: 'warehouses_godowns', nameEn: 'Warehouses & Godowns', nameBn: 'গুদাম ও ফ্যাক্টরি', icon: 'Building2', count: 140 }
        ]
      },
      {
        id: 'houses',
        nameEn: 'Houses & Villas',
        nameBn: 'বাড়ি ও ভিলা',
        icon: 'Home',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80',
        count: 430,
        secondLevelCategories: [
          { id: 'duplex_houses', nameEn: 'Duplex Houses', nameBn: 'ডুপ্লেক্স বাড়ি', icon: 'Home', count: 210 },
          { id: 'complete_buildings', nameEn: 'Multi-Storey Buildings', nameBn: 'সম্পূর্ণ বিল্ডিং', icon: 'Home', count: 140 },
          { id: 'villas_farmhouses', nameEn: 'Luxury Villas & Farmhouses', nameBn: 'ভিলা ও বাগানবাড়ি', icon: 'Home', count: 80 }
        ]
      }
    ]
  },

  // 6. Home & Furniture
  {
    id: 'home_furniture',
    nameEn: 'Home & Furniture',
    nameBn: 'ঘর ও আসবাব',
    icon: 'Armchair',
    image: catSofaImg,
    count: 4210,
    subcategories: [
      {
        id: 'sofas',
        nameEn: 'Sofas & Divans',
        nameBn: 'সোফা ও ডিভান',
        icon: 'Armchair',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'l_shaped_sofas', nameEn: 'L-Shaped Sectional Sofas', nameBn: 'এল-শেপ সোফা', icon: 'Armchair', count: 480 },
          { id: 'sofa_sets_321', nameEn: '3+2+1 Sofa Sets', nameBn: '৩+২+১ সোফা সেট', icon: 'Armchair', count: 390 },
          { id: 'recliners_sofabeds', nameEn: 'Recliners & Sofa Beds', nameBn: 'রিক্লাইনার ও সোফা বেড', icon: 'Armchair', count: 250 }
        ]
      },
      {
        id: 'beds',
        nameEn: 'Beds & Mattresses',
        nameBn: 'খাট ও তোশক',
        icon: 'Bed',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'king_queen_beds', nameEn: 'King & Queen Wooden Beds', nameBn: 'কাঠের কিং/কুইন খাট', icon: 'Bed', count: 520 },
          { id: 'orthopedic_mattresses', nameEn: 'Orthopedic & Spring Mattresses', nameBn: 'অর্থোপেডিক তোশক', icon: 'Bed', count: 310 },
          { id: 'bunk_storage_beds', nameEn: 'Hydraulic Storage & Bunk Beds', nameBn: 'স্টোরেজ ও বাঙ্ক বেড', icon: 'Bed', count: 150 }
        ]
      },
      {
        id: 'wardrobes',
        nameEn: 'Wardrobes & Closets',
        nameBn: 'আলমারি ও ওয়্যারড্রব',
        icon: 'Archive',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80',
        count: 760,
        secondLevelCategories: [
          { id: '4_door_wardrobes', nameEn: '4-Door & 3-Door Wardrobes', nameBn: '৪/৩ পাল্লার ওয়্যারড্রব', icon: 'Archive', count: 410 },
          { id: 'sliding_wardrobes', nameEn: 'Sliding Modern Closets', nameBn: 'স্লাইডিং আলমারি', icon: 'Archive', count: 240 },
          { id: 'dressers_drawers', nameEn: 'Chest of Drawers & Dressing', nameBn: 'ড্রেসিং টেবিল ও ড্রয়ার', icon: 'Archive', count: 110 }
        ]
      },
      {
        id: 'dining_tables',
        nameEn: 'Dining Tables & Sets',
        nameBn: 'ডাইনিং টেবিল ও চেয়ার',
        icon: 'Utensils',
        image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=500&q=80',
        count: 590,
        secondLevelCategories: [
          { id: '6_chair_dining', nameEn: '6-Chair Dining Sets', nameBn: '৬ চেয়ারের ডাইনিং সেট', icon: 'Utensils', count: 310 },
          { id: 'marble_glass_dining', nameEn: 'Marble & Glass Top Dining', nameBn: 'মার্বেল ও গ্লাস টপ ডাইনিং', icon: 'Utensils', count: 180 },
          { id: '4_chair_dining', nameEn: '4-Chair Compact Dining', nameBn: '৪ চেয়ারের ডাইনিং', icon: 'Utensils', count: 100 }
        ]
      },
      {
        id: 'office_furniture',
        nameEn: 'Office Furniture',
        nameBn: 'অফিস ফার্নিচার ও চেয়ার',
        icon: 'Briefcase',
        image: 'https://images.unsplash.com/photo-1580481077190-7361356a35a7?auto=format&fit=crop&w=500&q=80',
        count: 760,
        secondLevelCategories: [
          { id: 'ergonomic_office_chairs', nameEn: 'Ergonomic Mesh Chairs', nameBn: 'এরগনোমিক অফিস চেয়ার', icon: 'Briefcase', count: 380 },
          { id: 'executive_desks', nameEn: 'Executive Director Desks', nameBn: 'এক্সিকিউটিভ অফিস টেবিল', icon: 'Briefcase', count: 240 },
          { id: 'file_cabinets_workstations', nameEn: 'File Cabinets & Workstations', nameBn: 'ওয়ার্কস্টেশন ও ক্যাবিনেট', icon: 'Briefcase', count: 140 }
        ]
      }
    ]
  },

  // 7. Fashion
  {
    id: 'fashion',
    nameEn: 'Fashion',
    nameBn: 'ফ্যাশন',
    icon: 'Shirt',
    image: catSneakerImg,
    count: 8340,
    subcategories: [
      {
        id: 'mens_clothing',
        nameEn: "Men's Clothing",
        nameBn: 'পুরুষদের পোশাক',
        icon: 'Shirt',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=500&q=80',
        count: 2450,
        secondLevelCategories: [
          { id: 'panjabi_pajama', nameEn: 'Panjabi & Pajama', nameBn: 'পাঞ্জাবি ও পায়জামা', icon: 'Shirt', count: 890 },
          { id: 'casual_formal_shirts', nameEn: 'Shirts & T-Shirts', nameBn: 'শার্ট ও টি-শার্ট', icon: 'Shirt', count: 680 },
          { id: 'jeans_trousers', nameEn: 'Jeans & Trousers', nameBn: 'জিন্স ও ট্রাউজার', icon: 'Shirt', count: 510 },
          { id: 'suits_blazers', nameEn: 'Suits & Blazers', nameBn: 'স্যুট ও ব্লেজার', icon: 'Shirt', count: 370 }
        ]
      },
      {
        id: 'womens_clothing',
        nameEn: "Women's Clothing",
        nameBn: 'নারীদের পোশাক',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
        count: 2890,
        secondLevelCategories: [
          { id: 'sharees', nameEn: 'Sharees (Jamdani/Silk/Kathan)', nameBn: 'শাড়ি', icon: 'Sparkles', count: 1120 },
          { id: 'salwar_kameez_kurtis', nameEn: 'Salwar Kameez & Three-Piece', nameBn: 'থ্রি-পিস ও কুর্তি', icon: 'Sparkles', count: 980 },
          { id: 'abayas_hijabs', nameEn: 'Abayas & Hijabs', nameBn: 'বোরকা ও হিজাব', icon: 'Sparkles', count: 480 },
          { id: 'gowns_lehengas', nameEn: 'Lehengas & Party Gowns', nameBn: 'লেহেঙ্গা ও গাউন', icon: 'Sparkles', count: 310 }
        ]
      },
      {
        id: 'shoes',
        nameEn: 'Shoes & Footwear',
        nameBn: 'জুতা ও স্নিকার্স',
        icon: 'Footprints',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
        count: 1480,
        secondLevelCategories: [
          { id: 'sneakers_sports_shoes', nameEn: 'Sneakers & Running Shoes', nameBn: 'স্নিকার্স ও স্পোর্টস শু', icon: 'Footprints', count: 720 },
          { id: 'formal_leather_shoes', nameEn: 'Formal Leather Shoes & Loafers', nameBn: 'ফরমাল চামড়ার জুতা', icon: 'Footprints', count: 460 },
          { id: 'ladies_heels_flats', nameEn: "Ladies' Heels, Flats & Sandals", nameBn: 'লেডিস হিল ও স্যান্ডেল', icon: 'Footprints', count: 300 }
        ]
      },
      {
        id: 'watches',
        nameEn: 'Watches & Accessories',
        nameBn: 'ঘড়ি ও জুয়েলারি',
        icon: 'Watch',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
        count: 1520,
        secondLevelCategories: [
          { id: 'luxury_watches', nameEn: "Men's & Women's Watches", nameBn: 'ব্র্যান্ডেড ঘড়ি', icon: 'Watch', count: 680 },
          { id: 'gold_diamond_jewellery', nameEn: 'Gold & Diamond Jewellery', nameBn: 'স্বর্ণ ও ডায়মন্ড গহনা', icon: 'Sparkles', count: 520 },
          { id: 'sunglasses_belts', nameEn: 'Sunglasses, Belts & Wallets', nameBn: 'সানগ্লাস, বেল্ট ও ওয়ালেট', icon: 'Watch', count: 320 }
        ]
      }
    ]
  },

  // 8. Health & Beauty
  {
    id: 'health_beauty',
    nameEn: 'Health & Beauty',
    nameBn: 'স্বাস্থ্য ও সৌন্দর্য',
    icon: 'Sparkles',
    image: catPerfumeImg,
    count: 5120,
    subcategories: [
      {
        id: 'skin_care',
        nameEn: 'Skin Care & Creams',
        nameBn: 'ত্বকের যত্ন ও সেরাম',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
        count: 1820,
        secondLevelCategories: [
          { id: 'serums_toners', nameEn: 'Face Serums & Toners', nameBn: 'ফেস সেরাম ও টোনার', icon: 'Sparkles', count: 740 },
          { id: 'sunscreens_moisturizers', nameEn: 'Sunscreens & Moisturisers', nameBn: 'সানস্ক্রিন ও ময়েশ্চারাইজার', icon: 'Sparkles', count: 630 },
          { id: 'facewash_scrubs', nameEn: 'Facewash, Cleansers & Scrubs', nameBn: 'ফেসওয়াশ ও স্ক্রাব', icon: 'Sparkles', count: 450 }
        ]
      },
      {
        id: 'perfumes',
        nameEn: 'Perfumes & Attar',
        nameBn: 'পারফিউম ও আতর',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80',
        count: 1460,
        secondLevelCategories: [
          { id: 'mens_edp_cologne', nameEn: "Men's Luxury Perfumes (EDP)", nameBn: 'পুরুষদের পারফিউম', icon: 'Sparkles', count: 620 },
          { id: 'womens_perfumes', nameEn: "Women's Designer Perfumes", nameBn: 'নারীদের পারফিউম', icon: 'Sparkles', count: 480 },
          { id: 'attar_oud', nameEn: 'Concentrated Attar & Arabian Oud', nameBn: 'আতর ও এরাবিয়ান উদ', icon: 'Sparkles', count: 360 }
        ]
      },
      {
        id: 'makeup',
        nameEn: 'Makeup & Cosmetics',
        nameBn: 'মেকআপ ও কসমেটিক্স',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'foundations_concealers', nameEn: 'Foundations & Concealers', nameBn: 'ফাউন্ডেশন ও কনসিলার', icon: 'Sparkles', count: 490 },
          { id: 'lipsticks_lipgloss', nameEn: 'Lipsticks & Lip Gloss', nameBn: 'লিপস্টিক ও লিপগ্লস', icon: 'Sparkles', count: 380 },
          { id: 'eye_makeup_palettes', nameEn: 'Eye Makeup & Palettes', nameBn: 'আইশ্যাডো ও মাশকারা', icon: 'Sparkles', count: 250 }
        ]
      },
      {
        id: 'hair_care',
        nameEn: 'Hair Care & Grooming',
        nameBn: 'চুলের যত্ন ও গ্রুমিং',
        icon: 'Scissors',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=500&q=80',
        count: 720,
        secondLevelCategories: [
          { id: 'shampoos_hair_oils', nameEn: 'Shampoos, Conditioners & Oils', nameBn: 'শ্যাম্পু ও হেয়ার অয়েল', icon: 'Scissors', count: 410 },
          { id: 'trimmers_shavers', nameEn: 'Trimmers, Shavers & Straighteners', nameBn: 'ট্রিমার ও হেয়ার ড্রায়ার', icon: 'Scissors', count: 310 }
        ]
      }
    ]
  },

  // 9. Baby & Kids
  {
    id: 'baby_kids',
    nameEn: 'Baby & Kids',
    nameBn: 'শিশু সামগ্রী',
    icon: 'Baby',
    image: catTeddyImg,
    count: 3910,
    subcategories: [
      {
        id: 'toys',
        nameEn: 'Toys & Games',
        nameBn: 'খেলনা ও গেমস',
        icon: 'Gamepad2',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80',
        count: 1480,
        secondLevelCategories: [
          { id: 'rc_cars_drones', nameEn: 'RC Cars, Drones & Robots', nameBn: 'রিমোট কন্ট্রোল গাড়ি', icon: 'Gamepad2', count: 620 },
          { id: 'educational_lego_puzzles', nameEn: 'Educational Toys & Building Blocks', nameBn: 'এডুকেশনাল খেলনা ও লেগো', icon: 'Gamepad2', count: 540 },
          { id: 'dolls_action_figures', nameEn: 'Dolls & Action Figures', nameBn: 'পুতুল ও অ্যাকশন ফিগার', icon: 'Gamepad2', count: 320 }
        ]
      },
      {
        id: 'strollers',
        nameEn: 'Strollers, Walkers & Seats',
        nameBn: 'স্ট্রলার, ওয়াকার ও সিট',
        icon: 'Baby',
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=500&q=80',
        count: 890,
        secondLevelCategories: [
          { id: 'baby_strollers_prams', nameEn: 'Lightweight Strollers & Prams', nameBn: 'বেবি স্ট্রলার ও প্র্যাম', icon: 'Baby', count: 460 },
          { id: 'baby_walkers_rockers', nameEn: 'Baby Walkers & Rockers', nameBn: 'বেবি ওয়াকার ও রকার', icon: 'Baby', count: 280 },
          { id: 'car_safety_seats', nameEn: 'Car Safety Seats & High Chairs', nameBn: 'কার সিট ও হাই চেয়ার', icon: 'Baby', count: 150 }
        ]
      },
      {
        id: 'baby_clothing',
        nameEn: 'Baby Clothing & Care',
        nameBn: 'শিশুর পোশাক ও যত্ন',
        icon: 'Shirt',
        image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80',
        count: 1540,
        secondLevelCategories: [
          { id: 'newborn_rompers_sets', nameEn: 'Newborn Gift Sets & Rompers', nameBn: 'নবজাতকের পোশাক সেট', icon: 'Shirt', count: 710 },
          { id: 'baby_diapers_wipes', nameEn: 'Diapers, Wipes & Lotions', nameBn: 'ডায়াপার ও বেবি লোশন', icon: 'Baby', count: 540 },
          { id: 'feeding_bottles_pumps', nameEn: 'Feeding Bottles & Warmers', nameBn: 'ফিডিং বোতল ও পাম্প', icon: 'Baby', count: 290 }
        ]
      }
    ]
  },

  // 10. Books & Sports
  {
    id: 'books_sports',
    nameEn: 'Books & Sports',
    nameBn: 'বই ও খেলাধুলা',
    icon: 'BookOpen',
    image: catBooksImg,
    count: 6510,
    subcategories: [
      {
        id: 'books',
        nameEn: 'Books & Literature',
        nameBn: 'বই ও সাহিত্য',
        icon: 'BookOpen',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80',
        count: 2480,
        secondLevelCategories: [
          { id: 'fiction_novels', nameEn: 'Fiction, Novels & Literature', nameBn: 'উপন্যাস ও গল্প', icon: 'BookOpen', count: 940 },
          { id: 'islamic_religious_books', nameEn: 'Islamic & Religious Books', nameBn: 'ইসলামিক ও ধর্মীয় বই', icon: 'BookOpen', count: 780 },
          { id: 'academic_job_prep_books', nameEn: 'Academic, BCS & Textbooks', nameBn: 'বিসিএস ও টেক্সটবুক', icon: 'BookOpen', count: 520 },
          { id: 'self_help_business_books', nameEn: 'Self-Help & Business Books', nameBn: 'আত্মউন্নয়ন ও ব্যবসা', icon: 'BookOpen', count: 240 }
        ]
      },
      {
        id: 'sports_equipment',
        nameEn: 'Sports & Cricket Gear',
        nameBn: 'ক্রিকেট ও খেলার সরঞ্জাম',
        icon: 'Trophy',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80',
        count: 1720,
        secondLevelCategories: [
          { id: 'cricket_bats_kits', nameEn: 'Cricket Bats, Balls & Full Kits', nameBn: 'ক্রিকেট ব্যাট ও কিটস', icon: 'Trophy', count: 820 },
          { id: 'footballs_jerseys', nameEn: 'Footballs, Boots & Club Jerseys', nameBn: 'ফুটবল ও জার্সি', icon: 'Trophy', count: 540 },
          { id: 'badminton_table_tennis', nameEn: 'Badminton Rackets & TT Sets', nameBn: 'ব্যাডমিন্টন ও টেবিল টেনিস', icon: 'Trophy', count: 360 }
        ]
      },
      {
        id: 'gym_equipment',
        nameEn: 'Gym & Fitness Equipment',
        nameBn: 'জিম ও ফিটনেস সরঞ্জাম',
        icon: 'Dumbbell',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80',
        count: 1240,
        secondLevelCategories: [
          { id: 'treadmills_exercise_bikes', nameEn: 'Motorized Treadmills & Bikes', nameBn: 'ট্রেডমিল ও এক্সারসাইজ বাইক', icon: 'Dumbbell', count: 580 },
          { id: 'dumbbells_weight_sets', nameEn: 'Dumbbells, Barbells & Plates', nameBn: 'ডাম্বেল ও রড-প্লেট সেট', icon: 'Dumbbell', count: 420 },
          { id: 'home_gym_stations', nameEn: 'Multi Home Gyms & Yoga Mats', nameBn: 'মাল্টি জিম ও যোগব্যায়াম', icon: 'Dumbbell', count: 240 }
        ]
      },
      {
        id: 'musical_instruments',
        nameEn: 'Musical Instruments',
        nameBn: 'বাদ্যযন্ত্র ও গিটার',
        icon: 'Music',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80',
        count: 1070,
        secondLevelCategories: [
          { id: 'acoustic_electric_guitars', nameEn: 'Acoustic & Electric Guitars', nameBn: 'অ্যাকোস্টিক ও ইলেকট্রিক গিটার', icon: 'Music', count: 560 },
          { id: 'keyboards_synthesizers', nameEn: 'Electronic Keyboards & Pianos', nameBn: 'কীবোর্ড ও পিয়ানো', icon: 'Music', count: 290 },
          { id: 'traditional_instruments', nameEn: 'Tabla, Harmonium & Flutes', nameBn: 'তবলা, হারমোনিয়াম ও বাঁশি', icon: 'Music', count: 220 }
        ]
      }
    ]
  },

  // 11. Animals & Pets
  {
    id: 'animal_pets',
    nameEn: 'Animals & Pets',
    nameBn: 'পশুপাখি',
    icon: 'Dog',
    image: catCatImg,
    count: 4920,
    subcategories: [
      {
        id: 'cattle',
        nameEn: 'Cattle & Cows',
        nameBn: 'গরু ও ষাঁড়',
        icon: 'Beef',
        image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=500&q=80',
        count: 1850,
        secondLevelCategories: [
          { id: 'qurbani_bulls', nameEn: 'Qurbani Bulls & Oxen', nameBn: 'কোরবানির ষাঁড়', icon: 'Beef', count: 980 },
          { id: 'dairy_cows', nameEn: 'Dairy Cows & Milk Breeds', nameBn: 'দুগ্ধবতী গাভী', icon: 'Beef', count: 580 },
          { id: 'calves_heifers', nameEn: 'Calves & Heifers', nameBn: 'বকনা ও বাছুর', icon: 'Beef', count: 290 }
        ]
      },
      {
        id: 'goats',
        nameEn: 'Goats & Sheep',
        nameBn: 'ছাগল ও ভেড়া',
        icon: 'Dog',
        image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'black_bengal_goats', nameEn: 'Black Bengal Goats', nameBn: 'ব্ল্যাক বেঙ্গল ছাগল', icon: 'Dog', count: 560 },
          { id: 'jamnapari_boer_goats', nameEn: 'Jamnapari & Boer Goats', nameBn: 'যমুনাপারি ও বোয়ার খাসি', icon: 'Dog', count: 380 },
          { id: 'dumba_sheep', nameEn: 'Dumba & Sheep', nameBn: 'দুম্বা ও ভেড়া', icon: 'Dog', count: 180 }
        ]
      },
      {
        id: 'cats',
        nameEn: 'Cats & Kittens',
        nameBn: 'বিড়াল ও বিড়ালছানা',
        icon: 'Cat',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'persian_cats', nameEn: 'Persian Longhair Cats', nameBn: 'পার্শিয়ান বিড়াল', icon: 'Cat', count: 580 },
          { id: 'british_shorthair', nameEn: 'British Shorthair & Exotic', nameBn: 'ব্রিটিশ শর্টহেয়ার', icon: 'Cat', count: 240 },
          { id: 'rescue_kittens', nameEn: 'Deshi & Rescue Kittens', nameBn: 'দেশি বিড়ালছানা', icon: 'Cat', count: 160 }
        ]
      },
      {
        id: 'birds',
        nameEn: 'Birds & Pigeons',
        nameBn: 'পাখি ও কবুতর',
        icon: 'Bird',
        image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=500&q=80',
        count: 970,
        secondLevelCategories: [
          { id: 'parrots_macaws', nameEn: 'Parrots, Cockatiels & Bajrikor', nameBn: 'তোতা, বাজরিগার ও ককাটেল', icon: 'Bird', count: 490 },
          { id: 'fancy_racing_pigeons', nameEn: 'Fancy & Racing Pigeons', nameBn: 'রেসিং ও ফেন্সি কবুতর', icon: 'Bird', count: 340 },
          { id: 'cages_feed_supplies', nameEn: 'Bird Cages & Nutrition Feed', nameBn: 'পাখির খাঁচা ও খাদ্য', icon: 'Bird', count: 140 }
        ]
      }
    ]
  },

  // 12. Agriculture
  {
    id: 'agriculture',
    nameEn: 'Agriculture',
    nameBn: 'কৃষি',
    icon: 'Sprout',
    image: catPlantImg,
    count: 3280,
    subcategories: [
      {
        id: 'seeds',
        nameEn: 'Seeds & Saplings',
        nameBn: 'বীজ ও চারাগাছ',
        icon: 'Sprout',
        image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'hybrid_paddy_rice_seeds', nameEn: 'Hybrid Paddy & Rice Seeds', nameBn: 'উচ্চফলনশীল ধানের বীজ', icon: 'Sprout', count: 520 },
          { id: 'vegetable_seeds', nameEn: 'Vegetable & Fruit Seeds', nameBn: 'সবজি ও ফলের বীজ', icon: 'Sprout', count: 380 },
          { id: 'grafted_fruit_saplings', nameEn: 'Grafted Fruit & Flower Saplings', nameBn: 'কলম চারা ও ফুলগাছ', icon: 'Sprout', count: 220 }
        ]
      },
      {
        id: 'farm_machinery',
        nameEn: 'Farm Machinery & Pumps',
        nameBn: 'কৃষি যন্ত্রপাতি ও পাম্প',
        icon: 'Tractor',
        image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'power_tillers_harvesters', nameEn: 'Power Tillers & Harvesters', nameBn: 'পাওয়ার টিলার ও হারভেস্টার', icon: 'Tractor', count: 480 },
          { id: 'submersible_water_pumps', nameEn: 'Irrigation & Submersible Pumps', nameBn: 'সেচ পাম্প ও মোটর', icon: 'Tractor', count: 320 },
          { id: 'sprayers_cutters', nameEn: 'Sprayers & Grass Cutters', nameBn: 'স্প্রেয়ার ও গ্রাস কাটার', icon: 'Tractor', count: 180 }
        ]
      },
      {
        id: 'fertilizers',
        nameEn: 'Fertilizers & Animal Feed',
        nameBn: 'সার ও পশুখাদ্য',
        icon: 'Sprout',
        image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=500&q=80',
        count: 1180,
        secondLevelCategories: [
          { id: 'organic_vermicompost', nameEn: 'Organic Vermicompost & Manure', nameBn: 'জৈব ও ভার্মি কম্পোস্ট সার', icon: 'Sprout', count: 540 },
          { id: 'cattle_poultry_feed', nameEn: 'Cattle, Poultry & Fish Feed', nameBn: 'গবাদিপশু ও মাছের খাবার', icon: 'Sprout', count: 460 },
          { id: 'bio_pesticides', nameEn: 'Bio-Pesticides & Plant Vitamins', nameBn: 'কীটনাশক ও ভিটামিন', icon: 'Sprout', count: 180 }
        ]
      }
    ]
  },

  // 13. Business Equipment
  {
    id: 'business_equipment',
    nameEn: 'Business Equipment',
    nameBn: 'ব্যবসার সরঞ্জাম',
    icon: 'Building2',
    image: catToolboxImg,
    count: 2750,
    subcategories: [
      {
        id: 'industrial_machines',
        nameEn: 'Industrial & Sewing Machines',
        nameBn: 'শিল্প ও সেলাই মেশিন',
        icon: 'Cpu',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'garments_sewing_machines', nameEn: 'Garments Sewing Machines (Juki)', nameBn: 'জুকি ও গার্মেন্টস মেশিন', icon: 'Cpu', count: 520 },
          { id: 'cnc_lathe_machines', nameEn: 'CNC & Lathe Machines', nameBn: 'লেদ ও সিএনসি মেশিন', icon: 'Cpu', count: 280 },
          { id: 'air_compressors', nameEn: 'Heavy Air Compressors', nameBn: 'এয়ার কম্প্রেসার', icon: 'Cpu', count: 180 }
        ]
      },
      {
        id: 'shop_equipment',
        nameEn: 'Shop & POS Equipment',
        nameBn: 'দোকান ও পিওএস সরঞ্জাম',
        icon: 'ShoppingBag',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80',
        count: 920,
        secondLevelCategories: [
          { id: 'pos_terminals_scanners', nameEn: 'POS Touch Terminals & Scanners', nameBn: 'পিওএস ও বারকোড স্ক্যানার', icon: 'ShoppingBag', count: 480 },
          { id: 'supermarket_racks', nameEn: 'Supermarket Display Racks', nameBn: 'সুপারশপ ডিসপ্লে র‍্যাক', icon: 'ShoppingBag', count: 260 },
          { id: 'money_counters', nameEn: 'Money Counting & Fake Note Detectors', nameBn: 'টাকা গণনার মেশিন', icon: 'ShoppingBag', count: 180 }
        ]
      },
      {
        id: 'restaurant_equipment',
        nameEn: 'Restaurant & Kitchen Equipment',
        nameBn: 'রেস্টুরেন্ট কিচেন সরঞ্জাম',
        icon: 'Utensils',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',
        count: 850,
        secondLevelCategories: [
          { id: 'commercial_deep_fryers_ovens', nameEn: 'Commercial Ovens & Deep Fryers', nameBn: 'বাণিজ্যিক ওভেন ও ফ্রায়ার', icon: 'Utensils', count: 410 },
          { id: 'shawarma_pizza_machines', nameEn: 'Shawarma & Pizza Machines', nameBn: 'শরমা ও পিজ্জা ওভেন', icon: 'Utensils', count: 260 },
          { id: 'stainless_prep_tables', nameEn: 'Stainless Steel Counters & Sinks', nameBn: 'স্টেইনলেস স্টিল কাউন্টার', icon: 'Utensils', count: 180 }
        ]
      }
    ]
  },

  // 14. Services
  {
    id: 'services',
    nameEn: 'Services',
    nameBn: 'সেবা',
    icon: 'Wrench',
    image: catDrillImg,
    count: 3450,
    subcategories: [
      {
        id: 'home_repair',
        nameEn: 'Home Repair & AC Servicing',
        nameBn: 'হোম সার্ভিস ও এসি মেরামত',
        icon: 'Wrench',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80',
        count: 1240,
        secondLevelCategories: [
          { id: 'ac_servicing_gas_charge', nameEn: 'AC Master Wash & Gas Refill', nameBn: 'এসি সার্ভিসিং ও গ্যাস রিফিল', icon: 'Wrench', count: 620 },
          { id: 'electrical_plumbing_fix', nameEn: 'Electrician & Plumbing Services', nameBn: 'ইলেকট্রিশিয়ান ও প্লাম্বার', icon: 'Wrench', count: 380 },
          { id: 'painting_home_renovation', nameEn: 'Painting & House Renovation', nameBn: 'পেইন্টিং ও ইন্টেরিয়র কাজ', icon: 'Wrench', count: 240 }
        ]
      },
      {
        id: 'website_development',
        nameEn: 'Web & App Development',
        nameBn: 'ওয়েব ও অ্যাপ ডেভেলপমেন্ট',
        icon: 'Code',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80',
        count: 1120,
        secondLevelCategories: [
          { id: 'ecommerce_website_design', nameEn: 'E-commerce & Shopify Stores', nameBn: 'ই-কমার্স ওয়েবসাইট তৈরি', icon: 'Code', count: 540 },
          { id: 'android_ios_app_dev', nameEn: 'Android & iOS App Development', nameBn: 'অ্যান্ড্রয়েড ও আইওএস অ্যাপ', icon: 'Code', count: 360 },
          { id: 'seo_digital_marketing_service', nameEn: 'SEO & Facebook Ads Marketing', nameBn: 'এসইও ও ফেসবুক বুস্টিং', icon: 'Code', count: 220 }
        ]
      },
      {
        id: 'delivery_services',
        nameEn: 'House Shifting & Logistics',
        nameBn: 'বাসা বদল ও ট্রান্সপোর্ট',
        icon: 'Truck',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=500&q=80',
        count: 1090,
        secondLevelCategories: [
          { id: 'home_shifting_trucks', nameEn: 'House & Office Shifting Movers', nameBn: 'বাসা ও অফিস বদল', icon: 'Truck', count: 580 },
          { id: 'rent_a_car_pickup', nameEn: 'Pickup & Truck Rental', nameBn: 'পিকআপ ও ট্রাক ভাড়া', icon: 'Truck', count: 320 },
          { id: 'parcel_courier_delivery', nameEn: 'Express Parcel Delivery', nameBn: 'পার্সেল ও কুরিয়ার সেবা', icon: 'Truck', count: 190 }
        ]
      }
    ]
  },

  // 15. Jobs
  {
    id: 'jobs',
    nameEn: 'Jobs',
    nameBn: 'চাকরি',
    icon: 'Briefcase',
    image: catBriefcaseImg,
    count: 2890,
    subcategories: [
      {
        id: 'it_jobs',
        nameEn: 'IT & Software Jobs',
        nameBn: 'আইটি ও সফটওয়্যার চাকরি',
        icon: 'Code',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
        count: 1150,
        secondLevelCategories: [
          { id: 'software_developers', nameEn: 'Full Stack & App Developers', nameBn: 'সফটওয়্যার ডেভেলপার', icon: 'Code', count: 540 },
          { id: 'graphic_ui_designers', nameEn: 'UI/UX & Graphic Designers', nameBn: 'গ্রাফিক ও ইউআই ডিজাইনার', icon: 'Code', count: 320 },
          { id: 'digital_marketers_seo', nameEn: 'Digital Marketers & SEO Specialists', nameBn: 'ডিজিটাল মার্কেটার', icon: 'Code', count: 290 }
        ]
      },
      {
        id: 'sales_jobs',
        nameEn: 'Sales & Marketing Jobs',
        nameBn: 'সেলস ও মার্কেটিং চাকরি',
        icon: 'Briefcase',
        image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'showroom_sales_executives', nameEn: 'Showroom & Retail Sales', nameBn: 'শোরুম সেলস এক্সিকিউটিভ', icon: 'Briefcase', count: 480 },
          { id: 'corporate_sales_managers', nameEn: 'Corporate Business Development', nameBn: 'কর্পোরেট সেলস ম্যানেজার', icon: 'Briefcase', count: 320 },
          { id: 'telemarketing_call_center', nameEn: 'Call Center & Telemarketing', nameBn: 'কল সেন্টার এজেন্ট', icon: 'Briefcase', count: 180 }
        ]
      },
      {
        id: 'office_jobs',
        nameEn: 'Office & Admin Jobs',
        nameBn: 'অফিস ও অ্যাকাউন্টস চাকরি',
        icon: 'FileText',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=80',
        count: 760,
        secondLevelCategories: [
          { id: 'accounts_finance_officers', nameEn: 'Accountants & Finance Officers', nameBn: 'হিসাবরক্ষক ও ক্যাশিয়ার', icon: 'FileText', count: 360 },
          { id: 'admin_receptionists', nameEn: 'Admin Officers & Receptionists', nameBn: 'অ্যাডমিন ও রিসেপশনিস্ট', icon: 'FileText', count: 240 },
          { id: 'data_entry_operators', nameEn: 'Data Entry & Computer Operators', nameBn: 'ডাটা এন্ট্রি অপারেটর', icon: 'FileText', count: 160 }
        ]
      }
    ]
  },

  // 16. Others
  {
    id: 'others',
    nameEn: 'Others',
    nameBn: 'অন্যান্য',
    icon: 'Package',
    image: catGiftImg,
    count: 1420,
    subcategories: [
      {
        id: 'gift_items',
        nameEn: 'Gift Items & Crafts',
        nameBn: 'উপহার ও হস্তশিল্প',
        icon: 'Gift',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80',
        count: 640,
        secondLevelCategories: [
          { id: 'custom_gift_hampers', nameEn: 'Personalized Mugs & Gift Boxes', nameBn: 'কাস্টমাইজড উপহার বক্স', icon: 'Gift', count: 320 },
          { id: 'handicrafts_artworks', nameEn: 'Traditional Handicrafts & Jute Arts', nameBn: 'হস্তশিল্প ও পাটজাত পণ্য', icon: 'Gift', count: 210 },
          { id: 'novelty_surprise_gifts', nameEn: 'Novelty & Birthday Surprise Gifts', nameBn: 'বার্থডে গিফট আইটেম', icon: 'Gift', count: 110 }
        ]
      },
      {
        id: 'antiques',
        nameEn: 'Antiques & Collectibles',
        nameBn: 'পুরাতন শখের জিনিস',
        icon: 'Archive',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=500&q=80',
        count: 480,
        secondLevelCategories: [
          { id: 'vintage_coins_currency', nameEn: 'Vintage Coins & Old Banknotes', nameBn: 'পুরাতন মুদ্রা ও নোট', icon: 'Archive', count: 240 },
          { id: 'antique_clocks_decor', nameEn: 'Antique Clocks & Brassware', nameBn: 'প্রাচীন ঘড়ি ও পিতলের সামগ্রী', icon: 'Archive', count: 150 },
          { id: 'rare_manuscripts_relics', nameEn: 'Rare Relics & Memorabilia', nameBn: 'দুর্লভ অ্যান্টিক জিনিস', icon: 'Archive', count: 90 }
        ]
      },
      {
        id: 'miscellaneous',
        nameEn: 'Miscellaneous Items',
        nameBn: 'বিবিধ সামগ্রী',
        icon: 'Package',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80',
        count: 300,
        secondLevelCategories: [
          { id: 'general_surplus_goods', nameEn: 'General Surplus & Lots', nameBn: 'সারপ্লাস ও লট আইটেম', icon: 'Package', count: 180 },
          { id: 'community_giveaways', nameEn: 'Free Community Giveaways', nameBn: 'ফ্রি আইটেম ও অনুদান', icon: 'Package', count: 120 }
        ]
      }
    ]
  },

  // 17. Education & Courses
  {
    id: 'education_courses',
    nameEn: 'Education & Courses',
    nameBn: 'শিক্ষা ও কোর্স',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    count: 4150,
    subcategories: [
      {
        id: 'online_courses',
        nameEn: 'Online Skills & Freelancing',
        nameBn: 'অনলাইন কোর্স ও ফ্রিল্যান্সিং',
        icon: 'GraduationCap',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
        count: 1650,
        secondLevelCategories: [
          { id: 'fullstack_web_dev_course', nameEn: 'Full Stack Web & Python Bootcamp', nameBn: 'ওয়েব ডেভেলপমেন্ট কোর্স', icon: 'GraduationCap', count: 680 },
          { id: 'graphic_ui_design_course', nameEn: 'Graphic Design & Video Editing', nameBn: 'গ্রাফিক ও ভিডিও এডিটিং', icon: 'GraduationCap', count: 520 },
          { id: 'digital_marketing_course', nameEn: 'Digital Marketing & AI Masterclass', nameBn: 'ডিজিটাল মার্কেটিং কোর্স', icon: 'GraduationCap', count: 450 }
        ]
      },
      {
        id: 'language_learning',
        nameEn: 'Language Learning & IELTS',
        nameBn: 'ভাষা শিক্ষা ও আইইএলটিএস',
        icon: 'GraduationCap',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=80',
        count: 1320,
        secondLevelCategories: [
          { id: 'ielts_pte_prep', nameEn: 'IELTS & PTE Academic Preparation', nameBn: 'আইইএলটিএস ও পিটিই প্রস্তুতি', icon: 'GraduationCap', count: 680 },
          { id: 'spoken_english_fluency', nameEn: 'Spoken English Fluency', nameBn: 'স্পোকেন ইংলিশ কোর্স', icon: 'GraduationCap', count: 390 },
          { id: 'arabic_japanese_german', nameEn: 'Arabic, Japanese & German Courses', nameBn: 'আরবি, জাপানি ও জার্মান ভাষা', icon: 'GraduationCap', count: 250 }
        ]
      },
      {
        id: 'admission_coaching',
        nameEn: 'Admission Coaching & Tutors',
        nameBn: 'ভর্তি কোচিং ও টিউটর',
        icon: 'GraduationCap',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80',
        count: 1180,
        secondLevelCategories: [
          { id: 'buet_medical_admission', nameEn: 'Medical & Engineering Admission', nameBn: 'মেডিকেল ও বুয়েট ভর্তি প্রস্তুতি', icon: 'GraduationCap', count: 520 },
          { id: 'bcs_bank_job_coaching', nameEn: 'BCS & Bank Job Coaching', nameBn: 'বিসিএস ও ব্যাংক জব কোচিং', icon: 'GraduationCap', count: 420 },
          { id: 'home_tutors_science', nameEn: 'Home Tutors (SSC/HSC/English Medium)', nameBn: 'হোম টিউটর ও প্রাইভেট শিক্ষক', icon: 'GraduationCap', count: 240 }
        ]
      }
    ]
  },

  // 18. Travel & Tours
  {
    id: 'travel_tours',
    nameEn: 'Travel & Tours',
    nameBn: 'ভ্রমণ ও ট্যুর',
    icon: 'Plane',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    count: 3680,
    subcategories: [
      {
        id: 'domestic_tours',
        nameEn: 'Bangladesh Tour Packages',
        nameBn: 'দেশীয় ট্যুর প্যাকেজ',
        icon: 'Plane',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=500&q=80',
        count: 1420,
        secondLevelCategories: [
          { id: 'coxs_bazar_sajek', nameEn: "Cox's Bazar & Sajek Valley Tours", nameBn: 'কক্সবাজার ও সাজেক ভ্যালি', icon: 'Plane', count: 680 },
          { id: 'sylhet_sreemangal', nameEn: 'Sylhet, Jaflong & Sreemangal', nameBn: 'সিলেট ও শ্রীমঙ্গল চা বাগান', icon: 'Plane', count: 420 },
          { id: 'saint_martin_sundarbans', nameEn: 'Saint Martin & Sundarbans Eco-Tours', nameBn: 'সেন্টমার্টিন ও সুন্দরবন', icon: 'Plane', count: 320 }
        ]
      },
      {
        id: 'international_tours',
        nameEn: 'International Tour Packages',
        nameBn: 'বিদেশ ভ্রমণ ও এয়ার টিকেট',
        icon: 'Plane',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=500&q=80',
        count: 1280,
        secondLevelCategories: [
          { id: 'thailand_malaysia_tours', nameEn: 'Thailand, Malaysia & Singapore', nameBn: 'থাইল্যান্ড, মালয়েশিয়া ও সিঙ্গাপুর', icon: 'Plane', count: 580 },
          { id: 'dubai_maldives_turkey', nameEn: 'Dubai Desert & Maldives Luxury', nameBn: 'দুবাই ও মালদ্বীপ লাক্সারি ট্যুর', icon: 'Plane', count: 420 },
          { id: 'flight_ticket_bookings', nameEn: 'Domestic & Global Flight Tickets', nameBn: 'এয়ার টিকেট বুকিং', icon: 'Plane', count: 280 }
        ]
      },
      {
        id: 'hajj_umrah',
        nameEn: 'Hajj, Umrah & Hotels',
        nameBn: 'হজ, ওমরাহ ও রিসোর্ট',
        icon: 'Building2',
        image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=500&q=80',
        count: 980,
        secondLevelCategories: [
          { id: 'executive_umrah_packages', nameEn: 'VIP Executive Umrah Groups', nameBn: 'ভিআইপি ওমরাহ প্যাকেজ', icon: 'Building2', count: 480 },
          { id: 'resort_hotel_booking', nameEn: '5-Star Beach Resorts & Hotel Booking', nameBn: 'হোটেল ও রিসোর্ট বুকিং', icon: 'Building2', count: 340 },
          { id: 'car_rental_tours', nameEn: 'Tourist Microbus & Car Rental', nameBn: 'ট্যুরিস্ট মাইক্রোবাস ভাড়া', icon: 'Car', count: 160 }
        ]
      }
    ]
  },

  // 19. Food & Restaurants
  {
    id: 'food_restaurants',
    nameEn: 'Food & Restaurants',
    nameBn: 'খাবার ও রেস্টুরেন্ট',
    icon: 'Utensils',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    count: 6180,
    subcategories: [
      {
        id: 'restaurants',
        nameEn: 'Restaurants & Biryani',
        nameBn: 'রেস্টুরেন্ট ও বিরিয়ানি',
        icon: 'Utensils',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
        count: 2450,
        secondLevelCategories: [
          { id: 'dhaka_kacchi_biryani', nameEn: 'Dhaka Kacchi & Morog Polao', nameBn: 'ঢাকাই কাচ্চি ও মোরগ পোলাও', icon: 'Utensils', count: 1120 },
          { id: 'buffet_chinese_thai', nameEn: 'Chinese, Thai & Buffet Dining', nameBn: 'চাইনিজ ও বুফে রেস্টুরেন্ট', icon: 'Utensils', count: 810 },
          { id: 'rooftop_fine_dining', nameEn: 'Rooftop Cafe & Fine Dining', nameBn: 'রুফটপ ক্যাফে ও ডাইনিং', icon: 'Utensils', count: 520 }
        ]
      },
      {
        id: 'fast_food',
        nameEn: 'Fast Food, Pizza & Burgers',
        nameBn: 'বার্গার, পিজ্জা ও ফাস্ট ফুড',
        icon: 'Utensils',
        image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=500&q=80',
        count: 1980,
        secondLevelCategories: [
          { id: 'gourmet_beef_burgers', nameEn: 'Gourmet Beef & Crispy Burgers', nameBn: 'স্ম্যাশ বার্গার ও ফ্রাইজ', icon: 'Utensils', count: 860 },
          { id: 'artisan_cheese_pizzas', nameEn: 'Cheesy & Pan Pizza Delivery', nameBn: 'চিজি পিজ্জা ও পাস্তা', icon: 'Utensils', count: 680 },
          { id: 'fried_chicken_shawarma', nameEn: 'Crispy Fried Chicken & Shawarma', nameBn: 'ফ্রাইড চিকেন ও শর্মা', icon: 'Utensils', count: 440 }
        ]
      },
      {
        id: 'cakes_bakery',
        nameEn: 'Cakes, Sweets & Organic',
        nameBn: 'কেক, মিষ্টি ও খাঁটি খাবার',
        icon: 'Cake',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
        count: 1750,
        secondLevelCategories: [
          { id: 'custom_birthday_cakes', nameEn: 'Custom Birthday & Wedding Cakes', nameBn: 'কাস্টম বার্থডে ও ওয়েডিং কেক', icon: 'Cake', count: 720 },
          { id: 'traditional_bengali_sweets', nameEn: 'Chomchom, Rasgulla & Bogura Doi', nameBn: 'চমচম, রসগোল্লা ও বগুড়ার দই', icon: 'Utensils', count: 590 },
          { id: 'pure_honey_organic_ghee', nameEn: 'Sundarbans Honey & Organic Ghee', nameBn: 'সুন্দরবনের মধু ও খাঁটি ঘি', icon: 'Utensils', count: 440 }
        ]
      }
    ]
  },

  // 20. Events & Tickets
  {
    id: 'events_tickets',
    nameEn: 'Events & Tickets',
    nameBn: 'ইভেন্ট ও টিকেট',
    icon: 'Ticket',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    count: 2310,
    subcategories: [
      {
        id: 'concert_tickets',
        nameEn: 'Concert & Movie Tickets',
        nameBn: 'কনসার্ট ও সিনেমা টিকেট',
        icon: 'Ticket',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
        count: 1080,
        secondLevelCategories: [
          { id: 'live_concert_passes', nameEn: 'Rock & Live Music Concert Passes', nameBn: 'লাইভ মিউজিক কনসার্ট টিকেট', icon: 'Ticket', count: 520 },
          { id: 'cineplex_movie_tickets', nameEn: 'Star Cineplex & IMAX Tickets', nameBn: 'সিনেপ্লেক্স ও আইম্যাক্স টিকেট', icon: 'Ticket', count: 380 },
          { id: 'cricket_match_tickets', nameEn: 'BPL & Stadium Match Tickets', nameBn: 'বিপিএল ও ক্রিকেট খেলার টিকেট', icon: 'Ticket', count: 180 }
        ]
      },
      {
        id: 'wedding_services',
        nameEn: 'Wedding Events & Decor',
        nameBn: 'বিয়ের আয়োজন ও ডেকোরেশন',
        icon: 'Heart',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80',
        count: 780,
        secondLevelCategories: [
          { id: 'wedding_convention_halls', nameEn: 'Convention Hall & Stage Decor', nameBn: 'কনভেনশন হল ও স্টেজ ডেকোরেশন', icon: 'Heart', count: 390 },
          { id: 'wedding_photography_crew', nameEn: 'Cinematography & Photo Coverage', nameBn: 'ওয়েডিং সিনেমাটোগ্রাফি ও ফটোগ্রাফি', icon: 'Camera', count: 260 },
          { id: 'catering_grand_events', nameEn: 'Kacchi & Grand Wedding Catering', nameBn: 'বিয়ের রাজকীয় ক্যাটারিং', icon: 'Utensils', count: 130 }
        ]
      },
      {
        id: 'seminars_workshops',
        nameEn: 'Seminars & Birthday Parties',
        nameBn: 'সেমিনার ও জন্মদিন অনুষ্ঠান',
        icon: 'Calendar',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=500&q=80',
        count: 450,
        secondLevelCategories: [
          { id: 'tech_business_seminars', nameEn: 'Tech Summits & Business Expos', nameBn: 'টেক সামিট ও বিজনেস সেমিনার', icon: 'Calendar', count: 240 },
          { id: 'kids_birthday_party_decor', nameEn: 'Birthday Themes & Magicians', nameBn: 'বার্থডে ডেকোরেশন ও ম্যাজিক শো', icon: 'Gift', count: 210 }
        ]
      }
    ]
  }
];
