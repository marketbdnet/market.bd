import React, { useState, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Smartphone,
  Sparkles,
  Send,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Camera,
  MapPin,
  Image as ImageIcon,
  Wifi,
  Lock,
  Code,
  Mic,
  Bell,
  Film,
  HardDrive,
  Upload,
  Link2,
  FileCheck,
  Play
} from 'lucide-react';
import {
  checkAndRequestCamera,
  checkAndRequestLocation,
  checkAndRequestNotifications,
  checkAndRequestMicrophone,
  PermissionStatusResult
} from '../../utils/permissionUtils';
import { downloadApkFile, formatDirectApkUrl } from '../../utils/apkDownloadHelper';

export const AppUpdateAdminPanel: React.FC = () => {
  const { language, appRelease, updateAppRelease, userInstalledVersion } = useMarket();

  const [versionInput, setVersionInput] = useState(appRelease.version);
  const [titleBnInput, setTitleBnInput] = useState(appRelease.titleBn);
  const [titleEnInput, setTitleEnInput] = useState(appRelease.titleEn);
  const [notesBnInput, setNotesBnInput] = useState(appRelease.notesBn);
  const [notesEnInput, setNotesEnInput] = useState(appRelease.notesEn);
  const [isMandatoryInput, setIsMandatoryInput] = useState(appRelease.isMandatory);
  const [apkUrlInput, setApkUrlInput] = useState(appRelease.apkDownloadUrl || '/MarketBD.apk');
  const [playStoreUrlInput, setPlayStoreUrlInput] = useState(appRelease.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.marketbd.app');

  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [permissionTestResult, setPermissionTestResult] = useState<PermissionStatusResult | null>(null);
  const [testingPermission, setTestingPermission] = useState<string | null>(null);
  const [isTestingDownload, setIsTestingDownload] = useState(false);
  const [testDownloadSuccess, setTestDownloadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const androidPermissionsList = [
    {
      name: 'android.permission.INTERNET',
      tag: 'INTERNET',
      icon: Wifi,
      category: 'Network & API',
      badge: 'Auto-Granted',
      descBn: 'সার্ভারের সাথে লাইভ ডেটা, নতুন বিজ্ঞাপন পোস্ট, ও রিয়েলটাইম চ্যাট আদান-প্রদানের জন্য প্রয়োজনীয়।',
      descEn: 'Required for real-time API communication, live seller chat, and marketplace data fetch.'
    },
    {
      name: 'android.permission.READ_MEDIA_IMAGES',
      tag: 'READ_MEDIA_IMAGES',
      icon: ImageIcon,
      category: 'Media & Storage',
      badge: 'Runtime Prompt (Android 13+)',
      descBn: 'ইউজার ও সেলারদের ফোনের গ্যালারি থেকে সরাসরি পণ্যের ছবি ও ব্যানার আপলোড করার পারমিশন।',
      descEn: 'Allows sellers and users to select and upload product photos directly from the phone gallery.'
    },
    {
      name: 'android.permission.CAMERA',
      tag: 'CAMERA',
      icon: Camera,
      category: 'Hardware Camera',
      badge: 'Runtime Prompt',
      descBn: 'অ্যাপ থেকে সরাসরি ক্যামেরা চালু করে ইনস্ট্যান্ট বিজ্ঞাপনের পণ্যের ছবি তোলা ও সেলার ভেরিফিকেশন।',
      descEn: 'Enables in-app camera capture for posting product photos and real-time seller verification.'
    },
    {
      name: 'android.permission.ACCESS_FINE_LOCATION',
      tag: 'ACCESS_FINE_LOCATION',
      icon: MapPin,
      category: 'GPS Location',
      badge: 'GPS Accuracy',
      descBn: 'ইউজারের সঠিক জিপিএস পজিশন থেকে স্বয়ংক্রিয়ভাবে বাংলাদেশের বিভাগ, জেলা ও থানা সনাক্তকরণ।',
      descEn: 'GPS precise location for auto-detecting Bangladesh districts, thanas, and nearby ads.'
    },
    {
      name: 'android.permission.ACCESS_COARSE_LOCATION',
      tag: 'ACCESS_COARSE_LOCATION',
      icon: MapPin,
      category: 'Network Location',
      badge: 'Cell/WiFi Location',
      descBn: 'মোবাইল নেটওয়ার্ক ও ওয়াইফাই দিয়ে দ্রুত স্থানীয় শহরের বিজ্ঞাপন ফিল্টারিং ও সাজেস্ট করা।',
      descEn: 'Cellular/WiFi based coarse location to automatically categorize items by user area.'
    },
    {
      name: 'android.permission.RECORD_AUDIO',
      tag: 'RECORD_AUDIO',
      icon: Mic,
      category: 'Voice Search',
      badge: 'Runtime Prompt',
      descBn: 'সার্চ বারে কথা বলে ভয়েস সার্চ ও AI স্মার্ট প্রোডাক্ট খোঁজার জন্য মাইক্রোফোন এক্সেস।',
      descEn: 'Allows microphone access for speaking to search products via AI Voice Search.'
    },
    {
      name: 'android.permission.POST_NOTIFICATIONS',
      tag: 'POST_NOTIFICATIONS',
      icon: Bell,
      category: 'Push Alerts',
      badge: 'Optional / Runtime Prompt',
      descBn: 'নতুন চ্যাট মেসেজ, বিজ্ঞাপনের অনুমোদন, প্রাইস ড্রপ অ্যালার্ট এবং অফারের পুশ নোটিফিকেশন প্রদান।',
      descEn: 'Sends push notifications for live buyer-seller chats, ad approvals, and price drop alerts.'
    },
    {
      name: 'android.permission.READ_MEDIA_VIDEO',
      tag: 'READ_MEDIA_VIDEO',
      icon: Film,
      category: 'Media & Video',
      badge: 'Optional (Android 13+)',
      descBn: 'পণ্যের শর্ট ভিডিও ডেমো বা আনবক্সিং ক্লিপ বিজ্ঞাপনের সাথে যুক্ত ও আপলোড করার পারমিশন।',
      descEn: 'Enables uploading and previewing short product demo video clips for premium ads.'
    },
    {
      name: 'android.permission.WRITE_EXTERNAL_STORAGE',
      tag: 'WRITE_EXTERNAL_STORAGE',
      icon: HardDrive,
      category: 'Downloads & Invoices',
      badge: 'Legacy (Android ≤10)',
      descBn: 'অ্যাপ থেকে ক্রয়ের ইনভয়েস রসিদ (PDF) ও পণ্যের রসিদ মেমোরিতে সংরক্ষণ ও ডাউনলোড সুবিধা।',
      descEn: 'Allows saving purchase receipt PDFs, invoices, and offline assets on older Android versions.'
    }
  ];

  const androidManifestXmlSnippet = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.marketbd.app">

    <!-- 1. Network & Internet (Required for marketbd.net, DB, Seller Chat, API Sync) -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <!-- 2. Photo / File Gallery Access (Product Photos & Uploads) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <!-- 3. Camera (Take Ad Product Photos & Profile Pictures) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <!-- 4. Location - Fine & Coarse (Auto-detect Bangladesh District, Thana & Nearby Ads) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />

    <!-- 5. Microphone (Voice Search & Audio Notes Feature) -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />

    <!-- 6. Notifications (Optional for Chat/Order/Ad Alerts) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="MarketBD.Net"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MarketBD"
        android:usesCleartextTraffic="false">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:theme="@style/Theme.MarketBD.NoActionBar"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <!-- FileProvider for Safe Camera Photo Capture & File Uploads -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>`;

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(androidManifestXmlSnippet);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  const handleTestCamera = async () => {
    setTestingPermission('camera');
    const result = await checkAndRequestCamera();
    setPermissionTestResult(result);
    setTestingPermission(null);
  };

  const handleTestLocation = async () => {
    setTestingPermission('location');
    const result = await checkAndRequestLocation();
    setPermissionTestResult(result);
    setTestingPermission(null);
  };

  const handleTestNotifications = async () => {
    setTestingPermission('notifications');
    const result = await checkAndRequestNotifications();
    setPermissionTestResult(result);
    setTestingPermission(null);
  };

  const handleTestMicrophone = async () => {
    setTestingPermission('microphone');
    const result = await checkAndRequestMicrophone();
    setPermissionTestResult(result);
    setTestingPermission(null);
  };

  // Auto-format Google Drive / Cloud links into direct download links
  const handleAutoFormatUrl = () => {
    const formatted = formatDirectApkUrl(apkUrlInput);
    setApkUrlInput(formatted);
  };

  // Handle local APK file upload
  const handleApkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      alert(language === 'bn' ? '⚠️ অনুগ্রহ করে একটি বৈধ .apk ফাইল সিলেক্ট করুন।' : 'Please select a valid .apk file.');
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${sizeInMb} MB`);

    // Create a local Object URL for instant testing and download
    const objectUrl = URL.createObjectURL(file);
    setApkUrlInput(objectUrl);
  };

  // Test downloading the current configured APK
  const handleTestDownload = async () => {
    setIsTestingDownload(true);
    setTestDownloadSuccess(false);

    try {
      const fileName = `MarketBD_v${versionInput || '2.5.0'}.apk`;
      await downloadApkFile({
        apkUrl: apkUrlInput,
        version: versionInput || '2.5.0',
        fileName,
        onComplete: () => {
          setIsTestingDownload(false);
          setTestDownloadSuccess(true);
          setTimeout(() => setTestDownloadSuccess(false), 5000);
        }
      });
    } catch (err) {
      setIsTestingDownload(false);
      console.error('Test download failed:', err);
    }
  };

  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionInput.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে ভার্সন নম্বর প্রদান করুন।' : 'Please enter a version number.');
      return;
    }

    const finalApkUrl = formatDirectApkUrl(apkUrlInput.trim());

    updateAppRelease({
      version: versionInput.trim(),
      buildNumber: Math.floor(Date.now() / 1000),
      releaseDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      titleBn: titleBnInput.trim(),
      titleEn: titleEnInput.trim(),
      notesBn: notesBnInput.trim(),
      notesEn: notesEnInput.trim(),
      isMandatory: isMandatoryInput,
      apkDownloadUrl: finalApkUrl,
      playStoreUrl: playStoreUrlInput.trim(),
      publishedAt: new Date().toISOString()
    });

    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 p-5 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xs shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'bn' ? '📱 অ্যান্ডয়েড অ্যাপস ও পারমিশন কন্ট্রোল সেন্টার' : '📱 Android App & Permissions Control Center'}</span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                READY
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'অ্যান্ড্রয়েড অ্যাপসে ইন্টারনেট, গ্যালারি ইমেজ, ক্যামেরা ও জিপিএস লোকেশন পারমিশন কনফিগারেশন এবং রিলিজ আপডেট।'
                : 'Android App Permissions (INTERNET, CAMERA, LOCATION, MEDIA) and live release updates management.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">{language === 'bn' ? 'লাইভ ভার্সন' : 'Live Version'}</span>
            <span className="text-emerald-700 dark:text-emerald-400 text-sm font-black">{appRelease.version}</span>
          </div>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">{language === 'bn' ? 'ইনস্টলড ক্লায়েন্ট' : 'Installed Client'}</span>
            <span className="text-amber-700 dark:text-amber-400 text-sm font-black">{userInstalledVersion}</span>
          </div>
        </div>
      </div>

      {/* Android Permissions Config Card */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'bn' ? '📱 অ্যান্ড্রয়েড অ্যাপ ইনস্টলেশন ও রানটাইম পারমিশন তালিকা' : '📱 Android Installation & Runtime Permissions'}</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">10 Permissions Active</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'ফোনে অ্যাপ ইনস্টল ও ব্যবহার করার সময় ইউজারের কাছে এই পারমিশনগুলো চাওয়া হবে এবং সচল থাকবে।'
                  : 'These permissions are configured in AndroidManifest.xml and prompted to the user on phone.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyManifest}
              className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {copiedManifest ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedManifest ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি Manifest XML' : 'Copy Manifest XML')}</span>
            </button>
          </div>
        </div>

        {/* 10 Permissions List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {androidPermissionsList.map((perm) => {
            const Icon = perm.icon;
            return (
              <div
                key={perm.name}
                className="bg-gray-50/70 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md border border-gray-200 dark:border-slate-600">
                      {perm.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {perm.badge}
                  </span>
                </div>

                <div className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 select-all pt-1">
                  &lt;uses-permission android:name="{perm.name}" /&gt;
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'bn' ? perm.descBn : perm.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Test Runtime Permissions Box */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'bn' ? 'লাইভ পারমিশন প্রম্পট টেস্ট (Test Runtime Permissions)' : 'Test Live Permission Prompts'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'ব্রাউজার বা অ্যান্ড্রয়েড ওয়েবভিউতে পারমিশন রিকোয়েস্ট টেস্ট করুন:' : 'Trigger native camera/location/mic/notification prompts to verify:'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestCamera}
                disabled={testingPermission === 'camera'}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{testingPermission === 'camera' ? 'টেস্টিং...' : (language === 'bn' ? 'ক্যামেরা টেস্ট' : 'Test Camera')}</span>
              </button>

              <button
                type="button"
                onClick={handleTestLocation}
                disabled={testingPermission === 'location'}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{testingPermission === 'location' ? 'টেস্টিং...' : (language === 'bn' ? 'লোকেশন টেস্ট' : 'Test Location')}</span>
              </button>

              <button
                type="button"
                onClick={handleTestMicrophone}
                disabled={testingPermission === 'microphone'}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{testingPermission === 'microphone' ? 'টেস্টিং...' : (language === 'bn' ? 'ভয়েস/মাইক টেস্ট' : 'Test Mic')}</span>
              </button>

              <button
                type="button"
                onClick={handleTestNotifications}
                disabled={testingPermission === 'notifications'}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{testingPermission === 'notifications' ? 'টেস্টিং...' : (language === 'bn' ? 'নোটিফিকেশন টেস্ট' : 'Test Notifications')}</span>
              </button>
            </div>
          </div>

          {permissionTestResult && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
              permissionTestResult.granted
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
            }`}>
              {permissionTestResult.granted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{permissionTestResult.message}</span>
            </div>
          )}
        </div>

        {/* AndroidManifest.xml Code Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-600" />
              <span>android/app/src/main/AndroidManifest.xml</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Android 6.0 to 14+ Compatible</span>
          </div>

          <pre className="p-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-800 dark:text-emerald-400 overflow-x-auto max-h-52 leading-relaxed">
            {androidManifestXmlSnippet}
          </pre>
        </div>

        {/* Android Target Production URL Card */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'অ্যান্ড্রয়েড অ্যাপ লাইভ ইউআরএল টার্গেট:' : 'Android Live Production URL Target:'}</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-700">
              Connected & Configured
            </span>
          </div>
          <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-white">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold select-all">https://marketbd.net/</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'bn' ? '📱 MainActivity.java & কাস্টম WebView তে কনফিগার করা হয়েছে' : 'Configured in MainActivity.java & Custom WebView'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'অ্যান্ড্রয়েড অ্যাপ বিল্ড (APK/AAB) ওপেন করলে সরাসরি আপনার লাইভ ডোমেন https://marketbd.net/ লোড হবে এবং ব্যাক-বাটন, ক্যামেরা, লোকেশন, মাইক্রোফোন ও পুশ নোটিফিকেশন অ্যাপের ভেতরেই চলবে।'
              : 'When building APK/AAB, the app directly loads https://marketbd.net/ in standalone WebView with native camera, location, audio search, and back-button navigation enabled.'}
          </p>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 font-bold text-xs sm:text-sm animate-in zoom-in-95">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <span>
            {language === 'bn'
              ? '🎉 নতুন অ্যাপ আপডেট ও লিখিত রিলিজ নোটস সফলভাবে অবমুক্ত করা হয়েছে! সকল ইউজারদের কাছে নোটিফিকেশন পৌছে গেছে।'
              : '🎉 App update & release notes published successfully! All users have received the update alert.'}
          </span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handlePublishUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Version & Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-md">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>{language === 'bn' ? '১. ভার্সন ও ডিরেক্টরি সেটিংস' : '1. Version & Link Config'}</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'bn' ? 'নতুন ভার্সন নম্বর (e.g. v2.6.0)' : 'New Version Number'}
            </label>
            <input
              type="text"
              value={versionInput}
              onChange={e => setVersionInput(e.target.value)}
              placeholder="v2.6.0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'bn' ? 'আপডেট শিরোনাম (বাংলা)' : 'Update Title (Bengali)'}
            </label>
            <input
              type="text"
              value={titleBnInput}
              onChange={e => setTitleBnInput(e.target.value)}
              placeholder="নতুন সিকিউরিটি আপডেট ও ফিচার v2.6.0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'bn' ? 'আপডেট শিরোনাম (English)' : 'Update Title (English)'}
            </label>
            <input
              type="text"
              value={titleEnInput}
              onChange={e => setTitleEnInput(e.target.value)}
              placeholder="Security & Feature Update v2.6.0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* APK Download & File Management Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'অ্যান্ড্রয়েড APK ডাউনলোড লিংক ও ফাইল' : 'Android APK Download URL & File'}</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {language === 'bn' ? 'বাস্তব ডাউনলোড' : 'Direct Download'}
              </span>
            </div>

            <div>
              <input
                type="text"
                value={apkUrlInput}
                onChange={e => setApkUrlInput(e.target.value)}
                placeholder="/MarketBD.apk অথবা Google Drive ডিরেক্ট লিংক"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Quick Action Buttons for APK */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Google Drive Converter */}
              {apkUrlInput.includes('drive.google.com') && (
                <button
                  type="button"
                  onClick={handleAutoFormatUrl}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'গুগল ড্রাইভ লিংক ডিরেক্ট ডাউনলোডে রূপান্তর করুন' : 'Convert Drive Link to 1-Click Direct'}</span>
                </button>
              )}

              {/* Set Server Built-in APK */}
              <button
                type="button"
                onClick={() => setApkUrlInput('/MarketBD.apk')}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'bn' ? 'হোস্টের মূল APK ফাইল সেট করুন (/MarketBD.apk)' : 'Use Default Host APK (/MarketBD.apk)'}</span>
              </button>

              {/* Upload Local APK File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কম্পিউটার/ফোন থেকে .APK আপলোড' : 'Upload Local .APK File'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".apk"
                onChange={handleApkFileUpload}
                className="hidden"
              />

              {/* Test Download APK Button */}
              <button
                type="button"
                onClick={handleTestDownload}
                disabled={isTestingDownload}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isTestingDownload ? 'animate-bounce' : ''}`} />
                <span>{isTestingDownload ? 'ডাউনলোড হচ্ছে...' : (language === 'bn' ? '⬇️ টেস্ট ডাউনলোড করুন' : 'Test Download APK')}</span>
              </button>
            </div>

            {uploadedFileName && (
              <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                  <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                  <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-1.5 py-0.2 rounded font-mono">{uploadedFileSize}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">Loaded</span>
              </div>
            )}

            {testDownloadSuccess && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'bn' ? '✅ এপিকে টেস্ট ডাউনলোড সফলভাবে শুরু হয়েছে!' : '✅ APK test download initiated successfully!'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'bn' ? 'গুগল প্লে স্টোর অ্যাপ লিংক (Google Play Store URL)' : 'Google Play Store App URL'}
            </label>
            <input
              type="url"
              value={playStoreUrlInput}
              onChange={e => setPlayStoreUrlInput(e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=com.marketbd.app"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="mandatoryToggle"
              checked={isMandatoryInput}
              onChange={e => setIsMandatoryInput(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="mandatoryToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              {language === 'bn' ? 'বাধ্যতামূলক আপডেট (Mandatory Update - পপআপ স্কিপ করা যাবে না)' : 'Mandatory Update (Force Update)'}
            </label>
          </div>
        </div>

        {/* Right Column: Written Release Notes (লিখিত রূপ) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{language === 'bn' ? '২. লিখিত আপডেট বিবরণ (Release Notes & Changelog)' : '2. Written Release Notes'}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'লিখিত বিবরণ (বাংলা - পয়েন্ট আকারে লিখুন)' : 'Written Notes (Bengali)'}
              </label>
              <textarea
                value={notesBnInput}
                onChange={e => setNotesBnInput(e.target.value)}
                rows={5}
                placeholder="• ওটিপি সিকিউরিটি যুক্ত করা হয়েছে...&#10;• গতি বৃদ্ধি করা হয়েছে..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'লিখিত বিবরণ (English)' : 'Written Notes (English)'}
              </label>
              <textarea
                value={notesEnInput}
                onChange={e => setNotesEnInput(e.target.value)}
                rows={4}
                placeholder="• Added OTP authentication...&#10;• Bug fixes..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
          >
            <Send className="w-4 h-4" />
            <span>{language === 'bn' ? '🚀 নতুন আপডেট ও রিলিজ নোটস প্রকাশ করুন' : 'Publish App Update & Release Notes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

