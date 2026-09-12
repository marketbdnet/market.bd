import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkles, X, Send, Bot, User, CheckCircle } from 'lucide-react';

export const AISearchModal: React.FC = () => {
  const { language, isAISearchOpen, setIsAISearchOpen, customLogoUrl } = useMarket();

  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text:
        language === 'bn'
          ? 'আসসালামু আলাইকুম! আমি মার্কেটবিডি.নেট (MarketBD.Net) এআই সহকারী।\nআপনার বাজেট কত এবং আপনি কী ধরনের মোবাইল, ল্যাপটপ, বাইক বা ফ্ল্যাট খুঁজছেন জানাবেন?'
          : 'Hello! I am MarketBD.Net AI Assistant.\nTell me your budget or requirements, and I will recommend the best deals!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAISearchOpen) return null;

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;

    const userText = promptInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || (language === 'bn' ? 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।' : 'No response received.')
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text:
            language === 'bn'
              ? 'এআই সংযোগে সাময়িক সমস্যা হয়েছে। আপনি মূল সার্চ অপশন ব্যবহার করতে পারেন।'
              : 'AI connection temporary issue. Please use default search filters.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 aspect-square relative flex items-center justify-center shrink-0 overflow-hidden rounded-full">
              <img
                src={customLogoUrl || '/logo.jpg'}
                alt="MarketBD.Net Logo"
                className="w-full h-full object-cover shrink-0 rounded-full"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1">
                <span className="text-red-500 font-black">M</span><span className="text-white font-black">arketBD.</span><span className="text-red-500 font-black">Net</span>
                <span className="text-emerald-400 font-bold ml-1 text-xs">
                  {language === 'bn' ? 'এআই সহকারি' : 'AI Assistant'}
                </span>
              </h3>
              <p className="text-[11px] text-red-200 font-bold">
                {language === 'bn' ? 'Gemini AI দ্বারা চালিত স্মার্ট ডিল ফাইন্ডার' : 'Powered by Gemini AI'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAISearchOpen(false)}
            className="p-1.5 rounded-full hover:bg-pink-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-pink-50/50 border-b border-pink-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-slate-800 shrink-0">
            {language === 'bn' ? 'আইডিয়া:' : 'Try asking:'}
          </span>
          {[
            '৳৩০,০০০ এর মধ্যে ভালো গেমিং ফোন',
            'ধানমন্ডিতে ৩ রুমের ফ্ল্যাট ভাড়া',
            'Yamaha R15 নাকি Suzuki GSX কোনটা ভালো?',
            'আমার ল্যাপটপের আকর্ষনীয় সেল অ্যাড লিখো'
          ].map((chip, i) => (
            <button
              key={i}
              onClick={() => setPromptInput(chip)}
              className="bg-white border border-slate-200 text-slate-700 hover:border-pink-500 hover:text-pink-600 px-2.5 py-1 rounded-full shrink-0 transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-md p-3.5 rounded-xl text-xs whitespace-pre-line shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-pink-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Sparkles className="w-4 h-4 text-pink-600 animate-spin" />
              <span>
                {language === 'bn' ? 'এআই চিন্তা করছে...' : 'AI thinking...'}
              </span>
            </div>
          )}
        </div>

        {/* Form Input */}
        <form onSubmit={handleAISubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'আপনার প্রয়োজন বা প্রশ্ন বাংলায় লিখুন...'
                : 'Ask AI anything in English or Bengali...'
            }
            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-pink-600"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition shadow-2xs"
          >
            <Send className="w-4 h-4" />
            <span>{language === 'bn' ? 'জিজ্ঞাসা' : 'Ask'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
