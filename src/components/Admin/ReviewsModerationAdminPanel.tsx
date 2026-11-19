import React, { useMemo, useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Star,
  ShieldAlert,
  CheckCircle,
  Trash2,
  User,
} from 'lucide-react';
import { storage } from '../../utils/storage';

type ReviewStatus = 'Approved' | 'Pending' | 'Flagged';

export const ReviewsModerationAdminPanel: React.FC = () => {
  const { language, sellerReviews, registeredUsers } = useMarket();

  const [statusMap, setStatusMap] = useState<Record<string, ReviewStatus>>(() => {
    try {
      const saved = storage.getItem('marketbd_review_moderation_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = storage.getItem('marketbd_deleted_review_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState<'All' | 'Approved' | 'Flagged' | 'Pending'>('All');

  const reviews = useMemo(() => {
    return sellerReviews
      .filter(r => !deletedIds.includes(r.id))
      .map(r => {
        const seller = registeredUsers.find(u => u.id === r.sellerId);
        return {
          id: r.id,
          sellerName: seller?.name || r.sellerId,
          reviewerName: r.reviewerName,
          rating: r.rating,
          comment: r.comment,
          status: statusMap[r.id] || 'Approved',
          date: r.date,
        };
      });
  }, [sellerReviews, registeredUsers, statusMap, deletedIds]);

  const updateReviewStatus = (id: string, newStatus: ReviewStatus) => {
    const next = { ...statusMap, [id]: newStatus };
    setStatusMap(next);
    storage.setItem('marketbd_review_moderation_map', JSON.stringify(next));
  };

  const deleteReview = (id: string) => {
    const next = [...deletedIds, id];
    setDeletedIds(next);
    storage.setItem('marketbd_deleted_review_ids', JSON.stringify(next));
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
              ? 'বিক্রেতাদের প্রতি কাস্টমারদের আসল রিভিউ নিরীক্ষা করুন এবং স্প্যাম/আপত্তিকর মন্তব্য মডারেট করুন।'
              : 'Approve, moderate, or remove real buyer feedback and star ratings.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-2xl border border-amber-500/30 text-xs font-bold text-amber-300">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>Flagged Reviews: {reviews.filter(r => r.status === 'Flagged').length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap">
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
      {filtered.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">
            {language === 'bn' ? 'এখনো কোনো কাস্টমার রিভিউ পাওয়া যায়নি' : 'No seller reviews submitted yet'}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'bn'
              ? 'ক্রেতারা বিক্রেতার প্রোফাইলে রিভিউ দিলে তা এখানে মডারেশনের জন্য দেখাবে।'
              : 'Real customer reviews will appear here once submitted.'}
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
