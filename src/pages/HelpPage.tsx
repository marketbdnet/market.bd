import React from 'react';
import { useMarket } from '../context/MarketContext';
import { ShieldCheck, HelpCircle, FileText, CheckCircle2, Database, BellRing, CalendarX, AlertOctagon, Lock } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const { language } = useMarket();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 text-slate-900 dark:text-slate-100">
      <div className="bg-gradient-to-r from-pink-800 via-rose-700 to-pink-900 text-white p-8 rounded-3xl shadow-xl text-center space-y-2 relative">
        <HelpCircle className="w-12 h-12 mx-auto text-yellow-300 animate-bounce" />
        <h1 className="text-2xl font-black">
          {language === 'bn' ? (
            <><span className="text-red-500 font-black">M</span><span className="text-white font-black">arketBD.</span><span className="text-red-500 font-black">Net</span> হেল্প সেন্টার ও ব্যবহারের শর্তাবলী</>
          ) : (
            <><span className="text-red-500 font-black">M</span><span className="text-white font-black">arketBD.</span><span className="text-red-500 font-black">Net</span> Help Center & Terms of Service</>
          )}
        </h1>
        <p className="text-xs text-red-200 font-bold max-w-lg mx-auto">
          {language === 'bn' ? 'বাংলাদেশে নিরাপদে ব্যবহৃত জিনিসপত্র কেনাবেচার গাইডলাইন ও শর্তাবলী' : 'Official Guidelines & Terms of Service for Trading across Bangladesh'}
        </p>
      </div>

      {/* Safety & Selling Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-base">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>{language === 'bn' ? 'নিরাপদে কেনার নিয়ম' : 'Safe Buyer Tips'}</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>{language === 'bn' ? 'পণ্য সরাসরি বিক্রেতার সাথে দেখা করে পরীক্ষা করুন।' : 'Always inspect the product physically before making payment.'}</li>
            <li>{language === 'bn' ? 'কখনোই বিকাশ/নগদে অ্যাডভান্স বা অগ্রিম টাকা পাঠাবেন না।' : 'Never send advance bkash/nagad money before seeing the item.'}</li>
            <li>{language === 'bn' ? 'জনবহুল শপিং মল বা প্রকাশ্যে দেখা করুন।' : 'Meet in public places like shopping centers.'}</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-base">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <span>{language === 'bn' ? 'দ্রুত বিক্রি করার নিয়ম' : 'Fast Seller Tips'}</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>{language === 'bn' ? 'পরিষ্কার ও স্পষ্ট ছবি আপলোড করুন।' : 'Upload clear, original photos from multiple angles.'}</li>
            <li>{language === 'bn' ? 'প্রোডাক্টের সঠিক বর্ণনা ও কন্ডিশন উল্লেখ করুন।' : 'Provide honest description of condition and warranty.'}</li>
            <li>{language === 'bn' ? 'জরুরি বিক্রি করতে Urgent বা Featured প্রমোশন ব্যবহার করুন।' : 'Use Urgent or Featured ad boost for 5x faster sales.'}</li>
          </ul>
        </div>
      </div>

      {/* OFFICIAL TERMS AND CONDITIONS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-500/80 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'অফিশিয়াল ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Official Terms & Conditions'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {language === 'bn' ? 'MarketBD.Net মার্কেটপ্লেসে বিজ্ঞাপন পোস্ট করার নিয়মাবলী ও পলিসি' : 'Policy rules and conditions for posting ads on MarketBD.Net'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rule 1: Where Ads are Stored */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>{language === 'bn' ? '১. ডাটাবেস ও স্টোরেজ' : '1. Data Storage'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {language === 'bn'
                ? 'আপনার পোস্টকৃত সকল বিজ্ঞাপন, ছবি, সেলারের নাম ও ফোন নম্বর Google Firebase Cloud Firestore ক্লাউড ডাটাবেসে অত্যন্ত নিরাপদে সংরক্ষিত থাকে।'
                : 'All posted ads, images, descriptions, seller details & contact numbers are stored securely in Google Firebase Cloud Firestore database.'}
            </p>
          </div>

          {/* Rule 2: 7-Day Promotion Notification */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
              <BellRing className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? '২. ৭ দিন পর বুস্টিং নোটিফিকেশন' : '2. 7-Day Upgrade Alert'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {language === 'bn'
                ? 'একটি বিজ্ঞাপন ফ্রিতে পোস্ট করার ৭ (সাত) দিন অতিক্রম করলে পেমেন্টের মাধ্যমে পণ্যটি দ্রুত বিক্রি করতে ফ্লাশ সেল বা টপ ক্যাটাগরিতে বুস্ট করার নোটিফিকেশন মেসেজ বিজ্ঞাপনদাতার নিকট স্বয়ংক্রিয়ভাবে পাঠানো হবে।'
                : 'After posting a free ad, 7 days later an automated message/notification will be sent to the seller offering paid Promotion (Top Ad / Flash Sale) to boost sales.'}
            </p>
          </div>

          {/* Rule 3: 3-Month Automatic Ad Removal */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider">
              <CalendarX className="w-4 h-4 text-rose-500" />
              <span>{language === 'bn' ? '৩. ৩ মাস পর স্বয়ংক্রিয় ডিলিট' : '3. 3-Month Auto Removal'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {language === 'bn'
                ? 'পেমেন্টকৃত হোক কিংবা ফ্রি - সকল বিজ্ঞাপন পোস্ট করার ৩ (তিন) মাস (৯০ দিন) পর মার্কেটপ্লেসের সার্বিক মান বজায় রাখতে ওয়েবসাইট হতে স্বয়ংক্রিয়ভাবে মুছে (Auto Expire & Remove) ফেলা হবে।'
                : 'Whether paid or free, all ads are automatically expired and permanently removed from the website after 3 months (90 days) from the posting date.'}
            </p>
          </div>
        </div>

        {/* Additional Prohibited Items & Safety Notice */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200 font-medium">
          <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-amber-600 dark:text-amber-400 uppercase text-[11px] tracking-wider block">
              {language === 'bn' ? 'আইনগত দায়বদ্ধতা ও নিয়ম নীতি' : 'Legal Compliance & Marketplace Rules'}
            </span>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'অবৈধ, চোরাই, জালিয়াত, নকল বা সরকারি আইনে নিষিদ্ধ কোনো পণ্যের বিজ্ঞাপন দেওয়া আইনত দণ্ডনীয় অপরাধ। MarketBD.Net কর্তৃপক্ষ যেকোনো সন্দেহজনক বা ভুয়া বিজ্ঞাপন পূর্ব কোনো নোটিশ প্রদান ছাড়াই তাৎক্ষণিক মুছে ফেলার এবং অ্যাকাউন্ট স্থগিত করার ক্ষমতা সংরক্ষণ করে।'
                : 'Posting stolen, illegal, counterfeit, or prohibited items is strictly forbidden. MarketBD.Net reserves the right to terminate accounts and delete fraudulent ads immediately.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1.5 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            {language === 'bn' ? 'Google Firebase Secured Infrastructure' : 'Google Firebase Secured Infrastructure'}
          </span>
          <span className="font-mono text-[10px]">
            {language === 'bn' ? 'সর্বশেষ সংস্করণ: আগস্ট ২০২৬' : 'Last Updated: August 2026'}
          </span>
        </div>
      </div>
    </div>
  );
};

