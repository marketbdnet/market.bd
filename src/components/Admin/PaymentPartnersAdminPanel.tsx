import React, { useState, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import { PaymentPartnerItem } from '../../types';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Building2,
  Smartphone
} from 'lucide-react';

export const PaymentPartnersAdminPanel: React.FC = () => {
  const {
    language,
    paymentPartners,
    addPaymentPartner,
    updatePaymentPartner,
    deletePaymentPartner,
    resetPaymentPartnersToDefault
  } = useMarket();

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mfs' | 'card' | 'bank' | 'other'>('all');

  // Add Partner Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState<'mfs' | 'card' | 'bank' | 'other'>('mfs');
  const [newPartnerLogoUrl, setNewPartnerLogoUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Partner Modal / Form State
  const [editingPartner, setEditingPartner] = useState<PaymentPartnerItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<'mfs' | 'card' | 'bank' | 'other'>('mfs');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল (PNG, JPG, WebP, SVG) সিলেক্ট করুন।' : 'Please select an image file (PNG, JPG, WebP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (isEdit) {
        setEditLogoUrl(base64);
      } else {
        setNewPartnerLogoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে পার্টনারের নাম লিখুন।' : 'Please enter partner name.');
      return;
    }

    addPaymentPartner({
      name: newPartnerName.trim(),
      category: newPartnerCategory,
      logoUrl: newPartnerLogoUrl.trim() || undefined,
      isEnabled: true,
    });

    setNewPartnerName('');
    setNewPartnerCategory('mfs');
    setNewPartnerLogoUrl('');
    setFormError('');
    setShowAddModal(false);
    setSuccessMsg(language === 'bn' ? '✓ নতুন পেমেন্ট পার্টনার লোগো সফলভাবে যুক্ত হয়েছে!' : '✓ Payment partner added successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    if (!editName.trim()) return;

    updatePaymentPartner(editingPartner.id, {
      name: editName.trim(),
      category: editCategory,
      logoUrl: editLogoUrl.trim() || undefined,
    });

    setEditingPartner(null);
    setSuccessMsg(language === 'bn' ? '✓ পার্টনার লোগো ও তথ্য আপডেট করা হয়েছে!' : '✓ Partner details updated!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openEditModal = (partner: PaymentPartnerItem) => {
    setEditingPartner(partner);
    setEditName(partner.name);
    setEditCategory(partner.category);
    setEditLogoUrl(partner.logoUrl || '');
  };

  const filteredPartners = paymentPartners.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Payment Partners
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '💳 অফিসিয়াল পেমেন্ট পার্টনারস লোগো ম্যানেজার' : '💳 Official Payment Partners Logo Manager'}
            </h2>
          </div>
          <p className="text-xs text-indigo-200 max-w-xl">
            {language === 'bn'
              ? 'ওয়েবসাইটের ফুটার ও হোমপেজে প্রদর্শিত সকল পেমেন্ট পার্টনার (বিকাশ, নগদ, ভিসা, ব্যাংক) এর লোগো সংযোজন, বিয়োজন ও এডিট করুন।'
              : 'Add, remove, or edit any official payment partner logos displayed across MarketBD.Net.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন লোগো যুক্ত করুন' : 'Add New Partner'}</span>
          </button>

          <button
            type="button"
            onClick={resetPaymentPartnersToDefault}
            title="Reset to default payment partners"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs border border-slate-700 cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl animate-in zoom-in-95 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'পার্টনারের নাম দিয়ে খুঁজুন...' : 'Search partners...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {[
            { id: 'all', labelBn: 'সবগুলো', labelEn: 'All Partners' },
            { id: 'mfs', labelBn: 'মোবাইল ব্যংকিং (MFS)', labelEn: 'Mobile Banking' },
            { id: 'card', labelBn: 'কার্ড (Cards)', labelEn: 'Cards' },
            { id: 'bank', labelBn: 'ব্যাংক (Banks)', labelEn: 'Banks' },
            { id: 'other', labelBn: 'অন্যান্য (Gateways)', labelEn: 'Other Gateways' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Partners List Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className={`p-3.5 bg-white dark:bg-slate-900 rounded-2xl border shadow-xs transition duration-200 flex flex-col justify-between space-y-3 relative group ${
              partner.isEnabled
                ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                : 'border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50 dark:bg-slate-950'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {partner.category.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updatePaymentPartner(partner.id, { isEnabled: !partner.isEnabled })
                  }
                  title={partner.isEnabled ? 'Active (Click to Disable)' : 'Inactive (Click to Enable)'}
                  className={`px-2 py-0.5 text-[10px] font-black rounded-full cursor-pointer transition ${
                    partner.isEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {partner.isEnabled ? (language === 'bn' ? 'চালু' : 'Active') : (language === 'bn' ? 'বন্ধ' : 'Disabled')}
                </button>
              </div>

              {/* Logo Box */}
              <div className="h-14 w-full bg-slate-950 rounded-xl flex items-center justify-center p-2 border border-slate-800 overflow-hidden">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-xs font-black text-yellow-300 tracking-tight block">
                      {partner.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">Official Partner</span>
                  </div>
                )}
              </div>

              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate" title={partner.name}>
                {partner.name}
              </h4>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <button
                type="button"
                onClick={() => openEditModal(partner)}
                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>{language === 'bn' ? 'ইডিট' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(language === 'bn' ? `"${partner.name}" পার্টনার লোগো ডিলিট করতে নিশ্চিত?` : `Delete "${partner.name}" logo?`)) {
                    deletePaymentPartner(partner.id);
                  }
                }}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition cursor-pointer"
                title="Delete Partner Logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <span>{language === 'bn' ? 'নতুন পেমেন্ট পার্টনার যুক্ত করুন' : 'Add Official Payment Partner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'পার্টনারের নাম (Partner Name)' : 'Partner Name'}
                </label>
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="e.g. Dutch-Bangla Bank / Tap / CellFin"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি (Category)' : 'Category'}
                  </label>
                  <select
                    value={newPartnerCategory}
                    onChange={(e) => setNewPartnerCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="mfs">Mobile Banking (MFS)</option>
                    <option value="card">Cards (Debit/Credit)</option>
                    <option value="bank">Banking</option>
                    <option value="other">Other Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'লোগো ফাইল আপলোড' : 'Upload Logo File'}
                  </label>
                  <input
                    type="file"
                    ref={addFileInputRef}
                    onChange={(e) => handleLogoUpload(e, false)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ছবি ব্রাউজ' : 'Browse Logo'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'অথবা লোগো ইমেজ ইউআরএল (Logo Image URL)' : 'Or Logo Image URL'}
                </label>
                <input
                  type="text"
                  value={newPartnerLogoUrl}
                  onChange={(e) => setNewPartnerLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Logo Preview */}
              {newPartnerLogoUrl && (
                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Logo Preview:</span>
                  <div className="h-10 w-24 bg-black rounded-lg flex items-center justify-center p-1">
                    <img src={newPartnerLogoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}

              {formError && <p className="text-xs font-bold text-red-500">{formError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
              >
                {language === 'bn' ? 'পার্টনার লোগো সংরক্ষণ করুন' : 'Save Partner Logo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <span>{language === 'bn' ? 'পার্টনার লোগো ও তথ্য ইডিট' : 'Edit Payment Partner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'পার্টনারের নাম (Partner Name)' : 'Partner Name'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="mfs">Mobile Banking (MFS)</option>
                    <option value="card">Cards (Debit/Credit)</option>
                    <option value="bank">Banking</option>
                    <option value="other">Other Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'নতুন লোগো আপলোড' : 'Upload New Logo'}
                  </label>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={(e) => handleLogoUpload(e, true)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ছবি পরিবর্তন' : 'Change Logo'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'লোগো ইমেজ ইউআরএল (Logo Image URL)' : 'Logo Image URL'}
                </label>
                <input
                  type="text"
                  value={editLogoUrl}
                  onChange={(e) => setEditLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {editLogoUrl && (
                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Logo Preview:</span>
                  <div className="h-10 w-24 bg-black rounded-lg flex items-center justify-center p-1">
                    <img src={editLogoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
              >
                {language === 'bn' ? 'আপডেট পরিবর্তন সংরক্ষণ করুন' : 'Update Partner Info'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
