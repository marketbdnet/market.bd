import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Security & Production Headers Middleware
  app.use((req, res, next) => {
    // 301 Permanent Redirect www.marketbd.net -> marketbd.net
    const host = req.headers.host || '';
    if (host.startsWith('www.marketbd.net')) {
      return res.redirect(301, `https://marketbd.net${req.originalUrl}`);
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Powered-By', 'MarketBD.Net Engine');
    next();
  });
  const PORT = 3000;

  let ai: GoogleGenAI | null = null;
  function getAI() {
    if (!ai) {
      const key = process.env.GEMINI_API_KEY;
      if (key) {
        ai = new GoogleGenAI({ apiKey: key });
      }
    }
    return ai;
  }

  // AI Assistant endpoint
  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const { prompt, userQuery } = req.body;
      const genAI = getAI();
      
      if (!genAI) {
        return res.json({
          success: true,
          reply: `[এআই বার্তা (API Key ছাড়াই কাজ করছে)]: মার্কেট বিডি তে আপনাকে স্বাগতম! 
আপনি "${prompt || userQuery}" লিখে সার্চ করেছেন। আমাদের প্ল্যাটফর্মে ঢাকা, চট্টগ্রাম, সিলেট সহ বাংলাদেশের ৬৪টি জেলায় দ্রুত গাড়ি, মোবাইল, ফ্ল্যাট, ল্যাপটপ এবং রকমারি বই ক্রয় ও বিক্রয় করতে পারবেন।`
        });
      }

      const model = 'gemini-2.5-flash';
      const systemInstruction = `You are "Market BD Smart AI Assistant" (মার্কেট বিডি এআই সহকারী), an intelligent marketplace deal advisor & listing writer for Bangladesh's top marketplace Market-BD (a hybrid of Bikroy.com, Rokomari, Daraz, OLX, and Facebook Marketplace).
Respond in friendly, natural Bengali (বাংলা) or English as requested. Provide concise price estimates in Bangladeshi Taka (৳), smart deal tips, or generate high-converting ad descriptions for sellers. Keep formatting bulleted and easy to read.`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt || userQuery,
        config: {
          systemInstruction
        }
      });

      res.json({
        success: true,
        reply: response.text
      });
    } catch (error: any) {
      console.error('Gemini API error:', error);
      res.json({
        success: false,
        reply: 'ক্ষমা করবেন, এআই সার্ভারে কিছুটা সমস্যা দেখা দিয়েছে। তবে আপনি সাধারণ সার্চ অ্যান্ড ফিল্টার অপশন দিয়ে আপনার প্রয়োজনীয় প্রোডাক্টটি খুঁজে পেতে পারেন।'
      });
    }
  });

  // File persistence for server sync state across container reboots
  const SYNC_STATE_FILE = path.join(process.cwd(), 'server_sync_state.json');
  
  let savedFileState: any = null;
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) {
      const raw = fs.readFileSync(SYNC_STATE_FILE, 'utf-8');
      savedFileState = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Notice reading server_sync_state.json:', e);
  }

  // In-memory shared synchronized state store for Android App & Web synchronization
  const sharedSyncState: Record<string, any> = {
    siteMaintenance: {
      isMaintenance: false,
      isMasterLockdown: false,
      title: 'MarketBD.Net is Under Maintenance',
      subtitle: 'We’re making some improvements to give you a better shopping experience.',
      noticeMessage: 'We’ll be back shortly. Thank you for your patience!',
      masterLockdownTitle: '🔒 MarketBD.Net মাস্টার সিস্টেম লকডাউন (Master Lockdown)',
      masterLockdownMessage: 'সার্ভার রক্ষণাবেক্ষণ ও আপগ্রেডের জন্য সম্পূর্ণ ওয়েবসাইট সাময়িকভাবে বন্ধ রাখা হয়েছে। এই মুহূর্তে এডমিন এবং ভিজিটর কারও জন্যই সাইট উন্মুক্ত নয়।',
      masterUnlockPin: '7860',
      contactEmail: 'official.marketbd@gmail.com',
      emergencyPhone: '01533830784',
      updatedAt: new Date().toISOString()
    },
    systemNotice: {
      isEnabled: true,
      showAdPromo: true,
      showFraudWarning: true,
      customNoticeBn: '🔥 বিশেষ অফার: ভেরিফায়েড বিজনেস শপ একাউন্ট খুললেই পাচ্ছেন ৩টি প্রিমিয়াম ফেভারিট টপ অ্যাড প্রমোশন একদম ফ্রি!',
      customNoticeEn: '🔥 Special Offer: Register a Verified Business Shop today and enjoy 3 FREE Top Ad Promotions!',
      scrollSpeed: 'medium',
      contactPhone: '01533830784',
      contactEmail: 'official.marketbd@gmail.com',
    },
    paymentAccounts: null,
    clockSettings: null,
    paymentPartners: null,
    branding: null,
    appRelease: null,
    marketplace_products: null,
    products: null,
    adminActiveSession: null,
    updatedAt: new Date().toISOString(),
    ...(savedFileState || {})
  };

  function persistSyncState() {
    try {
      fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(sharedSyncState, null, 2), 'utf-8');
    } catch (e) {
      console.error('Notice persisting sync state:', e);
    }
  }

  // Synchronized state endpoints for live syncing between Android App and Website
  app.get('/api/sync/state', (_req, res) => {
    res.json({ success: true, data: sharedSyncState });
  });

  // Admin Single-Device Session Management Endpoint
  app.get('/api/admin/session', (_req, res) => {
    res.json({
      success: true,
      data: sharedSyncState.adminActiveSession || null,
      message: 'Active admin session retrieved'
    });
  });

  app.post('/api/admin/session', (req, res) => {
    try {
      const { sessionToken, userEmail, deviceName, ip } = req.body || {};
      if (!sessionToken) {
        return res.status(400).json({ success: false, message: 'sessionToken is required' });
      }

      const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '103.110.22.4';
      const userAgent = req.headers['user-agent'] || 'Web Browser';
      const parsedDevice = deviceName || (userAgent.includes('Mobile') ? 'Android / Mobile Device' : 'Desktop / PC Browser');

      sharedSyncState.adminActiveSession = {
        sessionToken,
        userEmail: userEmail || 'official.marketsbd@gmail.com',
        deviceName: parsedDevice,
        ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
        loginTime: new Date().toISOString()
      };
      sharedSyncState.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Super Admin single-device session registered successfully',
        data: sharedSyncState.adminActiveSession
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to update admin session' });
    }
  });

  app.delete('/api/admin/session', (_req, res) => {
    sharedSyncState.adminActiveSession = null;
    sharedSyncState.updatedAt = new Date().toISOString();
    res.json({ success: true, message: 'Admin session cleared' });
  });

  app.post('/api/sync/state', (req, res) => {
    try {
      const updates = req.body || {};
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          sharedSyncState[key] = updates[key];
          if (key === 'site_maintenance' || key === 'siteMaintenance') {
            sharedSyncState.siteMaintenance = updates[key];
            sharedSyncState.site_maintenance = updates[key];
          }
          if (key === 'marketplace_products' || key === 'products') {
            sharedSyncState.marketplace_products = updates[key];
            sharedSyncState.products = updates[key];
          }
        }
      });
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();
      res.json({ success: true, message: 'Sync state updated successfully', data: sharedSyncState });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Sync failed' });
    }
  });

  // REST API Endpoints for Products / Classified Ads (Compatible with Android Retrofit/Volley/Ktor & Web Fetch)
  app.get('/api/products', (req, res) => {
    try {
      let productList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const { category, sellerId, status, query } = req.query;

      if (category && typeof category === 'string') {
        productList = productList.filter(p => p.category === category);
      }
      if (sellerId && typeof sellerId === 'string') {
        productList = productList.filter(p => p.seller?.id === sellerId || p.sellerId === sellerId);
      }
      if (status && typeof status === 'string') {
        productList = productList.filter(p => p.status === status);
      }
      if (query && typeof query === 'string') {
        const q = query.toLowerCase();
        productList = productList.filter(p => 
          (p.title && p.title.toLowerCase().includes(q)) || 
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.titleBn && p.titleBn.includes(q))
        );
      }

      res.json({
        success: true,
        count: productList.length,
        data: productList,
        updatedAt: sharedSyncState.updatedAt
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    const productList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
    const found = productList.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (found) {
      res.json({ success: true, data: found });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  });

  // Post new Ad from Android App or Web
  app.post('/api/products', (req, res) => {
    try {
      const newAd = req.body;
      if (!newAd || !newAd.title) {
        return res.status(400).json({ success: false, message: 'Title is required for product' });
      }

      if (!newAd.id) {
        newAd.id = 'prod-' + Date.now();
      }
      if (!newAd.postedAt) {
        newAd.postedAt = new Date().toISOString();
      }
      if (!newAd.status) {
        newAd.status = 'active';
      }

      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      // If already exists, update; otherwise prepend
      const existingIdx = currentList.findIndex(p => p.id === newAd.id);
      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...newAd };
      } else {
        currentList = [newAd, ...currentList];
      }

      sharedSyncState.marketplace_products = currentList;
      sharedSyncState.products = currentList;
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      res.status(201).json({
        success: true,
        message: 'Product posted and synchronized successfully across Web and Android',
        data: newAd
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to post product' });
    }
  });

  // Update Ad from Android or Web
  app.put('/api/products/:id', (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const idx = currentList.findIndex(p => p.id === id);

      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], ...updateData };
        sharedSyncState.marketplace_products = currentList;
        sharedSyncState.products = currentList;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
        res.json({ success: true, message: 'Product updated successfully', data: currentList[idx] });
      } else {
        // Create if not found
        const created = { id, ...updateData, postedAt: new Date().toISOString() };
        currentList = [created, ...currentList];
        sharedSyncState.marketplace_products = currentList;
        sharedSyncState.products = currentList;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
        res.json({ success: true, message: 'Product created and synced', data: created });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to update product' });
    }
  });

  // Delete Ad from Android or Web
  app.delete('/api/products/:id', (req, res) => {
    try {
      const id = req.params.id;
      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const filtered = currentList.filter(p => p.id !== id);
      sharedSyncState.marketplace_products = filtered;
      sharedSyncState.products = filtered;
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();
      res.json({ success: true, message: 'Product deleted successfully', id });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to delete product' });
    }
  });

  // Bulk Product Sync endpoint
  app.post('/api/products/sync', (req, res) => {
    try {
      const { products } = req.body;
      if (Array.isArray(products) && products.length > 0) {
        sharedSyncState.marketplace_products = products;
        sharedSyncState.products = products;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
      }
      res.json({ success: true, count: sharedSyncState.products?.length || 0, data: sharedSyncState.products });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Bulk sync failed' });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', name: 'MarketBD.Net Enterprise API' });
  });

  // Dedicated APK Download Endpoint: forces attachment download with correct MIME type
  const sendApkBinary = (req: express.Request, res: express.Response) => {
    const rawFile = (req.params as any)?.filename || 'MarketBD.apk';
    const cleanFilename = path.basename(rawFile);
    const downloadFilename = cleanFilename.endsWith('.apk') ? cleanFilename : `${cleanFilename}.apk`;

    const searchPaths = [
      path.join(process.cwd(), 'public', cleanFilename),
      path.join(process.cwd(), 'public', 'downloads', cleanFilename),
      path.join(process.cwd(), 'public', 'MarketBD.apk'),
      path.join(process.cwd(), 'public', 'marketbd-release-v2.5.0.apk')
    ];

    const foundPath = searchPaths.find(p => fs.existsSync(p));

    if (foundPath) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(foundPath);
    }

    res.status(404).json({
      error: 'APK not found',
      message: 'MarketBD APK file is being prepared. Please try again shortly.'
    });
  };

  app.get('/api/download/apk', sendApkBinary);
  app.get('/api/download/apk/:filename', sendApkBinary);
  app.get('/MarketBD.apk', sendApkBinary);
  app.get('/marketbd-release-v2.5.0.apk', sendApkBinary);
  app.get('/downloads/:filename', sendApkBinary);

  // Dynamic Sitemap XML Endpoint
  app.get(['/sitemap.xml', '/api/sitemap'], (_req, res) => {
    const SITE_URL = 'https://marketbd.net';
    const today = new Date().toISOString().split('T')[0];

    // Popular marketplace categories
    const categories = [
      'mobiles', 'computers', 'electronics', 'vehicles', 'property',
      'furniture', 'fashion', 'health', 'pets', 'agriculture',
      'business', 'services', 'jobs', 'others', 'education'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

    // 1. Homepage
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>always</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n\n`;

    // 2. Categories
    categories.forEach(cat => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/category/${cat}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `\n`;

    // 3. Featured Products
    const sampleProducts = [
      { slug: 'vivo-v40-pro-5g-12gb-512gb-zeiss', title: 'Vivo V40 Pro 5G - ZEISS Optics', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97' },
      { slug: 'macbook-pro-m3-max-16-inch-64gb', title: 'MacBook Pro M3 Max 16-inch', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' },
      { slug: 'toyota-land-cruiser-prado-tx-l-2022', title: 'Toyota Land Cruiser Prado TX-L', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf' },
      { slug: '3-bhp-luxury-apartment-gulshan-2-dhaka', title: '3 BHK Luxury Apartment Gulshan 2', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00' }
    ];

    sampleProducts.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/ad/${p.slug}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${p.img.replace(/&/g, '&amp;')}</image:loc>\n`;
      xml += `      <image:title>${p.title.replace(/&/g, '&amp;')}</image:title>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  // Dynamic Robots.txt Endpoint
  app.get('/robots.txt', (_req, res) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://marketbd.net/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Immutable caching for hashed Vite JS/CSS assets (1 year)
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));

    // Static assets with revalidation
    app.use(express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }));

    // SPA fallback route - index.html must NEVER be cached as stale
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Market BD server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
