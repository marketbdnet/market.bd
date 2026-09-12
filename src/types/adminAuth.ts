// Enterprise Role-Based Access Control (RBAC) & Granular Permission Types for MarketBD

export type AdminRole =
  | 'Super Admin'
  | 'Security Admin'
  | 'Marketplace Admin'
  | 'Payment Admin'
  | 'User Admin'
  | 'Order Admin'
  | 'Content/Category Admin'
  | 'Support Admin'
  | 'Analyst / Read Only';

export type AdminPermission =
  // Advertisements
  | 'ads.view'
  | 'ads.create'
  | 'ads.edit'
  | 'ads.approve'
  | 'ads.reject'
  | 'ads.delete'
  // Users & Customers
  | 'users.view'
  | 'users.edit'
  | 'users.suspend'
  | 'users.delete'
  | 'reports.view'
  | 'reports.resolve'
  // Payments & Financials
  | 'payments.view'
  | 'payments.verify'
  | 'payments.approve'
  | 'payments.reject'
  | 'billing.view'
  | 'billing.edit'
  // Categories & Taxonomy
  | 'categories.view'
  | 'categories.create'
  | 'categories.edit'
  | 'categories.delete'
  // Orders
  | 'orders.view'
  | 'orders.edit'
  | 'orders.status'
  // System & Settings
  | 'settings.view'
  | 'settings.edit'
  | 'maintenance.manage'
  // Staff & Admin Governance
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.remove'
  | 'roles.manage'
  // Security Center & MFA
  | 'security.view'
  | 'security.manage'
  | 'mfa.manage'
  | 'sessions.view'
  | 'sessions.revoke'
  // Audit Logs
  | 'audit.view'
  | 'audit.export'
  // Analytics & Reports
  | 'analytics.view'
  // Production Controls
  | 'production.view'
  | 'production.manage';

export interface StaffAdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  customPermissions?: AdminPermission[]; // Optional overrides on top of role defaults
  status: 'Active' | 'Suspended';
  mfaEnabled: boolean;
  mfaSecret?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  createdAt: string;
  createdBy?: string;
}

export interface AdminSessionRecord {
  id: string;
  sessionToken: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  adminRole: AdminRole;
  deviceName: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActiveTime: string;
  isCurrent?: boolean;
}

export interface SecurityEventRecord {
  id: string;
  type: 'login_success' | 'login_failed' | 'mfa_verified' | 'mfa_failed' | 'session_revoked' | 'unauthorized_attempt' | 'sensitive_action_performed';
  adminEmail?: string;
  ip: string;
  device: string;
  details: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SensitiveActionRequest {
  actionName: string;
  targetId?: string;
  targetTitle?: string;
  payload?: any;
  securityPinOrOtp?: string;
}
