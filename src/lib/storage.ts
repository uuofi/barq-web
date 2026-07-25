import { logger } from '@/lib/logger';

/**
 * Safe localStorage wrapper.
 *
 * Direct `localStorage` access throws in Safari private mode, in embedded
 * webviews, and whenever a browser blocks storage — an uncaught throw in a
 * top-level module takes the whole site down with a blank page. Every access
 * on this site goes through here, which degrades to "no persistence" instead.
 */

const isAvailable = (): boolean => {
  try {
    const probe = '__barq_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
};

const available = typeof window !== 'undefined' && isAvailable();

export const storage = {
  get available(): boolean {
    return available;
  },

  read(key: string): string | null {
    if (!available) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  write(key: string, value: string): void {
    if (!available) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Quota exceeded is the realistic case here — not fatal for this site.
      logger.warn('storage write failed', { key, error });
    }
  },

  remove(key: string): void {
    if (!available) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing meaningful to do */
    }
  },

  /** Reads and JSON-parses. Returns `fallback` on any failure. */
  readJson<T>(key: string, fallback: T): T {
    const raw = this.read(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  writeJson(key: string, value: unknown): void {
    try {
      this.write(key, JSON.stringify(value));
    } catch (error) {
      logger.warn('storage serialise failed', { key, error });
    }
  },
};

export default storage;
