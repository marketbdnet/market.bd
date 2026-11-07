import React, { useEffect, useState } from 'react';
import { RefreshCw, Send, Save, Wallet } from 'lucide-react';
import { db, doc, getDoc, safeFirestoreSetDoc } from '../../lib/firebase';
import { storage } from '../../utils/storage';

const DEFAULT_TEMPLATE = 'Your MarketBD.Net OTP is {otp}';

async function callSms(body: Record<string, any>, adminSecret?: string) {
  const r = await fetch('/api/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}) },
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

export const SmsServerTools: React.FC<{ language: string }> = ({ language }) => {
  const bn = language === 'bn';

  const [adminSecret, setAdminSecret] = useState(storage.getItem('marketbd_sms_admin_secret') || '');
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [tplMsg, setTplMsg] = useState('');

  const [balance, setBalance] = useState<number | null>(null);
  const [totalRecharged, setTotalRecharged] = useState(storage.getItem('marketbd_sms_total_recharged') || '');
  const [ratePerSms, setRatePerSms] = useState(storage.getItem('marketbd_sms_rate') || '0.29');
  const [balMsg, setBalMsg] = useState('');

  const [custPhone, setCustPhone] = useState('');
  const [custMsg, setCustMsg] = useState('');
  const [sendMsg, setSendMsg] = useState('');

  // Load the saved OTP template from the cloud settings document.
  useEffect(() => {
    getDoc(doc(db, 'settings', 'sms_config'))
      .then(snap => {
        const t = snap.data()?.otpTemplate;
        if (t) setTemplate(String(t));
      })
      .catch(() => {});
  }, []);

  const saveSecret = (v: string) => {
    setAdminSecret(v);
    storage.setItem('marketbd_sms_admin_secret', v);
  };

  const saveTemplate = async () => {
    if (!/\{otp\}/i.test(template)) {
      setTplMsg(bn ? '❌ টেমপ্লেটে {otp} লিখতে হবে (যেখানে কোডটি বসবে)।' : '❌ Template must contain {otp}.');
      return;
    }
    const preview = template.replace(/\{otp\}/gi, '123456');
    if (preview.length > 70) {
      setTplMsg(bn ? `❌ মেসেজ ${preview.length} অক্ষর — ৭০ এর মধ্যে রাখুন, নাহলে ওটিপি যাবে না কিন্তু টাকা কাটবে।` : '❌ Keep OTP text within 70 characters.');
      return;
    }
    const maskingEnabled = storage.getItem('marketbd_sms_masking_enabled') !== 'false';
    const ok = await safeFirestoreSetDoc(
      doc(db, 'settings', 'sms_config'),
      { otpTemplate: template.trim(), maskingEnabled },
      { merge: true }
    );
    setTplMsg(ok === false
      ? (bn ? '❌ সেভ হয়নি। অ্যাডমিন হিসেবে লগইন আছে কিনা দেখুন।' : '❌ Could not save. Make sure you are logged in as admin.')
      : (bn ? '✅ ওটিপি মেসেজ সেভ হয়েছে।' : '✅ OTP message saved.'));
    setTimeout(() => setTplMsg(''), 4000);
  };

  const checkBalance = async () => {
    setBalMsg(bn ? 'ব্যালেন্স চেক করা হচ্ছে...' : 'Checking balance...');
    const { status, data } = await callSms({ action: 'balance' }, adminSecret);
    if (status === 401) return setBalMsg(bn ? '❌ অ্যাডমিন সিক্রেট ভুল।' : '❌ Wrong admin secret.');
    if (status === 503) return setBalMsg(bn ? '❌ Vercel-এ SMS_API_KEY সেট করা নেই।' : '❌ SMS_API_KEY not set on Vercel.');
    const b = parseFloat(data?.balance);
    if (isNaN(b)) return setBalMsg(`❌ ${data?.hint || JSON.stringify(data?.gateway ?? data)}`);
    setBalance(b);
    setBalMsg('');
  };

  const sendToCustomer = async () => {
    setSendMsg(bn ? 'পাঠানো হচ্ছে...' : 'Sending...');
    const { status, data } = await callSms({ action: 'send_text', phone: custPhone, message: custMsg }, adminSecret);
    if (status === 401) return setSendMsg(bn ? '❌ অ্যাডমিন সিক্রেট ভুল।' : '❌ Wrong admin secret.');
    setSendMsg(data?.ok ? (bn ? '✅ মেসেজ পাঠানো হয়েছে।' : '✅ Message sent.') : `❌ ${data?.hint || data?.error || JSON.stringify(data?.gateway ?? data)}`);
  };

  const recharged = parseFloat(totalRecharged);
  const rate = parseFloat(ratePerSms);
  const used = balance !== null && !isNaN(recharged) ? Math.max(recharged - balance, 0) : null;
  const smsUsed = used !== null && rate > 0 ? Math.round(used / rate) : null;
  const smsLeft = balance !== null && rate > 0 ? Math.floor(balance / rate) : null;

  const inputCls =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold';
  const btnCls =
    'px-4 py-2 bg-pink-700 text-white font-bold rounded-lg text-xs hover:bg-pink-800 cursor-pointer flex items-center gap-1 shrink-0';

  return (
    <div className="space-y-4 pt-2">
      {/* Admin secret */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
          🔐 {bn ? 'অ্যাডমিন সিক্রেট (Vercel-এর SMS_ADMIN_SECRET)' : 'Admin secret (Vercel SMS_ADMIN_SECRET)'}
        </label>
        <input type="password" value={adminSecret} onChange={e => saveSecret(e.target.value)} className={inputCls} />
      </div>

      {/* OTP message template */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
          ✉️ {bn ? 'ওটিপি মেসেজে কী লেখা থাকবে' : 'OTP message text'}
        </label>
        <textarea
          rows={2}
          value={template}
          onChange={e => setTemplate(e.target.value)}
          className={inputCls}
        />
        <p className="text-[10px] text-slate-500">
          {bn ? '{otp} লিখলে সেখানে ৬ ডিজিটের কোড বসবে। সর্বোচ্চ ৭০ অক্ষর।' : 'Use {otp} where the code goes. Max 70 chars.'}{' '}
          ({template.replace(/\{otp\}/gi, '123456').length}/70)
        </p>
        <button type="button" onClick={saveTemplate} className={btnCls}>
          <Save className="w-3.5 h-3.5" />
          <span>{bn ? 'মেসেজ সেভ করুন' : 'Save message'}</span>
        </button>
        {tplMsg && <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300">{tplMsg}</p>}
      </div>

      {/* Balance */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> {bn ? 'এসএমএস ব্যালেন্স' : 'SMS balance'}
          </label>
          <button type="button" onClick={checkBalance} className={btnCls}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{bn ? 'ব্যালেন্স দেখুন' : 'Check'}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-[10px] text-slate-500 mb-0.5">{bn ? 'মোট রিচার্জ (৳)' : 'Total recharged (৳)'}</span>
            <input
              type="number"
              value={totalRecharged}
              onChange={e => { setTotalRecharged(e.target.value); storage.setItem('marketbd_sms_total_recharged', e.target.value); }}
              className={inputCls}
            />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 mb-0.5">{bn ? 'প্রতি SMS রেট (৳)' : 'Rate per SMS (৳)'}</span>
            <input
              type="number"
              step="0.01"
              value={ratePerSms}
              onChange={e => { setRatePerSms(e.target.value); storage.setItem('marketbd_sms_rate', e.target.value); }}
              className={inputCls}
            />
          </div>
        </div>
        {balance !== null && (
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
              {bn ? 'অবশিষ্ট ব্যালেন্স' : 'Balance'}<br />৳ {balance.toFixed(2)}
              {smsLeft !== null && <><br /><span className="font-bold">≈ {smsLeft} SMS</span></>}
            </div>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
              {bn ? 'খরচ হয়েছে' : 'Spent'}<br />{used !== null ? `৳ ${used.toFixed(2)}` : '—'}
              {smsUsed !== null && <><br /><span className="font-bold">≈ {smsUsed} SMS</span></>}
            </div>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300">
              {bn ? 'মোট রিচার্জ' : 'Recharged'}<br />{!isNaN(recharged) ? `৳ ${recharged}` : '—'}
            </div>
          </div>
        )}
        {balMsg && <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300">{balMsg}</p>}
      </div>

      {/* Message to a customer */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
          📩 {bn ? 'গ্রাহককে মেসেজ পাঠান' : 'Send a message to a customer'}
        </label>
        <input
          type="text"
          value={custPhone}
          onChange={e => setCustPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
          className={inputCls}
        />
        <textarea
          rows={3}
          value={custMsg}
          onChange={e => setCustMsg(e.target.value)}
          placeholder={bn ? 'এখানে মেসেজ লিখুন...' : 'Type your message...'}
          className={inputCls}
        />
        <button type="button" onClick={sendToCustomer} className={btnCls}>
          <Send className="w-3.5 h-3.5" />
          <span>{bn ? 'মেসেজ পাঠান' : 'Send message'}</span>
        </button>
        {sendMsg && <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300">{sendMsg}</p>}
      </div>
    </div>
  );
};
