import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { formatPostDateTime, formatPostedAt } from '../src/utils/dateUtils';
import {
  isDummyChatThread,
  filterUserChatThreads,
  isOwnChatMessage,
  formatChatTimestamp,
} from '../src/utils/chatUtils';
import { ChatThread, UserProfile } from '../src/types';

const makeThread = (overrides: Partial<ChatThread> = {}): ChatThread => ({
  id: 'thread-real-101',
  productId: 'prod-500',
  productTitle: 'iPhone 15 Pro',
  productImage: 'https://example.com/phone.jpg',
  productPrice: 125000,
  seller: {
    id: 'seller-202',
    name: 'Karim Electronics',
    avatar: '',
    phone: '01711223344',
    email: 'karim@example.com',
    memberSince: '2025',
    location: { division: 'dhaka' },
    isVerified: true,
    rating: 4.9,
    totalReviews: 12,
  },
  buyerId: 'buyer-101',
  buyerName: 'Sajib Hasan',
  lastMessage: 'এটি কি এখনো আছে?',
  lastMessageTime: '2026-11-18T10:30:00.000Z',
  unreadCount: 1,
  messages: [
    {
      id: 'm-1',
      senderId: 'buyer-101',
      receiverId: 'seller-202',
      productId: 'prod-500',
      text: 'এটি কি এখনো আছে?',
      timestamp: '2026-11-18T10:30:00.000Z',
      status: 'delivered',
    },
  ],
  ...overrides,
});

describe('Exact Post Date & Time Formatting (Recent & Featured Ads)', () => {
  it('formats exact date and time in English and Bengali numerals', () => {
    const sample = new Date(2026, 10, 17, 7, 12); // 17 Nov 2026, 07:12 AM
    const enOut = formatPostDateTime(sample, 'en');
    const bnOut = formatPostDateTime(sample, 'bn');

    expect(enOut).toContain('17 Nov 2026');
    expect(enOut).toContain('07:12 AM');

    expect(bnOut).toContain('১৭ নভে ২০২৬');
    expect(bnOut).toContain('০৭:১২ AM');
  });

  it('keeps relative formatPostedAt working cleanly alongside formatPostDateTime', () => {
    const now = new Date();
    expect(formatPostedAt(now, 'en')).toBe('Just now');
    expect(formatPostedAt(now, 'bn')).toBe('এইমাত্র');
  });
});

describe('MarketBD Clean Chat Architecture & Dummy Purge', () => {
  it('detects and purges legacy/dummy threads cleanly', () => {
    expect(isDummyChatThread(makeThread({ id: 'thread-1' }))).toBe(true);
    expect(isDummyChatThread(makeThread({ id: 'demo-abc' }))).toBe(true);
    expect(isDummyChatThread(makeThread({ id: 'dummy-xyz' }))).toBe(true);
    expect(
      isDummyChatThread(
        makeThread({
          id: 'legacy-123',
          buyerName: 'CurrentUser',
          seller: { ...makeThread().seller, name: 'Rahim Tech Gadgets' },
          messages: [
            {
              id: 'm1',
              senderId: 'user-me',
              receiverId: 's1',
              productId: 'p1',
              text: 'এই ফোনটি কি এখনো পাওয়া যাবে?',
              timestamp: 'Just now',
            },
          ],
        })
      )
    ).toBe(true);

    expect(isDummyChatThread(makeThread())).toBe(false);
  });

  it('filters threads strictly to real participants (buyer or seller)', () => {
    const buyer: UserProfile = {
      id: 'buyer-101',
      name: 'Sajib Hasan',
      phone: '01811000000',
      email: 'sajib@example.com',
      role: 'buyer',
    };
    const seller: UserProfile = {
      id: 'seller-202',
      name: 'Karim Electronics',
      phone: '01711223344',
      email: 'karim@example.com',
      role: 'seller',
    };
    const stranger: UserProfile = {
      id: 'user-999',
      name: 'Stranger',
      phone: '01999999999',
      email: 'stranger@example.com',
      role: 'buyer',
    };

    const list = [makeThread(), makeThread({ id: 'thread-1' })];
    expect(filterUserChatThreads(list, buyer).length).toBe(1);
    expect(filterUserChatThreads(list, seller).length).toBe(1);
    expect(filterUserChatThreads(list, stranger).length).toBe(0);
    expect(filterUserChatThreads(list, null).length).toBe(0);
  });

  it('correctly determines message ownership for both buyer and seller', () => {
    const thread = makeThread();
    const buyer: UserProfile = {
      id: 'buyer-101',
      name: 'Sajib Hasan',
      phone: '01811000000',
      email: 'sajib@example.com',
      role: 'buyer',
    };
    const seller: UserProfile = {
      id: 'seller-202',
      name: 'Karim Electronics',
      phone: '01711223344',
      email: 'karim@example.com',
      role: 'seller',
    };

    expect(isOwnChatMessage(thread.messages[0], thread, buyer)).toBe(true);
    expect(isOwnChatMessage(thread.messages[0], thread, seller)).toBe(false);
  });

  it('formats chat timestamps cleanly without hardcoded placeholder dates', () => {
    const formatted = formatChatTimestamp('2026-11-18T14:05:00.000Z', 'en');
    expect(formatted).not.toContain('28 Jul 2026');
    expect(formatted.length).toBeGreaterThan(3);
  });
});

describe('Structural Verification of HomePage 5+4x4 Layout & Clean Chat UI', () => {
  it('configures Featured & Urgent as 5-in-a-row and Recent Ads as 4-per-row with 16 items', () => {
    const homeSource = fs.readFileSync(path.join(process.cwd(), 'src/pages/HomePage.tsx'), 'utf-8');
    expect(homeSource).toContain('lg:grid-cols-5');
    expect(homeSource).toContain('lg:grid-cols-4');
    expect(homeSource).toContain('useState<number>(16)');
    expect(homeSource).toContain('formatPostDateTime');
  });

  it('contains zero hardcoded dummy date/voice/typing/fake-agent placeholders in chat components', () => {
    const drawerSource = fs.readFileSync(path.join(process.cwd(), 'src/components/Chat/ChatDrawer.tsx'), 'utf-8');
    const careSource = fs.readFileSync(path.join(process.cwd(), 'src/components/Chat/CustomerCareChat.tsx'), 'utf-8');

    expect(drawerSource).not.toContain('28 Jul 2026');
    expect(drawerSource).not.toContain('ভয়েস মেসেজ');
    expect(drawerSource).not.toContain('isSellerTyping');

    expect(careSource).not.toContain('FEMALE_AGENTS');
    expect(careSource).not.toContain('MALE_AGENTS');
  });
});
