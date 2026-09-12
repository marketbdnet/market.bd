/**
 * MarketBD.Net Bangladeshi Mobile Number Validation & Privacy Utility
 * Handles normalization, validation, masking, and buyer visibility checks.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // Standard 11-digit format e.g. 01712345678
  formatted: string;  // Formatted display e.g. 01712-345678
  telLink: string;    // tel:+8801712345678
  error?: string;
}

/**
 * Validates and normalizes Bangladeshi mobile numbers.
 * Supported operators: Grameenphone/Skitto (013, 017), Banglalink (014, 019), Teletalk (015), Robi/Airtel (016, 018).
 */
export function validateBangladeshiPhone(input: string, lang: 'bn' | 'en' = 'bn'): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      telLink: '',
      error: lang === 'bn' ? 'মোবাইল নম্বর দেওয়া আবশ্যক' : 'Mobile phone number is required'
    };
  }

  // Remove spaces, hyphens, parentheses, dots
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '');

  // Remove leading + or 00
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // If starts with 880 (country code), remove 88 so it starts with 0
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(2); // now starts with '0'
  }

  // Validate Bangladeshi 11-digit mobile regex: 01[3-9]\d{8}
  const bdMobileRegex = /^01[3-9]\d{8}$/;

  if (!bdMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      formatted: cleaned,
      telLink: '',
      error: lang === 'bn'
        ? 'সঠিক বাংলাদেশি ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712-345678)'
        : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712-345678)'
    };
  }

  // Format as 01XXX-XXXXXX
  const formatted = `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
  const telLink = `tel:+88${cleaned}`;

  return {
    isValid: true,
    normalized: cleaned,
    formatted,
    telLink
  };
}

/**
 * Masks a phone number to protect privacy while hinting the digits.
 * e.g. "01712345678" -> "01712-***678"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '01***-***000';
  const clean = phone.replace(/[^\d]/g, '');
  if (clean.length >= 11) {
    const prefix = clean.substring(0, 5);
    const suffix = clean.substring(clean.length - 3);
    return `${prefix}-***${suffix}`;
  }
  if (clean.length >= 7) {
    return `${clean.substring(0, 3)}***${clean.substring(clean.length - 2)}`;
  }
  return '01***-***000';
}

/**
 * Formats standard 11-digit phone number as 01XXX-XXXXXX for crisp UI presentation.
 */
export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone) return '';
  const clean = phone.replace(/[^\d]/g, '');
  if (clean.length === 11) {
    return `${clean.substring(0, 5)}-${clean.substring(5)}`;
  }
  return phone;
}

/**
 * Checks whether the seller's phone number is explicitly permitted to be shown to buyers.
 * Privacy-First Default: Returns FALSE (Hidden) unless explicitly enabled.
 */
export function isPhoneVisibleToBuyers(entity?: {
  hidePhone?: boolean;
  showPhoneNumber?: boolean;
  seller?: { hidePhone?: boolean; showPhoneNumber?: boolean };
} | null): boolean {
  if (!entity) return false;

  // Direct seller object or parent product object checks
  const sellerObj = entity.seller || entity;

  // If showPhoneNumber is explicitly true, it is visible
  if (sellerObj.showPhoneNumber === true || entity.showPhoneNumber === true) {
    return true;
  }

  // If hidePhone is explicitly false AND showPhoneNumber is not false, it is visible
  if (sellerObj.hidePhone === false && sellerObj.showPhoneNumber !== false) {
    return true;
  }

  // Otherwise, default to hidden (Privacy protection)
  return false;
}
