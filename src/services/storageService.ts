/**
 * Safe local storage wrapper with JSON parsing and fallback error handling.
 */
export const storageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[storageService] Error reading key ${key}:`, e);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[storageService] Error setting key ${key}:`, e);
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[storageService] Error removing key ${key}:`, e);
    }
  },

  clearAll(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[storageService] Error clearing localStorage:', e);
    }
  }
};
