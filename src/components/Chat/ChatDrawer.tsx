import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { isPhoneVisibleToBuyers } from '../../utils/phoneUtils';
import {
  Send,
  Image as ImageIcon,
  DollarSign,
  Phone,
  Check,
  CheckCheck,
  Mic,
  X,
  Trash2,
  AlertOctagon,
  ArrowLeft,
  Maximize2,
  Download
} from 'lucide-react';

export const ChatDrawer: React.FC = () => {
  const {
    language,
    chatThreads,
    activeChat,
    setActiveChat,
    sendMessage,
    isSellerTyping,
    spamThreads,
    toggleSpamThread
  } = useMarket();

  const [messageInput, setMessageInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read' | 'spam'>('all');
  
  // Image & Attachment state
  const [attachedImage, setAttachedImage] = useState<string>('');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  const [deletedThreadIds, setDeletedThreadIds] = useState<string[]>([]);

  const handleContainerScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    userScrolledUpRef.current = !isNearBottom;
  };

  // Scroll ONLY the chat inner container to bottom when messages update (unless user is reading older messages)
  useEffect(() => {
    if (messagesContainerRef.current && !userScrolledUpRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  // When switching thread, scroll to bottom of that thread
  useEffect(() => {
    userScrolledUpRef.current = false;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeChat?.id]);

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAttachedImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachedImage) || !activeChat) return;

    sendMessage(
      activeChat.id,
      messageInput.trim(),
      undefined,
      attachedImage || undefined
    );
    setMessageInput('');
    setAttachedImage('');
    userScrolledUpRef.current = false;
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 10);
  };

  const handleSendVoiceNote = () => {
    if (!activeChat) return;
    sendMessage(
      activeChat.id,
      language === 'bn' ? '🎙️ [ভয়েস মেসেজ - ০:১৫]' : '🎙️ [Voice Message - 0:15]'
    );
    userScrolledUpRef.current = false;
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 10);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerInput || !activeChat) return;

    const amount = Number(offerInput);
    sendMessage(
      activeChat.id,
      `${language === 'bn' ? 'প্রাইস অফার:' : 'Price Offer:'} ৳${amount.toLocaleString()}`,
      amount
    );
    setOfferInput('');
    setShowOfferBox(false);
    userScrolledUpRef.current = false;
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 10);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(language === 'bn' ? 'আপনি কি এই চ্যাটটি থ্রেড তালিকা থেকে রিমুভ করতে চান?' : 'Remove this chat thread?')) {
      setDeletedThreadIds(prev => [...prev, threadId]);
      if (activeChat?.id === threadId) {
        setActiveChat(null);
      }
    }
  };

  // Filter threads
  const visibleThreads = chatThreads.filter(t => {
    if (deletedThreadIds.includes(t.id)) return false;
    const isSpam = spamThreads.includes(t.id);

    if (filterTab === 'spam') return isSpam;
    if (isSpam) return false;

    if (filterTab === 'unread') return t.unreadCount && t.unreadCount > 0;
    if (filterTab === 'read') return !t.unreadCount || t.unreadCount === 0;
    return true; // 'all'
  });

  // Auto-select first thread if activeChat is null on desktop/tablet so chat input is always open
  useEffect(() => {
    if (!activeChat && visibleThreads.length > 0) {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setActiveChat(visibleThreads[0]);
      }
    }
  }, [activeChat, visibleThreads.length]);

  return (
    <div className="max-w-5xl mx-auto py-3 sm:py-6 px-2 sm:px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[82vh] max-h-[780px] min-h-[500px]">
        {/* Left Side: Threads List */}
        <div className={`border-r border-gray-200 dark:border-slate-800 flex flex-col min-h-0 bg-gray-50 dark:bg-slate-950 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 sm:p-4 bg-emerald-700 dark:bg-emerald-800 text-white font-bold flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">
                {language === 'bn' ? 'মেসেজ ও ইনবক্স' : 'Messages & Inbox'}
              </span>
            </div>
            <span className="text-xs bg-emerald-950 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-500/30">
              {visibleThreads.length}
            </span>
          </div>

          {/* Inbox Filter Tabs: All, Unread, Read, Spam */}
          <div className="p-2 bg-slate-200/80 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto text-[11px] font-bold shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'সব (All)' : 'All'}
            </button>

            <button
              onClick={() => setFilterTab('unread')}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                filterTab === 'unread'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'আনরিড (Unread)' : 'Unread'}
            </button>

            <button
              onClick={() => setFilterTab('read')}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                filterTab === 'read'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'রিড (Read)' : 'Read'}
            </button>

            <button
              onClick={() => setFilterTab('spam')}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                filterTab === 'spam'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? 'স্পাম (Spam)' : 'Spam'}
            </button>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-slate-800">
            {visibleThreads.length > 0 ? (
              visibleThreads.map(thread => {
                const isActive = activeChat?.id === thread.id;
                const isSpam = spamThreads.includes(thread.id);
                return (
                  <div
                    key={thread.id}
                    onClick={() => setActiveChat(thread)}
                    className={`p-3 cursor-pointer transition flex items-center gap-3 relative group ${
                      isActive ? 'bg-emerald-100/80 dark:bg-slate-800 border-l-4 border-emerald-600' : 'hover:bg-gray-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <img
                      src={thread.productImage}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">
                          {thread.seller.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {thread.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {thread.productTitle}
                      </p>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 truncate mt-0.5 flex items-center gap-1">
                        <span>{thread.lastMessage}</span>
                      </p>
                    </div>

                    {/* Quick Thread Action Hover Menu (Spam & Delete) */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleSpamThread(thread.id);
                        }}
                        className={`p-1 rounded text-[10px] ${
                          isSpam ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                        }`}
                        title={isSpam ? 'Unmark Spam' : 'Mark Spam'}
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={e => handleDeleteThread(thread.id, e)}
                        className="p-1 bg-slate-200 dark:bg-slate-800 hover:bg-red-600 text-slate-700 hover:text-white rounded transition text-[10px]"
                        title="Delete Thread"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                {language === 'bn' ? 'কোনো মেসেজ পাওয়া যায়নি' : 'No messages in this folder'}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Panel */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`md:col-span-2 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 ${!activeChat ? 'hidden md:flex' : 'flex'}`}
        >
          {activeChat ? (
            <>
              {/* Product Info Bar at Top of Chat */}
              <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white rounded-xl text-slate-700 dark:text-slate-300 transition shrink-0 cursor-pointer"
                    title={language === 'bn' ? 'ইনবক্স তালিকা' : 'Back to Inbox'}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={activeChat.productImage}
                    alt=""
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate">
                        {activeChat.productTitle}
                      </h4>
                      <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {language === 'bn' ? 'আনলিমিটেড চ্যাট' : 'Unlimited Chat'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        ৳{activeChat.productPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        • {activeChat.seller.name}
                      </span>
                      {activeChat.seller?.isOnline === false ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          {language === 'bn' ? 'অফলাইন' : 'Offline'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {language === 'bn' ? 'অনলাইন' : 'Online'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowOfferBox(!showOfferBox)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 text-[11px] sm:text-xs font-bold px-2.5 py-1.5 rounded-xl shadow transition cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অফার পাঠান' : 'Send Offer'}</span>
                  </button>
                  {isPhoneVisibleToBuyers(activeChat.seller) && activeChat.seller?.phone && (
                    <a
                      href={`tel:${activeChat.seller.phone.replace(/[^\d+]/g, '')}`}
                      className="bg-emerald-700 text-white p-2 rounded-xl hover:bg-emerald-800 transition shrink-0"
                      title={activeChat.seller.phone}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Unlimited Live Chat Banner */}
              <div className="bg-emerald-600/10 dark:bg-emerald-950/40 px-3 py-1 border-b border-emerald-500/20 flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>
                    {language === 'bn'
                      ? '✨ আনলিমিটেড লাইভ চ্যাট সক্রিয় • কোনো লিমিট নেই'
                      : '✨ Unlimited Live Chat Active • No message limits'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">
                  {language === 'bn' ? '১০০% ফ্রি ও নিরাপদ' : '100% Free & Safe'}
                </span>
              </div>

              {/* Offer Box Drawer */}
              {showOfferBox && (
                <form
                  onSubmit={handleSendOffer}
                  className="p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 shrink-0"
                >
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 shrink-0">
                    {language === 'bn' ? 'অফার প্রাইস ৳:' : 'Offer Price ৳:'}
                  </span>
                  <input
                    type="number"
                    value={offerInput}
                    onChange={e => setOfferInput(e.target.value)}
                    placeholder="e.g. 130000"
                    className="px-2.5 py-1.5 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold w-32 sm:w-36 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-800 cursor-pointer shrink-0"
                  >
                    {language === 'bn' ? 'কনফার্ম' : 'Send'}
                  </button>
                </form>
              )}

              {/* Messages History with Full Date & Time and min-h-0 */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleContainerScroll}
                className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-emerald-50/20 dark:bg-slate-950/50"
              >
                {activeChat.messages.map(msg => {
                  const isMe = msg.senderId === 'user-me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs shadow-xs ${
                          isMe
                            ? 'bg-emerald-700 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {msg.isOffer && (
                          <div className="mb-1 pb-1 border-b border-white/20 font-bold text-yellow-300">
                            ⚡ Price Offer: ৳{msg.offerAmount?.toLocaleString()}
                          </div>
                        )}
                        {msg.image && (
                          <div className="mb-2 overflow-hidden rounded-xl border border-white/20 max-w-xs shadow-md relative group">
                            <img
                              src={msg.image}
                              alt="Chat attachment"
                              className="w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition"
                              onClick={() => setEnlargedImage(msg.image!)}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition pointer-events-none flex items-center gap-1">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Zoom</span>
                            </div>
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                        
                        {/* Full Timestamp Date & Time */}
                        <div className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 font-mono ${isMe ? 'text-emerald-200' : 'text-gray-400 dark:text-slate-400'}`}>
                          <span>28 Jul 2026, {msg.timestamp}</span>
                          {isMe && (
                            msg.status === 'seen' ? (
                              <span className="flex items-center text-pink-400 font-bold gap-0.5 bg-white/10 px-1 rounded-full border border-pink-400/30" title={language === 'bn' ? 'দেখা হয়েছে (Seen)' : 'Seen'}>
                                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span className="text-[8px] font-extrabold uppercase tracking-tight">{language === 'bn' ? 'সিন' : 'Seen'}</span>
                              </span>
                            ) : msg.status === 'delivered' ? (
                              <span title={language === 'bn' ? 'পৌঁছেছে (Delivered)' : 'Delivered'}>
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                              </span>
                            ) : (
                              <span title={language === 'bn' ? 'পাঠানো হয়েছে (Sent)' : 'Sent'}>
                                <Check className="w-3.5 h-3.5 text-emerald-200/80" />
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Live Seller Typing Indicator */}
                {isSellerTyping && (
                  <div className="flex items-start">
                    <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        {language === 'bn' ? 'সেলার টাইপ করছেন...' : 'Seller is typing...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preset Quick Questions Chips for Buyers */}
              <div className="bg-slate-100 dark:bg-slate-950 p-1.5 sm:p-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {[
                    { bn: '👋 পণ্যটি কি বিক্রি আছে?', en: '👋 Is it available?' },
                    { bn: '💰 দাম কিছুটা কম রাখা যাবে কি?', en: '💰 Is price negotiable?' },
                    { bn: '📍 আপনার লোকেশন কোথায়?', en: '📍 Where is your location?' },
                    { bn: '📦 মেমো ও অরিজিনাল বক্স আছে কি?', en: '📦 Memo & box included?' },
                    { bn: '🚚 কুরিয়ারে পাঠানো যাবে কি?', en: '🚚 Courier delivery available?' },
                    { bn: '🕒 কখন দেখা করা সম্ভব?', en: '🕒 When can we meet?' }
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (activeChat) {
                          sendMessage(activeChat.id, language === 'bn' ? q.bn : q.en);
                        }
                      }}
                      className="px-2.5 sm:px-3 py-1 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-[10.5px] sm:text-[11px] font-bold rounded-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shrink-0 cursor-pointer shadow-2xs"
                    >
                      {language === 'bn' ? q.bn : q.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form - Optimized for Android App & Mobile (Send button always 100% visible) */}
              <div className="bg-white dark:bg-slate-900 border-t-2 border-emerald-500/80 shrink-0">
                {/* Image Preview Thumbnail if attached */}
                {attachedImage && (
                  <div className="p-2 bg-emerald-50 dark:bg-slate-800 border-b border-emerald-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={attachedImage}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-xl border border-emerald-400 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate">
                          {language === 'bn' ? 'ছবি সংযুক্ত করা হয়েছে 📷' : 'Image attached 📷'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage('')}
                      className="p-1 text-red-500 hover:text-red-700 bg-white dark:bg-slate-900 rounded-full shadow-xs cursor-pointer shrink-0"
                      title={language === 'bn' ? 'ছবি সরান' : 'Remove image'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form
                  onSubmit={handleSend}
                  className="p-2 sm:p-3 flex items-center gap-1.5 sm:gap-2 w-full min-w-0"
                >
                  <input
                    type="file"
                    ref={chatFileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Photo Upload Button */}
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="p-2 sm:p-2.5 text-slate-600 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-center shrink-0"
                    title={language === 'bn' ? 'ছবি পাঠান' : 'Attach photo'}
                  >
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </button>

                  {/* Voice Note Button */}
                  <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    className="p-2 sm:p-2.5 text-slate-600 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-center shrink-0"
                    title={language === 'bn' ? 'ভয়েস বার্তা' : 'Send voice note'}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  </button>

                  {/* Text Input Field: Flex-1 and Min-w-0 to prevent overflowing the send button */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'মেসেজ লিখুন...'
                          : 'Type message...'
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-emerald-500 focus:border-emerald-600 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                    />
                  </div>

                  {/* Send Arrow Button: Shrink-0, Always fully visible on screen */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim() && !attachedImage}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold rounded-xl sm:rounded-2xl transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0 text-xs active:scale-95"
                    title={language === 'bn' ? 'পাঠান' : 'Send'}
                  >
                    <span className="hidden sm:inline">{language === 'bn' ? 'পাঠান' : 'Send'}</span>
                    <Send className="w-4 h-4 shrink-0" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 dark:text-slate-500">
              <p className="text-sm">
                {language === 'bn'
                  ? 'চ্যাট শুরু করতে বামপাশের যেকোনো থ্রেড বেছে নিন'
                  : 'Select a conversation from the left to start chatting'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Image Lightbox Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white bg-white/20 hover:bg-white/40 rounded-full transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={enlargedImage}
              alt="Enlarged preview"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-4 flex items-center gap-3">
              <a
                href={enlargedImage}
                download="chat-image.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'bn' ? 'ছবি ডাউনলোড করুন' : 'Download Photo'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
