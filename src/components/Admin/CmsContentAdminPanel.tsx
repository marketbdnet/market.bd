import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  FileText,
  HelpCircle,
  Newspaper,
  Save,
  Check,
  Edit3,
  Plus,
  Trash2,
  Globe
} from 'lucide-react';

export const CmsContentAdminPanel: React.FC = () => {
  const { language } = useMarket();

  const [activeTab, setActiveTab] = useState<'pages' | 'faq' | 'blog'>('pages');

  // Page CMS contents
  const [aboutText, setAboutText] = useState(
    'MarketBD is Bangladesh’s premier buy & sell marketplace connecting millions of genuine buyers and sellers across all 64 districts.'
  );
  const [safetyText, setSafetyText] = useState(
    '1. Meet seller in a public place.\n2. Never pay advance money before inspecting the product.\n3. Always test electronic devices on the spot.'
  );
  const [termsText, setTermsText] = useState(
    'By posting ads on MarketBD, users agree to uphold ethical listing standards and avoid counterfeit or illegal items.'
  );

  // FAQ Items
  const [faqItems, setFaqItems] = useState([
    {
      id: 'faq-1',
      question: 'কীভাবে বিজ্ঞাপন ফ্রি পোস্ট করব? (How to post a free ad?)',
      answer: 'ওয়েবসাইটের উপরের "বিজ্ঞাপন দিন" বাটনে ক্লিক করে ক্যাটাগরি ও বিবরণ দিয়ে ২ মিনিটে ফ্রি পোস্ট করুন।'
    },
    {
      id: 'faq-2',
      question: 'পেইড প্রমোশন বা বুস্ট কীভাবে কাজ করে?',
      answer: 'বিকাশ, নগদ বা রকেটের মাধ্যমে সরাসরি অটো-পেমেন্ট করে আপনার বিজ্ঞাপনকে ১ম পেজের টপে রাখতে পারবেন।'
    }
  ]);

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Blog News Items
  const [blogPosts, setBlogPosts] = useState([
    {
      id: 'post-1',
      title: '২০২৬ সালে অনলাইন সেকেন্ডহ্যান্ড ল্যাপটপ কেনার সেরা টিপস',
      date: '2026-03-25',
      author: 'MarketBD Editorial',
      content: 'সেকেন্ডহ্যান্ড ল্যাপটপ কেনার আগে ব্যাটারি হেলথ ও প্রসেসর জেনারেশন যাচাই করার কৌশলগুলো জানুন...'
    }
  ]);

  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');

  const [savedMsg, setSavedMsg] = useState('');

  const handleSavePages = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(
      language === 'bn'
        ? '✅ আপডেট সফল হয়েছে! (Update Successfully) - পেইজ কন্টেন্ট সংরক্ষিত হয়েছে।'
        : '✅ Update Successfully! - Page contents saved.'
    );
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFaqItems(prev => [
      ...prev,
      { id: 'faq-' + Date.now(), question: newFaqQ.trim(), answer: newFaqA.trim() }
    ]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleAddBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogContent.trim()) return;
    setBlogPosts(prev => [
      {
        id: 'post-' + Date.now(),
        title: newBlogTitle.trim(),
        date: new Date().toISOString().split('T')[0],
        author: 'Admin',
        content: newBlogContent.trim()
      },
      ...prev
    ]);
    setNewBlogTitle('');
    setNewBlogContent('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-violet-950 via-slate-900 to-purple-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-purple-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              Content Engine
            </span>
            <h2 className="text-xl font-black">
              {language === 'bn' ? '📝 ওয়েবসাইট CMS কন্টেন্ট, FAQ ও ব্লগ এডিটর' : '📝 CMS Page Content, FAQ & Blog Editor'}
            </h2>
          </div>
          <p className="text-xs text-purple-200 max-w-xl">
            {language === 'bn'
              ? 'আমাদের সম্পর্কে (About Us), সেফটি গাইডলাইন, FAQ এবং ব্লগ পোস্টসমূহ এডিট ও আপডেট করুন।'
              : 'Manage static page descriptions, safety instructions, frequently asked questions, and blog articles.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer ${
              activeTab === 'pages' ? 'bg-purple-600 text-white shadow-md' : 'bg-black/40 text-purple-200'
            }`}
          >
            Pages Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer ${
              activeTab === 'faq' ? 'bg-purple-600 text-white shadow-md' : 'bg-black/40 text-purple-200'
            }`}
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer ${
              activeTab === 'blog' ? 'bg-purple-600 text-white shadow-md' : 'bg-black/40 text-purple-200'
            }`}
          >
            Blog / News
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-black rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <form onSubmit={handleSavePages} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <span>১. আমাদের সম্পর্কে (About Us Description)</span>
            </label>
            <textarea
              rows={4}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>২. নিরাপদ লেনদেন নির্দেশিকা (Safety Guidelines)</span>
            </label>
            <textarea
              rows={4}
              value={safetyText}
              onChange={(e) => setSafetyText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>৩. শর্তাবলী (Terms & Conditions)</span>
            </label>
            <textarea
              rows={4}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'পরিবর্তনসমূহ সেভ করুন' : 'Save Page Contents'}</span>
          </button>
        </form>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <form onSubmit={handleAddFaq} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span>নতুন FAQ প্রশ্ন ও উত্তর যোগ করুন</span>
            </h3>

            <input
              type="text"
              value={newFaqQ}
              onChange={(e) => setNewFaqQ(e.target.value)}
              placeholder="প্রশ্ন টাইপ করুন..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />

            <textarea
              rows={2}
              value={newFaqA}
              onChange={(e) => setNewFaqA(e.target.value)}
              placeholder="উত্তর টাইপ করুন..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
            >
              Add FAQ
            </button>
          </form>

          <div className="space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-black text-xs text-slate-900 dark:text-white">Q: {item.question}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">A: {item.answer}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setFaqItems(prev => prev.filter(f => f.id !== item.id))}
                  className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog / News Tab */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <form onSubmit={handleAddBlog} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-purple-500" />
              <span>নতুন আর্টিকেল / নিউজ ব্লগ পোস্ট করুন</span>
            </h3>

            <input
              type="text"
              value={newBlogTitle}
              onChange={(e) => setNewBlogTitle(e.target.value)}
              placeholder="আর্টিকেলের শিরোনাম..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />

            <textarea
              rows={4}
              value={newBlogContent}
              onChange={(e) => setNewBlogContent(e.target.value)}
              placeholder="বিস্তারিত কন্টেন্ট লিখুন..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
            >
              Publish Post
            </button>
          </form>

          <div className="space-y-3">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-purple-500 font-bold">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>By {post.author}</span>
                  </div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{post.title}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2">{post.content}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setBlogPosts(prev => prev.filter(p => p.id !== post.id))}
                  className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
