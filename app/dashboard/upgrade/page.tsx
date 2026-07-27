'use client';

import React, { useState } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';

// ============================================
// Icons
// ============================================

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FastPayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn(className, "font-bold text-green-600 dark:text-green-400")}>FastPay</span>
);

const FIBIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn(className, "font-bold text-purple-600 dark:text-purple-400")}>FIB</span>
);

const ZainCashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn(className, "font-bold text-red-600 dark:text-red-400")}>ZainCash</span>
);

// ============================================
// Plans
// ============================================

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
  paymentOptions: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Free Tier',
    price: '$0',
    period: 'forever',
    features: [
      '10 daily tool uses',
      'Basic course access',
      'Community support',
      'Standard badges',
    ],
    cta: 'Current Plan',
    paymentOptions: [],
  },
  {
    name: 'Individual VIP',
    price: '$9.99',
    period: 'month',
    features: [
      'Unlimited AI tools',
      'All courses + certificates',
      'Priority support',
      'Gold verified badge',
      'Ad‑free experience',
      'Early access to new features',
    ],
    cta: 'Upgrade Now',
    popular: true,
    paymentOptions: ['FastPay', 'FIB', 'ZainCash', 'Manual Upload'],
  },
  {
    name: 'Institutional / School Pass',
    price: '$199',
    period: 'month (up to 50 students)',
    features: [
      'Everything in VIP',
      'Admin dashboard',
      'Student progress analytics',
      'Dedicated support manager',
      'Custom branding',
      'API access (on request)',
    ],
    cta: 'Contact Sales',
    paymentOptions: ['Bank Transfer', 'Manual Invoice'],
  },
];

// ============================================
// Manual Receipt Upload Component
// ============================================

const ManualUploadFallback: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = () => {
    // Simulate upload (in production send to Supabase storage)
    if (file) {
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
    }
  };

  return (
    <div className="mt-6 p-4 rounded-xl bg-ink-50/80 dark:bg-ink-900/80 border border-ink-200/50 dark:border-ink-700/50">
      <h4 className="text-sm font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2">
        <UploadIcon className="w-4 h-4" />
        Local Payment: Manual Receipt Upload
      </h4>
      <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
        Transfer via FastPay/FIB/ZainCash, then upload your receipt.
      </p>
      <div className="flex gap-3 items-center">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-ink-600 dark:text-ink-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-roj-100 file:text-roj-700 hover:file:bg-roj-200 dark:file:bg-roj-900/30 dark:file:text-roj-300"
        />
        <button
          onClick={handleUpload}
          disabled={!file}
          className="px-4 py-2 rounded-xl bg-roj-500 text-white text-sm font-semibold disabled:opacity-50 transition-all hover:bg-roj-600"
        >
          Upload
        </button>
      </div>
      {uploaded && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          ✅ Receipt uploaded. We'll verify within 24 hours.
        </p>
      )}
    </div>
  );
};

// ============================================
// Page
// ============================================

export default function UpgradePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink-900 dark:text-white">
          Upgrade Your Nuron AI Experience
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mt-2 max-w-2xl mx-auto">
          For parents and institutions seeking unlimited access, advanced features, and dedicated support.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <SpotlightCard
            key={plan.name}
            variant="elevated"
            className={cn(
              'flex flex-col',
              plan.popular && 'ring-2 ring-roj-500 scale-105 md:scale-100'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-roj-500 text-white text-xs font-semibold shadow-md">
                Most Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-ink-900 dark:text-white">
                {plan.name}
              </h3>
              <div className="mt-3">
                <span className="text-4xl font-extrabold text-ink-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-ink-500 dark:text-ink-400 text-sm">
                  /{plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                  <CheckIcon className="w-4 h-4 text-roj-500 mt-0.5 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.name === 'Free Tier'}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {plan.cta}
            </button>

            {/* Payment Gateways (only for paid plans) */}
            {plan.paymentOptions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ink-100/50 dark:border-ink-800/50">
                <p className="text-xs text-ink-400 dark:text-ink-500 mb-2">
                  Supported payment methods:
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.paymentOptions.includes('FastPay') && <FastPayIcon className="text-xs" />}
                  {plan.paymentOptions.includes('FIB') && <FIBIcon className="text-xs" />}
                  {plan.paymentOptions.includes('ZainCash') && <ZainCashIcon className="text-xs" />}
                  {plan.paymentOptions.includes('Manual Upload') && (
                    <span className="text-xs font-medium text-ink-500 dark:text-ink-400">
                      📎 Manual Upload
                    </span>
                  )}
                </div>
                {/* Show manual upload fallback if applicable */}
                {plan.paymentOptions.includes('Manual Upload') && <ManualUploadFallback />}
              </div>
            )}
          </SpotlightCard>
        ))}
      </div>

      {/* Institutional Contact */}
      <div className="text-center mt-12 glass rounded-2xl p-8 max-w-2xl mx-auto border border-ink-200/20 dark:border-ink-700/20">
        <h2 className="text-2xl font-bold text-ink-900 dark:text-white mb-2">
          Need a custom plan for your school?
        </h2>
        <p className="text-ink-500 dark:text-ink-400 mb-6">
          Contact our team for volume discounts, LMS integration, and teacher training.
        </p>
        <a
          href="mailto:institutions@nuron.ai"
          className="inline-block px-6 py-3 rounded-xl bg-white/50 dark:bg-ink-800/50 border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white font-semibold hover:bg-white/80 dark:hover:bg-ink-700/50 transition-all"
        >
          Contact Institution Sales
        </a>
      </div>
    </div>
  );
}
