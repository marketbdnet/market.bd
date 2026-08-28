import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { ShieldCheck, Phone, Mail, MapPin, Smartphone, Award, HeartHandshake } from 'lucide-react';
import { PaymentPartnersWidget, PartnershipBadgeLogo } from '../Common/BrandLogos';

export const Footer: React.FC = () => {
  const { language, setFilters, setActiveTab, customLogoUrl, userRole, currentUser, systemNotice } = useMarket();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-center sm:text-left">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-800 text-sky-400 rounded-xl border border-slate-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? '১০০% ভেরিফাইড বিক্রেতা' : '100% Verified Sellers'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? 'নিরাপদ লেনদেন ও সেফটি নিশ্চিতকরণ' : 'Safe trade with identity verification'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-800 text-sky-400 rounded-xl border border-slate-700">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'সহজ লাইভ চ্যাট ও অফার' : 'Live Chat & Instant Offer'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? 'বিক্রেতার সাথে সরাসরি দামাদামি করুন' : 'Bargain & chat directly with seller'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-800 text-sky-400 rounded-xl border border-slate-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'প্রিমিয়াম এড প্রমোশন' : 'Premium Boost Options'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? 'জরুরি বিক্রি করতে ফিচার্ড ট্যাগ ব্যবহার করুন' : 'Sell 5x faster with Urgent & Featured ads'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-800 text-sky-400 rounded-xl border border-slate-700">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি' : 'Cash On Delivery Across BD'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? '৬৪টি জেলাতেই হোম ডেলিভারির সুবিধা' : 'Available in all 64 districts'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-11 w-11 sm:h-13 sm:w-13 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-full">
                <img
                  src={customLogoUrl || '/logo.jpg'}
                  alt="MarketBD.Net Logo"
                  className="w-full h-full object-cover shrink-0 rounded-full"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.jpg';
                  }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-black tracking-tight">
                  <span className="text-red-500">M</span><span className="text-white">arketBD.</span><span className="text-red-500">Net</span>
                </span>
                <span className="text-xs text-red-400 font-medium">
                  {language === 'bn' ? 'বিশ্বস্ত ক্রয়-বিক্রয় মাধ্যম' : 'Trusted Buy & Sell Marketplace'}
                </span>
              </div>
            </div>
            <p className="text-xs text-white font-bold mb-2">
              Buy Sell with trust
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-sm">
              {language === 'bn' ? (
                <><span className="bg-slate-950 text-white font-bold px-1.5 py-0.5 rounded border border-slate-800 text-[10px]"><span className="text-red-500 font-black">M</span>arketBD.<span className="text-red-500 font-black">Net</span></span> হলো বাংলাদেশের বৃহত্তম অল-ইন-ওয়ান ডিজিটাল মার্কেটপ্লেস। নতুন ও ব্যবহৃত পণ্য, রকমারি বই, বাইক, ফ্ল্যাট ও গাড়ি কেনাবেচার সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম।</>
              ) : (
                <><span className="bg-slate-950 text-white font-bold px-1.5 py-0.5 rounded border border-slate-800 text-[10px]"><span className="text-red-500 font-black">M</span>arketBD.<span className="text-red-500 font-black">Net</span></span> is Bangladesh's premier all-in-one digital marketplace. The most trusted destination for phones, laptops, books, vehicles, and properties.</>
              )}
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dhaka, Dhaka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${systemNotice?.contactPhone || '01533830784'}`} className="hover:text-white transition">
                  {systemNotice?.contactPhone || '01533830784'} (Helpline 24/7)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{systemNotice?.contactEmail || 'official.marketbd@gmail.com'}</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3">
              {language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি' : 'Top Categories'}
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                { id: 'mobiles', name: 'মোবাইল ও ট্যাবলেট' },
                { id: 'electronics', name: 'ল্যাপটপ ও পিসি' },
                { id: 'vehicles', name: 'ভিহিকল/কার' },
                { id: 'property', name: 'ফ্ল্যাট ও জমি' },
                { id: 'books', name: 'রকমারি বই' },
                { id: 'fashion', name: 'ফ্যাশন পণ্য' }
              ].map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: cat.id }));
                      setActiveTab('search');
                    }}
                    className="hover:text-sky-400 transition cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Divisions */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3">
              {language === 'bn' ? 'বিভাগ সমূহ' : 'Divisions'}
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {['ঢাকা বিভাগ', 'চট্টগ্রাম বিভাগ', 'সিলেট বিভাগ', 'রাজশাহী বিভাগ', 'খুলনা বিভাগ', 'বরিশাল বিভাগ'].map((div, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, division: div }));
                      setActiveTab('search');
                    }}
                    className="hover:text-sky-400 transition cursor-pointer"
                  >
                    📍 {div}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Safety */}
          <div>
            <h5 className="text-white font-bold text-sm mb-3">
              {language === 'bn' ? 'সাহায্য ও নিরাপত্তা' : 'Help & Safety'}
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-sky-400 transition cursor-pointer">
                  {language === 'bn' ? 'নিরাপদে কেনাবেচা করার নিয়ম' : 'Safety Tips'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-sky-400 transition cursor-pointer">
                  {language === 'bn' ? 'কীভাবে বিজ্ঞাপন দেবেন?' : 'How to Post Ads'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-sky-400 transition cursor-pointer">
                  {language === 'bn' ? 'ভেরিফাইড সেলার হওয়ার উপায়' : 'Become a Verified Seller'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-sky-400 transition cursor-pointer font-bold text-amber-400">
                  📜 {language === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-sky-400 transition cursor-pointer">
                  {language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
                </button>
              </li>
              {(userRole === 'admin' || currentUser?.role === 'admin') && (
                <li className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <span>👑 {language === 'bn' ? 'এডমিন প্যানেল (Admin Panel)' : 'Admin Panel Access'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bikroy.com-Style Comprehensive Safety & Selling Guidelines Section */}
        <div className="my-8 p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm border-b border-slate-800 pb-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>
              {language === 'bn'
                ? 'নিরাপদে কেনাবেচা করার গুরুত্বপূর্ণ নির্দেশাবলী (Safety Guidelines & Tips)'
                : 'Important Safety & Trading Guidelines'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h6 className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>
                  {language === 'bn' ? '🛡️ ১. ক্রেতাদের জন্য পরামর্শ:' : '🛡️ 1. Advice for Buyers:'}
                </span>
              </h6>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                {language === 'bn' ? (
                  <>
                    <li>পণ্য সরাসরি না দেখে বা নিজে না পরীক্ষা করে কখনোই আগাম বিকাশ/নগদে বুকিং মানি পাঠাবেন না।</li>
                    <li>পণ্য লেনদেনের সময় সবসময় জনাকীর্ণ এবং নিরাপদ প্রকাশ্য স্থানে দেখা করুন।</li>
                    <li>অরিজিনাল ইনভয়েস, ক্যাশ মেমো এবং ওয়ারেন্টি কার্ড ভালোভাবে মিলিয়ে টাকা পরিশোধ করুন।</li>
                  </>
                ) : (
                  <>
                    <li>Never send advance booking money via bKash/Nagad without inspecting the item in person.</li>
                    <li>Always meet in a safe, public, and well-lit crowded area for product exchange.</li>
                    <li>Check original cash memo, invoice, and warranty card thoroughly before making payment.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="space-y-2">
              <h6 className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>
                  {language === 'bn' ? '🚀 ২. বিক্রেতাদের দ্রুত বিক্রির উপায়:' : '🚀 2. Tips for Fast Selling:'}
                </span>
              </h6>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                {language === 'bn' ? (
                  <>
                    <li>ভালো আলোয় তোলা পরিষ্কার ৩-৪টি আসল ছবি আপলোড করুন।</li>
                    <li>পণ্যের সঠিক কন্ডিশন ও বিস্তারিত তথ্য লিখুন যেন ক্রেতা সহজেই সিদ্ধান্ত নিতে পারেন।</li>
                    <li>১০ গুণ দ্রুত সাড়া পেতে ⚡ "জরুরি বিক্রি" বা ⭐ "ফিচার্ড" প্রমোশন বুস্ট ব্যবহার করুন।</li>
                    <li>ফ্রিতে পোস্টের ৭ দিন পর টপ ক্যাটাগরি প্রমোশন মেসেজ যাবে এবং সকল বিজ্ঞাপন ৩ মাস পর অটো রিমুভ হবে।</li>
                  </>
                ) : (
                  <>
                    <li>Upload 3-4 clear, real photos taken in good lighting.</li>
                    <li>Provide accurate product condition and details so buyers can decide easily.</li>
                    <li>Use ⚡ "Urgent Sale" or ⭐ "Featured" promotions for 10x faster buyer calls.</li>
                  </>
                )}
              </ul>
            </div>

            {(userRole === 'admin' || currentUser?.role === 'admin') && (
              <div className="space-y-2">
                <h6 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>
                    {language === 'bn' ? '👑 ৩. এডমিন প্যানেল এক্সেস গাইড:' : '👑 3. Admin Panel Access Guide:'}
                  </span>
                </h6>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  {language === 'bn' ? (
                    <>
                      <p><strong className="text-pink-400">এডমিন এড্রেস:</strong> নেভবার বা ফুটারে "এডমিন প্যানেল" বাটনে ক্লিক করুন।</p>
                      <p><strong className="text-pink-400">লগইন আইডি / পাসওয়ার্ড:</strong> official.marketsbd@gmail.com (বা 01634025151) / Ai01634025151</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">এডমিন থেকে ওয়েবসাইট লোগো, পেমেন্ট নম্বর ও বিজ্ঞাপন মডারেশন নিয়ন্ত্রণ করা যায়।</p>
                    </>
                  ) : (
                    <>
                      <p><strong className="text-pink-400">Admin URL:</strong> Click the "Admin Panel" button in the navbar or footer.</p>
                      <p><strong className="text-pink-400">Login / Password:</strong> official.marketsbd@gmail.com (or 01634025151) / Ai01634025151</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">Control site logo, payment numbers, and ad moderations from Admin Panel.</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Partners Section */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <PaymentPartnersWidget />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <p>© 2026 <span className="font-extrabold"><span className="text-red-500">M</span><span className="text-white">arketBD.</span><span className="text-red-500">Net</span></span>. All Rights Reserved. (বাংলাদেশের বৃহত্তম মার্কেটপ্লেস)</p>
            <p className="text-[10px] text-slate-500">
              Verified & Secured by SSLCOMMERZ Gateway Technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
