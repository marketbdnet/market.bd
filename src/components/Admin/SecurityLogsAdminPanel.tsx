import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertTriangle,
  UserCheck,
  FileText,
  Activity,
  Sliders,
  Radio,
  Zap
} from 'lucide-react';
import { AdminSessionRecord, SecurityEventRecord } from '../../types/adminAuth';
import { SensitiveActionModal } from './SensitiveActionModal';

export const SecurityLogsAdminPanel: React.FC = () => {
  const { language, adminActiveSession, terminateOtherAdminSessions, currentUser, logAdminAction } = useMarket();

  const [activeTab, setActiveTab] = useState<'sessions' | 'events' | 'firewall' | 'mfa'>('sessions');

  const [blockedIps, setBlockedIps] = useState<string[]>([
    '103.245.192.11',
    '180.211.230.45',
    '45.112.180.9'
  ]);
  const [newIpInput, setNewIpInput] = useState('');

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState<AdminSessionRecord[]>([
    {
      id: 'sess-1',
      sessionToken: 'tok-curr-master',
      adminId: 'admin-master',
      adminEmail: currentUser?.email || 'official.marketbd@gmail.com',
      adminName: currentUser?.name || 'Official Super Admin',
      adminRole: 'Super Admin',
      deviceName: adminActiveSession?.deviceName || 'Desktop / PC Browser (Chrome Windows)',
      ip: adminActiveSession?.ip || '103.110.22.4',
      location: 'Dhaka, Bangladesh',
      loginTime: 'Active now',
      lastActiveTime: 'Just now',
      isCurrent: true
    },
    {
      id: 'sess-2',
      sessionToken: 'tok-mobile-app',
      adminId: 'staff-sec-01',
      adminEmail: 'security@marketbd.net',
      adminName: 'Chief Security Officer',
      adminRole: 'Security Admin',
      deviceName: 'Android App / WebView (Samsung Galaxy)',
      ip: '103.110.22.18',
      location: 'Chattogram, Bangladesh',
      loginTime: '45 mins ago',
      lastActiveTime: '2 mins ago',
      isCurrent: false
    }
  ]);

  // Security Events
  const [securityEvents, setSecurityEvents] = useState<SecurityEventRecord[]>([
    {
      id: 'ev-1',
      type: 'login_success',
      adminEmail: currentUser?.email || 'official.marketbd@gmail.com',
      ip: '103.110.22.4',
      device: 'Desktop / PC Browser',
      details: 'Super Admin authenticated via 2-Step OTP Verification',
      timestamp: 'Active Session',
      severity: 'low'
    },
    {
      id: 'ev-2',
      type: 'login_failed',
      adminEmail: 'unknown_attacker@bot.net',
      ip: '180.211.230.45',
      device: 'Python-requests / Bot',
      details: 'Failed admin credentials. Auto-blocked by WAF Shield',
      timestamp: '1 hour ago',
      severity: 'high'
    },
    {
      id: 'ev-3',
      type: 'sensitive_action_performed',
      adminEmail: 'payments@marketbd.net',
      ip: '103.110.22.35',
      device: 'Chrome / Windows',
      details: 'Manual payment verified (bKash ৳1,200) with 2FA token',
      timestamp: '2 hours ago',
      severity: 'medium'
    },
    {
      id: 'ev-4',
      type: 'mfa_verified',
      adminEmail: 'official.marketbd@gmail.com',
      ip: '103.110.22.4',
      device: 'Desktop',
      details: '2FA security challenge passed successfully',
      timestamp: '3 hours ago',
      severity: 'low'
    }
  ]);

  const [is2faEnforced, setIs2faEnforced] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // 2FA Sensitive Action Modal
  const [sensitiveModal, setSensitiveModal] = useState<{
    isOpen: boolean;
    type: 'terminate_session' | 'toggle_2fa' | 'claim_exclusive';
    targetId?: string;
    detailsDisplay?: string;
  }>({
    isOpen: false,
    type: 'terminate_session'
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleAddBlockedIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    const ip = newIpInput.trim();
    if (!blockedIps.includes(ip)) {
      setBlockedIps(prev => [...prev, ip]);
      showToast(language === 'bn' ? `✓ IP ${ip} সফলভাবে ফায়ারওয়ালে ব্লক করা হয়েছে!` : `✓ IP ${ip} added to firewall blacklist!`);
      logAdminAction({
        action: `Firewall: Blocked IP Address ${ip}`,
        actionType: 'security',
        details: 'Added malicious IP to blacklist'
      });
    }
    setNewIpInput('');
  };

  const handleRemoveBlockedIp = (ip: string) => {
    setBlockedIps(prev => prev.filter(i => i !== ip));
    showToast(language === 'bn' ? `✓ IP ${ip} আনব্লক করা হয়েছে!` : `✓ IP ${ip} unblocked!`);
    logAdminAction({
      action: `Firewall: Unblocked IP ${ip}`,
      actionType: 'security',
      details: 'Removed IP from blacklist'
    });
  };

  const handleConfirmSensitiveAction = (adminNote?: string) => {
    if (sensitiveModal.type === 'claim_exclusive') {
      terminateOtherAdminSessions();
      setActiveSessions(prev => prev.filter(s => s.isCurrent));
      logAdminAction({
        action: 'Claimed Exclusive Single-Device Session',
        actionType: 'security',
        details: adminNote || 'All other admin sessions forcibly revoked'
      });
      showToast(language === 'bn' ? '✓ এই ডিভাইসের জন্য একক এক্সেস কার্যকর হয়েছে! অন্য সকল সেশন বাতিল করা হয়েছে।' : '✓ Single-device session claimed! All other sessions terminated.');
    } else if (sensitiveModal.type === 'terminate_session' && sensitiveModal.targetId) {
      const id = sensitiveModal.targetId;
      setActiveSessions(prev => prev.filter(s => s.id !== id));
      logAdminAction({
        action: `Revoked Admin Session: ${id}`,
        actionType: 'security',
        details: adminNote || 'Session revoked by admin'
      });
      showToast(language === 'bn' ? '✓ সেশনটি সফলভাবে বাতিল করা হয়েছে।' : '✓ Admin session terminated.');
    } else if (sensitiveModal.type === 'toggle_2fa') {
      const nextVal = !is2faEnforced;
      setIs2faEnforced(nextVal);
      logAdminAction({
        action: `${nextVal ? 'Enforced' : 'Disabled'} Platform-wide 2FA Requirement`,
        actionType: 'security',
        details: adminNote || '2FA enforcement policy modified'
      });
      showToast(language === 'bn' ? `✓ ২FA পলিসি ${nextVal ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে!` : `✓ 2FA policy ${nextVal ? 'Enforced' : 'Disabled'}!`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-red-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Security Center & IP Firewall
            </span>
            <span className="bg-emerald-600/90 text-white text-[9px] font-mono px-2 py-0.5 rounded-full">
              Single-Device Guard Active
            </span>
          </div>
          <h2 className="text-xl font-black">
            {language === 'bn' ? '🛡️ এডমিন সিকিউরিটি সেন্টার, সেশন কন্ট্রোল ও আইপি ফায়ারওয়াল' : '🛡️ Admin Security Center, Sessions & IP Firewall'}
          </h2>
          <p className="text-xs text-red-200 max-w-xl">
            {language === 'bn'
              ? 'সুপার এডমিন একক ডিভাইস লক, দ্বি-স্তর বিশিষ্ট সুরক্ষা (২FA), সক্রিয় সেশন নজরদারি এবং অনুপ্রবেশ প্রতিরোধ ব্যবস্থা।'
              : 'Super Admin single-device concurrency lock, 2-Factor Authentication, live session monitoring, and real-time IP intrusion protection.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSensitiveModal({
                isOpen: true,
                type: 'claim_exclusive',
                detailsDisplay: 'Terminate all sessions except this active device'
              })
            }
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{language === 'bn' ? 'একক ডিভাইস লক কার্যকর করুন' : 'Claim Single-Device Lock'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Security Metrics Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Concurrence Lock</span>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Single Device</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">1 Active Device</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">MFA / 2FA Status</span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>{is2faEnforced ? 'Enforced (Active)' : 'Optional'}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">6-Digit OTP Protocol</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Blocked Malicious IPs</span>
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-black text-sm">
            <Globe className="w-4 h-4" />
            <span>{blockedIps.length} IPs Blocked</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">WAF Guard Enabled</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Security Incidents</span>
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-sm">
            <Activity className="w-4 h-4" />
            <span>0 Breaches</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Realtime Bot Defense</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sessions'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{language === 'bn' ? 'সক্রিয় সেশন কন্ট্রোল' : 'Active Sessions'} ({activeSessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{language === 'bn' ? 'সিকিউরিটি ইভেন্টস ও লগইন ট্রেইল' : 'Security Events & Logs'} ({securityEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('firewall')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'firewall'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'bn' ? 'আইপি ফায়ারওয়াল ও ব্লকলিস্ট' : 'IP Firewall Blacklist'} ({blockedIps.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mfa')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mfa'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{language === 'bn' ? '২FA ও পলিসি কনফিগারেশন' : '2FA Policy'}</span>
        </button>
      </div>

      {/* TAB 1: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-500" />
                <span>{language === 'bn' ? 'লাইভ ডিভাইস সেশন ও ডিভাইস আইডেন্টিটি' : 'Live Connected Device Sessions'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'বর্তমান অনুমোদিত সেশনসমূহ। কোনো অননুমোদিত ডিভাইস দেখলে তৎক্ষণাৎ সেশন বাতিল করুন।'
                  : 'Currently authenticated admin sessions. Terminate any unrecognized devices immediately.'}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeSessions.map(sess => (
              <div key={sess.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    sess.isCurrent
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}>
                    {sess.deviceName.toLowerCase().includes('mobile') || sess.deviceName.toLowerCase().includes('android') ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                      <span>{sess.deviceName}</span>
                      {sess.isCurrent && (
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-600 text-white rounded-full font-black uppercase">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {sess.adminEmail} • <span className="text-slate-700 dark:text-slate-300 font-bold">{sess.adminRole}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      IP: {sess.ip} • {sess.location} • Active: {sess.lastActiveTime}
                    </div>
                  </div>
                </div>

                <div>
                  {sess.isCurrent ? (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সক্রিয় প্রাইমারি' : 'Active Primary'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setSensitiveModal({
                          isOpen: true,
                          type: 'terminate_session',
                          targetId: sess.id,
                          detailsDisplay: `Revoke session on ${sess.deviceName} (${sess.ip})`
                        })
                      }
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সেশন বাতিল' : 'Revoke Session'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Security Events */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>{language === 'bn' ? 'লাইভ সিকিউরিটি ইভেন্ট স্ট্রিম' : 'Live Security Incident Stream'}</span>
            </h3>
          </div>

          <div className="space-y-2">
            {securityEvents.map(ev => {
              const isDanger = ev.severity === 'high' || ev.type === 'login_failed';
              const isSuccess = ev.severity === 'low' || ev.type === 'login_success';

              return (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isDanger
                      ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
                      : isSuccess
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isDanger ? (
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-xs flex items-center gap-2">
                        <span>{ev.details}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold bg-white/60 dark:bg-black/40">
                          {ev.severity}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-75 font-mono mt-0.5">
                        {ev.adminEmail && <span>Target: {ev.adminEmail} • </span>}
                        <span>IP: {ev.ip} • Device: {ev.device}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono shrink-0 opacity-70">
                    {ev.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: IP Firewall */}
      {activeTab === 'firewall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              <span>{language === 'bn' ? 'সন্দেহজনক আইপি ব্লক করুন' : 'Block IP Address'}</span>
            </h3>

            <form onSubmit={handleAddBlockedIp} className="space-y-3">
              <input
                type="text"
                value={newIpInput}
                onChange={e => setNewIpInput(e.target.value)}
                placeholder="e.g. 103.245.192.11"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'ব্লকলিস্টে যোগ করুন' : 'Add to Firewall Blacklist'}</span>
              </button>
            </form>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              {language === 'bn'
                ? 'ব্লক করা আইপি থেকে কোনো ইউজার বা রোবট ওয়েবসাইট বা এডমিন প্যানেলে প্রবেশ করতে পারবে না।'
                : 'Traffic originating from blocked IPs is unconditionally rejected at the gateway.'}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>{language === 'bn' ? 'বর্তমান ব্লকলিস্টকৃত আইপি' : 'Current Firewall Blacklist'}</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 rounded-full font-bold">
                {blockedIps.length} Active Rules
              </span>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {blockedIps.map(ip => (
                <div
                  key={ip}
                  className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/80 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-red-700 dark:text-red-300"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{ip}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedIp(ip)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Remove from Blacklist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 2FA Policy */}
      {activeTab === 'mfa' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-rose-500" />
                <span>{language === 'bn' ? 'এডমিন পোর্টাল দ্বি-স্তর বিশিষ্ট সুরক্ষা (2FA / OTP)' : 'Admin Two-Factor Security Protocol (2FA / OTP)'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'সকল এডমিন ও স্টাফদের লগইনকালে ওটিপি কোড বাধ্যতামূলক করতে পলিসি সক্রিয় করুন।'
                  : 'Mandate SMS or email OTP on all administrator and moderator sign-ins.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSensitiveModal({
                  isOpen: true,
                  type: 'toggle_2fa',
                  detailsDisplay: `Change 2FA enforcement to ${!is2faEnforced ? 'Active' : 'Disabled'}`
                })
              }
              className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition ${
                is2faEnforced
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {is2faEnforced ? (language === 'bn' ? '২FA বাধ্যতামূলক (সক্রিয়)' : '2FA Enforced (Active)') : (language === 'bn' ? '২FA ঐচ্ছিক' : '2FA Optional')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Super Admin Single-Device Policy</span>
              </h4>
              <p className="text-slate-500 leading-relaxed">
                Super Admin credential sharing is prohibited. Authenticating on a secondary device automatically issues a token revocation payload to previous devices.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Sensitive Action Challenge</span>
              </h4>
              <p className="text-slate-500 leading-relaxed">
                Financial approvals, payment verification, account deletion, and system maintenance switches require a re-authentication security challenge before execution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sensitive Action Modal */}
      <SensitiveActionModal
        isOpen={sensitiveModal.isOpen}
        onClose={() => setSensitiveModal({ ...sensitiveModal, isOpen: false })}
        onConfirm={handleConfirmSensitiveAction}
        titleBn="সিকিউরিটি অ্যাকশন অনুমোদন নিশ্চিতকরণ"
        titleEn="Authorize Security Action"
        actionType={sensitiveModal.type}
        requiredPermission="security.manage"
        adminRole="Super Admin"
        targetDisplay="Security Center Governance"
        detailsDisplay={sensitiveModal.detailsDisplay}
        language={language}
      />
    </div>
  );
};
