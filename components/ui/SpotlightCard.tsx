'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Type Definitions
// ============================================

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  isLoading?: boolean;
  skeletonHeight?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'button' | 'a';
  href?: string;
  ariaLabel?: string;
}

interface SpotlightPosition {
  x: number;
  y: number;
}

// ============================================
// SpotlightCard Component
// ============================================

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  variant = 'default',
  isLoading = false,
  skeletonHeight = '200px',
  onClick,
  as: Component = 'div',
  href,
  ariaLabel,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightPos, setSpotlightPos] = useState<SpotlightPosition>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate spotlight position relative to card
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSpotlightPos({ x, y });
  }, []);

  // Reset spotlight on mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setSpotlightPos({ x: 50, y: 50 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-ink-100/50 to-ink-200/50',
          'dark:from-ink-800/50 dark:to-ink-900/50',
          'border border-ink-200/50 dark:border-ink-700/50',
          className
        )}
        style={{ height: skeletonHeight }}
        role="status"
        aria-label="Loading content"
      >
        {/* Shimmer Animation */}
        <div
          className="absolute inset-0 gpu-accelerated"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        
        {/* Content placeholder */}
        <div className="p-6 space-y-4">
          <div className="h-6 w-3/4 rounded-lg bg-ink-300/50 dark:bg-ink-600/50" />
          <div className="h-4 w-full rounded-lg bg-ink-300/30 dark:bg-ink-600/30" />
          <div className="h-4 w-2/3 rounded-lg bg-ink-300/30 dark:bg-ink-600/30" />
        </div>
      </div>
    );
  }

  // Variant styles
  const variantStyles: Record<string, string> = {
    default: cn(
      'glass',
      'shadow-md hover:shadow-lg',
      'border-ink-200/30 dark:border-ink-700/30'
    ),
    elevated: cn(
      'glass-strong',
      'shadow-xl hover:shadow-2xl',
      'border-ink-200/50 dark:border-ink-700/50'
    ),
    bordered: cn(
      'bg-white/80 dark:bg-ink-950/80',
      'backdrop-blur-lg',
      'border-2 border-ink-200/50 dark:border-ink-700/50',
      'shadow-sm hover:shadow-md'
    ),
  };

  // Determine if we should use an anchor tag
  if (Component === 'a' && href) {
    return (
      <a
        href={href}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'transition-all duration-200',
          'gpu-accelerated',
          'hover:scale-[1.02] active:scale-[0.98]',
          'focus-visible:ring-2 focus-visible:ring-roj-500 focus-visible:ring-offset-2',
          'cursor-pointer',
          variantStyles[variant],
          className
        )}
        style={
          isMounted
            ? {
                '--spotlight-x': `${spotlightPos.x}%`,
                '--spotlight-y': `${spotlightPos.y}%`,
              } as React.CSSProperties
            : undefined
        }
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={ariaLabel}
        ref={cardRef as React.Ref<HTMLAnchorElement>}
      >
        {/* Spotlight Effect */}
        {isMounted && (
          <div
            className={cn(
              'pointer-events-none absolute inset-0',
              'transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              background: `radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), 
                rgba(245, 158, 11, 0.15) 0%, 
                rgba(245, 158, 11, 0.05) 30%, 
                transparent 70%)`,
            }}
          />
        )}
        
        {/* Border Glow on Hover */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-2xl',
            'transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            boxShadow: `0 0 0 1px rgba(245, 158, 11, 0.3), 0 0 20px rgba(245, 158, 11, 0.1)`,
          }}
        />

        {/* Card Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>
      </a>
    );
  }

  // Regular div/article/button element
  const Element = Component as React.ElementType;

  return (
    <Element
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'transition-all duration-200',
        'gpu-accelerated',
        Component === 'button' && 'w-full text-left',
        onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        'focus-visible:ring-2 focus-visible:ring-roj-500 focus-visible:ring-offset-2',
        variantStyles[variant],
        className
      )}
      style={
        isMounted
          ? {
              '--spotlight-x': `${spotlightPos.x}%`,
              '--spotlight-y': `${spotlightPos.y}%`,
            } as React.CSSProperties
          : undefined
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={ariaLabel}
      role={onClick && !ariaLabel ? 'button' : undefined}
      tabIndex={onClick && !ariaLabel ? 0 : undefined}
    >
      {/* Spotlight Effect */}
      {isMounted && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            'transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: `radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), 
              rgba(245, 158, 11, 0.15) 0%, 
              rgba(245, 158, 11, 0.05) 30%, 
              transparent 70%)`,
          }}
        />
      )}
      
      {/* Border Glow on Hover */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl',
          'transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          boxShadow: `0 0 0 1px rgba(245, 158, 11, 0.3), 0 0 20px rgba(245, 158, 11, 0.1)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </Element>
  );
};

// ============================================
// Exports
// ============================================

export { SpotlightCard };
export type { SpotlightCardProps };

export default SpotlightCard;
