import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CANONICAL_400_PRODUCTS } from '../../src/data/canonicalCatalog400';

export default function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const canonicalValid = CANONICAL_400_PRODUCTS.filter(
      p => p && p.id && p.title && p.title.trim() !== ''
    ).map(p => ({
      ...p,
      status: p.status || 'active',
      isApproved: true,
      isActive: true
    }));

    const responseState = {
      siteMaintenance: {
        isMaintenanceMode: false,
        maintenanceMessageBn: 'মার্কেটবিডি সিস্টেম আপগ্রেড চলছে। খুব শীঘ্রই আমরা ফিরছি!',
        maintenanceMessageEn: 'MarketBD is undergoing scheduled maintenance. We will be back shortly!',
        allowedAdminIps: []
      },
      systemNotice: {
        isEnabled: false,
        noticeTextBn: '',
        noticeTextEn: '',
        noticeType: 'info'
      },
      paymentAccounts: {
        bkashMerchant: '01700000000',
        nagadMerchant: '01800000000',
        rocketMerchant: '01900000000',
        upayMerchant: '01500000000',
        bankAccountName: 'MarketBD Technologies Ltd',
        bankAccountNumber: '102.120.345678',
        bankName: 'Dutch Bangla Bank Ltd',
        bankBranch: 'Uttara Branch, Dhaka'
      },
      clockSettings: {
        timeFormat: '12h',
        showSeconds: true,
        showTimeZone: true,
        forcedTimeZone: 'Asia/Dhaka'
      },
      paymentPartners: null,
      branding: null,
      appRelease: null,
      marketplace_products: canonicalValid,
      products: canonicalValid,
      adminActiveSession: null,
      updatedAt: new Date().toISOString()
    };

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: responseState,
        updatedAt: responseState.updatedAt
      });
    }

    if (req.method === 'POST') {
      const updates = req.body || {};
      return res.status(200).json({
        success: true,
        message: 'Sync state received',
        data: { ...responseState, ...updates }
      });
    }

    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Server error' });
  }
}
