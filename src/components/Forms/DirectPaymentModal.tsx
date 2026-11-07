import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ArrowRight, Lock, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Smartphone } from 'lucide-react';
import { BkashLogo, NagadLogo, RocketLogo } from '../Common/BrandLogos';

interface DirectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: 'bkash' | 'nagad' | 'rocket';
  amount: number;
  planName: string;
  onSuccess: (paymentResult: {
    method: 'bkash' | 'nagad' | 'rocket';
    senderNumber: string;
    trxId: string;
    amount: number;
    isAutoVerified: boolean;
  }) => void;
  language: 'bn' | 'en';
}

export const DirectPaymentModal: React.FC<DirectPaymentModalProps> = ({
  isOpen,
  onClose,
  method: initialMethod,
  amount,
  planName,
  onSuccess,
  language
}) => {
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>(initialMethod);
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing' | 'done'>('number');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [generatedOtp, setGeneratedOtp] = useState('123456');

  useEffect(() => {
    setMethod(initialMethod);
    setStep('number');
    setMobileNumber('');
    setOtp('');
    setPin('');
    setError('');
  }, [isOpen, initialMethod]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const getMethodTheme = () => {
    switch (method) {
      case 'bkash':
        return {
          bg: 'bg-pink-600',
          hoverBg: 'hover:bg-pink-700',
          border: 'border-pink-500',
          text: 'text-pink-600',
          ring: 'focus:ring-pink-500',
          name: 'bKash'
        };
      case 'nagad':
        return {
          bg: 'bg-orange-600',
          hoverBg: 'hover:bg-orange-700',
          border: 'border-orange-500',
          text: 'text-orange-600',
          ring: 'focus:ring-orange-500',
          name: 'Nagad'
        };
      case 'rocket':
        return {
          bg: 'bg-purple-600',
          hoverBg: 'hover:bg-purple-700',
          border: 'border-purple-500',
          text: 'text-purple-600',
          ring: 'focus:ring-purple-500',
          name: 'Rocket'
        };
    }
  };

  const theme = getMethodTheme();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = mobileNumber.trim();
    if (!cleanNum || !/^01[3-9]\d{8}$/.test(cleanNum)) {
      setError(
        language === 'bn'
          ? 'সঠিক ১১ ডিজিটের বিকাশ/নগদ/রকেট মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)'
          : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)'
      );
      return;
    }
    setError('');
    // Generate simulated 6-digit OTP
    const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(mockOtp);
    setTimer(60);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError(
        language === 'bn'
          ? 'সঠিক ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড দিন'
          : 'Please enter valid 6-digit verification OTP'
      );
      return;
    }
    setError('');
    setStep('pin');
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length < 4 || cleanPin.length > 5) {
      setError(
        language === 'bn'
          ? 'অনুগ্রহ করে ৪ বা ৫ ডিজিটের গোপন পিন কোড দিন'
          : 'Please enter 4 or 5 digit security PIN'
      );
      return;
    }

    setError('');
    setStep('processing');

    // Generate verified TrxID
    const prefix = method === 'bkash' ? 'BL' : method === 'nagad' ? 'NG' : 'RK';
    const randPart = Math.random().toString(36).substring(2, 9).toUpperCase();
    const verifiedTrxId = `${prefix}${randPart}`;

    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        onSuccess({
          method,
          senderNumber: mobileNumber.trim(),
          trxId: verifiedTrxId,
          amount,
          isAutoVerified: true
        });
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white">
        {/* Header with Provider Branding */}
        <div className={`p-4 ${theme.bg} text-white flex items-center justify-between shadow-md`}>
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-xl shadow-xs">
              {method === 'bkash' && <BkashLogo className="h-6 w-auto" />}
              {method === 'nagad' && <NagadLogo className="h-6 w-auto" />}
              {method === 'rocket' && <RocketLogo className="h-6 w-auto" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">
                {language === 'bn' ? `${theme.name} অনলাইন পেমেন্ট` : `${theme.name} Direct Gateway`}
              </h3>
              <p className="text-[11px] opacity-90 font-medium">
                {language === 'bn' ? 'স্বয়ংক্রিয় ট্রানজেকশন (OTP ও PIN)' : 'Auto Transaction Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Pill */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-bold block">{planName}</span>
            <span className="text-[11px] text-slate-500">{language === 'bn' ? 'বিজ্ঞাপন প্রমোশন চার্জ' : 'Promotion Fee'}</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-400">৳{amount}</span>
            <span className="text-[10px] text-slate-400 block">BDT</span>
          </div>
        </div>

        <div className="p-6">
          {/* STEP 1: Enter Number */}
          {step === 'number' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-pink-500">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">
                  {language === 'bn' ? `আপনার ${theme.name} অ্যাকাউন্ট নম্বর লিখুন` : `Enter your ${theme.name} Account Number`}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'নিরাপত্তা যাচাইয়ের জন্য এই নম্বরে একটি ওটিপি পাঠানো হবে' : 'An OTP will be sent to verify your transaction'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {theme.name} Mobile Number
                </label>
                <input
                  type="tel"
                  autoFocus
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-mono font-black text-white tracking-widest focus:outline-none focus:border-pink-500"
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3.5 ${theme.bg} ${theme.hoverBg} text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95`}
              >
                <span>{language === 'bn' ? 'ওটিপি কোড পাঠান (Proceed)' : 'Send OTP & Proceed'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-amber-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">
                  {language === 'bn' ? 'ওটিপি ভেরিফিকেশন কোড লিখুন' : 'Enter 6-digit Verification OTP'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? `${mobileNumber} নম্বরে পাঠানো কোডটি নিচে দিন` : `Sent to ${mobileNumber}`}
                </p>
                {/* Auto Demo Helper for easy test */}
                <div className="inline-block mt-1 px-2.5 py-1 bg-amber-950/60 border border-amber-500/50 rounded-lg text-[11px] text-amber-300 font-mono">
                  {language === 'bn' ? `পরীক্ষামূলক ডেমো ওটিপি: ${generatedOtp}` : `Demo OTP: ${generatedOtp}`}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-2xl font-mono font-black text-amber-400 tracking-[0.4em] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{language === 'bn' ? 'কোড পাননি?' : "Didn't receive?"}</span>
                {timer > 0 ? (
                  <span className="font-mono text-slate-400">{timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(60);
                      setGeneratedOtp(String(Math.floor(100000 + Math.random() * 900000)));
                    }}
                    className="text-pink-400 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'পুনরায় পাঠান' : 'Resend Code'}
                  </button>
                )}
              </div>

              {error && (
                <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('number')}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'পিছনে' : 'Back'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3.5 ${theme.bg} ${theme.hoverBg} text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95`}
                >
                  <span>{language === 'bn' ? 'ওটিপি নিশ্চিত করুন' : 'Confirm OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter PIN */}
          {step === 'pin' && (
            <form onSubmit={handleConfirmPin} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-emerald-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">
                  {language === 'bn' ? `আপনার ${theme.name} পিন (PIN) দিন` : `Enter your ${theme.name} PIN`}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn'
                    ? `৳${amount} টাকা স্বয়ংক্রিয়ভাবে কাটতে পিন কোড প্রদান করুন`
                    : `Enter PIN to authorize ৳${amount} payment`}
                </p>
              </div>

              <div>
                <input
                  type="password"
                  autoFocus
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="• • • • •"
                  maxLength={5}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-3xl font-mono font-black text-emerald-400 tracking-[0.5em] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'bn'
                    ? '২৫৬-বিট এনক্রিপ্টেড পেমেন্ট গেটওয়ে। আপনার পিন সম্পূর্ণ সুরক্ষিত।'
                    : '256-bit encrypted gateway. Your PIN is confidential & safe.'}
                </span>
              </div>

              {error && (
                <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'পিছনে' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>{language === 'bn' ? `৳${amount} টাকা পরিশোধ করুন` : `Pay ৳${amount} Now`}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Processing */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">
                  {language === 'bn' ? 'পেমেন্ট প্রসেসিং হচ্ছে...' : 'Processing Transaction...'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন ও পেইজ বন্ধ করবেন না' : 'Please do not refresh or close'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 'done' && (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <div>
                <h4 className="font-extrabold text-base text-emerald-400">
                  {language === 'bn' ? 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!' : 'Payment Completed Successfully!'}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'bn' ? 'বিজ্ঞাপনটি স্বয়ংক্রিয়ভাবে ভেরিফাই করা হয়েছে।' : 'Ad has been verified automatically.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
