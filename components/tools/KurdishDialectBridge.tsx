'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { cn } from '@/lib/utils';

// ============================================
// Icon Components
// ============================================

const SwapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ============================================
// Mock Conversion Engine (demo only)
// ============================================

const mockDialectConversion = (
  text: string,
  direction: 'soraniToBadini' | 'badiniToSorani'
): string => {
  // In a real app, this would call the Nuron AI API.
  // For demonstration we simulate simple character swaps and add a tag.
  const soraniToBadiniMap: Record<string, string> = {
    'ە': 'ه',
    'ک': 'ك',
    'ی': 'ي',
  };
  const badiniToSoraniMap: Record<string, string> = {
    'ه': 'ە',
    'ك': 'ک',
    'ي': 'ی',
  };

  const map = direction === 'soraniToBadini' ? soraniToBadiniMap : badiniToSoraniMap;
  let result = '';
  for (const char of text) {
    result += map[char] || char;
  }

  const suffix = direction === 'soraniToBadini' ? ' [Badini]' : ' [Sorani]';
  return result + suffix;
};

// ============================================
// Component
// ============================================

const KurdishDialectBridge: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [direction, setDirection] = useState<'soraniToBadini' | 'badiniToSorani'>('soraniToBadini');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { usageCount, limit, incrementUsage } = useUsageLimit();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Word & character count for source
  const charCount = sourceText.length;
  const wordCount = sourceText.trim() === '' ? 0 : sourceText.trim().split(/\s+/).length;

  // Conversion handler with usage limit check
  const handleConvert = useCallback(() => {
    if (!sourceText.trim()) return;

    // Check/update daily limit
    const canConvert = incrementUsage();
    if (!canConvert) {
      setShowLimitModal(true);
      return;
    }

    const converted = mockDialectConversion(sourceText, direction);
    setTargetText(converted);
  }, [sourceText, direction, incrementUsage]);

  // Dialect toggle
  const handleToggleDirection = useCallback(() => {
    setDirection(prev =>
      prev === 'soraniToBadini' ? 'badiniToSorani' : 'soraniToBadini'
    );
    setTargetText(''); // clear output
  }, []);

  // Text‑to‑speech
  const handleSpeak = useCallback(() => {
    if (!targetText || !synthRef.current) return;

    // Stop any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(targetText);
    // Try Kurdish (Sorani) – fallback to generic Arabic if not supported
    utterance.lang = 'ku';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      // Fallback: try 'ar' for broader Kurdish dialect support
      const fallback = new SpeechSynthesisUtterance(targetText);
      fallback.lang = 'ar';
      fallback.rate = 0.9;
      synthRef.current?.speak(fallback);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [targetText]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!targetText) return;
    try {
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = targetText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [targetText]);

  return (
    <div className="space-y-6">
      {/* Header with dialect toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-roj-500/10 text-roj-500">
            <SwapIcon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
            Kurdish Dialect Bridge
          </h2>
        </div>
        <button
          onClick={handleToggleDirection}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/40 dark:hover:bg-ink-800/40 text-ink-700 dark:text-ink-200 font-medium transition-all"
        >
          <span className="text-sm">
            {direction === 'soraniToBadini' ? 'Sorani → Badini' : 'Badini → Sorani'}
          </span>
          <SwapIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ink-600 dark:text-ink-300">
            {direction === 'soraniToBadini' ? 'Sorani Text' : 'Badini Text'}
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste Kurdish text..."
            className="w-full h-48 p-4 rounded-2xl bg-white/70 dark:bg-ink-900/70 backdrop-blur-lg border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 resize-none transition-all"
            aria-label="Source text input"
          />
          <div className="flex items-center justify-between text-xs text-ink-400 dark:text-ink-500 px-2">
            <span>{charCount} characters</span>
            <span>{wordCount} words</span>
          </div>
        </div>

        {/* Target Output */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ink-600 dark:text-ink-300">
            {direction === 'soraniToBadini' ? 'Badini Output' : 'Sorani Output'}
          </label>
          <div className="relative">
            <div
              className="w-full h-48 p-4 rounded-2xl bg-ink-50/80 dark:bg-ink-900/50 backdrop-blur-lg border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white overflow-y-auto whitespace-pre-wrap"
              aria-live="polite"
            >
              {targetText || (
                <span className="text-ink-400 dark:text-ink-500 italic">
                  Converted text will appear here...
                </span>
              )}
            </div>
            {/* Action buttons overlay */}
            {targetText && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-ink-800/50 transition-all"
                  title="Copy to clipboard"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSpeak}
                  disabled={isSpeaking || !synthRef.current}
                  className={cn(
                    'p-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-ink-800/50 transition-all',
                    isSpeaking && 'text-roj-500'
                  )}
                  title="Listen"
                >
                  <PlayIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {copied && (
            <p className="text-xs text-green-600 dark:text-green-400 px-2">Copied!</p>
          )}
        </div>
      </div>

      {/* Convert Button */}
      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={!sourceText.trim()}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold shadow-lg shadow-roj-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Convert Now
        </button>
      </div>

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-rose-500/10 text-rose-500">
                <AlertTriangleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink-900 dark:text-white">
                Daily Limit Reached
              </h3>
            </div>
            <p className="text-ink-600 dark:text-ink-300 mb-6">
              You&apos;ve used all {limit} free conversions for today. Upgrade to
              Pro for unlimited access and advanced features.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-4 py-2 rounded-xl glass text-sm font-medium hover:bg-white/40 dark:hover:bg-ink-800/40"
              >
                Maybe Later
              </button>
              <a
                href="/upgrade"
                className="px-4 py-2 rounded-xl bg-roj-500 text-white text-sm font-semibold hover:bg-roj-600 transition-colors"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KurdishDialectBridge;
