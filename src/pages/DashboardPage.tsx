import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { getRemainingAutoApproveTime } from '../utils/autoApprovalTimer';
import { ProductCard } from '../components/Product/ProductCard';
import {
  User,
  Package,
  Heart,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  Settings,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Lock,
  ArrowLeft,
  Edit3,
  Check
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    language,
    currentUser,
    products,
    wishlist,
    notifications,
    markNotificationRead,
    setActiveTab,
    updateProductStatus,
    openDeleteModal,
    setEditingAd,
    goBack,
    renewAd
  } = useMarket();

  const [dashboardTab, setDashboardTab] = useState<'my-ads' | 'wishlist' | 'notifs' | 'verification'>('my-ads');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'sold' | 'expired'>('all');

  // Filter user's products comprehensively
  const myAds = (products || []).filter(p => {
    if (!p) return false;
    if (!currentUser) {
      return (
        p.seller?.id === 'user-me' ||
        (p.seller?.name && p.seller.name.includes('Rahim Tech')) ||
        p.seller?.email === 'official.marketbd@gmail.com' ||
        p.seller?.phone === '01634025151' ||
        p.seller?.phone === '+8801634025151'
      );
    }
    return (
      (currentUser.id && p.seller?.id === currentUser.id) ||
      (currentUser.email && p.seller?.email && p.seller.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser.phone && p.seller?.phone === currentUser.phone) ||
      (currentUser.id && p.sellerId === currentUser.id) ||
      p.seller?.id === 'user-me' ||
      (currentUser.email === 'official.marketbd@gmail.com' && (p.seller?.id === 'user-me' || (p.seller?.name && p.seller.name.includes('Rahim Tech'))))
    );
  });

  const filteredMyAds = myAds.filter(ad => {
    if (statusFilter === 'all') return true;
    return ad.status === statusFilter;
  });

  const wishlistProducts = (products || []).filter(p => p && (wishlist || []).includes(p.id));

  return (
    <div className="py-6 space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-pink-800 via-rose-700 to-pink-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-yellow-400 shadow shrink-0"
          />
          <div>
            <h2 className="text-xl font-bold flex items-center gap-1.5">
              <span>official.marketbd@gmail.com</span>
              <CheckCircle2 className="w-5 h-5 text-yellow-300" />
            </h2>
            <p className="text-xs text-emerald-200">
              📱 {currentUser?.phone || '01723230230'} • 📍 Dhaka, Dhaka • {language === 'bn' ? 'সদস্য হয়ে আছেন: ২০২১ থেকে' : 'Member since 2021'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-yellow-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded">
                Gold Verified Seller
              </span>
              <span className="text-xs text-emerald-100 font-semibold">★ 4.9 (42 reviews)</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('post-ad')}
          className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black px-5 py-3 rounded-2xl shadow transition text-xs flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন বিজ্ঞাপন পোস্ট করুন' : 'Post New Ad'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setDashboardTab('my-ads')}
          className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
            dashboardTab === 'my-ads' ? 'bg-emerald-700 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{language === 'bn' ? 'আমার বিজ্ঞাপনসমূহ' : 'My Listings'} ({myAds.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('wishlist')}
          className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
            dashboardTab === 'wishlist' ? 'bg-emerald-700 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{language === 'bn' ? 'সেভ করা উইশলিস্ট' : 'Saved Wishlist'} ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('notifs')}
          className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
            dashboardTab === 'notifs' ? 'bg-emerald-700 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{language === 'bn' ? 'নোটিফিকেশনস' : 'Notifications'} ({notifications.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('verification')}
          className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
            dashboardTab === 'verification' ? 'bg-emerald-700 text-white shadow' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'bn' ? 'সেলার ভেরিফিকেশন' : 'Seller Verification'}</span>
        </button>
      </div>

      {/* Tab Content */}
      {dashboardTab === 'my-ads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span>{language === 'bn' ? 'আপনার পোস্ট করা বিজ্ঞাপনসমূহ' : 'Your Posted Ads'}</span>
                <span className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2.5 py-0.5 rounded-full font-bold">
                  {myAds.length} {language === 'bn' ? 'টি' : 'total'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'এখানে আপনার সকল বিজ্ঞাপনের তথ্য দেখতে, এডিট করতে এবং রিমুভ করতে পারবেন।' : 'Manage, edit and remove your classified ads directly.'}
              </p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              {[
                { id: 'all', labelBn: 'সকল', labelEn: 'All' },
                { id: 'active', labelBn: 'অনুমোদিত / লাইভ', labelEn: 'Active' },
                { id: 'pending', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
                { id: 'rejected', labelBn: 'রিজেক্টেড', labelEn: 'Rejected' },
                { id: 'sold', labelBn: 'সোলেড', labelEn: 'Sold' },
                { id: 'expired', labelBn: 'মেয়াদোত্তীর্ণ', labelEn: 'Expired' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {language === 'bn' ? f.labelBn : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          {filteredMyAds.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 space-y-3">
              <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'এই ক্যাটাগরিতে আপনার কোনো বিজ্ঞাপন পাওয়া যায়নি।' : 'No ads found in this status category.'}
              </p>
              <button
                onClick={() => {
                  setEditingAd(null);
                  setActiveTab('post-ad');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন বিজ্ঞাপন পোস্ট করুন' : 'Post New Ad'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyAds.map(ad => (
                <div key={ad.id} className="relative bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    {/* Status Banner Badge */}
                    <div className="flex items-center justify-between text-xs font-black pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}
                      </span>
                      {ad.status === 'pending' && (() => {
                        const timer = getRemainingAutoApproveTime(ad.postedAt, 30);
                        return (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>{language === 'bn' ? 'অপেক্ষমাণ (Under Review)' : 'Under Review'}</span>
                            </span>
                            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              ⏱️ {language === 'bn' ? `অটো-এপ্রুভ বাকি: ${timer.formattedBn}` : `Auto: ${timer.formatted}`}
                            </span>
                          </div>
                        );
                      })()}
                      {ad.status === 'rejected' && (
                        <span className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-red-300 dark:border-red-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span>{language === 'bn' ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</span>
                        </span>
                      )}
                      {ad.status === 'active' && (
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'bn' ? 'অনুমোদিত (Live Active)' : 'Active Live'}</span>
                        </span>
                      )}
                      {ad.status === 'expired' && (
                        <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{language === 'bn' ? 'মেয়াদোত্তীর্ণ (Expired)' : 'Expired'}</span>
                        </span>
                      )}
                      {ad.status === 'sold' && (
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {language === 'bn' ? 'সোলেড (Sold)' : 'Sold Out'}
                        </span>
                      )}
                    </div>

                    {ad.status === 'rejected' && ad.rejectionReason && (
                      <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 space-y-1">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider block text-red-700 dark:text-red-400">
                          {language === 'bn' ? '⚠️ সংশোধন প্রয়োজন (এডমিন নোটিশ):' : '⚠️ Action Required (Admin Note):'}
                        </span>
                        <p className="font-semibold leading-snug">{ad.rejectionReason}</p>
                      </div>
                    )}

                    <div className="mt-2">
                      <ProductCard product={ad} />
                    </div>
                  </div>

                  {/* Actions Section: Edit, Mark Sold, Delete, Renew */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {/* Primary Row: Edit & Status Toggle */}
                    <div className="flex items-center gap-2">
                      {/* ✏️ Edit Ad Button */}
                      <button
                        onClick={() => {
                          setEditingAd(ad);
                          setActiveTab('post-ad');
                        }}
                        className="flex-1 py-2 px-3 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/80 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        title={language === 'bn' ? 'বিজ্ঞাপনের তথ্য পরিবর্তন/ইডিট করুন' : 'Edit Ad Details'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ইডিট করুন' : 'Edit Ad'}</span>
                      </button>

                      {/* Status / Sold Toggle */}
                      {ad.status !== 'expired' && (
                        <button
                          onClick={() => updateProductStatus(ad.id, ad.status === 'sold' ? 'active' : 'sold')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                            ad.status === 'sold'
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{ad.status === 'sold' ? (language === 'bn' ? 'সক্রিয় করুন' : 'Activate') : (language === 'bn' ? 'সোলেড' : 'Sold')}</span>
                        </button>
                      )}

                      {/* 🗑️ Remove / Delete Ad Button */}
                      <button
                        onClick={() => openDeleteModal(ad)}
                        className="py-2 px-3 bg-red-50 dark:bg-red-950/80 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition border border-red-200 dark:border-red-800 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        title={language === 'bn' ? 'বিজ্ঞাপনটি রিমুভ / মুছে ফেলুন' : 'Remove this ad'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    </div>

                    {/* Secondary Row if expired */}
                    {ad.status === 'expired' && (
                      <button
                        onClick={() => {
                          renewAd(ad.id);
                          alert(language === 'bn' ? '✓ বিজ্ঞাপনটি ১-ক্লিকে আবার ৩০ দিনের জন্য রিনিউ সম্পন্ন হয়েছে!' : '✓ Ad successfully renewed for 30 days!');
                        }}
                        className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'বিজ্ঞাপন নবায়ন করুন (Renew 30 Days)' : 'Renew Ad (30 Days)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dashboardTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">
            {language === 'bn' ? 'পছন্দের সেভ করা আইটেমসমূহ' : 'Your Saved Items'}
          </h3>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 text-gray-400">
              <p className="text-xs">
                {language === 'bn' ? 'উইশলিস্টে কোনো আইটেম যোগ করা হয়নি।' : 'Your wishlist is empty.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      )}

      {dashboardTab === 'notifs' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-base">
            {language === 'bn' ? 'সিস্টেম নোটিফিকেশনস' : 'System Notifications'}
          </h3>
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`py-3 flex items-start justify-between gap-3 cursor-pointer ${
                  !n.isRead ? 'bg-emerald-50/60 p-3 rounded-xl' : ''
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardTab === 'verification' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) ভেরিফাইড বিক্রেতা' : 'NID Verified Badge'}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'bn' ? 'এনআইডি বা ট্রেড লাইসেন্স জমা দিয়ে ভেরিফাইড ট্রাস্ট ব্যাজ অর্জন করুন' : 'Submit NID or Trade License to boost buyer trust by 10x'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
            <strong>✅ {language === 'bn' ? 'স্ট্যাটাস: ভেরিফাইড (Verified Gold Seller)' : 'Status: Verified Gold Seller'}</strong>
            <p className="mt-1 text-emerald-800">
              আপনার NID কার্ড ও ফোন নম্বর সফলভাবে ডাবল-চেক ভেরিফাই করা হয়েছে।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
