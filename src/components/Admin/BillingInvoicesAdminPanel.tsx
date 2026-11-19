import React, { useEffect, useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { fetchAllPayments, verifyPayment } from '../../services/paymentService';
import {
  DollarSign,
  Download,
  Search,
  FileText,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface TransactionRecord {
  id: string;
  trxId: string;
  userPhone: string;
  customerName: string;
  adTitle: string;
  amount: number;
  method: string;
  purpose: string;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
  date: string;
  source: 'manual_payment' | 'ad_boost';
}

export const BillingInvoicesAdminPanel: React.FC = () => {
  const { language, products, currentUser } = useMarket();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTxForInvoice, setSelectedTxForInvoice] = useState<TransactionRecord | null>(null);
  const [statusFeedback, setStatusFeedback] = useState('');

  const loadRealTransactions = async () => {
    setLoading(true);
    try {
      const payments = await fetchAllPayments();
      const paymentRows: TransactionRecord[] = payments.map(p => ({
        id: p.paymentId,
        trxId: p.transactionId,
        userPhone: p.senderMobileNumber || p.customerMobile,
        customerName: p.customerName || 'Customer',
        adTitle: p.orderId,
        amount: Number(p.submittedAmount) || 0,
        method: p.paymentMethod,
        purpose: `Order ${p.orderId} (${p.paymentMethod})`,
        status:
          p.status === 'paid'
            ? 'Completed'
            : p.status === 'rejected'
            ? 'Failed'
            : 'Pending',
        date: new Date(p.createdAt).toLocaleString(),
        source: 'manual_payment',
      }));

      const boostedAdRows: TransactionRecord[] = products
        .filter(
          p =>
            (p.adType !== 'regular' || p.isFeatured || p.isUrgent || Boolean(p.paymentInfo?.amount)) &&
            !paymentRows.some(r => r.adTitle === p.id)
        )
        .map(p => ({
          id: `boost-${p.id}`,
          trxId: p.paymentInfo?.trxId || `BOOST-${p.id.slice(-8).toUpperCase()}`,
          userPhone: p.paymentInfo?.senderNumber || p.seller?.phone || 'N/A',
          customerName: p.seller?.name || 'Seller',
          adTitle: p.title,
          amount:
            Number(p.paymentInfo?.amount) ||
            (p.adType === 'featured' ? 599 : p.adType === 'top_ad' ? 299 : p.adType === 'urgent' ? 199 : 0),
          method: p.paymentInfo?.method || 'bKash',
          purpose:
            p.adType === 'featured'
              ? 'Featured Ad'
              : p.adType === 'top_ad'
              ? 'Top Ad Boost'
              : p.adType === 'urgent'
              ? 'Urgent Ad'
              : 'Ad Boost',
          status: 'Completed',
          date: p.postedAt ? new Date(p.postedAt).toLocaleString() : new Date().toLocaleString(),
          source: 'ad_boost',
        }));

      setTransactions([...paymentRows, ...boostedAdRows]);
    } catch (err) {
      console.error('Failed to load real billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealTransactions();
  }, [products.length]);

  const totalRevenue = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleMarkRefunded = async (tx: TransactionRecord) => {
    if (tx.source === 'manual_payment') {
      const adminEmail = currentUser?.email || 'official.marketbd@gmail.com';
      await verifyPayment(adminEmail, tx.id, 'reject', 'Refunded by Admin').catch(() => {});
    }
    setTransactions(prev =>
      prev.map(t => (t.id === tx.id ? { ...t, status: 'Refunded' } : t))
    );
    setStatusFeedback(
      language === 'bn'
        ? `✓ ${tx.trxId} রিফান্ড হিসেবে চিহ্নিত হয়েছে।`
        : `✓ ${tx.trxId} marked as refunded.`
    );
    setTimeout(() => setStatusFeedback(''), 3500);
  };

  const handleDownloadInvoice = (tx: TransactionRecord) => {
    const content = [
      '====================================',
      'MarketBD.Net - Official Invoice Receipt',
      '====================================',
      `Invoice / TrxID : ${tx.trxId}`,
      `Date            : ${tx.date}`,
      `Customer        : ${tx.customerName}`,
      `Phone           : ${tx.userPhone}`,
      `Service / Order : ${tx.purpose}`,
      `Payment Method  : ${tx.method}`,
      `Amount Paid     : BDT ${tx.amount}`,
      `Status          : ${tx.status}`,
      '====================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketBD-Invoice-${tx.trxId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSelectedTxForInvoice(null);
  };

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userPhone.includes(searchTerm) ||
      t.adTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase());
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
              ? 'আসল পেমেন্ট ভেরিফিকেশন ও বিজ্ঞাপন বুস্টিং থেকে মোট আয়, ইনভয়েস ডাউনলোড ও রিফান্ড পরিচালনা করুন।'
              : 'Audit real payment records, download official invoices, and manage refunds.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRealTransactions}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-emerald-200 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-black/40 px-5 py-3 rounded-2xl border border-emerald-500/30 text-emerald-300">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Real Revenue</div>
              <div className="text-lg font-black font-mono">৳{totalRevenue.toLocaleString()} BDT</div>
            </div>
          </div>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold">
          {statusFeedback}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="search"
            name="admin_billing_search_filter"
            id="admin-billing-search-filter"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'TrxID বা ফোন নম্বর খুঁজুন...' : 'Search TrxID or phone...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
        {loading ? (
          <div className="p-10 text-center text-xs font-bold text-slate-500">
            {language === 'bn' ? 'লেনদেনের তথ্য লোড হচ্ছে...' : 'Loading billing records...'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-1.5">
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
              {language === 'bn' ? 'এখনো কোনো পেমেন্ট বা বুস্ট লেনদেন পাওয়া যায়নি' : 'No billing or payment transactions yet'}
            </p>
            <p className="text-xs">
              {language === 'bn'
                ? 'গ্রাহক পেমেন্ট বা বিজ্ঞাপন বুস্ট করলে আসল হিসাব এখানে প্রদর্শিত হবে।'
                : 'Real payment submissions and ad boosts will appear here automatically.'}
            </p>
          </div>
        ) : (
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
                            onClick={() => handleMarkRefunded(tx)}
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
        )}
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
                <span>MarketBD.Net</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer:</span>
                <span>{selectedTxForInvoice.customerName} ({selectedTxForInvoice.userPhone})</span>
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
              onClick={() => handleDownloadInvoice(selectedTxForInvoice)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'রসিদ ডাউনলোড করুন' : 'Download Receipt'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
