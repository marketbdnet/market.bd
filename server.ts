import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data/mockProducts';
import { KNOWN_JUNK_PRODUCT_IDS } from './src/utils/knownJunkProductIds';
import { getPageMetadata, injectSeoIntoHtml } from './server_seo';
import { isDummyChatThread } from './src/utils/chatUtils';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc, onSnapshot, setLogLevel } from 'firebase/firestore';
import { scryptSync, randomBytes as nodeRandomBytes } from 'crypto';
import adminAuthHandler, { signAdminToken, verifyAdminRequest, safeCompareStrings } from './api/admin-auth';
import smsHandler from './api/sms';
import paymentGatewayHandler from './api/payment-gateway';
import iosDownloadHandler from './api/download/ios';
import apkDownloadHandler, { normalizeExternalApkUrl, getConfiguredExternalApkUrl } from './api/download/apk';

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

  // Build authoritative product catalog for server sync state (full 416 canonical + supplemental items)
  const canonicalMap = new Map<string, any>();
  INITIAL_PRODUCTS.forEach(p => {
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
      masterUnlockPin: (process.env.MASTER_UNLOCK_PIN || '').trim(),
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
        lastLoginIp: '',
        createdAt: new Date().toISOString(),
        createdBy: 'System Root'
      }
    ],
    securityEvents: [],
    updatedAt: new Date().toISOString(),
    ...(savedFileState || {})
  };

  const deletedSet = new Set<string>(
    Array.isArray(sharedSyncState.deletedProductIds)
      ? sharedSyncState.deletedProductIds.filter((id: any) => typeof id === 'string' && id.trim())
      : []
  );
  sharedSyncState.deletedProductIds = Array.from(deletedSet);

  // Re-verify after spread that marketplace_products is non-empty, valid, and excludes deleted IDs
  const filteredBootProducts = initialAuthoritativeProducts.filter(
    (p: any) => p && p.id && !deletedSet.has(p.id) && p.isDeleted !== true && p.status !== 'deleted'
  );
  sharedSyncState.marketplace_products = filteredBootProducts;
  sharedSyncState.products = filteredBootProducts;
  sharedSyncState.chatThreads = Array.isArray(sharedSyncState.chatThreads)
    ? sharedSyncState.chatThreads.filter((t: any) => !isDummyChatThread(t))
    : [];

  function persistSyncState() {
    try {
      fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(sharedSyncState, null, 2), 'utf-8');
    } catch (e) {
      console.error('Notice persisting sync state:', e);
    }
  }

  let needsCleanPersist = false;
  const envMasterPin = (process.env.MASTER_UNLOCK_PIN || '').trim();
  if (sharedSyncState.siteMaintenance?.masterUnlockPin === '7860') {
    sharedSyncState.siteMaintenance = {
      ...sharedSyncState.siteMaintenance,
      masterUnlockPin: envMasterPin,
    };
    needsCleanPersist = true;
  }
  if (sharedSyncState.site_maintenance?.masterUnlockPin === '7860') {
    sharedSyncState.site_maintenance = {
      ...sharedSyncState.site_maintenance,
      masterUnlockPin: envMasterPin,
    };
    needsCleanPersist = true;
  }
  const legacyClock = sharedSyncState.clockSettings || sharedSyncState.clock_settings;
  if (legacyClock && Number(legacyClock.clockVersion || 0) < 2) {
    sharedSyncState.clockSettings = null;
    sharedSyncState.clock_settings = null;
    needsCleanPersist = true;
  }
  if (needsCleanPersist) {
    persistSyncState();
  }

  function normPhoneDigits(p?: string): string {
    const d = String(p || '').replace(/\D/g, '');
    return d ? d.replace(/^880?/, '').replace(/^0+/, '') : '';
  }

  interface CallerIdentity {
    userId: string;
    email: string;
    phone: string;
  }

  function extractCallerIdentity(req: express.Request): CallerIdentity {
    const rawId = String(req.headers['x-user-id'] || '').trim();
    const invalidIds = new Set(['user-me', 'guest', 'anonymous', 'null', 'undefined']);
    const userId = rawId && !invalidIds.has(rawId.toLowerCase()) ? rawId : '';
    const email = String(req.headers['x-user-email'] || '').trim().toLowerCase();
    const phone = normPhoneDigits(String(req.headers['x-user-phone'] || ''));
    return { userId, email, phone };
  }

  function isBackendAdOwner(product: any, caller: CallerIdentity): boolean {
    if (!product) return false;
    if (caller.userId) {
      const sellerId = String(product.seller?.id || '').trim();
      const topSellerId = String(product.sellerId || '').trim();
      if ((sellerId && sellerId !== 'user-me' && sellerId === caller.userId) ||
          (topSellerId && topSellerId !== 'user-me' && topSellerId === caller.userId)) {
        return true;
      }
    }
    if (caller.email && product.seller?.email && String(product.seller.email).trim().toLowerCase() === caller.email) {
      return true;
    }
    if (caller.phone.length >= 10 && product.seller?.phone && normPhoneDigits(product.seller.phone) === caller.phone) {
      return true;
    }
    return false;
  }

  function isBackendChatParticipant(thread: any, caller: CallerIdentity): boolean {
    if (!thread) return false;
    if (caller.userId && (thread.buyerId === caller.userId || thread.seller?.id === caller.userId)) return true;
    if (caller.email) {
      if (thread.seller?.email && String(thread.seller.email).trim().toLowerCase() === caller.email) return true;
      if (thread.buyerEmail && String(thread.buyerEmail).trim().toLowerCase() === caller.email) return true;
    }
    if (caller.phone.length >= 10) {
      if (thread.seller?.phone && normPhoneDigits(thread.seller.phone) === caller.phone) return true;
      if (thread.buyerPhone && normPhoneDigits(thread.buyerPhone) === caller.phone) return true;
    }
    return false;
  }

  // Helper: verify claimed local admin passcode hash when ADMIN_PASSWORD env var is unset
  const verifyClaimedPassword = (password: string): boolean => {
    const saved = sharedSyncState.adminPasswordHash;
    if (!saved || !saved.salt || !saved.hash || !password) return false;
    try {
      const derived = scryptSync(password, saved.salt, 64).toString('hex');
      return safeCompareStrings(derived, saved.hash);
    } catch {
      return false;
    }
  };

  const isAuthorizedAdminRequest = (req: express.Request): boolean => {
    if (verifyAdminRequest(req)) return true;
    const headerPass = String(
      req.headers['x-admin-password'] || req.headers['x-admin-secret'] || ''
    ).trim();
    if (!process.env.ADMIN_PASSWORD && headerPass && verifyClaimedPassword(headerPass)) {
      return true;
    }
    return false;
  };

  const stripUsersPasswords = (users: any) => {
    if (!Array.isArray(users)) return users;
    return users.map((u: any) => {
      if (!u || typeof u !== 'object') return u;
      const { password: _pw, ...safeU } = u;
      return safeU;
    });
  };

  const sanitizeStateForCaller = (state: Record<string, any>, isAdmin: boolean) => {
    const {
      adminPasswordHash: _hiddenHash,
      adminStaffAccounts,
      securityEvents,
      adminActiveSession,
      admin_logs,
      registered_users,
      registeredUsers,
      chatThreads,
      ...rest
    } = state;

    const cleanMaintenance = (m: any) => {
      if (!m || typeof m !== 'object') return m;
      if (isAdmin) return m;
      const { masterUnlockPin: _pin, ...publicMaintenance } = m;
      return publicMaintenance;
    };

    const sanitized: Record<string, any> = {
      ...rest,
      ...(rest.siteMaintenance ? { siteMaintenance: cleanMaintenance(rest.siteMaintenance) } : {}),
      ...(rest.site_maintenance ? { site_maintenance: cleanMaintenance(rest.site_maintenance) } : {}),
    };

    if (isAdmin) {
      sanitized.adminStaffAccounts = adminStaffAccounts;
      sanitized.securityEvents = securityEvents;
      sanitized.adminActiveSession = adminActiveSession;
      sanitized.admin_logs = admin_logs;
      sanitized.registered_users = stripUsersPasswords(registered_users);
      sanitized.registeredUsers = stripUsersPasswords(registeredUsers);
      sanitized.chatThreads = chatThreads;
    }

    return sanitized;
  };

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
  app.get('/api/sync/state', (req, res) => {
    const isAdmin = isAuthorizedAdminRequest(req);
    const safeState = sanitizeStateForCaller(sharedSyncState, isAdmin);
    if (req.query.lite === '1') {
      const { products: _dupProducts, marketplace_products: _heavyProducts, ...rest } = safeState;
      return res.json({
        success: true,
        data: rest
      });
    }
    res.json({ success: true, data: safeState });
  });

  // Admin Single-Device Session Management Endpoint
  app.get('/api/admin/session', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
    res.json({
      success: true,
      data: sharedSyncState.adminActiveSession || null,
      message: 'Active admin session retrieved'
    });
  });

  app.post('/api/admin/session', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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

  app.delete('/api/admin/session', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
    sharedSyncState.adminActiveSession = null;
    sharedSyncState.updatedAt = new Date().toISOString();
    res.json({ success: true, message: 'Admin session cleared' });
  });

  // Enterprise RBAC & Security Center Endpoints
  app.get('/api/admin/roles', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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

  app.get('/api/admin/staff', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
    res.json({
      success: true,
      data: sharedSyncState.adminStaffAccounts || []
    });
  });

  app.post('/api/admin/staff', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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

  app.get('/api/admin/security/events', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
    res.json({
      success: true,
      data: sharedSyncState.securityEvents || []
    });
  });

  app.post('/api/admin/security/events', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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
      const { pin } = req.body || {};
      const cleanPin = String(pin || '').trim();
      const isValid =
        isAuthorizedAdminRequest(req) ||
        (Boolean(process.env.ADMIN_PASSWORD) && safeCompareStrings(cleanPin, String(process.env.ADMIN_PASSWORD))) ||
        verifyClaimedPassword(cleanPin);

      if (!isValid) {
        return res.status(403).json({ success: false, message: 'Invalid 2FA / Security PIN' });
      }

      res.json({ success: true, message: 'Action verified and authorized' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
    }
  });

  app.post('/api/admin/unlock-lockdown', (req, res) => {
    try {
      const enteredPin = String(req.body?.pin || '').trim();
      const configuredPins = [
        process.env.MASTER_UNLOCK_PIN,
        sharedSyncState.siteMaintenance?.masterUnlockPin,
        sharedSyncState.site_maintenance?.masterUnlockPin,
        process.env.ADMIN_PASSWORD,
      ]
        .map(v => String(v || '').trim())
        .filter(Boolean);

      const isAuthorized =
        isAuthorizedAdminRequest(req) ||
        (enteredPin.length > 0 && (
          configuredPins.some(expected => safeCompareStrings(enteredPin, expected)) ||
          verifyClaimedPassword(enteredPin)
        ));

      if (!isAuthorized) {
        return res.status(401).json({ success: false, message: 'Invalid Master Unlock PIN' });
      }

      const nextMaint = {
        ...(sharedSyncState.siteMaintenance || {}),
        isMasterLockdown: false,
        updatedAt: new Date().toISOString(),
      };
      sharedSyncState.siteMaintenance = nextMaint;
      sharedSyncState.site_maintenance = nextMaint;
      sharedSyncState.updatedAt = nextMaint.updatedAt;
      persistSyncState();

      const { masterUnlockPin: _omitted, ...publicMaint } = nextMaint;
      res.json({ success: true, data: publicMaint });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Unlock failed' });
    }
  });

  app.post('/api/sync/state', (req, res) => {
    try {
      const updates = req.body || {};
      const keys = Object.keys(updates);
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      const isReactionOnly = keys.length > 0 && keys.every(k => k === 'product_reactions');

      if (!isAdmin && !(isReactionOnly && Boolean(caller.userId))) {
        return res.status(401).json({ success: false, message: 'Admin authorization required' });
      }

      keys.forEach(key => {
        if (key === 'adminPasswordHash') return;
        if (updates[key] !== undefined) {
          let value = updates[key];
          if (key === 'registered_users' || key === 'registeredUsers') {
            value = stripUsersPasswords(value);
          }
          if ((key === 'app_release' || key === 'appRelease') && value && typeof value === 'object') {
            const url = String(value.apkDownloadUrl || '').trim();
            if (!url || url.startsWith('blob:') || url.includes('.run.app') || url.includes('marketbd-release-v')) {
              value = { ...value, apkDownloadUrl: '/MarketBD.apk' };
            }
          }
          sharedSyncState[key] = value;
          if (key === 'site_maintenance' || key === 'siteMaintenance') {
            if (value && typeof value === 'object' && value.masterUnlockPin === '7860') {
              value = { ...value, masterUnlockPin: (process.env.MASTER_UNLOCK_PIN || '').trim() };
            }
            sharedSyncState.siteMaintenance = value;
            sharedSyncState.site_maintenance = value;
          }
          if (key === 'app_release' || key === 'appRelease') {
            sharedSyncState.appRelease = value;
            sharedSyncState.app_release = value;
          }
          if (key === 'deletedProductIds' && Array.isArray(value)) {
            const merged = new Set<string>(Array.isArray(sharedSyncState.deletedProductIds) ? sharedSyncState.deletedProductIds : []);
            value.forEach((id: any) => {
              if (typeof id === 'string' && id.trim()) merged.add(id.trim());
            });
            sharedSyncState.deletedProductIds = Array.from(merged);
            if (Array.isArray(sharedSyncState.marketplace_products)) {
              const filtered = sharedSyncState.marketplace_products.filter((p: any) => p && !merged.has(p.id));
              sharedSyncState.marketplace_products = filtered;
              sharedSyncState.products = filtered;
            }
          }
          if (key === 'marketplace_products' || key === 'products') {
            sharedSyncState.marketplace_products = value;
            sharedSyncState.products = value;
          }
        }
      });
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();
      res.json({ success: true, message: 'Sync state updated successfully', data: sanitizeStateForCaller(sharedSyncState, isAdmin) });
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
      const deletedIdSet = new Set<string>(Array.isArray(sharedSyncState.deletedProductIds) ? sharedSyncState.deletedProductIds : []);
      let rawList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      // Clean invalid stubs and deleted ads
      let productList = rawList.filter(
        p => p && p.id && p.title && p.title.trim() !== '' &&
          !KNOWN_JUNK_PRODUCT_IDS.includes(p.id) &&
          !deletedIdSet.has(p.id) &&
          p.isDeleted !== true &&
          String(p.status || '').toLowerCase() !== 'deleted'
      );

      const { category, sellerId, status, query } = req.query;
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      const callerUserId = caller.userId || undefined;

      if (category && typeof category === 'string') {
        productList = productList.filter(p => p.category === category);
      }
      if (sellerId && typeof sellerId === 'string') {
        productList = productList.filter(p => p.seller?.id === sellerId || p.sellerId === sellerId);
      }

      if (!isAdmin) {
        productList = productList.filter(p => {
          const rawStatus = (p.status || '').toLowerCase();
          const rawMod = (p.moderationStatus || '').toLowerCase();
          const isUnlisted =
            rawStatus === 'pending' ||
            rawStatus === 'under_review' ||
            rawStatus === 'in_review' ||
            rawMod === 'pending' ||
            rawStatus === 'rejected' ||
            rawMod === 'rejected';
          if (isUnlisted) {
            return isBackendAdOwner(p, caller);
          }
          return true;
        });
      }

      if (status && typeof status === 'string') {
        if (status === 'all') {
          // Non-admins already filtered to owned unlisted + active above
        } else if (status === 'active' || status === 'approved') {
          productList = productList.filter(p => p.status === 'active' || p.status === 'approved' || (!p.status && !p.moderationStatus));
        } else if (status === 'pending') {
          productList = productList.filter(p => p.status === 'pending' || p.status === 'under_review' || p.status === 'in_review');
        } else {
          productList = productList.filter(p => p.status === status);
        }
      } else if (!isAdmin && !sellerId) {
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
      const sanitizedList = productList.map(p => sanitizeProductForPublic(p, callerUserId, isAdmin || isBackendAdOwner(p, caller)));

      res.json({
        success: true,
        count: sanitizedList.length,
        data: sanitizedList,
        products: sanitizedList,
        deletedIds: Array.isArray(sharedSyncState.deletedProductIds) ? sharedSyncState.deletedProductIds : [],
        updatedAt: sharedSyncState.updatedAt
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    const deletedIdSet = new Set<string>(Array.isArray(sharedSyncState.deletedProductIds) ? sharedSyncState.deletedProductIds : []);
    const productList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
    const found = productList.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (found && !deletedIdSet.has(found.id) && found.isDeleted !== true && String(found.status || '').toLowerCase() !== 'deleted') {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      const rawStatus = String(found.status || '').toLowerCase();
      if (!isAdmin && !isBackendAdOwner(found, caller) && (rawStatus === 'pending' || rawStatus === 'rejected' || rawStatus === 'under_review' || rawStatus === 'in_review')) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      const callerUserId = caller.userId || undefined;
      res.json({ success: true, data: sanitizeProductForPublic(found, callerUserId, isAdmin || isBackendAdOwner(found, caller)) });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  });

  // Post new Ad from Android App or Web
  app.post('/api/products', async (req, res) => {
    try {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required to post an ad.' });
      }

      const newAd = { ...(req.body || {}) };
      if (!newAd || !newAd.title) {
        return res.status(400).json({ success: false, message: 'Title is required for product' });
      }

      if (!newAd.id) {
        newAd.id = 'prod-' + Date.now();
      }
      if (!newAd.postedAt) {
        newAd.postedAt = new Date().toISOString();
      }

      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const existingIdx = currentList.findIndex(p => p.id === newAd.id);
      if (existingIdx >= 0 && !isAdmin && !isBackendAdOwner(currentList[existingIdx], caller)) {
        return res.status(403).json({ success: false, message: 'Forbidden: you do not own this ad.' });
      }

      if (!isAdmin) {
        newAd.status = 'pending';
        newAd.isApproved = false;
        newAd.isActive = false;
        newAd.sellerId = caller.userId;
        newAd.seller = { ...(newAd.seller || {}), id: caller.userId };
      } else if (!newAd.status) {
        newAd.status = 'pending';
      }

      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...newAd };
      } else {
        currentList = [newAd, ...currentList];
      }

      if (Array.isArray(sharedSyncState.deletedProductIds)) {
        sharedSyncState.deletedProductIds = sharedSyncState.deletedProductIds.filter((dId: string) => dId !== newAd.id);
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
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to update an ad.' });
      }

      const updateData = { ...(req.body || {}) };
      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const idx = currentList.findIndex(p => p.id === id);
      let targetProduct: any;

      if (idx >= 0) {
        const existing = currentList[idx];
        if (!isAdmin && !isBackendAdOwner(existing, caller)) {
          return res.status(403).json({ success: false, message: 'Forbidden: you do not own this ad.' });
        }
        if (!isAdmin) {
          const wasApproved = existing.status === 'active' || existing.status === 'approved' || existing.isApproved === true;
          if (!wasApproved && (updateData.status === 'active' || updateData.status === 'approved' || updateData.isApproved === true)) {
            updateData.status = existing.status || 'pending';
            updateData.isApproved = existing.isApproved ?? false;
            updateData.isActive = existing.isActive ?? false;
          }
          if (updateData.status === 'rejected') {
            updateData.status = existing.status;
          }
          if (caller.userId) {
            updateData.sellerId = existing.sellerId || caller.userId;
            if (updateData.seller) {
              updateData.seller = { ...updateData.seller, id: existing.seller?.id || caller.userId };
            }
          }
        }
        currentList[idx] = { ...existing, ...updateData };
        targetProduct = currentList[idx];
        sharedSyncState.marketplace_products = currentList;
        sharedSyncState.products = currentList;
        sharedSyncState.updatedAt = new Date().toISOString();
        persistSyncState();
      } else {
        if (!isAdmin && !caller.userId) {
          return res.status(401).json({ success: false, message: 'Authentication required to create an ad.' });
        }
        if (!isAdmin) {
          updateData.status = 'pending';
          updateData.isApproved = false;
          updateData.isActive = false;
          updateData.sellerId = caller.userId;
          updateData.seller = { ...(updateData.seller || {}), id: caller.userId };
        }
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
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to delete an ad.' });
      }

      let currentList: any[] = sharedSyncState.marketplace_products || sharedSyncState.products || [];
      const target = currentList.find(p => p.id === id);
      if (!isAdmin) {
        if (!target) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (!isBackendAdOwner(target, caller)) {
          return res.status(403).json({ success: false, message: 'Forbidden: you do not own this ad.' });
        }
      }

      const filtered = currentList.filter(p => p.id !== id);
      const deletedIds = new Set<string>(Array.isArray(sharedSyncState.deletedProductIds) ? sharedSyncState.deletedProductIds : []);
      deletedIds.add(id);
      sharedSyncState.deletedProductIds = Array.from(deletedIds);
      sharedSyncState.marketplace_products = filtered;
      sharedSyncState.products = filtered;
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      if (serverDb) {
        try {
          deleteDoc(doc(serverDb, 'products', id)).catch((fErr: any) => {
            console.error('[Server] Error deleting product from Firestore:', fErr);
          });
          setDoc(doc(serverDb, 'settings', 'deleted_products'), {
            ids: sharedSyncState.deletedProductIds,
            updatedAt: sharedSyncState.updatedAt
          }, { merge: true }).catch(() => {});
        } catch (fErr) {
          console.error('[Server] Error deleting product from Firestore:', fErr);
        }
      }

      res.json({ success: true, message: 'Product deleted and synced successfully', id, deletedProductIds: sharedSyncState.deletedProductIds });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to delete product' });
    }
  });

  // Bulk Product Sync endpoint
  app.post('/api/products/sync', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
    try {
      const logs = sharedSyncState.admin_logs || [];
      res.json({ success: true, count: logs.length, data: logs });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to fetch admin logs' });
    }
  });

  app.post('/api/admin/logs', (req, res) => {
    if (!isAuthorizedAdminRequest(req)) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
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

  // ================= REAL-TIME BIKROY-STYLE CHAT API & SSE STREAM =================
  const chatSseClients = new Set<express.Response>();

  const broadcastChatEvent = (payload: Record<string, any>) => {
    const serialized = `data: ${JSON.stringify(payload)}\n\n`;
    chatSseClients.forEach(client => {
      try {
        client.write(serialized);
      } catch {
        chatSseClients.delete(client);
      }
    });
  };

  app.get('/api/chats/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`);
    chatSseClients.add(res);

    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepAlive);
        chatSseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      chatSseClients.delete(res);
    });
  });

  app.get('/api/chats', (req, res) => {
    try {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to load chats.' });
      }

      const threads: any[] = Array.isArray(sharedSyncState.chatThreads)
        ? sharedSyncState.chatThreads.filter((t: any) => !isDummyChatThread(t))
        : [];

      const filtered = isAdmin
        ? threads
        : threads.filter(t => isBackendChatParticipant(t, caller));

      res.json({ success: true, data: filtered });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to load chats' });
    }
  });

  app.post('/api/chats/thread', (req, res) => {
    try {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required to start a chat.' });
      }

      const incoming = req.body?.thread;
      if (!incoming || !incoming.id || !incoming.productId) {
        return res.status(400).json({ success: false, message: 'Valid thread object required' });
      }
      if (!isAdmin && incoming.buyerId !== caller.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: thread buyer does not match caller.' });
      }

      if (!Array.isArray(sharedSyncState.chatThreads)) {
        sharedSyncState.chatThreads = [];
      }
      const existing = sharedSyncState.chatThreads.find(
        (t: any) =>
          t.id === incoming.id ||
          (t.productId === incoming.productId && t.buyerId === incoming.buyerId)
      );
      if (existing) {
        return res.json({ success: true, data: existing });
      }
      const cleanThread = { ...incoming, messages: Array.isArray(incoming.messages) ? incoming.messages : [] };
      sharedSyncState.chatThreads.unshift(cleanThread);
      persistSyncState();
      broadcastChatEvent({ type: 'chat:updated', thread: cleanThread });
      res.status(201).json({ success: true, data: cleanThread });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to create chat thread' });
    }
  });

  app.post('/api/chats/message', (req, res) => {
    try {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to send messages.' });
      }

      const { threadId, message, threadSnapshot } = req.body || {};
      if (!threadId || !message || !message.id) {
        return res.status(400).json({ success: false, message: 'threadId and message are required' });
      }
      if (!Array.isArray(sharedSyncState.chatThreads)) {
        sharedSyncState.chatThreads = [];
      }

      let idx = sharedSyncState.chatThreads.findIndex((t: any) => t.id === threadId);
      if (idx === -1 && threadSnapshot) {
        if (!isAdmin && !isBackendChatParticipant(threadSnapshot, caller)) {
          return res.status(403).json({ success: false, message: 'Forbidden: caller is not a chat participant.' });
        }
        sharedSyncState.chatThreads.unshift({ ...threadSnapshot, messages: [] });
        idx = 0;
      }
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Chat thread not found' });
      }

      const target = sharedSyncState.chatThreads[idx];
      if (!isAdmin && !isBackendChatParticipant(target, caller)) {
        return res.status(403).json({ success: false, message: 'Forbidden: caller is not a chat participant.' });
      }

      const existingMsgs: any[] = Array.isArray(target.messages) ? target.messages : [];
      // Idempotent duplicate check
      if (!existingMsgs.some((m: any) => m.id === message.id)) {
        const deliveredMsg = {
          ...message,
          senderId: !isAdmin && caller.userId ? caller.userId : message.senderId,
          status: message.status || 'delivered'
        };
        const updatedThread = {
          ...target,
          lastMessage: deliveredMsg.text,
          lastMessageTime: deliveredMsg.timestamp,
          unreadCount: (target.unreadCount || 0) + 1,
          messages: [...existingMsgs, deliveredMsg]
        };
        sharedSyncState.chatThreads.splice(idx, 1);
        sharedSyncState.chatThreads.unshift(updatedThread);
        persistSyncState();
        broadcastChatEvent({ type: 'chat:updated', thread: updatedThread });
        return res.json({ success: true, data: updatedThread });
      }

      res.json({ success: true, data: target });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to send message' });
    }
  });

  app.post('/api/chats/read', (req, res) => {
    try {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { threadId, readerId } = req.body || {};
      if (!threadId || !Array.isArray(sharedSyncState.chatThreads)) {
        return res.json({ success: true });
      }
      const idx = sharedSyncState.chatThreads.findIndex((t: any) => t.id === threadId);
      if (idx >= 0) {
        const t = sharedSyncState.chatThreads[idx];
        if (!isAdmin && !isBackendChatParticipant(t, caller)) {
          return res.status(403).json({ success: false, message: 'Forbidden: caller is not a chat participant.' });
        }
        const effectiveReaderId = caller.userId || readerId;
        const updatedMsgs = (t.messages || []).map((m: any) =>
          effectiveReaderId && m.senderId !== effectiveReaderId ? { ...m, status: 'seen' } : m
        );
        const updatedThread = { ...t, unreadCount: 0, messages: updatedMsgs };
        sharedSyncState.chatThreads[idx] = updatedThread;
        persistSyncState();
        broadcastChatEvent({ type: 'chat:updated', thread: updatedThread });
        return res.json({ success: true, data: updatedThread });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to mark chat read' });
    }
  });

  app.delete('/api/chats/:threadId', (req, res) => {
    try {
      const isAdmin = isAuthorizedAdminRequest(req);
      const caller = extractCallerIdentity(req);
      if (!isAdmin && !caller.userId && !caller.email && !caller.phone) {
        return res.status(401).json({ success: false, message: 'Authentication required to delete chat.' });
      }

      const { threadId } = req.params;
      if (Array.isArray(sharedSyncState.chatThreads)) {
        const target = sharedSyncState.chatThreads.find((t: any) => t.id === threadId);
        if (!isAdmin && target && !isBackendChatParticipant(target, caller)) {
          return res.status(403).json({ success: false, message: 'Forbidden: caller is not a chat participant.' });
        }
        sharedSyncState.chatThreads = sharedSyncState.chatThreads.filter((t: any) => t.id !== threadId);
        persistSyncState();
      }
      broadcastChatEvent({ type: 'chat:deleted', threadId });
      res.json({ success: true, threadId });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to delete chat thread' });
    }
  });

  // Mount Vercel-compatible API routes in Express so they work identically in AI Studio / Node.js
  app.all('/api/admin-auth', (req, res) => {
    if (process.env.ADMIN_PASSWORD) {
      return adminAuthHandler(req, res);
    }

    res.setHeader('Cache-Control', 'no-store');
    const savedClaim = sharedSyncState.adminPasswordHash;

    if (req.method === 'GET') {
      return res.json({
        ok: true,
        configured: Boolean(savedClaim),
        canClaim: !savedClaim,
        authenticated: isAuthorizedAdminRequest(req)
      });
    }

    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const password = String(body.password || '').trim();

    if (body.action === 'claim') {
      if (savedClaim) {
        return res.status(409).json({ ok: false, code: 'ALREADY_CLAIMED', message: 'Admin passcode already claimed.' });
      }
      if (password.length < 4) {
        return res.status(400).json({ ok: false, code: 'WEAK_PASSWORD', message: 'Passcode must be at least 4 characters.' });
      }
      const salt = nodeRandomBytes(16).toString('hex');
      const hash = scryptSync(password, salt, 64).toString('hex');
      sharedSyncState.adminPasswordHash = { salt, hash, claimedAt: new Date().toISOString() };
      persistSyncState();
      return res.status(200).json({ ok: true, token: signAdminToken(), claimed: true });
    }

    if (!savedClaim) {
      return res.status(503).json({ ok: false, code: 'NOT_CONFIGURED' });
    }

    if (!verifyClaimedPassword(password)) {
      return res.status(401).json({ ok: false });
    }

    return res.status(200).json({ ok: true, token: signAdminToken() });
  });

  app.all('/api/sms', (req, res) => smsHandler(req, res));
  app.all('/api/payment-gateway', (req, res) => paymentGatewayHandler(req, res));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      name: 'MarketBD.Net Enterprise API',
      activeConnections: Math.max(1, chatSseClients.size)
    });
  });

  // Helper to locate a real non-empty APK binary on local storage
  const findLocalApkFile = (requestedName = 'MarketBD.apk'): string | null => {
    const cleanFilename = path.basename(requestedName || 'MarketBD.apk');
    const searchPaths = [
      path.join(process.cwd(), 'public', cleanFilename),
      path.join(process.cwd(), 'public', 'downloads', cleanFilename),
      path.join(process.cwd(), 'public', 'MarketBD.apk'),
      '/tmp/MarketBD.apk'
    ];
    for (const p of searchPaths) {
      try {
        const st = fs.statSync(p);
        if (st.isFile() && st.size > 0) return p;
      } catch {
        // Not found
      }
    }
    return null;
  };

  // Real-time APK availability check for Install modal & Admin panels
  app.get('/api/apk-status', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const localPath = findLocalApkFile('MarketBD.apk');
    const currentVersion = sharedSyncState.appRelease?.version || '2.5.0';

    if (localPath) {
      const stat = fs.statSync(localPath);
      return res.json({
        ok: true,
        available: true,
        source: 'local',
        downloadUrl: '/api/download/apk',
        fileName: 'MarketBD.apk',
        sizeBytes: stat.size,
        version: currentVersion
      });
    }

    const stateExternal = normalizeExternalApkUrl(sharedSyncState.appRelease?.apkDownloadUrl);
    if (stateExternal) {
      return res.json({
        ok: true,
        available: true,
        source: 'external',
        downloadUrl: '/api/download/apk',
        externalUrl: stateExternal,
        fileName: 'MarketBD.apk',
        sizeBytes: null,
        version: currentVersion
      });
    }

    const remoteExternal = await getConfiguredExternalApkUrl();
    if (remoteExternal) {
      return res.json({
        ok: true,
        available: true,
        source: 'external',
        downloadUrl: '/api/download/apk',
        externalUrl: remoteExternal,
        fileName: 'MarketBD.apk',
        sizeBytes: null,
        version: currentVersion
      });
    }

    return res.json({
      ok: true,
      available: false,
      source: 'none',
      downloadUrl: null,
      fileName: 'MarketBD.apk',
      sizeBytes: null,
      version: currentVersion
    });
  });

  // Admin binary APK upload endpoint (writes real verified .apk to public/MarketBD.apk or /tmp/MarketBD.apk)
  app.post(
    '/api/upload-apk',
    express.raw({
      type: ['application/vnd.android.package-archive', 'application/octet-stream'],
      limit: '70mb'
    }),
    async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');

      if (!isAuthorizedAdminRequest(req)) {
        const hasCredential = Boolean(process.env.ADMIN_PASSWORD || sharedSyncState.adminPasswordHash);
        return res.status(401).json({
          ok: false,
          code: hasCredential ? 'ADMIN_AUTH_REQUIRED' : 'CLAIM_REQUIRED',
          message: hasCredential
            ? 'Admin verification required before uploading an APK.'
            : 'Please claim an admin passcode first to enable APK uploads.'
        });
      }

      const buf = Buffer.isBuffer(req.body) ? req.body : null;
      if (!buf || buf.length < 1024) {
        return res.status(400).json({
          ok: false,
          code: 'INVALID_APK_EMPTY',
          message: 'Uploaded file is empty or too small to be a valid Android APK.'
        });
      }

      // Every valid Android APK is a ZIP archive starting with magic bytes PK\x03\x04
      const isZipMagic = buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
      if (!isZipMagic) {
        return res.status(400).json({
          ok: false,
          code: 'INVALID_APK_SIGNATURE',
          message: 'The uploaded file is not a valid .apk archive (missing PK/ZIP signature).'
        });
      }

      const publicDir = path.join(process.cwd(), 'public');
      const primaryTarget = path.join(publicDir, 'MarketBD.apk');
      const fallbackTarget = '/tmp/MarketBD.apk';

      let savedPath = '';
      try {
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        const tempPath = path.join(publicDir, `.MarketBD.apk.${Date.now()}.tmp`);
        fs.writeFileSync(tempPath, buf);
        fs.renameSync(tempPath, primaryTarget);
        savedPath = primaryTarget;
      } catch {
        try {
          const tempFallback = `/tmp/.MarketBD.apk.${Date.now()}.tmp`;
          fs.writeFileSync(tempFallback, buf);
          fs.renameSync(tempFallback, fallbackTarget);
          savedPath = fallbackTarget;
        } catch (err: any) {
          return res.status(500).json({
            ok: false,
            code: 'APK_WRITE_FAILED',
            message: err?.message || 'Unable to store APK binary on server.'
          });
        }
      }

      const nextRelease = {
        ...(sharedSyncState.appRelease || {}),
        apkDownloadUrl: '/api/download/apk',
        apkFileSizeBytes: buf.length,
        apkUploadedAt: new Date().toISOString()
      };
      sharedSyncState.appRelease = nextRelease;
      sharedSyncState.app_release = nextRelease;
      sharedSyncState.updatedAt = new Date().toISOString();
      persistSyncState();

      if (serverDb) {
        setDoc(
          doc(serverDb, 'settings', 'app_release'),
          { value: sanitizeForFirestore(nextRelease), updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }

      return res.status(200).json({
        ok: true,
        downloadUrl: '/api/download/apk',
        staticUrl: '/MarketBD.apk',
        fileName: 'MarketBD.apk',
        sizeBytes: buf.length,
        storageMode: savedPath === primaryTarget ? 'public' : 'tmp'
      });
    }
  );

  // Dedicated APK Download Endpoint: serves uploaded APK binary, or delegates to external / Firestore URL
  const sendApkBinary = async (req: express.Request, res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

    const rawFile = (req.params as any)?.filename || 'MarketBD.apk';
    const cleanFilename = path.basename(rawFile);
    const downloadFilename = cleanFilename.endsWith('.apk') ? cleanFilename : `${cleanFilename}.apk`;

    const foundPath = findLocalApkFile(cleanFilename);
    if (foundPath) {
      const stat = fs.statSync(foundPath);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Length', String(stat.size));
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
      if (req.method === 'HEAD') {
        return res.status(200).end();
      }
      return res.sendFile(foundPath);
    }

    const stateExternalUrl = normalizeExternalApkUrl(sharedSyncState.appRelease?.apkDownloadUrl);
    if (stateExternalUrl) {
      res.setHeader('Cache-Control', 'no-store');
      return res.redirect(302, stateExternalUrl);
    }

    return apkDownloadHandler(req, res);
  };

  app.all(['/api/download/apk', '/api/download/apk/:filename', '/MarketBD.apk', '/marketbd-release-v2.5.0.apk', '/downloads/:filename'], sendApkBinary);

  // Apple iOS / iPhone Configuration Profile (.mobileconfig) Download Endpoint
  app.all(['/api/download/ios', '/MarketBD.mobileconfig'], (req, res) => iosDownloadHandler(req, res));

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

    // Popular marketplace categories (Bikroy 17)
    const categories = [
      'vehicles', 'property', 'mobiles', 'electronics', 'home_furniture',
      'fashion', 'health_beauty', 'services', 'repair_construction', 'business_equipment',
      'books_sports', 'baby_kids', 'agriculture', 'animal_pets', 'jobs',
      'seeking_work', 'business_industry'
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
