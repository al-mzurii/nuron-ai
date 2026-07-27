'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const STORAGE_PREFIX = 'nuron_daily_usage_';
const DEFAULT_LIMIT = 10;

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${STORAGE_PREFIX}${y}-${m}-${d}`;
}

export function useUsageLimit(limit: number = DEFAULT_LIMIT) {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Detect logged‑in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch usage count: Supabase (if user) or localStorage
  useEffect(() => {
    if (userId) {
      // Fetch today's count from Supabase
      const fetchUsage = async () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const { count, error } = await supabase
          .from('tool_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('used_at', `${today}T00:00:00Z`)
          .lte('used_at', `${today}T23:59:59Z`);
        if (!error && count !== null) {
          setUsageCount(count);
        }
      };
      fetchUsage();
    } else {
      // Fallback to localStorage
      const key = getTodayKey();
      const stored = localStorage.getItem(key);
      setUsageCount(stored ? parseInt(stored, 10) || 0 : 0);
    }
  }, [userId, supabase]);

  // Persist count to localStorage as fallback (for anonymous)
  useEffect(() => {
    if (!userId && usageCount > 0) {
      const key = getTodayKey();
      localStorage.setItem(key, String(usageCount));
    }
  }, [userId, usageCount]);

  const incrementUsage = useCallback((): boolean => {
    if (usageCount >= limit) return false;
    setUsageCount(prev => prev + 1);

    // If logged in, insert a log row into Supabase
    if (userId) {
      supabase.from('tool_usage_logs').insert({
        user_id: userId,
        tool_name: 'kurdish-dialect-bridge', // Adjust as needed
        used_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('Failed to log tool usage:', error);
      });
    }

    return true;
  }, [usageCount, limit, userId, supabase]);

  const resetUsage = useCallback(() => {
    setUsageCount(0);
    if (!userId) {
      localStorage.removeItem(getTodayKey());
    }
    // For Supabase, we don't delete rows; daily count resets naturally next day
  }, [userId]);

  return { usageCount, limit, incrementUsage, resetUsage };
}
