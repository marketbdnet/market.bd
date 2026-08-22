import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Search,
  Send,
  Filter,
  User
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticketNo: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: 'Payment Issue' | 'Ad Moderation' | 'Account Dispute' | 'General Query';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedStaff: string;
  createdDate: string;
  messages: { sender: string; text: string; time: string }[];
}

export const SupportTicketsAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt-1',
      ticketNo: 'TKT-9921',
      userEmail: 'tanvir.dhaka@gmail.com',
      userName: 'Tanvir Hossain',
      subject: 'bKash Auto-payment failed but money deducted',
      category: 'Payment Issue',
      priority: 'High',
      status: 'Open',
      assignedStaff: 'Support Rep #1',
      createdDate: '10 mins ago',
      messages: [
        { sender: 'User', text: 'I tried boosting my ad for 299 BDT via bKash, the money was deducted but status says pending.', time: '10 mins ago' }
      ]
    },
    {
      id: 'tkt-2',
      ticketNo: 'TKT-9884',
      userEmail: 'sultana.comilla@yahoo.com',
      userName: 'Sultana Begum',
      subject: 'Why was my furniture ad rejected?',
      category: 'Ad Moderation',
      priority: 'Medium',
      status: 'In Progress',
      assignedStaff: 'Moderator Alex',
      createdDate: '2 hours ago',
      messages: [
        { sender: 'User', text: 'I posted a photo of my sofa set, but it was marked as rejected. Please check.', time: '2 hours ago' },
        { sender: 'Staff', text: 'Checking your image quality and price formatting. Will update shortly.', time: '1 hour ago' }
      ]
    },
    {
      id: 'tkt-3',
      ticketNo: 'TKT-9710',
      userEmail: 'kamrul.ctg@gmail.com',
      userName: 'Kamrul Islam',
      subject: 'Request to verify Business Shop account',
      category: 'General Query',
      priority: 'Low',
      status: 'Resolved',
      assignedStaff: 'Admin Manager',
      createdDate: '1 day ago',
      messages: [
        { sender: 'User', text: 'Submitted trade license for Chittagong Electronics Shop.', time: '1 day ago' },
        { sender: 'Staff', text: 'Your shop has been verified with a Genuine Badge.', time: '20 hours ago' }
      ]
    }
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyInput, setReplyInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeTicket) return;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: t.status === 'Open' ? 'In Progress' : t.status,
            messages: [
              ...t.messages,
              { sender: 'Admin Staff', text: replyInput.trim(), time: 'Just now' }
            ]
          };
        }
        return t;
      })
    );
    setReplyInput('');
  };

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  const updateStaffAssignment = (ticketId: string, staffName: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, assignedStaff: staffName } : t))
    );
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-sky-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Customer Desk
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '🎧 কাস্টমার সাপোর্ট টিকিট ও হেল্পডেস্ক প্যানেল' : '🎧 Helpdesk & Customer Support Ticket System'}
            </h2>
          </div>
          <p className="text-xs text-cyan-200 max-w-xl">
            {language === 'bn'
              ? 'ইউজারদের পেমেন্ট বা একাউন্ট সংক্রান্ত কমপ্লেইন টিকিট ও প্রশ্ন টিমের মাধ্যমে দ্রুত রিসলভ করুন।'
              : 'Manage user inquiries, payment complaints, moderation appeals, and staff ticket assignments.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-2xl border border-cyan-500/30 text-xs font-bold text-cyan-300">
          <LifeBuoy className="w-5 h-5 text-cyan-400" />
          <span>Open Tickets: {tickets.filter(t => t.status === 'Open').length}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Ticket List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              <span>{language === 'bn' ? 'টিকিট তালিকা' : 'Support Tickets'} ({filteredTickets.length})</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'bn' ? 'টিকিট বা বিষয় খুঁজুন...' : 'Search tickets...'}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTicketId(t.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                  selectedTicketId === t.id
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                  <span className="font-mono">{t.ticketNo}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      t.priority === 'High'
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                </div>

                <div className="font-extrabold text-xs line-clamp-1">{t.subject}</div>

                <div className="flex items-center justify-between text-[11px] opacity-80 pt-1 border-t border-black/10 dark:border-white/10">
                  <span>{t.userName}</span>
                  <span className="font-mono">{t.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Active Ticket Detail & Reply */}
        {activeTicket && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    <span>{activeTicket.ticketNo}</span>
                    <span>•</span>
                    <span>{activeTicket.category}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {activeTicket.subject}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    <span>{activeTicket.userName} ({activeTicket.userEmail})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black cursor-pointer"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Log */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                {activeTicket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl max-w-[85%] text-xs space-y-1 ${
                      msg.sender.includes('Admin') || msg.sender.includes('Staff')
                        ? 'ml-auto bg-cyan-600 text-white rounded-br-none shadow-md'
                        : 'mr-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black opacity-80 gap-3">
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="font-bold leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={language === 'bn' ? 'ইউজারকে রিপ্লাই মেসেজ টাইপ করুন...' : 'Type response to user...'}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'bn' ? 'পাঠান' : 'Send'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
