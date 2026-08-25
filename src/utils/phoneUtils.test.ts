import { describe, it, expect } from 'vitest';
import {
  validateBangladeshiPhone,
  maskPhoneNumber,
  formatPhoneDisplay,
  isPhoneVisibleToBuyers
} from './phoneUtils';
import { Product, Seller } from '../types';

describe('Seller Phone Number Privacy & Validation Engine', () => {
  describe('TEST 1: Bangladeshi Mobile Number Validation', () => {
    it('validates correct 11-digit Bangladeshi mobile numbers with various operators', () => {
      const validNumbers = [
        '01712345678', // Grameenphone
        '01812345678', // Robi
        '01912345678', // Banglalink
        '01512345678', // Teletalk
        '01612345678', // Airtel
        '01312345678', // Skitto
        '01412345678', // Banglalink new
      ];

      validNumbers.forEach((num) => {
        const result = validateBangladeshiPhone(num);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe(num);
      });
    });

    it('handles +880 and spaces/dashes correctly', () => {
      const formatted = '+880 1712-345678';
      const result = validateBangladeshiPhone(formatted);
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('01712345678');
    });

    it('rejects invalid, short, or foreign phone numbers', () => {
      expect(validateBangladeshiPhone('').isValid).toBe(false);
      expect(validateBangladeshiPhone('017123456').isValid).toBe(false); // Too short
      expect(validateBangladeshiPhone('01234567890').isValid).toBe(false); // 012 is not valid BD prefix
      expect(validateBangladeshiPhone('01012345678').isValid).toBe(false); // 010 is not valid BD prefix
      expect(validateBangladeshiPhone('abcdefghijk').isValid).toBe(false);
    });
  });

  describe('TEST 2: Default Phone Privacy (Default is Hidden / Protected)', () => {
    it('returns false for phone visibility when no explicit toggle is enabled', () => {
      const defaultProduct: Partial<Product> = {
        id: 'ad-101',
        title: 'iPhone 15 Pro Max',
        seller: {
          id: 'user-1',
          name: 'Rahim Khan',
          avatar: '',
          phone: '01712345678',
          email: 'rahim@example.com',
          hidePhone: true,
          showPhoneNumber: false,
          memberSince: '2026',
          location: { division: 'dhaka', district: 'dhaka_d', thana: 'dhanmondi' },
          isVerified: true,
          rating: 5,
          totalReviews: 10
        }
      };

      expect(isPhoneVisibleToBuyers(defaultProduct)).toBe(false);
      expect(isPhoneVisibleToBuyers(defaultProduct.seller)).toBe(false);
    });

    it('returns false if showPhoneNumber is undefined or false', () => {
      const productWithEmptyFlags: Partial<Product> = {
        id: 'ad-102',
        title: 'Toyota Aqua',
        seller: {
          id: 'user-2',
          name: 'Karim Ahmed',
          avatar: '',
          phone: '01812345678',
          email: 'karim@example.com',
          memberSince: '2026',
          location: { division: 'dhaka', district: 'dhaka_d', thana: 'gulshan' },
          isVerified: true,
          rating: 4.8,
          totalReviews: 5
        }
      };

      expect(isPhoneVisibleToBuyers(productWithEmptyFlags)).toBe(false);
    });
  });

  describe('TEST 3: Seller Explicitly Turns ON "Show Phone Number"', () => {
    it('returns true when seller enables showPhoneNumber: true', () => {
      const publicProduct: Partial<Product> = {
        id: 'ad-103',
        title: 'MacBook Pro M3',
        showPhoneNumber: true,
        seller: {
          id: 'user-3',
          name: 'Shop Tech BD',
          avatar: '',
          phone: '01912345678',
          email: 'shop@example.com',
          hidePhone: false,
          showPhoneNumber: true,
          memberSince: '2026',
          location: { division: 'dhaka', district: 'dhaka_d', thana: 'uttara' },
          isVerified: true,
          rating: 4.9,
          totalReviews: 24
        }
      };

      expect(isPhoneVisibleToBuyers(publicProduct)).toBe(true);
      expect(isPhoneVisibleToBuyers(publicProduct.seller)).toBe(true);
    });
  });

  describe('TEST 4: Phone Number Masking and Formatting', () => {
    it('correctly masks phone numbers for secure previews', () => {
      expect(maskPhoneNumber('01712345678')).toBe('01712-***678');
      expect(maskPhoneNumber('01812-345678')).toBe('01812-***678');
      expect(maskPhoneNumber('')).toBe('01***-***000');
    });

    it('formats phone numbers clearly for display and call links', () => {
      expect(formatPhoneDisplay('01712345678')).toBe('01712-345678');
    });
  });

  describe('TEST 5: Cross-Seller Privacy Isolation', () => {
    it('ensures Seller A privacy choice does not affect Seller B', () => {
      const sellerA_Hidden: Partial<Product> = {
        id: 'ad-A',
        showPhoneNumber: false,
        seller: {
          id: 'seller-A',
          name: 'Seller A (Private)',
          avatar: '',
          phone: '01711111111',
          email: 'sellerA@example.com',
          hidePhone: true,
          showPhoneNumber: false,
          memberSince: '2026',
          location: { division: 'dhaka', district: 'dhaka_d', thana: 'mirpur' },
          isVerified: true,
          rating: 5,
          totalReviews: 1
        }
      };

      const sellerB_Visible: Partial<Product> = {
        id: 'ad-B',
        showPhoneNumber: true,
        seller: {
          id: 'seller-B',
          name: 'Seller B (Public Store)',
          avatar: '',
          phone: '01999999999',
          email: 'sellerB@example.com',
          hidePhone: false,
          showPhoneNumber: true,
          memberSince: '2026',
          location: { division: 'chattogram', district: 'chattogram_d', thana: 'kotwali' },
          isVerified: true,
          rating: 5,
          totalReviews: 12
        }
      };

      expect(isPhoneVisibleToBuyers(sellerA_Hidden)).toBe(false);
      expect(isPhoneVisibleToBuyers(sellerB_Visible)).toBe(true);
    });
  });
});
