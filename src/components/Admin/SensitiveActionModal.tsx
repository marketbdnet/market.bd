import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, AlertTriangle, KeyRound, CheckCircle, X } from 'lucide-react';
import { AdminRole, AdminPermission } from '../../types/adminAuth';

interface SensitiveActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminNote?: string) => void;
  titleBn: string;
  titleEn: string;
  actionType: string;
  requiredPermission: AdminPermission;
  adminRole: AdminRole;
  targetDisplay?: string;
  detailsDisplay?: string;
  requireReason?: boolean;
  language: 'bn' | 'en';
}

export const SensitiveActionModal: React.FC<SensitiveActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titleBn,
  titleEn,
  actionType,
  requiredPermission,
  adminRole,
  targetDisplay,
  detailsDisplay,
  requireReason = false,
  language
}) => {
  const [securityPin, setSecurityPin] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  // Accepted credentials for confirmation (simulating live MFA or master admin verification)
  const validPins = ['016340', '123456', 'Ai01634025151', '01723230230'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (requireReason && !adminNote.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে কারণ বা এডমিন নোট লিখুন।' : 'Please provide a reason or admin note.');
      return;
    }

    if (!securityPin.trim()) {
      setErrorMsg(language === 'bn' ? 'সিকিউরিটি পিন বা ২FA কোড টাইপ করুন।' : 'Please enter security PIN or 2FA code.');
      return;
    }

    if (!validPins.includes(securityPin.trim())) {
      setErrorMsg(language === 'bn' ? 'ভুল সিকিউরিটি পিন! সঠিক কোড দিয়ে চেষ্টা করুন (যেমন: 123456 বা 016340)।' : 'Invalid Security PIN! (e.g., 123456 or 016340)');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onConfirm(adminNote.trim());
      setSecurityPin('');
      setAdminNote('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border-2 border-red-500 shadow-2xl p-6 space-y-5 text-slate-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2FA Protected
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {requiredPermission}
                </span>
              </div>
              <h3 className="text-base font-black leading-tight">
                {language === 'bn' ? titleBn : titleEn}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Details Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
          {targetDisplay && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">{language === 'bn' ? 'টার্গেট:' : 'Target:'}</span>
              <span className="font-mono font-black text-slate-900 dark:text-white truncate max-w-[220px]">{targetDisplay}</span>
            </div>
          )}
          {detailsDisplay && (
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              {detailsDisplay}
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 font-bold">{language === 'bn' ? 'বর্তমান রোল:' : 'Your Role:'}</span>
            <span className="bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-md">
              {adminRole}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {requireReason && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'অ্যাকশন কারণ বা অডিট নোট *' : 'Audit Reason / Note *'}
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={2}
                placeholder={language === 'bn' ? 'যথাযথ কারণ উল্লেখ করুন...' : 'Specify clear operational justification...'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 resize-none"
                required
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'bn' ? 'এডমিন সিকিউরিটি পিন / ২FA কোড' : 'Admin Security PIN / 2FA Code'}</span>
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                PIN: 123456
              </span>
            </div>
            <input
              type="password"
              value={securityPin}
              onChange={e => setSecurityPin(e.target.value)}
              placeholder="••••••"
              maxLength={15}
              className="w-full px-3 py-2.5 text-center tracking-widest font-mono text-base font-black rounded-xl border-2 border-red-400 dark:border-red-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              required
              autoFocus
            />
          </div>

          <div className="p-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 rounded-xl text-[10px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {language === 'bn'
                ? 'এই সংবেদনশীল কার্যক্রমটি অপরিবর্তনীয় এবং তা সম্পূর্ণ অডিট ট্রেইলে লগ হবে।'
                : 'This action is immutable and will be permanently recorded in the Enterprise Audit Trail.'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...') : (language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Action')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
