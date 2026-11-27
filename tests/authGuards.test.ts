import { describe, it, expect } from 'vitest';
import {
  isEffectiveLoggedIn,
  isEffectiveAdmin,
  isAdOwner,
  normalizePhoneDigits,
  sanitizeUserProfileForCloud,
} from '../src/utils/authOwnership';
import { isUserParticipantInThread, isOwnChatMessage } from '../src/utils/chatUtils';
import { Product, UserProfile, ChatThread, ChatMessage } from '../src/types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-test-1',
  title: 'Samsung Galaxy S24 Ultra',
  price: 115000,
  category: 'mobiles',
  location: 'Dhaka',
  condition: 'used_like_new',
  images: [],
  postedAt: '2026-11-20T10:00:00.000Z',
  views: 12,
  seller: {
    id: 'seller-real-99',
    name: 'Karim Mobile Shop',
    phone: '+8801711223344',
    email: 'karim@example.com',
    isVerified: true,
    location: 'Dhaka',
  },
  ...overrides,
});

const makeUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-real-42',
  name: 'Nadia Rahman',
  phone: '01812345678',
  email: 'nadia@example.com',
  role: 'seller',
  ...overrides,
});

describe('Auth, Role & Ad Ownership Security Guards', () => {
  it('denies login status when logged out, missing id, or blocked', () => {
    expect(isEffectiveLoggedIn(false, makeUser())).toBe(false);
    expect(isEffectiveLoggedIn(true, null)).toBe(false);
    expect(isEffectiveLoggedIn(true, makeUser({ id: '' }))).toBe(false);
    expect(isEffectiveLoggedIn(true, makeUser({ id: '   ' }))).toBe(false);
    expect(isEffectiveLoggedIn(true, makeUser({ isBlocked: true }))).toBe(false);
    expect(isEffectiveLoggedIn(true, makeUser({ status: 'blocked' }))).toBe(false);
    expect(isEffectiveLoggedIn(true, makeUser())).toBe(true);
  });

  it('denies admin privilege when logged out or blocked even with stale admin role', () => {
    expect(isEffectiveAdmin(false, makeUser({ role: 'admin', id: 'admin-master' }), 'admin')).toBe(false);
    expect(isEffectiveAdmin(true, makeUser({ role: 'admin', isBlocked: true }), 'admin')).toBe(false);
    expect(isEffectiveAdmin(true, makeUser({ role: 'buyer' }), 'buyer')).toBe(false);
    expect(isEffectiveAdmin(true, makeUser({ role: 'admin' }), 'seller')).toBe(true);
    expect(isEffectiveAdmin(true, makeUser({ id: 'admin-master' }), 'seller')).toBe(true);
  });

  it('rejects ad ownership for logged-out visitors and legacy user-me / Rahim Tech / hardcoded contacts', () => {
    const legacyRahimAd = makeProduct({
      sellerId: 'user-me',
      seller: {
        id: 'user-me',
        name: 'Rahim Tech Gadgets',
        phone: '01634025151',
        email: 'official.marketbd@gmail.com',
        isVerified: true,
        location: 'Dhaka',
      },
    });

    // Logged-out visitor on a fresh PC must NEVER own any ad
    expect(isAdOwner(legacyRahimAd, null, false)).toBe(false);
    expect(isAdOwner(legacyRahimAd, makeUser({ id: 'user-me' }), false)).toBe(false);

    // Even if logged in as user-me or another regular seller, legacy 'user-me' and 'Rahim Tech Gadgets' do not grant ownership
    expect(isAdOwner(legacyRahimAd, makeUser({ id: 'user-me' }), true)).toBe(false);
    expect(isAdOwner(legacyRahimAd, makeUser({ id: 'user-other', name: 'Rahim Tech Gadgets' }), true)).toBe(false);
  });

  it('grants ad ownership strictly on matching authenticated user id, email, or normalized phone', () => {
    const sellerUser = makeUser({
      id: 'seller-real-99',
      email: 'KARIM@example.com',
      phone: '01711223344',
    });

    expect(isAdOwner(makeProduct(), sellerUser, true)).toBe(true);
    expect(isAdOwner(makeProduct({ seller: { ...makeProduct().seller!, id: 'other-id' } }), sellerUser, true)).toBe(true);
    expect(normalizePhoneDigits('+8801711-223344')).toBe('1711223344');

    const unrelatedUser = makeUser({ id: 'stranger-1', email: 'stranger@example.com', phone: '01999888777' });
    expect(isAdOwner(makeProduct(), unrelatedUser, true)).toBe(false);
  });

  it('strips plaintext password from profiles before cloud sync', () => {
    const userWithPw = {
      ...makeUser(),
      password: 'SuperSecretPassword123!',
    } as UserProfile & { password?: string };

    const sanitized = sanitizeUserProfileForCloud(userWithPw);
    expect((sanitized as any).password).toBeUndefined();
    expect(sanitized.id).toBe('user-real-42');
    expect(sanitized.name).toBe('Nadia Rahman');
    expect(sanitized.phone).toBe('01812345678');
  });

  it('blocks logged-out users from claiming legacy user-me chat ownership or threads', () => {
    const thread: ChatThread = {
      id: 'thread-99',
      productId: 'prod-test-1',
      productTitle: 'Phone',
      productPrice: 10000,
      productImage: '',
      seller: {
        id: 'seller-1',
        name: 'Seller One',
        phone: '01711111111',
        isVerified: true,
        location: 'Dhaka',
      },
      buyerId: 'user-me',
      buyerName: 'Nadia Rahman',
      lastMessage: 'Hi',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [],
    };
    const msg: ChatMessage = {
      id: 'm1',
      senderId: 'user-me',
      text: 'Hello',
      timestamp: 'Just now',
    };

    expect(isUserParticipantInThread(thread, null)).toBe(false);
    expect(isUserParticipantInThread(thread, makeUser())).toBe(false);
    expect(isOwnChatMessage(msg, thread, null)).toBe(false);
    expect(isOwnChatMessage(msg, thread, makeUser())).toBe(false);
  });
});
