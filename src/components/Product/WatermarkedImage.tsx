import React from 'react';
import { useMarket } from '../../context/MarketContext';

interface WatermarkedImageProps {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
  showWatermark?: boolean;
  watermarkSize?: 'sm' | 'md' | 'lg';
  loading?: 'lazy' | 'eager';
  onClick?: (e: React.MouseEvent) => void;
}

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  watermarkText: customWatermarkTextProp,
  watermarkOpacity: customWatermarkOpacityProp,
  showWatermark: showWatermarkProp = true,
  watermarkSize = 'md',
  loading = 'lazy',
  onClick,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  let contextWatermarkText = 'MarketBD.Net';
  let contextWatermarkOpacity = 0.05;
  let contextWatermarkEnabled = true;

  try {
    const market = useMarket();
    if (market) {
      if (market.watermarkText) contextWatermarkText = market.watermarkText;
      if (market.watermarkOpacity !== undefined) contextWatermarkOpacity = market.watermarkOpacity;
      if (market.isWatermarkEnabled !== undefined) contextWatermarkEnabled = market.isWatermarkEnabled;
    }
  } catch (e) {
    // fallback if outside provider
  }

  const finalWatermarkText = customWatermarkTextProp ?? contextWatermarkText;
  const finalWatermarkOpacity = customWatermarkOpacityProp ?? contextWatermarkOpacity;
  const isEnabled = showWatermarkProp && contextWatermarkEnabled;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 tracking-wider',
    md: 'text-[10px] sm:text-[11px] px-2.5 py-1 tracking-widest',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5 tracking-widest',
  };

  const fallbackSrc = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
  const effectiveSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div
      className={`relative overflow-hidden select-none bg-slate-100 dark:bg-slate-800 ${className}`}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onClick={onClick}
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <img
        src={effectiveSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        className={`pointer-events-none select-none transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-80'} ${imgClassName}`}
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      />

      {/* Transparent overlay interceptor to block right-clicks and image downloads */}
      <div
        className="absolute inset-0 z-0 bg-transparent cursor-inherit"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      />

      {/* Centered Watermark with opacity control */}
      {isEnabled && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 transition-opacity duration-300"
          style={{ opacity: finalWatermarkOpacity }}
        >
          <div className="transform -rotate-12 transition-transform duration-300">
            <span
              className={`font-black uppercase bg-black/40 text-white rounded-md border border-white/20 inline-block text-center select-none ${sizeClasses[watermarkSize]}`}
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {finalWatermarkText === 'MarketBD.Net' ? (
                <>
                  <span className="text-red-500 font-black">M</span>
                  <span className="text-white font-extrabold">arketBD.</span>
                  <span className="text-red-500 font-black">Net</span>
                </>
              ) : (
                finalWatermarkText
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
