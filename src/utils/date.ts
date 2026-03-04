/* ============================================
   DATE UTILITIES
   ============================================ */

import { 
  format, 
  formatDistance, 
  isValid, 
  parseISO, 
  isToday, 
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns';
import { nb } from 'date-fns/locale';

/**
 * Format date for display (Norwegian format)
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, 'dd.MM.yyyy', { locale: nb });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, 'dd.MM.yyyy HH:mm', { locale: nb });
}

/**
 * Format relative time (e.g., "2 timer siden")
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return formatDistance(parsedDate, new Date(), { 
    addSuffix: true, 
    locale: nb 
  });
}

/**
 * Format as "I dag", "I går", or date
 */
export function formatFriendlyDate(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  if (isToday(parsedDate)) {
    return `I dag, ${format(parsedDate, 'HH:mm', { locale: nb })}`;
  }
  
  if (isYesterday(parsedDate)) {
    return `I går, ${format(parsedDate, 'HH:mm', { locale: nb })}`;
  }
  
  return formatDateTime(parsedDate);
}

/**
 * Format for input[type="date"]
 */
export function formatDateInput(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, 'yyyy-MM-dd');
}

/**
 * Format for input[type="datetime-local"]
 */
export function formatDateTimeInput(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Parse date from input
 */
export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

/**
 * Get week range
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
}

/**
 * Get month range
 */
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
}

/**
 * Get date range label
 */
export function getDateRangeLabel(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): string {
  if (!startDate && !endDate) return 'Alle datoer';
  
  const start = startDate ? formatDate(startDate) : null;
  const end = endDate ? formatDate(endDate) : null;
  
  if (start && end) {
    return `${start} - ${end}`;
  }
  
  if (start) {
    return `Fra ${start}`;
  }
  
  if (end) {
    return `Til ${end}`;
  }
  
  return 'Alle datoer';
}

/**
 * Check if date is in range
 */
export function isDateInRange(
  date: Date | string,
  startDate?: Date | string | null,
  endDate?: Date | string | null
): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return false;
  
  if (startDate) {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    if (isValid(start) && parsedDate < start) return false;
  }
  
  if (endDate) {
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    if (isValid(end) && parsedDate > end) return false;
  }
  
  return true;
}

/**
 * Get relative time description
 */
export function getTimeDescription(date: Date | string | number): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, parsedDate);
  const diffHours = differenceInHours(now, parsedDate);
  const diffDays = differenceInDays(now, parsedDate);
  
  if (diffMinutes < 1) return 'Akkurat nå';
  if (diffMinutes < 60) return `${diffMinutes} minutter siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays === 1) return 'I går';
  if (diffDays < 7) return `${diffDays} dager siden`;
  if (isThisWeek(parsedDate)) return 'Denne uken';
  if (isThisMonth(parsedDate)) return 'Denne måneden';
  if (isThisYear(parsedDate)) return 'I år';
  
  return formatDate(parsedDate);
}

/**
 * Add days to date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsedDate, days);
}

/**
 * Subtract days from date
 */
export function subtractDaysFromDate(date: Date | string, days: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return subDays(parsedDate, days);
}

/**
 * Get Norwegian weekday name
 */
export function getWeekdayName(date: Date | string | number): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, 'EEEE', { locale: nb });
}

/**
 * Get short weekday name
 */
export function getShortWeekdayName(date: Date | string | number): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, 'EEE', { locale: nb });
}

/**
 * Format duration (seconds to readable)
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 
    ? `${hours}t ${remainingMinutes}m` 
    : `${hours}t`;
}

/**
 * Get ISO week number
 */
export function getWeekNumber(date: Date | string | number): number {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(parsedDate)) return 0;
  
  const d = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFriendlyDate,
  formatDateInput,
  formatDateTimeInput,
  parseDateInput,
  getWeekRange,
  getMonthRange,
  getDateRangeLabel,
  isDateInRange,
  getTimeDescription,
  addDaysToDate,
  subtractDaysFromDate,
  getWeekdayName,
  getShortWeekdayName,
  formatDuration,
  getWeekNumber
};
