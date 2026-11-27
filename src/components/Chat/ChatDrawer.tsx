import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { isPhoneVisibleToBuyers } from '../../utils/phoneUtils';
import { formatChatTimestamp, isOwnChatMessage } from '../../utils/chatUtils';
import { isEffectiveLoggedIn, isEffectiveAdmin } from '../../utils/authOwnership';
import {
  Send,
  Lock,
  LogIn,
  Image as ImageIcon,
  DollarSign,
  Phone,
  Check,
  CheckCheck,
  X,
  Trash2,
  ArrowLeft,
  Maximize2,
  Download,
  Search,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

export const ChatDrawer: React.FC = () => {
  const {
    language,
    chatThreads,
    activeChat,
    setActiveChat,
    sendMessage,
    markChatThreadRead,
    deleteChatThread,
    products,
    setSelectedProduct,
    setActiveTab,
    isLoggedIn,
    openAuthModal,
    userRole,
    currentUser
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Image attachment & lightbox
  const [attachedImage, setAttachedImage] = useState<string>('');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  const handleViewAd = () => {
    if (!activeChat) return;
    const product = products.find(p => p.id === activeChat.productId);
    if (product) {
      setSelectedProduct(product);
      setActiveTab('product-details');
    }
  };

  const handleContainerScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight >= 80;
  };

  const activeMessages = Array.isArray(activeChat?.messages) ? activeChat.messages : [];

  useEffect(() => {
    if (messagesContainerRef.current && !userScrolledUpRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeMessages.length]);

  useEffect(() => {
    userScrolledUpRef.current = false;
    setConfirmDeleteId(null);
    if (activeChat?.id && Number(activeChat.unreadCount || 0) > 0) {
      markChatThreadRead(activeChat.id);
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeChat?.id]);

  const getCounterpartName = (thread: typeof chatThreads[number]) => {
    const isAdminViewer = isEffectiveAdmin(isLoggedIn, currentUser, userRole);
    const isViewerSeller =
      Boolean(currentUser?.id && thread.seller?.id === currentUser.id) ||
      Boolean(isAdminViewer && (thread.isCustomerCare || thread.seller?.id === 'admin-master')) ||
      Boolean(
        currentUser?.phone &&
          thread.seller?.phone &&
          currentUser.phone.replace(/\D/g, '') === thread.seller.phone.replace(/\D/g, '')
      );
    if (isViewerSeller) {
      return thread.buyerName || thread.buyerPhone || (language === 'bn' ? 'ক্রেতা' : 'Buyer');
    }
    return thread.seller?.name || (language === 'bn' ? 'বিক্রেতা' : 'Seller');
  };

  const visibleThreads = chatThreads.filter(thread => {
    if (filterTab === 'unread' && (!thread.unreadCount || thread.unreadCount <= 0)) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const counterpart = getCounterpartName(thread).toLowerCase();
    return (
      counterpart.includes(q) ||
      (thread.productTitle || '').toLowerCase().includes(q) ||
      (thread.lastMessage || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!activeChat && visibleThreads.length > 0) {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setActiveChat(visibleThreads[0]);
      }
    }
  }, [activeChat, visibleThreads.length]);

  const unreadTotal = chatThreads.filter(t => Number(t.unreadCount || 0) > 0).length;

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = evt => {
        if (evt.target?.result) {
          setAttachedImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachedImage) || !activeChat) return;

    sendMessage(activeChat.id, messageInput.trim(), undefined, attachedImage || undefined);
    setMessageInput('');
    setAttachedImage('');
    userScrolledUpRef.current = false;
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(offerInput);
    if (!amount || amount <= 0 || !activeChat) return;

    sendMessage(
      activeChat.id,
      `${language === 'bn' ? 'দাম অফার:' : 'Price Offer:'} ৳${amount.toLocaleString()}`,
      amount
    );
    setOfferInput('');
    setShowOfferBox(false);
    userScrolledUpRef.current = false;
  };

  const quickChips = [
    { bn: 'এটি কি এখনো আছে?', en: 'Is this still available?' },
    { bn: 'শেষ দাম কত?', en: 'What is the last price?' },
    { bn: 'লোকেশন কোথায়?', en: 'Where is the location?' },
    { bn: 'কুরিয়ার করা যাবে?', en: 'Can you deliver via courier?' }
  ];

  if (!isEffectiveLoggedIn(isLoggedIn, currentUser)) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto border border-sky-100 dark:border-sky-800 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'চ্যাট ও ইনবক্স দেখতে লগইন করুন' : 'Log in to access your Inbox'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              {language === 'bn'
                ? 'ক্রেতা ও বিক্রেতার সাথে সরাসরি মেসেজ আদান-প্রদান ও অফার দেখতে অনুগ্রহ করে লগইন করুন।'
                : 'Please sign in to send messages, negotiate offers, and manage your conversations.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('chat')}
              className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগইন / সাইনআপ করুন' : 'Log In / Register'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition text-sm cursor-pointer"
            >
              {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-3 sm:py-5 px-2 sm:px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[80vh] max-h-[760px] min-h-[480px]">
        {/* Left Pane: Inbox */}
        <div
          className={`border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950 ${
            activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF0000]" />
                <span>{language === 'bn' ? 'আমার চ্যাট' : 'My Chats'}</span>
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {language === 'bn' ? `সব (${chatThreads.length})` : `All (${chatThreads.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('unread')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    filterTab === 'unread'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {language === 'bn' ? `অপঠিত (${unreadTotal})` : `Unread (${unreadTotal})`}
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'নাম বা বিজ্ঞাপন খুঁজুন...' : 'Search by name or ad...'}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {visibleThreads.length > 0 ? (
              visibleThreads.map(thread => {
                const isActive = activeChat?.id === thread.id;
                const counterpartName = getCounterpartName(thread);
                const isUnread = thread.unreadCount > 0;

                return (
                  <div
                    key={thread.id}
                    onClick={() => setActiveChat(thread)}
                    className={`p-3 cursor-pointer transition flex items-center gap-3 ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-slate-800 border-l-4 border-emerald-600'
                        : 'bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={thread.productImage || '/logo.jpg'}
                        alt={thread.productTitle || 'Chat'}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100"
                      />
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF0000] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1">
                        <h4
                          className={`text-xs truncate ${
                            isUnread
                              ? 'font-black text-slate-950 dark:text-white'
                              : 'font-bold text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {counterpartName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatChatTimestamp(thread.lastMessageTime, language)}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {thread.productTitle} • ৳{(thread.productPrice || 0).toLocaleString()}
                      </p>

                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isUnread
                            ? 'font-bold text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {thread.lastMessage ||
                          (language === 'bn' ? 'নতুন চ্যাট — মেসেজ পাঠান' : 'New chat — say hello')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {language === 'bn' ? 'এখনো কোনো মেসেজ নেই' : 'No conversations yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentUser?.role === 'admin' || currentUser?.id === 'admin-master'
                    ? language === 'bn'
                      ? 'এডমিন প্যানেলের "কাস্টমার ম্যানেজমেন্ট" থেকে যেকোনো কাস্টমারের পাশে চ্যাট বাটনে ক্লিক করে সরাসরি মেসেজ শুরু করুন।'
                      : 'Open Admin Customer Management and tap Chat next to any customer to message them directly.'
                    : language === 'bn'
                    ? 'যেকোনো বিজ্ঞাপনে গিয়ে "সরাসরি চ্যাট করুন" বাটনে ক্লিক করলে এখানে কথোপকথন শুরু হবে।'
                    : 'Open any ad and tap Chat to message the seller directly.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(currentUser?.role === 'admin' || currentUser?.id === 'admin-master') && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      {language === 'bn' ? 'কাস্টমার তালিকা দেখুন' : 'View Customers'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    {language === 'bn' ? 'বিজ্ঞাপন দেখুন' : 'Browse Ads'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Active Conversation */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) processImageFile(file);
          }}
          className={`md:col-span-2 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 ${
            !activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChat ? (
            <>
              {/* Conversation Header */}
              <div className="p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
                    title={language === 'bn' ? 'ইনবক্স' : 'Back to Inbox'}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={activeChat.productImage || '/logo.jpg'}
                    alt=""
                    onClick={handleViewAd}
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                    }}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  />

                  <div className="min-w-0">
                    <h4
                      onClick={handleViewAd}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-600 flex items-center gap-1"
                    >
                      <span className="truncate">{activeChat.productTitle}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] mt-0.5">
                      <span className="font-black text-emerald-700 dark:text-emerald-400">
                        ৳{(activeChat.productPrice || 0).toLocaleString()}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {getCounterpartName(activeChat)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowOfferBox(!showOfferBox)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'দাম অফার' : 'Offer'}</span>
                  </button>

                  {isPhoneVisibleToBuyers(activeChat.seller) && activeChat.seller?.phone && (
                    <a
                      href={`tel:${activeChat.seller.phone.replace(/[^\d+]/g, '')}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                      title={activeChat.seller.phone}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{language === 'bn' ? 'কল' : 'Call'}</span>
                    </a>
                  )}

                  {confirmDeleteId === activeChat.id ? (
                    <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-2 py-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          deleteChatThread(activeChat.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[10px] font-black text-red-600 hover:underline cursor-pointer"
                      >
                        {language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                      >
                        {language === 'bn' ? 'না' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(activeChat.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                      title={language === 'bn' ? 'চ্যাট মুছুন' : 'Delete conversation'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Offer Inline Bar */}
              {showOfferBox && (
                <form
                  onSubmit={handleSendOffer}
                  className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 shrink-0"
                >
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 shrink-0">
                    {language === 'bn' ? 'আপনার দাম (৳):' : 'Your Offer (৳):'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={offerInput}
                    onChange={e => setOfferInput(e.target.value)}
                    placeholder="e.g. 12000"
                    className="px-2.5 py-1.5 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold w-32 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    {language === 'bn' ? 'অফার পাঠান' : 'Send Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfferBox(false)}
                    className="ml-auto text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Messages Feed */}
              <div
                ref={messagesContainerRef}
                onScroll={handleContainerScroll}
                className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-slate-50 dark:bg-slate-950/40"
              >
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {language === 'bn'
                        ? `"${activeChat.productTitle || 'চ্যাট'}" নিয়ে আলোচনা শুরু করুন`
                        : `Start chatting about "${activeChat.productTitle || 'Chat'}"`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {language === 'bn'
                        ? 'নিচের যেকোনো প্রশ্ন ট্যাপ করুন অথবা নিজের মেসেজ লিখে পাঠান।'
                        : 'Tap a quick question below or type your own message.'}
                    </p>
                  </div>
                ) : (
                  activeMessages.map(msg => {
                    const isMe = isOwnChatMessage(msg, activeChat, currentUser);
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs shadow-2xs ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                          }`}
                        >
                          {msg.isOffer && msg.offerAmount && (
                            <div
                              className={`mb-1 pb-1 border-b font-bold text-[11px] ${
                                isMe
                                  ? 'border-white/20 text-amber-200'
                                  : 'border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {language === 'bn' ? 'দাম অফার:' : 'Price Offer:'} ৳
                              {msg.offerAmount.toLocaleString()}
                            </div>
                          )}

                          {msg.image && (
                            <div className="mb-1.5 overflow-hidden rounded-xl max-w-xs relative group">
                              <img
                                src={msg.image}
                                alt="Attachment"
                                className="w-full max-h-56 object-cover cursor-pointer"
                                onClick={() => setEnlargedImage(msg.image!)}
                              />
                              <div className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                <Maximize2 className="w-3 h-3" />
                              </div>
                            </div>
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                          <div
                            className={`text-[9.5px] mt-1 flex items-center justify-end gap-1 ${
                              isMe ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            <span>{formatChatTimestamp(msg.timestamp, language)}</span>
                            {isMe &&
                              (msg.status === 'seen' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-100" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-emerald-100/80" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compact 4 Quick Questions */}
              <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                {quickChips.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(activeChat.id, language === 'bn' ? q.bn : q.en)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-full border border-slate-200 dark:border-slate-700 transition shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    {language === 'bn' ? q.bn : q.en}
                  </button>
                ))}
              </div>

              {/* Message Input Footer */}
              <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                {attachedImage && (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={attachedImage}
                        alt="Preview"
                        className="w-9 h-9 object-cover rounded-lg border border-slate-300"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {language === 'bn' ? 'ছবি সংযুক্ত করা হয়েছে' : 'Photo attached'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage('')}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="p-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    ref={chatFileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="p-2 text-slate-600 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
                    title={language === 'bn' ? 'ছবি পাঠান' : 'Attach photo'}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder={language === 'bn' ? 'মেসেজ লিখুন...' : 'Write a message...'}
                    className="flex-1 min-w-0 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim() && !attachedImage}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-xs"
                  >
                    <span className="hidden sm:inline">{language === 'bn' ? 'পাঠান' : 'Send'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs font-semibold">
                {language === 'bn'
                  ? 'কথোপকথন দেখতে বামপাশ থেকে একটি চ্যাট বেছে নিন'
                  : 'Select a chat from the left to view messages'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-10 right-0 p-1.5 text-white bg-white/20 hover:bg-white/40 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <a
              href={enlargedImage}
              download="chat-image.jpg"
              target="_blank"
              rel="noreferrer"
              className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
