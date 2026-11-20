import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  X,
  Send,
  Headphones,
  HelpCircle,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

interface HelpEntry {
  id: string;
  sender: 'user' | 'guide';
  text: string;
  time: string;
}

const HELP_TOPICS = [
  {
    id: '1',
    bn: 'বিকাশ/নগদ/রকেট পেমেন্ট ও প্রমোশন নিয়ম',
    en: 'bKash/Nagad/Rocket Payment & Promotion Guide',
    answerBn:
      'পেইড প্রমোশনের জন্য আমাদের সচল মাধ্যমসমূহ:\n• বিকাশ / নগদ / রকেট পেমেন্ট অপশন থেকে সিলেক্ট করে Sender Number ও TrxID দিন।\n• এডমিন যাচাই করে আপনার বিজ্ঞাপনটি অনুমোদন করবেন।',
    answerEn:
      'For Paid Promotions, choose bKash, Nagad, or Rocket and submit your Sender Number & TrxID. Admin will verify and activate your boost.'
  },
  {
    id: '2',
    bn: 'বিজ্ঞাপন পোস্ট করার কতক্ষণে লাইভ হয়?',
    en: 'How long does ad approval take?',
    answerBn:
      'নতুন বিজ্ঞাপন মান যাচাইয়ের পর সাধারণত অল্প সময়ের মধ্যেই অনুমোদিত ও লাইভ হয়ে যায়।',
    answerEn:
      'New ads go live shortly after standard moderation review.'
  },
  {
    id: '3',
    bn: 'প্রতারণা এড়াতে নিরাপদ কেনাবেচার নিয়ম',
    en: 'Safety tips & Fraud prevention',
    answerBn:
      '১. পণ্য হাতে না পেয়ে বা সরাসরি না দেখে কাউকে অগ্রিম টাকা পাঠাবেন না।\n২. নিরাপদ পাবলিক স্থানে দেখা করে পণ্য যাচাই করে মূল্য পরিশোধ করুন।',
    answerEn:
      '1. Never send advance money before seeing the product in person.\n2. Always meet in public places to inspect the item first.'
  },
  {
    id: '4',
    bn: 'বিজ্ঞাপন সম্পাদনা (Edit) বা মুছে ফেলার উপায়',
    en: 'How to edit or delete an ad',
    answerBn:
      'আপনার ড্যাশবোর্ডে গিয়ে "আমার বিজ্ঞাপনসমূহ" থেকে যেকোনো সময় দাম, তথ্য ইডিট অথবা বিজ্ঞাপন মুছে ফেলতে পারবেন।',
    answerEn:
      'Open "My Listings" in your dashboard to edit details or delete any of your ads.'
  },
  {
    id: '5',
    bn: 'বিক্রেতাকে দাম অফার করার নিয়ম',
    en: 'How to send a price offer',
    answerBn:
      'বিজ্ঞাপনের ভেতর থেকে "চ্যাট করুন" খুলুন এবং উপরের "দাম অফার" বাটনে ক্লিক করে আপনার পছন্দের দাম পাঠান।',
    answerEn:
      'Open "Chat" on the product page and tap "Offer" in the chat header to submit your price.'
  }
];

export const CustomerCareChat: React.FC = () => {
  const {
    language,
    isCustomerCareOpen,
    setIsCustomerCareOpen,
    systemNotice,
    isLoggedIn,
    currentUser,
    openAuthModal,
    openChatWithCustomer,
    setActiveTab
  } = useMarket();

  const [entries, setEntries] = useState<HelpEntry[]>([
    {
      id: 'help-welcome',
      sender: 'guide',
      text:
        language === 'bn'
          ? 'আসসালামু আলাইকুম! MarketBD.Net সহায়তা কেন্দ্রে স্বাগতম। নিচের সাধারণ প্রশ্নগুলোর উত্তর এক ক্লিকে দেখুন অথবা আপনার প্রশ্ন লিখুন।'
          : 'Welcome to MarketBD.Net Help Center. Tap any topic below for instant answers or ask a question.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [showTopics, setShowTopics] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCustomerCareOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries, isCustomerCareOpen]);

  const getAnswer = (text: string) => {
    const lower = text.toLowerCase();
    const matched = HELP_TOPICS.find(
      t =>
        text === t.bn ||
        text === t.en ||
        lower.includes('বিকাশ') ||
        lower.includes('নগদ') ||
        lower.includes('রকেট') ||
        lower.includes('bkash') ||
        lower.includes('payment')
          ? t.id === '1'
          : lower.includes('লাইভ') || lower.includes('approve')
          ? t.id === '2'
          : lower.includes('প্রতারণা') || lower.includes('নিরাপদ') || lower.includes('safety') || lower.includes('fraud')
          ? t.id === '3'
          : lower.includes('ইডিট') || lower.includes('edit') || lower.includes('delete') || lower.includes('মুছ')
          ? t.id === '4'
          : lower.includes('অফার') || lower.includes('offer')
          ? t.id === '5'
          : false
    );

    if (matched) {
      return language === 'bn' ? matched.answerBn : matched.answerEn;
    }

    const supportEmail = systemNotice?.contactEmail || 'official.marketbd@gmail.com';
    const supportPhone = systemNotice?.contactPhone || '01533830784';
    return language === 'bn'
      ? `আপনার প্রশ্নের জন্য সরাসরি সহায়তা পেতে যোগাযোগ করুন:\n• ইমেইল: ${supportEmail}\n• ফোন: ${supportPhone}`
      : `For direct assistance on this topic, please reach us at:\n• Email: ${supportEmail}\n• Phone: ${supportPhone}`;
  };

  const handleAsk = (questionText?: string) => {
    const query = (questionText ?? input).trim();
    if (!query) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userEntry: HelpEntry = {
      id: `q-${Date.now()}`,
      sender: 'user',
      text: query,
      time: nowTime
    };

    const replyEntry: HelpEntry = {
      id: `a-${Date.now() + 1}`,
      sender: 'guide',
      text: getAnswer(query),
      time: nowTime
    };

    setEntries(prev => [...prev, userEntry, replyEntry]);
    if (!questionText) setInput('');
  };

  if (!isCustomerCareOpen) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-14 right-2 left-2 sm:left-auto sm:right-4 z-50 w-auto sm:w-full max-w-sm sm:max-w-md h-[480px] max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-[#FF0000] dark:bg-[#B91C1C] text-white p-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm leading-tight">
              {language === 'bn' ? 'MarketBD সহায়তা কেন্দ্র' : 'MarketBD Help Center'}
            </h4>
            <p className="text-[11px] text-amber-100">
              {language === 'bn' ? 'সাধারণ প্রশ্ন ও সরাসরি যোগাযোগ' : 'Quick FAQ & Support Contact'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomerCareOpen(false)}
          className="p-1.5 rounded-full hover:bg-white/15 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Topics */}
      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-slate-500 font-bold">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-600" />
            <span>{language === 'bn' ? 'সাধারণ বিষয়সমূহ' : 'Help Topics'}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowTopics(!showTopics)}
            className="text-emerald-600 hover:underline cursor-pointer"
          >
            {showTopics ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'দেখুন' : 'Show')}
          </button>
        </div>

        {showTopics && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {HELP_TOPICS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAsk(language === 'bn' ? t.bn : t.en)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-emerald-50 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 rounded-full text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>{language === 'bn' ? t.bn : t.en}</span>
                <ChevronRight className="w-3 h-3 text-emerald-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feed */}
      <div ref={bodyRef} className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
        {entries.map(item => (
          <div
            key={item.id}
            className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                item.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
              }`}
            >
              <p>{item.text}</p>
              <span className={`block text-[9px] mt-1 text-right ${item.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Ask a question...'}
            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl cursor-pointer flex items-center gap-1 font-bold text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পাঠান' : 'Send'}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsCustomerCareOpen(false);
            if (!isLoggedIn || !currentUser) {
              openAuthModal('chat');
              return;
            }
            if (currentUser.role === 'admin' || currentUser.id === 'admin-master') {
              setActiveTab('chat');
            } else {
              openChatWithCustomer(currentUser);
            }
          }}
          className="w-full py-2 px-3 bg-gradient-to-r from-[#FF0000] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সরাসরি ইনবক্সে লাইভ চ্যাট করুন' : 'Start Live Inbox Chat'}</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <a href={`tel:${systemNotice?.contactPhone || '01533830784'}`} className="flex items-center gap-1 hover:text-emerald-600">
            <Phone className="w-3 h-3" />
            <span>{systemNotice?.contactPhone || '01533830784'}</span>
          </a>
          <a href={`mailto:${systemNotice?.contactEmail || 'official.marketbd@gmail.com'}`} className="flex items-center gap-1 hover:text-emerald-600">
            <Mail className="w-3 h-3" />
            <span>{systemNotice?.contactEmail || 'official.marketbd@gmail.com'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
