'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Mock Course Data (same as catalog but extended with modules)
interface Module {
  id: string;
  title: string;
  completed: boolean;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // unlisted YouTube embed URL
  modules: Module[];
}

const COURSE_DETAILS: Record<string, CourseDetail> = {
  'sci-12-physics': {
    id: 'sci-12-physics',
    title: '12th Grade Physics (Kurdish)',
    description: 'Electricity, Magnetism, and Modern Physics explained in Sorani.',
    thumbnail: '⚛️',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // example unlisted
    modules: [
      { id: 'mod-1', title: 'Electric Charge & Fields', completed: false },
      { id: 'mod-2', title: 'Electric Potential', completed: false },
      { id: 'mod-3', title: 'Current & Resistance', completed: false },
      { id: 'mod-4', title: 'Magnetic Fields', completed: false },
      { id: 'mod-5', title: 'Electromagnetic Induction', completed: false },
    ],
  },
  'lit-kurdish-poetry': {
    id: 'lit-kurdish-poetry',
    title: 'Kurdish Poetry & Prose',
    description: 'Study classic and modern Kurdish literature.',
    thumbnail: '📜',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    modules: [
      { id: 'mod-1', title: 'Introduction to Kurdish Poetry', completed: false },
      { id: 'mod-2', title: 'Classical Sorani Poets', completed: false },
      { id: 'mod-3', title: 'Modern Free Verse', completed: false },
    ],
  },
  // Add other course details as needed...
};

export default function LessonPlayerPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const supabase = createClient();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'ai-assistant'>('video');
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Load course data (mock)
  useEffect(() => {
    const data = COURSE_DETAILS[courseId];
    if (data) {
      setCourse(data);
      setModules(data.modules);
    }
  }, [courseId]);

  // Fetch user and progress from Supabase (if logged in)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // If logged in, fetch module completions from course_progress
  useEffect(() => {
    if (!userId || !courseId) return;
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('course_progress')
        .select('module_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (!error && data) {
        const completedIds = data.map((d: { module_id: string }) => d.module_id);
        setModules(prev =>
          prev.map(mod => ({
            ...mod,
            completed: completedIds.includes(mod.id),
          }))
        );
      }
    };
    fetchProgress();
  }, [userId, courseId, supabase]);

  // Calculate progress percentage
  useEffect(() => {
    if (modules.length === 0) return;
    const completedCount = modules.filter(m => m.completed).length;
    setProgress(Math.round((completedCount / modules.length) * 100));
  }, [modules]);

  // Toggle module completion
  const toggleModule = useCallback(
    async (moduleId: string) => {
      setModules(prev =>
        prev.map(mod =>
          mod.id === moduleId ? { ...mod, completed: !mod.completed } : mod
        )
      );

      if (userId) {
        const isNowCompleted = !modules.find(m => m.id === moduleId)?.completed;
        // Upsert into course_progress
        const { error } = await supabase.from('course_progress').upsert(
          {
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            completed: isNowCompleted,
            completed_at: isNowCompleted ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,course_id,module_id' }
        );
        if (error) console.error('Failed to update progress:', error);
      }
    },
    [modules, userId, courseId, supabase]
  );

  // Mark all as complete
  const markAllComplete = async () => {
    setModules(prev => prev.map(mod => ({ ...mod, completed: true })));
    if (userId) {
      const inserts = modules.map(mod => ({
        user_id: userId,
        course_id: courseId,
        module_id: mod.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('course_progress').upsert(inserts, {
        onConflict: 'user_id,course_id,module_id',
      });
      if (error) console.error(error);
    }
  };

  if (!course) {
    return <div className="text-center py-20 text-ink-500">Loading course...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-12rem)]">
      {/* Left: Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-ink-100/50 dark:bg-ink-800/50 p-1 rounded-xl">
          {['video', 'notes', 'ai-assistant'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                activeTab === tab
                  ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-sm'
                  : 'text-ink-500 dark:text-ink-400'
              )}
            >
              {tab === 'video' ? 'Video' : tab === 'notes' ? 'Notes' : 'AI Assistant'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'video' && (
          <div className="flex-1 rounded-2xl overflow-hidden glass border border-ink-200/20 dark:border-ink-700/20 shadow-glass">
            <iframe
              src={course.videoUrl}
              title={course.title}
              className="w-full h-full min-h-[400px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="flex-1 glass rounded-2xl p-6 border border-ink-200/20 dark:border-ink-700/20">
            <h3 className="text-lg font-semibold mb-4 text-ink-900 dark:text-white">Lesson Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full h-full min-h-[300px] p-4 rounded-xl bg-white/50 dark:bg-ink-900/50 backdrop-blur border border-ink-200/50 dark:border-ink-700/50 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-roj-500/50 resize-none"
            />
          </div>
        )}
        {activeTab === 'ai-assistant' && (
          <div className="flex-1 glass rounded-2xl p-6 border border-ink-200/20 dark:border-ink-700/20 flex items-center justify-center">
            <div className="text-center text-ink-500 dark:text-ink-400">
              <SparklesIcon className="w-12 h-12 mx-auto mb-2 text-roj-500/50" />
              <p>AI Assistant coming soon – ask questions about this lesson.</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Syllabus Sidebar */}
      <div className="w-full lg:w-80 flex flex-col">
        <SpotlightCard variant="bordered" className="flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-ink-900 dark:text-white mb-4">
            {course.title}
          </h2>
          <div className="flex items-center gap-2 mb-4 text-sm text-ink-500">
            <span className="text-2xl">{course.thumbnail}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 mb-6 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-roj-500 to-roj-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">
            Course Modules
          </h3>
          <ul className="space-y-2 flex-1 overflow-y-auto">
            {modules.map((mod) => (
              <li key={mod.id}>
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-ink-100/50 dark:hover:bg-ink-800/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={mod.completed}
                    onChange={() => toggleModule(mod.id)}
                    className="w-4 h-4 rounded border-ink-300 dark:border-ink-600 text-roj-500 focus:ring-roj-500"
                  />
                  <span className={cn(
                    'text-sm flex-1',
                    mod.completed
                      ? 'text-ink-400 dark:text-ink-500 line-through'
                      : 'text-ink-900 dark:text-white'
                  )}>
                    {mod.title}
                  </span>
                  {mod.completed && (
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              </li>
            ))}
          </ul>

          <button
            onClick={markAllComplete}
            className="mt-4 w-full py-2 rounded-xl bg-roj-500 text-white text-sm font-semibold hover:bg-roj-600 transition-colors shadow-md"
          >
            Mark All as Complete
          </button>
        </SpotlightCard>
      </div>
    </div>
  );
}

// SparklesIcon inline (same as above)
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M12 15l1.5 4.5L18 21l-4.5 1.5L12 27l-1.5-4.5L6 21l4.5-1.5z" opacity="0.6" />
  </svg>
);
