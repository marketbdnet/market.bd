import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getMarketBdTenure } from '../../utils/tenure';
import { storage } from '../../utils/storage';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshData';
import { getRemainingAutoApproveTime } from '../../utils/autoApprovalTimer';
import { Product } from '../../types';
import {
  X,
  User,
  Trash2,
  Check,
  AlertTriangle,
  Edit2,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  ArrowRight,
  Clock,
  Package,
  PlusCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Edit3
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    logout,
    language,
    login,
    products,
    setEditingAd,
    setActiveTab: setGlobalActiveTab,
    setSelectedProduct,
    openDeleteModal
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'my-ads' | 'profile' | 'edit' | 'delete'>('my-ads');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'sold' | 'expired'>('all');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka_d');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setDivision(currentUser.location?.division || 'dhaka');
      setDistrict(currentUser.location?.district || 'dhaka_d');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Filter ads posted by this user
  const myAds = (products || []).filter(p => {
    if (!p || !currentUser) return false;
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
    if (statusFilter === 'active') return ad.status === 'active' || ad.status === 'approved' || !ad.status;
    if (statusFilter === 'pending') return ad.status === 'pending' || (ad as any).status === 'under_review' || (ad as any).status === 'in_review';
    return ad.status === statusFilter;
  });

  const handleEditAd = (ad: Product) => {
    setEditingAd(ad);
    setGlobalActiveTab('post-ad');
    onClose();
  };

  const handleViewAd = (ad: Product) => {
    setSelectedProduct(ad);
    onClose();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: { division, district }
    };

    // Update in Context and LocalStorage
    login(updatedUser);

    const existingUsersRaw = storage.getItem('marketbd_registered_users');
    if (existingUsersRaw) {
      try {
        const users = JSON.parse(existingUsersRaw);
        const idx = users.findIndex((u: any) => u.phone === currentUser.phone || u.email === currentUser.email);
        if (idx !== -1) {
          users[idx] = { ...users[idx], name, phone, email };
          storage.setItem('marketbd_registered_users', JSON.stringify(users));
        }
      } catch (e) {}
    }

    setSuccessMsg(language === 'bn' ? '✓ আপনার প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!' : '✓ Profile updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('profile');
    }, 1500);
  };

  const handleDeleteAccount = () => {
    if (confirmDeleteText.trim().toLowerCase() !== 'delete') {
      setDeleteError(
        language === 'bn'
          ? '❌ অ্যাকাউন্ট ডিলিট নিশ্চিত করতে "DELETE" কথাটি লিখুন।'
          : '❌ Please type "DELETE" to confirm account deactivation.'
      );
      return;
    }

    // Remove user from storage registered users
    const existingUsersRaw = storage.getItem('marketbd_registered_users');
    if (existingUsersRaw) {
      try {
        const users = JSON.parse(existingUsersRaw);
        const filtered = users.filter((u: any) => u.phone !== currentUser.phone && u.email !== currentUser.email);
        storage.setItem('marketbd_registered_users', JSON.stringify(filtered));
      } catch (e) {}
    }

    logout();
    onClose();
    alert(
      language === 'bn'
        ? 'আপনার MarketBD.Net অ্যাকাউন্ট ও সমস্ত প্রোফাইল ডেটা ডিলিট করা হয়েছে।'
        : 'Your MarketBD.Net account and profile data have been deactivated.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative text-slate-900 dark:text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-[280px]">
                  {currentUser.name}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {language === 'bn' ? 'ভেরিফাইড বিজ্ঞাপনদাতা' : 'Verified Seller'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser.phone || currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-xs font-bold shrink-0 overflow-x-auto">
          {/* 1. My Ads (মাই এড) */}
          <button
            onClick={() => setActiveTab('my-ads')}
            className={`flex-1 py-3 px-3 text-center transition cursor-pointer border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'my-ads'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span>{language === 'bn' ? 'মাই এড (আমার বিজ্ঞাপন)' : 'My Ads'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'my-ads' ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {myAds.length}
            </span>
          </button>

          {/* 2. Profile Overview */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-3 text-center transition cursor-pointer border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
          </button>

          {/* 3. Edit Profile */}
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 px-3 text-center transition cursor-pointer border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'edit'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'তথ্য এডিট' : 'Edit Info'}</span>
          </button>

          {/* 4. Deactivate */}
          <button
            onClick={() => setActiveTab('delete')}
            className={`py-3 px-3 text-center transition cursor-pointer border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'delete'
                ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'ডিলিট' : 'Deactivate'}</span>
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: MY ADS (মাই এড) */}
          {activeTab === 'my-ads' && (
            <div className="space-y-4">
              {/* Top Banner & Post New Ad shortcut */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-pink-50 dark:bg-pink-950/40 p-3.5 rounded-2xl border border-pink-200 dark:border-pink-900/60">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span>{language === 'bn' ? 'মাই এড: আপনার পোস্ট করা বিজ্ঞাপনসমূহ' : 'My Ads & Listings'}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {language === 'bn' 
                      ? 'এখানে আপনার সকল বিজ্ঞাপন দেখতে পাবেন এবং যেকোনো সময় তথ্য এডিট ও ম্যানেজ করতে পারবেন।' 
                      : 'View, edit, and manage all your posted classified advertisements.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingAd(null);
                    setGlobalActiveTab('post-ad');
                    onClose();
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-black px-4 py-2 rounded-xl shadow-xs transition text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নতুন বিজ্ঞাপন দিন' : 'Post New Ad'}</span>
                </button>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                {[
                  { id: 'all', labelBn: 'সকল বিজ্ঞাপন', labelEn: 'All Ads', count: myAds.length },
                  { id: 'active', labelBn: 'অনুমোদিত / লাইভ', labelEn: 'Active', count: myAds.filter(a => a.status === 'active' || a.status === 'approved' || !a.status).length },
                  { id: 'pending', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending', count: myAds.filter(a => a.status === 'pending' || (a as any).status === 'under_review' || (a as any).status === 'in_review').length },
                  { id: 'rejected', labelBn: 'রিজেক্টেড', labelEn: 'Rejected', count: myAds.filter(a => a.status === 'rejected').length },
                  { id: 'sold', labelBn: 'সোলেড', labelEn: 'Sold', count: myAds.filter(a => a.status === 'sold').length }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === f.id
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{language === 'bn' ? f.labelBn : f.labelEn}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      statusFilter === f.id ? 'bg-pink-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Ads List */}
              {filteredMyAds.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 space-y-3">
                  <Package className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'এই তালিকায় কোনো বিজ্ঞাপন পাওয়া যায়নি।' : 'No ads found in this category.'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingAd(null);
                      setGlobalActiveTab('post-ad');
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{language === 'bn' ? 'বিজ্ঞাপন পোস্ট করুন (ফ্রি)' : 'Post Free Ad Now'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMyAds.map(ad => {
                    const mainImg = ad.images && ad.images.length > 0 ? ad.images[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                    const timer = ad.status === 'pending' ? getRemainingAutoApproveTime(ad.postedAt, 30) : null;

                    return (
                      <div
                        key={ad.id}
                        className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3 sm:p-4 shadow-xs hover:border-pink-300 dark:hover:border-pink-700 transition space-y-3"
                      >
                        <div className="flex gap-3 sm:gap-4 items-start">
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600">
                            <img
                              src={mainImg}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            {ad.images && ad.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                                {ad.images.length} 📷
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                {ad.title}
                              </h4>
                              <span className="font-black text-xs sm:text-sm text-pink-600 dark:text-pink-400 shrink-0">
                                ৳ {ad.price ? Number(ad.price).toLocaleString() : '0'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                              <span className="capitalize">{ad.category}</span>
                              <span>•</span>
                              <span>{ad.location?.district || ad.location?.division || 'Bangladesh'}</span>
                              <span>•</span>
                              <span>{ad.postedAt ? new Date(ad.postedAt).toLocaleDateString() : 'Today'}</span>
                            </div>

                            {/* Status Badges */}
                            <div className="pt-1 flex items-center gap-2 flex-wrap">
                              {ad.status === 'active' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{language === 'bn' ? 'লাইভ / অনুমোদিত' : 'Active Live'}</span>
                                </span>
                              )}

                              {ad.status === 'pending' && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    <span>{language === 'bn' ? 'অপেক্ষমাণ (Under Review)' : 'Under Review'}</span>
                                  </span>
                                  {timer && (
                                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                      ⏱️ {language === 'bn' ? `অটো-এপ্রুভ বাকি: ${timer.formattedBn}` : `Auto: ${timer.formatted}`}
                                    </span>
                                  )}
                                </div>
                              )}

                              {ad.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>{language === 'bn' ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</span>
                                </span>
                              )}

                              {ad.status === 'sold' && (
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {language === 'bn' ? 'সোলেড (Sold)' : 'Sold'}
                                </span>
                              )}
                            </div>

                            {/* Rejection Note if rejected */}
                            {ad.status === 'rejected' && ad.rejectionReason && (
                              <div className="mt-1.5 p-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-[11px] text-red-800 dark:text-red-300">
                                <strong className="block text-red-700 dark:text-red-400 font-extrabold">
                                  {language === 'bn' ? '⚠️ এডমিন সংশোধন নোট:' : '⚠️ Admin Note:'}
                                </strong>
                                {ad.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: Edit, View, Delete */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          {/* View Ad Button */}
                          <button
                            onClick={() => handleViewAd(ad)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>{language === 'bn' ? 'দেখুন' : 'View'}</span>
                          </button>

                          {/* Edit Ad Button (Prominent) */}
                          <button
                            onClick={() => handleEditAd(ad)}
                            className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-yellow-300" />
                            <span>{language === 'bn' ? 'এডিট করুন' : 'Edit Ad'}</span>
                          </button>

                          {/* Delete Ad Button (Prominent) */}
                          <button
                            onClick={() => openDeleteModal(ad)}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title={language === 'bn' ? 'বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলুন' : 'Delete Ad'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'মুছে ফেলুন (Delete)' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VIEW PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Quick Jump to My Ads Card */}
              <div 
                onClick={() => setActiveTab('my-ads')}
                className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/60 dark:via-rose-950/40 dark:to-pink-900/50 p-4 rounded-2xl border-2 border-pink-400/80 cursor-pointer hover:shadow-md transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black shadow-xs shrink-0 group-hover:scale-110 transition">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-pink-950 dark:text-pink-200 flex items-center gap-1.5">
                      <span>{language === 'bn' ? '📦 মাই এড (পোস্ট করা বিজ্ঞাপনসমূহ)' : '📦 My Ads & Listings'}</span>
                      <span className="bg-pink-600 text-white text-[10px] px-2 py-0.2 rounded-full font-black">
                        {myAds.length} {language === 'bn' ? 'টি' : ''}
                      </span>
                    </h4>
                    <p className="text-[11px] text-pink-800/80 dark:text-pink-300 mt-0.5">
                      {language === 'bn' ? 'আপনার বিজ্ঞাপনগুলো দেখতে ও এডিট করতে এখানে ক্লিক করুন ➔' : 'Click here to view and edit your posted ads ➔'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition shrink-0" />
              </div>

              {/* Profile Details Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">{language === 'bn' ? 'নাম:' : 'Full Name:'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{currentUser.name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone Number:'}</span>
                  <span className="font-mono font-extrabold text-pink-600 dark:text-pink-400">{currentUser.phone}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">{language === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{currentUser.email || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-bold">{language === 'bn' ? 'লোকেশন / বিভাগ:' : 'Location:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentUser.location?.district || 'Dhaka'}, {currentUser.location?.division || 'Dhaka'}
                  </span>
                </div>

                <div className="pt-1">
                  <div className="p-2.5 bg-pink-50 dark:bg-pink-950/80 rounded-xl border-2 border-pink-500 flex items-center justify-between text-xs font-bold text-pink-900 dark:text-pink-200">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                      <span>{language === 'bn' ? 'MarketBD.Net বয়স:' : 'MarketBD.Net History:'}</span>
                    </span>
                    <span className="text-pink-700 dark:text-pink-300 font-extrabold">
                      {getMarketBdTenure(currentUser.memberSince || '2023', language)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'তথ্য এডিট করুন' : 'Edit Information'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT PROFILE TAB */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-pink-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর (ভেরিফাইড)' : 'Mobile Phone'} *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-pink-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-pink-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'বিভাগ' : 'Division'}
                  </label>
                  <select
                    value={division}
                    onChange={e => {
                      const newDivId = e.target.value;
                      setDivision(newDivId);
                      const divObj = BANGLADESH_DIVISIONS.find(d => d.id === newDivId || d.nameEn === newDivId);
                      if (divObj && divObj.districts.length > 0) {
                        setDistrict(divObj.districts[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 border-2 border-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-pink-600 cursor-pointer"
                  >
                    {BANGLADESH_DIVISIONS.map(d => (
                      <option key={d.id} value={d.id}>
                        {language === 'bn' ? d.nameBn : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-pink-600 cursor-pointer"
                  >
                    {(BANGLADESH_DIVISIONS.find(d => d.id === division || d.nameEn === division)?.districts || []).map(dist => (
                      <option key={dist.id} value={dist.id}>
                        {language === 'bn' ? dist.nameBn : dist.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পেছনে' : 'Back'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সেভ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: DELETE / DEACTIVATE ACCOUNT TAB */}
          {activeTab === 'delete' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{language === 'bn' ? 'সতর্কবার্তা: অ্যাকাউন্ট স্থায়ীভাবে মুছে যাবে' : 'Warning: Permanent Deactivation'}</span>
                </div>
                <p className="leading-relaxed">
                  {language === 'bn'
                    ? 'প্রোফাইল মুছে ফেললে আপনার দেওয়া সকল সক্রিয় বিজ্ঞাপন, বুকমার্ক ও চ্যাট মেসেজ মুছে যাবে।'
                    : 'Deactivating your profile will remove all active posts, saved bookmarks, and messages.'}
                </p>
              </div>

              {deleteError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400">{deleteError}</p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'কনফার্ম করতে নিচে "DELETE" লিখুন:' : 'Type "DELETE" below to confirm:'}
                </label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={e => {
                    setConfirmDeleteText(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-800 bg-white dark:bg-slate-800 text-red-600 font-mono font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বাতিল' : 'Cancel'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্ট মুছুন' : 'Confirm Deactivate'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
