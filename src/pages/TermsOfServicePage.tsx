import React from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  FileText, ShieldAlert, CheckCircle2, AlertTriangle, 
  Ban, Scale, RefreshCw, CalendarX, Lock
} from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  const { language } = useMarket();

  return (
    <div id="terms-of-service-page" className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-3 border border-slate-800">
        <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-rose-500/30">
          <FileText className="w-4 h-4 text-rose-400" />
          <span>MarketBD.Net • Official Terms</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black">
          {language === 'bn' ? 'ব্যবহারের সাধারণ শর্তাবলী (Terms of Service)' : 'Terms of Service & Marketplace Rules'}
        </h1>

        <p className="text-xs text-slate-300 font-medium">
          {language === 'bn'
            ? 'কার্যকর তারিখ: মার্চ ২০২৬ | MarketBD.Net প্ল্যাটফর্ম ব্যবহারকারী সকল ক্রেতা ও বিক্রেতার জন্য প্রযোজ্য'
            : 'Effective Date: March 2026 | Governing all users, buyers, and advertisers on MarketBD.Net'}
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        {/* Section 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-black text-sm">
            <Scale className="w-5 h-5 text-rose-500" />
            <span>{language === 'bn' ? '১. শর্তাবলীতে সম্মতি ও ভূমিকা' : '1. Acceptance of Terms & Agreement'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'MarketBD.Net ওয়েবসাইট বা মোবাইল অ্যাপ্লিকেশন ব্যবহার করে ব্রাউজ করা, বিজ্ঞাপন পোস্ট করা বা কেনাবেচা সম্পন্ন করার মাধ্যমে আপনি এই শর্তাবলী সম্পূর্ণভাবে মেনে নিতে সম্মত হয়েছেন। আপনি যদি এই শর্তাবলীর কোনো অংশে একমত না হন, তবে দয়া করে সাইটটি ব্যবহার থেকে বিরত থাকুন।'
              : 'By browsing, registering, posting classified listings, or transacting on MarketBD.Net, you agree to be legally bound by these Terms of Service. If you disagree with any part of these terms, please do not use the website or mobile application.'}
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{language === 'bn' ? '২. বিজ্ঞাপন পোস্ট ও সঠিক তথ্যের নিশ্চয়তা' : '2. Posting Rules & Accurate Representations'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'বিজ্ঞাপনদাতা হিসেবে আপনি নিশ্চিত করছেন যে আপনার পোস্টকৃত পণ্যের ছবি, বিবরণ, দাম এবং ওয়ারেন্টি সংক্রান্ত তথ্য ১০০% সত্য ও নির্ভুল। পণ্যের কোনো ত্রুটি থাকলে তা বিবরণে স্পষ্টভাবে উল্লেখ করতে হবে।'
              : 'As a seller, you warrant that all product titles, photos, descriptions, pricing, and warranty terms are accurate and truthful. Any defect or cosmetic flaw must be clearly disclosed in the ad description.'}
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-black text-sm">
            <Ban className="w-5 h-5 text-red-500" />
            <span>{language === 'bn' ? '৩. কঠোরভাবে নিষিদ্ধ পণ্য ও সেবাসমূহ' : '3. Strictly Prohibited Items & Activities'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'MarketBD.Net এ নিচের পণ্যগুলো বিজ্ঞাপন দেওয়া আইনত ও নীতিগতভাবে সম্পূর্ণ নিষিদ্ধ:'
              : 'The following items and listings are strictly forbidden on MarketBD.Net:'}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>{language === 'bn' ? 'অস্ত্র, গোলাবারুদ, বিস্ফোরক ও সামরিক সরঞ্জাম।' : 'Firearms, ammunition, fireworks, and military equipment.'}</li>
            <li>{language === 'bn' ? 'মাদকদ্রব্য, অবৈধ ওষুধ ও চিকিৎসকের প্রেসক্রিপশন ছাড়া নিষিদ্ধ কেমিক্যাল।' : 'Narcotics, banned drugs, and non-prescribed pharmaceuticals.'}</li>
            <li>{language === 'bn' ? 'চুরি করা বা ছিনতাইকৃত যেকোনো পণ্য ও চোরাচালানের সামগ্রী।' : 'Stolen, hijacked, or contraband merchandise.'}</li>
            <li>{language === 'bn' ? 'নকল বা কপিরাইট লঙ্ঘনকারী পাইরেটেড সফটওয়্যার ও জাল দলিল।' : 'Counterfeit goods, pirated software, and fraudulent identification documents.'}</li>
            <li>{language === 'bn' ? 'পঞ্জি স্কিম, এমএলএম (MLM) বা অবাস্তব অর্থ উপার্জনের লোভনীয় বিজ্ঞাপন।' : 'Ponzi schemes, pyramid MLM models, or deceptive financial scams.'}</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-black text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>{language === 'bn' ? '৪. লেনদেন ও দায়মুক্তি (Liability Disclaimer)' : '4. Peer-to-Peer Disclaimer & Limitation of Liability'}</span>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-medium">
            {language === 'bn'
              ? 'সতর্কতা: MarketBD.Net মূলত একটি মধ্যস্থতাকারী ক্লাসিফায়েড মার্কেটপ্লেস। ক্রেতা এবং বিক্রেতার মধ্যকার আর্থিক লেনদেন, পণ্য হস্তান্তর বা ডেলিভারির কোনো ক্ষতির জন্য MarketBD.Net কর্তৃপক্ষ কোনোভাবেই দায়ী থাকবে না। আমরা সবসময় পণ্য সামনাসামনি দেখে যাচাই করে এবং বিকাশ/নগদে কোনো অগ্রিম টাকা না দিয়ে সরাসরি লেনদেনের পরামর্শ দিই।'
              : 'Disclaimer: MarketBD.Net operates solely as an online venue connecting buyers and sellers. MarketBD.Net holds zero legal or financial liability for peer-to-peer monetary transfers, fraudulent delivery, or damages. Buyers must physically inspect items in safe public spaces prior to exchanging cash.'}
          </div>
        </div>

        {/* Section 5 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-black text-sm">
            <CalendarX className="w-5 h-5 text-indigo-500" />
            <span>{language === 'bn' ? '৫. ৩ মাস পর বিজ্ঞাপন অপসারণ ও বুস্টিং নিয়মাবলী' : '5. 3-Month Auto-Archival & Boosting Terms'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'মার্কেটপ্লেসে ডেটার সতেজতা ও নির্ভুলতা বজায় রাখতে পোস্ট করার ৯০ দিন (৩ মাস) পর বিক্রিত বা নিষ্ক্রিয় বিজ্ঞাপনগুলো স্বয়ংক্রিয়ভাবে ডাটাবেস থেকে মুছে ফেলা বা আর্কাইভ করা হয়। এছাড়া বিনামূল্যে বিজ্ঞাপন পোস্টের ৭ দিন পর পণ্য দ্রুত বিক্রির স্বার্থে অপশনাল প্রমোশন বা বুস্ট করার সুবিধা দেওয়া হয়।'
              : 'To ensure marketplace catalog freshness, listings are automatically archived or purged after 90 days (3 months). Advertisers also receive optional 7-day boost notifications to highlight listings for accelerated sales.'}
          </p>
        </div>

        {/* Section 6 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-black text-sm">
            <ShieldAlert className="w-5 h-5 text-purple-500" />
            <span>{language === 'bn' ? '৬. প্রতারণা প্রতিরোধ, ফ্ল্যাগ ও অ্যাকাউন্ট বাতিল' : '6. Fraud Reporting & Account Termination'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'প্রতিটি বিজ্ঞাপনে "Report this ad" বাটন রয়েছে। কোনো বিজ্ঞাপনের বিরুদ্ধে প্রতারণার অভিযোগ এলে এডমিন টিম তৎক্ষণাৎ তা স্থগিত করে তদন্ত করবে। প্রমাণিত প্রতারকদের অ্যাকাউন্ট ও ফোন নম্বর আজীবনের জন্য কালো তালিকাভুক্ত (Blacklist) করা হবে এবং প্রয়োজনে দেশের সাইবার ক্রাইম ইউনিটে রিপোর্ট করা হবে।'
              : 'Every ad includes a dedicated "Report this ad" flag button. Suspected fraudulent posts are suspended immediately for manual admin audit. Confirmed scammers will be permanently blacklisted and reported to relevant cyber law enforcement authorities.'}
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            {language === 'bn' ? 'আইনি এখতিয়ার (Governing Law)' : 'Governing Law'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'bn'
              ? 'এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত সাইবার নিরাপত্তা আইন এবং ভোক্তা অধিকার সংরক্ষণ আইনের আওতায় পরিচালিত ও ব্যাখ্যা করা হবে। যেকোনো বিরোধের ক্ষেত্রে ঢাকার আদালতের এখতিয়ার চূড়ান্ত হিসেবে গণ্য হবে।'
              : 'These Terms of Service are governed by and construed in accordance with the laws of the People\'s Republic of Bangladesh. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.'}
          </p>
        </div>
      </div>
    </div>
  );
};
