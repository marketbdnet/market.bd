import React, { useState } from 'react';
import { Product } from '../../types';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { formatPostedAt } from '../../utils/dateUtils';
import { ShareModal } from './ShareModal';
import { WatermarkedImage } from './WatermarkedImage';
import {
  Heart,
  GitCompare,
  MapPin,
  CheckCircle2,
  Clock,
  Zap,
  Star,
  Eye,
  Truck,
  MessageSquare,
  Share2
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
  layoutMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout, layoutMode }) => {
  const activeLayout = layout || layoutMode || 'grid';
  const {
    language,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    setSelectedProduct,
    setActiveTab,
    openChatForProduct
  } = useMarket();

  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!product) return null;

  const isWishlisted = wishlist?.includes(product.id) || false;
  const isCompared = compareList?.some(p => p.id === product.id) || false;

  const primaryImage = (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
    ? product.images[0]
    : ((product as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80');

  const displayPrice = typeof product.price === 'number'
    ? product.price.toLocaleString()
    : (product.price ? String(product.price) : '0');

  const locationText = typeof product.location === 'string'
    ? product.location
    : (product.location?.thana || product.location?.district || product.location?.division || 'বাংলাদেশ');

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'brand_new': return language === 'bn' ? 'একদম নতুন' : 'Brand New';
      case 'used_like_new': return language === 'bn' ? 'নতুনের মত' : 'Like New';
      case 'used_good': return language === 'bn' ? 'ভালো অবস্থা' : 'Used Good';
      case 'refurbished': return language === 'bn' ? 'রিফার্বিশড' : 'Refurbished';
      default: return cond || (language === 'bn' ? 'ব্যবহৃত' : 'Used');
    }
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
    setActiveTab('product-details');
  };

  if (activeLayout === 'list') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-lg hover:border-pink-500 hover:scale-[1.005] transition-all duration-200 flex flex-col md:flex-row gap-4 relative group">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
          {product.adType === 'urgent' && (
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 animate-pulse">
              <Zap className="w-3 h-3 fill-white" />
              {language === 'bn' ? 'জরুরি' : 'URGENT'}
            </span>
          )}
          {product.adType === 'featured' && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-slate-950" />
              {language === 'bn' ? 'ফিচার্ড' : 'FEATURED'}
            </span>
          )}
        </div>

        {/* Image */}
        <div
          onClick={handleCardClick}
          className="w-full md:w-56 h-48 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 cursor-pointer relative"
        >
          <WatermarkedImage
            src={getOptimizedImageUrl(primaryImage, 500)}
            alt={product.title || 'Product'}
            loading="lazy"
            watermarkSize="md"
            imgClassName="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-slate-200 dark:bg-slate-800"
            className="w-full h-full"
          />
          {product.isDeliveryAvailable && (
            <div className="absolute bottom-2 left-2 z-20 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 pointer-events-none">
              <Truck className="w-3 h-3" />
              {language === 'bn' ? 'ডেলিভারি সুবিধা' : 'Delivery'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {getConditionLabel(product.condition)}
              </span>
              <div className="flex items-center gap-1.5">
                {/* Wishlist */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isWishlisted ? 'text-red-500 bg-red-50 dark:bg-red-950/80' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>

                {/* Compare */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleCompare(product);
                  }}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isCompared ? 'text-pink-600 bg-pink-50 dark:bg-pink-950/80' : 'text-slate-400 hover:text-pink-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Compare"
                >
                  <GitCompare className="w-4 h-4" />
                </button>

                {/* Share Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsShareOpen(true);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-pink-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Vertical Aligned Key-Value Details */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 border border-slate-200/80 dark:border-slate-700/60 text-xs">
              {/* 1. Product Name */}
              <div className="grid grid-cols-[90px_1fr] items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-1.5">
                <span className="text-sky-600 dark:text-sky-400 font-black text-xs">
                  {language === 'bn' ? 'Product Name:' : 'Product Name:'}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black text-left line-clamp-1 text-xs">
                  {language === 'bn' && product.titleBn ? product.titleBn : (product.title || 'Untitled')}
                </span>
              </div>

              {/* 2. Price */}
              <div className="grid grid-cols-[90px_1fr] items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-1.5">
                <span className="text-sky-600 dark:text-sky-400 font-black text-xs">
                  {language === 'bn' ? 'Price:' : 'Price:'}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black text-left text-xs">
                  ৳{displayPrice} {product.isNegotiable ? (language === 'bn' ? '(Negotiable)' : '(Negotiable)') : ''}
                </span>
              </div>

              {/* 3. Post Time */}
              <div className="grid grid-cols-[90px_1fr] items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">
                  {language === 'bn' ? 'পোস্ট সময়:' : 'Post Time:'}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-left text-xs sm:text-sm">
                  {formatPostedAt(product.postedAt, language)}
                </span>
              </div>

              {/* 4. Location */}
              <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                <span className="text-sky-600 dark:text-sky-400 font-black text-xs">
                  {language === 'bn' ? 'Location:' : 'Location:'}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black text-left text-xs truncate">
                  {locationText}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-bold bg-pink-50 dark:bg-pink-950/60 px-2.5 py-1 rounded-full text-xs">
              <Eye className="w-3.5 h-3.5" />
              {product.views || 0} {language === 'bn' ? 'ভিউ' : 'views'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openChatForProduct(product)}
                className="bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                {language === 'bn' ? 'চ্যাট' : 'Chat'}
              </button>
              <button
                onClick={handleCardClick}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout default
  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs hover:shadow-xl hover:border-pink-500 hover:scale-[1.01] transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {product.adType === 'urgent' && (
          <span className="bg-red-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 animate-pulse">
            <Zap className="w-2.5 h-2.5 fill-white" />
            {language === 'bn' ? 'জরুরি' : 'URGENT'}
          </span>
        )}
        {product.adType === 'featured' && (
          <span className="bg-amber-500 text-slate-950 font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-slate-950" />
            {language === 'bn' ? 'ফিচার্ড' : 'FEATURED'}
          </span>
        )}
      </div>

      {/* Action Buttons top right */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
        <button
          onClick={e => {
            e.stopPropagation();
            setIsShareOpen(true);
          }}
          className="p-1.5 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-pink-600 transition shadow-xs cursor-pointer"
          title="Share"
        >
          <Share2 className="w-3 h-3" />
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1.5 rounded-full backdrop-blur-md shadow-xs transition cursor-pointer ${
            isWishlisted ? 'bg-white text-red-500' : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-300 hover:text-red-500'
          }`}
        >
          <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Thumbnail */}
      <div className="w-full h-28 xs:h-32 sm:h-44 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2 relative">
        <WatermarkedImage
          src={getOptimizedImageUrl(primaryImage, 400)}
          alt={product.title || 'Product'}
          loading="lazy"
          watermarkSize="sm"
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-slate-200 dark:bg-slate-800"
          className="w-full h-full"
        />

        {product.isDeliveryAvailable && (
          <div className="absolute bottom-1 left-1 z-20 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[8px] font-semibold px-1 py-0.5 rounded flex items-center gap-0.5 pointer-events-none">
            <Truck className="w-2.5 h-2.5" />
            {language === 'bn' ? 'ডেলিভারি' : 'Delivery'}
          </div>
        )}
        {product.seller?.isVerified && (
          <div className="absolute bottom-1 right-1 bg-pink-600/90 backdrop-blur-md text-white text-[8px] font-extrabold px-1 py-0.5 rounded-full flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5 fill-white text-pink-600" />
            {language === 'bn' ? 'ভেরিফাইড' : 'Verified'}
          </div>
        )}
      </div>

      {/* Structured Vertical Key-Value Align Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 space-y-1 border border-slate-200/80 dark:border-slate-700/60 text-[10px] sm:text-xs font-medium">
          {/* 1. Product Name */}
          <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[80px_1fr] items-start gap-1 sm:gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-0.5 sm:pb-1">
            <span className="text-sky-600 dark:text-sky-400 font-black text-[10px] sm:text-[11px]">
              {language === 'bn' ? 'নাম' : 'Name'}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-left line-clamp-1 text-[10px] sm:text-xs">
              {language === 'bn' && product.titleBn ? product.titleBn : (product.title || 'Untitled')}
            </span>
          </div>

          {/* 2. Price */}
          <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[80px_1fr] items-center gap-1 sm:gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-0.5 sm:pb-1">
            <span className="text-sky-600 dark:text-sky-400 font-black text-[10px] sm:text-[11px]">
              {language === 'bn' ? 'দাম' : 'Price'}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-left text-[10px] sm:text-xs">
              ৳{displayPrice}
            </span>
          </div>

          {/* 3. Post Time */}
          <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[80px_1fr] items-center gap-1 sm:gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-0.5 sm:pb-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] sm:text-[11px]">
              {language === 'bn' ? 'পোস্ট সময়' : 'Time'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-left text-[10px] sm:text-xs">
              {formatPostedAt(product.postedAt, language)}
            </span>
          </div>

          {/* 4. Location */}
          <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[80px_1fr] items-center gap-1 sm:gap-2">
            <span className="text-sky-600 dark:text-sky-400 font-black text-[10px] sm:text-[11px]">
              {language === 'bn' ? 'স্থান' : 'Location'}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-left text-[10px] sm:text-[11px] truncate">
              {locationText}
            </span>
          </div>
        </div>

        {/* View Details Action Button */}
        <button
          onClick={handleCardClick}
          className="w-full mt-1.5 sm:mt-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-[10px] sm:text-xs py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer group-hover:bg-pink-700"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
        </button>
      </div>

      <ShareModal
        product={product}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        language={language}
      />
    </div>
  );
};
