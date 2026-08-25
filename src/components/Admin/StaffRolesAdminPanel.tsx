import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Users,
  Shield,
  Key,
  UserPlus,
  Trash2,
  Check,
  X,
  Lock,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Moderator' | 'Support Agent' | 'Billing Manager';
  permissions: string[];
  status: 'Active' | 'Suspended';
  lastLogin: string;
}

export const StaffRolesAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [staffList, setStaffList] = useState<StaffUser[]>([
    {
      id: 'staff-1',
      name: 'System SuperAdmin',
      email: 'official.marketbd@gmail.com',
      phone: '01723230230',
      role: 'Super Admin',
      permissions: ['All System Permissions', 'Full Database Access', 'Financial Controls'],
      status: 'Active',
      lastLogin: '2 mins ago'
    },
    {
      id: 'staff-2',
      name: 'Tariqul Islam (Ad Reviewer)',
      email: 'tariq.mod@marketbd.net',
      phone: '01822334455',
      role: 'Moderator',
      permissions: ['Ad Approve & Reject', 'Fraud Report Inspection'],
      status: 'Active',
      lastLogin: '3 hours ago'
    },
    {
      id: 'staff-3',
      name: 'Nusrat Jahan (Support Desk)',
      email: 'nusrat.support@marketbd.net',
      phone: '01933445566',
      role: 'Support Agent',
      permissions: ['Support Ticket Reply', 'User Account Unblock Request'],
      status: 'Active',
      lastLogin: 'Yesterday'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<StaffUser['role']>('Moderator');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newMember: StaffUser = {
      id: 'staff-' + Date.now(),
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '01700000000',
      role: newRole,
      permissions:
        newRole === 'Moderator'
          ? ['Ad Review', 'Report Review']
          : newRole === 'Support Agent'
          ? ['Support Ticket Manager']
          : ['Billing & Revenue Audit'],
      status: 'Active',
      lastLogin: 'Never'
    };

    setStaffList(prev => [...prev, newMember]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const toggleStaffStatus = (id: string) => {
    setStaffList(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' }
          : s
      )
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Access Governance
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '👥 এডমিন স্টাফ রোলস, মডারেটর ও পারমিশন কন্ট্রোল' : '👥 Staff Roles & Access Permission Governance'}
            </h2>
          </div>
          <p className="text-xs text-indigo-200 max-w-xl">
            {language === 'bn'
              ? 'সাব-এডমিন, মডারেটর ও কাস্টমার কেয়ার স্টাফ তৈরি করুন এবং তাদের নির্দিষ্ট এক্সেস রোলস সেট করুন।'
              : 'Create sub-admins, moderators, assign specific privileges and audit staff login history.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Staff Member & Email</th>
                <th className="p-4">Designated Role</th>
                <th className="p-4">Assigned Permissions</th>
                <th className="p-4 text-center">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {st.role === 'Super Admin' && (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-600 text-white rounded font-mono">
                              ROOT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {st.email} • {st.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl font-extrabold text-[11px]">
                      {st.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {st.permissions.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-center font-mono text-slate-500 text-[11px]">
                    {st.lastLogin}
                  </td>

                  <td className="p-4 text-right">
                    {st.role !== 'Super Admin' && (
                      <button
                        type="button"
                        onClick={() => toggleStaffStatus(st.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition ${
                          st.status === 'Active'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 hover:bg-amber-100'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {st.status === 'Active' ? 'Suspend Account' : 'Activate Staff'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <span>Add Admin Staff Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mahfuzur Rahman"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="mahfuz.mod@marketbd.net"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Select Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                >
                  <option value="Moderator">Moderator (Ad Approval)</option>
                  <option value="Support Agent">Support Agent (Helpdesk)</option>
                  <option value="Billing Manager">Billing Manager (Financials)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-lg cursor-pointer"
              >
                Save Staff Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
