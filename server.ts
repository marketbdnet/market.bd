import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { CANONICAL_400_PRODUCTS } from './src/data/canonicalCatalog400';
import { KNOWN_JUNK_PRODUCT_IDS } from './src/utils/knownJunkProductIds';
import { getPageMetadata, injectSeoIntoHtml } from './server_seo';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc, onSnapshot, setLogLevel } from 'firebase/firestore';

try {
  setLogLevel('error');
} catch {
  // Ignore in environments where not supported
}

dotenv.config();

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.filter(x => x !== undefined).map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    if (obj[k] !== undefined) {
      clean[k] = sanitizeForFirestore(obj[k]);
    }
  }
  return clean;
}

async function startServer() {
  const app = express();
  app.use(compression());
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
      const systemInstruction = `You are "Market BD Smart AI Assistant" (মার্কেট বিডি এআই সহকারী), an intelligent marketplace deal advisor & listing writer for Bangladesh's premier verified online marketplace MarketBD.Net.
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

  // Build authoritative product catalog for server sync state
  const canonicalMap = new Map<string, any>();
  CANONICAL_400_PRODUCTS.forEach(p => {
    if (p && p.id) canonicalMap.set(p.id, { ...p, status: 'active', isApproved: true, isActive: true });
  });

  if (savedFileState) {
    const rawList = savedFileState.marketplace_products || savedFileState.products || [];
    if (Array.isArray(rawList)) {
      rawList.forEach((p: any) => {
        if (p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id)) {
          const existing = canonicalMap.get(p.id);
          if (existing) {
            canonicalMap.set(p.id, { ...existing, ...p });
          } else {
            canonicalMap.set(p.id, p);
          }
        }
      });
    }
  }

  const initialAuthoritativeProducts = Array.from(canonicalMap.values());

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
    marketplace_products: initialAuthoritativeProducts,
    products: initialAuthoritativeProducts,
    adminActiveSession: null,
    adminStaffAccounts: [
      {
        id: 'staff-master-super',
        name: 'Official Super Admin',
        email: 'official.marketbd@gmail.com',
        phone: '+8801723230230',
        role: 'Super Admin',
        status: 'Active',
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        lastLoginIp: '103.110.22.4',
        createdAt: '2025-01-01T00:00:00.000Z',
        createdBy: 'System Root'
      },
      {
        id: 'staff-sec-01',
        name: 'Chief Security Officer',
        email: 'security@marketbd.net',
        phone: '+8801634025151',
        role: 'Security Admin',
        status: 'Active',
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        lastLoginIp: '103.110.22.18',
        createdAt: '2025-02-15T00:00:00.000Z',
        createdBy: 'official.marketbd@gmail.com'
      },
      {
        id: 'staff-fin-01',
        name: 'Payment Verification Officer',
        email: 'payments@marketbd.net',
        phone: '+8801533830784',
        role: 'Payment Admin',
        status: 'Active',
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        lastLoginIp: '103.110.22.35',
        createdAt: '2025-03-01T00:00:00.000Z',
        createdBy: 'official.marketbd@gmail.com'
      }
    ],
    securityEvents: [
      {
        id: 'sec-ev-1',
        type: 'login_success',
        adminEmail: 'official.marketbd@gmail.com',
        ip: '103.110.22.4',
        device: 'Desktop / PC Browser',
        details: 'Super Admin successfully authenticated with 2-Step OTP Verification',
        timestamp: new Date().toISOString(),
        severity: 'low'
      }
    ],
    updatedAt: new Date().toISOString(),
    ...(savedFileState || {})
  };

  // Re-verify after spread that marketplace_products is non-empty and valid
  sharedSyncState.marketplace_products = initialAuthoritativeProducts;
  sharedSyncState.products = initialAuthoritativeProducts;

  function persistSyncState() {
    try {
      fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(sharedSyncState, null, 2), 'utf-8');
    } catch (e) {
      console.error('Notice persisting sync state:', e);
    }
  }

  // Initialize Firestore on Server for unified Web & Android synchronization
  let serverDb: any = null;
  try {
    const fbConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(fbConfigPath)) {
      const fbConfig = JSON.parse(fs.readFileSync(fbConfigPath, 'utf8'));
      const fbApp = !getApps().length ? initializeApp(fbConfig) : getApp();
      serverDb = getFirestore(fbApp, fbConfig.firestoreDatabaseId || undefined);
      console.log('[Server] Connected to Firestore database:', fbConfig.firestoreDatabaseId || 'default');

      // Realtime authoritative listener on Firestore products collection for instant cross-device Web & Android sync
      onSnapshot(collection(serverDb, 'products'), (snapshot) => {
        let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
        const listMap = new Map<string, any>();
        currentList.forEach(p => { if (p && p.id) listMap.set(p.id, p); });

        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          if (d && docSnap.id) {
            const existing = listMap.get(docSnap.id);
            listMap.set(docSnap.id, existing ? { ...existing, ...d } : { ...d, id: docSnap.id });
          }
        });

        snapshot.docChanges().forEach(change => {
          if (change.type === 'removed') {
            listMap.delete(change.doc.id);
          }
        });

        const merged = Array.from(listMap.values()).sort((a, b) => 
          new Date(b.postedAt || b.publishedAt || 0).getTime() - new Date(a.postedAt || a.publishedAt || 0).getTime()
        );
        sharedSyncState.marketplace_products = merged;
        sharedSyncState.products = merged;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
      }, (err) => {
        console.warn('[Server] Notice on Firestore products realtime listener:', err?.message || err);
      });
    }
  } catch (err) {
    console.warn('[Server] Firestore init notice:', err);
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

  // Enterprise RBAC & Security Center Endpoints
  app.get('/api/admin/roles', (_req, res) => {
    res.json({
      success: true,
      roles: [
        'Super Admin',
        'Security Admin',
        'Marketplace Admin',
        'Payment Admin',
        'User Admin',
        'Order Admin',
        'Content/Category Admin',
        'Support Admin',
        'Analyst / Read Only'
      ]
    });
  });

  app.get('/api/admin/staff', (_req, res) => {
    res.json({
      success: true,
      data: sharedSyncState.adminStaffAccounts || []
    });
  });

  app.post('/api/admin/staff', (req, res) => {
    try {
      const { name, email, phone, role, customPermissions } = req.body || {};
      if (!name || !email || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
      }

      const newStaff = {
        id: 'staff-' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        role,
        customPermissions: customPermissions || [],
        status: 'Active',
        mfaEnabled: role === 'Super Admin' || role === 'Security Admin',
        createdAt: new Date().toISOString(),
        createdBy: 'official.marketbd@gmail.com'
      };

      if (!Array.isArray(sharedSyncState.adminStaffAccounts)) {
        sharedSyncState.adminStaffAccounts = [];
      }
      sharedSyncState.adminStaffAccounts.push(newStaff);
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      res.json({ success: true, message: 'Staff member created successfully', data: newStaff });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to create staff account' });
    }
  });

  app.put('/api/admin/staff/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};
      if (!Array.isArray(sharedSyncState.adminStaffAccounts)) {
        return res.status(404).json({ success: false, message: 'Staff account not found' });
      }

      const idx = sharedSyncState.adminStaffAccounts.findIndex((s: any) => s.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Staff account not found' });
      }

      sharedSyncState.adminStaffAccounts[idx] = {
        ...sharedSyncState.adminStaffAccounts[idx],
        ...updates
      };
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      res.json({ success: true, message: 'Staff account updated', data: sharedSyncState.adminStaffAccounts[idx] });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to update staff account' });
    }
  });

  app.delete('/api/admin/staff/:id', (req, res) => {
    try {
      const { id } = req.params;
      if (!Array.isArray(sharedSyncState.adminStaffAccounts)) {
        return res.status(404).json({ success: false, message: 'Staff account not found' });
      }

      sharedSyncState.adminStaffAccounts = sharedSyncState.adminStaffAccounts.filter((s: any) => s.id !== id);
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      res.json({ success: true, message: 'Staff account removed' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to remove staff account' });
    }
  });

  app.get('/api/admin/security/events', (_req, res) => {
    res.json({
      success: true,
      data: sharedSyncState.securityEvents || []
    });
  });

  app.post('/api/admin/security/events', (req, res) => {
    try {
      const newEvent = req.body;
      if (!Array.isArray(sharedSyncState.securityEvents)) {
        sharedSyncState.securityEvents = [];
      }
      sharedSyncState.securityEvents.unshift({
        id: 'sec-ev-' + Date.now(),
        timestamp: new Date().toISOString(),
        ...newEvent
      });
      if (sharedSyncState.securityEvents.length > 200) {
        sharedSyncState.securityEvents = sharedSyncState.securityEvents.slice(0, 200);
      }
      persistSyncState();
      res.json({ success: true, message: 'Security event recorded' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post('/api/admin/verify-sensitive', (req, res) => {
    try {
      const { pin, action, targetId } = req.body || {};
      const validPins = ['016340', '123456', 'Ai01634025151', '01723230230'];
      const isValid = validPins.includes(String(pin || '').trim());

      if (!isValid) {
        return res.status(403).json({ success: false, message: 'Invalid 2FA / Security PIN' });
      }

      res.json({ success: true, message: 'Action verified and authorized' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
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

  // Helper to sanitize product phone numbers based on seller's privacy preference
  function sanitizeProductForPublic(product: any, callerUserId?: string, isAdmin?: boolean) {
    if (!product) return product;
    const isOwner = callerUserId && (product.seller?.id === callerUserId || product.sellerId === callerUserId);
    const isPhoneVisible = Boolean(
      product.showPhoneNumber === true ||
      product.seller?.showPhoneNumber === true ||
      (product.seller?.hidePhone === false && product.seller?.showPhoneNumber !== false)
    );

    if (isAdmin || isOwner || isPhoneVisible) {
      return product;
    }

    // Hide phone number for buyer privacy
    const rawPhone = product.seller?.phone || '';
    const masked = rawPhone.length >= 7 
      ? `${rawPhone.substring(0, 3)}*****${rawPhone.slice(-3)}`
      : '017*****000';

    return {
      ...product,
      seller: {
        ...product.seller,
        phone: masked,
        hidePhone: true,
        showPhoneNumber: false
      }
    };
  }

  // Route to download clean canonical catalog directly
  app.get('/api/canonical-catalog-raw', (_req, res) => {
    const catalogPath = path.join(process.cwd(), 'src', 'data', 'canonicalCatalog400.ts');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(catalogPath);
  });

  // REST API Endpoints for Products / Classified Ads (Compatible with Android Retrofit/Volley/Ktor & Web Fetch)
  app.get('/api/products', (req, res) => {
    try {
      let rawList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      // Clean invalid stubs
      let productList = rawList.filter(p => p && p.id && p.title && p.title.trim() !== '' && !KNOWN_JUNK_PRODUCT_IDS.includes(p.id));

      const { category, sellerId, status, query, userId, role } = req.query;
      const isAdmin = role === 'admin';
      const callerUserId = typeof userId === 'string' ? userId : undefined;

      if (category && typeof category === 'string') {
        productList = productList.filter(p => p.category === category);
      }
      if (sellerId && typeof sellerId === 'string') {
        productList = productList.filter(p => p.seller?.id === sellerId || p.sellerId === sellerId);
      }
      if (status && typeof status === 'string') {
        if (status === 'all') {
          // Return all products if specifically requested or admin
        } else if (status === 'active' || status === 'approved') {
          productList = productList.filter(p => p.status === 'active' || p.status === 'approved' || (!p.status && !p.moderationStatus));
        } else if (status === 'pending') {
          productList = productList.filter(p => p.status === 'pending' || p.status === 'under_review' || p.status === 'in_review');
        } else {
          productList = productList.filter(p => p.status === status);
        }
      } else if (!isAdmin && !sellerId) {
        // Public feed on Website & Android App: only show active/approved ads.
        // Pending ads remain in Admin Pending queue until Admin Approves.
        productList = productList.filter(p => {
          const rawStatus = (p.status || '').toLowerCase();
          const rawMod = (p.moderationStatus || '').toLowerCase();
          if (rawStatus === 'pending' || rawStatus === 'under_review' || rawStatus === 'in_review' || rawMod === 'pending' || rawStatus === 'rejected' || rawMod === 'rejected') {
            return false;
          }
          return p.status === 'active' || p.status === 'approved' || p.isActive === true || p.isApproved === true || (!p.status && !p.moderationStatus);
        });
      }
      if (query && typeof query === 'string') {
        const q = query.toLowerCase();
        productList = productList.filter(p => 
          (p.title && p.title.toLowerCase().includes(q)) || 
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.titleBn && p.titleBn.includes(q))
        );
      }

      // Apply phone privacy filtering
      const sanitizedList = productList.map(p => sanitizeProductForPublic(p, callerUserId, isAdmin));

      res.json({
        success: true,
        count: sanitizedList.length,
        data: sanitizedList,
        products: sanitizedList,
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
      const { userId, role } = req.query;
      const isAdmin = role === 'admin';
      const callerUserId = typeof userId === 'string' ? userId : undefined;
      res.json({ success: true, data: sanitizeProductForPublic(found, callerUserId, isAdmin) });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  });

  // Post new Ad from Android App or Web
  app.post('/api/products', async (req, res) => {
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
        newAd.status = 'pending';
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

      // Write directly to Firestore document for instant realtime sync on Android & Web
      if (serverDb) {
        try {
          const cleanDoc = sanitizeForFirestore(newAd);
          setDoc(doc(serverDb, 'products', newAd.id), cleanDoc, { merge: true }).catch((fErr: any) => {
            console.error('[Server] Error syncing product to Firestore:', fErr);
          });
        } catch (fErr) {
          console.error('[Server] Error syncing product to Firestore:', fErr);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Product posted and synchronized successfully across Web and Android in Firestore',
        data: newAd
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to post product' });
    }
  });

  // Update Ad from Android or Web (e.g. Admin Approval, edit, or status change)
  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const idx = currentList.findIndex(p => p.id === id);
      let targetProduct: any;

      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], ...updateData };
        targetProduct = currentList[idx];
        sharedSyncState.marketplace_products = currentList;
        sharedSyncState.products = currentList;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
      } else {
        // Create if not found
        targetProduct = { id, ...updateData, postedAt: new Date().toISOString() };
        currentList = [targetProduct, ...currentList];
        sharedSyncState.marketplace_products = currentList;
        sharedSyncState.products = currentList;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
      }

      // Update Firestore document for instant realtime sync
      if (serverDb) {
        try {
          const cleanDoc = sanitizeForFirestore(targetProduct);
          setDoc(doc(serverDb, 'products', id), cleanDoc, { merge: true }).catch((fErr: any) => {
            console.error('[Server] Error updating product in Firestore:', fErr);
          });
        } catch (fErr) {
          console.error('[Server] Error updating product in Firestore:', fErr);
        }
      }

      res.json({ success: true, message: 'Product updated and synced in Firestore successfully', data: targetProduct });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to update product' });
    }
  });

  // Delete Ad from Android or Web
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = req.params.id;
      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const filtered = currentList.filter(p => p.id !== id);
      sharedSyncState.marketplace_products = filtered;
      sharedSyncState.products = filtered;
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      if (serverDb) {
        try {
          deleteDoc(doc(serverDb, 'products', id)).catch((fErr: any) => {
            console.error('[Server] Error deleting product from Firestore:', fErr);
          });
        } catch (fErr) {
          console.error('[Server] Error deleting product from Firestore:', fErr);
        }
      }

      res.json({ success: true, message: 'Product deleted and synced successfully', id });
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

  // Admin Activity Logging API
  app.get('/api/admin/logs', (req, res) => {
    try {
      const logs = sharedSyncState.admin_logs || [];
      res.json({ success: true, count: logs.length, data: logs });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to fetch admin logs' });
    }
  });

  app.post('/api/admin/logs', (req, res) => {
    try {
      const newLog = req.body;
      if (newLog && newLog.id) {
        if (!Array.isArray(sharedSyncState.admin_logs)) {
          sharedSyncState.admin_logs = [];
        }
        sharedSyncState.admin_logs = [newLog, ...sharedSyncState.admin_logs.filter((l: any) => l.id !== newLog.id)];
        persistSyncState();
      }
      res.json({ success: true, message: 'Admin activity log saved', data: newLog });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to save admin log' });
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

  // Google Search Console HTML File Verification Endpoint
  app.get('/google:code.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(`google-site-verification: google${req.params.code}.html`);
  });

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

    // Core static policy & contact pages
    const staticPages = [
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.7', changefreq: 'monthly' },
      { path: '/terms', priority: '0.7', changefreq: 'monthly' },
      { path: '/help', priority: '0.7', changefreq: 'monthly' }
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
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${SITE_URL}/marketbd-og-banner.jpg</image:loc>\n`;
    xml += `      <image:title>MarketBD.Net Official Marketplace</image:title>\n`;
    xml += `    </image:image>\n`;
    xml += `  </url>\n\n`;

    // 2. Core Static Pages
    staticPages.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}${p.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `\n`;

    // 3. Categories
    categories.forEach(cat => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/category/${cat}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `\n`;

    // 4. Products Catalog
    const allProducts = (sharedSyncState.products && sharedSyncState.products.length > 0)
      ? sharedSyncState.products
      : initialAuthoritativeProducts;

    allProducts.forEach((p: any) => {
      if (!p || !p.id) return;
      const cleanSlug = p.slug || p.id;
      const imgUrl = (Array.isArray(p.images) && p.images[0]) || p.image;
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/ad/${cleanSlug}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      if (imgUrl) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${imgUrl.replace(/&/g, '&amp;')}</image:loc>\n`;
        xml += `      <image:title>${(p.title || 'MarketBD Ad').replace(/&/g, '&amp;')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Dynamic Robots.txt Endpoint
  app.get('/robots.txt', (_req, res) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://marketbd.net/sitemap.xml`;

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(robotsTxt);
  });

  const noCacheHeaders = (res: express.Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.removeHeader('ETag');
  };

  // Helper to serve SEO pre-rendered HTML
  const servePreRenderedHtml = (reqUrl: string, baseHtml: string, res: express.Response) => {
    noCacheHeaders(res);
    try {
      const currentProducts = (sharedSyncState.products && sharedSyncState.products.length > 0)
        ? sharedSyncState.products
        : initialAuthoritativeProducts;
      const metadata = getPageMetadata(reqUrl, currentProducts);
      const enrichedHtml = injectSeoIntoHtml(baseHtml, metadata);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(enrichedHtml);
    } catch (e) {
      console.error('Error during SEO HTML injection:', e);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(baseHtml);
    }
  };

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Handle HTML page requests with SSR SEO injection in dev
    app.use(async (req, res, next) => {
      const url = req.originalUrl || req.url;
      const isHtmlRoute = (req.method === 'GET' || req.method === 'HEAD') &&
        (req.headers.accept?.includes('text/html') || !url.includes('.')) &&
        !url.startsWith('/api') &&
        !url.startsWith('/@') &&
        !url.startsWith('/src') &&
        !url.startsWith('/node_modules');

      if (isHtmlRoute) {
        try {
          const templatePath = path.join(process.cwd(), 'index.html');
          let template = fs.readFileSync(templatePath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          return servePreRenderedHtml(url, template, res);
        } catch (e) {
          return next(e);
        }
      }
      next();
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
      etag: false,
      lastModified: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.json') || filePath.endsWith('sw.js')) {
          noCacheHeaders(res);
        } else if (!filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
        }
      },
    }));

    // Pre-rendered HTML for root and SPA routes
    app.get('*', (req, res, next) => {
      const url = req.originalUrl || req.url;
      if (url.startsWith('/api') || url.startsWith('/assets') || (url.includes('.') && !url.endsWith('.html'))) {
        return next();
      }
      const distIndex = path.join(distPath, 'index.html');
      try {
        const rawHtml = fs.readFileSync(distIndex, 'utf-8');
        servePreRenderedHtml(url, rawHtml, res);
      } catch (err) {
        res.sendFile(distIndex);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Market BD server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
