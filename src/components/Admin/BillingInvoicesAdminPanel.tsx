import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  FileText,
  RotateCcw,
  CreditCard
} from 'lucide-react';

interface TransactionRecord {
  id: string;
  trxId: string;
  userPhone: string;
  adTitle: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Rocket' | 'SSLCOMMERZ' | 'Bank Transfer';
  purpose: 'Standard Boost (299 BDT)' | 'Featured Top Ad (599 BDT)' | 'Pro Sales Campaign (1200 BDT)' | 'Business Shop Membership';
  status: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
  date: string;
}

export const BillingInvoicesAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx-1',
      trxId: 'BKSH-99201938',
      userPhone: '01723230230',
      adTitle: 'iPhone 15 Pro Max 256GB Natural Titanium',
      amount: 299,
      method: 'bKash',
      purpose: 'Standard Boost (299 BDT)',
      status: 'Completed',
      date: '2026-08-11 14:20'
    },
    {
      id: 'tx-2',
      trxId: 'NGD-88192031',
      userPhone: '01819876543',
      adTitle: 'Toyota Premio F Superior 2018 Model',
      amount: 599,
      method: 'Nagad',
      purpose: 'Featured Top Ad (599 BDT)',
      status: 'Completed',
      date: '2026-08-11 11:05'
    },
    {
      id: 'tx-3',
      trxId: 'RCK-10293847',
      userPhone: '01533830784',
      adTitle: '3 BHK Modern Apartment Sale in Dhanmondi',
      amount: 1200,
      method: 'Rocket',
      purpose: 'Pro Sales Campaign (1200 BDT)',
      status: 'Pending',
      date: '2026-08-10 18:45'
    },
    {
      id: 'tx-4',
      trxId: 'SSL-44210392',
      userPhone: '01912345678',
      adTitle: 'Dell XPS 15 9530 Core i9 32GB RAM',
      amount: 299,
      method: 'SSLCOMMERZ',
      status: 'Failed',
      purpose: 'Standard Boost (299 BDT)',
      date: '2026-08-09 20:10'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTxForInvoice, setSelectedTxForInvoice] = useState<TransactionRecord | null>(null);

  const totalRevenue = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleRefund = (txId: string) => {
    if (confirm(language === 'bn' ? 'এই ট্রানজেকশনটির রিফান্ড সম্পন্ন করতে চান?' : 'Confirm refund for this transaction?')) {
      setTransactions(prev =>
        prev.map(t => (t.id === txId ? { ...t, status: 'Refunded' } : t))
      );
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userPhone.includes(searchTerm) ||
      t.adTitle.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Financial Control
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '💰 পেমেন্ট হিস্ট্রি, ইনভয়েস ও রিফান্ড ম্যানেজমেন্ট' : '💰 Billing, Invoices & Refund Analytics'}
            </h2>
          </div>
          <p className="text-xs text-emerald-200 max-w-xl">
            {language === 'bn'
              ? 'ওয়েবসাইটের মোট আয় (Total Revenue), বিকাশ/নগদ পেমেন্ট ট্রানজেকশন, ইনভয়েস ও রিফান্ড স্টেটমেন্ট নিয়ন্ত্রণ করুন।'
              : 'Audit revenue history, verify transaction IDs, issue refunds, and generate PDF invoices.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-5 py-3 rounded-2xl border border-emerald-500/30 text-emerald-300">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</div>
            <div className="text-lg font-black font-mono">৳{totalRevenue.toLocaleString()} BDT</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="search"
            name="admin_billing_search_filter"
            id="admin-billing-search-filter"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            inputMode="search"
            data-lpignore="true"
            data-form-type="other"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'TrxID বা ফোন নম্বর খুঁজুন...' : 'Search TrxID or phone...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'completed', 'pending', 'refunded', 'failed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">{language === 'bn' ? 'ট্রানজেকশন আইডি & তারিখ' : 'TrxID & Date'}</th>
                <th className="p-4">{language === 'bn' ? 'ইউজার ফোন & উদ্দেশ্য' : 'User & Purpose'}</th>
                <th className="p-4">{language === 'bn' ? 'মেথড & পরিমাণ' : 'Method & Amount'}</th>
                <th className="p-4 text-center">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-4 text-right">{language === 'bn' ? 'ইনভয়েস / একশন' : 'Invoice / Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="space-y-0.5">
                      <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {tx.trxId}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.date}</div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <div className="font-mono text-slate-900 dark:text-white font-bold">{tx.userPhone}</div>
                      <div className="text-[11px] text-slate-500 font-medium line-clamp-1">{tx.purpose}</div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[11px]">
                        {tx.method}
                      </span>
                      <div className="font-mono text-sm font-black text-slate-900 dark:text-white">
                        ৳{tx.amount} BDT
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${
                        tx.status === 'Completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : tx.status === 'Pending'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : tx.status === 'Refunded'
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      }`}
                    >
                      <span>{tx.status}</span>
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTxForInvoice(tx)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Invoice</span>
                      </button>

                      {tx.status === 'Completed' && (
                        <button
                          type="button"
                          onClick={() => handleRefund(tx.id)}
                          className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 hover:bg-sky-100 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedTxForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Official Invoice</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Invoice #{selectedTxForInvoice.trxId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Platform:</span>
                <span>MarketBD Classifieds Ltd.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Phone:</span>
                <span className="font-mono">{selectedTxForInvoice.userPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Plan:</span>
                <span>{selectedTxForInvoice.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span>{selectedTxForInvoice.method}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-black">
                <span>Total Paid Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  ৳{selectedTxForInvoice.amount} BDT
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(language === 'bn' ? 'ইনভয়েস পিডিএফ ডাউনলোড শুরু হয়েছে!' : 'Invoice PDF downloading...');
                setSelectedTxForInvoice(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
