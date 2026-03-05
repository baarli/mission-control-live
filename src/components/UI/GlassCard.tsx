import { clsx, type ClassValue } from 'clsx';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

/**
 * Glass-morphism card component
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, variant = 'default', padding = 'md', hoverable = false, children, ...props },
    ref
  ) => {
    const baseStyles = 'rounded-xl backdrop-blur-md transition-all duration-200';

    const variants = {
      default:
        'bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-lg',
      elevated:
        'bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-700/40 shadow-xl',
      outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
