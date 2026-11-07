import React from 'react';
import partnershipBadgeImg from '../../assets/images/market_bd_logo_1786102322044.jpg';
import paymentPartnersImg from '../../assets/images/payment_partners_1786191207981.jpg';
import { useMarket } from '../../context/MarketContext';

// Official Partnership Emblem Badge Component
export const PartnershipBadgeLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = 'h-12 w-auto max-w-[180px] object-contain',
  alt = 'MarketBD.Net Official Partnership Badge',
}) => {
  const { customLogoUrl } = useMarket();
  return (
    <img
      src={customLogoUrl || partnershipBadgeImg}
      alt={alt}
      className={`object-contain ${className}`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = partnershipBadgeImg;
      }}
    />
  );
};

// Official Google 'G' Color Logo
export const GoogleLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.13C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.22c-.25-.72-.38-1.49-.38-2.22s.13-1.5.38-2.22V6.65H1.29C.47 8.27 0 10.08 0 12s.47 3.73 1.29 5.35l3.99-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.65l3.99 3.13c.95-2.85 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

// Official Facebook 'f' Blue Logo
export const FacebookLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      d="M16.5 12H14V21H10.5V12H8.5V9H10.5V7.2C10.5 5.2 11.7 4 13.8 4C14.8 4 15.7 4.1 15.7 4.1V6.3H14.6C13.6 6.3 13.3 6.9 13.3 7.5V9H16.2L16.5 12Z"
      fill="white"
    />
  </svg>
);

// High Quality authentic bKash Logo Badge
export const BkashLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => (
  <div className="inline-flex items-center shrink-0">
    <svg className={className} viewBox="0 0 150 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="44" rx="10" fill="#E2136E" />
      {/* Official bKash Origami Crane/Bird Logo */}
      <g transform="translate(10, 6)">
        <path d="M 18 2 L 36 14 L 22 28 Z" fill="#FFFFFF" />
        <path d="M 22 28 L 36 14 L 38 22 Z" fill="#FCE4EC" />
        <path d="M 18 2 L 22 28 L 4 18 Z" fill="#F8BBD0" />
        <path d="M 36 14 L 44 4 L 38 22 Z" fill="#FFFFFF" />
        <path d="M 22 28 L 30 36 L 14 32 Z" fill="#E2136E" opacity="0.4" />
      </g>
      {/* bKash Official Typography */}
      <text x="56" y="29" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.8">
        bKash
      </text>
    </svg>
  </div>
);

// High Quality authentic Nagad Logo Badge
export const NagadLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => (
  <div className="inline-flex items-center shrink-0">
    <svg className={className} viewBox="0 0 150 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="44" rx="10" fill="#F37023" />
      {/* Nagad Swirl/Flame Emblem */}
      <g transform="translate(10, 6)">
        <circle cx="16" cy="16" r="14" fill="#E31D1A" />
        <path d="M 8 20 C 10 10, 24 8, 24 18 C 24 24, 16 26, 8 20 Z" fill="#FFFFFF" />
        <path d="M 12 18 C 14 12, 22 10, 20 18 C 18 22, 14 22, 12 18 Z" fill="#F37023" />
      </g>
      {/* Nagad Text in Bengali/English */}
      <text x="50" y="29" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="21" letterSpacing="-0.3">
        নগদ
      </text>
    </svg>
  </div>
);

// High Quality authentic Rocket (DBBL) Logo Badge
export const RocketLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => (
  <div className="inline-flex items-center shrink-0">
    <svg className={className} viewBox="0 0 150 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="44" rx="10" fill="#8C3494" />
      {/* DBBL Rocket Emblem */}
      <g transform="translate(10, 6)">
        <path d="M 16 2 C 22 10, 24 20, 16 30 C 8 20, 10 10, 16 2 Z" fill="#FFFFFF" />
        <path d="M 16 8 L 21 14 L 16 24 L 11 14 Z" fill="#E1BEE7" />
        <path d="M 9 22 L 2 28 L 9 26 Z" fill="#FFFFFF" />
        <path d="M 23 22 L 30 28 L 23 26 Z" fill="#FFFFFF" />
        <circle cx="16" cy="14" r="3" fill="#8C3494" />
      </g>
      {/* Rocket Text */}
      <text x="48" y="28" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" letterSpacing="-0.3">
        রকেট
      </text>
    </svg>
  </div>
);

// Gmail Red-Green-Blue-Yellow Envelope Logo
export const GmailLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 18V6C1.5 4.9 2.4 4 3.5 4H5V14L12 19L19 14V4H20.5C21.6 4 22.5 4.9 22.5 6V18C22.5 19.1 21.6 20 20.5 20H3.5C2.4 20 1.5 19.1 1.5 18Z" fill="#EA4335" />
    <path d="M19 4H20.5C21.6 4 22.5 4.9 22.5 6V8L12 15.5L1.5 8V6C1.5 4.9 2.4 4 3.5 4H5L12 9.5L19 4Z" fill="#34A853" />
    <path d="M1.5 6.5L12 14L22.5 6.5V6C22.5 4.9 21.6 4 20.5 4H19L12 9.5L5 4H3.5C2.4 4 1.5 4.9 1.5 6V6.5Z" fill="#4285F4" />
    <path d="M5 4H3.5C2.4 4 1.5 4.9 1.5 6V8L5 10.5V4Z" fill="#FBBC04" />
  </svg>
);

/* ====================================================================
   NEW: Payment Partners Badges Matching Exact Design from User Image
   (2 Rows of 28 White Square Cards on Black Canvas)
   ==================================================================== */

// Helper white card wrapper
const PaymentCard: React.FC<{ children: React.ReactNode; alt?: string }> = ({ children, alt }) => (
  <div
    className="w-[56px] sm:w-[68px] h-[38px] sm:h-[44px] bg-white rounded-lg shadow-sm border border-gray-200/90 flex items-center justify-center p-1 shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
    title={alt}
  >
    {children}
  </div>
);

// Row 1 Cards
export const VisaBadge = () => (
  <PaymentCard alt="VISA">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <path d="M22 21L25 4H29.5L26.5 21H22ZM39.5 4.5C38.8 4.2 37.6 4 36.2 4C32.5 4 29.9 5.9 29.9 8.6C29.9 10.6 31.7 11.7 33.1 12.4C34.5 13.1 35 13.5 35 14.1C35 15 33.9 15.4 32.8 15.4C31.2 15.4 30.2 15 29.2 14.5L28.6 17.4C29.5 17.8 31.2 18.2 33 18.2 C36.9 18.2 39.4 16.3 39.4 13.4C39.4 10.8 37.8 9.7 35.7 8.7C34.4 8 33.5 7.6 33.5 6.8C33.5 6.2 34.3 5.5 35.8 5.5C37 5.5 38.1 5.7 38.9 6.1L39.5 4.5ZM51 21H54.3L51.5 4H48.4C47.7 4 47.1 4.4 46.8 5.1L41.5 21H45.4L46.2 18.8H50.6L51 21ZM47.2 16L49 11.1L50.1 16H47.2ZM19.3 4L15.5 21H11.5L8.6 8.5C8.4 7.8 8.1 7.4 7.5 7.1C6.5 6.5 4.8 6 3 5.6L3.2 4H9.6C10.5 4 11.2 4.6 11.4 5.6L13.8 15.2L17.7 4H19.3Z" fill="#1A1F71" />
      <path d="M8.6 8.5C8.4 7.8 8.1 7.4 7.5 7.1C6.5 6.5 4.8 6 3 5.6L3.2 4H9.6C10.5 4 11.2 4.6 11.4 5.6L13.8 15.2L13.9 15.5" fill="#F7B600" />
    </svg>
  </PaymentCard>
);

export const MastercardBadge = () => (
  <PaymentCard alt="Mastercard">
    <svg className="w-full h-full" viewBox="0 0 60 30" fill="none">
      <circle cx="23" cy="12" r="10" fill="#EB001B" />
      <circle cx="37" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
      <text x="30" y="27" textAnchor="middle" fill="#111827" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="6.5">mastercard.</text>
    </svg>
  </PaymentCard>
);

export const AmexBadge = () => (
  <PaymentCard alt="American Express">
    <div className="w-full h-full bg-[#006FCF] rounded flex items-center justify-center p-0.5">
      <div className="text-[6.5px] font-black text-white text-center leading-tight tracking-tighter">
        AMERICAN<br />EXPRESS
      </div>
    </div>
  </PaymentCard>
);

export const UnionPayBadge = () => (
  <PaymentCard alt="UnionPay">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <rect x="8" y="3" width="14" height="18" rx="2" fill="#E21319" />
      <rect x="22" y="3" width="14" height="18" rx="2" fill="#00447C" />
      <rect x="36" y="3" width="14" height="18" rx="2" fill="#00796B" />
      <text x="30" y="24" textAnchor="middle" fill="#00447C" fontFamily="sans-serif" fontWeight="900" fontSize="5.5">UnionPay 银联</text>
    </svg>
  </PaymentCard>
);

export const DinersClubBadge = () => (
  <PaymentCard alt="Diners Club">
    <svg className="w-full h-full" viewBox="0 0 40 26" fill="none">
      <circle cx="20" cy="13" r="11" fill="#0066B2" />
      <circle cx="15" cy="13" r="8" fill="#FFFFFF" />
      <circle cx="25" cy="13" r="8" fill="#FFFFFF" />
      <path d="M 20 4 L 20 22" stroke="#0066B2" strokeWidth="2" />
    </svg>
  </PaymentCard>
);

export const DbblNexusBadge = () => (
  <PaymentCard alt="DBBL NEXUS">
    <svg className="w-full h-full" viewBox="0 0 60 28" fill="none">
      <path d="M10 10 C15 2, 45 2, 50 10" stroke="#00529B" strokeWidth="3" fill="none" />
      <path d="M14 10 C18 5, 42 5, 46 10" stroke="#00A651" strokeWidth="2.5" fill="none" />
      <path d="M18 10 C21 7, 39 7, 42 10" stroke="#ED1C24" strokeWidth="2" fill="none" />
      <text x="30" y="23" textAnchor="middle" fill="#111827" fontFamily="sans-serif" fontWeight="900" fontSize="7">DBBL NEXUS</text>
    </svg>
  </PaymentCard>
);

export const BkashBadge = () => (
  <PaymentCard alt="bKash">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <text x="2" y="19" fill="#E2136E" fontFamily="'Calibri', 'Segoe UI', sans-serif" fontWeight="900" fontSize="14" letterSpacing="-0.5">bKash</text>
      <g transform="translate(38, 2)">
        <path d="M 10 1 L 20 8 L 12 16 Z" fill="#E2136E" />
        <path d="M 12 16 L 20 8 L 21 13 Z" fill="#C2185B" />
        <path d="M 10 1 L 12 16 L 2 10 Z" fill="#F8BBD0" />
      </g>
    </svg>
  </PaymentCard>
);

export const NagadBadge = () => (
  <PaymentCard alt="Nagad">
    <svg className="w-full h-full" viewBox="0 0 64 28" fill="none">
      {/* Nagad Swirl Flame Emblem */}
      <g transform="translate(2, 2)">
        <path d="M 10 2 C 16 2, 18 8, 14 14 C 10 20, 2 16, 4 10 C 6 4, 14 6, 12 12 Z" fill="#F37023" />
        <path d="M 12 6 C 18 8, 16 16, 10 18 C 4 20, 4 12, 10 8 Z" fill="#E31D1A" />
      </g>
      {/* Exact Bengali Spelling: নগদ */}
      <text x="26" y="17" fill="#E31D1A" fontFamily="'Hind Siliguri', 'Kalpurush', sans-serif" fontWeight="900" fontSize="13">নগদ</text>
      <text x="26" y="24" fill="#374151" fontFamily="sans-serif" fontWeight="600" fontSize="3.2">ডাক বিভাগের ডিজিটাল লেনদেন</text>
    </svg>
  </PaymentCard>
);

export const RocketBadge = () => (
  <PaymentCard alt="Rocket">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <g transform="translate(2, 2)">
        <path d="M 10 1 C 14 6, 15 12, 10 18 C 5 12, 6 6, 10 1 Z" fill="#8C3494" />
        <circle cx="10" cy="8" r="2" fill="#FFFFFF" />
      </g>
      {/* Exact Bengali Spelling: রকেট */}
      <text x="18" y="18" fill="#8C3494" fontFamily="'Hind Siliguri', sans-serif" fontWeight="900" fontSize="12">রকেট</text>
    </svg>
  </PaymentCard>
);

export const OkWalletBadge = () => (
  <PaymentCard alt="OK Wallet">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <circle cx="11" cy="13" r="9" fill="#FFD700" />
      <text x="11" y="16.5" textAnchor="middle" fill="#000" fontFamily="sans-serif" fontWeight="900" fontSize="9">OK</text>
      <text x="23" y="17" fill="#111827" fontFamily="sans-serif" fontWeight="900" fontSize="8">wallet</text>
      <text x="23" y="22" fill="#6B7280" fontFamily="sans-serif" fontWeight="600" fontSize="3.5">by ONE Bank</text>
    </svg>
  </PaymentCard>
);

export const SureCashBadge = () => (
  <PaymentCard alt="SureCash">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      {/* Exact Bengali Spelling: শিউারক্যাশ */}
      <text x="30" y="18" textAnchor="middle" fill="#0066B2" fontFamily="'Hind Siliguri', sans-serif" fontWeight="900" fontSize="10">শিউরক্যাশ</text>
    </svg>
  </PaymentCard>
);

export const UpayBadge = () => (
  <PaymentCard alt="Upay">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <text x="30" y="15" textAnchor="middle" fill="#E21319" fontFamily="sans-serif" fontWeight="900" fontSize="13">upay</text>
      <text x="30" y="22" textAnchor="middle" fill="#7C3AED" fontFamily="sans-serif" fontWeight="800" fontSize="4.5">DIGITAL TAKA</text>
    </svg>
  </PaymentCard>
);

export const DmoneyBadge = () => (
  <PaymentCard alt="Dmoney">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <g transform="translate(24, 0)">
        <circle cx="6" cy="6" r="4" fill="#F59E0B" />
        <circle cx="2" cy="10" r="3" fill="#EF4444" />
        <circle cx="10" cy="10" r="3" fill="#3B82F6" />
      </g>
      <text x="30" y="22" textAnchor="middle" fill="#374151" fontFamily="sans-serif" fontWeight="900" fontSize="8.5">Dmoney</text>
    </svg>
  </PaymentCard>
);

export const MCashBadge = () => (
  <PaymentCard alt="Islami Bank M Cash">
    <div className="w-full h-full bg-[#006837] rounded flex flex-col items-center justify-center p-0.5">
      <div className="text-[6.5px] font-black text-white leading-none">Islami Bank</div>
      <div className="text-[8.5px] font-black text-[#FFD700] leading-none mt-0.5">M CASH</div>
    </div>
  </PaymentCard>
);

export const MyCashBadge = () => (
  <PaymentCard alt="MYCash">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <rect x="8" y="3" width="44" height="20" rx="4" stroke="#00A651" strokeWidth="2" fill="none" />
      <text x="30" y="17" textAnchor="middle" fill="#00A651" fontFamily="sans-serif" fontWeight="900" fontSize="9">MYCash</text>
    </svg>
  </PaymentCard>
);

// Row 2 Cards
export const TCashBadge = () => (
  <PaymentCard alt="t-cash">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <circle cx="12" cy="13" r="8" fill="#E21319" />
      <path d="M 9 10 L 15 10 M 12 10 L 12 17" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
      <text x="23" y="17" fill="#006837" fontFamily="sans-serif" fontWeight="900" fontSize="10">t-cash</text>
    </svg>
  </PaymentCard>
);

export const QCashBadge = () => (
  <PaymentCard alt="Q Cash">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <circle cx="15" cy="13" r="9" fill="#ED1C24" />
      <text x="15" y="17.5" textAnchor="middle" fill="#FFF" fontFamily="sans-serif" fontWeight="900" fontSize="11">Q</text>
      <text x="28" y="17" fill="#111827" fontFamily="sans-serif" fontWeight="900" fontSize="10">CASH</text>
    </svg>
  </PaymentCard>
);

export const FastCashBadge = () => (
  <PaymentCard alt="FastCash">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <circle cx="12" cy="13" r="8" fill="#00A651" />
      <text x="12" y="16.5" textAnchor="middle" fill="#FFF" fontFamily="sans-serif" fontWeight="900" fontSize="8">CF</text>
      <text x="22" y="17" fill="#374151" fontFamily="sans-serif" fontWeight="900" fontSize="8">fastcash</text>
    </svg>
  </PaymentCard>
);

export const IslamiWalletBadge = () => (
  <PaymentCard alt="Islami Wallet">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <path d="M30 3 L34 9 L26 9 Z" fill="#006837" />
      <text x="30" y="21" textAnchor="middle" fill="#006837" fontFamily="sans-serif" fontWeight="900" fontSize="6.5">Islami Wallet</text>
    </svg>
  </PaymentCard>
);

export const CityTouchBadge = () => (
  <PaymentCard alt="city touch">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <rect x="6" y="4" width="16" height="16" fill="#ED1C24" rx="2" />
      <path d="M 6 4 L 22 20 M 14 4 L 22 12" stroke="#FFF" strokeWidth="1.5" />
      <text x="25" y="17" fill="#ED1C24" fontFamily="sans-serif" fontWeight="900" fontSize="7.5">citytouch</text>
    </svg>
  </PaymentCard>
);

export const BracBankBadge = () => (
  <PaymentCard alt="BRAC BANK">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <rect x="5" y="5" width="12" height="12" fill="#00529B" rx="2" />
      <rect x="8" y="8" width="6" height="6" fill="#F37023" />
      <text x="20" y="14" fill="#00529B" fontFamily="sans-serif" fontWeight="900" fontSize="6.8">BRAC BANK</text>
    </svg>
  </PaymentCard>
);

export const BankAsiaBadge = () => (
  <PaymentCard alt="Bank Asia">
    <div className="w-full h-full flex items-center justify-center gap-1">
      <div className="w-4 h-4 bg-[#00529B] rounded flex items-center justify-center text-white font-black text-[8px]">
        田
      </div>
      <div className="text-[7.5px] font-black text-[#00529B]">Bank Asia</div>
    </div>
  </PaymentCard>
);

export const IslamiBankBadge = () => (
  <PaymentCard alt="Islami Bank Bangladesh">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <circle cx="30" cy="10" r="7" fill="#006837" />
      <path d="M 30 5 L 31.5 8.5 L 35 8.5 L 32 10.5 L 33 14 L 30 12 L 27 14 L 28 10.5 L 25 8.5 L 28.5 8.5 Z" fill="#FFD700" />
      <text x="30" y="23" textAnchor="middle" fill="#006837" fontFamily="'Hind Siliguri', sans-serif" fontWeight="800" fontSize="4.8">ইসলামী ব্যাংক বাংলাদেশ</text>
    </svg>
  </PaymentCard>
);

export const AbBankBadge = () => (
  <PaymentCard alt="AB Bank">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <rect x="18" y="4" width="24" height="18" fill="#ED1C24" rx="3" />
      <text x="30" y="17" textAnchor="middle" fill="#FFF" fontFamily="sans-serif" fontWeight="900" fontSize="10">AB•</text>
    </svg>
  </PaymentCard>
);

export const MtbBadge = () => (
  <PaymentCard alt="MTB">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <rect x="8" y="6" width="12" height="12" stroke="#00447C" strokeWidth="1.5" />
      <text x="24" y="18" fill="#ED1C24" fontFamily="sans-serif" fontWeight="900" fontSize="11">MTB</text>
    </svg>
  </PaymentCard>
);

export const SbbBadge = () => (
  <PaymentCard alt="Southeast Bank">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <path d="M 15 6 C 25 2, 5 22, 25 18" stroke="#ED1C24" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 12 10 C 22 6, 2 26, 22 22" stroke="#00A651" strokeWidth="3" strokeLinecap="round" fill="none" />
      <text x="32" y="17" fill="#00529B" fontFamily="sans-serif" fontWeight="900" fontSize="9">SB</text>
    </svg>
  </PaymentCard>
);

export const IPayBadge = () => (
  <PaymentCard alt="iPay">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <text x="30" y="18" textAnchor="middle" fill="#00A651" fontFamily="sans-serif" fontWeight="900" fontSize="13">ipay</text>
    </svg>
  </PaymentCard>
);

export const TapNPayBadge = () => (
  <PaymentCard alt="Tap'n Pay">
    <svg className="w-full h-full" viewBox="0 0 60 26" fill="none">
      <path d="M 10 20 C 20 4, 40 4, 50 20" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="30" y="17" textAnchor="middle" fill="#00529B" fontFamily="sans-serif" fontWeight="900" fontSize="7">Tap'n Pay</text>
    </svg>
  </PaymentCard>
);

/* ====================================================================
   Complete Payment Partners Matrix Component (Dynamic from Admin Panel)
   ==================================================================== */
export const PaymentPartnersWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { paymentPartners } = useMarket();
  const activePartners = paymentPartners.filter((p) => p.isEnabled !== false);

  return (
    <div className={`p-3 sm:p-4 bg-black rounded-2xl border border-slate-800 shadow-2xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          অফিসিয়াল পেমেন্ট পার্টনারস (Official Payment Partners)
        </span>
        <span className="text-[10px] text-slate-400 font-medium">SSLCOMMERZ Verified Partners</span>
      </div>

      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-max">
          {activePartners.map((partner) => (
            <div
              key={partner.id}
              className="h-8 min-w-[70px] max-w-[120px] bg-white rounded-lg px-2.5 py-1 flex items-center justify-center border border-slate-200 shadow-xs hover:scale-105 transition shrink-0"
              title={partner.name}
            >
              {partner.logoUrl ? (
                <img src={partner.logoUrl} alt={partner.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[11px] font-black text-slate-900 tracking-tight text-center truncate">
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


