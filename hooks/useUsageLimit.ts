'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================
// Types
// ============================================

interface UsageLimitReturn {
  usageCount: number;
  limit: number;
  incrementUsage: () => boolean;
  resetUsage: () => void;
}

const STORAGE_PREFIX = 'nuron_daily_usage_';
const DEFAULT_LIMIT = 10;

// ============================================
// Helper: Get today's date key (YYYY-MM-DD)
// ============================================

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${STORAGE_PREFIX}${year}-${month}-${day}`;
}

// ============================================
// Hook
// ============================================

export function useUsageLimit(limit: number = DEFAULT_LIMIT): UsageLimitReturn {
  const [usageCount, setUsageCount] = useState<number>(0);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = getTodayKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = parseInt(stored, 10);
      setUsageCount(isNaN(parsed) ? 0 : parsed);
    } else {
      // Clear any old keys to avoid stale data
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      for (const oldKey of keys) {
        if (oldKey !== key) localStorage.removeItem(oldKey);
      }
    }
  }, []);

  // Persist count when it changes (except initial mount)
  useEffect(() => {
    if (usageCount === 0) return; // don't overwrite with default
    const key = getTodayKey();
    localStorage.setItem(key, String(usageCount));
  }, [usageCount]);

  const incrementUsage = useCallback((): boolean => {
    if (usageCount >= limit) return false;
    setUsageCount(prev => {
      const next = prev + 1;
      // Safety check
      if (next > limit) return prev;
      return next;
    });
    return true;
  }, [usageCount, limit]);

  const resetUsage = useCallback(() => {
    setUsageCount(0);
    // Remove key so it starts fresh
    const key = getTodayKey();
    localStorage.removeItem(key);
  }, []);

  return {
    usageCount,
    limit,
    incrementUsage,
    resetUsage,
  };
}
