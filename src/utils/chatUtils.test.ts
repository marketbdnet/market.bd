import { describe, it, expect } from 'vitest';
import {
  isUserParticipantInThread,
  isOwnChatMessage,
  filterUserChatThreads,
} from './chatUtils';
import { ChatThread, ChatMessage } from '../types';
import { UserProfile } from '../context/MarketContext';

const makeCustomer = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-cust-1',
  name: 'Karim Mia',
  phone: '01711223344',
  email: 'karim@example.com',
  role: 'buyer',
  memberSince: '2026',
  status: 'active',
  ...overrides,
});

const makeAdmin = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'admin-master',
  name: 'MarketBD Admin',
  phone: '01533830784',
  email: 'official.marketsbd@gmail.com',
  role: 'admin',
  memberSince: '2024',
  status: 'active',
  ...overrides,
});

describe('chatUtils customer & admin participation', () => {
  it('matches buyer and admin in customer-care threads', () => {
    const thread: ChatThread = {
      id: 'thread-customer-user-cust-1',
      productId: 'customer-support',
      productTitle: 'Customer Chat: Karim Mia',
      productImage: '/logo.jpg',
      productPrice: 0,
      seller: {
        id: 'admin-master',
        name: 'MarketBD Support',
        avatar: '/logo.jpg',
        phone: '01533830784',
        email: 'official.marketsbd@gmail.com',
        memberSince: '2024',
        location: { division: 'Dhaka', district: 'Dhaka' },
        isVerified: true,
        rating: 5,
        totalReviews: 0,
      },
      buyerId: 'user-cust-1',
      buyerName: 'Karim Mia',
      buyerPhone: '+8801711223344',
      buyerEmail: 'karim@example.com',
      isCustomerCare: true,
      lastMessage: 'Hello',
      lastMessageTime: '2026-11-20T00:00:00Z',
      unreadCount: 0,
      messages: [],
    };

    const buyer = makeCustomer({ id: 'different-session-id' }); // matches by phone/email too
    const secondaryAdmin = makeAdmin({ id: 'admin-staff-2' });
    const unrelatedUser = makeCustomer({
      id: 'user-other',
      phone: '01899887766',
      email: 'other@example.com',
    });

    expect(isUserParticipantInThread(thread, buyer)).toBe(true);
    expect(isUserParticipantInThread(thread, secondaryAdmin)).toBe(true);
    expect(isUserParticipantInThread(thread, unrelatedUser)).toBe(false);
  });

  it('determines message ownership for admin and customer accurately', () => {
    const thread: ChatThread = {
      id: 'thread-customer-user-cust-1',
      productId: 'customer-support',
      productTitle: 'Customer Chat',
      productImage: '/logo.jpg',
      productPrice: 0,
      seller: {
        id: 'admin-master',
        name: 'MarketBD Support',
        avatar: '/logo.jpg',
        phone: '01533830784',
        email: 'official.marketsbd@gmail.com',
        memberSince: '2024',
        location: { division: 'Dhaka', district: 'Dhaka' },
        isVerified: true,
        rating: 5,
        totalReviews: 0,
      },
      buyerId: 'user-cust-1',
      buyerName: 'Karim Mia',
      isCustomerCare: true,
      lastMessage: 'Hi',
      lastMessageTime: '2026-11-20T00:00:00Z',
      unreadCount: 0,
      messages: [],
    };

    const adminMsg: ChatMessage = {
      id: 'm1',
      senderId: 'admin-master',
      receiverId: 'user-cust-1',
      productId: 'customer-support',
      text: 'How can we help?',
      timestamp: '2026-11-20T00:00:00Z',
      status: 'sent',
    };

    const buyerMsg: ChatMessage = {
      id: 'm2',
      senderId: 'user-cust-1',
      receiverId: 'admin-master',
      productId: 'customer-support',
      text: 'Need help with my ad',
      timestamp: '2026-11-20T00:01:00Z',
      status: 'sent',
    };

    const admin = makeAdmin({ id: 'staff-admin' });
    const buyer = makeCustomer();

    expect(isOwnChatMessage(adminMsg, thread, admin)).toBe(true);
    expect(isOwnChatMessage(adminMsg, thread, buyer)).toBe(false);
    expect(isOwnChatMessage(buyerMsg, thread, buyer)).toBe(true);
    expect(isOwnChatMessage(buyerMsg, thread, admin)).toBe(false);
  });

  it('filters out dummy threads while retaining active customer threads', () => {
    const admin = makeAdmin();
    const threads: ChatThread[] = [
      {
        id: 'thread-1',
        productId: 'p1',
        productTitle: 'Dummy',
        productImage: '',
        productPrice: 0,
        seller: {
          id: 'admin-master',
          name: 'Dummy',
          avatar: '',
          phone: '',
          email: 'dummy@example.com',
          memberSince: '2024',
          location: { division: 'Dhaka', district: 'Dhaka' },
          isVerified: false,
          rating: 0,
          totalReviews: 0,
        },
        buyerId: 'user-1',
        buyerName: 'Dummy',
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        messages: [],
      },
      {
        id: 'thread-customer-user-cust-1',
        productId: 'customer-support',
        productTitle: 'Real Customer',
        productImage: '/logo.jpg',
        productPrice: 0,
        seller: {
          id: 'admin-master',
          name: 'MarketBD Support',
          avatar: '/logo.jpg',
          phone: '01533830784',
          email: 'official.marketsbd@gmail.com',
          memberSince: '2024',
          location: { division: 'Dhaka', district: 'Dhaka' },
          isVerified: true,
          rating: 5,
          totalReviews: 0,
        },
        buyerId: 'user-cust-1',
        buyerName: 'Karim',
        isCustomerCare: true,
        lastMessage: 'Hello',
        lastMessageTime: '2026-11-20T00:00:00Z',
        unreadCount: 0,
        messages: [],
      },
    ];

    const filtered = filterUserChatThreads(threads, admin);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('thread-customer-user-cust-1');
  });
});
