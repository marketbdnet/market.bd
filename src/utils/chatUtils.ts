import { ChatMessage, ChatThread, UserProfile } from '../types';
import { toBengaliNumber } from './dateUtils';

const KNOWN_DUMMY_THREAD_IDS = new Set(['thread-1', 'demo-thread', 'sample-thread-1']);

const KNOWN_DUMMY_MESSAGE_SNIPPETS = [
  'এই ফোনটি কি এখনো পাওয়া যাবে?',
  'স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা',
];

/**
 * Returns true if a chat thread is a legacy dummy/seeded demo conversation
 * that should be purged from user inboxes.
 */
export function isDummyChatThread(thread: Partial<ChatThread> | null | undefined): boolean {
  if (!thread || !thread.id) return true;
  if (KNOWN_DUMMY_THREAD_IDS.has(thread.id)) return true;
  if (thread.id.startsWith('demo-') || thread.id.startsWith('dummy-')) return true;

  // Detect the old static demo seed thread (had 'user-me'/'CurrentUser' + Rahim Tech or empty/canned demo messages)
  const isLegacyRahimSeed =
    thread.seller?.name?.includes('Rahim Tech Gadgets') &&
    thread.buyerName === 'CurrentUser' &&
    Array.isArray(thread.messages) &&
    thread.messages.length <= 2 &&
    thread.messages.some(m => KNOWN_DUMMY_MESSAGE_SNIPPETS.some(s => String(m?.text || '').includes(s)));

  return Boolean(isLegacyRahimSeed);
}

/**
 * Normalizes a phone number for comparison across formats (017... vs +88017...).
 */
function normPhone(p?: string): string {
  return String(p || '').replace(/\D/g, '').replace(/^880?/, '').replace(/^0/, '');
}

/**
 * Checks if the given user is a real participant (buyer or seller) of a chat thread.
 */
export function isUserParticipantInThread(
  thread: ChatThread,
  currentUser: UserProfile | null | undefined
): boolean {
  if (!currentUser) return false;

  const uid = String(currentUser.id || '').trim();
  const uEmail = String(currentUser.email || '').trim().toLowerCase();
  const uPhone = normPhone(currentUser.phone);
  const isAdminUser = currentUser.role === 'admin' || uid === 'admin-master';

  if (uid && (thread.buyerId === uid || thread.seller?.id === uid)) return true;
  if (isAdminUser && (thread.isCustomerCare || thread.seller?.id === 'admin-master' || thread.id?.startsWith('thread-customer-'))) {
    return true;
  }
  if (uEmail && thread.seller?.email && thread.seller.email.trim().toLowerCase() === uEmail) return true;
  if (uEmail && thread.buyerEmail && thread.buyerEmail.trim().toLowerCase() === uEmail) return true;
  if (uPhone && thread.seller?.phone && normPhone(thread.seller.phone) === uPhone) return true;
  if (uPhone && thread.buyerPhone && normPhone(thread.buyerPhone) === uPhone) return true;

  return false;
}

/**
 * Filters chat threads for the active user, removing all dummy threads and non-participant conversations.
 */
export function filterUserChatThreads(
  threads: ChatThread[] | null | undefined,
  currentUser: UserProfile | null | undefined
): ChatThread[] {
  if (!Array.isArray(threads)) return [];
  return threads.filter(t => {
    if (isDummyChatThread(t)) return false;
    if (!currentUser) return false;
    return isUserParticipantInThread(t, currentUser);
  });
}

/**
 * Determines if the given chat message was sent by the currently logged-in viewer.
 */
export function isOwnChatMessage(
  msg: ChatMessage,
  thread: ChatThread,
  currentUser: UserProfile | null | undefined
): boolean {
  if (!msg || !currentUser || !currentUser.id) return false;
  if (msg.senderId === currentUser.id) return true;
  if (
    (currentUser.role === 'admin' || currentUser.id === 'admin-master') &&
    msg.senderId === 'admin-master'
  ) {
    return true;
  }
  return false;
}

/**
 * Formats a real timestamp for chat messages and thread previews without hardcoded dates.
 */
export function formatChatTimestamp(
  rawTime: string | number | Date | undefined,
  language: 'bn' | 'en' = 'bn'
): string {
  if (!rawTime) return language === 'bn' ? 'এইমাত্র' : 'Just now';
  const rawStr = String(rawTime).trim();
  if (rawStr === 'Just now' || rawStr === 'এইমাত্র') {
    return language === 'bn' ? 'এইমাত্র' : 'Just now';
  }

  const d = rawTime instanceof Date ? rawTime : new Date(rawStr);
  if (isNaN(d.getTime())) {
    return rawStr;
  }

  const now = new Date();
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = (hours % 12 || 12).toString().padStart(2, '0');
  const timeEn = `${h12}:${mins} ${ampm}`;
  const timeBn = `${toBengaliNumber(h12)}:${toBengaliNumber(mins)} ${ampm}`;

  if (d.toDateString() === now.toDateString()) {
    return language === 'bn' ? `আজ, ${timeBn}` : `Today, ${timeEn}`;
  }

  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'];

  if (language === 'bn') {
    return `${toBengaliNumber(d.getDate())} ${monthsBn[d.getMonth()]}, ${timeBn}`;
  }
  return `${d.getDate()} ${monthsEn[d.getMonth()]}, ${timeEn}`;
}
