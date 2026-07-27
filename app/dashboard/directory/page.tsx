'use client';

import React, { useState, useMemo } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';

// ============================================
// Icons (inline SVGs)
// ============================================

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const VerifiedBadgeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ============================================
// Types & Mock Data
// ============================================

interface Educator {
  id: string;
  name: string;
  title: string; // e.g., "Physics Teacher", "Linguist"
  specialty: string[]; // searchable tags
  verified: boolean;
  badge?: 'gold' | 'blue';
  avatarInitials: string;
  institution?: string;
  bio: string;
}

const MOCK_EDUCATORS: Educator[] = [
  {
    id: '1',
    name: 'Dr. Shirin Ahmed',
    title: 'Grade 12 Physics Specialist',
    specialty: ['Physics', 'Grade 12', 'Sorani'],
    verified: true,
    badge: 'gold',
    avatarInitials: 'ش',
    institution: 'Salahaddin University',
    bio: 'Experienced Physics educator with 15+ years teaching Kurdish students. Specializing in Electricity & Magnetism.',
  },
  {
    id: '2',
    name: 'Hemin Othman',
    title: 'Badini Linguistics Expert',
    specialty: ['Linguistics', 'Badini', 'Literature'],
    verified: true,
    badge: 'blue',
    avatarInitials: 'هـ',
    institution: 'Duhok Institute',
    bio: 'Preserving and teaching Badini Kurdish through modern methods.',
  },
  {
    id: '3',
    name: 'Sara Kareem',
    title: 'AI & Computer Science Tutor',
    specialty: ['AI', 'Python', 'Programming'],
    verified: true,
    badge: 'gold',
    avatarInitials: 'س',
    institution: 'University of Sulaimani',
    bio: 'Bridging the gap between Kurdish students and the tech world.',
  },
  {
    id: '4',
    name: 'Ali Hassan',
    title: 'Mathematics Teacher',
    specialty: ['Mathematics', 'Grade 12', 'Calculus'],
    verified: false,
    avatarInitials: 'ع',
    bio: 'Helping students excel in advanced mathematics.',
  },
];

// ============================================
// Page Component
// ============================================

export default function DirectoryPage() {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  const allSpecialties = useMemo(() => {
    const tags = new Set<string>();
    MOCK_EDUCATORS.forEach((e) => e.specialty.forEach((s) => tags.add(s)));
    return Array.from(tags);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_EDUCATORS.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.bio.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty =
        specialtyFilter === 'all' || e.specialty.includes(specialtyFilter);
      return matchesSearch && matchesSpecialty;
    });
  }, [search, specialtyFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900 dark:text-white">
          Verified Educators & Scholars
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mt-1">
          Connect with top Kurdish experts for consultations and tutoring.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, subject, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
          />
        </div>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-roj-500/50"
        >
          <option value="all">All Specialties</option>
          {allSpecialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Educator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((edu) => (
          <SpotlightCard
            key={edu.id}
            variant="elevated"
            className="flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ink-400 to-ink-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {edu.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink-900 dark:text-white">
                      {edu.name}
                    </h3>
                    {edu.verified && (
                      <VerifiedBadgeIcon
                        className={cn(
                          'w-5 h-5',
                          edu.badge === 'gold'
                            ? 'text-roj-500'
                            : 'text-blue-500 dark:text-blue-400'
                        )}
                      />
                    )}
                  </div>
                  <p className="text-sm text-ink-500 dark:text-ink-400">
                    {edu.title}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-ink-600 dark:text-ink-300 mb-4 flex-1">
              {edu.bio}
            </p>

            {/* Specialty Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {edu.specialty.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Institution */}
            {edu.institution && (
              <p className="text-xs text-ink-400 dark:text-ink-500 mb-4">
                🏛️ {edu.institution}
              </p>
            )}

            {/* Action Button */}
            <button
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-roj-500 to-roj-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => alert(`Booking session with ${edu.name} (demo)`)}
            >
              <CalendarIcon className="w-4 h-4" />
              Request Consultation
            </button>
          </SpotlightCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-ink-500 dark:text-ink-400">
          No educators found matching your criteria.
        </div>
      )}
    </div>
  );
}
