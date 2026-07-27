'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';

// Types & Mock Data
type CourseCategory = 'science' | 'literature' | 'ai-skills' | 'all';

interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  modules: number;
  progress: number; // 0-100
  thumbnail: string; // could be an emoji or icon for now
}

const MOCK_COURSES: Course[] = [
  {
    id: 'sci-12-physics',
    title: '12th Grade Physics (Kurdish)',
    description: 'Electricity, Magnetism, and Modern Physics explained in Sorani.',
    category: 'science',
    modules: 12,
    progress: 45,
    thumbnail: '⚛️',
  },
  {
    id: 'lit-kurdish-poetry',
    title: 'Kurdish Poetry & Prose',
    description: 'Study classic and modern Kurdish literature.',
    category: 'literature',
    modules: 8,
    progress: 10,
    thumbnail: '📜',
  },
  {
    id: 'ai-intro',
    title: 'Introduction to AI (Kurdish)',
    description: 'Learn AI fundamentals in Kurdish, from zero to hero.',
    category: 'ai-skills',
    modules: 6,
    progress: 70,
    thumbnail: '🤖',
  },
  {
    id: 'sci-12-chemistry',
    title: '12th Grade Chemistry',
    description: 'Organic chemistry and reactions.',
    category: 'science',
    modules: 10,
    progress: 0,
    thumbnail: '🧪',
  },
  {
    id: 'lit-badini-folklore',
    title: 'Badini Folklore Stories',
    description: 'Deep dive into Badini oral traditions.',
    category: 'literature',
    modules: 5,
    progress: 30,
    thumbnail: '🏺',
  },
  {
    id: 'ai-python',
    title: 'Python for Kurdish Students',
    description: 'Coding with Kurdish explanations.',
    category: 'ai-skills',
    modules: 8,
    progress: 15,
    thumbnail: '🐍',
  },
];

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  all: 'All Courses',
  science: 'Scientific 12th Grade',
  literature: 'Kurdish Literature',
  'ai-skills': 'AI Skills',
};

export default function CourseCatalogPage() {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');
  const [search, setSearch] = useState('');

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter((course) => {
      const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900 dark:text-white">Course Catalog</h1>
        <p className="text-ink-500 dark:text-ink-400 mt-1">
          Explore Kurdish and scientific courses tailored for you.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/70 dark:bg-ink-900/70 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-roj-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(Object.keys(CATEGORY_LABELS) as CourseCategory[]).map((cat) => (
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
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="block">
            <SpotlightCard
              as="div"
              variant="elevated"
              className="h-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{course.thumbnail}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                    {course.modules} modules
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-ink-900 dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 flex-1 mb-4">
                  {course.description}
                </p>
                {/* Progress Bar */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-ink-500 dark:text-ink-400 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-roj-500 to-roj-600 transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </Link>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-ink-500 dark:text-ink-400">
          No courses found matching your criteria.
        </div>
      )}
    </div>
  );
}
