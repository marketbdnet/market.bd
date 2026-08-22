import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshData';
import { MapPin, X, ChevronRight, Check, Search } from 'lucide-react';

export const LocationModal: React.FC = () => {
  const {
    language,
    selectedLocation,
    setSelectedLocation,
    isLocationModalOpen,
    setIsLocationModalOpen
  } = useMarket();

  const [activeDivision, setActiveDivision] = useState<string>('dhaka');
  const [activeDistrict, setActiveDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isLocationModalOpen) return null;

  const currentDivData = BANGLADESH_DIVISIONS.find(d => d.id === activeDivision);
  const currentDistData = currentDivData?.districts.find(d => d.id === activeDistrict);

  // Search results across all divisions, districts and thanas
  const searchResults: { divisionName: string; districtName: string; thanaName: string }[] = [];
  if (searchQuery.trim().length >= 2) {
    const q = searchQuery.trim().toLowerCase();
    BANGLADESH_DIVISIONS.forEach(div => {
      const divName = language === 'bn' ? div.nameBn : div.nameEn;
      div.districts.forEach(dist => {
        const distName = language === 'bn' ? dist.nameBn : dist.nameEn;
        if (dist.nameEn.toLowerCase().includes(q) || dist.nameBn.includes(q)) {
          searchResults.push({ divisionName: divName, districtName: distName, thanaName: '' });
        }
        dist.thanas.forEach(th => {
          const thanaName = language === 'bn' ? th.nameBn : th.nameEn;
          if (th.nameEn.toLowerCase().includes(q) || th.nameBn.includes(q)) {
            searchResults.push({ divisionName: divName, districtName: distName, thanaName: thanaName });
          }
        });
      });
    });
  }

  const handleSelectEntireBangladesh = () => {
    setSelectedLocation({
      division: language === 'bn' ? 'সারা বাংলাদেশ' : 'All Bangladesh',
      district: '',
      thana: ''
    });
    setIsLocationModalOpen(false);
  };

  const handleSelectDivision = (divNameBn: string, divNameEn: string) => {
    setSelectedLocation({
      division: language === 'bn' ? divNameBn : divNameEn,
      district: '',
      thana: ''
    });
    setIsLocationModalOpen(false);
  };

  const handleSelectDistrict = (distNameBn: string, distNameEn: string) => {
    const divName = currentDivData ? (language === 'bn' ? currentDivData.nameBn : currentDivData.nameEn) : '';
    setSelectedLocation({
      division: divName,
      district: language === 'bn' ? distNameBn : distNameEn,
      thana: ''
    });
    setIsLocationModalOpen(false);
  };

  const handleSelectThana = (thanaNameBn: string, thanaNameEn: string) => {
    const divName = currentDivData ? (language === 'bn' ? currentDivData.nameBn : currentDivData.nameEn) : '';
    const distName = currentDistData ? (language === 'bn' ? currentDistData.nameBn : currentDistData.nameEn) : '';
    setSelectedLocation({
      division: divName,
      district: distName,
      thana: language === 'bn' ? thanaNameBn : thanaNameEn
    });
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-pink-200" />
            <div>
              <h2 className="text-lg font-bold">
                {language === 'bn' ? 'লোকেশন সিলেক্ট করুন' : 'Select Location'}
              </h2>
              <p className="text-xs text-pink-100">
                {language === 'bn' ? 'আপনার বিভাগ, জেলা বা থানা বেছে নিন' : 'Choose your division, district or thana'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-pink-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Select All & Search Bar */}
        <div className="p-3 bg-pink-50/50 dark:bg-slate-800/80 border-b border-pink-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'বর্তমান লোকেশন:' : 'Current Location:'} <strong className="text-pink-600 dark:text-pink-400">{selectedLocation.thana || selectedLocation.district || selectedLocation.division}</strong>
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'জেলা বা থানা সার্চ করুন...' : 'Search district or thana...'}
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-pink-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSelectEntireBangladesh}
              className="text-xs bg-pink-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-pink-700 transition flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {language === 'bn' ? 'সারা বাংলাদেশ' : 'All Bangladesh'}
            </button>
          </div>
        </div>

        {/* Popular Locations Quick Tags */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs text-slate-700 dark:text-slate-200">
          <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            {language === 'bn' ? 'জনপ্রিয়:' : 'Popular:'}
          </span>
          {['মিরপুর', 'ধানমন্ডি', 'উত্তরা', 'চট্টগ্রাম সদর', 'সিলেট', 'বগুড়া', 'বরিশাল সদর', 'রংপুর সদর', 'যশোর'].map((loc, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedLocation({ division: 'Dhaka', district: 'Dhaka', thana: loc });
                setIsLocationModalOpen(false);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition shrink-0 cursor-pointer text-slate-800 dark:text-slate-200"
            >
              📍 {loc}
            </button>
          ))}
        </div>

        {/* Live Search Results View if Searching */}
        {searchQuery.trim().length >= 2 ? (
          <div className="p-3 max-h-[350px] overflow-y-auto divide-y divide-slate-100 flex-1">
            <div className="text-xs font-bold text-slate-500 mb-2">
              {language === 'bn' ? `সার্চ ফলাফল (${searchResults.length}টি পাওয়া গেছে):` : `Search Results (${searchResults.length} found):`}
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLocation({
                      division: res.divisionName,
                      district: res.districtName,
                      thana: res.thanaName
                    });
                    setIsLocationModalOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left py-2.5 px-3 hover:bg-pink-50 rounded-lg flex items-center justify-between text-sm transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {res.thanaName ? res.thanaName : res.districtName}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {res.thanaName ? `${res.districtName}, ${res.divisionName}` : res.divisionName}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-slate-500 italic">
                {language === 'bn' ? 'কোনো জেলা বা থানা পাওয়া যায়নি' : 'No matching district or thana found'}
              </p>
            )}
          </div>
        ) : (
          /* Multi-Column Browser */
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 flex-1 overflow-hidden">
            {/* Column 1: Divisions */}
            <div className="overflow-y-auto p-2 max-h-[300px] md:max-h-[400px]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {language === 'bn' ? '১. বিভাগ সমূহ' : '1. Divisions'}
              </div>
              {BANGLADESH_DIVISIONS.map(div => {
                const isActive = activeDivision === div.id;
                return (
                  <button
                    key={div.id}
                    onClick={() => {
                      setActiveDivision(div.id);
                      setActiveDistrict('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition ${
                      isActive ? 'bg-pink-50 text-pink-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{language === 'bn' ? div.nameBn : div.nameEn}</span>
                    <div className="flex items-center gap-1">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDivision(div.nameBn, div.nameEn);
                        }}
                        className="text-[11px] text-pink-600 hover:underline px-1.5 py-0.5 rounded bg-white border border-pink-200"
                        title="Select whole division"
                      >
                        {language === 'bn' ? 'সব' : 'All'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Column 2: Districts */}
            <div className="overflow-y-auto p-2 max-h-[300px] md:max-h-[400px]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {language === 'bn' ? '২. জেলা সমূহ' : '2. Districts'}
              </div>
              {currentDivData?.districts.map(dist => {
                const isActive = activeDistrict === dist.id;
                return (
                  <button
                    key={dist.id}
                    onClick={() => setActiveDistrict(dist.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition ${
                      isActive ? 'bg-pink-50 text-pink-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{language === 'bn' ? dist.nameBn : dist.nameEn}</span>
                    <div className="flex items-center gap-1">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDistrict(dist.nameBn, dist.nameEn);
                        }}
                        className="text-[11px] text-pink-600 hover:underline px-1.5 py-0.5 rounded bg-white border border-pink-200"
                      >
                        {language === 'bn' ? 'সব' : 'All'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Column 3: Thanas */}
            <div className="overflow-y-auto p-2 max-h-[300px] md:max-h-[400px]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {language === 'bn' ? '৩. থানা / এলাকা' : '3. Thanas / Areas'}
              </div>
              {currentDistData ? (
                currentDistData.thanas.map(thana => (
                  <button
                    key={thana.id}
                    onClick={() => handleSelectThana(thana.nameBn, thana.nameEn)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-pink-50 hover:text-pink-700 text-slate-700 transition flex items-center justify-between"
                  >
                    <span>{language === 'bn' ? thana.nameBn : thana.nameEn}</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 p-3 italic text-center">
                  {language === 'bn' ? 'থানা দেখার জন্য বামপাশ থেকে জেলা বেছে নিন' : 'Select a district to view thanas'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-right">
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-xl transition"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
