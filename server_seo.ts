/**
 * MarketBD.Net Server-Side SEO & Crawler Pre-rendering Engine
 * Generates dynamic meta tags, JSON-LD structured schema, and initial semantic HTML
 * for search engine crawlers (Googlebot, Bingbot, etc.) and social share cards.
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage: string;
  ogType: 'website' | 'article' | 'product';
  jsonLd: Record<string, any>[];
  preRenderedHtml: string;
}

const SITE_URL = 'https://marketbd.net';
const DEFAULT_BANNER = `${SITE_URL}/marketbd-og-banner.jpg`;
const SITE_NAME = 'MarketBD.Net';

function formatLocation(loc: any, div?: any): string {
  if (!loc) return String(div || 'ঢাকা, বাংলাদেশ');
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    const parts = [loc.area, loc.district || loc.city, loc.division].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'ঢাকা, বাংলাদেশ';
  }
  return String(loc);
}

function escapeHtml(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CATEGORY_NAMES_BN: Record<string, string> = {
  mobiles: 'মোবাইল ও ট্যাবলেট',
  computers: 'কম্পিউটার ও ল্যাপটপ',
  electronics: 'ইলেকট্রনিক্স ও গ্যাজেট',
  vehicles: 'মোটরসাইকেল ও গাড়ি',
  property: 'ফ্ল্যাট, বাড়ি ও জমি',
  furniture: 'আসবাবপত্র ও ডেকোরেশন',
  fashion: 'ফ্যাশন ও লাইফস্টাইল',
  books: 'রকমারি বই ও স্টেশনারি',
  health: 'স্বাস্থ্য ও রূপচর্চা',
  pets: 'পোষা প্রাণী ও পাখি',
  agriculture: 'কৃষি ও খামার',
  business: 'ব্যবসা ও শিল্পপণ্য',
  services: 'দৈনন্দিন ও কর্পোরেট সেবা',
  jobs: 'চাকরি ও ক্যারিয়ার',
  education: 'শিক্ষা ও প্রশিক্ষণ',
  others: 'অন্যান্য দরকারি পণ্য'
};

export function getPageMetadata(urlPath: string, products: any[]): PageMetadata {
  const cleanPath = urlPath.split('?')[0].replace(/\/$/, '') || '/';

  // 1. Single Product / Ad Page: /ad/:id, /ad/:slug, or /product/:id
  const productMatch = cleanPath.match(/^\/(?:ad|product)\/([^/]+)/);
  if (productMatch) {
    const identifier = productMatch[1];
    const product = products.find(p => p && (p.id === identifier || p.slug === identifier));

    if (product) {
      const title = `${product.title} | MarketBD.Net`;
      const desc = product.description 
        ? product.description.slice(0, 160).replace(/\s+/g, ' ') + '...'
        : `MarketBD.Net এ কিনুন ${product.title}। সেরা দাম, আসল ছবি ও বিক্রেতার সরাসরি ফোন নম্বর।`;
      const imageUrl = (Array.isArray(product.images) && product.images[0]) || product.image || DEFAULT_BANNER;
      const canonical = `${SITE_URL}/ad/${product.id}`;
      const priceFormatted = typeof product.price === 'number' ? `৳ ${product.price.toLocaleString('en-US')}` : `৳ ${product.price}`;
      const catName = CATEGORY_NAMES_BN[product.category] || product.category || 'পণ্য';

      const jsonLd = [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          image: [imageUrl],
          description: product.description || desc,
          sku: product.id,
          brand: {
            '@type': 'Brand',
            name: product.brand || 'MarketBD Verified'
          },
          offers: {
            '@type': 'Offer',
            url: canonical,
            priceCurrency: 'BDT',
            price: Number(product.price) || 0,
            availability: 'https://schema.org/InStock',
            itemCondition: product.condition === 'new' 
              ? 'https://schema.org/NewCondition' 
              : 'https://schema.org/UsedCondition',
            seller: {
              '@type': 'Person',
              name: product.sellerName || 'MarketBD Seller',
              telephone: product.sellerPhone || '+8801723230230'
            }
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'হোম', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: catName, item: `${SITE_URL}/category/${product.category}` },
            { '@type': 'ListItem', position: 3, name: product.title, item: canonical }
          ]
        }
      ];

      const preRenderedHtml = `
        <article class="p-6 max-w-4xl mx-auto font-sans">
          <nav aria-label="Breadcrumb" class="text-sm text-slate-500 mb-4">
            <a href="/" class="hover:underline">হোম</a> &gt; 
            <a href="/category/${escapeHtml(product.category || 'all')}" class="hover:underline">${escapeHtml(catName)}</a> &gt; 
            <span>${escapeHtml(product.title)}</span>
          </nav>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-2">${escapeHtml(product.title)}</h1>
          <div class="text-2xl font-black text-emerald-600 mb-4">${escapeHtml(priceFormatted)}</div>
          <div class="mb-6">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.title)}" class="max-w-full h-auto rounded-2xl shadow-md border" />
          </div>
          <div class="mb-6 space-y-2 text-slate-700 leading-relaxed">
            <h2 class="text-lg font-bold text-slate-800">পণ্যের বিবরণ:</h2>
            <p>${escapeHtml(product.description || desc)}</p>
          </div>
          <div class="bg-slate-100 p-4 rounded-xl space-y-1 text-sm text-slate-800">
            <p><strong>অবস্থান:</strong> ${escapeHtml(formatLocation(product.location, product.division))}</p>
            <p><strong>কন্ডিশন:</strong> ${product.condition === 'new' ? 'নতুন (Brand New)' : 'ব্যবহৃত (Used)'}</p>
            <p><strong>বিক্রেতার নাম:</strong> ${escapeHtml(product.sellerName || 'ভেরিফাইড বিক্রেতা')}</p>
            ${product.sellerPhone ? `<p><strong>যোগাযোগের নম্বর:</strong> <a href="tel:${escapeHtml(product.sellerPhone)}" class="text-emerald-600 font-bold">${escapeHtml(product.sellerPhone)}</a></p>` : ''}
          </div>
        </article>
      `;

      return {
        title,
        description: desc,
        keywords: `${product.title}, ${catName}, buy ${product.title} Bangladesh, second hand price BD, MarketBD`,
        canonicalUrl: canonical,
        ogImage: imageUrl,
        ogType: 'product',
        jsonLd,
        preRenderedHtml
      };
    }
  }

  // 2. About Us & Contact Page: /about or /contact
  if (cleanPath === '/about' || cleanPath === '/contact') {
    const title = 'আমাদের পরিচয় ও যোগাযোগ মাধ্যম | About Us & Contact | MarketBD.Net';
    const description = 'MarketBD.Net এর প্রধান কার্যালয়ের ঠিকানা (লেভেল ৫, ফরচুন শপিং মল, ঢাকা-১০০০), হেল্পলাইন নম্বর (+880 1723-230230) এবং অফিসিয়াল ইমেইল (official.marketbd@gmail.com)।';
    const canonical = `${SITE_URL}${cleanPath}`;

    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: DEFAULT_BANNER,
        telephone: '+8801723230230',
        email: 'official.marketbd@gmail.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Level 5, Fortune Shopping Mall, Malibagh / Motijheel Commercial Area',
          addressLocality: 'Dhaka',
          postalCode: '1000',
          addressCountry: 'BD'
        }
      }
    ];

    const preRenderedHtml = `
      <div class="max-w-4xl mx-auto p-6 font-sans">
        <h1 class="text-3xl font-black text-slate-900 mb-4">MarketBD.Net এর পরিচয় ও যোগাযোগ</h1>
        <p class="text-slate-700 leading-relaxed mb-6">MarketBD.Net বাংলাদেশের সবচেয়ে নিরাপদ ও দ্রুত বর্ধনশীল অনলাইন মার্কেটপ্লেস। দেশের ৬৪ জেলার যে কোনো প্রান্ত থেকে সরাসরি কেনাবেচা করুন।</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50 border rounded-2xl">
            <h2 class="font-bold text-emerald-600">হটলাইন ও হোয়াটসঅ্যাপ:</h2>
            <p class="font-bold text-slate-800 text-lg">+880 1723-230230</p>
            <p class="text-slate-500 text-xs">+880 1634-025151 (হেল্পডেস্ক)</p>
          </div>
          <div class="p-4 bg-slate-50 border rounded-2xl">
            <h2 class="font-bold text-sky-600">অফিসিয়াল ইমেইল:</h2>
            <p class="font-bold text-slate-800">official.marketbd@gmail.com</p>
            <p class="text-slate-500 text-xs">support@marketbd.net</p>
          </div>
          <div class="p-4 bg-slate-50 border rounded-2xl">
            <h2 class="font-bold text-amber-600">প্রধান কার্যালয়ের ঠিকানা:</h2>
            <p class="text-slate-800">Level 5, Fortune Shopping Mall, Malibagh / Motijheel Commercial Area, Dhaka-1000, Bangladesh</p>
          </div>
          <div class="p-4 bg-slate-50 border rounded-2xl">
            <h2 class="font-bold text-purple-600">কাস্টমার কেয়ার সময়:</h2>
            <p class="text-slate-800 font-bold">সকাল ৯:০০ - রাত ১০:০০ BST (শনিবার - শুক্রবার, সপ্তাহে ৭ দিন)</p>
          </div>
        </div>
      </div>
    `;

    return {
      title,
      description,
      keywords: 'MarketBD contact, MarketBD phone number, MarketBD office address, MarketBD helpline Dhaka',
      canonicalUrl: canonical,
      ogImage: DEFAULT_BANNER,
      ogType: 'article',
      jsonLd,
      preRenderedHtml
    };
  }

  // 3. Privacy Policy Page: /privacy or /privacy-policy
  if (cleanPath === '/privacy' || cleanPath === '/privacy-policy') {
    const title = 'গোপনীয়তা ও প্রাইভেসী পলিসি | Privacy Policy | MarketBD.Net';
    const description = 'MarketBD.Net এ আপনার তথ্যের গোপনীয়তা ও সুরক্ষা নিশ্চিত করার অঙ্গীকার। গুগল ক্লাউড ফায়ারবেস এনক্রিপশন ও সাইবার নিরাপত্তা নীতিমালা।';
    const canonical = `${SITE_URL}/privacy`;

    const preRenderedHtml = `
      <div class="max-w-4xl mx-auto p-6 font-sans">
        <h1 class="text-3xl font-black text-slate-900 mb-4">গোপনীয়তা ও প্রাইভেসী পলিসি (Privacy Policy)</h1>
        <p class="text-xs text-slate-500 mb-6">সর্বশেষ হালনাগাদ: মার্চ ২০২৬ | MarketBD.Net</p>
        <div class="space-y-4 text-slate-700 leading-relaxed">
          <h2 class="font-bold text-lg text-slate-900">১. তথ্য সংগ্রহ ও ব্যবহার</h2>
          <p>অ্যাকাউন্ট নিবন্ধন, বিজ্ঞাপন প্রকাশ এবং যোগাযোগের সুবিধার্থে আমরা নাম, মোবাইল নম্বর, ইমেইল ও বিজ্ঞাপনের বিবরণ সংগ্রহ করি।</p>
          <h2 class="font-bold text-lg text-slate-900">২. ডেটা স্টোরেজ ও ক্লাউড নিরাপত্তা</h2>
          <p>সকল তথ্য Google Cloud Firebase Firestore ডাটাবেসে AES-256 এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে।</p>
          <h2 class="font-bold text-lg text-slate-900">৩. কোনো তথ্য বিক্রি করা হয় না</h2>
          <p>MarketBD.Net কোনো অবস্থাতেই ব্যবহারকারীদের ব্যক্তিগত ফোন নম্বর বা ইমেইল বিজ্ঞাপনদাতা বা তৃতীয় পক্ষের কাছে বিক্রি করে না।</p>
          <h2 class="font-bold text-lg text-slate-900">৪. অ্যাকাউন্ট ও ডেটা ডিলিশন</h2>
          <p>ব্যবহারকারী যেকোনো সময় তার বিজ্ঞাপন এবং অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলতে পারেন support@marketbd.net এ রিকোয়েস্ট করে।</p>
        </div>
      </div>
    `;

    return {
      title,
      description,
      canonicalUrl: canonical,
      ogImage: DEFAULT_BANNER,
      ogType: 'article',
      jsonLd: [],
      preRenderedHtml
    };
  }

  // 4. Terms of Service Page: /terms or /terms-of-service
  if (cleanPath === '/terms' || cleanPath === '/terms-of-service') {
    const title = 'ব্যবহারের সাধারণ শর্তাবলী | Terms of Service | MarketBD.Net';
    const description = 'MarketBD.Net ব্যবহারের শর্তাবলী ও নীতি - বিজ্ঞাপনের নিয়মাবলী, নিষিদ্ধ পণ্যের তালিকা, ৩ মাস পর স্বয়ংক্রিয় বিজ্ঞাপন অপসারণ ও লেনদেন সতর্কতা।';
    const canonical = `${SITE_URL}/terms`;

    const preRenderedHtml = `
      <div class="max-w-4xl mx-auto p-6 font-sans">
        <h1 class="text-3xl font-black text-slate-900 mb-4">ব্যবহারের সাধারণ শর্তাবলী (Terms of Service)</h1>
        <p class="text-xs text-slate-500 mb-6">কার্যকর তারিখ: মার্চ ২০২৬ | MarketBD.Net</p>
        <div class="space-y-4 text-slate-700 leading-relaxed">
          <h2 class="font-bold text-lg text-slate-900">১. শর্তাবলীতে সম্মতি</h2>
          <p>MarketBD.Net ওয়েবসাইট বা মোবাইল অ্যাপ ব্যবহারের মাধ্যমে আপনি এই সকল শর্তাবলী মেনে নিতে সম্মত হয়েছেন।</p>
          <h2 class="font-bold text-lg text-slate-900">২. নিষিদ্ধ পণ্যসমূহ</h2>
          <p>অস্ত্র, মাদক, চোরাই পণ্য, নকল সামগ্রী এবং প্রতারণামূলক আর্থিক অফার পোস্ট করা কঠোরভাবে নিষিদ্ধ।</p>
          <h2 class="font-bold text-lg text-slate-900">৩. লেনদেন ও দায়মুক্তি</h2>
          <p>MarketBD.Net মধ্যস্থতাকারী প্ল্যাটফর্ম। সরাসরি পণ্য সামনাসামনি যাচাই করে টাকা লেনদেন করুন, অগ্রিম পেমেন্ট দেওয়া থেকে বিরত থাকুন।</p>
          <h2 class="font-bold text-lg text-slate-900">৪. ৩ মাস পর স্বয়ংক্রিয় বিজ্ঞাপন অপসারণ</h2>
          <p>ক্যাটালগের সতেজতা বজায় রাখতে ৯০ দিন পর পুরনো বিজ্ঞাপন স্বয়ংক্রিয়ভাবে আর্কাইভ বা মুছে ফেলা হয়।</p>
        </div>
      </div>
    `;

    return {
      title,
      description,
      canonicalUrl: canonical,
      ogImage: DEFAULT_BANNER,
      ogType: 'article',
      jsonLd: [],
      preRenderedHtml
    };
  }

  // 5. Category Page: /category/:catId
  const catMatch = cleanPath.match(/^\/category\/([^/]+)/);
  if (catMatch) {
    const catId = catMatch[1];
    const catName = CATEGORY_NAMES_BN[catId] || catId;
    const catProducts = products.filter(p => p && p.category === catId).slice(0, 12);
    const title = `${catName} ক্রয়-বিক্রয় | Best Deals on ${catName} | MarketBD.Net`;
    const description = `বাংলাদেশের ৬৪ জেলায় সেরা দামে ${catName} কিনুন ও বিক্রি করুন। যাচাইকৃত বিক্রেতা, আসল ছবি ও সরাসরি ফোন নম্বর সহ সাশ্রয়ী মূল্যে MarketBD.Net এ।`;
    const canonical = `${SITE_URL}/category/${catId}`;

    const itemsHtml = catProducts.map(p => `
      <div class="p-4 border rounded-2xl bg-white shadow-sm">
        <a href="/ad/${p.id}">
          <h2 class="font-bold text-slate-900 hover:text-emerald-600">${escapeHtml(p.title)}</h2>
          <p class="text-emerald-600 font-black mt-1">৳ ${Number(p.price || 0).toLocaleString('en-US')}</p>
          <p class="text-xs text-slate-500">${escapeHtml(formatLocation(p.location, p.division))}</p>
        </a>
      </div>
    `).join('');

    const preRenderedHtml = `
      <div class="max-w-5xl mx-auto p-6 font-sans">
        <h1 class="text-3xl font-black text-slate-900 mb-2">${escapeHtml(catName)}</h1>
        <p class="text-slate-600 mb-6">${escapeHtml(description)}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${itemsHtml || '<p class="text-slate-500">এই ক্যাটাগরিতে নতুন পণ্য দ্রুত যুক্ত হচ্ছে...</p>'}
        </div>
      </div>
    `;

    return {
      title,
      description,
      keywords: `${catName}, buy ${catName} Bangladesh, cheap ${catName} Dhaka, MarketBD`,
      canonicalUrl: canonical,
      ogImage: DEFAULT_BANNER,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: catName,
          itemListElement: catProducts.map((p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `${SITE_URL}/ad/${p.id}`,
            name: p.title
          }))
        }
      ],
      preRenderedHtml
    };
  }

  // 6. Default Homepage: /
  const title = 'MarketBD.Net - বাংলাদেশের ১ নম্বর অনলাইন মার্কেটপ্লেস | Buy & Sell Online in Bangladesh';
  const description = 'MarketBD.Net - বাংলাদেশের সবচেয়ে বড় এবং নিরাপদ অনলাইন মার্কেটপ্লেস। ঢাকা, চট্টগ্রাম, সিলেট সহ ৬৪ জেলায় সহজে নতুন ও সেকেন্ড হ্যান্ড মোবাইল, ল্যাপটপ, গাড়ি, ফ্ল্যাট ও ঘড়ি ক্রয়-বিক্রয় করুন।';
  const canonical = `${SITE_URL}/`;
  const topProducts = products.slice(0, 16);

  const productCardsHtml = topProducts.map(p => `
    <article class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
      <a href="/ad/${p.id}" class="block">
        <h2 class="text-sm font-bold text-slate-900 line-clamp-1 hover:text-emerald-600">${escapeHtml(p.title)}</h2>
        <div class="text-emerald-600 font-extrabold text-sm mt-1">৳ ${Number(p.price || 0).toLocaleString('en-US')}</div>
        <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(formatLocation(p.location, p.division))}</div>
      </a>
    </article>
  `).join('');

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_BANNER,
      telephone: '+8801723230230',
      email: 'official.marketbd@gmail.com',
      sameAs: [
        'https://facebook.com/MarketBD.Net',
        'https://marketbd.net'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Featured Marketplace Products in Bangladesh',
      numberOfItems: topProducts.length,
      itemListElement: topProducts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/ad/${p.id}`,
        name: p.title
      }))
    }
  ];

  const preRenderedHtml = `
    <main class="max-w-6xl mx-auto p-4 md:p-6 font-sans">
      <header class="text-center py-6">
        <h1 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">MarketBD.Net - বাংলাদেশের ১ নম্বর অনলাইন মার্কেটপ্লেস</h1>
        <p class="text-sm md:text-base text-slate-600 mt-2 max-w-2xl mx-auto">ঢাকা, চট্টগ্রাম, সিলেট সহ ৬৪ জেলায় সহজে ভেরিফাইড বিক্রেতাদের কাছ থেকে সেরা দামে মোবাইল, ল্যাপটপ, গাড়ি, ফ্ল্যাট ও ঘড়ি ক্রয়-বিক্রয় করুন।</p>
      </header>

      <section class="my-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4 border-b pb-2">জনপ্রিয় ক্যাটাগরি সমূহ</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
          ${Object.entries(CATEGORY_NAMES_BN).slice(0, 12).map(([id, name]) => `
            <a href="/category/${id}" class="p-3 bg-slate-100 hover:bg-emerald-50 rounded-xl border font-bold text-slate-800 hover:text-emerald-700">${escapeHtml(name)}</a>
          `).join('')}
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-xl font-bold text-slate-800 mb-4 border-b pb-2">তাজা বিজ্ঞাপন ও সেরা ডিলস</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          ${productCardsHtml}
        </div>
      </section>

      <footer class="mt-12 pt-8 border-t text-xs text-slate-500 text-center space-y-2">
        <div class="flex justify-center gap-4 font-bold text-slate-700">
          <a href="/about" class="hover:underline">আমাদের সম্পর্কে ও যোগাযোগ</a> •
          <a href="/terms" class="hover:underline">ব্যবহারের শর্তাবলী</a> •
          <a href="/privacy" class="hover:underline">প্রাইভেসি পলিসি</a> •
          <a href="/help" class="hover:underline">সাহায্য কেন্দ্র</a>
        </div>
        <p>© 2026 MarketBD.Net. সর্বস্বত্ব সংরক্ষিত। হটলাইন: +880 1723-230230 | ইমেইল: official.marketbd@gmail.com</p>
      </footer>
    </main>
  `;

  return {
    title,
    description,
    keywords: 'MarketBD.Net, MarketBD, online shopping Bangladesh, buy sell mobiles, laptop price BD, used cars Dhaka, property Bangladesh, verified sellers Bangladesh',
    canonicalUrl: canonical,
    ogImage: DEFAULT_BANNER,
    ogType: 'website',
    jsonLd,
    preRenderedHtml
  };
}

/**
 * Injects SEO meta tags, title, json-ld schemas and pre-rendered semantic HTML into index.html
 */
export function injectSeoIntoHtml(html: string, metadata: PageMetadata): string {
  let result = html;

  // Replace Title
  result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);

  // Replace Description
  result = result.replace(
    /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`
  );

  // Replace Keywords if available
  if (metadata.keywords) {
    result = result.replace(
      /<meta\s+name=["']keywords["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(metadata.keywords)}" />`
    );
  }

  // Replace Canonical Link
  result = result.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`
  );

  // Replace OG tags
  result = result.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`
  );
  result = result.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`
  );
  result = result.replace(
    /<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(metadata.ogImage)}" />`
  );
  result = result.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />`
  );

  // Replace Twitter tags
  result = result.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`
  );
  result = result.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`
  );
  result = result.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(metadata.ogImage)}" />`
  );

  // Only override Google Search Console verification tag if environment variable is explicitly provided
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    result = result.replace(
      /<meta\s+name=["']google-site-verification["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}" />`
    );
  }

  // Inject JSON-LD Structured Data right before </head>
  if (metadata.jsonLd && metadata.jsonLd.length > 0) {
    const jsonLdTags = metadata.jsonLd.map(schema => 
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n    ');
    result = result.replace('</head>', `    ${jsonLdTags}\n  </head>`);
  }

  // Pre-render semantic HTML inside <div id="root"> for web crawlers
  if (metadata.preRenderedHtml) {
    // When React loads, hydrate/mount will replace or enhance this DOM
    result = result.replace(
      '<div id="root"></div>',
      `<div id="root">\n${metadata.preRenderedHtml}\n</div>`
    );
  }

  return result;
}
