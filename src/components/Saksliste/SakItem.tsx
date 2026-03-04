import React, { useState, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Sak } from '@/types';
import { timeAgo } from '@/utils/timeAgo';
import { GlassCard } from '@/components/UI/GlassCard';
import { Button } from '@/components/UI/Button';

/**
 * Utility to merge tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SakItemProps {
  sak: Sak;
  onEdit?: (sak: Sak) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Sak['status']) => void;
  onPriorityChange?: (id: string, priority: Sak['priority']) => void;
}

/**
 * Individual Sak (Case) item component
 */
export const SakItem: React.FC<SakItemProps> = ({
  sak,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  
  const statusLabels: Record<string, string> = {
    draft: 'Utkast',
    pending: 'Venter',
    approved: 'Godkjent',
    rejected: 'Avvist',
  };
  
  const priorityColors: Record<string, string> = {
    low: 'text-blue-600 dark:text-blue-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  };
  
  const priorityLabels: Record<string, string> = {
    low: 'Lav',
    medium: 'Medium',
    high: 'Høy',
    critical: 'Kritisk',
  };
  
  return (
    <GlassCard 
      className="relative" 
      padding="md"
      data-testid={`sak-item-${sak.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {sak.title}
            </h3>
            <span 
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                sak.status ? statusColors[sak.status] ?? '' : ''
              )}
              data-testid="sak-status"
            >
              {sak.status ? statusLabels[sak.status] ?? sak.status : ''}
            </span>
          </div>
          
          <p className={cn(
            'mt-1 text-sm text-gray-600 dark:text-gray-400',
            !isExpanded && 'line-clamp-2'
          )}>
            {sak.description}
          </p>
          
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeAgo(sak.created_at)}
            </span>
            
            {sak.assignee && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {sak.assignee}
              </span>
            )}
            
            <span className={cn('flex items-center gap-1 font-medium', sak.priority ? priorityColors[sak.priority] ?? '' : '')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {sak.priority ? priorityLabels[sak.priority] ?? sak.priority : ''}
            </span>
            
            {sak.entertainmentScore !== undefined && (
              <span 
                className="flex items-center gap-1 text-purple-600 dark:text-purple-400"
                data-testid="entertainment-score"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {sak.entertainmentScore}/100
              </span>
            )}
          </div>
          
          {sak.tags && sak.tags.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {sak.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {(onEdit || onDelete || onStatusChange) && (
            <div className="flex items-center gap-1">
              {onStatusChange && sak.status !== 'approved' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(sak.id, 'approved')}
                  aria-label="Godkjenn sak"
                  data-testid="approve-btn"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </Button>
              )}
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(sak)}
                  aria-label="Rediger sak"
                  data-testid="edit-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(sak.id)}
                  aria-label="Slett sak"
                  data-testid="delete-btn"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          )}
          
          {sak.description && sak.description.length > 100 && (
            <button
              onClick={handleToggleExpand}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isExpanded ? 'Vis mindre' : 'Vis mer'}
              aria-expanded={isExpanded}
            >
              <svg 
                className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
