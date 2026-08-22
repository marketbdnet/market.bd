import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Clock,
  Save,
  CheckCircle2,
  Type,
  Palette,
  Sliders,
  Sparkles,
  Eye,
  RotateCcw,
  AArrowDown,
  AArrowUp
} from 'lucide-react';

export const ClockSettingsAdminPanel: React.FC = () => {
  const { language, clockSettings, updateClockSettings } = useMarket();

  // Local State
  const [fontSize, setFontSize] = useState<
    'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom'
  >(clockSettings.fontSize || 'sm');
  const [customFontSizePx, setCustomFontSizePx] = useState<number>(
    clockSettings.customFontSizePx || 16
  );
  const [fontFamily, setFontFamily] = useState<
    | 'vt323'
    | 'orbitron'
    | 'sharetech'
    | 'firacode'
    | 'pressstart'
    | 'siliguri'
    | 'sans'
    | 'serif'
    | 'custom'
  >(clockSettings.fontFamily || 'vt323');
  const [customFontFamily, setCustomFontFamily] = useState<string>(
    clockSettings.customFontFamily || ''
  );
  const [textColor, setTextColor] = useState<string>(
    clockSettings.textColor || '#34d399'
  );
  const [dateTextColor, setDateTextColor] = useState<string>(
    clockSettings.dateTextColor || '#6ee7b7'
  );
  const [bgColor, setBgColor] = useState<string>(
    clockSettings.bgColor || '#0f172a'
  );
  const [borderColor, setBorderColor] = useState<string>(
    clockSettings.borderColor || '#334155'
  );
  const [showPulseIcon, setShowPulseIcon] = useState<boolean>(
    clockSettings.showPulseIcon !== false
  );
  const [fontWeight, setFontWeight] = useState<
    'normal' | 'medium' | 'semibold' | 'bold' | 'black'
  >(clockSettings.fontWeight || 'bold');
  const [showSeconds, setShowSeconds] = useState<boolean>(
    clockSettings.showSeconds !== false
  );
  const [isWidgetEnabled, setIsWidgetEnabled] = useState<boolean>(
    clockSettings.isWidgetEnabled !== false
  );

  const [statusMsg, setStatusMsg] = useState('');

  // Preset Color Palettes
  const colorPresets = [
    { name: 'Neon Emerald', hex: '#34d399' },
    { name: 'Hot Pink', hex: '#f472b6' },
    { name: 'Gold Amber', hex: '#fbbf24' },
    { name: 'Electric Cyan', hex: '#22d3ee' },
    { name: 'Crimson Red', hex: '#f87171' },
    { name: 'Bright Violet', hex: '#a78bfa' },
    { name: 'Sunny Orange', hex: '#fb923c' },
    { name: 'Pure White', hex: '#ffffff' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateClockSettings({
      fontSize,
      customFontSizePx,
      fontFamily,
      customFontFamily: customFontFamily.trim(),
      textColor,
      dateTextColor,
      bgColor,
      borderColor,
      showPulseIcon,
      fontWeight,
      showSeconds,
      isWidgetEnabled,
    });

    setStatusMsg(
      language === 'bn'
        ? '✅ আপডেট সফল হয়েছে! (Update Successfully) - রানিং ঘড়ির কাস্টম সেটিংস সেভ হয়েছে।'
        : '✅ Update Successfully! - Live clock customization settings saved.'
    );
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleReset = () => {
    setFontSize('sm');
    setCustomFontSizePx(16);
    setFontFamily('vt323');
    setCustomFontFamily('');
    setTextColor('#34d399');
    setDateTextColor('#6ee7b7');
    setBgColor('#0f172a');
    setBorderColor('#334155');
    setShowPulseIcon(true);
    setFontWeight('bold');
    setShowSeconds(true);
    setIsWidgetEnabled(true);
  };

  // Helper for preview font family
  const getPreviewFontFamilyCss = () => {
    switch (fontFamily) {
      case 'vt323':
        return "'VT323', monospace";
      case 'orbitron':
        return "'Orbitron', sans-serif";
      case 'sharetech':
        return "'Share Tech Mono', monospace";
      case 'firacode':
        return "'Fira Code', monospace";
      case 'pressstart':
        return "'Press Start 2P', monospace";
      case 'siliguri':
        return "'Hind Siliguri', sans-serif";
      case 'sans':
        return 'ui-sans-serif, system-ui, sans-serif';
      case 'serif':
        return "'Playfair Display', Georgia, serif";
      case 'custom':
        return customFontFamily || 'monospace';
      default:
        return "'VT323', monospace";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Live Clock Customization
            </span>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>
                {language === 'bn'
                  ? '⏰ লাইভ রানিং ক্লক / ঘড়ির সাইজ, ফন্ট স্টাইল ও কালার কাস্টমাইজেশন'
                  : '⏰ Live Running Clock - Font Size, Styles & Color Controls'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-indigo-200">
            {language === 'bn'
              ? 'হেডারের রানিং ঘড়ির টেক্সট সাইজ, ফন্ট স্টাইল, কালার এবং ব্যাকগ্রাউন্ড পরিবর্তন ও নতুন ফন্ট সেটিং করুন।'
              : 'Customize top header running clock text size, font family, text colors, and background styles.'}
          </p>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center gap-1.5 shrink-0 min-w-[240px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-emerald-400" />
            {language === 'bn' ? 'লাইভ প্রিভিউ (Live Preview)' : 'Live Preview'}
          </span>
          <div
            style={{
              backgroundColor: bgColor,
              borderColor: borderColor,
              fontFamily: getPreviewFontFamilyCss(),
            }}
            className="border px-4 py-2 rounded-xl shadow-lg flex items-center gap-2.5 transition-all"
          >
            {showPulseIcon && (
              <Clock
                className="w-4 h-4 animate-pulse shrink-0"
                style={{ color: textColor }}
              />
            )}
            <div className="flex flex-col text-left leading-none justify-center gap-1">
              <span
                style={{ color: dateTextColor }}
                className="text-[10px] font-semibold tracking-tight whitespace-nowrap opacity-90"
              >
                {language === 'bn' ? 'বুধবার, ১২ আগস্ট ২০২৬' : 'Wed, 12 Aug 2026'}
              </span>
              <span
                style={{
                  color: textColor,
                  fontSize:
                    fontSize === 'custom'
                      ? `${customFontSizePx}px`
                      : fontSize === 'xs'
                      ? '12px'
                      : fontSize === 'sm'
                      ? '14px'
                      : fontSize === 'md'
                      ? '16px'
                      : fontSize === 'lg'
                      ? '18px'
                      : fontSize === 'xl'
                      ? '20px'
                      : fontSize === '2xl'
                      ? '24px'
                      : '28px',
                }}
                className={`tracking-wider whitespace-nowrap font-${fontWeight}`}
              >
                {showSeconds ? '09:45:22 AM' : '09:45 AM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Font Size Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {language === 'bn' ? '১. ঘড়ির ফন্ট সাইজ (Clock Font Size)' : '1. Clock Font Size'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { id: 'xs', label: 'Extra Small (XS)' },
              { id: 'sm', label: 'Small (SM)' },
              { id: 'md', label: 'Medium (MD)' },
              { id: 'lg', label: 'Large (LG)' },
              { id: 'xl', label: 'Extra Large (XL)' },
              { id: '2xl', label: 'Super (2XL)' },
              { id: '3xl', label: 'Mega (3XL)' },
              { id: 'custom', label: '⚙️ Custom Px' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFontSize(item.id as any)}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition cursor-pointer text-center ${
                  fontSize === item.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/50'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Size Slider / Input */}
          {fontSize === 'custom' && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 shrink-0">
                {language === 'bn' ? 'কাস্টম সাইজ (পিক্সেল):' : 'Custom Size (Pixels):'}
              </span>
              <input
                type="range"
                min="10"
                max="48"
                value={customFontSizePx}
                onChange={e => setCustomFontSizePx(Number(e.target.value))}
                className="flex-1 accent-indigo-600 cursor-pointer w-full"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={customFontSizePx}
                  onChange={e => setCustomFontSizePx(Number(e.target.value))}
                  className="w-16 py-1 px-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center text-indigo-600 dark:text-indigo-400"
                />
                <span className="text-xs font-bold text-slate-500">px</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Font Style & New Fonts (ফন্ট স্টাইল ও নিউ ফন্ট) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {language === 'bn' ? '২. ফন্ট স্টাইল ও নিউ ফন্ট নির্বাচন (Clock Font Styles)' : '2. Clock Font Styles & Family'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'vt323', label: '📟 Digital LED Clock', familyName: 'VT323 (Monospace)', styleCss: "'VT323', monospace" },
              { id: 'orbitron', label: '🚀 Cyber Futuristic', familyName: 'Orbitron', styleCss: "'Orbitron', sans-serif" },
              { id: 'sharetech', label: '🖥️ Tech Terminal Mono', familyName: 'Share Tech Mono', styleCss: "'Share Tech Mono', monospace" },
              { id: 'firacode', label: '💻 Developer Code Font', familyName: 'Fira Code', styleCss: "'Fira Code', monospace" },
              { id: 'pressstart', label: '🎮 Retro Gaming 8-Bit', familyName: 'Press Start 2P', styleCss: "'Press Start 2P', monospace" },
              { id: 'siliguri', label: '🌺 Stylized Bengali', familyName: 'Hind Siliguri', styleCss: "'Hind Siliguri', sans-serif" },
              { id: 'serif', label: '✒️ Luxury Serif', familyName: 'Playfair Display', styleCss: "'Playfair Display', serif" },
              { id: 'sans', label: '🌐 Modern Clean Sans', familyName: 'System Inter / Sans', styleCss: 'sans-serif' },
              { id: 'custom', label: '✍️ Custom Font Name', familyName: 'User Custom Family', styleCss: 'cursive' },
            ].map(font => (
              <button
                key={font.id}
                type="button"
                onClick={() => setFontFamily(font.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                  fontFamily === font.id
                    ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400/50 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{font.label}</span>
                  {fontFamily === font.id && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <span
                  style={{ fontFamily: font.styleCss }}
                  className="text-sm font-bold text-amber-600 dark:text-amber-400 truncate pt-1"
                >
                  12:45:00 PM
                </span>
              </button>
            ))}
          </div>

          {/* Custom Font Family Text Field */}
          {fontFamily === 'custom' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-2">
              <label className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                {language === 'bn' ? 'কাস্টম ফন্ট ফ্যামিলির নাম লিখুন (Custom Font Family Name):' : 'Type Custom Font Family Name:'}
              </label>
              <input
                type="text"
                value={customFontFamily}
                onChange={e => setCustomFontFamily(e.target.value)}
                placeholder="e.g. 'Dancing Script', cursive or 'Courier Prime', monospace"
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {language === 'bn'
                  ? 'টিপস: যেকোনো গুগল ফন্ট বা স্ট্যান্ডার্ড ওয়েব ফন্টের নাম টাইপ করুন (যেমন: "Segoe UI", "Tahoma", "Courier")।'
                  : 'Tip: Enter any Google Font or CSS font family name (e.g. "Segoe UI", "Tahoma", "Courier").'}
              </p>
            </div>
          )}

          {/* Font Weight */}
          <div className="pt-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-2">
              {language === 'bn' ? 'ফন্ট থিকনেস (Font Weight / পুরুত্ব):' : 'Font Weight / Thickness:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'medium', label: 'Medium' },
                { id: 'semibold', label: 'Semi Bold' },
                { id: 'bold', label: 'Bold' },
                { id: 'black', label: 'Extra Black' },
              ].map(w => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setFontWeight(w.id as any)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                    fontWeight === w.id
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Text & Background Colors (টেক্সট কালার পরিবর্তন) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {language === 'bn' ? '৩. ঘড়ির টেক্সট ও ব্যাকগ্রাউন্ড কালার পরিবর্তন (Colors)' : '3. Clock Text & Background Colors'}
            </h3>
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'bn' ? 'রেডিমেড টেক্সট কালার প্যালেট (Color Presets):' : 'Quick Text Color Presets:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(preset => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    setTextColor(preset.hex);
                    setDateTextColor(preset.hex);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition text-xs font-bold cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {/* Pick 1: Time Text Color */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                {language === 'bn' ? 'সময় টেক্সট কালার (Time Color):' : 'Time Text Color:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Pick 2: Date Text Color */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                {language === 'bn' ? 'তারিখ টেক্সট কালার (Date Color):' : 'Date Text Color:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={dateTextColor}
                  onChange={e => setDateTextColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={dateTextColor}
                  onChange={e => setDateTextColor(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Pick 3: Background Color */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                {language === 'bn' ? 'ব্যাকগ্রাউন্ড কালার (Background):' : 'Background Color:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Pick 4: Border Color */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                {language === 'bn' ? 'বর্ডার কালার (Border Color):' : 'Border Color:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={borderColor}
                  onChange={e => setBorderColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={borderColor}
                  onChange={e => setBorderColor(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Display Toggles */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {language === 'bn' ? '৪. অন্যান্য ঘড়ি ডিসপ্লে অপশন (Display Toggles)' : '4. Other Clock Options'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Toggle 1: Widget Visibility */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isWidgetEnabled}
                onChange={e => setIsWidgetEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'হেডারে রানিং ঘড়ি সক্রিয় রাখুন' : 'Show Running Clock Widget'}
              </span>
            </label>

            {/* Toggle 2: Show Seconds */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={e => setShowSeconds(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'সেকেন্ড কাউন্ট প্রদর্শন করুন (:59)' : 'Show Live Seconds Counter'}
              </span>
            </label>

            {/* Toggle 3: Pulse Clock Icon */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showPulseIcon}
                onChange={e => setShowPulseIcon(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'ব্লিকিং ক্লক আইকন দেখান ⏰' : 'Show Pulsing Clock Icon'}
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5 text-white" />
            <span>
              {language === 'bn'
                ? 'ঘড়ির সকল সেটিংস সেভ করুন (Save Clock Settings)'
                : 'Save Clock Customization Settings'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto py-4 px-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset to Default'}</span>
          </button>
        </div>

        {/* Success Banner */}
        {statusMsg && (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black text-sm rounded-2xl shadow-lg animate-in fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};
