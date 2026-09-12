import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  Building2, Phone, Mail, MapPin, Clock, ShieldCheck, 
  Send, CheckCircle2, MessageSquare, Headphones, Award, Globe, 
  Users, Check, ExternalLink
} from 'lucide-react';

export const AboutContactPage: React.FC = () => {
  const { language, setActiveTab } = useMarket();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
    }, 4000);
  };

  return (
    <div id="about-contact-page" className="max-w-6xl mx-auto py-8 px-4 space-y-10 text-slate-900 dark:text-slate-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/30">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>MarketBD.Net • Official Portal</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {language === 'bn' ? (
              <>আমাদের পরিচয় ও <span className="text-emerald-400">যোগাযোগ মাধ্যম</span></>
            ) : (
              <>About MarketBD.Net & <span className="text-emerald-400">Contact Us</span></>
            )}
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'MarketBD.Net বাংলাদেশের সবচেয়ে দ্রুত বর্ধনশীল এবং নিরাপদ অনলাইন মার্কেটপ্লেস। আমাদের লক্ষ্য দেশের ৬৪ জেলার প্রত্যন্ত অঞ্চল থেকে শুরু করে বিভাগীয় শহর পর্যন্ত মানুষের নতুন ও সেকেন্ড-হ্যান্ড পণ্য ক্রয়-বিক্রয়কে সহজ, প্রতারণামুক্ত ও নির্ভরযোগ্য করে তোলা।'
              : "MarketBD.Net is Bangladesh's premier trusted classifieds and multi-vendor marketplace connecting millions of buyers and sellers across 64 districts with verified security and fast local support."}
          </p>
        </div>
      </div>

      {/* Official Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Phone */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-500 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'অফিশিয়াল ফোন ও হোয়াটসঅ্যাপ' : 'Official Hotline & WhatsApp'}
            </h3>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">
              +880 1723-230230
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              +880 1634-025151 (Helpdesk)
            </p>
          </div>
          <a
            href="tel:+8801723230230"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
          >
            <span>{language === 'bn' ? 'সরাসরি কল করুন' : 'Call Now'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 2: Email */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-sky-500 transition">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'অফিশিয়াল ইমেইল' : 'Official Email Address'}
            </h3>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1 break-all">
              official.marketbd@gmail.com
            </p>
            <p className="text-xs text-slate-500 mt-0.5 break-all">
              support@marketbd.net
            </p>
          </div>
          <a
            href="mailto:official.marketbd@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline pt-1"
          >
            <span>{language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 3: Address */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-amber-500 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'প্রধান কার্যালয়ের ঠিকানা' : 'Headquarters Address'}
            </h3>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-relaxed">
              Level 5, Fortune Shopping Mall, Malibagh / Motijheel Commercial Area, Dhaka-1000, Bangladesh
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'bn' ? 'বাংলাদেশ ডাকবিভাগ নিবন্ধিত' : 'Postal Code: Dhaka-1000'}
          </p>
        </div>

        {/* Card 4: Operating Hours */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-purple-500 transition">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'অফিস ও সাপোর্ট সময়' : 'Working Hours'}
            </h3>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? 'সকাল ৯:০০ - রাত ১০:০০' : '09:00 AM - 10:00 PM BST'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn' ? 'শনিবার - শুক্রবার (সপ্তাহের ৭ দিন)' : 'Saturday - Friday (7 Days)'}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{language === 'bn' ? 'সাপোর্ট টিম এখন সক্রিয়' : 'Live Support Active'}</span>
          </div>
        </div>
      </div>

      {/* About MarketBD Mission & Core Values */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'MarketBD.Net এর মূল লক্ষ্য ও বৈশিষ্ট্য' : 'Our Mission & Commitment'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'সততা, স্বচ্ছতা এবং নির্ভরযোগ্য কেনাবেচার পরিবেশ' : 'Honesty, Transparency & Safe Digital Trading in BD'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'bn' ? '১. ভেরিফাইড সেলার নেটওয়ার্ক' : '1. Verified Seller Network'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'প্রতিটি বিক্রেতার ফোন নম্বর এবং ব্যবসায়িক প্রতিষ্ঠানের অবস্থান নিশ্চিত করতে আমরা একাধিক ধাপের ভেরিফিকেশন ব্যবহার করি।'
                  : 'We verify phone numbers, business shops and identity credentials to protect consumers.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-600 dark:text-amber-400 text-sm">
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? '২. জিরো স্ক্যাম টলারেন্স' : '2. Zero Scam Tolerance'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'প্রতারণামূলক যেকোনো বিজ্ঞাপন এবং অসৎ কার্যক্রম রোধে আমাদের এডমিন টিম তাৎক্ষণিকভাবে ফ্ল্যাগড বিজ্ঞাপন বাতিল ও ব্যান করে থাকে।'
                  : 'Any fraudulent ad or reported scammer is banned immediately with active law enforcement cooperation.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-sky-600 dark:text-sky-400 text-sm">
                <Globe className="w-4 h-4" />
                <span>{language === 'bn' ? '৩. ৬৪ জেলায় সেবা' : '3. Nationwide 64 Districts'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী, খুলনা, বরিশাল, রংপুর বা ময়মনসিংহের যেকোনো প্রান্ত থেকে সহজেই আপনার কাছাকাছি পণ্য খুঁজুন।'
                  : 'Geo-targeted location search allows finding products locally in your specific thana and district.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-purple-600 dark:text-purple-400 text-sm">
                <Headphones className="w-4 h-4" />
                <span>{language === 'bn' ? '৪. দ্রুত কাস্টমার কেয়ার' : '4. Dedicated Customer Care'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'যেকোনো জিজ্ঞাসা, পেমেন্ট সংক্রান্ত সহায়তা কিংবা টেকনিক্যাল সমস্যার জন্য সপ্তাহে ৭ দিন আমাদের হেল্পডেস্কে যোগাযোগ করতে পারেন।'
                  : 'Get quick assistance via direct WhatsApp hotline, phone or our in-app chat center.'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <span>{language === 'bn' ? 'আমাদের বার্তা পাঠান' : 'Send us a Message'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'আপনার কোনো প্রশ্ন বা পরামর্শ থাকলে নিচের ফর্মে লিখুন। আমরা খুব দ্রুত উত্তর দেব।'
              : 'Have any question, feedback or partnership proposal? Drop us a note.'}
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
                {language === 'bn' ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {language === 'bn' ? 'আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।' : 'Our support team will get back to you shortly.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'বার্তার বিষয়' : 'Subject'}
                </label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="general">সাধারণ জিজ্ঞাসা (General Inquiry)</option>
                  <option value="report">বিজ্ঞাপন বা সেলার রিপোর্ট (Report Scam / Abuse)</option>
                  <option value="payment">পেমেন্ট বা বুস্টিং সহায়তা (Payment & Verification)</option>
                  <option value="partnership">ব্যবসায়িক পার্টনারশিপ (Business Collaboration)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'আপনার বার্তা' : 'Your Message'} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder={language === 'bn' ? 'বিস্তারিত এখানে লিখুন...' : 'Write your detailed message here...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'bn' ? 'বার্তা পাঠান' : 'Submit Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
