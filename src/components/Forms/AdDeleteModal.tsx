import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Trash2, AlertTriangle, X, CheckCircle, Sparkles, Check } from 'lucide-react';

const REMOVAL_REASONS = [
  { 
    id: 'sold_here', 
    icon: '💰', 
    bn: 'MarketBD.Net-এ সফলভাবে বিক্রি হয়ে গেছে', 
    en: 'Item sold successfully on MarketBD.Net' 
  },
  { 
    id: 'sold_elsewhere', 
    icon: '🏬', 
    bn: 'অন্য প্ল্যাটফর্মে / দোকানে বিক্রি হয়েছে', 
    en: 'Item sold elsewhere (Shop / Facebook / Other)' 
  },
  { 
    id: 'wrong_info', 
    icon: '✏️', 
    bn: 'ভুল তথ্য বা দাম দিয়েছিলাম (নতুন করে পোস্ট করবো)', 
    en: 'Incorrect info or price (Will re-post correctly)' 
  },
  { 
    id: 'changed_mind', 
    icon: '🛑', 
    bn: 'আপাতত বিক্রি করার সিদ্ধান্ত বাতিল করেছি', 
    en: 'Decided not to sell for now' 
  },
  { 
    id: 'too_many_offers', 
    icon: '📞', 
    bn: 'অতিরিক্ত কল / স্প্যাম অফার পেয়েছি', 
    en: 'Received too many spam calls or low-ball offers' 
  },
  { 
    id: 'other', 
    icon: '❓', 
    bn: 'অন্যান্য ব্যক্তিগত কারণ', 
    en: 'Other personal reason' 
  },
];

export const AdDeleteModal: React.FC = () => {
  const { language, adToDelete, closeDeleteModal, deleteProductWithReason, currentUser, userRole } = useMarket();
  const isAdmin = currentUser?.role === 'admin' || userRole === 'admin';

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!adToDelete) return null;

  const handleConfirmDelete = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalReason = selectedReason || customNote.trim() || (
      isAdmin
        ? (language === 'bn' ? 'এডমিন কর্তৃক সরাসরি অপসারণ' : 'Direct removal by Admin')
        : (language === 'bn' ? 'বিজ্ঞাপনদাতা কর্তৃক বিজ্ঞাপন মুছে ফেলা হয়েছে' : 'Ad removed by seller')
    );
    setErrorMsg('');
    deleteProductWithReason(adToDelete.id, finalReason, customNote.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 transition-all text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeDeleteModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {language === 'bn' ? 'বিজ্ঞাপন রিমুভ / মুছে ফেলা' : 'Remove Advertisement'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate max-w-[280px] sm:max-w-[340px]">
              "{adToDelete.title}"
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmDelete} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              {language === 'bn'
                ? 'বিজ্ঞাপনটি কি কারণে মুছে ফেলতে চান? নিচের যেকোনো একটি কারণে ক্লিক করুন অথবা নিচে বিস্তারিত লিখুন:'
                : 'Why are you removing this ad? Click any automatic reason below or write your custom reason:'}
            </p>
          </div>

          {/* Automatic 1-Click Reason Buttons */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>{language === 'bn' ? 'অটোমেটিক কারণ নির্বাচন করুন (ক্লিক করুন):' : 'Select Automatic Reason (Click One):'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REMOVAL_REASONS.map(r => {
                const reasonVal = language === 'bn' ? r.bn : r.en;
                const isSelected = selectedReason === reasonVal;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedReason(reasonVal);
                      setErrorMsg('');
                    }}
                    className={`p-3 rounded-2xl text-left text-xs font-bold transition-all duration-150 flex items-start justify-between gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base leading-none shrink-0 mt-0.5">{r.icon}</span>
                      <span className="leading-snug">{reasonVal}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'অন্য কোনো সুনির্দিষ্ট কারণ বা মন্তব্য লিখুন (ঐচ্ছিক):' : 'Custom Reason or Note (Optional):'}
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={e => {
                setCustomNote(e.target.value);
                setErrorMsg('');
              }}
              placeholder={language === 'bn' ? 'যেমন: কাস্টমার এসে নিয়ে গেছেন অথবা দাম পরিবর্তন করবো...' : 'e.g. Sold locally to a buyer...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-pink-500 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none transition"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold rounded-2xl animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'সফলভাবে মুছে ফেলুন' : 'Confirm Removal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
