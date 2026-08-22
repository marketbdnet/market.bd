import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { formatPostedAt } from '../../utils/dateUtils';
import { ShareModal } from './ShareModal';
import { WatermarkedImage } from './WatermarkedImage';
import { getMarketBdTenure } from '../../utils/tenure';
import { SEOHelmet } from '../SEO/SEOHelmet';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  Heart,
  GitCompare,
  Share2,
  AlertTriangle,
  Send,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  QrCode,
  Eye,
  EyeOff,
  X,
  Copy,
  Check,
  ShieldAlert,
  Trash2,
  Edit3
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    language,
    selectedProduct,
    setSelectedProduct,
    setActiveTab,
    goBack,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    openChatForProduct,
    sendMessage,
    reactions,
    toggleReaction,
    followedSellers,
    toggleFollowSeller,
    sellerReviews,
    addSellerReview,
    logUserActivity,
    reportAbusiveChat,
    currentUser,
    userRole,
    openDeleteModal,
    setEditingAd,
    updateProductStatus
  } = useMarket();

  const isOwner = !!(
    currentUser &&
    selectedProduct &&
    (selectedProduct.seller?.id === currentUser.id ||
      selectedProduct.seller?.phone === currentUser.phone ||
      (currentUser.email && selectedProduct.seller?.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
      selectedProduct.sellerId === currentUser.id ||
      selectedProduct.seller?.id === 'user-me')
  );
  const isAdmin = currentUser?.role === 'admin' || userRole === 'admin';

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullSafetyModal, setShowFullSafetyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [reportReason, setReportReason] = useState('Offensive Language or Behavior');
  const [reportNotes, setReportNotes] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Scroll window to top whenever a new product is loaded
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveImageIdx(0);
    setShowPhone(false);
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const productImages = (Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0)
    ? selectedProduct.images
    : [((selectedProduct as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80')];

  const currentImage = productImages[activeImageIdx] || productImages[0];

  const isWishlisted = wishlist.includes(selectedProduct.id);
  const isCompared = compareList.some(p => p.id === selectedProduct.id);
  const isFollowingSeller = followedSellers.includes(selectedProduct.seller?.id || '');
  const productReaction = reactions[selectedProduct.id] || { likes: 12, dislikes: 1, loves: 8 };

  const handleRevealPhone = () => {
    setShowPhone(!showPhone);
    if (!showPhone) {
      logUserActivity('Revealed Phone', selectedProduct.title, selectedProduct.id);
    }
  };

  const handleStartChat = () => {
    openChatForProduct(selectedProduct);
    setSelectedProduct(null);
    logUserActivity('Started Chat', selectedProduct.title, selectedProduct.id);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportAbusiveChat('ad-' + selectedProduct.id, selectedProduct.seller?.name || 'Seller', `${reportReason}: ${reportNotes}`);
    logUserActivity('Reported Ad', selectedProduct.title, selectedProduct.id);
    setShowReportModal(false);
    alert(
      language === 'bn'
        ? 'আপনার রিপোর্টটি এডমিন টেবিলে জমা দেওয়া হয়েছে। প্রয়োজনীয় ব্যবস্থা নেওয়া হবে।'
        : 'Your abuse report has been submitted to Admin for review.'
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    if (selectedProduct.seller?.id) {
      addSellerReview(selectedProduct.seller.id, newRating, newReviewComment);
    }
    setShowRatingModal(false);
    setNewReviewComment('');
    alert(
      language === 'bn'
        ? 'আপনার লেনদেনের রিভিউ সফলভাবে জমা হয়েছে!'
        : 'Thank you for rating this seller!'
    );
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(offerPriceInput);
    if (!amount || amount <= 0) return;

    const threadId = openChatForProduct(selectedProduct);
    sendMessage(
      threadId,
      `${language === 'bn' ? 'অফার পাঠানো হয়েছে:' : 'Offer sent:'} ৳${amount.toLocaleString()}`,
      amount
    );
    setShowOfferModal(false);
    setSelectedProduct(null);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;

    if (!selectedProduct.questions) {
      selectedProduct.questions = [];
    }

    selectedProduct.questions.push({
      id: 'q-' + Date.now(),
      question: newQuestionInput,
      askedBy: language === 'bn' ? 'আপনি (বর্তমান ব্যবহারকারী)' : 'You',
      askedDate: 'Just now'
    });

    setNewQuestionInput('');
    alert(language === 'bn' ? 'আপনার প্রশ্ন পোস্ট করা হয়েছে!' : 'Question submitted successfully!');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-6 px-4">
      <SEOHelmet product={selectedProduct} />
      <div className="max-w-6xl mx-auto">
        {/* Actions Bar */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(selectedProduct.id)}
              className={`p-2 rounded-lg border bg-white dark:bg-slate-900 transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                isWishlisted
                  ? 'text-red-500 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
              <span>{isWishlisted ? (language === 'bn' ? 'সেভ করা' : 'Saved') : (language === 'bn' ? 'সেভ' : 'Save')}</span>
            </button>

            <button
              onClick={() => toggleCompare(selectedProduct)}
              className={`p-2 rounded-lg border bg-white dark:bg-slate-900 transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                isCompared
                  ? 'text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/60'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-pink-600'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{language === 'bn' ? 'তুলনা করুন' : 'Compare'}</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-lg border border-pink-200 dark:border-pink-900/60 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/80 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share Ad'}</span>
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Owner or Admin Management Control Bar */}
        {(isOwner || isAdmin) && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 dark:from-pink-950/40 dark:via-rose-950/40 dark:to-amber-950/30 border border-pink-200 dark:border-pink-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>
                    {isAdmin
                      ? (language === 'bn' ? '🛡️ এডমিন নিয়ন্ত্রণ প্যানেল (Admin Controls)' : '🛡️ Admin Controls')
                      : (language === 'bn' ? '👤 এটি আপনার পোস্টকৃত বিজ্ঞাপন (Your Advertisement)' : '👤 Your Advertisement')}
                  </span>
                  {selectedProduct.status === 'sold' && (
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                      {language === 'bn' ? 'বিক্রি শেষ / সোলেড' : 'Sold'}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn'
                    ? 'আপনি চাইলে বিজ্ঞাপনটি যেকোনো সময় ইডিট, সোলেড মার্ক অথবা চিরতরে মুছে (Delete) ফেলতে পারেন।'
                    : 'You can edit details, mark as sold, or permanently remove this ad anytime.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
              {/* Edit Button */}
              <button
                onClick={() => {
                  setEditingAd(selectedProduct);
                  setSelectedProduct(null);
                  setActiveTab('post-ad');
                }}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বিজ্ঞাপন ইডিট' : 'Edit Ad'}</span>
              </button>

              {/* Mark Sold Toggle */}
              <button
                onClick={() => updateProductStatus(selectedProduct.id, selectedProduct.status === 'sold' ? 'active' : 'sold')}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {selectedProduct.status === 'sold'
                    ? (language === 'bn' ? 'সক্রিয় করুন' : 'Reactivate')
                    : (language === 'bn' ? 'সোলেড' : 'Mark Sold')}
                </span>
              </button>

              {/* 🗑️ Delete Button */}
              <button
                onClick={() => openDeleteModal(selectedProduct)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer hover:scale-105"
                title={language === 'bn' ? 'বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলুন' : 'Permanently Delete this Ad'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মুছে ফেলুন (Delete)' : 'Delete'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Image Gallery & Description & Specs (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-3">
                <WatermarkedImage
                  src={getOptimizedImageUrl(currentImage, 800)}
                  alt={selectedProduct.title || 'Product'}
                  loading="eager"
                  watermarkSize="lg"
                  imgClassName="w-full h-full object-contain"
                  className="w-full h-full"
                />

                {/* Slider Controls */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIdx(prev => (prev === 0 ? productImages.length - 1 : prev - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIdx(prev => (prev === productImages.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        activeImageIdx === idx ? 'border-pink-600 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <WatermarkedImage
                        src={getOptimizedImageUrl(img, 200)}
                        alt=""
                        loading="lazy"
                        watermarkSize="sm"
                        imgClassName="w-full h-full object-cover"
                        className="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {language === 'bn' && selectedProduct.titleBn ? selectedProduct.titleBn : selectedProduct.title}
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      {selectedProduct.location.thana}, {selectedProduct.location.district}, {selectedProduct.location.division}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 ml-auto text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
                      {formatPostedAt(selectedProduct.postedAt, language)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold px-2.5 py-1 rounded-full border border-pink-100 dark:border-pink-900/50">
                      <Eye className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span>{selectedProduct.views || 1} {language === 'bn' ? 'বার দেখা হয়েছে' : 'views'}</span>
                    </span>
                  </div>

                  {/* Reaction Buttons (Like, Dislike, Love) */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => toggleReaction(selectedProduct.id, 'like')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        productReaction.userReaction === 'like'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-pink-50'
                      }`}
                      title="Like"
                    >
                      <span>👍</span>
                      <span>{productReaction.likes}</span>
                    </button>

                    <button
                      onClick={() => toggleReaction(selectedProduct.id, 'love')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        productReaction.userReaction === 'love'
                          ? 'bg-red-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-red-50'
                      }`}
                      title="Love"
                    >
                      <span>❤️</span>
                      <span>{productReaction.loves}</span>
                    </button>

                    <button
                      onClick={() => toggleReaction(selectedProduct.id, 'dislike')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        productReaction.userReaction === 'dislike'
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      }`}
                      title="Dislike"
                    >
                      <span>👎</span>
                      <span>{productReaction.dislikes}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Social Media Share Bar */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    {language === 'bn' ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন:' : 'Share on Social Media:'}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-1.5 bg-[#0A66C2] text-white text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-1.5 bg-[#229ED9] text-white text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Telegram</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Specifications Table */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <span>{language === 'bn' ? 'টেকনিক্যাল স্পেসিফিকেশন' : 'Specifications'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{language === 'bn' ? 'কন্ডিশন' : 'Condition'}:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedProduct.condition}</strong>
                  </div>
                  {selectedProduct.brand && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{language === 'bn' ? 'ব্র্যান্ড' : 'Brand'}:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedProduct.brand}</strong>
                    </div>
                  )}
                  {selectedProduct.warranty && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{language === 'bn' ? 'ওয়ারেন্টি' : 'Warranty'}:</span>
                      <strong className="text-pink-600 dark:text-pink-400 font-bold">{selectedProduct.warranty}</strong>
                    </div>
                  )}
                  {Object.entries(selectedProduct.specifications).map(([key, val], i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights & Features */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'bn' ? 'বিশেষ ফিচার ও সুবিধাসমূহ' : 'Item Highlights & Features'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Text */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {language === 'bn' ? 'বিস্তারিত বর্ণনা' : 'Description'}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {language === 'bn' && selectedProduct.descriptionBn
                    ? selectedProduct.descriptionBn
                    : selectedProduct.description}
                </p>
              </div>

              {/* Questions & Answers Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {language === 'bn' ? 'প্রশ্ন ও উত্তর (Q&A)' : 'Questions & Answers'}
                </h3>

                {selectedProduct.questions && selectedProduct.questions.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {selectedProduct.questions.map(q => (
                      <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">Q: {q.question}</p>
                        <p className="text-slate-400 text-[10px]">{q.askedBy} • {q.askedDate}</p>
                        {q.answer && (
                          <div className="mt-2 pl-3 border-l-2 border-pink-600 text-pink-900 dark:text-pink-300 font-medium">
                            <p>Ans: {q.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mb-3 italic">
                    {language === 'bn' ? 'এখনো কোনো প্রশ্ন করা হয়নি। প্রথম প্রশ্ন করুন!' : 'No questions yet. Ask the seller!'}
                  </p>
                )}

                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestionInput}
                    onChange={e => setNewQuestionInput(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'বিক্রেতাকে প্রোডাক্ট নিয়ে প্রশ্ন করুন...'
                        : 'Ask seller a question about this item...'
                    }
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:border-pink-600 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="bg-pink-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-pink-700 transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পাঠান' : 'Ask'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Price & Seller Card & Contact Buttons */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block uppercase">
                  {language === 'bn' ? 'বিক্রয় মূল্য' : 'Asking Price'}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-pink-600 dark:text-pink-400">
                    ৳{selectedProduct.price.toLocaleString()}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                      ৳{selectedProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {selectedProduct.isNegotiable && (
                  <span className="inline-block mt-1 text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold px-2.5 py-0.5 rounded">
                    {language === 'bn' ? '⚡ দাম আলোচনা সাপেক্ষ' : '⚡ Price Negotiable'}
                  </span>
                )}
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Phone reveal or hidden badge */}
                {selectedProduct.seller.hidePhone ? (
                  <div className="w-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold py-3 px-4 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-center gap-2 text-xs shadow-2xs">
                    <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? '🔒 বিক্রেতা মোবাইল নম্বর গোপন রেখেছেন (চ্যাটে কথা বলুন)'
                        : '🔒 Seller hid phone number (Use Chat below)'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-2xs cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>
                      {showPhone
                        ? selectedProduct.seller.phone
                        : language === 'bn'
                        ? 'ফোন নম্বর দেখুন (Call Seller)'
                        : 'Show Phone Number'}
                    </span>
                  </button>
                )}

                {/* Live Chat */}
                <button
                  onClick={() => {
                    openChatForProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span>{language === 'bn' ? 'সরাসরি চ্যাট করুন' : 'Chat with Seller'}</span>
                </button>

                {/* Make an Offer */}
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="w-full bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/80 text-pink-700 dark:text-pink-300 font-extrabold py-3 px-4 rounded-xl border border-pink-200 dark:border-pink-900/60 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'bn' ? 'দাম অফার করুন (Make Offer)' : 'Make an Offer'}</span>
                </button>
              </div>
            </div>

            {/* Seller Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'বিক্রেতার তথ্য' : 'Seller Information'}
                </h4>
                <button
                  onClick={() => toggleFollowSeller(selectedProduct.seller.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isFollowingSeller
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900 border border-pink-200 dark:border-pink-900/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isFollowingSeller
                      ? language === 'bn' ? 'ফলো করা হচ্ছে' : 'Following'
                      : language === 'bn' ? 'ফলো করুন' : '+ Follow Seller'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.seller.avatar}
                  alt={selectedProduct.seller.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-1">
                    {selectedProduct.seller.name}
                    {selectedProduct.seller.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {selectedProduct.seller.rating}
                    </span>
                    <span>({selectedProduct.seller.totalReviews} reviews)</span>
                  </div>
                  {selectedProduct.seller.badge && (
                    <span className="inline-block mt-1 text-[10px] bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-extrabold px-2 py-0.5 rounded border border-pink-100 dark:border-pink-900/60">
                      {selectedProduct.seller.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/60 rounded-xl border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-between gap-1.5 text-[11px] font-extrabold text-pink-900 dark:text-pink-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
                    <span>{getMarketBdTenure(selectedProduct.seller.memberSince, language)}</span>
                  </span>
                  <span className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">({selectedProduct.seller.memberSince})</span>
                </div>
                {selectedProduct.seller.responseRate && (
                  <div className="flex justify-between px-1">
                    <span className="text-slate-400">{language === 'bn' ? 'রেসপন্স রেট:' : 'Response Rate:'}</span>
                    <strong className="text-pink-600 dark:text-pink-400">{selectedProduct.seller.responseRate}</strong>
                  </div>
                )}
              </div>

              {/* Rate Seller Transaction Button */}
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{language === 'bn' ? 'লেনদেন মূল্যায়ন করুন (Rate Seller)' : 'Rate Transaction'}</span>
              </button>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-amber-50/90 dark:bg-amber-950/40 rounded-2xl p-5 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-3 text-xs shadow-xs">
              <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-100 text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'bn' ? 'লেনদেনে বিশেষ সতর্কতা নির্দেশিকা' : 'Transaction Safety Guidelines'}</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-amber-900 dark:text-amber-200 font-medium">
                <li>{language === 'bn' ? 'কখনো কোনো অগ্রিম পেমেন্ট (বিকাশ/নগদ/বুকিং মানি) করবেন না।' : 'Never send advance payments or booking fee before receiving item.'}</li>
                <li>{language === 'bn' ? 'পণ্য সরাসরি নিজে পরীক্ষা করে, কার্যকারিতা যাচাই করে মূল্য পরিশোধ করুন।' : 'Always inspect the product physically before paying.'}</li>
                <li>{language === 'bn' ? 'জনবহুল ও নিরাপদ স্থানে (যেমন শপিংমল/ব্যাংক এলাকা) দেখা করুন।' : 'Meet in public, high-security locations.'}</li>
                <li className="text-red-700 dark:text-red-400 font-bold">{language === 'bn' ? 'সতর্কতা: ক্রেতা-বিক্রেতার যেকোনো লেনদেনের জন্য MarketBD.Net দায়ী থাকবে না।' : 'Notice: MarketBD.Net holds no liability for any buyer-seller transactions.'}</li>
              </ul>
              
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowFullSafetyModal(true)}
                  className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সতর্কতা নির্দেশিকা' : 'Safety Guide'}</span>
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  title="Report Abuse / Offensive Content"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{language === 'bn' ? 'রিপোর্ট' : 'Report'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Component */}
      {selectedProduct && (
        <ShareModal
          product={selectedProduct}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          language={language}
        />
      )}

      {/* Full Safety & Transaction Instruction Modal */}
      {showFullSafetyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowFullSafetyModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3.5 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-2xl">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'গ্রাহক লেনদেনে বিশেষ সতর্কতা ও নির্দেশিকা' : 'Special Customer Transaction Safety Guidelines'}
                </h2>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  {language === 'bn' ? 'নিরাপদ ক্রয়-বিক্রয় নিশ্চিত করতে অনুগ্রহ করে নির্দেশনাবলী মেনে চলুন' : 'Follow these essential rules to prevent fraud'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-2xl border border-red-200 dark:border-red-900/60 text-red-950 dark:text-red-200 font-medium">
                <h4 className="font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  {language === 'bn' ? '১. অগ্রিম অর্থ প্রদান সম্পূর্ণ নিষিদ্ধ' : '1. No Advance Payments'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'কোনো অবস্থাতেই পণ্য হাতে পাওয়ার এবং পরীক্ষা করার আগে বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্টে ডেলিভারি চার্জ বা বুকিং মানি হিসেবে অগ্রিম টাকা পাঠাবেন না।'
                    : 'Do not transfer any booking money or delivery fee via Mobile Financial Services (bKash/Nagad) before physically inspecting the product.'}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 font-medium">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  {language === 'bn' ? '২. নিরাপদ জনবহুল স্থানে দেখা করা' : '2. Meet in Safe Public Locations'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'বিক্রেতা বা ক্রেতার সাথে নির্জন স্থান বা অচেনা বাসায় দেখা করবেন না। বড় শপিংমল, কফি শপ বা ব্যাংক এলাকার মতো পাবলিক প্লেসে দেখা করে লেনদেন করুন।'
                    : 'Always choose public places like shopping malls or bank centers. Avoid secluded areas.'}
                </p>
              </div>

              <div className="p-4 bg-pink-50 dark:bg-pink-950/50 rounded-2xl border-2 border-pink-500 text-pink-950 dark:text-pink-200 font-medium">
                <h4 className="font-bold text-pink-800 dark:text-pink-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                  {language === 'bn' ? '৩. শারীরিক পরিদর্শন ও টেকনিক্যাল চেকিং' : '3. Physical & Technical Verification'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'মোবাইল/ইলেকট্রনিক্স ক্রয়ের সময় IMEI ভেরিফাই করুন, ওয়াইফাই, সিম স্লট ও ক্যামেরা চেক করুন। বাইক/গাড়ির ক্ষেত্রে বিআরটিএ কাগজ ও মেমো যাচাই করুন।'
                    : 'Verify IMEI, camera, display, battery health for gadgets. Check BRTA registration papers for vehicles.'}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-purple-950 dark:text-purple-200 font-medium">
                <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  {language === 'bn' ? '৪. ভুয়া এসএমএস ও ডিজিটাল ক্যাশ-ইন প্রতারণা সতর্কতা' : '4. Fake SMS & Fake Payment Receipt Warning'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'শুধুমাত্র মোবাইল নম্বরে আসা "You have received Tk..." মেসেজ দেখে পণ্য হস্তান্তর করবেন না। নিজস্ব বিকাশ/নগদ অ্যাপ বা *247# Dial করে ব্যালেন্স কনফার্ম করুন।'
                    : 'Never rely on incoming SMS. Always check your actual bKash/Nagad wallet balance via app or USSD code.'}
                </p>
              </div>

              <div className="p-4 bg-rose-100/90 dark:bg-rose-950/60 rounded-2xl border-2 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 font-medium">
                <h4 className="font-black text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  {language === 'bn' ? '৫. প্ল্যাটফর্মের দায়ভার নিষ্কৃতি (MarketBD.Net Disclaimer)' : '5. Platform Liability Disclaimer'}
                </h4>
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  {language === 'bn'
                    ? 'MarketBD.Net একটি উন্মুক্ত ক্লাসিফাইড বিজ্ঞাপন প্ল্যাটফর্ম। ক্রেতা ও বিক্রেতার মধ্যকার যেকোনো ধরনের লেনদেন, অর্থ প্রদান, প্রতারণা বা পণ্যের কোনো ত্রুটির জন্য MarketBD.Net কর্তৃপক্ষ কোনোভাবেই দায়ী থাকবে না।'
                    : 'MarketBD.Net is a classified advertising platform. MarketBD.Net shall hold no liability or responsibility for any financial transactions, payments, disputes, fraud, or product quality issues between buyers and sellers.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowFullSafetyModal(false)}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {language === 'bn' ? 'আমি বুঝেছি ও সম্মত' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {language === 'bn' ? 'বিক্রেতাকে প্রাইস অফার করুন' : 'Make a Price Offer'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              আস্কিং প্রাইস: <strong className="text-pink-600 dark:text-pink-400">৳{selectedProduct.price.toLocaleString()}</strong>
            </p>
            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'আপনার অফার প্রাইস (টাকায়)' : 'Your Offer Amount (BDT)'}
                </label>
                <input
                  type="number"
                  value={offerPriceInput}
                  onChange={e => setOfferPriceInput(e.target.value)}
                  placeholder="e.g. 120000"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-bold text-pink-600 dark:text-pink-400 focus:outline-none focus:border-pink-600"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 cursor-pointer"
                >
                  {language === 'bn' ? 'অফার পাঠান' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Abuse Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {language === 'bn' ? 'বিজ্ঞাপন বা ব্যবহারকারী রিপোর্ট করুন' : 'Report Abuse / Scam'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'আপত্তিকর আচরণ বা ভুয়া বিজ্ঞাপনের জন্য এডমিনকে রিপোর্ট করুন' : 'Report inappropriate behavior or fraudulent ad to admin'}
                </p>
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'রিপোর্টের বিষয় নির্বাচন করুন:' : 'Select Report Category:'}
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
                >
                  <option value="Offensive Language or Behavior">আপত্তিকর ভাষা / খারাপ আচরণ (Offensive Language / Bad Behavior)</option>
                  <option value="Fake / Scam Ad">ভুয়া বা প্রতারণামূলক বিজ্ঞাপন (Fake / Scam Product)</option>
                  <option value="Misleading Price">ভুল বা বিভ্রান্তিকর দাম (Misleading Price)</option>
                  <option value="Prohibited Item">নিষিদ্ধ বা অবৈধ পণ্য (Prohibited / Illegal Item)</option>
                  <option value="Duplicate Ad">একই বিজ্ঞাপনের পুনরাবৃত্তি (Duplicate Ad)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'বিস্তারিত তথ্য (ঐচ্ছিক):' : 'Additional Details (Optional):'}
                </label>
                <textarea
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                  rows={3}
                  placeholder="যেমন: ফোন বা চ্যাটে বাজে কথা বলেছে, অথবা পণ্যের ছবি ভুয়া..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 placeholder-slate-400 dark:placeholder-slate-500"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold cursor-pointer hover:bg-red-700 shadow-xs"
                >
                  {language === 'bn' ? 'এডমিনকে পাঠান' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Rating & Review Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {language === 'bn' ? 'বিক্রেতার সাথে লেনদেন রেটিং দিন' : 'Rate Seller Transaction'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedProduct.seller.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {language === 'bn' ? 'রেটিং দিন (১ থেকে ৫ স্টার):' : 'Select Rating:'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= newRating
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-slate-300 dark:text-slate-600'
                        } transition`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm ml-2">{newRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'bn' ? 'আপনার মন্তব্য বা অভিজ্ঞতা:' : 'Your Feedback:'}
                </label>
                <textarea
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="যেমন: পন্য ভালো ছিল, সময়মতো পেয়েছি..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pink-600 placeholder-slate-400 dark:placeholder-slate-500"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white rounded-xl font-bold cursor-pointer hover:bg-pink-700 shadow-xs"
                >
                  {language === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <QrCode className="w-16 h-16 text-pink-600 dark:text-pink-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              {language === 'bn' ? 'শেয়ার করতে কিউআর কোড স্ক্যান করুন' : 'Scan to View Product'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              মোবাইল ক্যামেরা দিয়ে স্ক্যান করে সরাসরি শেয়ার করুন।
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs break-all text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              https://marketbd.net/ad/{selectedProduct.slug}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
