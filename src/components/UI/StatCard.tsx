import { clsx, type ClassValue } from 'clsx';
import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

/**
 * Stat card component for displaying metrics
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      title,
      value,
      change,
      changeLabel = 'vs forrige uke',
      icon,
      trend = 'neutral',
      loading = false,
      ...props
    },
    ref
  ) => {
    const trendColors = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    };
    
    const trendIcons = {
      up: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      down: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      neutral: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      ),
    };
    
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg animate-pulse',
            className
          )}
          {...props}
        >
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'p-6 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700/30',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400" id={`stat-title-${title}`}>
              {title}
            </p>
            <p 
              className="mt-2 text-3xl font-bold text-gray-900 dark:text-white"
              aria-labelledby={`stat-title-${title}`}
            >
              {value}
            </p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                <span className={cn('flex items-center', trendColors[trend])}>
                  {trendIcons[trend]}
                  <span className="ml-1 text-sm font-medium">
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {changeLabel}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
