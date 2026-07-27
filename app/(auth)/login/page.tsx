'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magiclink'>('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMagicSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-50 via-white to-amber-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 p-4">
      <SpotlightCard variant="elevated" className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-roj-400 to-roj-600 flex items-center justify-center shadow-lg shadow-roj-500/20 mb-4">
            <span className="text-white font-bold text-xl">ن</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
            Welcome back to Nuron AI
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Toggle login mode */}
        <div className="flex mb-6 bg-ink-100/50 dark:bg-ink-800/50 rounded-xl p-1">
          <button
            onClick={() => { setMode('password'); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'password'
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-sm'
                : 'text-ink-500 dark:text-ink-400'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => { setMode('magiclink'); setMagicSent(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'magiclink'
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-sm'
                : 'text-ink-500 dark:text-ink-400'
            }`}
          >
            Magic Link
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        )}

        {magicSent && (
          <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-sm">
            ✨ Magic link sent! Check your email.
          </div>
        )}

        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
              placeholder="you@example.com"
            />
          </div>

          {mode === 'password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold shadow-lg shadow-roj-500/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-roj-500 hover:text-roj-600 font-medium">
            Create one
          </a>
        </p>
      </SpotlightCard>
    </div>
  );
}
