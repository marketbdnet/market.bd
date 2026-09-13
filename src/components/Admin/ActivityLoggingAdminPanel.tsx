import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { AdminActivityLog, AdminActionType } from '../../types';
import {
  Activity,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Power,
  Users,
  Settings,
  Lock,
  Clock,
  Laptop,
  Globe,
  Database,
  ArrowUpDown,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ActivityLoggingAdminPanel: React.FC = () => {
  const {
    language,
    adminActivityLogs,
    activityLogs,
    refreshAdminLogsFromCloud,
    clearAdminLogs,
    logAdminAction
  } = useMarket();

  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'user'>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<'all' | AdminActionType>('all');
  const [userActionFilter, setUserActionFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Filter Admin Activity Logs
  const filteredAdminLogs = useMemo(() => {
    return (adminActivityLogs || []).filter(log => {
      if (!log) return false;

      // Filter by Action Type
      if (actionTypeFilter !== 'all' && log.actionType !== actionTypeFilter) {
        return false;
      }

      // Filter by Time Range
      if (timeFilter !== 'all') {
        const logDate = new Date(log.createdAt || log.timestamp).getTime();
        const now = Date.now();
        if (timeFilter === 'today' && now - logDate > 24 * 3600 * 1000) return false;
        if (timeFilter === 'week' && now - logDate > 7 * 24 * 3600 * 1000) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAdmin = (log.adminName || '').toLowerCase().includes(q) || (log.adminEmail || '').toLowerCase().includes(q);
        const matchAction = (log.action || '').toLowerCase().includes(q);
        const matchTarget = (log.targetTitle || log.targetId || '').toLowerCase().includes(q);
        const matchDetails = (log.details || '').toLowerCase().includes(q);
        const matchIp = (log.ip || '').toLowerCase().includes(q);

        return matchAdmin || matchAction || matchTarget || matchDetails || matchIp;
      }

      return true;
    });
  }, [adminActivityLogs, actionTypeFilter, timeFilter, searchQuery]);

  // Filter User Activity Logs
  const filteredUserLogs = useMemo(() => {
    return (activityLogs || []).filter(log => {
      if (!log) return false;
      if (userActionFilter !== 'all' && log.action !== userActionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = (log.user || log.userName || '').toLowerCase().includes(q);
        const matchTarget = (log.target || log.adTitle || '').toLowerCase().includes(q);
        const matchAction = (log.action || '').toLowerCase().includes(q);
        return matchUser || matchTarget || matchAction;
      }
      return true;
    });
  }, [activityLogs, userActionFilter, searchQuery]);

  // Statistics
  const totalAdminLogs = adminActivityLogs.length;
  const adModerationCount = adminActivityLogs.filter(l => l.actionType === 'ad_moderation').length;
  const siteMaintenanceCount = adminActivityLogs.filter(l => l.actionType === 'site_maintenance').length;
  const userManagementCount = adminActivityLogs.filter(l => l.actionType === 'user_management').length;
  const securityCount = adminActivityLogs.filter(l => l.actionType === 'security' || l.actionType === 'system_settings').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAdminLogsFromCloud();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLogId(id);
      setTimeout(() => setCopiedLogId(null), 2000);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Action Type', 'Target', 'Details', 'IP Address', 'Device'];
    const rows = filteredAdminLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${(l.adminName || '').replace(/"/g, '""')}"`,
      `"${(l.adminEmail || '').replace(/"/g, '""')}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      l.actionType,
      `"${(l.targetTitle || l.targetId || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ip || 'N/A',
      `"${(l.device || 'N/A').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marketbd_admin_activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAdminLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `marketbd_admin_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Quick Action Type Badge Helper
  const getActionBadge = (type: AdminActionType, action: string) => {
    switch (type) {
      case 'ad_moderation':
        if (action.toLowerCase().includes('delete')) {
          return {
            bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            icon: <Trash2 className="w-3.5 h-3.5 shrink-0" />
          };
        }
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        };
      case 'site_maintenance':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: <Power className="w-3.5 h-3.5 shrink-0" />
        };
      case 'user_management':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: <Users className="w-3.5 h-3.5 shrink-0" />
        };
      case 'security':
        return {
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: <Lock className="w-3.5 h-3.5 shrink-0" />
        };
      case 'system_settings':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: <Settings className="w-3.5 h-3.5 shrink-0" />
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'bn' ? 'এডমিন অ্যাক্টিভিটি ও অডিট লগ সিস্টেম' : 'Admin Activity & Audit Logging'}</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Firestore Synced
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'বিজ্ঞাপন ডিলিট, সাইট স্ট্যাটাস ও মেইনটেন্যান্স পরিবর্তন, ইউজার রোল আপডেট সহ সকল এডমিন অ্যাকশনের রিয়েল-টাইম ক্লাউড স্টোরেজ অডিট লগ।'
                    : 'Real-time Firestore-backed audit trail tracking ad deletions, site status updates, user role changes, and administrative actions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setActiveSubTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeSubTab === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>{language === 'bn' ? 'এডমিন অডিট লগ' : 'Admin Audit Trail'}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {totalAdminLogs}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('user')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeSubTab === 'user'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-rose-500" />
              <span>{language === 'bn' ? 'ইউজার অ্যাক্টিভিটি' : 'User Activity Feed'}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {activityLogs.length}
              </span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        {activeSubTab === 'admin' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                {language === 'bn' ? 'মোট এডমিন অ্যাকশন' : 'Total Admin Actions'}
              </span>
              <span className="text-xl font-extrabold text-indigo-950 dark:text-indigo-200 mt-0.5 block">
                {totalAdminLogs}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                {language === 'bn' ? 'বিজ্ঞাপন ডিলিট ও মডারেশন' : 'Ad Deletions & Moderation'}
              </span>
              <span className="text-xl font-extrabold text-rose-950 dark:text-rose-200 mt-0.5 block">
                {adModerationCount}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                {language === 'bn' ? 'সাইট স্ট্যাটাস ও রক্ষণাবেক্ষণ' : 'Site Status & Maintenance'}
              </span>
              <span className="text-xl font-extrabold text-amber-950 dark:text-amber-200 mt-0.5 block">
                {siteMaintenanceCount}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
                {language === 'bn' ? 'ইউজার রোল ও এক্সেস' : 'User Roles & Permissions'}
              </span>
              <span className="text-xl font-extrabold text-blue-950 dark:text-blue-200 mt-0.5 block">
                {userManagementCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Admin Audit Logs View */}
      {activeSubTab === 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          {/* Action Filter & Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'এডমিন, অ্যাকশন, বিজ্ঞাপন বা বিস্তারিত দিয়ে খুঁজুন...' : 'Search admin, action, target or details...'}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Action Buttons: Refresh, CSV, JSON */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                title="Refresh logs from Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Export as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Export as JSON"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Action Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', labelBn: 'সকল কর্মকাণ্ড (All)', labelEn: 'All Actions' },
              { id: 'ad_moderation', labelBn: '🗑️ বিজ্ঞাপন ডিলিট ও অনুমোদন', labelEn: 'Ad Moderation' },
              { id: 'site_maintenance', labelBn: '⚙️ সাইট স্ট্যাটাস ও রক্ষণাবেক্ষণ', labelEn: 'Site Status' },
              { id: 'user_management', labelBn: '👥 ইউজার রোল ও এক্সেস', labelEn: 'User & Roles' },
              { id: 'security', labelBn: '🔒 সিকিউরিটি ও লকডাউন', labelEn: 'Security & PIN' },
              { id: 'system_settings', labelBn: '🛠️ সিস্টেম সেটিংস', labelEn: 'System Config' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActionTypeFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                  actionTypeFilter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'bn' ? f.labelBn : f.labelEn}
              </button>
            ))}
          </div>

          {/* Logs Feed */}
          {filteredAdminLogs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
              <Database className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">
                {language === 'bn' ? 'কোনো অডিট লগ পাওয়া যায়নি' : 'No matching admin audit logs found'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'ফিল্টার পরিবর্তন করে অথবা সার্চ কুয়েরি পরিষ্কার করে পুনরায় চেষ্টা করুন।'
                  : 'Try clearing your search query or switching filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAdminLogs.map(log => {
                const badge = getActionBadge(log.actionType, log.action);
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 transition space-y-2.5"
                  >
                    {/* Top Row: Action, Admin, Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Action Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border ${badge.bg}`}>
                          {badge.icon}
                          <span>{log.action}</span>
                        </span>

                        {/* Target preview if any */}
                        {log.targetTitle && (
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <span className="text-slate-400 font-normal">→</span>
                            <span className="truncate max-w-[220px] sm:max-w-xs">{log.targetTitle}</span>
                            {log.targetId && (
                              <button
                                onClick={() => handleCopy(log.targetId!, log.id + '-tgt')}
                                className="text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 ml-1 cursor-pointer"
                                title="Copy Target ID"
                              >
                                #{log.targetId}
                                {copiedLogId === log.id + '-tgt' && <Check className="w-2.5 h-2.5 inline ml-0.5 text-emerald-500" />}
                              </button>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Timestamp & IP */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                        <span className="font-mono flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {log.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Explanatory Details */}
                    {log.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1 border-l-2 border-slate-300 dark:border-slate-700 ml-0.5">
                        {log.details}
                      </p>
                    )}

                    {/* Bottom Metadata: Admin Details, Device, Firestore Doc ID */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <strong>{log.adminName}</strong>
                          <span className="text-slate-400 text-[10px]">({log.adminEmail})</span>
                        </span>
                        {log.device && (
                          <span className="flex items-center gap-1">
                            <Laptop className="w-3 h-3 text-slate-400" />
                            {log.device}
                          </span>
                        )}
                        {log.ip && (
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Globe className="w-3 h-3 text-slate-400" />
                            IP: {log.ip}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {log.id}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* User Activity Feed View */}
      {activeSubTab === 'user' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <span>{language === 'bn' ? 'ইউজারদের লাইভ অ্যাক্টিভিটি স্ট্রিম' : 'Live User Activities'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'ইউজাররা সাইটে কোন পণ্যে ভিউ করেছেন, কার সাথে চ্যাট শুরু করেছেন বা কার নম্বর দেখছেন তার রিয়েল-টাইম লগ'
                  : 'Real-time record of ad views, phone reveals, chats, and user actions.'}
              </p>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
              {activityLogs.length} {language === 'bn' ? 'টি অ্যাকশন রেকর্ড করা হয়েছে' : 'Events Logged'}
            </span>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'ইউজার বা পণ্যের নাম দিয়ে খুঁজুন...' : 'Search user or target item...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', labelBn: 'সব কর্মকাণ্ড', labelEn: 'All Actions' },
                { id: 'Viewed Ad', labelBn: 'ভিউড এডস', labelEn: 'Viewed Ad' },
                { id: 'Revealed Phone', labelBn: 'ফোন নম্বর দেখা', labelEn: 'Revealed Phone' },
                { id: 'Started Chat', labelBn: 'চ্যাট শুরু', labelEn: 'Started Chat' },
                { id: 'Reported Ad', labelBn: 'রিপোর্ট করেছে', labelEn: 'Reported Ad' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setUserActionFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    userActionFilter === f.id
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {language === 'bn' ? f.labelBn : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredUserLogs.map(log => {
              const userDisplay = log.user || log.userName || 'Admin';
              const targetDisplay = log.target || log.adTitle || 'N/A';
              return (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-black flex items-center justify-center shrink-0 text-sm">
                      {userDisplay.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{userDisplay}</span>
                      <span className="text-slate-500 dark:text-slate-400 mx-1.5">•</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-md border border-emerald-200/50 dark:border-emerald-900/50">
                        {log.action || 'Action'}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 font-semibold mt-1">
                        {language === 'bn' ? 'টার্গেট আইটেম:' : 'Target Item:'} <strong className="text-slate-900 dark:text-slate-100">{targetDisplay}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {log.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
