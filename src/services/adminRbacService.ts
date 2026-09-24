// Enterprise Role-Based Access Control (RBAC) & Security Policy Service for MarketBD

import {
  AdminRole,
  AdminPermission,
  StaffAdminAccount,
  AdminSessionRecord,
  SecurityEventRecord
} from '../types/adminAuth';

export const ALL_ADMIN_ROLES: AdminRole[] = [
  'Super Admin',
  'Security Admin',
  'Marketplace Admin',
  'Payment Admin',
  'User Admin',
  'Order Admin',
  'Content/Category Admin',
  'Support Admin',
  'Analyst / Read Only'
];

export const ROLE_DESCRIPTIONS: Record<AdminRole, { bn: string; en: string }> = {
  'Super Admin': {
    bn: 'সর্বোচ্চ ক্ষমতা সম্পন্ন এডমিন। সাইটের সকল সেটিংস, সিকিউরিটি ও অপারেশন নিয়ন্ত্রণের পূর্ণ এক্সেস রয়েছে।',
    en: 'Full enterprise authority over all settings, security, finance, ads, users, and production switches.'
  },
  'Security Admin': {
    bn: 'সিকিউরিটি সেন্টার, এডমিন একাউন্টস, পারমিশন, এমএফএ, সেশন ও অডিট লগ নিয়ন্ত্রক।',
    en: 'Manages security center, staff credentials, MFA enforcement, active sessions, and audit logs.'
  },
  'Marketplace Admin': {
    bn: 'বিজ্ঞাপন অনুমোদন, রিজেক্ট, এডিট ও বিজ্ঞাপনের সার্বিক তদারকি কারী।',
    en: 'Moderates ads, reviews pending submissions, rejects violations, and monitors catalog quality.'
  },
  'Payment Admin': {
    bn: 'ম্যানুয়াল পেমেন্ট ভেরিফিকেশন (bKash/Nagad/Rocket), ইনভয়েস ও ট্রানজেকশন অনুমোদন কারী।',
    en: 'Handles manual payment approvals, transaction ID verification, and financial reconciliations.'
  },
  'User Admin': {
    bn: 'ইউজার প্রোফাইল তদারকি, সাসপেন্ড, ভেরিফিকেশন ও এবিউজ রিপোর্ট ব্যবস্থাপনা কারী।',
    en: 'Manages registered customers, verifies identity badges, reviews abuse reports, and suspends offenders.'
  },
  'Order Admin': {
    bn: 'অর্ডার ট্র্যাকিং, ডেলিভারি স্ট্যাটাস ও ট্রানজেকশন আপডেট কারী।',
    en: 'Oversees order lifecycles, shipping statuses, and fulfillment tracking.'
  },
  'Content/Category Admin': {
    bn: 'ক্যাটাগরি, সাব-ক্যাটাগরি, ব্র্যান্ড, লোগো ও সিএমএস কনটেন্ট নিয়ন্ত্রক।',
    en: 'Curates product categories, subcategories, brand taxonomies, logos, and policy banners.'
  },
  'Support Admin': {
    bn: 'গ্রাহক সেবা, সাপোর্ট টিকিট ও বিরোধ মীমাংসা কারী।',
    en: 'Resolves customer complaints, responds to support inquiries, and assists buyers & sellers.'
  },
  'Analyst / Read Only': {
    bn: 'শুধুমাত্র রিপোর্ট ও অ্যানালিটিক্স পর্যবেক্ষণ কারী (কোনো ডাটা পরিবর্তনের অধিকার নেই)।',
    en: 'Read-only access to operational dashboards, metrics, and traffic analytics. Cannot modify data.'
  }
};

// Default Granular Permission Matrix (Strict Deny-by-Default Policy)
export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  'Super Admin': [
    // All 36 granular permissions granted
    'ads.view', 'ads.create', 'ads.edit', 'ads.approve', 'ads.reject', 'ads.delete',
    'users.view', 'users.edit', 'users.suspend', 'users.delete', 'reports.view', 'reports.resolve',
    'payments.view', 'payments.verify', 'payments.approve', 'payments.reject', 'billing.view', 'billing.edit',
    'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
    'orders.view', 'orders.edit', 'orders.status',
    'settings.view', 'settings.edit', 'maintenance.manage',
    'admins.view', 'admins.create', 'admins.edit', 'admins.remove', 'roles.manage',
    'security.view', 'security.manage', 'mfa.manage', 'sessions.view', 'sessions.revoke',
    'audit.view', 'audit.export',
    'analytics.view',
    'production.view', 'production.manage'
  ],

  'Security Admin': [
    'security.view', 'security.manage',
    'admins.view', 'admins.create', 'admins.edit', 'admins.remove', 'roles.manage',
    'mfa.manage', 'sessions.view', 'sessions.revoke',
    'audit.view', 'audit.export',
    'users.view', 'users.suspend',
    'reports.view',
    'settings.view',
    'analytics.view'
  ],

  'Marketplace Admin': [
    'ads.view', 'ads.create', 'ads.edit', 'ads.approve', 'ads.reject', 'ads.delete',
    'categories.view',
    'reports.view',
    'analytics.view'
  ],

  'Payment Admin': [
    'payments.view', 'payments.verify', 'payments.approve', 'payments.reject',
    'billing.view', 'billing.edit',
    'orders.view',
    'audit.view'
  ],

  'User Admin': [
    'users.view', 'users.edit', 'users.suspend',
    'reports.view', 'reports.resolve',
    'audit.view'
  ],

  'Order Admin': [
    'orders.view', 'orders.edit', 'orders.status',
    'payments.view',
    'billing.view'
  ],

  'Content/Category Admin': [
    'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
    'ads.view'
  ],

  'Support Admin': [
    'reports.view', 'reports.resolve',
    'users.view',
    'ads.view'
  ],

  'Analyst / Read Only': [
    'analytics.view',
    'reports.view',
    'ads.view',
    'users.view',
    'payments.view',
    'orders.view',
    'audit.view'
  ]
};

// Check if a role + optional custom overrides possesses a granular permission
export function hasPermission(
  role: AdminRole | string | undefined,
  permission: AdminPermission,
  customPermissions?: AdminPermission[]
): boolean {
  if (!role) return false;
  
  // Super Admin possesses all privileges
  if (role === 'Super Admin' || role === 'admin') {
    return true;
  }

  // Explicit custom permission override takes immediate effect
  if (customPermissions && Array.isArray(customPermissions)) {
    if (customPermissions.includes(permission)) return true;
  }

  const typedRole = role as AdminRole;
  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[typedRole];
  if (!rolePermissions) {
    return false; // Strict Deny by Default
  }

  return rolePermissions.includes(permission);
}

// Map Admin Panel tabs to their required minimum permission
export const TAB_PERMISSION_MAPPING: Record<string, AdminPermission[]> = {
  'overview': ['analytics.view', 'ads.view', 'reports.view'],
  'all-ads': ['ads.view'],
  'pending': ['ads.approve', 'ads.reject', 'ads.view'],
  'live': ['production.view', 'production.manage'],
  'users': ['users.view'],
  'reports': ['reports.view'],
  'business': ['users.view', 'ads.view'],
  'categories': ['categories.view'],
  'logo': ['settings.edit', 'categories.edit'],
  'notice': ['settings.edit'],
  'maintenance': ['maintenance.manage', 'settings.edit'],
  'clock': ['settings.edit'],
  'locations': ['settings.edit'],
  'seo': ['settings.edit'],
  'gateways': ['production.manage', 'settings.edit'],
  'accounts': ['payments.view', 'payments.verify'],
  'partners': ['payments.view'],
  'payment-verification': ['payments.verify', 'payments.approve', 'payments.reject', 'payments.view'],
  'billing': ['billing.view', 'orders.view'],
  'staff': ['admins.view', 'roles.manage'],
  'security': ['security.view', 'security.manage'],
  'activities': ['audit.view'],
  'app-update': ['production.manage', 'settings.edit'],
  'cms': ['categories.edit', 'settings.edit'],
  'tickets': ['reports.view', 'reports.resolve'],
  'reviews': ['ads.view', 'users.view'],
  'hosting': ['production.view']
};

export function canAccessTab(
  role: AdminRole | string | undefined,
  tab: string,
  customPermissions?: AdminPermission[]
): boolean {
  if (!role) return false;
  if (role === 'Super Admin' || role === 'admin') return true;

  const required = TAB_PERMISSION_MAPPING[tab];
  if (!required || required.length === 0) return true;

  // If user has ANY of the required permissions for the tab, allow entry
  return required.some(perm => hasPermission(role, perm, customPermissions));
}

// Sensitive Actions that enforce Two-Factor Re-authentication (2FA / PIN)
export const SENSITIVE_ACTIONS_REGISTRY: Record<
  string,
  {
    nameBn: string;
    nameEn: string;
    requiredPermission: AdminPermission;
    requires2FA: boolean;
    severity: 'critical' | 'high' | 'medium';
  }
> = {
  'payments.approve': {
    nameBn: 'ম্যানুয়াল পেমেন্ট অনুমোদন',
    nameEn: 'Approve Manual Payment',
    requiredPermission: 'payments.approve',
    requires2FA: true,
    severity: 'high'
  },
  'payments.reject': {
    nameBn: 'ম্যানুয়াল পেমেন্ট বাতিল / রিজেক্ট',
    nameEn: 'Reject Manual Payment',
    requiredPermission: 'payments.reject',
    requires2FA: true,
    severity: 'high'
  },
  'users.delete': {
    nameBn: 'ইউজার অ্যাকাউন্ট স্থায়ীভাবে ডিলিট',
    nameEn: 'Permanent User Deletion',
    requiredPermission: 'users.delete',
    requires2FA: true,
    severity: 'critical'
  },
  'users.suspend': {
    nameBn: 'ইউজার অ্যাকাউন্ট সাসপেন্ড / ব্যান',
    nameEn: 'Suspend User Account',
    requiredPermission: 'users.suspend',
    requires2FA: true,
    severity: 'high'
  },
  'admins.create': {
    nameBn: 'নতুন এডমিন অ্যাকাউন্ট সৃষ্টি',
    nameEn: 'Create New Staff Admin',
    requiredPermission: 'admins.create',
    requires2FA: true,
    severity: 'critical'
  },
  'admins.remove': {
    nameBn: 'এডমিন একাউন্ট অপসরণ / বাতিল',
    nameEn: 'Remove Admin Access',
    requiredPermission: 'admins.remove',
    requires2FA: true,
    severity: 'critical'
  },
  'roles.change': {
    nameBn: 'এডমিন রোল ও পারমিশন পরিবর্তন',
    nameEn: 'Change Admin Role & Permissions',
    requiredPermission: 'roles.manage',
    requires2FA: true,
    severity: 'critical'
  },
  'maintenance.toggle': {
    nameBn: 'সাইট মেইনটেন্যান্স ও মাস্টার সুইচ পরিবর্তন',
    nameEn: 'Toggle Maintenance & Master Lockdown',
    requiredPermission: 'maintenance.manage',
    requires2FA: true,
    severity: 'critical'
  },
  'security.modify': {
    nameBn: 'সিকিউরিটি পলিসি ও এমএফএ কনফিগারেশন',
    nameEn: 'Modify Security Policies & MFA',
    requiredPermission: 'security.manage',
    requires2FA: true,
    severity: 'critical'
  }
};

// Initial Seed Staff Admin Accounts
export const INITIAL_STAFF_ACCOUNTS: StaffAdminAccount[] = [
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
    lastLogin: '2026-03-10T14:20:00.000Z',
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
    lastLogin: '2026-03-10T15:45:00.000Z',
    lastLoginIp: '103.110.22.35',
    createdAt: '2025-03-01T00:00:00.000Z',
    createdBy: 'official.marketbd@gmail.com'
  },
  {
    id: 'staff-mkt-01',
    name: 'Senior Ad Moderator',
    email: 'moderator@marketbd.net',
    phone: '+8801811223344',
    role: 'Marketplace Admin',
    status: 'Active',
    mfaEnabled: false,
    lastLogin: '2026-03-10T11:10:00.000Z',
    lastLoginIp: '103.110.22.92',
    createdAt: '2025-03-05T00:00:00.000Z',
    createdBy: 'official.marketbd@gmail.com'
  },
  {
    id: 'staff-usr-01',
    name: 'User Support Manager',
    email: 'support@marketbd.net',
    phone: '+8801911223344',
    role: 'User Admin',
    status: 'Active',
    mfaEnabled: false,
    lastLogin: '2026-03-09T18:00:00.000Z',
    lastLoginIp: '103.110.22.41',
    createdAt: '2025-03-08T00:00:00.000Z',
    createdBy: 'official.marketbd@gmail.com'
  }
];
