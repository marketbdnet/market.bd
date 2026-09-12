import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { WatermarkedImage } from '../Product/WatermarkedImage';
import { GitCompare, X, Trash2, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';

export const CompareModal: React.FC = () => {
  const {
    language,
    compareList,
    toggleCompare,
    clearCompare,
    setSelectedProduct,
    setActiveTab,
    goBack
  } = useMarket();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'bn' ? 'পণ্য তুলনা করুন (Product Comparison)' : 'Product Comparison'}
            </h2>
          </div>

          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-xs text-red-600 hover:underline flex items-center gap-1 font-bold"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
            </button>
          )}
        </div>

        {compareList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-3">
            <GitCompare className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-sm font-semibold">
              {language === 'bn'
                ? 'তুলনা করার জন্য কোনো প্রোডাক্ট বেছে নেওয়া হয়নি।'
                : 'No products selected for comparison.'}
            </p>
            <p className="text-xs">
              {language === 'bn'
                ? 'বিজ্ঞাপন কার্ডে থাকা "তুলনা" বাটনে ক্লিক করে যোগ করুন (সর্বোচ্চ ৪ টি)।'
                : 'Click compare on any product card to add up to 4 items.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-gray-50 text-gray-500 font-bold w-36">
                    {language === 'bn' ? 'বৈশিষ্ট্য' : 'Feature'}
                  </th>
                  {compareList.map(prod => (
                    <th key={prod.id} className="p-3 border-l border-gray-100 min-w-[200px] relative">
                      <button
                        onClick={() => toggleCompare(prod)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <WatermarkedImage
                        src={(Array.isArray(prod.images) && prod.images.length > 0 && prod.images[0]) ? prod.images[0] : ((prod as any).image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80')}
                        alt={prod.title || 'Product'}
                        watermarkSize="sm"
                        imgClassName="w-24 h-24 object-cover rounded-xl mx-auto mb-2"
                        className="w-24 h-24 mx-auto mb-2"
                      />
                      <h4 className="font-bold text-gray-900 text-xs line-clamp-2 text-center">
                        {prod.title}
                      </h4>
                      <div className="text-center mt-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(prod);
                            setActiveTab('product-details');
                          }}
                          className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg hover:bg-emerald-800"
                        >
                          {language === 'bn' ? 'বিস্তারিত' : 'View'}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 font-bold text-gray-700 bg-gray-50">
                    {language === 'bn' ? 'মূল্য (BDT)' : 'Price'}
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-3 border-l border-gray-100 font-black text-emerald-800 text-sm">
                      ৳{p.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 bg-gray-50">
                    {language === 'bn' ? 'কন্ডিশন' : 'Condition'}
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-3 border-l border-gray-100 text-gray-800 font-medium">
                      {p.condition}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 bg-gray-50">
                    {language === 'bn' ? 'লোকেশন' : 'Location'}
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-3 border-l border-gray-100 text-gray-600">
                      📍 {p.location.thana}, {p.location.district}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 bg-gray-50">
                    {language === 'bn' ? 'ওয়ারেন্টি' : 'Warranty'}
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-3 border-l border-gray-100 text-emerald-700 font-medium">
                      {p.warranty || 'N/A'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
