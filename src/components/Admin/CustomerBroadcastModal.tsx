import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  Users,
  Smartphone,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CreditCard,
  Volume2,
  Check,
  Megaphone,
  BellRing
} from 'lucide-react';
import { UserProfile } from '../../context/MarketContext';
import {
  broadcastToCustomers,
  getTotalPurchasedSms,
  getSmsSentCount,
  getRemainingPurchasedSms,
  getMaskingRemainingSms,
  getNonMaskingRemainingSms,
  getStoredSmsConfig,
  MessageDispatchLog
} from '../../services/smsService';

interface CustomerBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredUsers: UserProfile[];
  language?: 'bn' | 'en';
  onBroadcastComplete?: () => void;
}

export const CustomerBroadcastModal: React.FC<CustomerBroadcastModalProps> = ({
  isOpen,
  onClose,
  registeredUsers,
  language = 'bn',
  onBroadcastComplete
}) => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'phone_only' | 'email_only' | 'sellers' | 'buyers' | 'custom'>('all');
  const [channel, setChannel] = useState<'sms' | 'email' | 'both'>('sms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Message content
  const [smsMessage, setSmsMessage] = useState(
    'MarketBD.Net বিশেষ নোটিশ: প্রিয় {name}, আপনার পছন্দের পণ্যে আকর্ষণীয় ডিসকাউন্ট অফার চলছে! এখনই ভিজিট করুন marketbd.net'
  );
  const [emailSubject, setEmailSubject] = useState('MarketBD.Net - বিশেষ অফার ও ঘোষণা');
  const [emailMessage, setEmailMessage] = useState(
    'প্রিয় {name},\n\nMarketBD.Net প্ল্যাটফর্মে আপনাকে স্বাগতম। আমাদের এখানে আকর্ষণীয় সব অফার ও সেরা ডিল অপেক্ষা করছে।\n\nবিস্তারিত জানতে আজই ভিজিট করুন আমাদের ওয়েবসাইট: https://marketbd.net\n\nধন্যবাদ,\nটিম MarketBD.Net'
  );

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [progressInfo, setProgressInfo] = useState<{
    current: number;
    total: number;
    successCount: number;
    failCount: number;
    currentRecipient: string;
    channel: string;
  } | null>(null);

  // Completion / Notification State
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [broadcastSummary, setBroadcastSummary] = useState<{
    sentCount: number;
    failedCount: number;
    total: number;
    remainingSms: number;
  } | null>(null);

  // Filtered Recipients
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(user => {
      // Basic target audience filter
      if (targetAudience === 'phone_only' && (!user.phone || user.phone.trim().length < 8)) return false;
      if (targetAudience === 'email_only' && (!user.email || !user.email.includes('@'))) return false;
      if (targetAudience === 'sellers' && user.role !== 'seller') return false;
      if (targetAudience === 'buyers' && user.role !== 'buyer') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.name?.toLowerCase().includes(q);
        const matchPhone = user.phone?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      return true;
    });
  }, [registeredUsers, targetAudience, searchQuery]);

  // Selected Target Users
  const targetRecipients = useMemo(() => {
    if (targetAudience === 'custom') {
      return registeredUsers.filter(u => selectedUserIds.includes(u.id));
    }
    return filteredUsers;
  }, [targetAudience, filteredUsers, selectedUserIds, registeredUsers]);

  // Quota Metrics
  const totalPurchasedSms = getTotalPurchasedSms();
  const currentSentCount = getSmsSentCount();
  const remainingSms = getRemainingPurchasedSms();
  const requiredSmsCount = (channel === 'sms' || channel === 'both') ? targetRecipients.filter(u => u.phone).length : 0;
  const isQuotaExceeded = requiredSmsCount > remainingSms;

  const handleToggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(item => item !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  // Presets
  const applyPreset = (type: 'discount' | 'notice' | 'free_ad' | 'security') => {
    if (type === 'discount') {
      setSmsMessage('MarketBD.Net ধামাকা অফার: প্রিয় {name}, আজই কেনাকাটা করে জিতে নিন আকর্ষণীয় ডিসকাউন্ট ভাউচার! কোড: DISCOUNT2026। ভিজিট: marketbd.net');
      setEmailSubject('🌟 MarketBD.Net বিশেষ ডিসকাউন্ট অফার!');
      setEmailMessage('প্রিয় {name},\n\nআপনার জন্য আমাদের বিশেষ ডিসকাউন্ট ক্যাম্পেইন শুরু হয়েছে! ৫০% পর্যন্ত ছাড় পেতে আজই ব্রাউজ করুন।\n\nMarketBD.Net');
    } else if (type === 'notice') {
      setSmsMessage('MarketBD.Net বিজ্ঞপ্তি: প্রিয় {name}, আমাদের প্ল্যাটফর্মের নিরাপত্তা জোরদার করা হয়েছে। যেকোনো তথ্যের জন্য হেল্পলাইনে যোগাযোগ করুন।');
      setEmailSubject('📢 MarketBD.Net প্ল্যাটফর্ম আপডেট নোটিশ');
      setEmailMessage('সম্মানিত গ্রাহক {name},\n\nMarketBD.Net-এ আপনার অ্যাকাউন্ট নিরাপদে ব্যবহারে কিছু নতুন সিকিউরিটি ফিচার যোগ করা হয়েছে।\n\nধন্যবাদ,\nমার্কেট বিডি টিম');
    } else if (type === 'free_ad') {
      setSmsMessage('MarketBD.Net বিজ্ঞাপন অফার: প্রিয় {name}, আজই আপনার অব্যবহৃত পণ্য বিক্রির জন্য ফ্রিতে বিজ্ঞাপন দিন এবং দ্রুত ক্রেতা পান! marketbd.net');
      setEmailSubject('🚀 আপনার পণ্য দ্রুত বিক্রির জন্য ফ্রি বিজ্ঞাপন দিন');
      setEmailMessage('প্রিয় {name},\n\nআপনার কাছে কোনো অব্যবহৃত সামগ্রী থাকলে এখনই মার্কেট বিডিতে ১০০% ফ্রিতে বিজ্ঞাপন পোস্ট করুন।\n\nভিজিট করুন: https://marketbd.net');
    } else if (type === 'security') {
      setSmsMessage('MarketBD.Net নিরাপত্তা সতর্কতা: পণ্য ও কাগজপত্র সরাসরি দেখা ব্যতীত কাউকে অগ্রিম কোনো টাকা পাঠাবেন না। সতর্ক থাকুন।');
      setEmailSubject('🛡️ নিরাপদ কেনাবেচার নির্দেশিকা - MarketBD.Net');
      setEmailMessage('প্রিয় গ্রাহক {name},\n\nনিরাপদ কেনাবেচার স্বার্থে কখনো পণ্য যাচাই করার আগে অগ্রিম টাকা পাঠাবেন না। কোনো প্রতারণামূলক আচরণ দেখলে রিপোর্ট করুন।\n\nধন্যবাদ।');
    }
  };

  // Start Broadcast
  const handleStartBroadcast = async () => {
    if (targetRecipients.length === 0) {
      alert(language === 'bn' ? 'অনুগ্রহ করে অন্তত একজন গ্রাহক নির্বাচন করুন।' : 'Please select at least one customer.');
      return;
    }

    if ((channel === 'sms' || channel === 'both') && !smsMessage.trim()) {
      alert(language === 'bn' ? 'এসএমএস বার্তা ফাঁকা রাখা যাবে না।' : 'SMS message cannot be empty.');
      return;
    }

    if ((channel === 'email' || channel === 'both') && !emailMessage.trim()) {
      alert(language === 'bn' ? 'ইমেইল বার্তা ফাঁকা রাখা যাবে না।' : 'Email message cannot be empty.');
      return;
    }

    setIsSending(true);
    setShowSuccessBanner(false);
    setProgressInfo({
      current: 0,
      total: targetRecipients.length,
      successCount: 0,
      failCount: 0,
      currentRecipient: 'প্রস্তুত হচ্ছে...',
      channel: channel.toUpperCase()
    });

    try {
      const result = await broadcastToCustomers(
        targetRecipients.map(u => ({
          id: u.id,
          name: u.name || 'গ্রাহক',
          phone: u.phone,
          email: u.email,
          role: u.role
        })),
        {
          channel,
          smsMessage,
          emailSubject,
          emailMessage,
          onProgress: info => {
            setProgressInfo(info);
          }
        }
      );

      setIsSending(false);
      setBroadcastSummary({
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        total: result.total,
        remainingSms: result.remainingSms
      });
      setShowSuccessBanner(true);

      if (onBroadcastComplete) {
        onBroadcastComplete();
      }
    } catch (err: any) {
      setIsSending(false);
      alert(language === 'bn' ? `সম্প্রচার চলাকালে ত্রুটি: ${err.message}` : `Broadcast error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Megaphone className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {language === 'bn' ? 'সকল নিবন্ধিত গ্রাহকদের বাল্ক প্রমোশন ও নোটিশ প্রেরণ' : 'Bulk Broadcast to Registered Customers'}
              </h2>
              <p className="text-[11px] text-pink-100 font-medium">
                {language === 'bn'
                  ? 'নিবন্ধিত সকল গ্রাহকের মোবাইল নম্বর বা ইমেইলে সরাসরি মেসেজ পাঠান'
                  : 'Broadcast promotional SMS and emails to registered mobile numbers and emails'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROMINENT SUCCESS NOTIFICATION BANNER */}
        {showSuccessBanner && broadcastSummary && (
          <div className="mx-5 mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl animate-in zoom-in-95 duration-200 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                    <span>🎉 মেসেজ সফলভাবে গ্রাহকের কাছে পাঠানো হয়েছে!</span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Message Successfully Sent!
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-1">
                    মোট {broadcastSummary.sentCount} জন গ্রাহকের কাছে সফলভাবে বার্তা ডেলিভারি হয়েছে।
                    {broadcastSummary.failedCount > 0 && ` (${broadcastSummary.failedCount} টি ব্যর্থ)`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 font-bold font-mono">
                    <span className="bg-white dark:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                      📦 মোট ক্রয়কৃত: {totalPurchasedSms}টি
                    </span>
                    <span className="bg-white dark:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                      📤 মোট খরচ: {getSmsSentCount()}টি
                    </span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded shadow-xs">
                      💳 অবশিষ্ট কোটা: {broadcastSummary.remainingSms}টি
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccessBanner(false)}
                className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-xs font-bold px-2 py-1 bg-white/60 dark:bg-emerald-900/60 rounded-lg cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}

        {/* SMS Quota Overview Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-600" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'এসএমএস ব্যালেন্স ও কোটা স্ট্যাটাস:' : 'SMS Quota & Status:'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="bg-purple-50 dark:bg-purple-950/80 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-purple-600 text-[10px] block uppercase font-bold">মাসকিং ব্যালেন্স</span>
                <span className="font-extrabold text-purple-700 dark:text-purple-300">{getMaskingRemainingSms()} টি</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="text-blue-600 text-[10px] block uppercase font-bold">নন-মাসকিং ব্যালেন্স</span>
                <span className="font-extrabold text-blue-700 dark:text-blue-300">{getNonMaskingRemainingSms()} টি</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-700">
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block uppercase font-bold">মোট অবশিষ্ট কোটা</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{remainingSms} টি</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[72vh] overflow-y-auto">

          {/* STEP 1: TARGET RECIPIENTS & CHANNEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Target Audience Filter */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-pink-600" />
                <span>{language === 'bn' ? '১. টার্গেট গ্রাহক নির্বাচন করুন:' : '1. Target Customer Audience:'}</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: `👥 সকল নিবন্ধিত (${registeredUsers.length})` },
                  { id: 'phone_only', label: `📱 মোবাইল নম্বরধারী (${registeredUsers.filter(u => u.phone).length})` },
                  { id: 'email_only', label: `✉️ ইমেইলধারী (${registeredUsers.filter(u => u.email).length})` },
                  { id: 'sellers', label: `🛍️ বিক্রেতা একাউন্ট (${registeredUsers.filter(u => u.role === 'seller').length})` },
                  { id: 'buyers', label: `🛒 সাধারণ ক্রেতা (${registeredUsers.filter(u => u.role === 'buyer').length})` },
                  { id: 'custom', label: `🎯 নির্দিষ্ট গ্রাহক নির্বাচন` },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTargetAudience(opt.id as any)}
                    className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      targetAudience === opt.id
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Recipient Count Indicator */}
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">নির্বাচিত মোট প্রাপক:</span>
                <span className="font-black text-pink-600 dark:text-pink-400 font-mono text-sm">
                  {targetRecipients.length} জন গ্রাহক
                </span>
              </div>
            </div>

            {/* Delivery Channel Selection */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{language === 'bn' ? '২. প্রেরণের মাধ্যম (Channel):' : '2. Dispatch Channel:'}</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                    channel === 'sms'
                      ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                  <span className="text-xs font-black block">মোবাইল SMS</span>
                  <span className="text-[10px] text-slate-500 block">সরাসরি ইনবক্সে</span>
                </div>

                <div
                  onClick={() => setChannel('email')}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                    channel === 'email'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Mail className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs font-black block">ইমেইল নোটিশ</span>
                  <span className="text-[10px] text-slate-500 block">গ্রাহকের মেইলে</span>
                </div>

                <div
                  onClick={() => setChannel('both')}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                    channel === 'both'
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <span className="text-xs font-black block">উভয় মাধ্যমে</span>
                  <span className="text-[10px] text-slate-500 block">SMS + Email</span>
                </div>
              </div>

              {/* SMS Cost Estimation & Warning */}
              {(channel === 'sms' || channel === 'both') && (
                <div className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                  isQuotaExceeded
                    ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                }`}>
                  <span>প্রয়োজনীয় এসএমএস: <b>{requiredSmsCount} টি</b></span>
                  <span>অবশিষ্ট কোটা: <b>{remainingSms} টি</b></span>
                </div>
              )}
            </div>

          </div>

          {/* CUSTOM USER SELECTION DRAWER IF TARGET === 'custom' */}
          {targetAudience === 'custom' && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  নির্দিষ্ট গ্রাহক নির্বাচন করুন:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-[11px] text-pink-600 font-bold cursor-pointer hover:underline"
                >
                  {selectedUserIds.length === filteredUsers.length ? 'সব আনচেক করুন' : 'সব চেক করুন'}
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredUsers.map(user => {
                  const isChecked = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleSelectUser(user.id)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition ${
                        isChecked
                          ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 text-pink-900 dark:text-pink-200 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-pink-600 rounded"
                        />
                        <span>{user.name}</span>
                        {user.phone && <span className="text-[10px] text-slate-500 font-mono">({user.phone})</span>}
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {user.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: MESSAGE CONTENT EDITOR */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>{language === 'bn' ? '৩. বার্তা ও কন্টেন্ট নির্ধারণ:' : '3. Message Content & Body:'}</span>
              </label>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500">রেডিমেড টেমপ্লেট:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('discount')}
                  className="text-[10px] px-2 py-0.5 bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold rounded-lg hover:bg-pink-200 transition cursor-pointer"
                >
                  ডিসকাউন্ট অফার
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('free_ad')}
                  className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg hover:bg-emerald-200 transition cursor-pointer"
                >
                  ফ্রি বিজ্ঞাপন
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('security')}
                  className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold rounded-lg hover:bg-amber-200 transition cursor-pointer"
                >
                  নিরাপত্তা নির্দেশিকা
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('notice')}
                  className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-200 transition cursor-pointer"
                >
                  সাধারণ নোটিশ
                </button>
              </div>
            </div>

            {/* Dynamic Tag Replacement Helper */}
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>ট্যাগ ব্যবহার করুন: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-pink-600 font-bold">{"{name}"}</code> লিখলে গ্রাহকের নাম স্বয়ংক্রিয়ভাবে বসে যাবে।</span>
            </div>

            {/* SMS Text Area */}
            {(channel === 'sms' || channel === 'both') && (
              <div className="p-3.5 bg-pink-50/50 dark:bg-pink-950/30 rounded-2xl border border-pink-200 dark:border-pink-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-pink-900 dark:text-pink-300 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    মোবাইল এসএমএস কন্টেন্ট (Mobile SMS Body):
                  </span>
                  <span className="text-[10px] font-mono font-bold text-pink-700 dark:text-pink-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-pink-200 dark:border-pink-800">
                    {smsMessage.length} অক্ষর
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={smsMessage}
                  onChange={e => setSmsMessage(e.target.value)}
                  placeholder="আপনার বার্তা এখানে লিখুন..."
                  className="w-full p-2.5 border border-pink-300 dark:border-pink-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}

            {/* Email Subject & Body */}
            {(channel === 'email' || channel === 'both') && (
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  ইমেইল কন্টেন্ট (Email Subject & Body):
                </span>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="ইমেইলের বিষয় (Subject)..."
                  className="w-full px-3 py-1.5 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
                />
                <textarea
                  rows={4}
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="ইমেইলের পূর্ণাঙ্গ বার্তা..."
                  className="w-full p-2.5 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

          </div>

          {/* LIVE PROGRESS STATUS DURING SENDING */}
          {isSending && progressInfo && (
            <div className="p-4 bg-pink-50 dark:bg-pink-950/80 rounded-2xl border border-pink-300 dark:border-pink-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-pink-950 dark:text-pink-200">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-600" />
                  বার্তা সম্প্রচার চলছে... ({progressInfo.current}/{progressInfo.total})
                </span>
                <span className="font-mono">{Math.round((progressInfo.current / Math.max(1, progressInfo.total)) * 100)}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-pink-200 dark:border-pink-800">
                <div
                  className="h-full bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${(progressInfo.current / Math.max(1, progressInfo.total)) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                <span>বর্তমান প্রাপক: <b>{progressInfo.currentRecipient}</b></span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">সফল: {progressInfo.successCount}</span>
                  <span className="text-red-500 font-bold">ব্যর্থ: {progressInfo.failCount}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>

          <button
            type="button"
            onClick={handleStartBroadcast}
            disabled={isSending || targetRecipients.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>পাঠানো হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>সকল {targetRecipients.length} জন গ্রাহককে প্রমোশন পাঠান</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
