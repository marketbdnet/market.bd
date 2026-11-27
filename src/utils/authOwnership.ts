import { Product, UserProfile } from '../types';
import { getAdminAuthToken } from './adminAuth';

export function normalizePhoneDigits(phone?: string | null): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/^880?/, '').replace(/^0+/, '');
}

export function isEffectiveLoggedIn(
  isLoggedIn: boolean,
  currentUser: UserProfile | null | undefined
): currentUser is UserProfile {
  if (!isLoggedIn || !currentUser || typeof currentUser !== 'object') return false;
  if (!currentUser.id || typeof currentUser.id !== 'string' || !currentUser.id.trim()) return false;
  if (currentUser.isBlocked === true || currentUser.status === 'blocked') return false;
  return true;
}

export function isEffectiveAdmin(
  isLoggedIn: boolean,
  currentUser: UserProfile | null | undefined,
  userRole?: string | null
): boolean {
  if (!isEffectiveLoggedIn(isLoggedIn, currentUser)) return false;
  return (
    userRole === 'admin' ||
    currentUser.role === 'admin' ||
    currentUser.id === 'admin-master'
  );
}

/**
 * Strict ad-ownership check. Never returns true for logged-out visitors and
 * never uses legacy 'user-me' / 'Rahim Tech' / hardcoded email fallbacks.
 */
export function isAdOwner(
  product: Product | null | undefined,
  currentUser: UserProfile | null | undefined,
  isLoggedIn: boolean
): boolean {
  if (!product || !isEffectiveLoggedIn(isLoggedIn, currentUser)) return false;

  const userId = currentUser.id.trim();
  const sellerId = typeof product.seller?.id === 'string' ? product.seller.id.trim() : '';
  const topSellerId = typeof product.sellerId === 'string' ? product.sellerId.trim() : '';

  // Reject legacy placeholder ID from ever granting ownership on client
  if (sellerId && sellerId !== 'user-me' && sellerId === userId) return true;
  if (topSellerId && topSellerId !== 'user-me' && topSellerId === userId) return true;

  const userEmail = String(currentUser.email || '').trim().toLowerCase();
  const sellerEmail = String(product.seller?.email || '').trim().toLowerCase();
  if (userEmail && sellerEmail && userEmail === sellerEmail) return true;

  const userPhone = normalizePhoneDigits(currentUser.phone);
  const sellerPhone = normalizePhoneDigits(product.seller?.phone);
  if (userPhone.length >= 10 && sellerPhone.length >= 10 && userPhone === sellerPhone) {
    return true;
  }

  return false;
}

/**
 * Strips sensitive fields (such as raw password) before syncing user records to cloud/logs.
 */
export function sanitizeUserProfileForCloud(user: UserProfile): Omit<UserProfile, 'password'> {
  const { password: _omitted, ...safeUser } = user as UserProfile & { password?: string };
  return safeUser;
}

/**
 * Builds standard caller-identity and admin-bearer headers for backend API calls.
 */
export function getApiAuthHeaders(
  currentUser?: UserProfile | null,
  includeJsonContentType = true
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  const adminToken = getAdminAuthToken();
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  if (currentUser && currentUser.id && !currentUser.isBlocked && currentUser.status !== 'blocked') {
    headers['x-user-id'] = currentUser.id;
    if (currentUser.email) headers['x-user-email'] = currentUser.email;
    if (currentUser.phone) headers['x-user-phone'] = currentUser.phone;
  }
  return headers;
}
