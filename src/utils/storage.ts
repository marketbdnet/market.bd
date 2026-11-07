const inMemoryFallback: Record<string, string> = {};

export const storage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Storage access restricted in WebView / Private Browsing
    }
    return inMemoryFallback[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Fallback to memory
    }
    inMemoryFallback[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Fallback
    }
    delete inMemoryFallback[key];
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      // Fallback
    }
    Object.keys(inMemoryFallback).forEach(k => delete inMemoryFallback[k]);
  }
};

export function safeParseJSON<T>(jsonString: string | null | undefined, fallbackValue: T): T {
  if (!jsonString || typeof jsonString !== 'string') return fallbackValue;
  try {
    const parsed = JSON.parse(jsonString);
    return (parsed !== undefined && parsed !== null) ? parsed : fallbackValue;
  } catch (err) {
    console.warn('[SafeJSON] Failed to parse JSON, using fallback:', err);
    return fallbackValue;
  }
}

