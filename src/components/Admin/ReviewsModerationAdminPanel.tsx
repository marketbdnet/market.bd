import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Star,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  User,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface SellerReview {
  id: string;
  sellerName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  status: 'Approved' | 'Pending' | 'Flagged';
  date: string;
  flagReason?: string;
}

export const ReviewsModerationAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [reviews, setReviews] = useState<SellerReview[]>([
    {
      id: 'rev-1',
      sellerName: 'M/S Dhaka Electronics',
      reviewerName: 'Jahir Raihan',
      rating: 5,
      comment: 'Very honest seller! Delivered original iPhone 15 Pro with authentic warranty card.',
      status: 'Approved',
      date: '2025-03-20'
    },
    {
      id: 'rev-2',
      sellerName: 'Bikrampur Furniture Mart',
      reviewerName: 'Anonymous User',
      rating: 1,
      comment: 'Scammer! Product condition was totally broken upon delivery.',
      status: 'Flagged',
      flagReason: 'Reported by seller for abusive language without proof.',
      date: '2025-03-24'
    },
    {
      id: 'rev-3',
      sellerName: 'Chittagong Auto Garage',
      reviewerName: 'Rashed Khan',
      rating: 4,
      comment: 'Good communication, car condition matched description.',
      status: 'Pending',
      date: '2025-03-28'
    }
  ]);

  const [filter, setFilter] = useState<'All' | 'Approved' | 'Flagged' | 'Pending'>('All');

  const updateReviewStatus = (id: string, newStatus: SellerReview['status']) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r => filter === 'All' || r.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-amber-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Rating Integrity
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '⭐ সেলার রিভিউ, রেটিং ও মডারেশন প্যানেল' : '⭐ Seller Reviews & Rating Moderation'}
            </h2>
          </div>
          <p className="text-xs text-amber-200 max-w-xl">
            {language === 'bn'
              ? 'বিক্রেতাদের প্রতি কাস্টমারদের রিভিউ নিরীক্ষা করুন, স্প্যাম/আপত্তিকর মন্তব্য মডারেট করুন।'
              : 'Approve, moderate, or remove reported user feedback and star ratings.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-2xl border border-amber-500/30 text-xs font-bold text-amber-300">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>Flagged Reviews: {reviews.filter(r => r.status === 'Flagged').length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        {(['All', 'Approved', 'Flagged', 'Pending'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition ${
              filter === tab
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} ({reviews.filter(r => tab === 'All' || r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-3">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl text-amber-800 dark:text-amber-200 font-mono text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{rev.rating}.0 / 5</span>
                </div>

                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Seller: <span className="text-blue-600 dark:text-blue-400">{rev.sellerName}</span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">• {rev.date}</span>
              </div>

              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                "{rev.comment}"
              </p>

              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Reviewed by: {rev.reviewerName}</span>
                {rev.flagReason && (
                  <span className="text-red-500 font-bold ml-2">⚠️ {rev.flagReason}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {rev.status !== 'Approved' && (
                <button
                  type="button"
                  onClick={() => updateReviewStatus(rev.id, 'Approved')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              )}

              {rev.status !== 'Flagged' && (
                <button
                  type="button"
                  onClick={() => updateReviewStatus(rev.id, 'Flagged')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Flag</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => deleteReview(rev.id)}
                className="px-3 py-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
