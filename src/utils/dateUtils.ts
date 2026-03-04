import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';

/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'PPP'
): string {
  if (!date) return '-';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return '-';
  
  return format(parsedDate, pattern, { locale: nb });
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return '-';
  
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: nb });
}

/**
 * Format a date for datetime input
 */
export function formatDateTimeInput(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Get current timestamp in ISO format
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) && parsedDate > new Date();
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) && parsedDate < new Date();
}
