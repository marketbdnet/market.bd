import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { isProductPublicActive } from '../../utils/productStatus';
import { WatermarkedImage } from '../Product/WatermarkedImage';
import { Zap, Clock, RefreshCw } from 'lucide-react';

export const FlashSale: React.FC = () => {
  const { language, products, setSelectedProduct, setActiveTab } = useMarket();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 19 });
  const [rotationOffset, setRotationOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter flash sale products (or products with discount / special price)
  let flashProducts = products.filter(p => (p.isFlashSale || (p.originalPrice && p.originalPrice > p.price)) && isProductPublicActive(p));
  if (flashProducts.length < 5) {
    const otherActive = products.filter(p => isProductPublicActive(p) && !flashProducts.some(fp => fp.id === p.id));
    flashProducts = [...flashProducts, ...otherActive];
  }

  // 5-minute auto rotation timer if more than 5 products
  useEffect(() => {
    if (flashProducts.length <= 5) return;
    const rotateInterval = setInterval(() => {
      setRotationOffset(prev => prev + 5);
    }, 5 * 60 * 1000); // 5 minutes rotation

    return () => clearInterval(rotateInterval);
  }, [flashProducts.length]);

  // Get 5 rotated products
  const getDisplayProducts = () => {
    if (flashProducts.length <= 5) return flashProducts.slice(0, 5);
    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(flashProducts[(rotationOffset + i) % flashProducts.length]);
    }
    return result;
  };

  const displayedProducts = getDisplayProducts();

  return (
    <section className="bg-slate-900 border-2 border-pink-500 rounded-2xl p-3 sm:p-4 text-white shadow-xl relative overflow-hidden">
      {/* Decorative bg glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-pink-600 text-white rounded-xl shadow-md shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-white">
              <span>{language === 'bn' ? 'ফ্ল্যাশ সেল ও হট ডিল' : 'Flash Deals'}</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400">
              {language === 'bn' ? 'প্রতিদিন বিশেষ ছাড়ের প্রিমিয়াম হট ডিল' : 'Top hot discount deals'}
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 shrink-0 self-start sm:self-auto text-[11px]">
          <Clock className="w-3.5 h-3.5 text-pink-400" />
          <span className="font-bold text-slate-300">
            {language === 'bn' ? 'বাকি:' : 'Ends:'}
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-xs">
            <span className="bg-pink-600 text-white px-1.5 py-0.5 rounded">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-slate-400">:</span>
            <span className="bg-pink-600 text-white px-1.5 py-0.5 rounded">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-slate-400">:</span>
            <span className="bg-pink-600 text-white px-1.5 py-0.5 rounded">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Product Cards Grid: Exactly 5 items display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 relative z-10">
        {displayedProducts.map(prod => {
          if (!prod) return null;
          const discountPercent = prod.originalPrice && prod.originalPrice > prod.price
            ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
            : 15;

          const prodImg = (Array.isArray(prod.images) && prod.images.length > 0 && prod.images[0])
            ? prod.images[0]
            : ((prod as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80');

          const prodPrice = typeof prod.price === 'number' ? prod.price.toLocaleString() : (prod.price || '0');

          return (
            <div
              key={prod.id}
              onClick={() => {
                setSelectedProduct(prod);
                setActiveTab('product-details');
              }}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl p-2 border border-pink-500/80 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between relative overflow-hidden active:scale-95"
            >
              {/* Discount Tag */}
              <div className="absolute top-1.5 left-1.5 z-10 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                -{discountPercent}%
              </div>

              {/* Image */}
              <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden mb-1.5 bg-slate-100 dark:bg-slate-900 relative">
                <WatermarkedImage
                  src={getOptimizedImageUrl(prodImg, 300)}
                  alt={prod.title || 'Product'}
                  loading="lazy"
                  watermarkSize="sm"
                  imgClassName="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-slate-200 dark:bg-slate-800"
                  className="w-full h-full"
                />
              </div>

              {/* Content Box */}
              <div className="bg-slate-50 dark:bg-slate-900/90 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700 space-y-1 text-[10px]">
                {/* 1. Name */}
                <div className="grid grid-cols-[48px_1fr] items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-0.5">
                  <span className="text-sky-600 dark:text-sky-400 font-black text-[9px]">
                    {language === 'bn' ? 'পণ্য' : 'Name'}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-left truncate text-[10px]">
                    {language === 'bn' && prod.titleBn ? prod.titleBn : (prod.title || 'Product')}
                  </span>
                </div>

                {/* 2. Price */}
                <div className="grid grid-cols-[48px_1fr] items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-0.5">
                  <span className="text-sky-600 dark:text-sky-400 font-black text-[9px]">
                    {language === 'bn' ? 'দাম' : 'Price'}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-left text-[10px] truncate">
                    ৳{prodPrice}
                  </span>
                </div>

                {/* 3. Location */}
                <div className="grid grid-cols-[48px_1fr] items-center gap-1">
                  <span className="text-sky-600 dark:text-sky-400 font-black text-[9px]">
                    {language === 'bn' ? 'স্থান' : 'Location'}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-left text-[9px] truncate">
                    {prod.location.thana || prod.location.district || prod.location.division}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
