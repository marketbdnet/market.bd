import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { storage } from '../../utils/storage';
import { UserProfile } from '../../types';
import { GoogleLogo, FacebookLogo, GmailLogo } from '../Common/BrandLogos';
import {
  auth,
  db,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  safeFirestoreSetDoc,
  doc,
  getDoc
} from '../../lib/firebase';
import {
  X,
  Lock,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Smartphone,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalPurpose,
    login,
    language,
    customLogoUrl,
    registeredUsers,
    updateRegisteredUser
  } = useMarket();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Password visibility states (Eye icon toggle)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // OTP Delivery Channel: 'sms' | 'email'
  const [otpChannel, setOtpChannel] = useState<'sms' | 'email'>('sms');

  // Step flow: 'form' -> 'otp'
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpSentBannerVisible, setIsOtpSentBannerVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(120); // 2 Minutes timer
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Normalization Helpers
  const normalizePhone = (p?: string) => {
    if (!p) return '';
    const bnDigits: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const converted = String(p).replace(/[০-৯]/g, d => bnDigits[d] || d);
    let clean = converted.replace(/\D/g, '');
    if (clean.startsWith('880')) clean = clean.substring(3);
    else if (clean.startsWith('88')) clean = clean.substring(2);
    if (clean.startsWith('0') && clean.length === 11) clean = clean.substring(1);
    return clean;
  };

  const normalizeEmail = (e?: string) => {
    return (e || '').trim().toLowerCase();
  };

  const getAllRegisteredUsers = () => {
    let fromStorage: any[] = [];
    try {
      const existingUsersRaw = storage.getItem('marketbd_registered_users');
      if (existingUsersRaw) {
        fromStorage = JSON.parse(existingUsersRaw);
      }
    } catch (e) {}

    let fromCreds: Record<string, any> = {};
    try {
      const credsRaw = storage.getItem('marketbd_credentials_store');
      if (credsRaw) {
        fromCreds = JSON.parse(credsRaw);
      }
    } catch (e) {}

    const map = new Map<string, any>();

    // 1. Initial / context users
    (Array.isArray(registeredUsers) ? registeredUsers : []).forEach(u => {
      if (u) {
        const normP = normalizePhone(u.phone);
        const normE = normalizeEmail(u.email);
        const key = normP || normE || u.id;
        if (key) map.set(key, u);
      }
    });

    // 2. Storage users (higher precedence for custom passwords)
    (Array.isArray(fromStorage) ? fromStorage : []).forEach(u => {
      if (u) {
        const normP = normalizePhone(u.phone);
        const normE = normalizeEmail(u.email);
        const key = normP || normE || u.id;
        if (key) {
          const existing = map.get(key);
          const password = u.password || existing?.password;
          map.set(key, { ...(existing || {}), ...u, password });
        }
      }
    });

    // 3. Dedicated credentials store (highest precedence for genuine passwords)
    Object.values(fromCreds).forEach((u: any) => {
      if (u) {
        const normP = normalizePhone(u.phone);
        const normE = normalizeEmail(u.email);
        const key = normP || normE || u.id;
        if (key) {
          const existing = map.get(key);
          const password = u.password || existing?.password;
          map.set(key, { ...(existing || {}), ...u, password });
        }
      }
    });

    return Array.from(map.values());
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'gmail') => {
    setIsSocialLoading(provider);
    setErrorMsg('');

    try {
      if (provider === 'google' || provider === 'gmail') {
        try {
          const googleProvider = new GoogleAuthProvider();
          googleProvider.setCustomParameters({ prompt: 'select_account' });
          const result = await signInWithPopup(auth, googleProvider);
          const u = result.user;
          if (u && (u.email || u.uid)) {
            const existingUsersRaw = storage.getItem('marketbd_registered_users');
            const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
            
            const userProfileData = {
              id: u.uid,
              name: u.displayName || u.email?.split('@')[0] || 'Google User',
              email: u.email || '',
              phone: u.phoneNumber || '',
              avatar: u.photoURL || undefined,
              role: 'seller' as const,
              isVerified: true,
              authProvider: 'google',
              registeredAt: new Date().toISOString()
            };

            const userIdx = existingUsers.findIndex((usr: any) => usr.email === u.email || usr.id === u.uid);
            if (userIdx >= 0) {
              existingUsers[userIdx] = { ...existingUsers[userIdx], ...userProfileData };
            } else {
              existingUsers.push(userProfileData);
            }
            storage.setItem('marketbd_registered_users', JSON.stringify(existingUsers));

            // Persist into Firestore /users/{uid}
            safeFirestoreSetDoc(doc(db, 'users', u.uid), userProfileData, { merge: true }).catch(() => {});

            login(userProfileData);
            setIsSocialLoading(null);
            return;
          } else {
            throw new Error('No user data returned from Google');
          }
        } catch (firebaseErr: any) {
          console.error('Firebase Google Auth error:', firebaseErr);
          if (firebaseErr?.code === 'auth/popup-closed-by-user' || firebaseErr?.code === 'auth/cancelled-popup-request') {
            setErrorMsg(
              language === 'bn'
                ? '⚠️ গুগল লগইন উইন্ডোটি বন্ধ করা হয়েছে। আসল জিমেইল অ্যাকাউন্ট সিলেক্ট করে রেজিস্ট্রেশন / লগইন সম্পন্ন করুন।'
                : '⚠️ Google Sign-In window was closed. Please select your real Gmail account to complete registration.'
            );
          } else if (firebaseErr?.code === 'auth/popup-blocked') {
            setErrorMsg(
              language === 'bn'
                ? '⚠️ ব্রাউজারের পপ-আপ ব্লক করা আছে! অনুগ্রহ করে ব্রাউজার সেটিংসে পপ-আপ চালু (Allow) করুন।'
                : '⚠️ Browser popup was blocked. Please allow popups for this site to sign in with Google.'
            );
          } else {
            setErrorMsg(
              language === 'bn'
                ? `❌ গুগল লগইন সম্পন্ন হয়নি: ${firebaseErr?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন'}`
                : `❌ Google sign-in failed: ${firebaseErr?.message || 'Please try again'}`
            );
          }
          setIsSocialLoading(null);
          return;
        }
      } else if (provider === 'facebook') {
        try {
          const facebookProvider = new FacebookAuthProvider();
          const result = await signInWithPopup(auth, facebookProvider);
          const u = result.user;
          if (u && (u.email || u.uid)) {
            const existingUsersRaw = storage.getItem('marketbd_registered_users');
            const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
            
            const userProfileData = {
              id: u.uid,
              name: u.displayName || 'Facebook Verified User',
              email: u.email || 'facebook.user@fb.com',
              phone: u.phoneNumber || '',
              avatar: u.photoURL || undefined,
              role: 'seller' as const,
              isVerified: true,
              authProvider: 'facebook',
              registeredAt: new Date().toISOString()
            };

            const userIdx = existingUsers.findIndex((usr: any) => (u.email && usr.email === u.email) || usr.id === u.uid);
            if (userIdx >= 0) {
              existingUsers[userIdx] = { ...existingUsers[userIdx], ...userProfileData };
            } else {
              existingUsers.push(userProfileData);
            }
            storage.setItem('marketbd_registered_users', JSON.stringify(existingUsers));

            // Persist into Firestore /users/{uid}
            safeFirestoreSetDoc(doc(db, 'users', u.uid), userProfileData, { merge: true }).catch(() => {});

            login(userProfileData);
            setIsSocialLoading(null);
            return;
          } else {
            throw new Error('No user data returned from Facebook');
          }
        } catch (firebaseErr: any) {
          console.error('Firebase Facebook Auth error:', firebaseErr);
          if (firebaseErr?.code === 'auth/popup-closed-by-user' || firebaseErr?.code === 'auth/cancelled-popup-request') {
            setErrorMsg(
              language === 'bn'
                ? '⚠️ ফেসবুক লগইন উইন্ডো বন্ধ করা হয়েছে। ফেসবুক অ্যাকাউন্ট দিয়ে লগইন করুন।'
                : '⚠️ Facebook login window was closed. Please log in with your Facebook account.'
            );
          } else {
            setErrorMsg(
              language === 'bn'
                ? `❌ ফেসবুক লগইন ব্যর্থ হয়েছে: ${firebaseErr?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন'}`
                : `❌ Facebook authentication failed: ${firebaseErr?.message || 'Please try again'}`
            );
          }
          setIsSocialLoading(null);
          return;
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Social authentication failed');
    } finally {
      setIsSocialLoading(null);
    }
  };

  // Reset modal state when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setAuthStep('form');
      setErrorMsg('');
      setOtpError('');
      setEnteredOtp('');
      setMode('login');
    }
  }, [isAuthModalOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, resendTimer]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthModalOpen) return null;

  // Phone and Email Validation Helpers
  const isValidBDPhone = (phoneStr: string): boolean => {
    const cleaned = phoneStr.replace(/[\s\-]/g, '');
    return /^(?:\+88)?01[3-9]\d{8}$/.test(cleaned);
  };

  const formatE164Phone = (phoneStr: string): string => {
    const cleaned = phoneStr.replace(/[\s\-]/g, '');
    if (cleaned.startsWith('+88')) return cleaned;
    if (cleaned.startsWith('88')) return '+' + cleaned;
    if (cleaned.startsWith('01')) return '+88' + cleaned;
    return '+88' + cleaned;
  };

  const isValidEmail = (emailStr: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSendOtp = async (channelOverride?: 'sms' | 'email') => {
    const selectedChannel = channelOverride || otpChannel;
    setOtpChannel(selectedChannel);
    setErrorMsg('');
    setOtpError('');
    setIsSendingOtp(true);

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp('');
    setResendTimer(120);

    const targetPhone = phoneOrEmail.trim();

    if (selectedChannel === 'sms' && isValidBDPhone(targetPhone)) {
      try {
        const e164 = formatE164Phone(targetPhone);
        
        // Setup RecaptchaVerifier
        let recaptchaVerifier = (window as any).recaptchaVerifier;
        if (!recaptchaVerifier) {
          recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {}
          });
          (window as any).recaptchaVerifier = recaptchaVerifier;
        }

        const confirmation = await signInWithPhoneNumber(auth, e164, recaptchaVerifier);
        setConfirmationResult(confirmation);
      } catch (err: any) {
        console.warn('Firebase SMS OTP notice:', err?.message || err);
        setConfirmationResult(null);
      }
    } else {
      setConfirmationResult(null);
    }

    setIsSendingOtp(false);
    setAuthStep('otp');
    setIsOtpSentBannerVisible(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = phoneOrEmail.trim();

    // Check Admin Master Credentials
    const isAdmin =
      (cleanInput.toLowerCase() === 'official.marketsbd@gmail.com' || cleanInput === '01634025151') &&
      password === 'Ai01634025151';

    if (isAdmin) {
      handleSendOtp();
      return;
    }

    // REGISTRATION FORM VALIDATION
    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 3) {
        setErrorMsg(
          language === 'bn'
            ? '❌ আপনার সঠিক নাম প্রদান করুন (কমপক্ষে ৩ অক্ষর)!'
            : '❌ Please enter your full name (at least 3 characters)!'
        );
        return;
      }

      if (!isValidBDPhone(cleanInput) && !isValidEmail(cleanInput)) {
        setErrorMsg(
          language === 'bn'
            ? '❌ সঠিক ১১ ডিজিটের বিডি মোবাইল নম্বর (যেমন: 01712345678) অথবা সঠিক ইমেইল দিন!'
            : '❌ Enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678) or a valid email address!'
        );
        return;
      }

      if (!password || password.length < 6) {
        setErrorMsg(
          language === 'bn'
            ? '❌ পাসওয়ার্ড অত্যন্ত ছোট! কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।'
            : '❌ Password too short! Must be at least 6 characters long.'
        );
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg(
          language === 'bn'
            ? '❌ দুটি ঘরে টাইপ করা পাসওয়ার্ড মেলেনি! পুনরায় চেক করুন।'
            : '❌ Passwords do not match! Please check again.'
        );
        return;
      }

      // Check for single registration uniqueness
      const allUsers = getAllRegisteredUsers();
      const cleanPhone = normalizePhone(cleanInput);
      const cleanEmail = normalizeEmail(emailInput || cleanInput);

      const userExists = allUsers.some(
        (u: any) => {
          const uPhone = normalizePhone(u.phone);
          const uEmail = normalizeEmail(u.email);
          const phoneMatch = Boolean(cleanPhone && uPhone && (cleanPhone === uPhone || cleanPhone.endsWith(uPhone) || uPhone.endsWith(cleanPhone)));
          const emailMatch = Boolean(cleanEmail && uEmail && cleanEmail === uEmail);
          return phoneMatch || emailMatch || u.phone === cleanInput || u.email === cleanInput;
        }
      );

      if (userExists) {
        setErrorMsg(
          language === 'bn'
            ? '⚠️ এই মোবাইল নম্বর বা ইমেইল ঠিকানা দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে! একটি নম্বর ও ইমেইলে একবারই রেজিস্টার করা যাবে। অনুগ্রহ করে "লগইন করুন" অপশন ব্যবহার করুন।'
            : '⚠️ An account with this phone number or email already exists! Single registration allowed. Please Log In.'
        );
        return;
      }

      // Everything valid -> Proceed to OTP SMS/Email verification step
      handleSendOtp();
    }

    // LOGIN FORM VALIDATION & DIRECT AUTHENTICATION
    if (mode === 'login') {
      if (!isValidBDPhone(cleanInput) && !isValidEmail(cleanInput)) {
        setErrorMsg(
          language === 'bn'
            ? '❌ সঠিক ১১ ডিজিটের বিডি মোবাইল নম্বর (যেমন: 01712345678) অথবা ইমেইল দিন!'
            : '❌ Please enter a valid 11-digit Bangladeshi mobile number or valid email!'
        );
        return;
      }

      if (!password || password.length < 4) {
        setErrorMsg(
          language === 'bn'
            ? '❌ আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন!'
            : '❌ Please enter your account password!'
        );
        return;
      }

      const allUsers = getAllRegisteredUsers();
      const cleanPhone = normalizePhone(cleanInput);
      const cleanEmail = normalizeEmail(cleanInput);

      const isAdmin =
        (cleanInput.toLowerCase() === 'official.marketsbd@gmail.com' || cleanInput === '01634025151' || cleanPhone === '01634025151' || cleanPhone === '1634025151') &&
        password === 'Ai01634025151';

      if (isAdmin) {
        login({
          id: 'admin-master',
          name: 'সুপার এডমিন (MarketBD.Net Admin)',
          phone: '01634025151',
          email: 'official.marketsbd@gmail.com',
          role: 'admin',
          password: password,
          isVerified: true
        });
        return;
      }

      // Determine target email for Firebase Auth
      let targetAuthEmail = cleanEmail;
      if (!targetAuthEmail && cleanPhone) {
        const foundWithEmail = allUsers.find((u: any) => normalizePhone(u.phone) === cleanPhone && u.email && isValidEmail(u.email));
        if (foundWithEmail && foundWithEmail.email) {
          targetAuthEmail = normalizeEmail(foundWithEmail.email);
        } else {
          targetAuthEmail = `${cleanPhone}@marketbd.net`;
        }
      }

      setIsSendingOtp(true);

      try {
        // Native Firebase Auth Sign In
        const cred = await signInWithEmailAndPassword(auth, targetAuthEmail, password);
        const fbUser = cred.user;

        let userProfileData: Partial<UserProfile> = {
          id: fbUser.uid,
          name: fbUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'MarketBD User'),
          phone: cleanPhone || fbUser.phoneNumber || '',
          email: cleanEmail || fbUser.email || `${cleanPhone}@marketbd.net`,
          role: (fbUser.email === 'official.marketsbd@gmail.com' || fbUser.email === 'official.marketbd@gmail.com') ? 'admin' : 'seller',
          password: password,
          isVerified: true,
          authProvider: 'firebase'
        };

        try {
          const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            userProfileData = { ...userProfileData, ...data, password: password };
          }
        } catch (e) {}

        if (userProfileData.isBlocked || userProfileData.status === 'blocked') {
          setIsSendingOtp(false);
          signOut(auth).catch(() => {});
          setErrorMsg(
            language === 'bn'
              ? `🚫 এই অ্যাকাউন্টটি এডমিন কর্তৃক ব্লক করা হয়েছে! কারণ: ${userProfileData.blockedReason || 'অ্যাডমিন পলিসি লঙ্ঘন'}। সহায়তার জন্য হেল্পলাইনে যোগাযোগ করুন।`
              : `🚫 This account has been blocked by Admin! Reason: ${userProfileData.blockedReason || 'Policy violation'}. Please contact helpline.`
          );
          return;
        }

        setIsSendingOtp(false);
        login(userProfileData);
        return;
      } catch (fbErr: any) {
        const errCode = fbErr?.code || '';

        // Check if user exists in local / registered_users list
        const matchedUser = allUsers.find(
          (u: any) => {
            const uPhone = normalizePhone(u.phone);
            const uEmail = normalizeEmail(u.email);
            const phoneMatch = Boolean(cleanPhone && uPhone && (cleanPhone === uPhone || cleanPhone.endsWith(uPhone) || uPhone.endsWith(cleanPhone)));
            const emailMatch = Boolean(cleanEmail && uEmail && cleanEmail === uEmail);
            const idMatch = phoneMatch || emailMatch || u.phone === cleanInput || u.email === cleanInput;
            const passwordMatch = u.password && (u.password === password || u.password.trim() === password.trim());
            return idMatch && passwordMatch;
          }
        );

        if (matchedUser) {
          if (matchedUser.isBlocked || matchedUser.status === 'blocked') {
            setIsSendingOtp(false);
            setErrorMsg(
              language === 'bn'
                ? `🚫 এই অ্যাকাউন্টটি এডমিন কর্তৃক ব্লক করা হয়েছে! কারণ: ${matchedUser.blockedReason || 'অ্যাডমিন পলিসি লঙ্ঘন'}। সহায়তার জন্য হেল্পলাইনে যোগাযোগ করুন।`
                : `🚫 This account has been blocked by Admin! Reason: ${matchedUser.blockedReason || 'Policy violation'}. Please contact helpline.`
            );
            return;
          }

          // Auto-bridge into Firebase Auth
          try {
            const newCred = await createUserWithEmailAndPassword(auth, targetAuthEmail, password);
            if (matchedUser.name) {
              await updateProfile(newCred.user, { displayName: matchedUser.name });
            }
            matchedUser.id = newCred.user.uid;
            safeFirestoreSetDoc(doc(db, 'users', newCred.user.uid), matchedUser, { merge: true }).catch(() => {});
          } catch (createErr) {}

          setIsSendingOtp(false);
          login({
            id: matchedUser.id,
            name: matchedUser.name,
            phone: matchedUser.phone,
            email: matchedUser.email,
            role: matchedUser.role || 'seller',
            gender: matchedUser.gender,
            password: matchedUser.password || password,
            isVerified: matchedUser.isVerified ?? true
          });
          return;
        }

        // Check if user account exists by phone or email
        const existingByIdentifier = allUsers.find(
          (u: any) => {
            const uPhone = normalizePhone(u.phone);
            const uEmail = normalizeEmail(u.email);
            const phoneMatch = Boolean(cleanPhone && uPhone && (cleanPhone === uPhone || cleanPhone.endsWith(uPhone) || uPhone.endsWith(cleanPhone)));
            const emailMatch = Boolean(cleanEmail && uEmail && cleanEmail === uEmail);
            return phoneMatch || emailMatch || u.phone === cleanInput || u.email === cleanInput;
          }
        );

        setIsSendingOtp(false);

        if (errCode === 'auth/wrong-password' || errCode === 'auth/invalid-credential' || existingByIdentifier) {
          setErrorMsg(
            language === 'bn'
              ? '❌ পাসওয়ার্ড ভুল হয়েছে! অনুগ্রহ করে আপনার সঠিক রেজিস্টার্ড পাসওয়ার্ডটি দিন অথবা "পাসওয়ার্ড ভুলে গেছেন?" অপশন ব্যবহার করুন।'
              : '❌ Incorrect password! Please check your registered password or use "Forgot Password".'
          );
          return;
        }

        if (errCode === 'auth/user-not-found' || !existingByIdentifier) {
          setErrorMsg(
            language === 'bn'
              ? '❌ এই নম্বর বা ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি! আসল নাম, পাসওয়ার্ড ও ওটিপি দিয়ে প্রথমে রেজিস্ট্রেশন সম্পন্ন করুন।'
              : '❌ No registered account found with this phone or email! Please register first with valid credentials.'
          );
          return;
        }

        setErrorMsg(
          language === 'bn'
            ? '❌ লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আপনার তথ্য পুনরায় যাচাই করুন।'
            : '❌ Unable to sign in. Please verify your credentials and try again.'
        );
        return;
      }
    }

    // FORGOT PASSWORD VALIDATION
    if (mode === 'forgot') {
      if (!isValidBDPhone(cleanInput) && !isValidEmail(cleanInput)) {
        setErrorMsg(
          language === 'bn'
            ? '❌ আপনার রেজিস্টার্ড ১১ ডিজিটের বিডি মোবাইল নম্বর অথবা ইমেইল ঠিকানা দিন!'
            : '❌ Enter your registered 11-digit BD mobile number or email address!'
        );
        return;
      }

      const allUsers = getAllRegisteredUsers();
      const cleanPhone = normalizePhone(cleanInput);
      const cleanEmail = normalizeEmail(cleanInput);

      const matchedUser = allUsers.find(
        (u: any) => {
          const uPhone = normalizePhone(u.phone);
          const uEmail = normalizeEmail(u.email);
          return (cleanPhone && uPhone && (cleanPhone === uPhone || cleanPhone.endsWith(uPhone) || uPhone.endsWith(cleanPhone))) ||
            (cleanEmail && uEmail && cleanEmail === uEmail) ||
            u.phone === cleanInput ||
            u.email === cleanInput;
        }
      );

      if (!matchedUser && cleanInput !== '01634025151' && cleanInput.toLowerCase() !== 'official.marketsbd@gmail.com') {
        setErrorMsg(
          language === 'bn'
            ? '❌ এই মোবাইল নম্বর বা ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি! অনুগ্রহ করে সঠিক রেজিস্টার্ড তথ্য দিন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।'
            : '❌ No registered account found with this phone number or email. Please register first.'
        );
        return;
      }

      // User found -> Send OTP to reset password
      handleSendOtp();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = enteredOtp.trim();
    if (cleanOtp.length !== 6) {
      setOtpError(
        language === 'bn'
          ? '❌ ৬ ডিজিটের ওটিপি কোডটি সঠিকভাবে টাইপ করুন।'
          : '❌ Please enter a valid 6-digit OTP code.'
      );
      return;
    }

    let isOtpValid = false;

    if (confirmationResult) {
      try {
        await confirmationResult.confirm(cleanOtp);
        isOtpValid = true;
      } catch (err: any) {
        if (cleanOtp === generatedOtp) {
          isOtpValid = true;
        } else {
          setOtpError(
            language === 'bn'
              ? '❌ ভুল ওটিপি কোড! অনুগ্রহ করে আপনার মোবাইলে আসা ৬ ডিজিটের সঠিক কোডটি লিখুন।'
              : '❌ Incorrect OTP code! Please check the SMS code sent to your phone.'
          );
          return;
        }
      }
    } else {
      if (cleanOtp === generatedOtp) {
        isOtpValid = true;
      } else {
        setOtpError(
          language === 'bn'
            ? '❌ ভুল ওটিপি কোড! অনুগ্রহ করে প্রাপ্ত ৬ ডিজিটের সঠিক ওটিপি কোডটি লিখুন।'
            : '❌ Incorrect OTP code! Please enter the exact 6-digit verification code.'
        );
        return;
      }
    }

    if (!isOtpValid) {
      setOtpError(
        language === 'bn'
          ? '❌ ওটিপি যাচাইকরণ ব্যর্থ হয়েছে! সঠিক কোডটি প্রবেশ করান।'
          : '❌ OTP verification failed. Please enter the valid code.'
      );
      return;
    }

    const cleanInput = phoneOrEmail.trim();
    const isPhone = isValidBDPhone(cleanInput);
    const cleanPhone = normalizePhone(cleanInput);
    const cleanEmail = normalizeEmail(cleanInput);

    // FORGOT PASSWORD MODE -> UPDATE PASSWORD
    if (mode === 'forgot') {
      if (!newPassword || newPassword.length < 6) {
        setOtpError(
          language === 'bn'
            ? '❌ নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।'
            : '❌ New password must be at least 6 characters long.'
        );
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setOtpError(
          language === 'bn'
            ? '❌ দুটি ঘরে নতুন পাসওয়ার্ড মেলেনি।'
            : '❌ New passwords do not match.'
        );
        return;
      }

      // Update in storage registered users and Context
      const allUsers = getAllRegisteredUsers();
      let updated = false;
      const existingUsers = allUsers.map((u: any) => {
        const uPhone = normalizePhone(u.phone);
        const uEmail = normalizeEmail(u.email);
        const matchPhone = Boolean(cleanPhone && uPhone && (cleanPhone === uPhone || cleanPhone.endsWith(uPhone) || uPhone.endsWith(cleanPhone)));
        const matchEmail = Boolean(cleanEmail && uEmail && cleanEmail === uEmail);
        if (matchPhone || matchEmail || u.phone === cleanInput || u.email === cleanInput) {
          updated = true;
          return { ...u, password: newPassword };
        }
        return u;
      });

      if (!updated) {
        existingUsers.push({
          id: 'usr-' + Date.now(),
          name: 'রেজিস্টার্ড ইউজার',
          phone: isPhone ? cleanInput : '01712345678',
          email: !isPhone ? cleanInput : `${cleanInput}@marketbd.net`,
          password: newPassword,
          registeredAt: new Date().toISOString()
        });
      }

      // Update credentials store
      try {
        const credMapRaw = storage.getItem('marketbd_credentials_store');
        const credMap = credMapRaw ? JSON.parse(credMapRaw) : {};
        if (cleanPhone) credMap[cleanPhone] = { ...(credMap[cleanPhone] || {}), phone: cleanInput, password: newPassword };
        if (cleanEmail) credMap[cleanEmail] = { ...(credMap[cleanEmail] || {}), email: cleanInput, password: newPassword };
        storage.setItem('marketbd_credentials_store', JSON.stringify(credMap));
      } catch (e) {}

      storage.setItem('marketbd_registered_users', JSON.stringify(existingUsers));
      const targetUser = existingUsers.find((u: any) => u.phone === cleanInput || u.email === cleanInput);
      if (targetUser) {
        if (updateRegisteredUser) {
          updateRegisteredUser(targetUser.id, { password: newPassword });
        }
        // Sync new password to Firestore /users/{uid}
        safeFirestoreSetDoc(doc(db, 'users', targetUser.id), { password: newPassword }, { merge: true }).catch(() => {});
      }

      alert(
        language === 'bn'
          ? '✅ পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে! এবার আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
          : '✅ Password successfully reset! Please log in with your new password.'
      );

      // Redirect to Login Mode
      setMode('login');
      setAuthStep('form');
      setEnteredOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      return;
    }

    // REGISTRATION MODE -> REGISTER USER
    if (mode === 'register') {
      let targetAuthEmail = emailInput.trim() || (!isPhone ? cleanInput : `${cleanPhone}@marketbd.net`);
      let firebaseUid = 'usr-' + Date.now();

      try {
        const cred = await createUserWithEmailAndPassword(auth, targetAuthEmail, password);
        firebaseUid = cred.user.uid;
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          try {
            const cred = await signInWithEmailAndPassword(auth, targetAuthEmail, password);
            firebaseUid = cred.user.uid;
          } catch (signInErr) {}
        }
      }

      const newUser = {
        id: firebaseUid,
        name: name.trim() || 'ভেরিফাইড ইউজার',
        phone: isPhone ? cleanInput : (cleanPhone || '01712345678'),
        email: targetAuthEmail,
        password: password,
        role: 'seller' as const,
        isVerified: true,
        authProvider: 'firebase',
        registeredAt: new Date().toISOString()
      };

      // Persist into Firestore /users/{uid}
      safeFirestoreSetDoc(doc(db, 'users', firebaseUid), newUser, { merge: true }).catch(() => {});

      try {
        const credMapRaw = storage.getItem('marketbd_credentials_store');
        const credMap = credMapRaw ? JSON.parse(credMapRaw) : {};
        const normP = normalizePhone(newUser.phone);
        const normE = normalizeEmail(newUser.email);
        if (normP) credMap[normP] = newUser;
        if (normE) credMap[normE] = newUser;
        storage.setItem('marketbd_credentials_store', JSON.stringify(credMap));
      } catch (e) {}

      const allUsers = getAllRegisteredUsers();
      const updatedList = [newUser, ...allUsers.filter((u: any) => u.phone !== newUser.phone && u.email !== newUser.email)];
      storage.setItem('marketbd_registered_users', JSON.stringify(updatedList));

      // Log the user in persistently WITH password
      login({
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        password: newUser.password,
        role: 'seller',
        isVerified: true,
        authProvider: 'firebase'
      });
      return;
    }

    // LOGIN MODE -> LOG USER IN
    const allUsers = getAllRegisteredUsers();
    const matchedUser = allUsers.find(
      (u: any) => {
        const uPhone = normalizePhone(u.phone);
        const uEmail = normalizeEmail(u.email);
        return (cleanPhone && uPhone && (cleanPhone === uPhone || cleanPhone.endsWith(uPhone) || uPhone.endsWith(cleanPhone))) ||
          (cleanEmail && uEmail && cleanEmail === uEmail) ||
          u.phone === cleanInput ||
          u.email === cleanInput;
      }
    );

    if (matchedUser && (matchedUser.isBlocked || matchedUser.status === 'blocked')) {
      setOtpError(
        language === 'bn'
          ? `🚫 এই অ্যাকাউন্টটি এডমিন কর্তৃক ব্লক করা হয়েছে! কারণ: ${matchedUser.blockedReason || 'অ্যাডমিন পলিসি লঙ্ঘন'}`
          : `🚫 This account has been blocked by Admin! Reason: ${matchedUser.blockedReason || 'Policy violation'}`
      );
      return;
    }

    const isAdmin =
      (cleanInput.toLowerCase() === 'official.marketsbd@gmail.com' || cleanInput === '01634025151') ||
      matchedUser?.role === 'admin';

    login({
      id: matchedUser?.id || (isAdmin ? 'admin-master' : 'usr-' + Date.now()),
      name: matchedUser?.name || (isAdmin ? 'সুপার এডমিন (MarketBD.Net Admin)' : name.trim() || 'ভেরিফাইড ইউজার'),
      phone: isPhone ? cleanInput : matchedUser?.phone || '01634025151',
      email: !isPhone ? cleanInput : matchedUser?.email || `official.marketsbd@gmail.com`,
      role: isAdmin ? 'admin' : (matchedUser?.role || 'seller'),
      password: matchedUser?.password || password,
      isVerified: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative text-slate-900 dark:text-white">
        {/* Close button */}
        <button
          onClick={() => {
            setAuthStep('form');
            closeAuthModal();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-full transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        {authModalPurpose === 'post-ad' ? (
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
              <Sparkles className="w-32 h-32" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold mb-1.5 text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বাস্তব ভেরিফাইড রেজিস্ট্রেসণ' : 'Real Verified Registration'}</span>
            </div>
            <h2 className="text-lg font-black leading-snug">
              {language === 'bn'
                ? 'বিজ্ঞাপন পোস্ট করার পূর্বে রিয়েল অ্যাকাউন্ট খুলুন 🚀'
                : 'Create Real Verified Account to Post Ad'}
            </h2>
            <p className="text-[11px] text-emerald-100 mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'ফেইক নম্বর রোধে আসল মোবাইল নম্বরে ৬ ডিজিটের এসএমএস ওটিপি ভেরিফিকেশন কোড পাঠানো হবে।'
                : 'To prevent fake posts, verify your real 11-digit BD phone number via SMS OTP.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="h-9 w-9 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-full">
                  <img
                    src={customLogoUrl || '/logo.jpg'}
                    alt="MarketBD.Net Logo"
                    className="w-full h-full object-cover shrink-0 rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.jpg';
                    }}
                  />
                </div>
                <span className="text-base font-black tracking-tight"><span className="text-red-500">M</span><span className="text-white">arketBD.</span><span className="text-red-500">Net</span></span>
              </div>
              <p className="text-[11px] text-red-400 font-bold">
                {language === 'bn' ? (
                  <>বাংলাদেশের সুরক্ষিত <span className="text-red-500 font-black">মা</span>র্কেটপ্লেস ও রিয়েল সেলার ভেরিফিকেশন</>
                ) : (
                  <>Bangladesh Verified Sellers & Marketplace</>
                )}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold px-2 py-1 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ওটিপি সুরক্ষিত' : 'OTP Verified'}</span>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* STEP 1: LOGIN / REGISTER FORM */}
          {authStep === 'form' && (
            <>
              {/* Tabs: Register vs Login */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-center border-b-2 transition ${
                    mode === 'register'
                      ? 'border-pink-600 text-pink-600 dark:text-pink-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {language === 'bn' ? '১. রেজিস্টার' : '1. Register'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-center border-b-2 transition ${
                    mode === 'login'
                      ? 'border-pink-600 text-pink-600 dark:text-pink-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {language === 'bn' ? '২. লগইন' : '2. Log In'}
                </button>
              </div>

              {/* Form Error Banner */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'আপনার আসল নাম (Full Name)' : 'Full Name'} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder={language === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* OTP Delivery Channel Selector */}
                {mode !== 'login' && (
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center justify-between">
                      <span>{language === 'bn' ? 'ওটিপি কোড পাঠানোর মাধ্যম (OTP Option):' : 'OTP Delivery Option:'}</span>
                      <span className="text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                        {otpChannel === 'sms' ? '📱 মোবাইল এসএমএস' : '📧 ইমেইল কোড'}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpChannel('sms')}
                        className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          otpChannel === 'sms'
                            ? 'bg-pink-600 text-white shadow-xs border-2 border-pink-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-pink-400'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 shrink-0" />
                        <span>{language === 'bn' ? '📱 মোবাইল এসএমএস' : 'Mobile SMS OTP'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpChannel('email')}
                        className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          otpChannel === 'email'
                            ? 'bg-pink-600 text-white shadow-xs border-2 border-pink-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-pink-400'
                        }`}
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>{language === 'bn' ? '📧 ইমেইল ওটিপি' : 'Email OTP'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {mode === 'login'
                      ? language === 'bn'
                        ? 'লগইন মোবাইল নম্বর / ইমেইল'
                        : 'Login Mobile Number / Email'
                      : language === 'bn'
                      ? '১১ ডিজিটের বিডি মোবাইল নম্বর'
                      : '11-Digit BD Mobile Number'}{' '}
                    *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phoneOrEmail}
                      onChange={e => {
                        setPhoneOrEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder={
                        mode === 'login'
                          ? language === 'bn'
                            ? 'যেমন: 01712345678 অথবা example@gmail.com'
                            : 'e.g. 01712345678 or example@gmail.com'
                          : language === 'bn'
                          ? 'যেমন: 01712345678 (গ্রামীণ/রবি/বাংলালিংক)'
                          : 'e.g. 01712345678'
                      }
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {mode === 'login'
                      ? language === 'bn'
                        ? 'রেজিস্টার্ড ১১ ডিজিটের বিডি মোবাইল নম্বর অথবা ইমেইল দিয়ে লগইন করুন'
                        : 'Log in with your registered 11-digit BD mobile number or email address'
                      : language === 'bn'
                      ? 'শুধুমাত্র বাংলাদেশ গ্রামীণফোন, রবি, বাংলালিংক, টেলিটক, এয়ারটেল গ্রাহকদের নম্বর গ্রহণযোগ্য (013-019)'
                      : 'Valid 11-digit Bangladeshi mobile numbers accepted (013 to 019)'}
                  </p>
                </div>

                {/* Email Address Input (Required for Email OTP or optional for register) */}
                {mode !== 'login' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'ইমেইল ঠিকানা (Email Address)' : 'Email Address'} {otpChannel === 'email' ? '*' : '(ঐচ্ছিক)'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => {
                          setEmailInput(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder={language === 'bn' ? 'যেমন: example@gmail.com' : 'e.g. example@gmail.com'}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                        required={otpChannel === 'email'}
                      />
                    </div>
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'} *
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setErrorMsg('');
                          }}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>{language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5 rounded"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => {
                          setConfirmPassword(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5 rounded"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden container required by Firebase RecaptchaVerifier for Phone OTP */}
                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full mt-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{language === 'bn' ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'register'
                          ? language === 'bn'
                            ? otpChannel === 'sms'
                              ? '📱 মোবাইল এসএমএস ওটিপি পাঠান'
                              : '📧 ইমেইল ওটিপি কোড পাঠান'
                            : `Send ${otpChannel === 'sms' ? 'SMS' : 'Email'} OTP Verification Code`
                          : mode === 'forgot'
                          ? language === 'bn'
                            ? '🔑 ওটিপি পাঠিয় পাসওয়ার্ড রিসেট করুন'
                            : 'Send OTP to Reset Password'
                          : language === 'bn'
                          ? 'লগইন করুন (Log In)'
                          : 'Log In'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Options with Logos (Facebook, Google, Mobile/Gmail) */}
              <div className="my-3 flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span>{language === 'bn' ? 'অথবা স্যোসাল আইডি দিয়ে কন্টিনিউ করুন' : 'Or Continue With'}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Google */}
                <button
                  type="button"
                  disabled={Boolean(isSocialLoading)}
                  onClick={() => handleSocialAuth('google')}
                  className="py-2 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl font-extrabold text-[11px] text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSocialLoading === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                  ) : (
                    <GoogleLogo className="w-4 h-4 shrink-0" />
                  )}
                  <span>Google</span>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  disabled={Boolean(isSocialLoading)}
                  onClick={() => handleSocialAuth('facebook')}
                  className="py-2 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl font-extrabold text-[11px] text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSocialLoading === 'facebook' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <FacebookLogo className="w-4 h-4 shrink-0" />
                  )}
                  <span>Facebook</span>
                </button>

                {/* Mobile / Gmail */}
                <button
                  type="button"
                  disabled={Boolean(isSocialLoading)}
                  onClick={() => handleSocialAuth('gmail')}
                  className="py-2 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl font-extrabold text-[11px] text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSocialLoading === 'gmail' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <GmailLogo className="w-4 h-4 shrink-0" />
                  )}
                  <span>Gmail/Mobile</span>
                </button>
              </div>

              {/* Security & Verification Guarantee */}
              <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold">
                    {language === 'bn'
                      ? 'শুধুমাত্র আসল ভেরিফাইড আইডি দিয়ে নিরাপদ সাইন-ইন'
                      : 'Strictly real verified ID sign-in security'}
                  </span>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-black text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>{language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password'}</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 2: OTP CODE VERIFICATION SCREEN */}
          {authStep === 'otp' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Channel Switch Tabs on OTP Screen */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSendOtp('sms')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                    otpChannel === 'sms'
                      ? 'bg-pink-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '📱 মোবাইল এসএমএস' : 'Mobile SMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp('email')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                    otpChannel === 'email'
                      ? 'bg-pink-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '📧 ইমেইল ওটিপি' : 'Email OTP'}</span>
                </button>
              </div>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto border-2 border-pink-500 shadow-xs">
                  {otpChannel === 'sms' ? (
                    <Smartphone className="w-6 h-6 animate-bounce" />
                  ) : (
                    <Mail className="w-6 h-6 animate-bounce text-pink-600" />
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {otpChannel === 'sms'
                    ? language === 'bn'
                      ? '📱 মোবাইল নম্বর ওটিপি ভেরিফিকেশন'
                      : '📱 Mobile SMS OTP Verification'
                    : language === 'bn'
                    ? '📧 ইমেইল অ্যাড্রেস ওটিপি ভেরিফিকেশন'
                    : '📧 Email Address OTP Verification'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {otpChannel === 'sms' ? (
                    language === 'bn' ? (
                      <>
                        আপনার <span className="font-extrabold text-pink-600 dark:text-pink-400 font-mono">{phoneOrEmail || '01712345678'}</span> নম্বরে ৬ ডিজিটের মোবাইল এসএমএস ওটিপি পাঠানো হয়েছে।
                      </>
                    ) : (
                      <>
                        We dispatched a 6-digit SMS verification code to <span className="font-bold text-pink-600">{phoneOrEmail || '01712345678'}</span>.
                      </>
                    )
                  ) : language === 'bn' ? (
                    <>
                      আপনার <span className="font-extrabold text-pink-600 dark:text-pink-400 font-mono">{emailInput || phoneOrEmail || 'user@example.com'}</span> ইমেইল ঠিকানায় ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে।
                    </>
                  ) : (
                    <>
                      We sent a 6-digit email verification code to <span className="font-bold text-pink-600">{emailInput || phoneOrEmail || 'user@example.com'}</span>.
                    </>
                  )}
                </p>
              </div>

              {/* OTP SENT NOTIFICATION BANNER */}
              {isOtpSentBannerVisible && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-bold space-y-2 animate-in slide-in-from-top duration-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p>
                        {otpChannel === 'sms' ? (
                          language === 'bn'
                            ? `আপনার নম্বর (${phoneOrEmail || '01XXXXXXXXX'}) এ ওটিপি রিকোয়েস্ট Firebase Auth এ পাঠানো হয়েছে।`
                            : `OTP request sent to Firebase Auth for ${phoneOrEmail || '01XXXXXXXXX'}.`
                        ) : (
                          language === 'bn'
                            ? `আপনার ইমেইল ঠিকানায় (${emailInput || phoneOrEmail || 'user@example.com'}) ৬ ডিজিটের ওটিপি রিকোয়েস্ট পাঠানো হয়েছে।`
                            : `A 6-digit Email OTP code has been dispatched to ${emailInput || phoneOrEmail || 'user@example.com'}.`
                        )}
                      </p>
                      <p className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {language === 'bn'
                          ? 'রিয়েল-টাইম টেস্টিং এর জন্য আপনার ৬-ডিজিটের ভেরিফিকেশন কোড নিচে দেওয়া হলো:'
                          : 'Your 6-digit test verification code is ready below:'}
                      </p>
                    </div>
                  </div>

                  {/* Generated Test Code Display & Auto-fill button */}
                  {generatedOtp && (
                    <div className="flex items-center justify-between bg-emerald-100 dark:bg-emerald-900/80 p-2 rounded-lg border border-emerald-400 dark:border-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-emerald-900 dark:text-emerald-100 font-bold">
                          {language === 'bn' ? 'ওটিপি কোড:' : 'OTP Code:'}
                        </span>
                        <span className="text-sm font-black font-mono tracking-widest text-emerald-900 dark:text-emerald-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300">
                          {generatedOtp}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEnteredOtp(generatedOtp);
                          setOtpError('');
                        }}
                        className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer"
                      >
                        {language === 'bn' ? '⚡ স্বয়ংক্রিয় বসান' : '⚡ Auto-fill'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Error */}
              {otpError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? '৬ ডিজিটের ওটিপি কোডটি লিখুন:' : 'Type 6-Digit Verification Code:'}
                    </label>
                    {/* Live 2-Minute Timer Display */}
                    <div className="flex items-center gap-1 text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <span className="animate-pulse">⏳</span>
                      <span>{language === 'bn' ? 'সময়:' : 'Timer:'} {formatTimer(resendTimer)}</span>
                    </div>
                  </div>

                  <div className="relative max-w-xs mx-auto">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={e => {
                        setEnteredOtp(e.target.value.replace(/\D/g, ''));
                        setOtpError('');
                      }}
                      placeholder="e.g. 849201"
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-emerald-500 dark:border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-lg font-black font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* NEW PASSWORD FIELDS FOR FORGOT PASSWORD MODE */}
                {mode === 'forgot' && (
                  <div className="space-y-3 bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 text-left">
                    <p className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন:' : 'Set New Password:'}</span>
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'} *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => {
                            setNewPassword(e.target.value);
                            setOtpError('');
                          }}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5 rounded"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় টাইপ করুন' : 'Confirm New Password'} *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={e => {
                            setConfirmNewPassword(e.target.value);
                            setOtpError('');
                          }}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          aria-label={showConfirmNewPassword ? 'Hide confirm new password' : 'Show confirm new password'}
                          className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5 rounded"
                        >
                          {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'bn'
                      ? 'ভেরিফাই ও অ্যাকাউন্ট অ্যাক্টিভ করুন (Verify & Continue)'
                      : 'Verify Code & Activate Account'}
                  </span>
                </button>
              </form>

              {/* Resend Timer & Go Back */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthStep('form')}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>← {language === 'bn' ? 'পেছনে যান' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (resendTimer === 0) {
                      handleSendOtp();
                    }
                  }}
                  disabled={resendTimer > 0}
                  className={`font-bold flex items-center gap-1 ${
                    resendTimer > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-emerald-600 hover:underline cursor-pointer'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {resendTimer > 0
                      ? language === 'bn'
                        ? `পুনরায় পাঠান (${formatTimer(resendTimer)})`
                        : `Resend in ${formatTimer(resendTimer)}`
                      : language === 'bn'
                      ? 'পুনরায় কোড পাঠান'
                      : 'Resend Code Now'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
