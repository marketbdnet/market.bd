import React from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  ShieldCheck, Lock, Eye, Database, Server, UserCheck, 
  Trash2, Mail, Phone, MapPin, FileCheck
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { language } = useMarket();

  return (
    <div id="privacy-policy-page" className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-3 border border-slate-800">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-500/30">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>MarketBD.Net • Official Policy</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black">
          {language === 'bn' ? 'গোপনীয়তা ও প্রাইভেসী পলিসি' : 'Privacy Policy & Data Protection'}
        </h1>

        <p className="text-xs text-slate-300 font-medium">
          {language === 'bn'
            ? 'সর্বশেষ হালনাগাদ: মার্চ ২০২৬ | MarketBD.Net এ আপনার তথ্যের গোপনীয়তা ও সুরক্ষা নিশ্চিত করার অঙ্গীকার'
            : 'Last Updated: March 2026 | Our commitment to protecting your personal data and privacy'}
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        {/* Section 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-black text-sm">
            <UserCheck className="w-5 h-5 text-indigo-500" />
            <span>{language === 'bn' ? '১. আমরা যেসব তথ্য সংগ্রহ করি' : '1. Information We Collect'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'MarketBD.Net প্ল্যাটফর্মে অ্যাকাউন্ট খোলা, বিজ্ঞাপন পোস্ট বা লেনদেন করার সময় আমরা নিচের প্রয়োজনীয় তথ্যগুলো সংগ্রহ করি:'
              : 'When you register, post ads, or interact on MarketBD.Net, we collect the following necessary information:'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>{language === 'bn' ? 'ব্যক্তিগত তথ্য:' : 'Personal Details:'}</strong> {language === 'bn' ? 'নাম, ইমেইল ঠিকানা, মোবাইল নম্বর এবং প্রোফাইল ছবি।' : 'Name, email address, mobile phone number, and optional avatar.'}</li>
            <li><strong>{language === 'bn' ? 'বিজ্ঞাপনের তথ্য:' : 'Listing Content:'}</strong> {language === 'bn' ? 'পণ্যের শিরোনাম, বিবরণ, ক্যাটাগরি, মূল্য, ছবি এবং বিক্রেতার জেলা ও থানা।' : 'Item titles, descriptions, categories, pricing, images, and district/thana location.'}</li>
            <li><strong>{language === 'bn' ? 'পেমেন্ট ও ভেরিফিকেশন তথ্য:' : 'Payment Verification:'}</strong> {language === 'bn' ? 'ম্যানুয়াল বা গেটওয়ে পেমেন্টের ক্ষেত্রে ট্রানজেকশন আইডি (TrxID), প্রেরক নম্বর এবং রসিদের অডিট রেকর্ড।' : 'Transaction IDs (TrxID), sender phone numbers, and audit receipts for payment verification.'}</li>
            <li><strong>{language === 'bn' ? 'প্রযুক্তিগত লগ:' : 'Technical Data:'}</strong> {language === 'bn' ? 'আইপি অ্যাড্রেস, ব্রাউজারের ধরণ, এবং সাইট ব্যবহারের টাইমস্ট্যাম্প (প্রতারণা প্রতিরোধে)।' : 'IP address, browser user-agent, and access timestamps for fraud protection.'}</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm">
            <Database className="w-5 h-5 text-emerald-500" />
            <span>{language === 'bn' ? '২. ডেটা স্টোরেজ ও নিরাপত্তা ব্যবস্থা' : '2. Data Storage & Security Standards'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'আপনার সকল সংবেদনশীল ডেটা বিশ্বমানের Google Cloud Firebase Firestore ডাটাবেসে সম্পূর্ণ এনক্রিপ্টেড (AES-256) অবস্থায় সংরক্ষিত থাকে। আমাদের অভ্যন্তরীণ সার্ভারে কঠোর রোল-বেসড এক্সেস কন্ট্রোল (RBAC) চালু রয়েছে, যার ফলে অননুমোদিত কোনো তৃতীয় পক্ষ আপনার ডেটা দেখার বা পরিবর্তনের সুযোগ পায় না।'
              : 'All user records are stored securely in Google Cloud Firebase Firestore databases with enterprise-grade AES-256 encryption. We enforce rigorous Role-Based Access Control (RBAC) ensuring unauthorized third parties cannot access or tamper with your information.'}
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-black text-sm">
            <Eye className="w-5 h-5 text-amber-500" />
            <span>{language === 'bn' ? '৩. উন্মুক্ত তথ্য ও ক্রেতা-বিক্রেতা যোগাযোগ' : '3. Public Information on Listings'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'আপনি যখন একটি বিজ্ঞাপন প্রকাশ করেন, তখন পণ্যের শিরোনাম, দাম, ছবি, বিবরণ এবং আপনার ফোন নম্বর সম্ভাব্য ক্রেতাদের যোগাযোগের সুবিধার্থে জনসম্মুখে প্রদর্শিত হয়। আপনি যদি চান আপনার নম্বর গোপন রাখতে, তবে আমাদের অ্যাপের বিল্ট-ইন নিরাপদ চ্যাট সিস্টেম ব্যবহার করতে পারেন।'
              : 'When you post a classified ad, the product details, images, price, and your contact phone number are displayed to facilitate buyer-seller communication. If you prefer to keep your phone number private, you can utilize our built-in encrypted in-app chat.'}
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-black text-sm">
            <Lock className="w-5 h-5 text-rose-500" />
            <span>{language === 'bn' ? '৪. কোনো ডেটা বিক্রি করা হয় না (No Data Selling)' : '4. We Never Sell Your Personal Data'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'MarketBD.Net কখনোই কোনো তৃতীয় পক্ষ, বিজ্ঞাপন সংস্থা বা স্প্যামারদের কাছে ব্যবহারকারীদের ব্যক্তিগত ফোন নম্বর বা ইমেইল বিক্রি বা ভাড়া দেয় না। আমরা কেবলমাত্র বাংলাদেশের প্রচলিত আইন ও আদালতের নির্দেশনা অনুযায়ী রাষ্ট্রীয় নিরাপত্তা সংস্থা বা সাইবার ক্রাইম বিভাগের ভেরিফিকেশন রিকোয়েস্টে আইনানুগ সহায়তা প্রদানে বাধ্য।'
              : 'MarketBD.Net strictly never sells, trades, or rents personal telephone numbers or email addresses to advertisers or data brokers. We only disclose information if mandated by Bangladeshi law enforcement or legal court orders in fraud investigations.'}
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-black text-sm">
            <Trash2 className="w-5 h-5 text-purple-500" />
            <span>{language === 'bn' ? '৫. ডেটা মুছে ফেলা ও অ্যাকাউন্ট ডিলিশনের অধিকার' : '5. Data Erasure & Right to Delete'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'যেকোনো ব্যবহারকারী তার পোস্টকৃত বিজ্ঞাপন যেকোনো সময় এডিট বা স্থায়ীভাবে ডিলিট করতে পারেন। এছাড়া আপনার অ্যাকাউন্ট ও সকল ডেটা সম্পূর্ণ মুছে ফেলতে চাইলে support@marketbd.net এ ইমেইল পাঠান অথবা ড্যাশবোর্ড থেকে রিকোয়েস্ট করুন। ২৪ ঘণ্টার মধ্যে আপনার সকল ডেটা ডাটাবেস থেকে পার্মানেন্টলি অপসারণ করা হবে।'
              : 'Users possess full rights to edit, update, or permanently delete their published ads. To delete your account and associated profile data completely, email support@marketbd.net or request via dashboard. Your data will be wiped within 24 hours.'}
          </p>
        </div>

        {/* Contact DPO */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            {language === 'bn' ? 'ডেটা প্রটেকশন অফিসার (DPO) এর সাথে যোগাযোগ' : 'Contact Our Data Protection Officer'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            ইমেইল: <a href="mailto:official.marketbd@gmail.com" className="font-bold text-indigo-500 hover:underline">official.marketbd@gmail.com</a> | হেল্পলাইন: +880 1723-230230 | ঠিকানা: লেভেল ৫, ফরচুন শপিং মল, ঢাকা-১০০০, বাংলাদেশ।
          </p>
        </div>
      </div>
    </div>
  );
};
