import { PaymentMethod } from '../types/payment';

export const PAYMENT_ACCOUNTS_CONFIG = {
  bKash: {
    accountNumber: '+8801723230230',
    type: 'configured_account',
    instructions:
      'bKash থেকে এই নম্বরে টাকা পাঠান এবং Transaction ID সংরক্ষণ করুন।'
  },

  Nagad: {
    accountNumber: '+8801723230230',
    type: 'configured_account',
    instructions:
      'Nagad থেকে এই নম্বরে টাকা পাঠান এবং Transaction ID সংরক্ষণ করুন।'
  },

  Rocket: {
    accountNumber: '+8801533830784',
    type: 'configured_account',
    instructions:
      'Rocket থেকে এই নম্বরে টাকা পাঠান এবং Transaction ID সংরক্ষণ করুন।'
  }
} as const;

export const OFFICIAL_PAYMENT_EMAIL = 'official.marketbd@gmail.com';

/**
 * Normalizes payment account number for comparison (removes spaces, dashes, country code prefix)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+88/, '');
}

/**
 * Returns the configured account details for a payment method
 */
export function getPaymentAccount(method: PaymentMethod) {
  return PAYMENT_ACCOUNTS_CONFIG[method] || null;
}

/**
 * Validates that the submitted account number matches the central configuration for that method
 */
export function validatePaymentAccount(method: PaymentMethod, submittedAccountNumber: string): boolean {
  const config = PAYMENT_ACCOUNTS_CONFIG[method];
  if (!config) return false;
  return normalizePhoneNumber(config.accountNumber) === normalizePhoneNumber(submittedAccountNumber);
}

/**
 * Normalizes transaction ID (removes spaces, converts to uppercase)
 */
export function normalizeTransactionId(trxId: string): string {
  if (!trxId) return '';
  return trxId.trim().toUpperCase().replace(/[\s\-]/g, '');
}
