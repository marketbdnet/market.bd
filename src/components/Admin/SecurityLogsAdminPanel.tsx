import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Plus,
  Trash2,
  KeyRound,
  Check,
  Smartphone,
  Laptop,
  LogOut,
  RefreshCw
} from 'lucide-react';

export const SecurityLogsAdminPanel: React.FC = () => {
  const { language, adminActiveSession, terminateOtherAdminSessions } = useMarket();

  const [blockedIps, setBlockedIps] = useState<string[]>([
    '103.245.192.11',
    '180.211.230.45',
    '45.112.180.9'
  ]);

  const [newIpInput, setNewIpInput] = useState('');

  const [loginLogs] = useState([
    { id: 'l1', user: 'superadmin', ip: '103.110.22.4', location: 'Dhaka, BD', device: 'Chrome / Windows', time: 'Active now', status: 'Success (Current Session)' },
    { id: 'l2', user: 'unknown_bot', ip: '180.211.230.45', location: 'Unknown', device: 'Python-requests', time: '1 hour ago', status: 'Blocked (IP)' },
    { id: 'l3', user: 'tariq.mod', ip: '103.88.220.12', location: 'Chattogram, BD', device: 'Safari / macOS', time: '3 hours ago', status: 'Success' }
  ]);

  const [is2faEnforced, setIs2faEnforced] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const handleAddBlockedIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    const ip = newIpInput.trim();
    if (!blockedIps.includes(ip)) {
      setBlockedIps(prev => [...prev, ip]);
      setToastMsg(language === 'bn' ? `✓ IP ${ip} সফলভাবে ব্লকড লিস্টে যুক্ত করা হয়েছে!` : `✓ IP ${ip} blocked successfully!`);
      setTimeout(() => setToastMsg(''), 3000);
    }
    setNewIpInput('');
  };

  const handleRemoveBlockedIp = (ip: string) => {
    setBlockedIps(prev => prev.filter(i => i !== ip));
  };

  const handleClaimExclusiveSession = () => {
    terminateOtherAdminSessions();
    setToastMsg(language === 'bn' ? '✓ এই ডিভাইসটিকে একমাত্র সক্রিয় প্রাইমারি সুপার এডমিন ডিভাইস হিসেবে নিশ্চিত করা হয়েছে! অন্য সব সেশন বাতিল করা হয়েছে।' : '✓ Exclusive Super Admin session claimed for this device! All other sessions terminated.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-red-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Single-Device Admin Guard
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '🛡️ সুপার এডমিন একক ডিভাইস সিকিউরিটি ও আইপি ফায়ারওয়াল' : '🛡️ Super Admin Single-Device Security & IP Firewall'}
            </h2>
          </div>
          <p className="text-xs text-red-200 max-w-xl">
            {language === 'bn'
              ? 'সুপার এডমিন একই সাথে শুধুমাত্র একটি ডিভাইসে লগইন থাকতে পারবেন। অন্য ডিভাইসে লগইন হলে পূর্বের ডিভাইসটি স্বয়ংক্রিয়ভাবে ডিসকানেক্ট হবে।'
              : 'Super Admin is strictly limited to one concurrent device session. Logging in from another device immediately terminates the prior session.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-2xl border border-red-500/30 text-xs font-bold text-red-300">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>Single-Device Lock: Active</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Active Super Admin Session Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {language === 'bn' ? 'সুপার এডমিন সক্রিয় একক সেশন (Active Device Session)' : 'Active Super Admin Device Session'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'বর্তমান লগইনকৃত একমাত্র অনুমোদিত ডিভাইসের বিবরণ' : 'Details of the currently authorized single-device session'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimExclusiveSession}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এই ডিভাইসে একক এক্সেস লক করুন' : 'Lock & Claim Exclusivity'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Account</span>
            <span className="font-black text-slate-800 dark:text-slate-200">{adminActiveSession?.userEmail || 'official.marketsbd@gmail.com'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Device</span>
            <span className="font-black text-slate-800 dark:text-slate-200">{adminActiveSession?.deviceName || 'Desktop / PC Browser'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Session IP Address</span>
            <span className="font-mono font-black text-slate-800 dark:text-slate-200">{adminActiveSession?.ip || '103.110.22.4'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Session Token Status</span>
            <span className="inline-flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified & Exclusive</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2FA Toggle & IP Firewall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2FA & Firewall Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
                <KeyRound className="w-4 h-4 text-rose-500" />
                <span>Admin Portal 2FA Verification</span>
              </div>
              <input
                type="checkbox"
                checked={is2faEnforced}
                onChange={(e) => setIs2faEnforced(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'bn'
                ? 'এডমিন প্যানেলে প্রবেশের আগে পিন ও ওটিপি ভেরিফিকেশন বাধ্যতামূলক থাকবে।'
                : 'Enforce SMS / PIN OTP verification before granting admin portal access.'}
            </p>
          </div>

          <form onSubmit={handleAddBlockedIp} className="space-y-3">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              <span>{language === 'bn' ? 'সন্দেহজনক আইপি ব্লক করুন (Block IP Address)' : 'Block Malicious IP Address'}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIpInput}
                onChange={(e) => setNewIpInput(e.target.value)}
                placeholder="e.g. 103.245.192.11"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Block</span>
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
              Currently Blocked IP List ({blockedIps.length}):
            </h4>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {blockedIps.map((ip) => (
                <div
                  key={ip}
                  className="p-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/80 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-red-700 dark:text-red-300"
                >
                  <span>{ip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedIp(ip)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Security & Login Logs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>{language === 'bn' ? 'সাম্প্রতিক এডমিন লগইন ইতিহাস (Login Security Logs)' : 'Recent Admin Login Security Logs'}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">User & IP</th>
                  <th className="p-3">Location & Device</th>
                  <th className="p-3 text-right">Status & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                {loginLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{log.user}</div>
                      <div className="font-mono text-[11px] text-slate-500">{log.ip}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-700 dark:text-slate-300">{log.location}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.device}</div>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black ${
                          log.status.includes('Blocked')
                            ? 'bg-red-100 dark:bg-red-950 text-red-600'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        }`}
                      >
                        {log.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">{log.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

