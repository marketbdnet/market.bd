import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MarketProvider, useMarket } from '../src/context/MarketContext';
import { storage } from '../src/utils/storage';
import { Location, UserProfile } from '../src/types';

// Mock Firebase services to avoid live network requests during unit tests
vi.mock('../src/lib/firebase', () => ({
  db: {},
  auth: { currentUser: null },
  safeFirestoreSetDoc: vi.fn().mockResolvedValue(true),
  safeFirestoreDeleteDoc: vi.fn().mockResolvedValue(true),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Return unsubscribe callback
    return () => {};
  }),
  signOut: vi.fn().mockResolvedValue(true),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
}));

vi.mock('../src/services/adminLogService', () => ({
  INITIAL_ADMIN_LOGS: [],
  saveAdminLogToFirestore: vi.fn().mockResolvedValue(true),
  subscribeToFirestoreAdminLogs: vi.fn(() => () => {}),
  fetchAllAdminLogsFromFirestore: vi.fn().mockResolvedValue([]),
  formatAdminLogTimestamp: vi.fn(() => '28 Aug 2026, 12:00 PM'),
}));

vi.mock('../src/services/pushNotificationService', () => ({
  sendLocalBrowserPushNotification: vi.fn(),
  requestWebPushPermission: vi.fn(),
}));

describe('MarketProvider - Location and User Session States', () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  describe('Location State Initialization', () => {
    it('initializes default location to "All Bangladesh" when storage is empty', () => {
      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Location Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.selectedLocation).toEqual({
        division: 'All Bangladesh',
        district: '',
        thana: ''
      });
      expect(capturedContext!.isLocationModalOpen).toBe(false);
    });

    it('restores stored location from localStorage/storage correctly', () => {
      const customLocation: Location = {
        division: 'Dhaka',
        district: 'Gazipur',
        thana: 'Tongi'
      };
      storage.setItem('marketbd_selected_location', JSON.stringify(customLocation));

      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Location Restored Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.selectedLocation).toEqual(customLocation);
    });

    it('gracefully handles invalid JSON in stored location by falling back to default', () => {
      storage.setItem('marketbd_selected_location', '{broken-json-string');

      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Fallback Location Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.selectedLocation).toEqual({
        division: 'All Bangladesh',
        district: '',
        thana: ''
      });
    });

    it('provides functions to set location and control location modal', () => {
      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Location Controls Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(typeof capturedContext!.setSelectedLocation).toBe('function');
      expect(typeof capturedContext!.setIsLocationModalOpen).toBe('function');
    });
  });

  describe('User Session State Initialization', () => {
    it('initializes as unauthenticated guest user when storage is empty', () => {
      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Guest Session Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.isLoggedIn).toBe(false);
      expect(capturedContext!.currentUser).toBeNull();
      expect(capturedContext!.userRole).toBe('buyer');
      expect(capturedContext!.isAuthModalOpen).toBe(false);
    });

    it('restores logged-in user session and role from storage', () => {
      const mockUser: UserProfile = {
        id: 'usr-verified-seller-99',
        name: 'Tanvir Ahmed',
        phone: '01712345678',
        email: 'tanvir@marketbd.net',
        role: 'seller',
        gender: 'male',
        isVerified: true,
        isBlocked: false,
        status: 'active',
        registeredAt: '2026-08-01T10:00:00.000Z',
        location: { division: 'Dhaka', district: 'Dhaka' }
      };

      storage.setItem('marketbd_is_logged_in', 'true');
      storage.setItem('marketbd_user_role', 'seller');
      storage.setItem('marketbd_auth_user', JSON.stringify(mockUser));

      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Seller Session Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.isLoggedIn).toBe(true);
      expect(capturedContext!.userRole).toBe('seller');
      expect(capturedContext!.currentUser).toEqual(mockUser);
    });

    it('restores Super Admin session and credentials from storage', () => {
      const mockAdmin: UserProfile = {
        id: 'admin-master-01',
        name: 'Official Super Admin',
        phone: '01634025151',
        email: 'official.marketbd@gmail.com',
        role: 'admin',
        gender: 'male',
        isVerified: true,
        isBlocked: false,
        status: 'active',
        registeredAt: '2026-01-01T00:00:00.000Z'
      };

      storage.setItem('marketbd_is_logged_in', 'true');
      storage.setItem('marketbd_user_role', 'admin');
      storage.setItem('marketbd_auth_user', JSON.stringify(mockAdmin));

      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Admin Session Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.isLoggedIn).toBe(true);
      expect(capturedContext!.userRole).toBe('admin');
      expect(capturedContext!.currentUser?.role).toBe('admin');
      expect(capturedContext!.currentUser?.email).toBe('official.marketbd@gmail.com');
    });

    it('initializes registered users list with default users or stored database', () => {
      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Registered Users Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(Array.isArray(capturedContext!.registeredUsers)).toBe(true);
      expect(capturedContext!.registeredUsers.length).toBeGreaterThan(0);
      // Verify standard accounts exist
      const hasSuperAdmin = capturedContext!.registeredUsers.some(
        u => u.email === 'official.marketbd@gmail.com' || u.phone === '01634025151' || u.role === 'admin'
      );
      expect(hasSuperAdmin).toBe(true);
    });

    it('provides session management functions (login, logout, auth modal, user moderation)', () => {
      let capturedContext: ReturnType<typeof useMarket> | null = null;

      const TestConsumer = () => {
        capturedContext = useMarket();
        return React.createElement('div', null, 'Auth Controls Test');
      };

      renderToString(
        React.createElement(MarketProvider, null, React.createElement(TestConsumer))
      );

      expect(capturedContext).not.toBeNull();
      expect(typeof capturedContext!.login).toBe('function');
      expect(typeof capturedContext!.logout).toBe('function');
      expect(typeof capturedContext!.openAuthModal).toBe('function');
      expect(typeof capturedContext!.closeAuthModal).toBe('function');
      expect(typeof capturedContext!.toggleBlockUser).toBe('function');
      expect(typeof capturedContext!.deleteUserById).toBe('function');
      expect(typeof capturedContext!.toggleVerifyUser).toBe('function');
      expect(typeof capturedContext!.addManualUser).toBe('function');
      expect(typeof capturedContext!.updateRegisteredUser).toBe('function');
    });
  });

  describe('useMarket Hook Safety', () => {
    it('throws an error when used outside of a MarketProvider', () => {
      const ComponentWithoutProvider = () => {
        useMarket();
        return null;
      };

      expect(() => {
        renderToString(React.createElement(ComponentWithoutProvider));
      }).toThrow('useMarket must be used within a MarketProvider');
    });
  });
});
