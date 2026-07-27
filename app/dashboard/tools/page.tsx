'use client';

import React, { useState, useMemo } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ============================================
// Icon Components (inline SVGs – no extra deps)
// ============================================

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M12 15l1.5 4.5L18 21l-4.5 1.5L12 27l-1.5-4.5L6 21l4.5-1.5z" opacity="0.6" />
  </svg>
);

// ============================================
// Types & Configuration
// ============================================

type Category = 'linguistic' | 'educational' | 'document';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: React.ReactNode;
  href: string;
  isPremium?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'dialect-bridge',
    name: 'Kurdish Dialect Bridge',
    description: 'Convert between Sorani & Badini instantly',
    category: 'linguistic',
    icon: <SparklesIcon className="w-8 h-8 text-roj-500" />,
    href: '/dashboard/tools/kurdish-dialect-bridge',
    isPremium: false,
  },
  {
    id: 'grammar-checker',
    name: 'Grammar Checker',
    description: 'Proofread Kurdish text with AI',
    category: 'linguistic',
    icon: <BookIcon className="w-8 h-8 text-ink-500" />,
    href: '/dashboard/tools/grammar-checker',
    isPremium: true,
  },
  {
    id: 'plagiarism-detector',
    name: 'Plagiarism Detector',
    description: 'Originality reports for Kurdish assignments',
    category: 'educational',
    icon: <SearchIcon className="w-8 h-8 text-teal-500" />,
    href: '/dashboard/tools/plagiarism',
    isPremium: true,
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    description: 'Extract Kurdish text from scanned documents',
    category: 'document',
    icon: <FileTextIcon className="w-8 h-8 text-rose-500" />,
    href: '/dashboard/tools/pdf-to-text',
    isPremium: false,
  },
  {
    id: 'ocr-scanner',
    name: 'Kurdish OCR Scanner',
    description: 'Image‑to‑text for Kurdish script',
    category: 'document',
    icon: <FileTextIcon className="w-8 h-8 text-rose-500" />,
    href: '/dashboard/tools/ocr',
    isPremium: true,
  },
  {
    id: 'lesson-plan-generator',
    name: 'Lesson Plan Generator',
    description: 'AI‑powered Kurdish lesson plans for educators',
    category: 'educational',
    icon: <BookIcon className="w-8 h-8 text-teal-500" />,
    href: '/dashboard/tools/lesson-plan',
    isPremium: true,
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  linguistic: 'Linguistic Tools',
  educational: 'Educational Assistants',
  document: 'Document Converters',
};

// ============================================
// Page Component
// ============================================

export default function ToolsHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const { usageCount, limit } = useUsageLimit();

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const usagePercentage = Math.min((usageCount / limit) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Freemium Usage Banner */}
      <div className="glass rounded-2xl p-4 border border-roj-200/50 dark:border-roj-800/30 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-roj-500/10 text-roj-500">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">
                Free Conversions Used Today
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                {usageCount}/{limit} free conversions
              </p>
            </div>
          </div>
          <Link
            href="/upgrade"
            className="px-4 py-2 rounded-xl bg-roj-500 text-white text-sm font-semibold hover:bg-roj-600 transition-colors shadow-md"
          >
            Upgrade to Pro
          </Link>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-roj-500 to-roj-600 transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 dark:text-ink-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/70 dark:bg-ink-900/70 backdrop-blur-lg border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
            aria-label="Search tools"
          />
        </div>
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'linguistic', 'educational', 'document'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                activeCategory === cat
                  ? 'bg-roj-500 text-white shadow-md shadow-roj-500/20'
                  : 'glass text-ink-600 dark:text-ink-300 hover:bg-white/40 dark:hover:bg-ink-800/40'
              )}
            >
              {cat === 'all' ? 'All Tools' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Link key={tool.id} href={tool.href} className="block">
            <SpotlightCard
              as="div"
              variant="elevated"
              className="h-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-ink-50/80 dark:bg-ink-900/80">
                    {tool.icon}
                  </div>
                  {tool.isPremium && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-roj-100 dark:bg-roj-900/50 text-roj-700 dark:text-roj-300">
                      Pro
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-ink-900 dark:text-white mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 flex-1">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-roj-500 dark:text-roj-400">
                  <span>Open Tool</span>
                  <svg className="w-4 h-4 ml-1 icon-auto-flip" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </SpotlightCard>
          </Link>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-ink-500 dark:text-ink-400">
          No tools found matching your search.
        </div>
      )}
    </div>
  );
}
