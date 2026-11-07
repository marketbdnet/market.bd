import { Product } from '../types';

/**
 * Calculates a customer's monthly free ad usage.
 * Rule:
 * 1. Each customer can post up to 5 free ads in 5 different categories per month.
 * 2. In any single category, max 1 free ad per month.
 */
export interface MonthlyFreeAdQuota {
  totalFreeAdsThisMonth: number;
  freeAdsRemaining: number;
  categoryCountThisMonth: number;
  canPostFree: boolean;
  blockReason?: 'category_limit' | 'monthly_total_limit';
  messageBn?: string;
  messageEn?: string;
}

export function checkMonthlyFreeAdQuota(
  products: Product[],
  userId?: string,
  userPhone?: string,
  targetCategory?: string,
  currentLanguage: 'bn' | 'en' = 'bn'
): MonthlyFreeAdQuota {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  // Find all free (regular) ads posted by this user in the current month
  const userFreeAdsThisMonth = products.filter(p => {
    // Only count regular (free) ads. Paid ads (urgent, featured) don't consume free quota
    if (p.adType && p.adType !== 'regular') return false;

    const matchesUser =
      (userId && p.seller?.id === userId) ||
      (userPhone && p.seller?.phone === userPhone);
    if (!matchesUser) return false;

    const postDate = new Date(p.postedAt || p.createdAt || 0);
    return postDate.getFullYear() === curYear && postDate.getMonth() === curMonth;
  });

  const totalFreeAdsThisMonth = userFreeAdsThisMonth.length;
  const freeAdsRemaining = Math.max(0, 5 - totalFreeAdsThisMonth);

  const categoryAds = targetCategory
    ? userFreeAdsThisMonth.filter(p => p.category === targetCategory)
    : [];
  const categoryCountThisMonth = categoryAds.length;

  if (categoryCountThisMonth >= 1) {
    return {
      totalFreeAdsThisMonth,
      freeAdsRemaining,
      categoryCountThisMonth,
      canPostFree: false,
      blockReason: 'category_limit',
      messageBn: '⚠️ এই মাসে আপনি এই ক্যাটাগরিতে ইতিমধ্যে ১টি ফ্রি বিজ্ঞাপন পোস্ট করেছেন। একই ক্যাটাগরীতে প্রতি মাসে সর্বোচ্চ ১টি ফ্রি বিজ্ঞাপন দেওয়া যায়। এই ক্যাটাগরিতে আরেকটি বিজ্ঞাপন দিতে অনুগ্রহ করে পেইড প্রমোশন (⚡ জরুরি বা ⭐ ফিচার্ড) বেছে নিন।',
      messageEn: '⚠️ You have already posted 1 free ad in this category this month. The monthly limit is 1 free ad per category. Please choose a paid promotion (Urgent or Featured) to post another ad in this category.'
    };
  }

  if (totalFreeAdsThisMonth >= 5) {
    return {
      totalFreeAdsThisMonth,
      freeAdsRemaining: 0,
      categoryCountThisMonth,
      canPostFree: false,
      blockReason: 'monthly_total_limit',
      messageBn: '⚠️ এই মাসে আপনার ৫টি ক্যাটাগরির ৫টি ফ্রি বিজ্ঞাপনের কোটা পূর্ণ হয়ে গেছে। নতুন বিজ্ঞাপন দিতে অনুগ্রহ করে পেইড প্রমোশন (⚡ জরুরি বা ⭐ ফিচার্ড) বেছে নিন।',
      messageEn: '⚠️ You have reached the limit of 5 free ads for this month across 5 categories. Please select a paid promotion to post additional ads.'
    };
  }

  return {
    totalFreeAdsThisMonth,
    freeAdsRemaining,
    categoryCountThisMonth,
    canPostFree: true
  };
}

/**
 * Validates bKash, Nagad, or Rocket Transaction IDs.
 * Rejects invalid length, fake patterns, repeated chars, and duplicate TrxIDs.
 */
export function validateTransactionId(
  method: 'bkash' | 'nagad' | 'rocket',
  trxId: string,
  existingProducts: Product[] = [],
  language: 'bn' | 'en' = 'bn'
): { isValid: boolean; error?: string } {
  const cleanId = (trxId || '').trim().toUpperCase();

  if (!cleanId) {
    return {
      isValid: false,
      error: language === 'bn' ? '⚠️ ট্রানজেকশন আইডি (TrxID) লিখুন।' : '⚠️ Please enter Transaction ID.'
    };
  }

  // Length & pattern check per MFS provider
  if (method === 'bkash') {
    if (cleanId.length < 8 || cleanId.length > 11 || !/^[A-Z0-9]+$/.test(cleanId)) {
      return {
        isValid: false,
        error: language === 'bn'
          ? '⚠️ সঠিক বিকাশ TrxID দিন (সাধারণত ৮-১০ অক্ষরের ইংরেজি বর্ণ ও সংখ্যার মিশ্রণ, যেমন: BL7X92KA8B)'
          : '⚠️ Invalid bKash TrxID format (8-10 alphanumeric characters required).'
      };
    }
  } else if (method === 'nagad') {
    if (cleanId.length < 8 || cleanId.length > 10 || !/^[A-Z0-9]+$/.test(cleanId)) {
      return {
        isValid: false,
        error: language === 'bn'
          ? '⚠️ সঠিক নগদ TrxID দিন (সাধারণত ৮ অক্ষরের ইংরেজি বর্ণ ও সংখ্যার মিশ্রণ, যেমন: 71F8KL2M)'
          : '⚠️ Invalid Nagad TrxID format (8-10 alphanumeric characters required).'
      };
    }
  } else if (method === 'rocket') {
    if (cleanId.length < 8 || cleanId.length > 12 || !/^[A-Z0-9]+$/.test(cleanId)) {
      return {
        isValid: false,
        error: language === 'bn'
          ? '⚠️ সঠিক রকেট TrxID দিন (৮-১২ অক্ষরের সংখ্যা বা কোড, যেমন: 1029384756)'
          : '⚠️ Invalid Rocket TrxID format (8-12 digits or alphanumeric).'
      };
    }
  }

  // Anti-fake checks:
  // 1. Must have at least 3 distinct characters (rejects 00000000, 11111111, AAAAAAAA)
  const uniqueChars = new Set(cleanId.split(''));
  if (uniqueChars.size < 3) {
    return {
      isValid: false,
      error: language === 'bn'
        ? '⚠️ অগ্রহণযোগ্য বা ভুল TrxID! অনুগ্রহ করে বিকাশ/নগদ/রকেট অ্যাপের আসল TrxID দিন।'
        : '⚠️ Invalid or fake TrxID! Please enter the real TrxID from your SMS/app.'
    };
  }

  // 2. Reject obvious mock or sequential patterns
  const bannedKeywords = [
    '12345678', '87654321', '123456789', 'TESTTRXID', 'TESTID', 'FAKEID',
    'ASDFGHJK', 'QWERTYUI', 'ABCDEFGH', '00000000', '11111111'
  ];
  if (bannedKeywords.some(bad => cleanId.includes(bad))) {
    return {
      isValid: false,
      error: language === 'bn'
        ? '⚠️ ভুয়া বা ডামি TrxID শনাক্ত হয়েছে! অনুগ্রহ করে সঠিক পেমেন্টের TrxID প্রদান করুন।'
        : '⚠️ Fake/dummy TrxID detected! Please enter the genuine payment TrxID.'
    };
  }

  // 3. Duplicate check against existing ads in the database
  const isDuplicate = existingProducts.some(p => {
    const existingTrx = p.paymentInfo?.trxId?.trim()?.toUpperCase();
    return existingTrx && existingTrx === cleanId;
  });

  if (isDuplicate) {
    return {
      isValid: false,
      error: language === 'bn'
        ? '⚠️ এই ট্রানজেকশন আইডি (TrxID) ইতিপূর্বে অন্য একটি বিজ্ঞাপনে ব্যবহার করা হয়েছে! প্রতিটি পেমেন্টের জন্য নতুন TrxID আবশ্যক।'
        : '⚠️ This TrxID has already been used for another advertisement. A unique TrxID is required.'
    };
  }

  return { isValid: true };
}
