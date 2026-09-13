import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Users,
  Shield,
  KeyRound,
  UserPlus,
  Trash2,
  Check,
  X,
  Lock,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle2,
  Eye,
  Sliders,
  Smartphone
} from 'lucide-react';
import {
  AdminRole,
  AdminPermission,
  StaffAdminAccount
} from '../../types/adminAuth';
import {
  ALL_ADMIN_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_DEFAULT_PERMISSIONS,
  INITIAL_STAFF_ACCOUNTS,
  hasPermission
} from '../../services/adminRbacService';
import { SensitiveActionModal } from './SensitiveActionModal';

export const StaffRolesAdminPanel: React.FC = () => {
  const { language, currentUser, logAdminAction } = useMarket();

  const [staffList, setStaffList] = useState<StaffAdminAccount[]>(() => {
    try {
      const saved = localStorage.getItem('marketbd_enterprise_staff_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_STAFF_ACCOUNTS;
  });

  const [activeView, setActiveView] = useState<'accounts' | 'matrix' | 'policy'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAdminAccount | null>(null);

  // Form fields for Add/Edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: AdminRole;
    mfaEnabled: boolean;
    customPermissions: AdminPermission[];
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'Marketplace Admin',
    mfaEnabled: false,
    customPermissions: []
  });

  // Sensitive Action Modal state
  const [sensitiveAction, setSensitiveAction] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'delete' | 'role_change' | 'create';
    staffId?: string;
    targetDisplay?: string;
    detailsDisplay?: string;
    payload?: any;
  }>({
    isOpen: false,
    type: 'suspend'
  });

  // Save to local storage and sync to server
  useEffect(() => {
    try {
      localStorage.setItem('marketbd_enterprise_staff_accounts', JSON.stringify(staffList));
      fetch('/api/sync/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminStaffAccounts: staffList })
      }).catch(() => {});
    } catch (e) {}
  }, [staffList]);

  // Load from backend if available
  useEffect(() => {
    fetch('/api/admin/staff')
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setStaffList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Marketplace Admin',
      mfaEnabled: false,
      customPermissions: []
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (staff: StaffAdminAccount) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      mfaEnabled: staff.mfaEnabled,
      customPermissions: staff.customPermissions || []
    });
  };

  // Submit Add Staff - triggers 2FA Sensitive Action Modal
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Check duplicate email
    if (staffList.some(s => s.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      alert(language === 'bn' ? 'এই ইমেইল দিয়ে ইতোমধ্যে একজন স্টাফ রয়েছে।' : 'A staff member with this email already exists.');
      return;
    }

    setSensitiveAction({
      isOpen: true,
      type: 'create',
      targetDisplay: formData.email,
      detailsDisplay: `${formData.name} (${formData.role})`,
      payload: { ...formData }
    });
  };

  // Submit Edit Staff
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSensitiveAction({
      isOpen: true,
      type: 'role_change',
      staffId: editingStaff.id,
      targetDisplay: editingStaff.email,
      detailsDisplay: `Role: ${editingStaff.role} ➔ ${formData.role}`,
      payload: { ...formData }
    });
  };

  // Execute confirmed sensitive action
  const handleConfirmSensitiveAction = (adminNote?: string) => {
    const action = sensitiveAction.type;

    if (action === 'create' && sensitiveAction.payload) {
      const data = sensitiveAction.payload;
      const newStaff: StaffAdminAccount = {
        id: 'staff-' + Date.now(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim() || '+8801700000000',
        role: data.role,
        customPermissions: data.customPermissions,
        status: 'Active',
        mfaEnabled: data.mfaEnabled,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.email || 'official.marketbd@gmail.com'
      };

      setStaffList(prev => [...prev, newStaff]);
      setShowAddModal(false);

      logAdminAction({
        action: `Created Staff Account: ${newStaff.name} (${newStaff.role})`,
        actionType: 'security',
        targetId: newStaff.id,
        targetTitle: newStaff.email,
        details: adminNote || 'New staff created with 2FA authorization'
      });

      showToast(language === 'bn' ? '✓ নতুন স্টাফ একাউন্ট সফলভাবে তৈরি হয়েছে!' : '✓ Staff account created successfully!');
    } else if (action === 'role_change' && sensitiveAction.staffId && sensitiveAction.payload) {
      const id = sensitiveAction.staffId;
      const data = sensitiveAction.payload;

      setStaffList(prev =>
        prev.map(s =>
          s.id === id
            ? {
                ...s,
                name: data.name,
                phone: data.phone,
                role: data.role,
                mfaEnabled: data.mfaEnabled,
                customPermissions: data.customPermissions
              }
            : s
        )
      );
      setEditingStaff(null);

      logAdminAction({
        action: `Updated Staff Role/Permissions for: ${data.email} (${data.role})`,
        actionType: 'security',
        targetId: id,
        targetTitle: data.email,
        details: adminNote || 'Role and permissions modified with 2FA'
      });

      showToast(language === 'bn' ? '✓ স্টাফ রোল ও পারমিশন আপডেট হয়েছে!' : '✓ Staff role and permissions updated!');
    } else if (action === 'suspend' && sensitiveAction.staffId) {
      const id = sensitiveAction.staffId;
      const target = staffList.find(s => s.id === id);
      if (!target) return;

      const newStatus = target.status === 'Active' ? 'Suspended' : 'Active';
      setStaffList(prev =>
        prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
      );

      logAdminAction({
        action: `${newStatus === 'Suspended' ? 'Suspended' : 'Activated'} Staff Account: ${target.email}`,
        actionType: 'security',
        targetId: id,
        targetTitle: target.name,
        details: adminNote || 'Status toggled with 2FA verification'
      });

      showToast(language === 'bn' ? `✓ স্টাফ অ্যাকাউন্ট ${newStatus === 'Suspended' ? 'সাসপেন্ড' : 'সক্রিয়'} করা হয়েছে!` : `✓ Staff account status updated to ${newStatus}!`);
    } else if (action === 'delete' && sensitiveAction.staffId) {
      const id = sensitiveAction.staffId;
      const target = staffList.find(s => s.id === id);
      if (!target) return;

      setStaffList(prev => prev.filter(s => s.id !== id));

      logAdminAction({
        action: `Removed Staff Account: ${target.email} (${target.role})`,
        actionType: 'security',
        targetId: id,
        targetTitle: target.name,
        details: adminNote || 'Staff account permanently deleted'
      });

      showToast(language === 'bn' ? '✓ স্টাফ একাউন্ট অপসরণ করা হয়েছে!' : '✓ Staff account removed!');
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Enterprise RBAC & Access Control
            </span>
            <span className="bg-emerald-600/90 text-white text-[9px] font-mono px-2 py-0.5 rounded-full">
              9 Specialized Roles
            </span>
          </div>
          <h2 className="text-xl font-black">
            {language === 'bn' ? '👥 এডমিন স্টাফ রোলস, গ্র্যানুলার পারমিশন ও এক্সেস কন্ট্রোল' : '👥 Staff Roles, Granular Permissions & RBAC Governance'}
          </h2>
          <p className="text-xs text-indigo-200 max-w-2xl">
            {language === 'bn'
              ? 'কঠোর "Deny by Default" নীতিতে চালিত ৯টি বিশেষায়িত রোল ও ৩৬টি সুনির্দিষ্ট পারমিশন। সংবেদনশীল কার্যকলাপে বাধ্যতামূলক ২FA কোড।'
              : 'Strict "Deny by Default" security model across 9 specialized roles and 36 granular permissions. Sensitive changes enforce 2FA verification.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন স্টাফ যুক্ত করুন' : 'Add Staff Member'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub navigation view selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveView('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeView === 'accounts'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'bn' ? 'স্টাফ অ্যাকাউন্ট তালিকা' : 'Staff Accounts'} ({staffList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeView === 'matrix'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === 'bn' ? '৯টি রোলের পারমিশন মেট্রিক্স' : '9-Role Permissions Matrix'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('policy')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
            activeView === 'policy'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{language === 'bn' ? 'Deny by Default নীতিমালা' : 'Deny-by-Default Policy'}</span>
        </button>
      </div>

      {/* VIEW 1: Staff Accounts Table */}
      {activeView === 'accounts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'নাম, ইমেইল বা ফোন দিয়ে খুঁজুন...' : 'Search name, email or phone...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs text-slate-500 font-bold shrink-0">{language === 'bn' ? 'রোল:' : 'Role:'}</label>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="all">{language === 'bn' ? 'সকল রোল (All)' : 'All Roles'}</option>
                {ALL_ADMIN_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">{language === 'bn' ? 'স্টাফ ও পরিচিতি' : 'Staff Member & Identity'}</th>
                    <th className="p-4">{language === 'bn' ? 'নির্ধারিত রোল' : 'Designated Role'}</th>
                    <th className="p-4 text-center">{language === 'bn' ? '২FA স্ট্যাটাস' : '2FA Status'}</th>
                    <th className="p-4 text-center">{language === 'bn' ? 'অ্যাকাউন্ট অবস্থা' : 'Status'}</th>
                    <th className="p-4 text-center">{language === 'bn' ? 'সর্বশেষ লগইন' : 'Last Login'}</th>
                    <th className="p-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  {filteredStaff.map(st => {
                    const isSuper = st.role === 'Super Admin';
                    const permCount = ROLE_DEFAULT_PERMISSIONS[st.role]?.length || 0;
                    const customCount = st.customPermissions?.length || 0;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                              isSuper
                                ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300'
                                : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300'
                            }`}>
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{st.name}</span>
                                {isSuper && (
                                  <span className="text-[9px] px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-black uppercase tracking-wider">
                                    MASTER ROOT
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {st.email} • {st.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div>
                            <span className={`px-2.5 py-1 rounded-xl font-black text-[11px] inline-block ${
                              isSuper
                                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {st.role}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {permCount} permissions {customCount > 0 && `(+${customCount} custom)`}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          {st.mfaEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>2FA Enabled</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              <span>Standard</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-black rounded-full ${
                            st.status === 'Active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          }`}>
                            {st.status}
                          </span>
                        </td>

                        <td className="p-4 text-center font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {st.lastLogin ? new Date(st.lastLogin).toLocaleDateString() : 'Never'}
                          {st.lastLoginIp && <div className="text-[9px] text-slate-400">{st.lastLoginIp}</div>}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(st)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                              title="Edit Role & Permissions"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {!isSuper && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSensitiveAction({
                                      isOpen: true,
                                      type: 'suspend',
                                      staffId: st.id,
                                      targetDisplay: st.email,
                                      detailsDisplay: `Action: ${st.status === 'Active' ? 'Suspend Account' : 'Activate Account'}`
                                    })
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                                    st.status === 'Active'
                                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {st.status === 'Active' ? (language === 'bn' ? 'সাসপেন্ড' : 'Suspend') : (language === 'bn' ? 'সক্রিয়' : 'Activate')}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSensitiveAction({
                                      isOpen: true,
                                      type: 'delete',
                                      staffId: st.id,
                                      targetDisplay: st.email,
                                      detailsDisplay: `Permanently delete staff account: ${st.name}`
                                    })
                                  }
                                  className="p-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition cursor-pointer"
                                  title="Delete Staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 9-Role Permissions Matrix */}
      {activeView === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <span>{language === 'bn' ? '৯টি রোলের সুনির্দিষ্ট পারমিশন ম্যাট্রিক্স' : 'Authoritative 9-Role Permission Matrix'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'প্রতিটি রোলের জন্য অনুমোদিত ও অননুমোদিত কার্যবলীর সুস্পষ্ট তালিকা'
                  : 'Exhaustive map of granted privileges and restrictions per role.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ALL_ADMIN_ROLES.map(role => {
              const perms = ROLE_DEFAULT_PERMISSIONS[role];
              const desc = ROLE_DESCRIPTIONS[role];
              const isSuper = role === 'Super Admin';

              return (
                <div
                  key={role}
                  className={`p-4 rounded-2xl border transition ${
                    isSuper
                      ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {role}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {perms.length} Perms
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                    {language === 'bn' ? desc.bn : desc.en}
                  </p>

                  <div className="border-t border-slate-200 dark:border-slate-700/60 pt-2 space-y-1">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {language === 'bn' ? 'মূল ক্ষমতা:' : 'Key Privileges:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {perms.slice(0, 7).map(p => (
                        <span key={p} className="text-[9.5px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300">
                          {p}
                        </span>
                      ))}
                      {perms.length > 7 && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 font-mono font-bold">
                          +{perms.length - 7} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Deny by Default Policy */}
      {activeView === 'policy' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-red-900 dark:text-red-200 text-sm">
                {language === 'bn' ? 'কঠোর "Deny by Default" ও Least-Privilege নীতি' : 'Strict "Deny by Default" & Principle of Least Privilege'}
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                {language === 'bn'
                  ? 'কোনো ইউজারের রোল যদি স্পষ্টভাবে কোনো পারমিশন না ধারণ করে, তবে সিস্টেম স্বয়ংক্রিয়ভাবে তার সেই কার্যকলাপে প্রবেশাধিকার প্রত্যাখ্যান করবে। ফ্রন্টএন্ডে বাটন লুকিয়ে রাখার বাইরে ব্যাকএন্ড API লেভেলেও এই যাচাই কার্যকর থাকে।'
                  : 'If a staff role does not explicitly grant a permission, execution is unconditionally denied both in the user interface and on the Express/API server layer.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{language === 'bn' ? 'সংবেদনশীল অ্যাকশনে বাধ্যতামূলক ২FA' : 'Mandatory 2FA on Sensitive Actions'}</span>
              </h5>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                <li>ম্যানুয়াল পেমেন্ট অনুমোদন বা রিজেক্ট</li>
                <li>ইউজার অ্যাকাউন্ট স্থায়ী ডিলিট বা সাসপেন্ড</li>
                <li>নতুন স্টাফ এডমিন তৈরি বা অপসরণ</li>
                <li>এডমিন রোল ও পারমিশন পরিবর্তন</li>
                <li>সাইট মেইনটেন্যান্স ও মাস্টার সুইচ পরিবর্তন</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                <span>{language === 'bn' ? 'অপরিবর্তনীয় অডিট ট্রেইল' : 'Immutable Audit Trail Logging'}</span>
              </h5>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                <li>প্রতিটি অ্যাকশনে এডমিনের নাম, ইমেইল ও আইডি রেকর্ড</li>
                <li>ব্যবহৃত পারমিশন ও আইপি অ্যাড্রেস সংরক্ষণ</li>
                <li>টার্গেট আইটেম (বিজ্ঞাপন, পেমেন্ট, ইউজার) আইডি ও বিবরণ</li>
                <li>স্টাফ এডমিনদের জন্য অডিট লগ মোছা সম্পূর্ণ নিষিদ্ধ</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {(showAddModal || editingStaff) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <span>
                  {editingStaff
                    ? (language === 'bn' ? 'স্টাফ রোল ও পারমিশন সম্পাদন' : 'Edit Staff Credentials & Role')
                    : (language === 'bn' ? 'নতুন স্টাফ এডমিন অ্যাকাউন্ট তৈরি' : 'Create Staff Admin Account')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStaff(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingStaff ? handleEditSubmit : handleAddSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tariqul Islam"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email'} *</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled={Boolean(editingStaff)}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tariq.mod@marketbd.net"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+8801700000000"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">{language === 'bn' ? 'নির্ধারিত রোল নির্বাচন করুন' : 'Select Designated Role'} *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as AdminRole })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer font-bold"
                >
                  {ALL_ADMIN_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r} ({ROLE_DEFAULT_PERMISSIONS[r]?.length || 0} Permissions)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                  {language === 'bn' ? ROLE_DESCRIPTIONS[formData.role].bn : ROLE_DESCRIPTIONS[formData.role].en}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'bn' ? '২-স্টেপ ভেরিফিকেশন (2FA) বাধ্যবাধকতা' : 'Enforce 2-Step Verification (2FA)'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {language === 'bn' ? 'স্টাফ লগইন করার সময় ৬-ডিজিটের ওটিপি যাচাই বাধ্যতামূলক হবে।' : 'Requires 6-digit OTP verification on every login.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.mfaEnabled}
                  onChange={e => setFormData({ ...formData, mfaEnabled: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'সংরক্ষণ ও ২FA যাচাই' : 'Save & Verify 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensitive Action 2FA Modal */}
      <SensitiveActionModal
        isOpen={sensitiveAction.isOpen}
        onClose={() => setSensitiveAction({ ...sensitiveAction, isOpen: false })}
        onConfirm={handleConfirmSensitiveAction}
        titleBn={
          sensitiveAction.type === 'create'
            ? 'নতুন এডমিন অ্যাকাউন্ট সৃষ্টি নিশ্চিতকরণ'
            : sensitiveAction.type === 'role_change'
            ? 'এডমিন রোল ও পারমিশন পরিবর্তন নিশ্চিতকরণ'
            : sensitiveAction.type === 'suspend'
            ? 'এডমিন অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন'
            : 'এডমিন অ্যাকাউন্ট স্থায়ী অপসরণ'
        }
        titleEn={
          sensitiveAction.type === 'create'
            ? 'Authorize New Admin Account Creation'
            : sensitiveAction.type === 'role_change'
            ? 'Authorize Role & Permissions Modification'
            : sensitiveAction.type === 'suspend'
            ? 'Toggle Staff Account Status'
            : 'Authorize Permanent Staff Deletion'
        }
        actionType={sensitiveAction.type}
        requiredPermission={
          sensitiveAction.type === 'create'
            ? 'admins.create'
            : sensitiveAction.type === 'role_change'
            ? 'roles.manage'
            : sensitiveAction.type === 'suspend'
            ? 'admins.edit'
            : 'admins.remove'
        }
        adminRole={(currentUser?.role as AdminRole) || 'Super Admin'}
        targetDisplay={sensitiveAction.targetDisplay}
        detailsDisplay={sensitiveAction.detailsDisplay}
        requireReason={sensitiveAction.type === 'delete' || sensitiveAction.type === 'suspend'}
        language={language}
      />
    </div>
  );
};
