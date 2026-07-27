'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Type Definitions
// ============================================

type UserRole = 'student' | 'educator' | 'institutional_admin';
type Theme = 'light' | 'dark';
type Language = 'sorani' | 'badini';
type Direction = 'ltr' | 'rtl';

interface NavItem {
  id: string;
  label: string;
  labelKu: string;
  icon: React.ReactNode;
  href: string;
  roles: UserRole[];
}

interface DashboardShellProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName?: string;
  userAvatar?: string;
  currentPath?: string;
}

// ============================================
// Icons (Inline SVGs for zero dependencies)
// ============================================

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const LanguageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================
// Navigation Items Configuration
// ============================================

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelKu: 'داشبۆرد',
    icon: <HomeIcon className="w-5 h-5" />,
    href: '/dashboard',
    roles: ['student', 'educator', 'institutional_admin'],
  },
  {
    id: 'courses',
    label: 'Courses',
    labelKu: 'کۆرسەکان',
    icon: <BookIcon className="w-5 h-5" />,
    href: '/courses',
    roles: ['student', 'educator', 'institutional_admin'],
  },
  {
    id: 'community',
    label: 'Community',
    labelKu: 'کۆمەڵگە',
    icon: <UsersIcon className="w-5 h-5" />,
    href: '/community',
    roles: ['student', 'educator'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    labelKu: 'شیکاری',
    icon: <ChartIcon className="w-5 h-5" />,
    href: '/analytics',
    roles: ['educator', 'institutional_admin'],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelKu: 'ڕێکخستنەکان',
    icon: <SettingsIcon className="w-5 h-5" />,
    href: '/settings',
    roles: ['student', 'educator', 'institutional_admin'],
  },
];

// ============================================
// DashboardShell Component
// ============================================

const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  userRole,
  userName = 'بەکارهێنەر',
  userAvatar,
  currentPath = '/dashboard',
}) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('sorani');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive text direction from language
  const direction: Direction = language === 'sorani' || language === 'badini' ? 'rtl' : 'ltr';

  // Apply theme and direction to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', direction);
  }, [theme, direction]);

  // Toggle theme handler
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Toggle language handler
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'sorani' ? 'badini' : 'sorani');
  }, []);

  // Filter navigation items by user role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Get role display name
  const getRoleDisplayName = (role: UserRole): string => {
    const roleMap: Record<UserRole, { en: string; ku: string }> = {
      student: { en: 'Student', ku: 'خوێندکار' },
      educator: { en: 'Educator', ku: 'مامۆستا' },
      institutional_admin: { en: 'Admin', ku: 'بەڕێوەبەر' },
    };
    return language === 'sorani' || language === 'badini' ? roleMap[role].ku : roleMap[role].en;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-ink-50 via-white to-amber-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============================================
          Sidebar Navigation
          ============================================ */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 z-50',
          'flex flex-col w-72',
          'bg-white/80 dark:bg-ink-950/80',
          'backdrop-blur-xl border-r border-ink-100/20 dark:border-ink-800/20',
          'transition-transform duration-300 ease-in-out',
          direction === 'rtl' ? 'right-0' : 'left-0',
          isMobileMenuOpen
            ? 'translate-x-0'
            : direction === 'rtl'
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-100/20 dark:border-ink-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-roj-400 to-roj-600 flex items-center justify-center shadow-lg shadow-roj-500/20">
              <span className="text-white font-bold text-xl">ن</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink-900 dark:text-white">
                Nuron AI
              </h1>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                {language === 'sorani' || language === 'badini' ? 'زیرەکی دەستکرد' : 'AI Intelligence'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-ink-100/50 dark:hover:bg-ink-800/50 transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl',
                  'transition-all duration-200',
                  'text-sm font-medium',
                  isActive
                    ? 'bg-roj-500/10 text-roj-600 dark:text-roj-400 shadow-sm'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100/50 dark:hover:bg-ink-800/50 hover:text-ink-900 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={cn(
                  'flex-shrink-0',
                  isActive ? 'text-roj-500' : ''
                )}>
                  {item.icon}
                </span>
                <span>{language === 'sorani' || language === 'badini' ? item.labelKu : item.label}</span>
                {isActive && (
                  <span className={cn(
                    'ml-auto w-1.5 h-1.5 rounded-full bg-roj-500',
                    direction === 'rtl' ? 'mr-auto ml-0' : 'ml-auto mr-0'
                  )} />
                )}
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className="p-4 border-t border-ink-100/20 dark:border-ink-800/20">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50/50 dark:bg-ink-900/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ink-400 to-ink-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                {getRoleDisplayName(userRole)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================
          Main Content Area
          ============================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-white/60 dark:bg-ink-950/60 backdrop-blur-xl border-b border-ink-100/20 dark:border-ink-800/20">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-ink-100/50 dark:hover:bg-ink-800/50 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Page Title */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
                {language === 'sorani' || language === 'badini' ? 'داشبۆرد' : 'Dashboard'}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2.5 rounded-xl glass-weak hover:bg-ink-100/50 dark:hover:bg-ink-800/50 transition-all duration-200 text-ink-600 dark:text-ink-300"
                aria-label={`Switch language: ${language === 'sorani' ? 'Badini' : 'Sorani'}`}
                title={language === 'sorani' ? 'Switch to Badini' : 'Switch to Sorani'}
              >
                <LanguageIcon className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl glass-weak hover:bg-ink-100/50 dark:hover:bg-ink-800/50 transition-all duration-200 text-ink-600 dark:text-ink-300"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// ============================================
// Exports
// ============================================

export { DashboardShell };
export type { DashboardShellProps, UserRole, Theme, Language };

export default DashboardShell;
