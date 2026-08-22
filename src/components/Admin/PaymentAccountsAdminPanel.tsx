import React, { useState, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import { BkashLogo, NagadLogo, RocketLogo } from '../Common/BrandLogos';
import {
  Smartphone,
  Building2,
  PhoneCall,
  Upload,
  Check,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

export const PaymentAccountsAdminPanel: React.FC = () => {
  const { language, paymentAccounts, updatePaymentAccounts } = useMarket();

  // Mobile Financial Services State
  const [bkashNumber, setBkashNumber] = useState(paymentAccounts.bkashNumber || '01723230230');
  const [bkashLogo, setBkashLogo] = useState(paymentAccounts.bkashLogoUrl || '');

  const [nagadNumber, setNagadNumber] = useState(paymentAccounts.nagadNumber || '01723230230');
  const [nagadLogo, setNagadLogo] = useState(paymentAccounts.nagadLogoUrl || '');

  const [rocketNumber, setRocketNumber] = useState(paymentAccounts.rocketNumber || '01533830784');
  const [rocketLogo, setRocketLogo] = useState(paymentAccounts.rocketLogoUrl || '');

  const [upayNumber, setUpayNumber] = useState(paymentAccounts.upayNumber || '01723230230');
  const [upayLogo, setUpayLogo] = useState(paymentAccounts.upayLogoUrl || '');

  // Bank Account State
  const [bankName, setBankName] = useState(paymentAccounts.bankAccount?.bankName || 'Islami Bank Bangladesh PLC');
  const [accountName, setAccountName] = useState(paymentAccounts.bankAccount?.accountName || 'MarketBD Net Technologies Ltd');
  const [accountNumber, setAccountNumber] = useState(paymentAccounts.bankAccount?.accountNumber || '2050 3928 1000 9281');
  const [branchName, setBranchName] = useState(paymentAccounts.bankAccount?.branchName || 'Dhanmondi Branch, Dhaka');
  const [routingNumber, setRoutingNumber] = useState(paymentAccounts.bankAccount?.routingNumber || '125263829');
  const [bankLogo, setBankLogo] = useState(paymentAccounts.bankAccount?.bankLogoUrl || '');
  const [isBankEnabled, setIsBankEnabled] = useState(paymentAccounts.bankAccount?.isEnabled !== false);

  const [statusMsg, setStatusMsg] = useState('');

  // Refs for File Inputs
  const bkashRef = useRef<HTMLInputElement>(null);
  const nagadRef = useRef<HTMLInputElement>(null);
  const rocketRef = useRef<HTMLInputElement>(null);
  const upayRef = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল নির্বাচন করুন।' : 'Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentAccounts = (e: React.FormEvent) => {
    e.preventDefault();

    updatePaymentAccounts({
      bkashNumber: bkashNumber.trim(),
      bkashLogoUrl: bkashLogo,
      nagadNumber: nagadNumber.trim(),
      nagadLogoUrl: nagadLogo,
      rocketNumber: rocketNumber.trim(),
      rocketLogoUrl: rocketLogo,
      upayNumber: upayNumber.trim(),
      upayLogoUrl: upayLogo,
      bankAccount: {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        branchName: branchName.trim(),
        routingNumber: routingNumber.trim(),
        bankLogoUrl: bankLogo,
        isEnabled: isBankEnabled,
      },
    });

    setStatusMsg(
      language === 'bn'
        ? '✅ আপডেট সফল হয়েছে! (Update Successfully) - বিকাশ, নগদ, রকেট মোবাইল নম্বর ও ব্যাংক একাউন্ট সেটিংস সংরক্ষিত হয়েছে।'
        : '✅ Update Successfully! - Payment numbers & bank details saved.'
    );
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-pink-950 via-purple-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-pink-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Payment Accounts
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '📱 প্রিমিয়াম পেমেন্ট মোবাইল নম্বর ও ব্যাংক একাউন্ট' : '📱 Premium Ad Mobile Payment Numbers & Bank Details'}
            </h2>
          </div>
          <p className="text-xs text-pink-200 max-w-xl">
            {language === 'bn'
              ? 'বিজ্ঞাপন প্রমোশন ফি গ্রহণের জন্য বিকাশ, নগদ, রকেট, উপায় নম্বর, লোগো এবং ব্যাংক একাউন্টের তথ্য পরিবর্তন ও ব্যবস্থাপনা করুন।'
              : 'Set custom receiver mobile numbers and bank accounts for seller ad promotions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Sync Active</span>
          </span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl animate-in zoom-in-95 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSavePaymentAccounts} className="space-y-6">
        {/* Section 1: Mobile Financial Services (bKash, Nagad, Rocket, Upay) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2.5 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-2xl border border-pink-200 dark:border-pink-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'bn' ? '১. মোবাইল ব্যাংকিং (MFS) রিসিভার নম্বর ও লোগো' : '1. Mobile Financial Services (MFS) Receiver Numbers'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'পেইড এড ইউজাররা এই নম্বরগুলোতে সেন্ড মানি/পেমেন্ট করবে' : 'Personal or Merchant numbers used for seller ad promotion fees'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* bKash Box */}
            <div className="p-4 bg-pink-50/50 dark:bg-pink-950/30 rounded-2xl border border-pink-200 dark:border-pink-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BkashLogo className="h-6 w-auto" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">bKash (বিকাশ)</span>
                </div>
                <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold bg-pink-100 dark:bg-pink-900/50 px-2 py-0.5 rounded">Personal / Merchant</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'বিকাশ নম্বর:' : 'bKash Number:'}
                </label>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="01723230230"
                  className="w-full px-3.5 py-2 border border-pink-300 dark:border-pink-800 rounded-xl text-xs font-black font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'কাস্টম বিকাশ লোগো (ঐচ্ছিক):' : 'Custom bKash Logo (Optional):'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={bkashRef}
                    onChange={(e) => handleFileUpload(e, setBkashLogo)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bkashRef.current?.click()}
                    className="px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লোগো ছবি আপলোড' : 'Upload Logo'}</span>
                  </button>
                  {bkashLogo && (
                    <img src={bkashLogo} alt="bKash Custom Logo" className="h-7 w-auto object-contain rounded border border-pink-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Nagad Box */}
            <div className="p-4 bg-orange-50/50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NagadLogo className="h-6 w-auto" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Nagad (নগদ)</span>
                </div>
                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded">Personal / Merchant</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'নগদ নম্বর:' : 'Nagad Number:'}
                </label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="01723230230"
                  className="w-full px-3.5 py-2 border border-orange-300 dark:border-orange-800 rounded-xl text-xs font-black font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'কাস্টম নগদ লোগো (ঐচ্ছিক):' : 'Custom Nagad Logo (Optional):'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={nagadRef}
                    onChange={(e) => handleFileUpload(e, setNagadLogo)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => nagadRef.current?.click()}
                    className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লোগো ছবি আপলোড' : 'Upload Logo'}</span>
                  </button>
                  {nagadLogo && (
                    <img src={nagadLogo} alt="Nagad Custom Logo" className="h-7 w-auto object-contain rounded border border-orange-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Rocket Box */}
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RocketLogo className="h-6 w-auto" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Rocket (রকেট)</span>
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">Wallet Number</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'রকেট নম্বর:' : 'Rocket Number:'}
                </label>
                <input
                  type="text"
                  value={rocketNumber}
                  onChange={(e) => setRocketNumber(e.target.value)}
                  placeholder="01533830784"
                  className="w-full px-3.5 py-2 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-black font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'কাস্টম রকেট লোগো (ঐচ্ছিক):' : 'Custom Rocket Logo (Optional):'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={rocketRef}
                    onChange={(e) => handleFileUpload(e, setRocketLogo)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => rocketRef.current?.click()}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লোগো ছবি আপলোড' : 'Upload Logo'}</span>
                  </button>
                  {rocketLogo && (
                    <img src={rocketLogo} alt="Rocket Custom Logo" className="h-7 w-auto object-contain rounded border border-purple-300" />
                  )}
                </div>
              </div>
            </div>

            {/* Upay Box */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-red-600 text-sm">upay</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Upay (উপায়)</span>
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">Wallet Number</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'উপায় নম্বর:' : 'Upay Number:'}
                </label>
                <input
                  type="text"
                  value={upayNumber}
                  onChange={(e) => setUpayNumber(e.target.value)}
                  placeholder="01723230230"
                  className="w-full px-3.5 py-2 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs font-black font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'কাস্টম উপায় লোগো (ঐচ্ছিক):' : 'Custom Upay Logo (Optional):'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={upayRef}
                    onChange={(e) => handleFileUpload(e, setUpayLogo)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => upayRef.current?.click()}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লোগো ছবি আপলোড' : 'Upload Logo'}</span>
                  </button>
                  {upayLogo && (
                    <img src={upayLogo} alt="Upay Custom Logo" className="h-7 w-auto object-contain rounded border border-indigo-300" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Official Bank Account Transfer Settings */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? '২. অফিসিয়াল ব্যাংক একাউন্ট বিবরণী (Bank Deposit Account)' : '2. Official Bank Deposit Details'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট গ্রহণের জন্য একাউন্ট তথ্য' : 'Bank wire & direct deposit information for advertisers'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'ব্যাংক ট্রান্সফার সক্রিয়:' : 'Enable Bank Payment:'}
              </span>
              <input
                type="checkbox"
                checked={isBankEnabled}
                onChange={(e) => setIsBankEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'ব্যাংকের নাম (Bank Name):' : 'Bank Name:'}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Islami Bank Bangladesh PLC"
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'একাউন্ট হোল্ডারের নাম (Account Name):' : 'Account Name:'}
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. MarketBD Net Technologies Ltd"
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'একাউন্ট নম্বর (Account Number):' : 'Account Number:'}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 2050 3928 1000 9281"
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'শাখা / ব্রাঞ্চের নাম (Branch Name):' : 'Branch Name:'}
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Dhanmondi Branch, Dhaka"
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'রাউটিং নম্বর (Routing Number):' : 'Routing Number:'}
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="e.g. 125263829"
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'ব্যাংক লোগো ছবি আপলোড:' : 'Bank Logo Upload:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={bankRef}
                  onChange={(e) => handleFileUpload(e, setBankLogo)}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bankRef.current?.click()}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লোগো নির্বাচন' : 'Browse Bank Logo'}</span>
                </button>
                {bankLogo && (
                  <img src={bankLogo} alt="Bank Logo" className="h-8 w-auto object-contain rounded border" />
                )}
              </div>
            </div>
          </div>

          {/* Bank Live Preview Box */}
          <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
              🏦 Bank Details Live Preview (বিজ্ঞাপন পেজে যেভাবে দেখাবে):
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold">
              <div><span className="text-slate-400">Bank:</span> <strong className="text-white">{bankName}</strong></div>
              <div><span className="text-slate-400">Account Name:</span> <strong className="text-white">{accountName}</strong></div>
              <div><span className="text-slate-400">Account No:</span> <strong className="text-yellow-300 font-mono">{accountNumber}</strong></div>
              <div><span className="text-slate-400">Branch & Routing:</span> <strong className="text-white">{branchName} ({routingNumber})</strong></div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl text-sm shadow-xl transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>{language === 'bn' ? 'সকল মোবাইল পেমেন্ট নম্বর ও ব্যাংক একাউন্ট সেভ করুন' : 'Save All Payment Accounts & Bank Details'}</span>
        </button>
      </form>
    </div>
  );
};
