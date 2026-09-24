import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshData';
import {
  MapPin,
  Plus,
  Trash2,
  Search,
  Check,
  Building,
  Globe2,
  ChevronRight
} from 'lucide-react';

export const LocationAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [divisions, setDivisions] = useState<string[]>(() => {
    return BANGLADESH_DIVISIONS.map(d => d.nameEn);
  });

  const [selectedDivision, setSelectedDivision] = useState<string>(() => {
    return BANGLADESH_DIVISIONS[0]?.nameEn || 'Dhaka';
  });

  const [districtsMap, setDistrictsMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    BANGLADESH_DIVISIONS.forEach(div => {
      map[div.nameEn] = div.districts.map(dist => dist.nameEn);
    });
    return map;
  });

  const [newDivisionInput, setNewDivisionInput] = useState('');
  const [newAreaInput, setNewAreaInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const activeDistricts = districtsMap[selectedDivision] || [];

  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivisionInput.trim()) return;
    const divName = newDivisionInput.trim();
    if (!divisions.includes(divName)) {
      setDivisions(prev => [...prev, divName]);
      setDistrictsMap(prev => ({ ...prev, [divName]: ['Sadar', 'City Center'] }));
      setSelectedDivision(divName);
      setToastMsg(language === 'bn' ? '✓ নতুন বিভাগ যোগ করা হয়েছে!' : '✓ Division added!');
      setTimeout(() => setToastMsg(''), 3000);
    }
    setNewDivisionInput('');
  };

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaInput.trim()) return;
    const areaName = newAreaInput.trim();
    setDistrictsMap(prev => {
      const existing = prev[selectedDivision] || [];
      if (existing.includes(areaName)) return prev;
      return { ...prev, [selectedDivision]: [...existing, areaName] };
    });
    setNewAreaInput('');
    setToastMsg(language === 'bn' ? '✓ নতুন এলাকা যোগ করা হয়েছে!' : '✓ Area added!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDeleteArea = (areaName: string) => {
    setDistrictsMap(prev => ({
      ...prev,
      [selectedDivision]: (prev[selectedDivision] || []).filter(a => a !== areaName)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-rose-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Geo Management
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '📍 লোকেশন, বিভাগ, জেলা ও এলাকা সিস্টেম' : '📍 Location, Division, District & Area Manager'}
            </h2>
          </div>
          <p className="text-xs text-rose-200 max-w-xl">
            {language === 'bn'
              ? 'বাংলাদেশের ৮টি বিভাগ, ৬৪টি জেলা ও থানা এলাকা নিয়ন্ত্রণ ও নতুন লোকেশন সংযুক্ত করুন।'
              : 'Manage divisions, districts, thanas, and custom location tags for localized ad placement.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-2xl border border-rose-500/30 text-xs font-bold text-rose-300">
          <Globe2 className="w-5 h-5 text-rose-400" />
          <span>Total Divisions: {divisions.length}</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Division List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-rose-500" />
              <span>{language === 'bn' ? 'বিভাগসমূহ (Divisions)' : 'Divisions'} ({divisions.length})</span>
            </h3>
          </div>

          <form onSubmit={handleAddDivision} className="flex gap-2">
            <input
              type="text"
              value={newDivisionInput}
              onChange={(e) => setNewDivisionInput(e.target.value)}
              placeholder={language === 'bn' ? 'নতুন বিভাগের নাম...' : 'New division name...'}
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {divisions.map((divName) => (
              <button
                key={divName}
                type="button"
                onClick={() => setSelectedDivision(divName)}
                className={`w-full text-left p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-between transition cursor-pointer ${
                  selectedDivision === divName
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 opacity-80" />
                  <span>{divName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 font-mono">
                    {(districtsMap[divName] || []).length} districts
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Division Area/District Manager */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider">
                Selected Division Locations
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedDivision} Division
              </h3>
            </div>
          </div>

          {/* Add New District Form */}
          <form onSubmit={handleAddArea} className="space-y-3">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {language === 'bn' ? 'নতুন জেলা বা এলাকা যোগ করুন' : 'Add New Area / District'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: গুলশান, ধানমণ্ডি, মিরপুর...' : 'e.g. Gulshan, Dhanmondi, Mirpur...'}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'যোগ করুন' : 'Add Location'}</span>
              </button>
            </div>
          </form>

          {/* Existing Areas Badges */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
              Active Areas in {selectedDivision} ({activeDistricts.length}):
            </h4>

            <div className="flex flex-wrap gap-2.5 max-h-[350px] overflow-y-auto">
              {activeDistricts.map((area) => (
                <div
                  key={area}
                  className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteArea(area)}
                    className="text-red-500 hover:text-red-700 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
