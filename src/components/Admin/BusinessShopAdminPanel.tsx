import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Store,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  Award,
  PackageCheck,
  Building2,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  BadgeAlert
} from 'lucide-react';

interface ShopAccount {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  category: string;
  location: string;
  verified: boolean;
  packagePlan: 'Free' | 'Basic Shop' | 'Pro Business' | 'Enterprise';
  adsCount: number;
  tradeLicenseNo: string;
  joinedDate: string;
}

export const BusinessShopAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [shops, setShops] = useState<ShopAccount[]>([
    {
      id: 'shop-1',
      shopName: 'M/S Dhaka Electronics & Gadgets',
      ownerName: 'Rafiqul Islam',
      phone: '01711223344',
      category: 'Electronics',
      location: 'Motijheel, Dhaka',
      verified: true,
      packagePlan: 'Pro Business',
      adsCount: 42,
      tradeLicenseNo: 'TRD-8821039',
      joinedDate: '2025-01-15'
    },
    {
      id: 'shop-2',
      shopName: 'Chittagong Car Selection Store',
      ownerName: 'Kamrul Hasan',
      phone: '01819876543',
      category: 'Vehicles',
      location: 'Agrabad, Chattogram',
      verified: true,
      packagePlan: 'Enterprise',
      adsCount: 18,
      tradeLicenseNo: 'TRD-4491021',
      joinedDate: '2025-02-01'
    },
    {
      id: 'shop-3',
      shopName: 'Sylhet Smart Mobile Bazaar',
      ownerName: 'Mahbub Alam',
      phone: '01912345678',
      category: 'Mobile Phones',
      location: 'Zindabazar, Sylhet',
      verified: false,
      packagePlan: 'Basic Shop',
      adsCount: 9,
      tradeLicenseNo: 'TRD-1029384',
      joinedDate: '2025-03-10'
    },
    {
      id: 'shop-4',
      shopName: 'Bogura Agro Machinery Mart',
      ownerName: 'Zahir Uddin',
      phone: '01755667788',
      category: 'Agro & Industrial',
      location: 'Bogura Sadar, Bogura',
      verified: false,
      packagePlan: 'Free',
      adsCount: 3,
      tradeLicenseNo: 'TRD-5510293',
      joinedDate: '2025-03-28'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'unverified'>('all');

  const toggleVerification = (shopId: string) => {
    setShops(prev =>
      prev.map(shop => {
        if (shop.id === shopId) {
          return { ...shop, verified: !shop.verified };
        }
        return shop;
      })
    );
  };

  const updatePackage = (shopId: string, newPlan: ShopAccount['packagePlan']) => {
    setShops(prev =>
      prev.map(shop => {
        if (shop.id === shopId) {
          return { ...shop, packagePlan: newPlan };
        }
        return shop;
      })
    );
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch =
      shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.phone.includes(searchTerm);
    if (filterType === 'verified') return matchesSearch && shop.verified;
    if (filterType === 'unverified') return matchesSearch && !shop.verified;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              B2B Business Accounts
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '🏪 বিজনেস সেলার, শপ প্রোফাইল ও মেম্বারশিপ' : '🏪 Business Seller & Shop Management'}
            </h2>
          </div>
          <p className="text-xs text-emerald-200 max-w-xl">
            {language === 'bn'
              ? 'ব্যবসায়িক শপ প্রোফাইলসমূহ ভেরিফাই করুন, মেম্বারশিপ প্যাকেজ বরাদ্দ করুন এবং অফিসিয়াল ব্যাজ প্রদান করুন।'
              : 'Verify trade licenses, assign shop membership packages, and manage verified seller badges.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-2xl border border-emerald-500/30 text-xs font-bold text-emerald-300">
          <Store className="w-5 h-5 text-emerald-400" />
          <span>Total Businesses: {shops.length}</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="search"
            name="admin_shop_search_filter"
            id="admin-shop-search-filter"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            inputMode="search"
            data-lpignore="true"
            data-form-type="other"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'দোকান, মালিক বা ফোন নম্বর খুঁজুন...' : 'Search shop or owner...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({shops.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('verified')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 ${
              filterType === 'verified'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified ({shops.filter(s => s.verified).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unverified')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 ${
              filterType === 'unverified'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}
          >
            <BadgeAlert className="w-3.5 h-3.5" />
            <span>Pending ({shops.filter(s => !s.verified).length})</span>
          </button>
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">{language === 'bn' ? 'দোকানের নাম ও মালিক' : 'Shop & Owner'}</th>
                <th className="p-4">{language === 'bn' ? 'যোগাযোগ ও লোকেশন' : 'Contact & Location'}</th>
                <th className="p-4">{language === 'bn' ? 'ট্রেড লাইসেন্স নম্বর' : 'Trade License'}</th>
                <th className="p-4">{language === 'bn' ? 'মেম্বারশিপ প্যাকেজ' : 'Membership Plan'}</th>
                <th className="p-4 text-center">{language === 'bn' ? 'ভেরিফিকেশন স্ট্যাটাস' : 'Verification'}</th>
                <th className="p-4 text-right">{language === 'bn' ? 'একশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
              {filteredShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{shop.shopName}</span>
                          {shop.verified && <ShieldCheck className="w-4 h-4 text-emerald-500 inline" />}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Proprietor: {shop.ownerName} ({shop.adsCount} Active Ads)
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono">
                        <Phone className="w-3.5 h-3.5 text-sky-500" />
                        <span>{shop.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{shop.location}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px]">
                      {shop.tradeLicenseNo}
                    </span>
                  </td>

                  <td className="p-4">
                    <select
                      value={shop.packagePlan}
                      onChange={(e) => updatePackage(shop.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <option value="Free">Free Account</option>
                      <option value="Basic Shop">Basic Shop</option>
                      <option value="Pro Business">Pro Business</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </td>

                  <td className="p-4 text-center">
                    {shop.verified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-[11px] font-black">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Verified Shop</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full text-[11px] font-black">
                        <BadgeAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Unverified</span>
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleVerification(shop.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        shop.verified
                          ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 hover:bg-red-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                      }`}
                    >
                      {shop.verified ? 'Revoke Verification' : 'Approve & Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
