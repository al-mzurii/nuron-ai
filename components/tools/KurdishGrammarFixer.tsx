'use client';

import React, { useState, useCallback } from 'react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

// Icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M12 15l1.5 4.5L18 21l-4.5 1.5L12 27l-1.5-4.5L6 21l4.5-1.5z" opacity="0.6" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Mock AI Grammar Fixer
const mockGrammarFix = (
  text: string,
  style: 'standard' | 'formal' | 'informal'
): { corrected: string; diff: Array<{ type: 'unchanged' | 'changed' | 'added' | 'removed'; value: string }> } => {
  // Extremely simplified demo: replace common errors, adjust style
  let corrected = text;

  // Common Kurdish spelling fixes (demo only)
  corrected = corrected.replace(/\bئهم\b/g, 'ئەم');
  corrected = corrected.replace(/\bدهكات\b/g, 'دەکات');
  corrected = corrected.replace(/\bدهكهین\b/g, 'دەکەین');

  // Style adjustments (very basic)
  if (style === 'formal') {
    corrected = corrected.replace(/\bبۆ\b/g, 'بۆ ئەوەی');
  } else if (style === 'informal') {
    corrected = corrected.replace(/\bبۆ ئەوەی\b/g, 'بۆ');
  }

  // Build a simple diff
  const originalWords = text.split(' ');
  const correctedWords = corrected.split(' ');
  const maxLen = Math.max(originalWords.length, correctedWords.length);
  const diff = [];

  for (let i = 0; i < maxLen; i++) {
    const orig = originalWords[i] || '';
    const corr = correctedWords[i] || '';
    if (orig === corr) {
      diff.push({ type: 'unchanged', value: orig });
    } else if (!orig) {
      diff.push({ type: 'added', value: corr });
    } else if (!corr) {
      diff.push({ type: 'removed', value: orig });
    } else {
      // changed – we'll show both for simplicity, but we'll treat as changed and show corrected
      diff.push({ type: 'changed', value: `${orig} → ${corr}` });
    }
  }

  return { corrected, diff };
};

const KurdishGrammarFixer: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [diff, setDiff] = useState<Array<{ type: string; value: string }>>([]);
  const [style, setStyle] = useState<'standard' | 'formal' | 'informal'>('standard');
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { usageCount, limit, incrementUsage } = useUsageLimit();

  const handleFix = useCallback(() => {
    if (!sourceText.trim()) return;

    const canConvert = incrementUsage();
    if (!canConvert) {
      setShowLimitModal(true);
      return;
    }

    const result = mockGrammarFix(sourceText, style);
    setCorrectedText(result.corrected);
    setDiff(result.diff);
  }, [sourceText, style, incrementUsage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-roj-500/10 text-roj-500">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
            Kurdish Grammar Fixer
          </h2>
        </div>
        {/* Style Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-500 dark:text-ink-400">Style:</span>
          <div className="flex bg-ink-100/50 dark:bg-ink-800/50 rounded-xl p-1">
            {(['standard', 'formal', 'informal'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                  style === s
                    ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-sm'
                    : 'text-ink-500 dark:text-ink-400'
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Source Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink-600 dark:text-ink-300">
          Enter Kurdish Text
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Type or paste your Kurdish text..."
          className="w-full h-40 p-4 rounded-2xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 resize-none transition-all"
        />
        <div className="flex justify-between text-xs text-ink-400 dark:text-ink-500 px-2">
          <span>{sourceText.length} characters</span>
          <span>{sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>

      {/* Fix Button */}
      <div className="flex justify-center">
        <button
          onClick={handleFix}
          disabled={!sourceText.trim()}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold shadow-lg shadow-roj-500/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Fix Grammar & Style
        </button>
      </div>

      {/* Diff / Comparison View */}
      {diff.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original */}
          <SpotlightCard variant="bordered" className="p-4">
            <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-400 mb-2">Original</h3>
            <div className="whitespace-pre-wrap text-ink-900 dark:text-white">
              {sourceText}
            </div>
          </SpotlightCard>
          {/* Corrected */}
          <SpotlightCard variant="elevated" className="p-4">
            <h3 className="text-sm font-semibold text-roj-500 mb-2">Corrected</h3>
            <div className="whitespace-pre-wrap text-ink-900 dark:text-white">
              {correctedText}
            </div>
            <div className="mt-4 p-3 bg-ink-50/80 dark:bg-ink-900/80 rounded-xl text-xs">
              <p className="font-medium text-ink-700 dark:text-ink-300 mb-1">Changes:</p>
              {diff
                .filter(d => d.type !== 'unchanged')
                .map((d, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-block px-1 py-0.5 rounded mr-1 mb-1',
                      d.type === 'added' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                      d.type === 'removed' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 line-through',
                      d.type === 'changed' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                    )}
                  >
                    {d.value}
                  </span>
                ))}
            </div>
          </SpotlightCard>
        </div>
      )}

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
              You&apos;ve used all {limit} free fixes for today. Upgrade to Pro for unlimited grammar corrections.
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

export default KurdishGrammarFixer;
