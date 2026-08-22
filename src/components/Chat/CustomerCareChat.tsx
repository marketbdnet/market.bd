import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getMarketBdTenure } from '../../utils/tenure';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  Sparkles,
  Bot,
  User,
  Paperclip,
  PhoneCall,
  CheckCheck,
  ShieldCheck,
  HelpCircle,
  Clock,
  ChevronRight,
  BadgeCheck,
  RefreshCw
} from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  { id: '1', bn: '💳 বিকাশ/নগদ পেমেন্ট ও পেইড প্রমোশন সাহায্য', en: 'bKash/Nagad Payment & Promotion Help' },
  { id: '2', bn: '⏳ পোস্ট করার কতক্ষণে বিজ্ঞাপন লাইভ (Approve) হয়?', en: 'How long does ad approval take?' },
  { id: '3', bn: '🚀 কীভাবে দ্রুত মালামাল/পণ্য বিক্রি করব?', en: 'How to sell items fast?' },
  { id: '4', bn: '🛡️ প্রতারণা থেকে নিরাপদ থাকার বিশেষ নিয়মাবলী', en: 'Fraud Protection & Safety Tips' },
  { id: '5', bn: '🚚 হোম ডেলিভারি ও কুরিয়ার পার্টনার সাপোর্ট', en: 'Delivery & Courier Service Help' },
  { id: '6', bn: '👑 গোল্ড ভেরিফাইড সেলার হওয়ার উপায়', en: 'How to get Verified Seller Badge?' },
  { id: '7', bn: '📞 সেলার ফোন রিসিভ না করলে বা চ্যাট না করলে করণীয়', en: 'Seller not answering calls' },
  { id: '8', bn: '🗑️ সোল্ড আউট (Sold Out) মার্ক বা বিজ্ঞাপন ডিলিট', en: 'How to mark Sold Out or Delete' },
  { id: '9', bn: '✏️ বিজ্ঞাপনের দাম বা তথ্য ইডিট করার উপায়', en: 'How to edit ad price or details' },
  { id: '10', bn: '🏷️ বিক্রেতাকে দাম অফার (Make Offer) করার নিয়ম', en: 'How to send price offers' }
];

// Pre-defined pools of realistic Bangladeshi female and male support executives
const FEMALE_AGENTS = [
  {
    nameBn: 'তানজিলা আক্তার',
    nameEn: 'Tanjila Akter',
    titleBn: 'সিনিয়র সাপোর্ট এক্সিকিউটিভ',
    titleEn: 'Senior Support Executive',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'নুসরাত জাহান',
    nameEn: 'Nusrat Jahan',
    titleBn: 'কাস্টমার কেয়ার হেল্পডেস্ক লিড',
    titleEn: 'Customer Care Helpdesk Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'সুমাইয়া ইসলাম',
    nameEn: 'Sumaiya Islam',
    titleBn: 'কাস্টমার রিলেশন বিশেষজ্ঞ',
    titleEn: 'Customer Relation Specialist',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'ফারহানা রহমান',
    nameEn: 'Farhana Rahman',
    titleBn: 'সাপোর্ট টিম লিডার',
    titleEn: 'Support Team Leader',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'সাদিয়া আফরিন',
    nameEn: 'Sadia Afrin',
    titleBn: 'সিনিয়র কাস্টমার সার্ভিস অফিসার',
    titleEn: 'Senior Customer Service Officer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  }
];

const MALE_AGENTS = [
  {
    nameBn: 'তানজিল ইসলাম',
    nameEn: 'Tanjil Islam',
    titleBn: 'সিনিয়র সাপোর্ট এক্সিকিউটিভ',
    titleEn: 'Senior Support Executive',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'মাহমুদুল হাসান',
    nameEn: 'Mahmudul Hasan',
    titleBn: 'কাস্টমার কেয়ার টিম প্রধান',
    titleEn: 'Customer Care Team Chief',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'আরিফুর রহমান',
    nameEn: 'Arifur Rahman',
    titleBn: 'টেকনিক্যাল হেল্পডেস্ক অফিসার',
    titleEn: 'Technical Helpdesk Officer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'রাশেদ খান',
    nameEn: 'Rashed Khan',
    titleBn: 'মার্কেটপ্লেস সাপোর্ট স্পেশালিস্ট',
    titleEn: 'Marketplace Support Specialist',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameBn: 'শাকিল হোসেন',
    nameEn: 'Shakil Hossain',
    titleBn: 'সাপোর্ট এক্সিকিউটিভ',
    titleEn: 'Support Executive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  }
];

export const CustomerCareChat: React.FC = () => {
  const { language, isCustomerCareOpen, setIsCustomerCareOpen, currentUser, customLogoUrl } = useMarket();

  const userTenure = getMarketBdTenure(currentUser?.memberSince || '2023', language);

  // Customer Gender state ('male' -> assigns female agent, 'female' -> assigns male agent)
  const [customerGender, setCustomerGender] = useState<'male' | 'female'>(() => {
    if (currentUser?.gender) return currentUser.gender;
    return 'male';
  });

  // Agent Pool Indices
  const [femaleIndex, setFemaleIndex] = useState(0);
  const [maleIndex, setMaleIndex] = useState(0);

  // Current Active Support Agent based on customer gender and active pool index
  const activeAgentData = customerGender === 'male'
    ? FEMALE_AGENTS[femaleIndex % FEMALE_AGENTS.length]
    : MALE_AGENTS[maleIndex % MALE_AGENTS.length];

  const agentProfile = {
    gender: customerGender === 'male' ? ('female' as const) : ('male' as const),
    name: language === 'bn' ? activeAgentData.nameBn : activeAgentData.nameEn,
    title: language === 'bn' ? activeAgentData.titleBn : activeAgentData.titleEn,
    salutation: customerGender === 'male'
      ? (language === 'bn' ? 'স্যার' : 'Sir')
      : (language === 'bn' ? 'ম্যাম' : "Ma'am"),
    avatar: activeAgentData.avatar
  };

  const getInitialWelcome = (agentName: string, salutation: string) => {
    return language === 'bn'
      ? `আসসালামু আলাইকুম ${salutation}! MarketBD.Net কাস্টমার কেয়ার হেল্পডেস্কে আপনাকে স্বাগতম। আপনি ${userTenure}-র সম্মানিত সদস্য। আমি ${agentName}, ${salutation} আপনাকে কীভাবে সাহায্য করতে পারি?`
      : `Hello ${salutation}! Welcome to MarketBD.Net Customer Care. As a valued user (${userTenure}), I am ${agentName}. How may I assist you today, ${salutation}?`;
  };

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'm-1',
      sender: 'agent',
      text: getInitialWelcome(agentProfile.name, agentProfile.salutation),
      time: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFaqList, setShowFaqList] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  const handleContainerScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isNearBottom;
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current && !userScrolledUpRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isCustomerCareOpen) {
      scrollToBottom();
    }
  }, [messages, isCustomerCareOpen, isTyping]);

  const handleRotateAgent = () => {
    let nextAgentName = '';
    let nextSalutation = agentProfile.salutation;

    if (customerGender === 'male') {
      const nextIdx = (femaleIndex + 1) % FEMALE_AGENTS.length;
      setFemaleIndex(nextIdx);
      const nextAgent = FEMALE_AGENTS[nextIdx];
      nextAgentName = language === 'bn' ? nextAgent.nameBn : nextAgent.nameEn;
    } else {
      const nextIdx = (maleIndex + 1) % MALE_AGENTS.length;
      setMaleIndex(nextIdx);
      const nextAgent = MALE_AGENTS[nextIdx];
      nextAgentName = language === 'bn' ? nextAgent.nameBn : nextAgent.nameEn;
    }

    const switchMsg: ChatMsg = {
      id: 'msg-rotate-' + Date.now(),
      sender: 'agent',
      text: language === 'bn'
        ? `🔄 কাস্টমার কেয়ার আপডেট: আপনার চ্যাটে নতুন এক্সিকিউটিভ "${nextAgentName}" যুক্ত হয়েছেন।\n"আসসালামু আলাইকুম ${nextSalutation}! আমি ${nextAgentName}। আপনাকে কীভাবে সাহায্য করতে পারি?"`
        : `🔄 Support Update: Executive "${nextAgentName}" has joined your chat.\n"Hello ${nextSalutation}! I am ${nextAgentName}, how can I help you today?"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, switchMsg]);
  };

  const handleSwitchGender = (newGender: 'male' | 'female') => {
    if (newGender === customerGender) return;
    setCustomerGender(newGender);

    let assignedAgentName = '';
    let salutation = newGender === 'male' ? (language === 'bn' ? 'স্যার' : 'Sir') : (language === 'bn' ? 'ম্যাম' : "Ma'am");

    if (newGender === 'male') {
      const agent = FEMALE_AGENTS[femaleIndex % FEMALE_AGENTS.length];
      assignedAgentName = language === 'bn' ? agent.nameBn : agent.nameEn;
    } else {
      const agent = MALE_AGENTS[maleIndex % MALE_AGENTS.length];
      assignedAgentName = language === 'bn' ? agent.nameBn : agent.nameEn;
    }

    const notifyMsg: ChatMsg = {
      id: 'msg-switch-' + Date.now(),
      sender: 'agent',
      text: language === 'bn'
        ? `🔄 কাস্টমার কেয়ার মোড পরিবর্তন: আপনার জন্য নির্ধারিত সাপোর্ট এক্সিকিউটিভ "${assignedAgentName}" যুক্ত হয়েছেন।\n"আসসালামু আলাইকুম ${salutation}! আমি ${assignedAgentName}। আপনাকে কীভাবে সাহায্য করতে পারি?"`
        : `🔄 Support Mode Switch: Executive "${assignedAgentName}" has been assigned.\n"Hello ${salutation}! I am ${assignedAgentName}, how may I assist you?"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, notifyMsg]);
  };

  const handleSend = (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim()) return;

    const userMsg: ChatMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    userScrolledUpRef.current = false;
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 10);

    // Simulate Agent Typing & Auto Response
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      const lower = msgText.toLowerCase();

      if (lower.includes('পেমেন্ট') || lower.includes('payment') || lower.includes('bkash') || lower.includes('বিকাশ') || lower.includes('নগদ') || lower.includes('rocket') || lower.includes('রকেট')) {
        replyText =
          language === 'bn'
            ? `💳 পেইড প্রমোশন পেমেন্ট নির্দেশিকা (${agentProfile.salutation}):\n• বিকাশ / নগদ / উপায় নম্বর: 01723230230\n• রকেট নম্বর: 01533830784\n\nএগুলোতে Send Money/Payment করে আপনার Sender Mobile ও TrxID বিজ্ঞাপনের ফর্মে দিন। ৫-১০ মিনিটের মধ্যে ভেরিফাই হয়ে বিজ্ঞাপন লাইভ হবে!`
            : `💳 Paid Promotion Payment Guide (${agentProfile.salutation}):\n• bKash / Nagad / Upay: 01723230230\n• Rocket: 01533830784\n\nSend Money and enter your Sender Mobile & TrxID in the promotion form. Live in 5-10 minutes!`;
      } else if (lower.includes('লাইভ') || lower.includes('review') || lower.includes('অপেক্ষমাণ') || lower.includes('অ্যাপ্রুভ') || lower.includes('approve') || lower.includes('time')) {
        replyText =
          language === 'bn'
            ? `⏳ এপ্রুভাল সময়সূচী (${agentProfile.salutation}):\nনতুন পোস্টকৃত প্রতিটি বিজ্ঞাপন স্প্যাম ও নিরাপত্তা যাচাইয়ের জন্য এডমিন পর্যালোচনায় (Under Review) থাকে। সাধারণত ১০ থেকে ২০ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে লাইভ হয়।`
            : `⏳ Approval Timeline (${agentProfile.salutation}):\nAll new ads go through admin quality check. Approval takes 10 to 20 minutes on average.`;
      } else if (lower.includes('দ্রুত') || lower.includes('বিক্রি') || lower.includes('fast') || lower.includes('sell')) {
        replyText =
          language === 'bn'
            ? `🚀 দ্রুত বিক্রির ৫টি কৌশল (${agentProfile.salutation}):\n১. পরিষ্কার আলোর ৩-৪টি রিয়েল ফটো দিন।\n২. যুক্তিসঙ্গত দাম ও আলোচনার সুযোগ রাখুন।\n৩. ⚡ "জরুরি বিক্রি" (৳৪৯) বা ⭐ "ফিচার্ড" (৳৯৯) প্রমোশন ব্যবহার করুন যা ১০ গুণ বেশি কাস্টমার কল এনে দেয়!`
            : `🚀 5 Tips to Sell Fast (${agentProfile.salutation}):\n1. Upload clear HD photos.\n2. Set competitive price.\n3. Use ⚡ Urgent (৳49) or ⭐ Featured (৳99) boost for 10x buyers!`;
      } else if (lower.includes('প্রতারণা') || lower.includes('নিরাপদ') || lower.includes('safety') || lower.includes('fraud')) {
        replyText =
          language === 'bn'
            ? `🛡️ নিরাপত্তা নিয়মাবলী (${agentProfile.salutation}):\n১. কখোনো কোনো অবস্থাতেই পণ্য দেখার আগে বিকাশ/নগদে বুকিং মানি বা ডেলিভারি চার্জ পাঠাবেন না।\n২. সরাসরি পাবলিক প্লেসে দেখা করে পণ্য যাচাই করে টাকা দিন।\n৩. ভুয়া এসএমএস না দেখে নিজের ক্যাশ অ্যাপে ব্যালেন্স চেক করুন।`
            : `🛡️ Safety Guidelines (${agentProfile.salutation}):\n1. NEVER send advance booking fees before seeing the item.\n2. Inspect item in person in public places.\n3. Always check wallet balance directly in app.`;
      } else if (lower.includes('ডেলিভারি') || lower.includes('কুরিয়ার') || lower.includes('courier') || lower.includes('delivery')) {
        replyText =
          language === 'bn'
            ? `🚚 কুরিয়ার ও ডেলিভারি সেবা (${agentProfile.salutation}):\nMarketBD.Net পেপারফ্লাই, স্টেডফাস্ট ও সুন্দরবন কুরিয়ার পার্টনার সাপোর্ট প্রদান করে। ক্যাশ অন ডেলিভারিতে পণ্য বুঝে পেয়ে কুরিয়ারম্যানকে টাকা দিন।`
            : `🚚 Courier & Delivery (${agentProfile.salutation}):\nMarketBD.Net supports Steadfast & Paperfly COD courier options across all 64 districts in Bangladesh.`;
      } else if (lower.includes('গোল্ড') || lower.includes('ভেরিফাইড') || lower.includes('verified') || lower.includes('badge')) {
        replyText =
          language === 'bn'
            ? `👑 ভেরিফাইড সেলার হওয়ার উপায় (${agentProfile.salutation}):\nজাতীয় পরিচয়পত্র (NID) অথবা ট্রেড লাইসেন্স ও সচল মোবাইল নম্বর ভেরিফাই করে আপনি "Verified Merchant" বা "Gold Seller" ব্যাজ বিনামূল্যে পেতে পারেন।`
            : `👑 Becoming Verified Seller (${agentProfile.salutation}):\nVerify your phone number and submit NID or Trade License to get the Verified Merchant badge!`;
      } else if (lower.includes('ফোন') || lower.includes('রিসিভ') || lower.includes('চ্যাট') || lower.includes('unreachable')) {
        replyText =
          language === 'bn'
            ? `📞 সেলার সংযোগ না পেলে (${agentProfile.salutation}):\nঅনেক সময় সেলার ব্যস্ত থাকতে পারেন। অ্যাপসের "চ্যাট করুন" বাটনে মেসেজ দিয়ে রাখুন অথবা আমাদের এডমিন প্যানেলে রিপোর্ট করুন।`
            : `📞 Unreachable Seller (${agentProfile.salutation}):\nSend an in-app message directly to the seller or click "Report Abuse" if suspicious.`;
      } else if (lower.includes('সোল্ড') || lower.includes('ডিলিট') || lower.includes('delete') || lower.includes('sold')) {
        replyText =
          language === 'bn'
            ? `🗑️ সোল্ড আউট বা ডিলিট পদ্ধতি (${agentProfile.salutation}):\n"আমার বিজ্ঞাপনসমূহ (My Listings)" এ গিয়ে বিজ্ঞাপনের পাশের ড্রপডাউন থেকে কারণ নির্বাচন করে "মুছে ফেলুন" বা "Sold Out" মার্ক করুন।`
            : `🗑️ Deleting or Marking Sold (${agentProfile.salutation}):\nGo to "My Listings", select your ad and pick a deletion reason to remove it anytime.`;
      } else if (lower.includes('ইডিট') || lower.includes('edit') || lower.includes('দাম') || lower.includes('তথ্য')) {
        replyText =
          language === 'bn'
            ? `✏️ বিজ্ঞাপন ইডিট করার নিয়ম (${agentProfile.salutation}):\n"আমার বিজ্ঞাপনসমূহ" পেজে গিয়ে "সম্পাদনা (Edit Ad)" বাটনে ক্লিক করে যেকোনো সময় দাম, ছবি বা ডেসক্রিপশন আপডেট করতে পারবেন।`
            : `✏️ How to Edit Ad (${agentProfile.salutation}):\nNavigate to "My Listings" and click "Edit" to modify price, text, or photos anytime.`;
      } else if (lower.includes('অফার') || lower.includes('offer') || lower.includes('negotiable')) {
        replyText =
          language === 'bn'
            ? `🏷️ প্রাইস অফার পাঠানোর নিয়ম (${agentProfile.salutation}):\nপ্রোডাক্ট ডিটেইলস পেজে "দাম অফার করুন (Make Offer)" বাটনে ক্লিক করে আপনার বাজেট লিখুন। সেলার চ্যাটে সাথে সাথে নোটিফিকেশন পাবেন।`
            : `🏷️ Making Price Offers (${agentProfile.salutation}):\nClick "Make an Offer" on the product detail page to submit your budget directly to the seller.`;
      } else {
        const fallbacksBn = [
          `ধন্যবাদ তথ্যটি জানানোর জন্য ${agentProfile.salutation}! আপনার বার্তাটি কাস্টমার কেয়ার হেল্পডেস্কে রেজিস্টার করা হয়েছে। ${userTenure}-র সদস্য হিসেবে ${agentProfile.name} গুরুত্বের সাথে বিষয়টি পর্যবেক্ষণ করছেন।`,
          `আপনার বিষয়টি নোট করা হয়েছে ${agentProfile.salutation}। আমাদের সাপোর্ট টিম দ্রুত এটি যাচাই করে আপনাকে সহায়তা করবে। অন্য কোনো প্রশ্ন থাকলে জানাতে পারেন!`,
          `ধন্যবাদ ${agentProfile.salutation}! আপনার ক্যোয়ারিটি প্রক্রিয়াধীন রয়েছে। ৫-১০ মিনিটের মধ্যে কাস্টমার এক্সিকিউটিভ ${agentProfile.name} আপনার চ্যাটে আপডেট প্রদান করবেন।`
        ];
        const fallbacksEn = [
          `Thank you for the message ${agentProfile.salutation}! Your query is logged. As a valued user (${userTenure}), ${agentProfile.name} is reviewing this matter.`,
          `We have noted your details ${agentProfile.salutation}. Our support executive will verify and reply shortly. Feel free to share any further questions!`,
          `Thank you ${agentProfile.salutation}! Your query is being processed. Customer agent ${agentProfile.name} will reply within 5-10 minutes.`
        ];
        const randomIndex = Math.floor(Math.random() * fallbacksBn.length);
        replyText = language === 'bn' ? fallbacksBn[randomIndex] : fallbacksEn[randomIndex];
      }

      const agentReply: ChatMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentReply]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Bottom Right Trigger Button (Positioned above fixed bottom navbar on mobile) */}
      {!isCustomerCareOpen && (
        <button
          onClick={() => setIsCustomerCareOpen(true)}
          className="fixed bottom-14 right-2 sm:bottom-4 sm:right-4 z-40 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5 transition-all duration-300 hover:scale-105 cursor-pointer border border-white/30 ring-1 sm:ring-2 ring-emerald-500/30 active:scale-95"
        >
          <div className="relative">
            <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 border border-slate-900 rounded-full"></span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black tracking-tight">
            {language === 'bn' ? 'হেল্প চ্যাট' : 'Help Chat'}
          </span>
        </button>
      )}

      {/* Live Chat Modal Window */}
      {isCustomerCareOpen && (
        <div className="fixed bottom-16 sm:bottom-14 right-2 left-2 sm:left-auto sm:right-4 z-50 w-auto sm:w-full max-w-sm sm:max-w-md h-[520px] max-h-[85vh] sm:max-h-[80vh] bg-white dark:bg-slate-900 border-2 border-emerald-600 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 text-slate-900 dark:text-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-3 sm:p-3.5 flex flex-col gap-2 border-b border-emerald-500/40 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={agentProfile.avatar}
                    alt={agentProfile.name}
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-400 shrink-0"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span className="bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1 shrink-0">
                      {customLogoUrl && (
                        <img src={customLogoUrl} alt="Logo" className="w-4 h-4 object-cover rounded shrink-0" />
                      )}
                      <span className="text-sm font-black tracking-tight flex items-center">
                        <span className="text-red-500 font-black">M</span>
                        <span className="text-white font-black">arketBD.</span>
                        <span className="text-red-500 font-black">Net</span>
                        <span className="text-white font-black"> Support</span>
                      </span>
                    </span>
                    <BadgeCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-200 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="font-semibold">{agentProfile.name} ({agentProfile.title})</span>
                    <span className="mx-1 text-slate-500">•</span>
                    <span className="text-yellow-300 font-bold bg-emerald-900/80 px-1.5 py-0.5 rounded text-[9px]">
                      {userTenure}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCustomerCareOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer Gender Switch & Agent Rotate Selector Bar */}
            <div className="flex items-center justify-between bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-[10px]">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <span>👤 {language === 'bn' ? 'কাস্টমার ধরন:' : 'Customer Type:'}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSwitchGender('male')}
                  className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                    customerGender === 'male'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title={language === 'bn' ? 'পুরুষ কাস্টমার (নারী এজেন্ট রিপ্লাই দেবেন)' : 'Male Customer (Assigned Female Agent)'}
                >
                  <span>👨 {language === 'bn' ? 'পুরুষ' : 'Male'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchGender('female')}
                  className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                    customerGender === 'female'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title={language === 'bn' ? 'নারী কাস্টমার (পুরুষ এজেন্ট রিপ্লাই দেবেন)' : 'Female Customer (Assigned Male Agent)'}
                >
                  <span>👩 {language === 'bn' ? 'নারী' : 'Female'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRotateAgent}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ml-1 border border-amber-400"
                  title={language === 'bn' ? 'অন্য এক্সিকিউটিভ প্রফাইলে সুইচ করুন' : 'Switch to another Executive profile'}
                >
                  <RefreshCw className="w-3 h-3 animate-spin-slow" />
                  <span>{language === 'bn' ? 'অন্য প্রতিনিধি 🔀' : 'Next Agent 🔀'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Support Chips Carousel */}
          <div className="bg-slate-100 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'bn' ? 'কমন প্রশ্নসমূহ (এক ক্লিকে উত্তর জানুন)' : 'Common Questions (FAQ Quick Ask)'}</span>
              </span>
              <button
                onClick={() => setShowFaqList(!showFaqList)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer text-[10px] font-bold"
              >
                {showFaqList ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'প্রশ্নসমূহ দেখুন' : 'Show FAQs')}
              </button>
            </div>

            {showFaqList && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleSend(language === 'bn' ? q.bn : q.en)}
                    className="px-3 py-1 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-full text-[11px] transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>{language === 'bn' ? q.bn : q.en}</span>
                    <ChevronRight className="w-3 h-3 text-emerald-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages Body with min-h-0 to prevent flex expansion overflow */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleContainerScroll}
            className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/60"
          >
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'agent' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                    <Headphones className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    <span>{m.time}</span>
                    {m.sender === 'user' && (
                      <span className="flex items-center gap-0.5 text-emerald-200 font-bold bg-white/20 px-1 rounded-full">
                        <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="text-[8px] uppercase">{language === 'bn' ? 'সিন' : 'Seen'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Headphones className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                  <span className="text-[10px] ml-1 font-bold">
                    {agentProfile.name} {language === 'bn' ? 'টাইপ করছেন...' : 'is typing...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Input Footer - Permanent, Shrink-0, Unlimited Messaging */}
          <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border-t-2 border-emerald-500/80 shrink-0 sticky bottom-0 z-30 shadow-lg">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'আপনার প্রশ্ন বিস্তারিত লিখুন (আনলিমিটেড চ্যাট)...'
                    : 'Type your message (Unlimited 24/7 Chat)...'
                }
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500 focus:border-emerald-600 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none transition-all shadow-inner"
              />

              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl transition shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1 font-bold text-xs"
                title={language === 'bn' ? 'মেসেজ পাঠান' : 'Send Message'}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'bn' ? 'পাঠান' : 'Send'}</span>
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium px-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{language === 'bn' ? '✨ আনলিমিটেড লাইভ মেসেজ সক্রিয়' : '✨ Unlimited Live Messaging Active'}</span>
              </span>
              <span>⚡ 24/7 Support</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

