import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import { WatermarkedImage } from '../Product/WatermarkedImage';
import { BkashLogo, NagadLogo, RocketLogo } from '../Common/BrandLogos';
import { CATEGORIES, BANGLADESH_DIVISIONS, CATEGORY_BRANDS_MODELS, POPULAR_ITEM_NAMES_BY_CATEGORY } from '../../data/bangladeshData';
import { Product, AdType, Condition } from '../../types';
import { storage as safeStorage, safeParseJSON } from '../../utils/storage';
import {
  Upload,
  Plus,
  CheckCircle2,
  Zap,
  Star,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Lock,
  LogIn,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CreditCard,
  PhoneCall,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  PartyPopper,
  Clock,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Camera
} from 'lucide-react';

const CATEGORY_FEATURES_MAP: Record<string, { id: string; bn: string; en: string }[]> = {
  mobiles: [
    { id: '5g', bn: '৫জি (5G Supported)', en: '5G Supported' },
    { id: 'dual_sim', bn: 'ডুয়াল সিম (Dual SIM)', en: 'Dual SIM' },
    { id: 'nfc', bn: 'এনএফসি (NFC Support)', en: 'NFC Support' },
    { id: 'esim', bn: 'ই-সিম (eSIM Supported)', en: 'eSIM Supported' },
    { id: 'wireless_charging', bn: 'ওয়ারলেস চার্জিং (Wireless Charging)', en: 'Wireless Charging' },
    { id: 'fast_charging', bn: 'ফাস্ট চার্জিং (Fast Charging)', en: 'Fast Charging' },
    { id: 'fingerprint', bn: 'ফিঙ্গারপ্রিন্ট সেন্সর (Fingerprint Sensor)', en: 'Fingerprint Sensor' },
    { id: 'face_unlock', bn: 'ফেস আনলক (Face Unlock)', en: 'Face Unlock' },
    { id: 'water_resistant', bn: 'ওয়াটার রেজিস্ট্যান্ট (Water Resistant/IP68)', en: 'Water Resistant' },
    { id: 'stereo_speakers', bn: 'স্টিরিও স্পিকার (Stereo Speakers)', en: 'Stereo Speakers' },
    { id: 'expandable_storage', bn: 'মেমোরি কার্ড স্লট (Expandable Storage)', en: 'Expandable Storage' },
    { id: 'ai_camera', bn: 'এআই ক্যামেরা (AI Camera System)', en: 'AI Camera System' },
    { id: 'authentic', bn: 'অরিজিনাল ইনভয়েস/ক্যাশ মেমো আছে', en: 'Original Invoice Included' },
    { id: 'box_charger', bn: 'বক্স ও অরিজিনাল চার্জার সহ', en: 'Box & Original Charger' },
    { id: 'warranty', bn: 'অফিসিয়াল ব্রাঞ্চ ওয়ারেন্টি রয়েছে', en: 'Official Warranty Remaining' },
    { id: 'battery', bn: 'ব্যাটারি হেলথ ৮৫%+ / ফ্রেশ ব্যাকআপ', en: 'Good Battery Health (85%+)' },
    { id: 'no_repair', bn: 'কখনও খোলা বা রিপেয়ার করা হয়নি', en: 'Never Repaired / 100% Original' },
    { id: 'exchange', bn: 'এক্সচেঞ্জ (প্রোডাক্ট অদল-বদল) সম্ভব', en: 'Exchange Possible' },
    { id: 'home_delivery', bn: 'ক্যাশ অন ডেলিভারি / হোম ডেলিভারি', en: 'Cash on Delivery Available' },
    { id: 'money_back', bn: '৩ দিনের চেকিং / মানি ব্যাক গ্যারান্টি', en: '3 Days Guarantee' }
  ],
  electronics: [
    { id: 'authentic', bn: 'অরিজিনাল ইনভয়েস/ক্যাশ মেমো আছে', en: 'Original Memo Included' },
    { id: 'box_charger', bn: 'বক্স ও চার্জার/এক্সেসরিজ সহ', en: 'Box & Accessories' },
    { id: 'warranty', bn: 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি রয়েছে', en: 'Official Warranty Remaining' },
    { id: 'no_repair', bn: 'কখনও খোলা বা রিপেয়ার করা হয়নি', en: 'Never Repaired / 100% Original' },
    { id: 'home_delivery', bn: 'ক্যাশ অন ডেলিভারি সুবিধা আছে', en: 'Cash on Delivery' },
    { id: 'money_back', bn: '৩ দিনের টেস্ট গ্যারান্টি', en: '3 Days Testing Guarantee' }
  ],
  computers: [
    { id: 'authentic', bn: 'অরিজিনাল ইনভয়েস ও মেমো আছে', en: 'Original Memo Included' },
    { id: 'box_charger', bn: 'অরিজিনাল চার্জার ও কেবল সহ', en: 'Original Charger & Cable' },
    { id: 'ssd_upgraded', bn: 'এসএসডি / র‍্যাম আপগ্রেড করা', en: 'SSD / RAM Upgraded' },
    { id: 'warranty', bn: 'অফিসিয়াল শোরুম ওয়ারেন্টি আছে', en: 'Official Showroom Warranty' },
    { id: 'battery_backup', bn: 'ব্যাটারি ব্যাকআপ ৩-৫+ ঘণ্টা', en: 'Great Battery Backup (3-5+ hrs)' },
    { id: 'stress_tested', bn: 'ফুল স্ট্রেস টেস্টেড ও ফ্রেশ কন্ডিশন', en: '100% Stress Tested & Fresh' },
    { id: 'no_repair', bn: 'কখনও সার্ভিসিং বা রিপেয়ার করা হয়নি', en: 'Never Repaired / 100% Original' },
    { id: 'exchange', bn: 'ল্যাপটপ / ডেস্কটপ এক্সচেঞ্জ সম্ভব', en: 'Exchange Possible' },
    { id: 'home_delivery', bn: 'কুরিয়ার / হোম ডেলিভারি সুবিধা', en: 'Home Delivery Available' },
    { id: 'money_back', bn: '৭ দিনের চেকিং ও রিপ্লেসমেন্ট গ্যারান্টি', en: '7 Days Testing Guarantee' }
  ],
  vehicles: [
    { id: 'brta_paper', bn: 'বিআরটিএ কাগজ কমপ্লিট ও আপ-টু-ডেট', en: 'BRTA Papers Complete & Up-to-date' },
    { id: 'smart_card', bn: 'স্মার্ট কার্ড ও ডিজিটাল নম্বর প্লেট প্রস্তুত', en: 'Smart Card & Digital Plate Ready' },
    { id: 'no_accident', bn: 'কোনো এক্সিডেন্ট হিস্ট্রি নেই (১০০% ফ্রেশ)', en: 'No Accident History' },
    { id: 'first_owner', bn: 'ফার্স্ট মালিকের ব্যবহৃত গাড়ি/বাইক', en: 'First Owner Driven' },
    { id: 'name_transfer', bn: 'যেকোনো সময় নাম পরিবর্তন সম্ভব', en: 'Name Transfer Possible Anytime' },
    { id: 'servicing', bn: 'অফিসিয়াল সার্ভিসিং সম্পন্ন', en: 'Authorized Service Done' }
  ],
  property: [
    { id: 'rajuk_approved', bn: 'রাজউক/পৌরসভা অনুমোদিত প্ল্যান', en: 'Rajuk Approved Plan' },
    { id: 'south_facing', bn: 'দক্ষিণমুখী চমৎকার আলো-বাতাসপূর্ণ', en: 'South Facing with Great Ventilation' },
    { id: 'lift_generator', bn: 'অটো লিফট ও ২৪ ঘণ্টা জেনারেটর ব্যাকআপ', en: 'Auto Lift & 24/7 Generator' },
    { id: 'cctv_security', bn: '২৪ ঘণ্টা সিকিউরিটি গার্ড ও সিসিটিভি', en: '24/7 Security & CCTV' },
    { id: 'gas_line', bn: 'তিতাস গ্যাস/ডেসকো লাইন সংযুক্ত', en: 'Titas Gas / DESCO Connection' },
    { id: 'car_parking', bn: 'নিজস্ব কভার্ড কার পার্কিং স্পেস', en: 'Reserved Car Parking Space' }
  ],
  home_appliances: [
    { id: 'inverter_saving', bn: '৭০% বিদ্যুৎ সাশ্রয়ী ইনভার্টার টেকনোলজি', en: 'Inverter Energy Saving' },
    { id: 'compressor_warranty', bn: '১০ বছরের কম্প্রেসর / মোটর ওয়ারেন্টি', en: '10 Years Compressor Warranty' },
    { id: 'official_warranty', bn: 'অফিসিয়াল শোরুম ওয়ারেন্টি কার্ড সহ', en: 'Official Showroom Warranty' },
    { id: 'less_used', bn: 'খুবই কম ব্যবহৃত ও ১০০% রানিং কন্ডিশন', en: 'Lightly Used & 100% Working' }
  ],
  fashion: [
    { id: 'pure_fabric', bn: '১০০% সুতি / প্রিমিয়াম পিওর ফেব্রিক্স', en: '100% Pure Premium Fabric' },
    { id: 'brand_showroom', bn: 'অরিজিনাল শোরুম থেকে কেনা', en: 'Bought from Brand Showroom' },
    { id: 'size_exchange', bn: 'সাইজ মেলা না গেলে এক্সচেঞ্জ সম্ভব', en: 'Size Exchange Possible' },
    { id: 'home_delivery', bn: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি', en: 'Cash on Delivery Nationwide' }
  ],
  furniture: [
    { id: 'chittagong_teak', bn: '১০০% খাঁটি চিটাগাং সেগুন কাঠ', en: '100% Pure Chittagong Teak Wood' },
    { id: 'no_insects', bn: 'ঘুনে ধরা মুক্ত ও সিজনিং করা কাঠ', en: 'Termite Proof & Seasoned Wood' },
    { id: 'showroom_brand', bn: 'ব্র্যান্ডের অরিজিনাল ফার্নিচার', en: 'Brand Original Furniture' },
    { id: 'free_fitting', bn: 'বাসায় গিয়ে ফিটিং সার্ভিস প্রযোজ্য', en: 'Free Home Assembly Available' }
  ],
  baby_kids: [
    { id: 'bpa_free', bn: '১০০% নন-টক্সিক ও বিপিএ ফ্রি (BPA-Free & Non-Toxic)', en: '100% Non-Toxic & BPA-Free' },
    { id: 'soft_cotton', bn: '১০০% সফট অর্গানিক কটন ফেব্রিক্স', en: '100% Soft Organic Cotton' },
    { id: 'safety_harness', bn: '৫-পয়েন্ট সেফটি হার্নেস বেল্ট (Safety Belt)', en: '5-Point Safety Belt Harness' },
    { id: 'washable_cover', bn: 'সহজে ধোঁয়া যায় ওয়াশেবল কাভার', en: 'Easy Washable Cushion Cover' },
    { id: 'foldable_travel', bn: 'কম্প্যাক্ট ফোল্ডিং ও ট্রাভেল ফ্রেন্ডলি', en: 'Compact Folding Travel Friendly' },
    { id: 'authentic_brand', bn: 'অরিজিনাল ব্র্যান্ড ইনভয়েস সহ', en: 'Original Brand Invoice Included' },
    { id: 'home_delivery', bn: 'ক্যাশ অন ডেলিভারি / হোম ডেলিভারি', en: 'Cash on Delivery Available' }
  ],
  default: [
    { id: 'authentic', bn: '১০০% অরিজিনাল ও মানসম্মত সার্ভিস/প্রোডাক্ট', en: '100% Authentic Product/Service' },
    { id: 'urgent_sale', bn: 'জরুরি বিক্রি / বিশেষ মূল্য ছাড়', en: 'Urgent Discount Available' },
    { id: 'home_delivery', bn: 'ক্যাশ অন ডেলিভারি / হোম সার্ভিস আছে', en: 'Cash on Delivery / Home Service' },
    { id: 'money_back', bn: 'মানি ব্যাক গ্যারান্টি সুবিধা', en: 'Money Back Guarantee' }
  ]
};

export const CategoryForms: React.FC = () => {
  const { language, addNewAd, updateExistingAd, editingAd, setEditingAd, setActiveTab, setSelectedProduct, isLoggedIn, openAuthModal, goBack, currentUser, paymentAccounts } = useMarket();

  // Wizard Steps: 1 = Category, 2 = Form Details, 3 = Promotion Boost, 4 = Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<string>('mobiles');
  const [title, setTitle] = useState('');
  const [selectedTitlePreset, setSelectedTitlePreset] = useState<string>('');
  const [titleError, setTitleError] = useState<string>('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [condition, setCondition] = useState<Condition>('used_good');
  const [description, setDescription] = useState('');
  // Location selection state
  const [selectedDivId, setSelectedDivId] = useState<string>('dhaka');
  const [selectedDistId, setSelectedDistId] = useState<string>('dhaka_d');
  const [selectedThanaId, setSelectedThanaId] = useState<string>('dhanmondi');

  const currentDivObj = BANGLADESH_DIVISIONS.find(d => d.id === selectedDivId) || BANGLADESH_DIVISIONS[0];
  const availableDistricts = currentDivObj?.districts || [];
  const currentDistObj = availableDistricts.find(d => d.id === selectedDistId) || availableDistricts[0];
  const availableThanas = currentDistObj?.thanas || [];
  const currentThanaObj = availableThanas.find(t => t.id === selectedThanaId) || availableThanas[0];

  const division = currentDivObj ? (language === 'bn' ? currentDivObj.nameBn : currentDivObj.nameEn) : '';
  const district = currentDistObj ? (language === 'bn' ? currentDistObj.nameBn : currentDistObj.nameEn) : '';
  const thana = currentThanaObj ? (language === 'bn' ? currentThanaObj.nameBn : currentThanaObj.nameEn) : '';

  const handleDivChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDivId = e.target.value;
    setSelectedDivId(newDivId);
    const divObj = BANGLADESH_DIVISIONS.find(d => d.id === newDivId);
    if (divObj && divObj.districts.length > 0) {
      const firstDist = divObj.districts[0];
      setSelectedDistId(firstDist.id);
      if (firstDist.thanas.length > 0) {
        setSelectedThanaId(firstDist.thanas[0].id);
      } else {
        setSelectedThanaId('');
      }
    } else {
      setSelectedDistId('');
      setSelectedThanaId('');
    }
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistId = e.target.value;
    setSelectedDistId(newDistId);
    const distObj = availableDistricts.find(d => d.id === newDistId);
    if (distObj && Array.isArray(distObj.thanas) && distObj.thanas.length > 0) {
      setSelectedThanaId(distObj.thanas[0].id);
    } else {
      setSelectedThanaId('');
    }
  };

  const handleThanaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedThanaId(e.target.value);
  };

  const [phone, setPhone] = useState('01712-345678');
  const [hidePhone, setHidePhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (currentUser?.phone && !editingAd) {
      setPhone(currentUser.phone);
    }
  }, [currentUser, editingAd]);
  const [adType, setAdType] = useState<AdType>('regular');
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);
  const [vehicleSubCategory, setVehicleSubCategory] = useState<'cars' | 'motorbikes' | 'bicycles' | 'others'>('cars');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [warranty, setWarranty] = useState('');

  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  // Reset brand, model, title preset whenever category changes
  useEffect(() => {
    if (!editingAd) {
      setBrand('');
      setModel('');
      setIsCustomBrand(false);
      setIsCustomModel(false);
      setSelectedTitlePreset('');
      setTitle('');
      setTitleError('');
      setPriceError('');
      if (category === 'vehicles' || category === 'cars' || category === 'car' || category === 'motorcycles' || category === 'bike' || category === 'bikes') {
        setVehicleSubCategory('cars');
      }
    }
  }, [category, editingAd]);

  // Category Brands & Models list with fallback key mapping and vehicle subcategories
  let categoryKey =
    category === 'living' ? 'furniture' :
    category === 'pets' ? 'animal_pets' :
    category === 'food' ? 'food_grocery' :
    category === 'construction' ? 'repair_construction' :
    category;

  if (category === 'vehicles' || category === 'cars' || category === 'car' || category === 'motorcycles' || category === 'bike' || category === 'bikes') {
    if (vehicleSubCategory === 'motorbikes') {
      categoryKey = 'vehicles_motorbikes';
    } else if (vehicleSubCategory === 'bicycles') {
      categoryKey = 'vehicles_bicycles';
    } else if (vehicleSubCategory === 'others') {
      categoryKey = 'vehicles_others';
    } else {
      categoryKey = 'vehicles_cars';
    }
  }

  const categoryBrands = CATEGORY_BRANDS_MODELS[categoryKey] || CATEGORY_BRANDS_MODELS[category] || [];
  const selectedBrandObj = categoryBrands.find(b => b.brandEn === brand || b.brandBn === brand);
  const availableModels = selectedBrandObj?.models || [];

  // Helper for dynamic labels & placeholders per category
  const getCategoryFieldLabels = (cat: string) => {
    switch (cat) {
      case 'jobs':
        return {
          brandLabelBn: 'চাকরির বিভাগ (Job Category / Sector)',
          brandLabelEn: 'Job Sector / Category',
          brandPlaceholderBn: 'যেমন: মার্কেটিং, হিসাবরক্ষণ, সফটওয়্যার...',
          brandPlaceholderEn: 'e.g. Marketing, Accounts, IT...',
          modelLabelBn: 'পদের নাম / পজিশন (Job Position / Title)',
          modelLabelEn: 'Job Position / Title',
          modelPlaceholderBn: 'যেমন: এক্সিকিউটিভ, ম্যানেজার, টিম লিড...',
          modelPlaceholderEn: 'e.g. Executive, Manager, Team Lead...',
          titlePlaceholderBn: 'যেমন: সেলস ও মার্কেটিং এক্সিকিউটিভ - ফুল টাইম চাকরি',
          titlePlaceholderEn: 'e.g. Sales & Marketing Executive - Full Time Job'
        };
      case 'pets':
      case 'animal_pets':
        return {
          brandLabelBn: 'প্রাণীর ধরন / ক্যাটাগরি (Pet Category)',
          brandLabelEn: 'Pet Species / Category',
          brandPlaceholderBn: 'যেমন: বিড়াল, কুকুর, পাখি, অ্যাকোয়ারিয়াম...',
          brandPlaceholderEn: 'e.g. Cat, Dog, Bird, Aquarium...',
          modelLabelBn: 'জাত / ব্রিড (Breed / Variety)',
          modelLabelEn: 'Breed / Variety',
          modelPlaceholderBn: 'যেমন: পার্সিয়ান, জার্মান শেফার্ড, ককটেল...',
          modelPlaceholderEn: 'e.g. Persian Doll-Face, German Shepherd...',
          titlePlaceholderBn: 'যেমন: পার্সিয়ান ডল ফেস বিড়াল ছানা - ভ্যাক্সিনেটেড',
          titlePlaceholderEn: 'e.g. Persian Doll-Face Kitten - Vaccinated'
        };
      case 'services':
        return {
          brandLabelBn: 'সেবার বিভাগ (Service Category)',
          brandLabelEn: 'Service Category',
          brandPlaceholderBn: 'যেমন: এসি সার্ভিস, বাসা পরিবর্তন, ওয়েব...',
          brandPlaceholderEn: 'e.g. AC Service, Home Shifting...',
          modelLabelBn: 'নির্দিষ্ট সার্ভিস প্যাকেজ (Service Package)',
          modelLabelEn: 'Specific Service Package',
          modelPlaceholderBn: 'যেমন: ফুল ওয়াশ ও গ্যাস রিফিল...',
          modelPlaceholderEn: 'e.g. AC Wash & Gas Refill...',
          titlePlaceholderBn: 'যেমন: জরুরি বাসা পরিবর্তন ও পিকআপ ভাড়া সেবা',
          titlePlaceholderEn: 'e.g. House Shifting & Pickup Rental Service'
        };
      case 'education':
        return {
          brandLabelBn: 'শিক্ষা / কোর্সের ধরন (Education Type)',
          brandLabelEn: 'Education / Course Type',
          brandPlaceholderBn: 'যেমন: হোম টিউটর, আইইএলটিএস, কোচিং...',
          brandPlaceholderEn: 'e.g. Home Tutor, IELTS, Coaching...',
          modelLabelBn: 'বিষয় / ক্লাস / ব্যাচ (Subject / Grade)',
          modelLabelEn: 'Subject / Class',
          modelPlaceholderBn: 'যেমন: ৯off-১০ম শ্রেণির সাইন্স টিউটর...',
          modelPlaceholderEn: 'e.g. Class 9-10 Science Tutor...',
          titlePlaceholderBn: 'যেমন: ৯ম-১০ম শ্রেণির ফিজিক্স ও কেমিস্ট্রি প্রাইভেট টিউটর',
          titlePlaceholderEn: 'e.g. Class 9-10 Physics & Chemistry Private Tutor'
        };
      case 'food':
      case 'food_grocery':
        return {
          brandLabelBn: 'খাবারের ধরন (Food Category)',
          brandLabelEn: 'Food Category',
          brandPlaceholderBn: 'যেমন: অর্গানিক, ঘি, মধু, চাল, মিষ্টি...',
          brandPlaceholderEn: 'e.g. Organic, Ghee, Honey, Rice...',
          modelLabelBn: 'প্যাকেজ / আইটেম (Item / Package)',
          modelLabelEn: 'Item Name / Package',
          modelPlaceholderBn: 'যেমন: সুন্দরবনের খাঁটি মধু ১ কেজি...',
          modelPlaceholderEn: 'e.g. Sundarban Honey 1kg...',
          titlePlaceholderBn: 'যেমন: ১০০% খাঁটি সুন্দরবনের প্রাকৃতিক মধু (১ কেজি)',
          titlePlaceholderEn: 'e.g. 100% Pure Sundarban Natural Honey (1 kg)'
        };
      case 'repair_construction':
      case 'construction':
        return {
          brandLabelBn: 'কাজের বিভাগ (Work Category)',
          brandLabelEn: 'Work Category',
          brandPlaceholderBn: 'যেমন: ইলেকট্রিশিয়ান, টাইলস, রং...',
          brandPlaceholderEn: 'e.g. Electrician, Tiles, Painting...',
          modelLabelBn: 'নির্দিষ্ট কাজ (Specific Work / Material)',
          modelLabelEn: 'Specific Work / Material',
          modelPlaceholderBn: 'যেমন: হাউজ অয়ারিং ও ফিটিং...',
          modelPlaceholderEn: 'e.g. House Wiring & Fitting...',
          titlePlaceholderBn: 'যেমন: অভিজ্ঞ কারিগর দিয়ে টাইলস ও স্যানিটারি ফিটিং কাজ',
          titlePlaceholderEn: 'e.g. Professional Tiles & Sanitary Fitting Work'
        };
      case 'health_beauty':
      case 'beauty':
        return {
          brandLabelBn: 'ব্র্যান্ড / ব্র্যান্ড শপ (Brand)',
          brandLabelEn: 'Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: Nivea, L’Oreal, CeraVe, The Body Shop...',
          brandPlaceholderEn: 'e.g. Nivea, L’Oreal, CeraVe, The Body Shop...',
          modelLabelBn: 'পণ্যের প্রকার / সাইজ (Type / Net Weight)',
          modelLabelEn: 'Product Type / Net Vol',
          modelPlaceholderBn: 'যেমন: স্কিন সিরাম, ফেস ওয়াশ, ১০০ml...',
          modelPlaceholderEn: 'e.g. Skin Serum, Face Wash, 100ml...',
          titlePlaceholderBn: 'যেমন: লরিয়েল প্যারিস গ্লাইকোলিক ব্রাইট গ্লোয়িং সিরাম (৩০ মি.লি. অরিজিনাল)',
          titlePlaceholderEn: 'e.g. L\'Oreal Paris Glycolic Bright Glowing Serum (30ml Original)'
        };
      case 'fashion':
        return {
          brandLabelBn: 'ব্র্যান্ড / শোরুম (Brand)',
          brandLabelEn: 'Brand / Label',
          brandPlaceholderBn: 'যেমন: Aarong, Yellow, Cats Eye, Nike...',
          brandPlaceholderEn: 'e.g. Aarong, Yellow, Cats Eye, Nike...',
          modelLabelBn: 'সাইজ ও মেটেরিয়াল (Size & Fabric)',
          modelLabelEn: 'Size & Fabric',
          modelPlaceholderBn: 'যেমন: কটন পান্জাবি L সাইজ, সিল্ক শাড়ি...',
          modelPlaceholderEn: 'e.g. Cotton Panjabi Size L, Silk Sharee...',
          titlePlaceholderBn: 'যেমন: এক্সক্লুসিভ আড়ং পুরুষদের খাঁটি সিল্ক এমব্রয়ডারি করা পাঞ্জাবি',
          titlePlaceholderEn: 'e.g. Exclusive Aarong Mens Pure Silk Embroidered Panjabi Set'
        };
      case 'baby_kids':
      case 'baby':
        return {
          brandLabelBn: 'ব্র্যান্ড / ম্যানুফ্যাকচারার (Baby Brand)',
          brandLabelEn: 'Baby Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: Chicco, Fisher-Price, Johnson & Johnson, Mee Mee, Pampers...',
          brandPlaceholderEn: 'e.g. Chicco, Fisher-Price, Johnson & Johnson, Mee Mee, Pampers...',
          modelLabelBn: 'পণ্যের ধরণ / মডেল (Product Item & Model)',
          modelLabelEn: 'Product Item & Model',
          modelPlaceholderBn: 'যেমন: Stroller, Rocker Bouncer, Baby Walker, High Chair...',
          modelPlaceholderEn: 'e.g. Stroller, Rocker Bouncer, Baby Walker, High Chair...',
          titlePlaceholderBn: 'যেমন: শিকো (Chicco) অরিজিনাল অ্যাডজাস্টেবল বেবি স্টোলার ও প্রাম',
          titlePlaceholderEn: 'e.g. Chicco Original Adjustable Baby Stroller & Travel Pram'
        };
      case 'sports':
        return {
          brandLabelBn: 'ব্র্যান্ড (Brand)',
          brandLabelEn: 'Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: Yonex, Cosco, Decathlon, Nike...',
          brandPlaceholderEn: 'e.g. Yonex, Cosco, Decathlon, Nike...',
          modelLabelBn: 'মডেল / টাইপ (Model / Type)',
          modelLabelEn: 'Model / Type',
          modelPlaceholderBn: 'যেমন: অরিজিনাল গ্রাফাইট র‍্যাকেট...',
          modelPlaceholderEn: 'e.g. Original Graphite Racket...',
          titlePlaceholderBn: 'যেমন: অরিজিনাল ইউনেক্স ব্যাডমিন্টন র‍্যাকেট ফুল কার্বন ফাইবার',
          titlePlaceholderEn: 'e.g. Original Yonex Badminton Racket Full Carbon Fiber'
        };
      case 'books':
        return {
          brandLabelBn: 'লেখক / প্রকাশনী (Author / Publisher)',
          brandLabelEn: 'Author / Publisher',
          brandPlaceholderBn: 'যেমন: আরিফ আজাদ, হুমায়ূন আহমেদ, প্রথমা...',
          brandPlaceholderEn: 'e.g. Arif Azad, Humayun Ahmed, Prothoma...',
          modelLabelBn: 'সংস্করণ / ধরণ (Edition / Genre)',
          modelLabelEn: 'Edition / Genre',
          modelPlaceholderBn: 'যেমন: হার্ডকভার, বেস্টসেলার, উপন্যাস...',
          modelPlaceholderEn: 'e.g. Hardcover, Bestseller, Novel...',
          titlePlaceholderBn: 'যেমন: প্যারাডক্সিক্যাল সাজিদ ১ ও ২ (সেট) - আরিফ আজাদের বেস্টসেলার',
          titlePlaceholderEn: 'e.g. Paradoxical Sajid 1 & 2 Book Set - Hardcover Edition'
        };
      case 'property':
        return {
          brandLabelBn: 'প্রোপার্টি টাইপ (Property Type)',
          brandLabelEn: 'Property Type',
          brandPlaceholderBn: 'যেমন: ৩ বেডরুম ফ্ল্যাট, বাণিজ্যিক প্লট...',
          brandPlaceholderEn: 'e.g. 3 BHK Apartment, Commercial Plot...',
          modelLabelBn: 'আয়তন / সাইজ (Size / Area)',
          modelLabelEn: 'Size / Square Feet',
          modelPlaceholderBn: 'যেমন: ১৮৫০ স্কয়ারফিট, ৫ কাঠা...',
          modelPlaceholderEn: 'e.g. 1850 Sqft, 5 Katha...',
          titlePlaceholderBn: 'যেমন: উত্তরা ১১ নম্বর সেক্টরে ১৮৫০ স্কয়ারফিটের দক্ষিণমুখী বিলাসবহুল ফ্ল্যাট',
          titlePlaceholderEn: 'e.g. Luxury 3 BHK South Facing Apartment in Uttara Sector 11'
        };
      case 'vehicles':
      case 'cars':
      case 'car':
      case 'motorcycles':
      case 'bike':
      case 'bikes':
        if (vehicleSubCategory === 'motorbikes') {
          return {
            brandLabelBn: 'মোটরসাইকেলের ব্র্যান্ড (Motorbike Brand)',
            brandLabelEn: 'Motorbike Brand',
            brandPlaceholderBn: 'যেমন: Yamaha, Honda, Suzuki, Bajaj, TVS, Hero...',
            brandPlaceholderEn: 'e.g. Yamaha, Honda, Suzuki, Bajaj, TVS, Hero...',
            modelLabelBn: 'বাইকের মডেল ও ভ্যারিয়েন্ট (Bike Model & Variant)',
            modelLabelEn: 'Bike Model & Variant',
            modelPlaceholderBn: 'যেমন: R15 V4, FZ-S V3, Pulsar N160, Apache 4V...',
            modelPlaceholderEn: 'e.g. R15 V4, FZ-S V3, Pulsar N160, Apache 4V...',
            titlePlaceholderBn: 'যেমন: ইয়ামাহা আর১৫ ভি৪ রেসিং ব্লু - ডুয়াল চ্যানেল এবিএস (২০২৩)',
            titlePlaceholderEn: 'e.g. Yamaha R15 V4 Racing Blue - Dual Channel ABS (2023 Model)'
          };
        } else if (vehicleSubCategory === 'bicycles') {
          return {
            brandLabelBn: 'বাইসাইকেলের ব্র্যান্ড (Bicycle Brand)',
            brandLabelEn: 'Bicycle Brand',
            brandPlaceholderBn: 'যেমন: Veloce, Duranta, Phoenix, Core, Trek, Giant...',
            brandPlaceholderEn: 'e.g. Veloce, Duranta, Phoenix, Core, Trek...',
            modelLabelBn: 'সাইকেলের মডেল ও গিয়ার (Cycle Model & Gear)',
            modelLabelEn: 'Cycle Model & Gear',
            modelPlaceholderBn: 'যেমন: Legion 10, Outrage 601, Gladiator 21-Speed...',
            modelPlaceholderEn: 'e.g. Legion 10, Outrage 601, Gladiator...',
            titlePlaceholderBn: 'যেমন: ভেলোচে লিজিয়ন ১০ অ্যালয় ২১-স্পিড হাইড্রোলিক মাউন্টেন সাইকেল',
            titlePlaceholderEn: 'e.g. Veloce Legion 10 Alloy 21-Speed Hydraulic Mountain Bike'
          };
        } else if (vehicleSubCategory === 'others') {
          return {
            brandLabelBn: 'বাণিজ্যিক ক্যাটাগরি / ব্র্যান্ড (Vehicle Brand / Type)',
            brandLabelEn: 'Vehicle Brand / Type',
            brandPlaceholderBn: 'যেমন: Mahindra, Tata, Ashok Leyland, Bajaj CNG, Mishuk...',
            brandPlaceholderEn: 'e.g. Mahindra, Tata, Ashok Leyland, Bajaj CNG...',
            modelLabelBn: 'মডেল ও ক্যাপাসিটি (Model & Capacity)',
            modelLabelEn: 'Model & Capacity',
            modelPlaceholderBn: 'যেমন: Bolero Maxi Truck, Ace Mega 1-Ton, CNG Auto...',
            modelPlaceholderEn: 'e.g. Bolero Maxi Truck, Ace Mega 1-Ton, CNG Auto...',
            titlePlaceholderBn: 'যেমন: মাহিন্দ্রা বোলেরো ম্যাক্সি ট্রাক প্লাস ১.২ টন পিকআপ (রানিং কন্ডিশন)',
            titlePlaceholderEn: 'e.g. Mahindra Bolero Maxi Truck Plus 1.2-Ton Pickup'
          };
        }
        return {
          brandLabelBn: 'গাড়ির ব্র্যান্ড (Car Brand)',
          brandLabelEn: 'Car Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: Toyota, Honda, Nissan, Hyundai, Mitsubishi...',
          brandPlaceholderEn: 'e.g. Toyota, Honda, Nissan, Hyundai, Mitsubishi...',
          modelLabelBn: 'গাড়ির মডেল ও গ্রেড (Car Model & Grade)',
          modelLabelEn: 'Car Model & Grade',
          modelPlaceholderBn: 'যেমন: Premio F Superior, Axio Hybrid, Vezel...',
          modelPlaceholderEn: 'e.g. Premio F Superior, Axio Hybrid, Vezel...',
          titlePlaceholderBn: 'যেমন: টয়োটা এক্সিও হাইব্রিড ডব্লিউএক্সবি প্যাকেজ (২০২০ ফ্রেশ কন্ডিশন)',
          titlePlaceholderEn: 'e.g. Toyota Axio Hybrid WxB Package (2020 Fresh Condition)'
        };
      case 'mobiles':
        return {
          brandLabelBn: 'ব্র্যান্ড (Brand)',
          brandLabelEn: 'Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: Samsung, Apple, Vivo, Xiaomi...',
          brandPlaceholderEn: 'e.g. Samsung, Apple, Vivo, Xiaomi...',
          modelLabelBn: 'মডেল ও ভ্যারিয়েন্ট (Model & Variant)',
          modelLabelEn: 'Model & Variant',
          modelPlaceholderBn: 'যেমন: S24 Ultra, iPhone 15 Pro Max...',
          modelPlaceholderEn: 'e.g. S24 Ultra, iPhone 15 Pro Max...',
          titlePlaceholderBn: 'যেমন: স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা ৫জি - ১২জিবি/৫১২জিবি (অফিসিয়াল)',
          titlePlaceholderEn: 'e.g. Samsung Galaxy S24 Ultra 5G - 12GB/512GB (Official Warranty)'
        };
      case 'electronics':
      case 'home_appliances':
        return {
          brandLabelBn: 'ব্র্যান্ড (Brand)',
          brandLabelEn: 'Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: Apple, Walton, LG, Singer, Sony...',
          brandPlaceholderEn: 'e.g. Apple, Walton, LG, Singer, Sony...',
          modelLabelBn: 'মডেল ও ক্যাটাগরি (Model & Type)',
          modelLabelEn: 'Model & Type',
          modelPlaceholderBn: 'যেমন: MacBook Air M2, 252L Inverter Fridge...',
          modelPlaceholderEn: 'e.g. MacBook Air M2, 252L Inverter Fridge...',
          titlePlaceholderBn: 'যেমন: ওয়ালটন ২৫২ লিটার নন-ফ্রস্ট ইনভার্টার রেফ্রিজারেটর',
          titlePlaceholderEn: 'e.g. Walton 252 Liter Direct Cool Non-Frost Refrigerator'
        };
      default:
        return {
          brandLabelBn: 'ব্র্যান্ড / প্রস্তুতকারক (Brand)',
          brandLabelEn: 'Brand / Manufacturer',
          brandPlaceholderBn: 'যেমন: ব্র্যান্ড নাম লিখুন...',
          brandPlaceholderEn: 'e.g. Enter brand name...',
          modelLabelBn: 'মডেল / টাইপ (Model / Type)',
          modelLabelEn: 'Model / Type',
          modelPlaceholderBn: 'যেমন: পণ্যের মডেল লিখুন...',
          modelPlaceholderEn: 'e.g. Enter product model...',
          titlePlaceholderBn: 'যেমন: আকর্ষণীয় মূল্যে ভালো মানের সেরা পণ্য বিক্রয়',
          titlePlaceholderEn: 'e.g. High Quality Product for Sale at Best Price'
        };
    }
  };

  const fieldLabels = getCategoryFieldLabels(category);

  // Scroll window to top whenever step changes (e.g. going to Step 2, Step 3, Step 4, or Back)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  // Load editing product data if editingAd is present
  useEffect(() => {
    if (editingAd) {
      setStep(2);
      setTitle(editingAd.title || '');
      setPrice(editingAd.price ? String(editingAd.price) : '');
      setCategory(editingAd.category || 'mobiles');
      setDescription(editingAd.description || '');
      setCondition(editingAd.condition || 'used_good');
      setIsNegotiable(editingAd.isNegotiable ?? true);
      if (editingAd.images && editingAd.images.length > 0) {
        setImages(editingAd.images);
      }
      if (editingAd.brand) setBrand(editingAd.brand);
      if (editingAd.model) setModel(editingAd.model);
      if (editingAd.warranty) setWarranty(editingAd.warranty);
      if (editingAd.features) setSelectedFeatures(editingAd.features);
      if (editingAd.seller?.phone) setPhone(editingAd.seller.phone);
      if (editingAd.seller?.hidePhone !== undefined) setHidePhone(editingAd.seller.hidePhone);
    }
  }, [editingAd]);

  // Category specific specs
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [processor, setProcessor] = useState('');
  const [camera, setCamera] = useState('');
  const [battery, setBattery] = useState('');
  const [displayType, setDisplayType] = useState('');
  const [mileage, setMileage] = useState('');
  const [engineCc, setEngineCc] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [sqft, setSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [facing, setFacing] = useState('');
  const [color, setColor] = useState('');
  const [author, setAuthor] = useState('');

  // Additional category specific state fields
  const [clothingSize, setClothingSize] = useState('');
  const [fabricMaterial, setFabricMaterial] = useState('');
  const [furnitureMaterial, setFurnitureMaterial] = useState('');
  const [applianceCapacity, setApplianceCapacity] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [educationClass, setEducationClass] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  // Baby & Kids specific fields
  const [babyAgeGroup, setBabyAgeGroup] = useState('');
  const [babyGender, setBabyGender] = useState('');
  const [babyItemType, setBabyItemType] = useState('');
  const [babySafetyMaterial, setBabySafetyMaterial] = useState('');

  // Reset brand/model and ALL specs when category changes
  useEffect(() => {
    if (!editingAd) {
      setBrand('');
      setModel('');
      setIsCustomBrand(false);
      setIsCustomModel(false);

      // Clean reset specs to avoid cross-category leaks
      setRam('');
      setStorage('');
      setProcessor('');
      setCamera('');
      setBattery('');
      setDisplayType('');
      setMileage('');
      setEngineCc('');
      setFuelType('');
      setSqft('');
      setBedrooms('');
      setBathrooms('');
      setFacing('');
      setColor('');
      setAuthor('');
      setClothingSize('');
      setFabricMaterial('');
      setFurnitureMaterial('');
      setApplianceCapacity('');
      setJobType('');
      setJobSalary('');
      setEducationClass('');
      setServiceArea('');
      setBabyAgeGroup('');
      setBabyGender('');
      setBabyItemType('');
      setBabySafetyMaterial('');

      // Auto-load default features for new category
      const currentFeats = CATEGORY_FEATURES_MAP[category] || CATEGORY_FEATURES_MAP['default'];
      setSelectedFeatures(currentFeats.slice(0, 3).map(f => language === 'bn' ? f.bn : f.en));
    }
  }, [category, editingAd]);

  // Selected Item Features
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'অরিজিনাল ইনভয়েস/ক্যাশ মেমো আছে',
    'বক্স ও অরিজিনাল চার্জার সহ',
    'অফিসিয়াল ব্রাঞ্চ ওয়ারেন্টি রয়েছে'
  ]);

  // Real Photo Upload state (min 1, max 10)
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // bKash / Nagad / Rocket Paid Ad Payment state
  const [payMethod, setPayMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [featuredPlan, setFeaturedPlan] = useState<'7' | '30'>('7');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const getPaymentNumber = (method: 'bkash' | 'nagad' | 'rocket') => {
    if (method === 'bkash') return paymentAccounts?.bkashNumber || '01723230230';
    if (method === 'nagad') return paymentAccounts?.nagadNumber || '01723230230';
    return paymentAccounts?.rocketNumber || '01533830784';
  };

  const currentPaymentNumber = getPaymentNumber(payMethod);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentPaymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const readAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Direct FileReader approach - 100% compatible with Android WebViews, Cordova, Flutter & mobile browsers
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = (e.target?.result as string) || '';
        if (!rawDataUrl) {
          resolve('');
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1000;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
              resolve(compressedUrl || rawDataUrl);
            } else {
              resolve(rawDataUrl);
            }
          } catch {
            resolve(rawDataUrl);
          }
        };

        img.onerror = () => {
          // Fallback to rawDataUrl directly if image element fail to render
          resolve(rawDataUrl);
        };

        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        resolve('');
      };

      reader.readAsDataURL(file);
    });
  };

  const processImageFiles = async (filesArray: File[]) => {
    setImageError('');
    if (images.length + filesArray.length > 5) {
      setImageError(language === 'bn' ? '⚠️ সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।' : '⚠️ Maximum 5 photos allowed.');
    }

    const allowedCount = Math.min(filesArray.length, 5 - images.length);
    if (allowedCount <= 0) return;

    try {
      const loadedUrls = await Promise.all(
        filesArray.slice(0, allowedCount).map(file => readAndCompressImage(file))
      );
      const validUrls = loadedUrls.filter(url => url.length > 0);
      if (validUrls.length === 0) {
        setImageError(language === 'bn' ? 'ছবি পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Could not read image files. Please try again.');
        return;
      }
      setImages(prev => [...prev, ...validUrls]);
    } catch {
      setImageError(
        language === 'bn'
          ? 'ছবি প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to process photos. Please try again.'
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files) as File[];
    processImageFiles(filesArray);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const rawFiles = Array.from(files) as File[];
    const filesArray = rawFiles.filter(f => f.type.startsWith('image/'));
    if (filesArray.length === 0) {
      setImageError(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল (JPEG, PNG, WebP) আপলোড করুন।' : 'Please drop valid image files only.');
      return;
    }
    processImageFiles(filesArray);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetAsThumbnail = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
  };

  const handleGoToStep3 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validate Product Title (Mandatory: from dropdown or typed when Others/custom)
    if (!title || !title.trim()) {
      setTitleError(
        language === 'bn'
          ? '⚠️ দ্রব্যের নাম নির্বাচন করা বা অন্যান্য অপশনে পণ্যের নাম টাইপ করা বাধ্যতামূলক!'
          : '⚠️ Selecting an item name or typing in Others is strictly mandatory!'
      );
      window.scrollTo({ top: 250, behavior: 'smooth' });
      return;
    }
    setTitleError('');

    // 2. Validate Price (Mandatory)
    const numericPrice = parseFloat(price);
    if (!price || !price.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError(
        language === 'bn'
          ? '⚠️ দ্রব্যের মূল্য (Price) পূরণ করা বাধ্যতামূলক! সঠিক টাকার পরিমাণ লিখুন।'
          : '⚠️ Item price is strictly mandatory! Please enter a valid price.'
      );
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }
    setPriceError('');

    // 3. Validate mobile number field (required)
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setPhoneError(
        language === 'bn'
          ? '⚠️ বিজাপন পোস্ট করার জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দেওয়া বাধ্যতামূলক!'
          : '⚠️ A valid 11-digit mobile number is required to post an ad!'
      );
      return;
    }
    setPhoneError('');

    // 4. Validate Images (at least 1, first photo is thumbnail)
    if (images.length < 1) {
      setImageError(
        language === 'bn'
          ? '⚠️ বিজ্ঞাপনে প্রোডাক্টের অন্তত ১টি ছবি আপলোড করা আবশ্যক (প্রথম ছবিটি থাম্বনেইল হবে)!'
          : '⚠️ Please upload at least 1 photo for your ad (1st photo is main thumbnail)!'
      );
      return;
    }
    setImageError('');
    setStep(3);
  };

  const handleSubmitAd = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate paid ad details if adType is urgent or featured
    if (adType !== 'regular') {
      if (!senderNumber.trim() || senderNumber.trim().length < 11) {
        setPaymentError(
          language === 'bn'
            ? 'পেইড বিজ্ঞাপনের জন্য সঠিক বিকাশ/নগদ সেন্ডার নম্বর লিখুন (১১ ডিজিট)'
            : 'Please enter valid 11-digit bKash/Nagad sender phone number'
        );
        return;
      }
      if (!trxId.trim() || trxId.trim().length < 4) {
        setPaymentError(
          language === 'bn'
            ? 'পেমেন্টের সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন'
            : 'Please enter valid Transaction ID (TrxID)'
        );
        return;
      }
    }

    setPaymentError('');

    const specs: Record<string, string> = {};

    // Only collect specs that match the active category
    if (category === 'mobiles' || category === 'electronics') {
      if (brand) specs[language === 'bn' ? 'ব্র্যান্ড' : 'Brand'] = brand;
      if (model) specs[language === 'bn' ? 'মডেল' : 'Model'] = model;
      if (ram) specs['RAM'] = ram;
      if (storage) specs[language === 'bn' ? 'স্টোরেজ' : 'Storage'] = storage;
      if (processor) specs[language === 'bn' ? 'প্রসেসর / চিপসেট' : 'Processor'] = processor;
      if (category === 'mobiles') {
        if (camera) specs[language === 'bn' ? 'ক্যামেরা' : 'Camera'] = camera;
        if (battery) specs[language === 'bn' ? 'ব্যাটারি' : 'Battery'] = battery;
        if (displayType) specs[language === 'bn' ? 'ডিসপ্লে' : 'Display'] = displayType;
      }
    } else if (category === 'vehicles' || category === 'cars' || category === 'car' || category === 'motorcycles' || category === 'bike' || category === 'bikes') {
      const subCategoryLabel =
        vehicleSubCategory === 'motorbikes' ? (language === 'bn' ? 'মোটরসাইকেল ও স্কুটার' : 'Motorbike & Scooter') :
        vehicleSubCategory === 'bicycles' ? (language === 'bn' ? 'বাইসাইকেল' : 'Bicycle') :
        vehicleSubCategory === 'others' ? (language === 'bn' ? 'বাণিজ্যিক ও অন্যান্য যানবাহন' : 'Commercial & Others') :
        (language === 'bn' ? 'কার ও এসইউভি' : 'Car & SUV');
      specs[language === 'bn' ? 'যানবাহনের ধরন' : 'Vehicle Type'] = subCategoryLabel;
      if (brand) specs[language === 'bn' ? 'ব্র্যান্ড' : 'Brand'] = brand;
      if (model) specs[language === 'bn' ? 'মডেল' : 'Model'] = model;
      if (mileage) specs[language === 'bn' ? 'কিলোমিটার (মাইলেজ)' : 'Mileage / Odometer'] = mileage;
      if (engineCc) specs[language === 'bn' ? 'ইঞ্জিন ক্ষমতা (CC)' : 'Engine Capacity'] = engineCc;
      if (fuelType) specs[language === 'bn' ? 'ফুয়েল টাইপ' : 'Fuel Type'] = fuelType;
    } else if (category === 'property') {
      if (sqft) specs[language === 'bn' ? 'সাইজ' : 'Size'] = sqft;
      if (bedrooms) specs[language === 'bn' ? 'বেডরুম' : 'Bedrooms'] = bedrooms;
      if (bathrooms) specs[language === 'bn' ? 'বাথরুম' : 'Bathrooms'] = bathrooms;
      if (facing) specs[language === 'bn' ? 'ফেস বা মুখ' : 'Facing'] = facing;
    } else if (category === 'fashion') {
      if (brand) specs[language === 'bn' ? 'ব্র্যান্ড' : 'Brand'] = brand;
      if (clothingSize) specs[language === 'bn' ? 'সাইজ' : 'Size'] = clothingSize;
      if (fabricMaterial) specs[language === 'bn' ? 'ফেব্রিক্স / উপাদান' : 'Material'] = fabricMaterial;
      if (color) specs[language === 'bn' ? 'কালার / রঙ' : 'Color'] = color;
    } else if (category === 'furniture') {
      if (brand) specs[language === 'bn' ? 'ব্র্যান্ড' : 'Brand'] = brand;
      if (furnitureMaterial) specs[language === 'bn' ? 'উপাদান (Material)' : 'Material'] = furnitureMaterial;
      if (color) specs[language === 'bn' ? 'কালার / রঙ' : 'Color'] = color;
    } else if (category === 'home_appliances') {
      if (brand) specs[language === 'bn' ? 'ব্র্যান্ড' : 'Brand'] = brand;
      if (applianceCapacity) specs[language === 'bn' ? 'ক্যাপাসিটি / পাওয়ার' : 'Capacity'] = applianceCapacity;
    } else if (category === 'books') {
      if (author) specs[language === 'bn' ? 'লেখক / প্রকাশনী' : 'Author / Publisher'] = author;
    } else if (category === 'jobs') {
      if (jobType) specs[language === 'bn' ? 'চাকরির ধরণ' : 'Job Type'] = jobType;
      if (jobSalary) specs[language === 'bn' ? 'বেতন' : 'Salary'] = jobSalary;
    } else if (category === 'education') {
      if (educationClass) specs[language === 'bn' ? 'শ্রেণী / লেভেল' : 'Class / Level'] = educationClass;
    } else if (category === 'services' || category === 'repair_construction') {
      if (serviceArea) specs[language === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Area'] = serviceArea;
    } else if (category === 'baby_kids' || category === 'baby') {
      if (babyAgeGroup) specs[language === 'bn' ? 'বয়স সীমানা' : 'Age Group'] = babyAgeGroup;
      if (babyGender) specs[language === 'bn' ? 'লিঙ্গ' : 'Gender Target'] = babyGender;
      if (babyItemType) specs[language === 'bn' ? 'আইটেম ক্যাটাগরি' : 'Item Type'] = babyItemType;
      if (babySafetyMaterial) specs[language === 'bn' ? 'উপাদান ও সেফটি' : 'Safety Material'] = babySafetyMaterial;
      if (color) specs[language === 'bn' ? 'কালার / রঙ' : 'Color'] = color;
    } else {
      if (brand) specs[language === 'bn' ? 'ব্র্যান্ড' : 'Brand'] = brand;
      if (color) specs[language === 'bn' ? 'কালার / রঙ' : 'Color'] = color;
    }

    const amount = adType === 'urgent' ? 49 : adType === 'featured' ? (featuredPlan === '7' ? 99 : 199) : 0;

    const adPayload = {
      title: title || (language === 'bn' ? 'আকর্ষণীয় প্রোডাক্ট সেল' : 'Featured Market Deal'),
      titleBn: title,
      category,
      price: Number(price) || 5000,
      isNegotiable,
      condition,
      images,
      description: description || (language === 'bn' ? 'উৎকৃষ্ট মানের ব্যবহৃত প্রোডাক্ট।' : 'High quality item.'),
      descriptionBn: description,
      location: { division, district, thana },
      adType,
      isDeliveryAvailable,
      warranty,
      features: selectedFeatures,
      paymentInfo: adType !== 'regular' ? {
        method: payMethod,
        senderNumber,
        trxId,
        amount
      } : undefined,
      specifications: specs,
      seller: {
        id: currentUser?.id || 'user-me',
        name: currentUser?.name || 'My Store BD',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        phone: phone.trim(),
        hidePhone: hidePhone,
        email: currentUser?.email || 'official.marketbd@gmail.com',
        memberSince: currentUser?.memberSince || '2026',
        location: { division, district, thana },
        isVerified: currentUser?.isVerified ?? true,
        rating: 5.0,
        totalReviews: 1,
        badge: 'Verified Merchant'
      }
    };

    if (editingAd) {
      updateExistingAd(editingAd.id, adPayload);
    } else {
      const newAd = addNewAd(adPayload);
      setSelectedProduct(newAd);
    }

    setStep(4);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mx-auto border border-pink-100 dark:border-pink-800 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'বিজ্ঞাপন পোস্ট করতে প্রথমে লগইন করুন' : 'Log in first to post an ad'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              {language === 'bn'
                ? 'MarketBD.Net-তে বিনামূল্যে বিজ্ঞাপন দিতে ও কাস্টমার মেসেজ ম্যানেজ করতে আপনার একাউন্টে সাইন ইন বা রেজিস্ট্রেশন সম্পন্ন করুন।'
                : 'To post ads and receive direct buyer calls/messages on MarketBD.Net, please log in or create an account.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('post-ad')}
              className="w-full sm:w-auto px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগইন / সাইনআপ করুন' : 'Log In / Register'}</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm"
            >
              {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goBack}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-xs"
            title={language === 'bn' ? 'পেছনে যান' : 'Go back'}
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'bn' ? 'পেছনে যান' : 'Back'}</span>
          </button>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {language === 'bn' ? `ধাপ ${step} / ৪` : `Step ${step} of 4`}
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 text-center mb-2">
          {language === 'bn' ? (
            'বিনামূল্যে বিজ্ঞাপন পোস্ট করুন'
          ) : (
            <span>
              Post Free Ad on <span className="text-red-600 font-extrabold">M</span><span className="text-slate-900 dark:text-white font-extrabold">arketBD.</span><span className="text-red-600 font-extrabold">Net</span>
            </span>
          )}
        </h1>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
          {language === 'bn' ? 'কয়েকটি ধাপে আপনার ব্যবহৃত বা নতুন পণ্য সারা বাংলাদেশে বিক্রি করুন' : 'Sell your items fast across all 64 districts in Bangladesh'}
        </p>

        <div className="flex items-center justify-center gap-2 max-w-md mx-auto text-xs font-bold">
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <span>1</span> {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
          </div>
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-700" />
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <span>2</span> {language === 'bn' ? 'তথ্য' : 'Details'}
          </div>
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-700" />
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${step >= 3 ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <span>3</span> {language === 'bn' ? 'প্রমোশন' : 'Boost'}
          </div>
        </div>
      </div>

      {/* DRAFT RESTORE BANNER */}
      {(() => {
        const rawDraft = safeStorage.getItem('marketbd_ad_draft');
        if (!rawDraft) return null;
        try {
          const draft = safeParseJSON<any>(rawDraft, null);
          if (!draft) return null;
          return (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                    {language === 'bn' ? 'অসমাপ্ত খসড়া বিজ্ঞাপন পাওয়া গেছে (Saved Draft Found)' : 'Unfinished Ad Draft Found'}
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    {draft.title || (language === 'bn' ? 'শিরোনামহীন খসড়া' : 'Untitled Draft')} • {draft.savedAt || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (draft.title) setTitle(draft.title);
                    if (draft.price) setPrice(draft.price);
                    if (draft.category) setCategory(draft.category);
                    if (draft.description) setDescription(draft.description);
                    if (draft.condition) setCondition(draft.condition);
                    if (draft.images && draft.images.length) setImages(draft.images);
                    if (draft.brand) setBrand(draft.brand);
                    if (draft.model) setModel(draft.model);
                    if (draft.phone) setPhone(draft.phone);
                    setStep(2);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs shadow-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'খসড়া উদ্ধার করুন' : 'Restore Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    safeStorage.removeItem('marketbd_ad_draft');
                    window.location.reload();
                  }}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'মুছে ফেলুন' : 'Discard'}
                </button>
              </div>
            </div>
          );
        } catch (e) {
          return null;
        }
      })()}

      {/* STEP 1: Select Category */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            {language === 'bn' ? '১. সঠিক ক্যাটাগরি বেছে নিন' : '1. Select Category'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setStep(2);
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between hover:border-pink-400 hover:shadow-2xs ${
                  category === cat.id ? 'border-pink-600 bg-pink-50/50 dark:bg-pink-950/40 text-pink-950 dark:text-pink-200 font-semibold' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div>
                  <span className="text-xs bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold px-2 py-0.5 rounded border border-pink-100 dark:border-pink-900/40">
                    {cat.count.toLocaleString()} ads
                  </span>
                  <h3 className="font-bold text-sm mt-2 text-slate-900 dark:text-slate-100">
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Fill Details Form */}
      {step === 2 && (() => {
        const currentCatObj = CATEGORIES.find(c => c.id === category);
        const categoryName = currentCatObj
          ? (language === 'bn' ? currentCatObj.nameBn : currentCatObj.nameEn)
          : category;

        return (
          <form onSubmit={e => { e.preventDefault(); handleGoToStep3(); }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Orange Category Badge requested by user */}
                <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-lg text-xs shadow-xs flex items-center gap-1.5 animate-in fade-in">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{categoryName}</span>
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? 'প্রোডাক্ট ডিটেইলস পূরণ করুন (Fill Product Details)' : 'Fill Product Details'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ক্যাটাগরি পরিবর্তন (Back)' : 'Change Category'}</span>
              </button>
            </div>

          {/* Product Name / Title with Mandatory Dropdown or Custom Typing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-pink-600" />
                <span>{language === 'bn' ? 'দ্রব্যের নাম / বিজ্ঞাপনের শিরোনাম (Product Name & Title)' : 'Product Name & Ad Title'}</span>
                <span className="text-red-500 font-bold">* ({language === 'bn' ? 'বাধ্যতামূলক' : 'Mandatory'})</span>
              </label>
              <span className="text-[11px] bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">
                {language === 'bn' ? 'ড্রপডাউন অথবা অন্যান্য অপশনে টাইপ করুন' : 'Select Dropdown or Type Others'}
              </span>
            </div>

            {/* Dropdown Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? '১. ড্রপডাউন থেকে পণ্যের নাম বেছে নিন:' : '1. Select Product Name from Dropdown:'}
              </label>
              <select
                value={selectedTitlePreset}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedTitlePreset(val);
                  if (val === 'OTHER') {
                    setTitle('');
                  } else if (val) {
                    setTitle(val);
                  }
                  setTitleError('');
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-500 cursor-pointer shadow-2xs"
              >
                <option value="">
                  {language === 'bn' ? '-- জনপ্রিয় পণ্যের নাম থেকে বেছে নিন --' : '-- Choose from Popular Item Names --'}
                </option>
                {(POPULAR_ITEM_NAMES_BY_CATEGORY[categoryKey] || POPULAR_ITEM_NAMES_BY_CATEGORY[category] || POPULAR_ITEM_NAMES_BY_CATEGORY['default'] || []).map((item, idx) => (
                  <option key={idx} value={language === 'bn' ? item.bn : item.en}>
                    {language === 'bn' ? item.bn : item.en}
                  </option>
                ))}
                <option value="OTHER" className="font-bold text-pink-600">
                  {language === 'bn' ? '➕ অন্যান্য / নতুন পণ্যের নাম টাইপ করুন (Others)' : '➕ Others / Type Custom Product Name'}
                </option>
              </select>
            </div>

            {/* Text Input (Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {selectedTitlePreset === 'OTHER'
                    ? (language === 'bn' ? '২. আপনার পণ্যের সঠিক নাম টাইপ করুন (বাধ্যতামূলক):' : '2. Type Custom Product Name (Mandatory):')
                    : (language === 'bn' ? '২. পণ্যের চূড়ান্ত শিরোনাম (প্রয়োজনে এডিট করুন):' : '2. Final Ad Title (Edit if needed):')}
                  <span className="text-red-500 font-bold ml-1">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {title.length} {language === 'bn' ? 'অক্ষর' : 'chars'}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError('');
                }}
                placeholder={
                  selectedTitlePreset === 'OTHER'
                    ? (language === 'bn' ? 'আপনার পণ্যের নাম বিস্তারিত লিখুন (যেমন: নতুন স্যামসাং ফ্রিজ / আইফোন ১৫)...' : 'Type exact product name details...')
                    : (language === 'bn' ? fieldLabels.titlePlaceholderBn : fieldLabels.titlePlaceholderEn)
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500 shadow-2xs ${
                  titleError ? 'border-red-500 ring-2 ring-red-400/20' : 'border-slate-300 dark:border-slate-700'
                }`}
                required
              />
              {titleError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{titleError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Category specific fields */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                {language === 'bn' ? 'স্পেসিফিকেশন ও তথ্য নির্বাচন (Dropdown)' : 'Specifications & Details Selection'}
              </span>
              <span className="text-[10px] bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-300">
                {language === 'bn' ? 'ড্রপডাউন সিলেক্ট' : 'Dropdown Selection'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* VEHICLE SUB-CATEGORY SELECTION (Cars, Motorbikes, Bicycles, Others) */}
              {(category === 'vehicles' || category === 'cars' || category === 'car' || category === 'motorcycles' || category === 'bike' || category === 'bikes') && (
                <div className="sm:col-span-2 p-3.5 bg-blue-50/90 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <span>🚗</span>
                      <span>{language === 'bn' ? 'যানবাহনের ধরন / সাব-ক্যাটাগরি ড্রপডাউন (Vehicle Sub-Category)' : 'Vehicle Sub-Category Dropdown'}</span>
                      <span className="text-red-500 font-bold">* ({language === 'bn' ? 'বাধ্যতামূলক' : 'Required'})</span>
                    </label>
                    <span className="text-[10px] bg-blue-200/70 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      {vehicleSubCategory === 'cars' ? (language === 'bn' ? 'কার ও এসইউভি' : 'Car & SUV') :
                       vehicleSubCategory === 'motorbikes' ? (language === 'bn' ? 'মোটর বাইক' : 'Motorbike') :
                       vehicleSubCategory === 'bicycles' ? (language === 'bn' ? 'বাইসাইকেল' : 'Bicycle') :
                       (language === 'bn' ? 'অন্যান্য ও কমার্শিয়াল' : 'Others / Commercial')}
                    </span>
                  </div>

                  {/* Primary Dropdown Selection */}
                  <select
                    value={vehicleSubCategory}
                    onChange={e => {
                      const val = e.target.value as 'cars' | 'motorbikes' | 'bicycles' | 'others';
                      setVehicleSubCategory(val);
                      setBrand('');
                      setModel('');
                      setIsCustomBrand(false);
                      setIsCustomModel(false);
                    }}
                    className="w-full px-3.5 py-2.5 border border-blue-300 dark:border-blue-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="cars">🚗 {language === 'bn' ? 'কার, জিপ ও এসইউভি (Cars & SUVs)' : 'Cars, Jeeps & SUVs'}</option>
                    <option value="motorbikes">🏍️ {language === 'bn' ? 'মোটর বাইক ও স্কুটার (Motorbikes & Scooters)' : 'Motorbikes & Scooters'}</option>
                    <option value="bicycles">🚲 {language === 'bn' ? 'বাইসাইকেল (Bicycles & Cycles)' : 'Bicycles & Cycles'}</option>
                    <option value="others">🚛 {language === 'bn' ? 'অন্যান্য যানবাহন, ট্রাক, সিএনজি ও অটোরিকশা (Others)' : 'Commercial Vehicles, Trucks & Others'}</option>
                  </select>

                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { id: 'cars', icon: '🚗', nameBn: 'কার ও এসইউভি', nameEn: 'Cars' },
                      { id: 'motorbikes', icon: '🏍️', nameBn: 'মোটর বাইক', nameEn: 'Motorbikes' },
                      { id: 'bicycles', icon: '🚲', nameBn: 'বাইসাইকেল', nameEn: 'Bicycles' },
                      { id: 'others', icon: '🚛', nameBn: 'অন্যান্য যানবাহন', nameEn: 'Others' }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setVehicleSubCategory(sub.id as any);
                          setBrand('');
                          setModel('');
                          setIsCustomBrand(false);
                          setIsCustomModel(false);
                        }}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          vehicleSubCategory === sub.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-blue-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <span>{sub.icon}</span>
                        <span>{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BRAND DROPDOWN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? fieldLabels.brandLabelBn : fieldLabels.brandLabelEn}
                </label>
                {categoryBrands.length > 0 ? (
                  <select
                    value={isCustomBrand ? 'OTHER' : brand}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'OTHER') {
                        setIsCustomBrand(true);
                        setBrand('');
                        setModel('');
                      } else {
                        setIsCustomBrand(false);
                        setBrand(val);
                        setModel('');
                        setIsCustomModel(false);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    <option value="">{language === 'bn' ? `-- ${fieldLabels.brandLabelBn} বেছে নিন --` : `-- Select ${fieldLabels.brandLabelEn} --`}</option>
                    {categoryBrands.map(b => (
                      <option key={b.brandEn} value={b.brandEn}>
                        {language === 'bn' ? b.brandBn : b.brandEn}
                      </option>
                    ))}
                    <option value="OTHER">{language === 'bn' ? '➕ অন্যান্য / অন্য অপশন টাইপ করুন' : '➕ Other / Type Custom Option'}</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder={language === 'bn' ? fieldLabels.brandPlaceholderBn : fieldLabels.brandPlaceholderEn}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                )}

                {isCustomBrand && (
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder={language === 'bn' ? 'নিজের মতো টাইপ করুন...' : 'Type custom option...'}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pink-500 animate-in fade-in"
                  />
                )}
              </div>

              {/* MODEL DROPDOWN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? fieldLabels.modelLabelBn : fieldLabels.modelLabelEn}
                </label>
                {availableModels.length > 0 && !isCustomBrand ? (
                  <select
                    value={isCustomModel ? 'OTHER' : model}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'OTHER') {
                        setIsCustomModel(true);
                        setModel('');
                      } else {
                        setIsCustomModel(false);
                        setModel(val);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    <option value="">{language === 'bn' ? `-- ${fieldLabels.modelLabelBn} বেছে নিন --` : `-- Select ${fieldLabels.modelLabelEn} --`}</option>
                    {availableModels.map(m => (
                      <option key={m.en} value={m.en}>
                        {language === 'bn' ? `${m.bn} (${m.en})` : `${m.en} (${m.bn})`}
                      </option>
                    ))}
                    <option value="OTHER">{language === 'bn' ? '➕ অন্যান্য / অন্য মডেল টাইপ করুন' : '➕ Other / Type Custom Model'}</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder={language === 'bn' ? fieldLabels.modelPlaceholderBn : fieldLabels.modelPlaceholderEn}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                )}

                {isCustomModel && availableModels.length > 0 && (
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder={language === 'bn' ? 'নিজের মতো টাইপ করুন...' : 'Type custom detail...'}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pink-500 animate-in fade-in"
                  />
                )}
              </div>

              {/* RAM & STORAGE for Mobiles / Electronics */}
              {(category === 'mobiles' || category === 'electronics') && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">RAM</label>
                    <select
                      value={ram}
                      onChange={e => setRam(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- RAM নির্বাচন করুন --' : '-- Select RAM --'}</option>
                      <option value="2 GB">2 GB</option>
                      <option value="3 GB">3 GB</option>
                      <option value="4 GB">4 GB</option>
                      <option value="6 GB">6 GB</option>
                      <option value="8 GB">8 GB</option>
                      <option value="12 GB">12 GB</option>
                      <option value="16 GB">16 GB</option>
                      <option value="24 GB">24 GB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Storage</label>
                    <select
                      value={storage}
                      onChange={e => setStorage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- Storage নির্বাচন করুন --' : '-- Select Storage --'}</option>
                      <option value="32 GB">32 GB</option>
                      <option value="64 GB">64 GB</option>
                      <option value="128 GB">128 GB</option>
                      <option value="256 GB">256 GB</option>
                      <option value="512 GB">512 GB</option>
                      <option value="1 TB">1 TB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'প্রসেসর / চিপসেট' : 'Processor'}
                    </label>
                    <input
                      type="text"
                      value={processor}
                      onChange={e => setProcessor(e.target.value)}
                      placeholder="e.g. Snapdragon 8 Gen 3, Apple A17 Pro, Dimensity 9300, M3 Max"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {category === 'mobiles' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ক্যামেরা (Camera MP)' : 'Camera'}
                    </label>
                    <input
                      type="text"
                      value={camera}
                      onChange={e => setCamera(e.target.value)}
                      placeholder="e.g. 200 MP + 50 MP Zeiss / 50 MP Selfie"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ব্যাটারি ও চার্জিং' : 'Battery & Charging'}
                    </label>
                    <input
                      type="text"
                      value={battery}
                      onChange={e => setBattery(e.target.value)}
                      placeholder="e.g. 5000 mAh (120W Fast Charge)"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ডিসপ্লে (Display)' : 'Display'}
                    </label>
                    <input
                      type="text"
                      value={displayType}
                      onChange={e => setDisplayType(e.target.value)}
                      placeholder="e.g. 6.78 AMOLED 120Hz LTPO"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'কালার / রঙ (Color)' : 'Color'}
                    </label>
                    <select
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- রঙ নির্বাচন করুন --' : '-- Select Color --'}</option>
                      <option value="Black">Black (কালো)</option>
                      <option value="White">White (সাদা)</option>
                      <option value="Blue">Blue (নীল)</option>
                      <option value="Green">Green (সবুজ)</option>
                      <option value="Red">Red (লাল)</option>
                      <option value="Silver">Silver (সিলভার)</option>
                      <option value="Gold">Gold (গোল্ড)</option>
                      <option value="Purple">Purple (পার্পল)</option>
                      <option value="Pink">Pink (পিঙ্ক)</option>
                      <option value="Titanium">Titanium (টাইটানিয়াম)</option>
                      <option value="Others">Others (অন্যান্য)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Odometer Mileage for Vehicles */}
              {category === 'vehicles' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'কিলোমিটার (Odometer/Mileage)' : 'Mileage (KM)'}
                    </label>
                    <select
                      value={mileage}
                      onChange={e => setMileage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- কিলোমিটার নির্বাচন করুন --' : '-- Select Mileage --'}</option>
                      <option value="1,000 KM">1,000 KM</option>
                      <option value="5,000 KM">5,000 KM</option>
                      <option value="10,000 KM">10,000 KM</option>
                      <option value="15,000 KM">15,000 KM</option>
                      <option value="20,000 KM">20,000 KM</option>
                      <option value="30,000 KM+">30,000 KM+</option>
                      <option value="50,000 KM+">50,000 KM+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ইঞ্জিন ক্ষমতা (Engine CC)' : 'Engine CC'}
                    </label>
                    <input
                      type="text"
                      value={engineCc}
                      onChange={e => setEngineCc(e.target.value)}
                      placeholder="e.g. 155 CC, 1500 CC Hybrid"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ফুয়েল / জ্বালানী টাইপ' : 'Fuel Type'}
                    </label>
                    <select
                      value={fuelType}
                      onChange={e => setFuelType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- ফুয়েল টাইপ --' : '-- Fuel Type --'}</option>
                      <option value="Octane / Petrol">Octane / Petrol</option>
                      <option value="CNG / LPG">CNG / LPG</option>
                      <option value="Hybrid (Octane + Battery)">Hybrid</option>
                      <option value="Electric EV">Electric EV</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                </>
              )}

              {/* Property Specs */}
              {category === 'property' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'সাইজ (Sqft / Katha)' : 'Size (Sqft / Katha)'}
                    </label>
                    <select
                      value={sqft}
                      onChange={e => setSqft(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- সাইজ নির্বাচন করুন --' : '-- Select Size --'}</option>
                      <option value="800 Sqft">800 Sqft</option>
                      <option value="1000 Sqft">1000 Sqft</option>
                      <option value="1250 Sqft">1250 Sqft</option>
                      <option value="1500 Sqft">1500 Sqft</option>
                      <option value="1850 Sqft">1850 Sqft</option>
                      <option value="2200 Sqft">2200 Sqft</option>
                      <option value="3 Katha Plot">3 Katha Plot</option>
                      <option value="5 Katha Plot">5 Katha Plot</option>
                      <option value="10 Katha Plot">10 Katha Plot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'বেডরুম' : 'Bedrooms'}
                    </label>
                    <input
                      type="text"
                      value={bedrooms}
                      onChange={e => setBedrooms(e.target.value)}
                      placeholder="e.g. 3 Bed"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'বাথরুম' : 'Bathrooms'}
                    </label>
                    <input
                      type="text"
                      value={bathrooms}
                      onChange={e => setBathrooms(e.target.value)}
                      placeholder="e.g. 3 Bath"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ফেস বা দিক (Facing)' : 'Facing Direction'}
                    </label>
                    <select
                      value={facing}
                      onChange={e => setFacing(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- দিক নির্বাচন করুন --' : '-- Select Facing --'}</option>
                      <option value="South Facing (দক্ষিণমুখী)">South Facing (দক্ষিণমুখী)</option>
                      <option value="East Facing (পূর্বমুখী)">East Facing (পূর্বমুখী)</option>
                      <option value="North Facing (উত্তরমুখী)">North Facing (উত্তরমুখী)</option>
                      <option value="West Facing (পশ্চিমমুখী)">West Facing (পশ্চিমমুখী)</option>
                      <option value="Corner Plot (কোরনার প্লট)">Corner Plot (কোরনার প্লট)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Fashion Specs */}
              {category === 'fashion' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'সাইজ (Clothing Size)' : 'Size'}
                    </label>
                    <select
                      value={clothingSize}
                      onChange={e => setClothingSize(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- সাইজ নির্বাচন করুন --' : '-- Select Size --'}</option>
                      <option value="S (Small)">S (Small)</option>
                      <option value="M (Medium)">M (Medium)</option>
                      <option value="L (Large)">L (Large)</option>
                      <option value="XL (Extra Large)">XL (Extra Large)</option>
                      <option value="XXL (2XL)">XXL (2XL)</option>
                      <option value="38 / 40 / 42">38 / 40 / 42</option>
                      <option value="Free Size">Free Size</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'উপাদান / ফেব্রিক্স (Material)' : 'Material'}
                    </label>
                    <input
                      type="text"
                      value={fabricMaterial}
                      onChange={e => setFabricMaterial(e.target.value)}
                      placeholder="e.g. 100% Pure Cotton, Silk, Georgette, Denim"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'কালার / রঙ' : 'Color'}
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="e.g. Navy Blue, Black, Maroon, White"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Furniture Specs */}
              {category === 'furniture' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'উপাদান (Wood / Material)' : 'Material'}
                    </label>
                    <select
                      value={furnitureMaterial}
                      onChange={e => setFurnitureMaterial(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- কাঠের ধরণ বেছে নিন --' : '-- Select Material --'}</option>
                      <option value="Chittagong Teak (চিটাগাং সেগুন)">Chittagong Teak (চিটাগাং সেগুন)</option>
                      <option value="Segun Wood (সেগুন কাঠ)">Segun Wood (সেগুন কাঠ)</option>
                      <option value="Sheesham Wood (মেহগনি কাঠ)">Sheesham / Mahogany Wood</option>
                      <option value="Processed Wood Board">Processed Board / MDF</option>
                      <option value="Stainless Steel / Metal">Metal / Steel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'কালার / ফিনিশিং' : 'Color / Finishing'}
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="e.g. Antique Polish, Natural Wood, Walnut, White"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Home Appliances Specs */}
              {category === 'home_appliances' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'ক্যাপাসিটি / পাওয়ার (Ton / Liter / Watt)' : 'Capacity / Power'}
                    </label>
                    <input
                      type="text"
                      value={applianceCapacity}
                      onChange={e => setApplianceCapacity(e.target.value)}
                      placeholder="e.g. 1.5 Ton, 350 Litre, 2000 Watt"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Books Specs */}
              {category === 'books' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'লেখক / প্রকাশনী (Author / Publisher)' : 'Author / Publisher'}
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      placeholder="e.g. হুমায়ূন আহমেদ / প্রথমা প্রকাশন"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Jobs Specs */}
              {category === 'jobs' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'চাকরির ধরণ (Job Type)' : 'Job Type'}
                    </label>
                    <select
                      value={jobType}
                      onChange={e => setJobType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- চাকরির ধরণ বেছে নিন --' : '-- Select Job Type --'}</option>
                      <option value="Full Time (ফুল টাইম)">Full Time (ফুল টাইম)</option>
                      <option value="Part Time (পার্ট টাইম)">Part Time (পার্ট টাইম)</option>
                      <option value="Work From Home / Remote">Work From Home / Remote</option>
                      <option value="Contractual / Internship">Contractual / Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'বেতন পরিসর (Salary Range)' : 'Salary Range'}
                    </label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={e => setJobSalary(e.target.value)}
                      placeholder="e.g. ৳২৫,০০০ - ৳৩৫,০০০ (Monthly)"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Education Specs */}
              {category === 'education' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'শ্রেণী / লেভেল (Class / Level)' : 'Class / Level'}
                    </label>
                    <input
                      type="text"
                      value={educationClass}
                      onChange={e => setEducationClass(e.target.value)}
                      placeholder="e.g. Class 1-10, SSC / HSC, Varsity Coaching"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Services & Construction Specs */}
              {(category === 'services' || category === 'repair_construction') && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'সার্ভিস এরিয়া কভারেজ' : 'Service Coverage Area'}
                    </label>
                    <input
                      type="text"
                      value={serviceArea}
                      onChange={e => setServiceArea(e.target.value)}
                      placeholder="e.g. সমগ্র ঢাকা সিটি / অল বাংলাদেশ"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}

              {/* Baby & Kids Specs */}
              {(category === 'baby_kids' || category === 'baby') && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'বয়স সীমানা (Age Group)' : 'Age Group'}
                    </label>
                    <select
                      value={babyAgeGroup}
                      onChange={e => setBabyAgeGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- বয়স সীমানা বেছে নিন --' : '-- Select Age Group --'}</option>
                      <option value="0-6 Months">0-6 Months (০-৬ মাস)</option>
                      <option value="6-12 Months">6-12 Months (৬-১২ মাস)</option>
                      <option value="1-3 Years">1-3 Years (১-৩ বছর)</option>
                      <option value="3-5 Years">3-5 Years (৩-৫ বছর)</option>
                      <option value="5-8 Years">5-8 Years (৫-৮ বছর)</option>
                      <option value="8-12 Years">8-12 Years (৮-১২ বছর)</option>
                      <option value="All Ages">All Ages (সকল বয়সের শিশু)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'লিঙ্গ (Gender Target)' : 'Gender Target'}
                    </label>
                    <select
                      value={babyGender}
                      onChange={e => setBabyGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- লিঙ্গ নির্বাচন করুন --' : '-- Select Gender --'}</option>
                      <option value="Unisex">Unisex / Gender Neutral (সকল শিশু)</option>
                      <option value="Baby Boy">Baby Boy (ছেলে শিশু)</option>
                      <option value="Baby Girl">Baby Girl (মেয়ে শিশু)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'আইটেম ক্যাটাগরি (Item Type)' : 'Item Type'}
                    </label>
                    <select
                      value={babyItemType}
                      onChange={e => setBabyItemType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- আইটেম টাইপ বেছে নিন --' : '-- Select Item Type --'}</option>
                      <option value="Stroller & Pram">Stroller, Pram & Walker (প্রাম ও ওয়াকার)</option>
                      <option value="Toys & Games">Toys, Puzzles & Games (খেলনা ও লার্নিং)</option>
                      <option value="Baby Clothing & Shoes">Baby Clothing & Shoes (পোশাক ও জুতা)</option>
                      <option value="Diapers & Skincare">Diapers & Skincare (ডায়াপার ও যত্ন)</option>
                      <option value="Cot, Bedding & Blanket">Cot, Bedding & Blanket (খাট ও কাঁথা)</option>
                      <option value="Feeding & High Chair">Feeding Gear & High Chair (ফিডিং ও হাই চেয়ার)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'উপাদান ও সেফটি মান (Safety Material)' : 'Safety Material'}
                    </label>
                    <select
                      value={babySafetyMaterial}
                      onChange={e => setBabySafetyMaterial(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                    >
                      <option value="">{language === 'bn' ? '-- সেফটি উপাদান বেছে নিন --' : '-- Select Safety Material --'}</option>
                      <option value="100% Non-Toxic & BPA Free">100% Non-Toxic & BPA Free</option>
                      <option value="100% Pure Soft Organic Cotton">100% Pure Soft Organic Cotton</option>
                      <option value="Soft Cushion & Washable Cover">Soft Cushion & Washable Cover</option>
                      <option value="Solid Wooden / Metal Safety Frame">Solid Wooden / Metal Safety Frame</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {language === 'bn' ? 'কালার / রঙ (Color)' : 'Color'}
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="e.g. Baby Pink, Sky Blue, Yellow, Red, White, Multicolor"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Condition & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                {language === 'bn' ? 'কন্ডিশন' : 'Condition'} *
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pink-600 cursor-pointer shadow-2xs"
              >
                <option value="brand_new">{language === 'bn' ? 'একদম নতুন (Brand New)' : 'Brand New'}</option>
                <option value="used_like_new">{language === 'bn' ? 'ব্যবহৃত - নতুনের মত' : 'Used - Like New'}</option>
                <option value="used_good">{language === 'bn' ? 'ব্যবহৃত - ভালো অবস্থা' : 'Used - Good'}</option>
                <option value="refurbished">{language === 'bn' ? 'রিফার্বিশড' : 'Refurbished'}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span>{language === 'bn' ? 'দ্রব্যের মূল্য (Price in BDT)' : 'Item Price (BDT)'}</span>
                  <span className="text-red-500 font-bold">* ({language === 'bn' ? 'বাধ্যতামূলক' : 'Mandatory'})</span>
                </label>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded">
                  {language === 'bn' ? 'পূরণ আবশ্যক' : 'Required'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-black text-sm pointer-events-none">
                  ৳
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={e => {
                    setPrice(e.target.value);
                    if (e.target.value.trim() && parseFloat(e.target.value) > 0) {
                      setPriceError('');
                    }
                  }}
                  placeholder="e.g. 45000"
                  className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-xs bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-600 font-bold text-pink-600 dark:text-pink-400 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs ${
                    priceError ? 'border-red-500 ring-2 ring-red-400/20' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  required
                />
              </div>
              {priceError ? (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{priceError}</span>
                </p>
              ) : (
                <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={e => setIsNegotiable(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>{language === 'bn' ? 'দাম আলোচনা সাপেক্ষ (Negotiable)' : 'Price Negotiable'}</span>
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              {language === 'bn' ? 'বিস্তারিত বর্ণনা' : 'Description'}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder={
                language === 'bn'
                  ? 'আপনার প্রোডাক্টটির বিশেষ বৈশিষ্ট্য ও কন্ডিশন সম্পর্কে স্পষ্ট করে লিখুন...'
                  : 'Write clear description about the item features...'
              }
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-600"
            />
          </div>

          {/* ITEM FEATURES SELECTION */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                {language === 'bn' ? 'প্রোডাক্টের বিশেষ ফিচার ও সুবিধাসমূহ সিলেক্ট করুন (Item Features)' : 'Select Item Features & Highlights'}
              </span>
              <span className="text-[10px] bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-bold px-2.5 py-0.5 rounded-full">
                {selectedFeatures.length} {language === 'bn' ? 'টি নির্বাচিত' : 'Selected'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(CATEGORY_FEATURES_MAP[category] || CATEGORY_FEATURES_MAP['default']).map(feat => {
                const label = language === 'bn' ? feat.bn : feat.en;
                const isChecked = selectedFeatures.includes(label);
                return (
                  <label
                    key={feat.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      isChecked
                        ? 'border-pink-600 bg-pink-50/70 dark:bg-pink-950/40 font-semibold text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedFeatures(prev => [...prev, label]);
                        } else {
                          setSelectedFeatures(prev => prev.filter(f => f !== label));
                        }
                      }}
                      className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* CONTACT MOBILE NUMBER & PRIVACY SECTION */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span>
                  {language === 'bn'
                    ? 'যোগাযোগের মোবাইল নম্বর (বাধ্যতামূলক)'
                    : 'Contact Mobile Number (Required)'}
                </span>
                <span className="text-red-500 font-black">*</span>
              </label>
              <span className="text-[10px] font-extrabold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/80 px-2 py-0.5 rounded-md border border-pink-200 dark:border-pink-900 self-start sm:self-auto">
                {language === 'bn' ? '১১ ডিজিট বাধ্যতামূলক' : '11-Digits Required'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder={language === 'bn' ? 'যেমন: 01712-345678' : 'e.g. 01712-345678'}
                  required
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none transition ${
                    phoneError
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-pink-600'
                  }`}
                />
              </div>

              {phoneError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{phoneError}</span>
                </div>
              )}

              {/* Hide Phone Number Checkbox / Toggle */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div
                  onClick={() => setHidePhone(!hidePhone)}
                  className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    hidePhone
                      ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        hidePhone
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {hidePhone ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {language === 'bn'
                            ? 'বিজ্ঞাপনে আমার মোবাইল নম্বর গোপন / হাইড রাখুন'
                            : 'Hide My Phone Number on Listing'}
                        </span>
                        {hidePhone ? (
                          <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <EyeOff className="w-3 h-3" />
                            {language === 'bn' ? 'নম্বর গোপন সক্রিয় (Hidden)' : 'Hidden'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                            {language === 'bn' ? 'পাবলিকলি দৃশ্যমান (Visible)' : 'Visible'}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {hidePhone
                          ? (language === 'bn'
                              ? '🔒 আপনার মোবাইল নম্বরটি বিজ্ঞাপনে গোপন রাখা হবে। ক্রেতারা কেবল সরাসরি ইনবক্স চ্যাটের মাধ্যমে আপনার সাথে যোগাযোগ করতে পারবে।'
                              : '🔒 Your phone number will be hidden on public listing. Buyers can only reach you via direct Chat.')
                          : (language === 'bn'
                              ? '👁️ ফোন নম্বর সাধারণ ভিজিটরদের কাছে দেখা যাবে। ক্রেতারা "ফোন নম্বর দেখুন" এ ক্লিক করে আপনাকে কল করতে পারবে।'
                              : '👁️ Phone number will be public. Buyers can click to reveal and call you directly.')}
                      </p>
                    </div>
                  </div>

                  {/* Switch Pill */}
                  <div className="shrink-0 self-end sm:self-center">
                    <div
                      className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                        hidePhone ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Picker */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span>{language === 'bn' ? 'বিজ্ঞাপনের সঠিক লোকেশন নির্বাচন করুন (Division, District & Thana)' : 'Select Ad Location'}</span>
              </label>
              <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-100 dark:border-pink-900/50 self-start sm:self-auto">
                📍 {division} › {district} › {thana}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Division Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'বিভাগ (Division)' : 'Division'}
                </label>
                <select
                  value={selectedDivId}
                  onChange={handleDivChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                >
                  {BANGLADESH_DIVISIONS.map(div => (
                    <option key={div.id} value={div.id}>
                      {language === 'bn' ? `${div.nameBn} (${div.nameEn})` : `${div.nameEn} (${div.nameBn})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'জেলা (District)' : 'District'}
                </label>
                <select
                  value={selectedDistId}
                  onChange={handleDistChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                >
                  {availableDistricts.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {language === 'bn' ? `${dist.nameBn} (${dist.nameEn})` : `${dist.nameEn} (${dist.nameBn})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thana Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'থানা / এলাকা (Thana/Area)' : 'Thana / Upazila'}
                </label>
                <select
                  value={selectedThanaId}
                  onChange={handleThanaChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-600 cursor-pointer"
                >
                  {availableThanas.map(th => (
                    <option key={th.id} value={th.id}>
                      {language === 'bn' ? `${th.nameBn} (${th.nameEn})` : `${th.nameEn} (${th.nameBn})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* REAL PHOTO UPLOADER (MIN 2, MAX 5) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-4 rounded-xl border transition-all space-y-3.5 ${
              isDragging
                ? 'bg-pink-100/80 dark:bg-pink-950/70 border-pink-500 scale-[1.01]'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  {language === 'bn' ? 'বাস্তব ছবি আপলোড করুন (কমপক্ষে ১ টি)' : 'Upload Real Product Photos (Min 1)'}
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'আপনার ডিভাইস থেকে পরিষ্কার ছবি বেছে নিন (সর্বনিম্ন ১ টি, সর্বোচ্চ ৫ টি)।'
                    : 'Select clear product photos (Minimum 1, Maximum 5 photos).'}
                </p>
              </div>
              <span
                className={`text-[11px] font-black px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 ${
                  images.length >= 1 && images.length <= 5
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {language === 'bn' ? `ছবি: ${images.length} / ৫ (কমপক্ষে ১টি)` : `Photos: ${images.length} / 5 (Min 1)`}
              </span>
            </div>

            {/* Error banner */}
            {imageError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Native Mobile File Inputs (Labels trigger OS File/Camera Picker natively) */}
            <input
              id="android-camera-file-input"
              ref={cameraInputRef}
              type="file"
              accept="image/*,image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              onChange={handleFileUpload}
            />
            <input
              id="android-gallery-file-input"
              ref={galleryInputRef}
              type="file"
              accept="image/*,image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handleFileUpload}
            />

            {/* Simple Action Buttons: Camera, Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Button 1: Camera (Native Label) */}
              <label
                htmlFor="android-camera-file-input"
                onClick={(e) => {
                  if (images.length >= 5) {
                    e.preventDefault();
                    setImageError(language === 'bn' ? '⚠️ সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।' : '⚠️ Maximum 5 photos allowed.');
                  }
                }}
                className="py-3 px-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Camera className="w-4 h-4 text-white shrink-0" />
                <span>{language === 'bn' ? '📸 ক্যামেরা দিয়ে ছবি তুলুন' : '📸 Take Camera Photo'}</span>
              </label>

              {/* Button 2: Gallery (Native Label) */}
              <label
                htmlFor="android-gallery-file-input"
                onClick={(e) => {
                  if (images.length >= 5) {
                    e.preventDefault();
                    setImageError(language === 'bn' ? '⚠️ সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।' : '⚠️ Maximum 5 photos allowed.');
                  }
                }}
                className="py-3 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ImageIcon className="w-4 h-4 text-white shrink-0" />
                <span>{language === 'bn' ? '🖼️ গ্যালারি থেকে আনুন' : '🖼️ Pick from Gallery'}</span>
              </label>
            </div>

            {/* Thumbnail Informational Helper */}
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] text-amber-800 dark:text-amber-200">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'প্রথম ছবিটি (১ম ছবি) সবসময় মূল বিজ্ঞাপনের কভার বা প্রধান থাম্বনেইল হিসেবে প্রদর্শিত হবে।'
                  : 'The first uploaded photo will always serve as the main ad cover/thumbnail.'}
              </span>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl overflow-hidden relative group bg-white dark:bg-slate-800 transition-all ${
                      idx === 0
                        ? 'border-2 border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-400/20'
                        : 'border border-slate-300 dark:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <WatermarkedImage src={img} alt={`Upload ${idx + 1}`} watermarkSize="sm" className="w-full h-full object-cover" />
                    
                    {/* Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1.5 left-1.5 z-10 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 pointer-events-none">
                        <Star className="w-2.5 h-2.5 fill-slate-950" />
                        <span>{language === 'bn' ? 'প্রধান থাম্বনেইল' : 'Thumbnail'}</span>
                      </span>
                    ) : (
                      <span className="absolute top-1.5 left-1.5 z-10 bg-slate-900/80 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded pointer-events-none">
                        #{idx + 1}
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition shadow-xs cursor-pointer z-20"
                      title={language === 'bn' ? 'ছবি মুছুন' : 'Remove Photo'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Set As Thumbnail Button for non-primary images */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetAsThumbnail(idx)}
                        className="absolute bottom-1.5 left-1.5 right-1.5 py-1 px-1 bg-slate-900/90 hover:bg-amber-600 text-white text-[10px] font-extrabold rounded-md shadow-xs flex items-center justify-center gap-1 transition cursor-pointer z-20"
                        title={language === 'bn' ? 'এই ছবিটিকে প্রধান থাম্বনেইল করুন' : 'Set this photo as Main Thumbnail'}
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <span>{language === 'bn' ? 'থাম্বনেইল করুন' : 'Set as Main'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>{language === 'bn' ? 'পিছনে (Back)' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const draftData = {
                    title,
                    price,
                    category,
                    description,
                    condition,
                    images,
                    brand,
                    model,
                    phone,
                    division,
                    district,
                    thana,
                    savedAt: new Date().toLocaleString()
                  };
                  safeStorage.setItem('marketbd_ad_draft', JSON.stringify(draftData));
                  alert(language === 'bn' ? '✓ ড্রাফট সাকসেসফুলি সেভ করা হয়েছে! পরে যেকোনো সময় এডিট করা যাবে।' : '✓ Ad draft saved successfully in local storage!');
                }}
                className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-extrabold rounded-xl text-xs border border-amber-200 dark:border-amber-800/80 transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{language === 'bn' ? 'খসড়া সেভ করুন (Save Draft)' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                onClick={handleGoToStep3}
                className="px-6 py-2.5 bg-pink-600 text-white font-bold rounded-xl text-xs hover:bg-pink-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{language === 'bn' ? 'পরবর্তী ধাপ (Next)' : 'Next Step (Boost)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
        );
      })()}

      {/* STEP 3: Ad Promotion Boost & bKash / Nagad Payment */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{language === 'bn' ? '৩. আপনার বিজ্ঞাপন দ্রুত বিক্রি করতে প্রমোশন বেছে নিন' : '3. Select Promotion Boost'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn' ? 'পেইড প্রমোশন বেছে নিলে সরাসরি বিকাশ বা নগদ-এ পেমেন্ট করার অপশন পাবেন।' : 'Select a boost plan or post for free.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Regular */}
            <div
              onClick={() => {
                setAdType('regular');
                setPaymentError('');
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                adType === 'regular'
                  ? 'border-pink-500 bg-slate-950 text-white shadow-lg ring-2 ring-pink-500/50'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-pink-400'
              }`}
            >
              <h3 className="font-extrabold text-sm">
                {language === 'bn' ? 'ফ্রি রেগুলার বিজ্ঞাপন' : 'Free Regular Ad'}
              </h3>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">
                {language === 'bn' ? 'বিনামূল্যে সাধারণ ক্যাটাগরি লিস্টে থাকবে।' : 'Free standard placement.'}
              </p>
              <span className="inline-block mt-4 text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-600">
                ৳0 (ফ্রি পেমেন্ট)
              </span>
            </div>

            {/* Urgent */}
            <div
              onClick={() => {
                setAdType('urgent');
                setPaymentError('');
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] relative ${
                adType === 'urgent'
                  ? 'border-pink-500 bg-slate-950 text-white shadow-lg ring-2 ring-pink-500/50'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-pink-400'
              }`}
            >
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">⚡ URGENT ৳49</span>
              <h3 className="font-extrabold text-sm mt-2">
                {language === 'bn' ? 'জরুরি বিক্রি (Urgent Ad)' : 'Urgent Sale Badge'}
              </h3>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">
                {language === 'bn' ? 'লাল ব্রাইট ইমারজেন্সি ব্যাজ এবং ৫ গুণ দ্রুত ক্রেতাদের রেসপন্স।' : 'Red emergency badge & 5x faster calls.'}
              </p>
              <span className="inline-block mt-4 text-xs font-black text-red-400 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-600">
                ৳49 / ৭ দিন
              </span>
            </div>

            {/* Featured */}
            <div
              onClick={() => {
                setAdType('featured');
                setPaymentError('');
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] relative ${
                adType === 'featured'
                  ? 'border-pink-500 bg-slate-950 text-white shadow-lg ring-2 ring-pink-500/50'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-pink-400'
              }`}
            >
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">⭐ FEATURED</span>
              <h3 className="font-extrabold text-sm mt-2">
                {language === 'bn' ? 'ফিচার্ড প্রমোশন' : 'Top Featured Ad'}
              </h3>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">
                {language === 'bn' ? 'হোমপেজ ও সার্চ রেজাল্টের সবার উপরে প্রিমিয়াম অবস্থান।' : 'Top placement on homepage & search.'}
              </p>

              {/* Sub-duration Selector */}
              <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setAdType('featured');
                    setFeaturedPlan('7');
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black border transition ${
                    adType === 'featured' && featuredPlan === '7'
                      ? 'bg-pink-600 text-white border-pink-400 shadow-2xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  7 Days (৳99)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdType('featured');
                    setFeaturedPlan('30');
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black border transition ${
                    adType === 'featured' && featuredPlan === '30'
                      ? 'bg-pink-600 text-white border-pink-400 shadow-2xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  30 Days (৳199)
                </button>
              </div>
            </div>
          </div>

          {/* bKash / Nagad / Rocket Payment Option Box for Paid Ads */}
          {adType !== 'regular' && (
            <div className="bg-slate-950 p-5 rounded-2xl border-2 border-pink-500 shadow-xl space-y-4 text-white animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {language === 'bn' ? 'বিকাশ / নগদ / রকেট পেমেন্ট অপশন' : 'bKash / Nagad / Rocket Direct Payment'}
                    </h3>
                    <p className="text-xs font-bold text-pink-400">
                      {language === 'bn'
                        ? `প্রদেয় পরিমাণ: ৳${adType === 'urgent' ? '49' : featuredPlan === '7' ? '99' : '199'} BDT`
                        : `Pay Amount: ৳${adType === 'urgent' ? '49' : featuredPlan === '7' ? '99' : '199'} BDT`}
                    </p>
                  </div>
                </div>

                {/* Clear prominent Payment Method Selector Logos */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPayMethod('bkash')}
                    className={`px-3 py-1.5 rounded-xl transition border flex items-center gap-2 cursor-pointer ${
                      payMethod === 'bkash'
                        ? 'bg-pink-950/90 border-pink-400 ring-2 ring-pink-500 shadow-lg scale-105'
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <BkashLogo className="h-7 w-auto shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('nagad')}
                    className={`px-3 py-1.5 rounded-xl transition border flex items-center gap-2 cursor-pointer ${
                      payMethod === 'nagad'
                        ? 'bg-orange-950/90 border-orange-400 ring-2 ring-orange-500 shadow-lg scale-105'
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <NagadLogo className="h-7 w-auto shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('rocket')}
                    className={`px-3 py-1.5 rounded-xl transition border flex items-center gap-2 cursor-pointer ${
                      payMethod === 'rocket'
                        ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-500 shadow-lg scale-105'
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <RocketLogo className="h-7 w-auto shrink-0" />
                  </button>
                </div>
              </div>

              {/* Payment Number Card */}
              <div className="bg-slate-900 p-4 rounded-xl border border-pink-500/50 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                      {payMethod === 'bkash'
                        ? 'bKash Personal / Merchant Number'
                        : payMethod === 'nagad'
                        ? 'Nagad Personal / Merchant Number'
                        : 'Rocket Personal / Wallet Number'}
                    </span>
                    <div className="text-2xl font-black text-white tracking-widest font-mono flex items-center gap-2">
                      <PhoneCall className="w-6 h-6 text-emerald-400" />
                      <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-yellow-300">
                        {currentPaymentNumber}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="self-start sm:self-auto px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    {copiedNumber ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNumber ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'নম্বর কপি করুন' : 'Copy Number')}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 bg-black/80 p-3 rounded-xl border border-pink-500/40 leading-relaxed">
                  <p className="font-bold text-pink-400 mb-1">
                    {language === 'bn' ? 'পেমেন্ট নির্দেশিকা (Payment Instructions):' : 'Payment Steps:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      {language === 'bn'
                        ? `${payMethod === 'bkash' ? 'bKash App' : payMethod === 'nagad' ? 'Nagad App' : 'Rocket App'} অথবা ${
                            payMethod === 'bkash' ? '*247#' : payMethod === 'nagad' ? '*167#' : '*322#'
                          } ডায়াল করুন।`
                        : `Open ${payMethod === 'bkash' ? 'bKash App' : payMethod === 'nagad' ? 'Nagad App' : 'Rocket App'} or dial ${
                            payMethod === 'bkash' ? '*247#' : payMethod === 'nagad' ? '*167#' : '*322#'
                          }.`}
                    </li>
                    <li>
                      {language === 'bn'
                        ? `Send Money / Payment অপশনে গিয়ে ${currentPaymentNumber} নম্বরে ঠিক ৳${adType === 'urgent' ? '49' : featuredPlan === '7' ? '99' : '199'} পাঠান।`
                        : `Select Send Money / Payment to ${currentPaymentNumber} with exact ৳${adType === 'urgent' ? '49' : featuredPlan === '7' ? '99' : '199'}.`}
                    </li>
                    <li>
                      {language === 'bn'
                        ? 'পেমেন্ট সম্পন্ন হওয়ার পর আপনার নম্বর ও TrxID নিচে টাইপ করুন।'
                        : 'Enter your sender mobile number and Transaction ID (TrxID) below.'}
                    </li>
                  </ol>
                </div>
              </div>

              {/* Payment Details Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {language === 'bn' ? 'আপনার সেন্ডার ফোন নম্বর (Sender Mobile)' : 'Sender Phone Number'} *
                  </label>
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={e => setSenderNumber(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {language === 'bn' ? 'ট্রানজেকশন আইডি (Transaction ID / TrxID)' : 'Transaction ID (TrxID)'} *
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    placeholder="e.g. 9B7X82KA"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white uppercase placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Payment Error Message */}
              {paymentError && (
                <div className="p-3 bg-red-950/80 border border-red-700 rounded-lg text-xs text-red-200 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>{language === 'bn' ? 'পিছনে (Back)' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitAd}
              className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>{language === 'bn' ? 'বিজ্ঞাপন সাবমিট করুন (Publish Ad)' : 'Publish Ad Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Grand Celebratory Success / Under Review Message */}
      {step === 4 && (
        <div className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-6 sm:p-10 border-2 border-amber-400 dark:border-amber-600 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
          {/* Confetti & Decorative Sparkles Background Elements */}
          <div className="absolute top-2 left-4 text-2xl animate-bounce">⏳</div>
          <div className="absolute top-4 right-6 text-2xl animate-pulse">✨</div>
          <div className="absolute bottom-4 left-6 text-2xl animate-pulse">⭐</div>
          <div className="absolute bottom-2 right-4 text-2xl animate-bounce">⏱️</div>

          {/* Glowing Badge */}
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-xl ring-8 ring-amber-100 dark:ring-amber-950 animate-pulse">
              <Clock className="w-10 h-10 text-slate-950" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Grand Heading */}
          <div className="space-y-2">
            <span className="inline-block bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black px-4 py-1.5 rounded-full border border-amber-300 dark:border-amber-700 tracking-wider uppercase">
              ⏳ {language === 'bn' ? 'বিজ্ঞাপন পর্যালোচনায় গৃহীত (Under Review)' : 'Ad Submitted for Review'} ⏳
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {language === 'bn' ? 'বিজ্ঞাপনটি সফলভাবে জমা হয়েছে!' : 'Ad Successfully Submitted!'}
            </h2>
          </div>

          {/* 30-Minute Auto-Approval Live Status Banner */}
          <div className="max-w-lg mx-auto bg-amber-50/90 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-4 text-left shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-sm sm:text-base">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-spin-slow" />
              <span>{language === 'bn' ? 'আপনার বিজ্ঞাপনটি বর্তমানে আন্ডার রিভিউতে রয়েছে' : 'Your Ad is Currently Under Review'}</span>
            </div>
            <p className="text-xs text-amber-900/90 dark:text-amber-300 leading-relaxed font-medium">
              {language === 'bn'
                ? 'এডমিন টিম শীঘ্রই বিজ্ঞাপনটি পর্যালোচনা করবেন। যদি আগামী ৩০ মিনিটের মধ্যে কোনো কারণে এডমিন সিদ্ধান্ত না নেন, তবে সিস্টেম থেকে স্বয়ংক্রিয়ভাবে (Auto-Approved) বিজ্ঞাপনটি অনুমোদিত ও প্ল্যাটফর্মে সরাসরি লাইভ হয়ে যাবে!'
                : 'Our moderation team is reviewing your ad. If not reviewed by an admin within 30 minutes, the system will automatically approve and publish your ad!'}
            </p>
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{language === 'bn' ? '৩০ মিনিট স্বয়ংক্রিয় এপ্রুভাল সক্রিয়' : '30-Min Auto-Approval Active'}</span>
              </span>
              <span className="bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 px-2.5 py-0.5 rounded-full font-black text-[10px] animate-pulse">
                ⏳ {language === 'bn' ? 'আন্ডার রিভিউ' : 'UNDER REVIEW'}
              </span>
            </div>
          </div>

          {/* Ad Summary Box */}
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600">
              {images.length > 0 ? (
                <WatermarkedImage src={images[0]} alt="" watermarkSize="sm" className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  ⏳ {language === 'bn' ? 'রিভিউতে অপেক্ষমাণ' : 'Pending Review'}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                {title || 'Untitled Ad'}
              </h4>
              <p className="text-xs font-black text-pink-600 dark:text-pink-400 mt-0.5">
                ৳{Number(price || 0).toLocaleString()} BDT
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                if (setEditingAd) setEditingAd(null);
                setActiveTab('dashboard');
              }}
              className="flex-1 px-6 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-pink-200 dark:shadow-none transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'আমার বিজ্ঞাপনসমূহ (My Listings) দেখুন' : 'View My Listings'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (setEditingAd) setEditingAd(null);
                setStep(1);
                setTitle('');
                setPrice('');
                setDescription('');
                setImages([]);
              }}
              className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'আরেকটি নতুন পোস্ট করুন' : 'Post Another Ad'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
