/* ============================================
   STRING UTILITIES
   ============================================ */

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, char => htmlEscapes[char] || char);
}

/**
 * Truncate text to specified length
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number,
  suffix = '...'
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Truncate at word boundary
 */
export function truncateWords(
  text: string | null | undefined,
  maxWords: number,
  suffix = '...'
): string {
  if (!text) return '';

  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return '';
  return text.split(/\s+/).map(capitalize).join(' ');
}

/**
 * Convert to slug (URL-friendly string)
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

/**
 * Remove extra whitespace
 */
export function cleanWhitespace(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Strip HTML tags
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Extract excerpt from HTML content
 */
export function extractExcerpt(html: string | null | undefined, maxLength: number = 150): string {
  if (!html) return '';

  const text = stripHtml(html);
  return truncate(text, maxLength);
}

/**
 * Highlight search terms in text
 */
export function highlightText(
  text: string | null | undefined,
  query: string | null | undefined,
  tag = 'mark'
): string {
  if (!text || !query) return text || '';

  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  return text.replace(regex, `<${tag}>$1</${tag}>`);
}

/**
 * Escape regex special characters
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if string contains substring (case insensitive)
 */
export function containsIgnoreCase(text: string | null | undefined, substring: string): boolean {
  if (!text || !substring) return false;
  return text.toLowerCase().includes(substring.toLowerCase());
}

/**
 * Get initials from name
 */
export function getInitials(name: string | null | undefined, maxInitials = 2): string {
  if (!name) return '';

  return name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join('');
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '';
  return num.toLocaleString('nb-NO');
}

/**
 * Pluralize word
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string = singular + 'er'
): string {
  return count === 1 ? singular : plural;
}

/**
 * Generate random ID
 */
export function generateId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Repeat string n times
 */
export function repeat(str: string, count: number): string {
  return str.repeat(count);
}

/**
 * Pad string to length
 */
export function pad(
  str: string | number,
  length: number,
  char = ' ',
  side: 'left' | 'right' = 'left'
): string {
  const string = String(str);
  if (string.length >= length) return string;

  const padding = repeat(char, length - string.length);
  return side === 'left' ? padding + string : string + padding;
}

/**
 * Parse query string
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
}

/**
 * Build query string
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export default {
  escapeHtml,
  truncate,
  truncateWords,
  capitalize,
  capitalizeWords,
  slugify,
  cleanWhitespace,
  stripHtml,
  extractExcerpt,
  highlightText,
  escapeRegExp,
  containsIgnoreCase,
  getInitials,
  formatNumber,
  pluralize,
  generateId,
  generateUUID,
  formatBytes,
  repeat,
  pad,
  parseQueryString,
  buildQueryString,
};
