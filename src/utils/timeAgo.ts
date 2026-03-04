import { format, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { nb } from 'date-fns/locale';

/**
 * Formats a date to a human-readable "time ago" string in Norwegian
 */
export function timeAgo(date: Date | string | number): string {
  let parsedDate: Date;
  if (typeof date === 'number') {
    parsedDate = new Date(date);
  } else if (typeof date === 'string') {
    parsedDate = new Date(date);
  } else {
    parsedDate = date;
  }
  
  if (isNaN(parsedDate.getTime())) {
    return 'Ugyldig dato';
  }
  
  const now = new Date();
  const minutesDiff = differenceInMinutes(now, parsedDate);
  const hoursDiff = differenceInHours(now, parsedDate);
  const daysDiff = differenceInDays(now, parsedDate);
  
  // Less than 1 minute ago
  if (minutesDiff < 1) {
    return 'Akkurat nå';
  }
  
  // Less than 1 hour ago
  if (minutesDiff < 60) {
    return `${minutesDiff} minutt${minutesDiff === 1 ? '' : 'er'} siden`;
  }
  
  // Less than 24 hours ago
  if (hoursDiff < 24) {
    return `${hoursDiff} time${hoursDiff === 1 ? '' : 'r'} siden`;
  }
  
  // Less than 7 days ago
  if (daysDiff < 7) {
    return `${daysDiff} dag${daysDiff === 1 ? '' : 'er'} siden`;
  }
  
  // More than 7 days ago - use date-fns
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: nb });
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string | number, formatStr: string = 'PPP'): string {
  let parsedDate: Date;
  if (typeof date === 'number') {
    parsedDate = new Date(date);
  } else if (typeof date === 'string') {
    parsedDate = new Date(date);
  } else {
    parsedDate = date;
  }
  
  if (isNaN(parsedDate.getTime())) {
    return 'Ugyldig dato';
  }
  
  return format(parsedDate, formatStr, { locale: nb });
}

/**
 * Formats a date to a full timestamp
 */
export function formatTimestamp(date: Date | string | number): string {
  let parsedDate: Date;
  if (typeof date === 'number') {
    parsedDate = new Date(date);
  } else if (typeof date === 'string') {
    parsedDate = new Date(date);
  } else {
    parsedDate = date;
  }
  
  if (isNaN(parsedDate.getTime())) {
    return 'Ugyldig dato';
  }
  
  return format(parsedDate, 'PPpp', { locale: nb });
}
