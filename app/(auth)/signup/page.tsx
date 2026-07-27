'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import type { Database } from '@/types/database';

type UserRole = Database['public']['Enums']['user_role'];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // stored in raw_user_meta_data, used by trigger
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
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
            Join Nuron AI
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm">
            Create your free account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-sm">
              🎉 Account created! Check your email to confirm your address.
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold shadow-lg shadow-roj-500/20 hover:shadow-xl transition-all"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
                placeholder="Your name"
              />
            </div>
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'educator', 'scholar'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                      role === r
                        ? 'bg-roj-500 text-white shadow-md shadow-roj-500/20'
                        : 'bg-ink-100/50 dark:bg-ink-800/50 text-ink-600 dark:text-ink-300 hover:bg-ink-200/50 dark:hover:bg-ink-700/50'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold shadow-lg shadow-roj-500/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
          Already have an account?{' '}
          <a href="/login" className="text-roj-500 hover:text-roj-600 font-medium">
            Sign in
          </a>
        </p>
      </SpotlightCard>
    </div>
  );
}
