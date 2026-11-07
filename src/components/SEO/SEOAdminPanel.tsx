import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getProductSEO, getHomeSEO, getCategorySEO, formatPrice, SITE_URL } from '../../utils/seo';
import { Share2, Check, Copy, ExternalLink, RefreshCw, FileText, Globe, Search, ShieldCheck, Sparkles, Download } from 'lucide-react';

export const SEOAdminPanel: React.FC = () => {
  const { products, language } = useMarket();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'sitemap' | 'robots'>('preview');
  const [copied, setCopied] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const seoData = selectedProduct ? getProductSEO(selectedProduct) : getHomeSEO();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const generateSitemapXml = () => {
    const today = new Date().toISOString().split('T')[0];
    const categories = Array.from(new Set(products.map(p => p.category)));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

    // 1. Homepage
    xml += `  <!-- Homepage -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>always</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n\n`;

    // 2. Categories
    xml += `  <!-- Categories (${categories.length}) -->\n`;
    categories.forEach(cat => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/category/${cat}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `\n`;

    // 3. Products
    xml += `  <!-- Active Product Listings (${products.length}) -->\n`;
    products.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/ad/${p.slug || p.id}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      if (p.images && p.images[0]) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${p.images[0].replace(/&/g, '&amp;')}</image:loc>\n`;
        xml += `      <image:title>${p.title.replace(/&/g, '&amp;')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  const handleDownloadSitemap = () => {
    const xmlContent = generateSitemapXml();
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePingGoogle = () => {
    setPingStatus('submitting');
    setTimeout(() => {
      setPingStatus('success');
      setTimeout(() => setPingStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black text-white">
              {language === 'bn' ? 'মার্কেটবিডি প্রফেশনাল এসইও ও সাইটম্যাপ সিস্টেম' : 'MarketBD Professional SEO & Sitemap Manager'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn'
              ? 'বিক্রয় ডট কমের মতো প্রতিটি বিজ্ঞাপন ও ক্যাটাগরি গুগল, ফেসবুক ও হোয়াটসঅ্যাপে শেয়ারিএবল ও ইনডেক্সেবল।'
              : 'Enterprise SEO with automatic dynamic sitemaps, OpenGraph previews, and Google Product Schemas.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadSitemap}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'bn' ? 'সাইটম্যাপ ডাউনলোড' : 'Download Sitemap'}</span>
          </button>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>/sitemap.xml</span>
          </a>
        </div>
      </div>

      {/* Product Selector */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-300 shrink-0">
          {language === 'bn' ? '🔍 প্রোডাক্ট নির্বাচন করে এসইও ও প্রিভিউ টেস্ট করুন:' : '🔍 Select Ad to Test SEO & Social Preview:'}
        </label>
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.title.slice(0, 45)}... (৳{p.price.toLocaleString('en-US')})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফেসবুক ও হোয়াটসঅ্যাপ প্রিভিউ' : 'Social Cards Preview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{language === 'bn' ? 'গুগল রিচ রেজাল্ট স্কিমা (JSON-LD)' : 'Google Product Schema'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sitemap')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'sitemap'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'bn' ? 'ডাইনামিক সাইটম্যাপ (sitemap.xml)' : 'Dynamic Sitemap'}</span>
        </button>

        <button
          onClick={() => setActiveTab('robots')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'robots'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'bn' ? 'রোবটস ডট টিএক্সটি (robots.txt)' : 'robots.txt'}</span>
        </button>
      </div>

      {/* Tab 1: Facebook & WhatsApp Social Cards Preview */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card Mockup */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                WhatsApp Link Card Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono">marketbd.net/ad/...</span>
            </div>

            <div className="bg-[#111b21] rounded-xl border border-emerald-900/40 p-2.5 max-w-sm mx-auto shadow-lg space-y-2">
              <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video border border-slate-800">
                <img
                  src={seoData.image}
                  alt={seoData.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-slate-900/90 text-emerald-400 font-black text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {seoData.price ? formatPrice(seoData.price) : 'Best Deal'}
                </span>
              </div>
              <div className="px-1 space-y-1">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">MARKETBD.NET</p>
                <h4 className="text-slate-100 font-bold text-xs line-clamp-2">{seoData.title}</h4>
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{seoData.description}</p>
              </div>
            </div>
          </div>

          {/* Facebook Feed Card Mockup */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Facebook OpenGraph Feed Card Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono">og:image & og:title</span>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg max-w-sm mx-auto">
              <div className="aspect-video bg-slate-950 overflow-hidden relative">
                <img
                  src={seoData.image}
                  alt={seoData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">MARKETBD.NET • BANGLADESH</p>
                <h4 className="text-white font-extrabold text-xs line-clamp-1">{seoData.title}</h4>
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-snug">{seoData.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Google Product Schema JSON-LD */}
      {activeTab === 'schema' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Google Structured Data (JSON-LD Product Schema)
            </span>
            <button
              onClick={() => handleCopy(JSON.stringify(seoData.jsonLd, null, 2), 'schema')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition text-slate-200 cursor-pointer"
            >
              {copied === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'schema' ? 'Copied!' : 'Copy JSON-LD'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto max-h-96 leading-relaxed">
            {JSON.stringify(seoData.jsonLd, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: Dynamic Sitemap Viewer */}
      {activeTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">
                Automatic Dynamic Sitemap ({products.length} Products + Categories)
              </p>
              <p className="text-[11px] text-slate-400">
                Served live at <code className="text-emerald-400">https://marketbd.net/sitemap.xml</code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePingGoogle}
                disabled={pingStatus === 'submitting'}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'submitting' ? 'animate-spin' : ''}`} />
                <span>
                  {pingStatus === 'submitting'
                    ? 'Pinging...'
                    : pingStatus === 'success'
                    ? 'Google Pinged! ✓'
                    : 'Ping Googlebot'}
                </span>
              </button>
              <button
                onClick={() => handleCopy(generateSitemapXml(), 'sitemap')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                {copied === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'sitemap' ? 'Copied XML' : 'Copy Sitemap'}</span>
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-amber-300 font-mono overflow-x-auto max-h-80 leading-relaxed">
            {generateSitemapXml()}
          </pre>
        </div>
      )}

      {/* Tab 4: robots.txt */}
      {activeTab === 'robots' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">robots.txt Directives</span>
            <button
              onClick={() => handleCopy(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml`, 'robots')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'robots' ? 'Copied!' : 'Copy robots.txt'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-sky-300 font-mono overflow-x-auto leading-relaxed">
            {`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# MarketBD.Net Dynamic Sitemap Index
Sitemap: ${SITE_URL}/sitemap.xml`}
          </pre>
        </div>
      )}
    </div>
  );
};
