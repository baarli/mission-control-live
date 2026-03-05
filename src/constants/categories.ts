/* ============================================
   CATEGORIES
   Category definitions for Mission Control
   ============================================ */

import type { Category, BadgeVariant } from '../types';

/**
 * Category metadata including display information
 */
export interface CategoryMeta {
  id: Category;
  label: string;
  shortLabel: string;
  description: string;
  badgeVariant: BadgeVariant;
  color: string;
  bgColor: string;
  icon: string;
  order: number;
}

/**
 * All category definitions
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'TALK',
    label: 'Talk',
    shortLabel: 'Talk',
    description: 'Prat og diskusjoner',
    badgeVariant: 'talk',
    color: '#1e40af',
    bgColor: '#dbeafe',
    icon: '💬',
    order: 1,
  },
  {
    id: 'REALITY_TV',
    label: 'Reality-TV',
    shortLabel: 'Reality',
    description: 'Reality-TV og underholdning',
    badgeVariant: 'reality',
    color: '#9d174d',
    bgColor: '#fce7f3',
    icon: '📺',
    order: 2,
  },
  {
    id: 'KJENDIS_DRAMA',
    label: 'Kjendis & Drama',
    shortLabel: 'Kjendis',
    description: 'Kjendisnyheter og drama',
    badgeVariant: 'kjendis',
    color: '#92400e',
    bgColor: '#fef3c7',
    icon: '⭐',
    order: 3,
  },
  {
    id: 'FILM_TV',
    label: 'Film & TV',
    shortLabel: 'Film/TV',
    description: 'Film og TV-serier',
    badgeVariant: 'film',
    color: '#065f46',
    bgColor: '#d1fae5',
    icon: '🎬',
    order: 4,
  },
  {
    id: 'MUSIKK',
    label: 'Musikk',
    shortLabel: 'Musikk',
    description: 'Musikknyheter og artister',
    badgeVariant: 'musikk',
    color: '#3730a3',
    bgColor: '#e0e7ff',
    icon: '🎵',
    order: 5,
  },
  {
    id: 'INTERNASJONALT',
    label: 'Internasjonalt',
    shortLabel: 'Intl.',
    description: 'Internasjonale nyheter',
    badgeVariant: 'internasjonalt',
    color: '#6b21a8',
    bgColor: '#f3e8ff',
    icon: '🌍',
    order: 6,
  },
];

/**
 * Category map for quick lookup
 */
export const CATEGORY_MAP: Record<Category, CategoryMeta> = CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.id]: cat }),
  {} as Record<Category, CategoryMeta>
);

/**
 * Get category metadata by ID
 */
export function getCategory(categoryId: Category): CategoryMeta {
  return CATEGORY_MAP[categoryId] || CATEGORIES[0];
}

/**
 * Get category label
 */
export function getCategoryLabel(categoryId: Category): string {
  return getCategory(categoryId).label;
}

/**
 * Get category short label
 */
export function getCategoryShortLabel(categoryId: Category): string {
  return getCategory(categoryId).shortLabel;
}

/**
 * Get category color
 */
export function getCategoryColor(categoryId: Category): string {
  return getCategory(categoryId).color;
}

/**
 * Get category background color
 */
export function getCategoryBgColor(categoryId: Category): string {
  return getCategory(categoryId).bgColor;
}

/**
 * Get category icon
 */
export function getCategoryIcon(categoryId: Category): string {
  return getCategory(categoryId).icon;
}

/**
 * Get all category IDs
 */
export function getCategoryIds(): Category[] {
  return CATEGORIES.map(c => c.id);
}

/**
 * Get categories sorted by order
 */
export function getCategoriesByOrder(): CategoryMeta[] {
  return [...CATEGORIES].sort((a, b) => a.order - b.order);
}

/**
 * Get categories for dropdown/select
 */
export function getCategoryOptions(): Array<{ value: Category; label: string }> {
  return getCategoriesByOrder().map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.label}`,
  }));
}

/**
 * Check if a string is a valid category
 */
export function isValidCategory(value: string): value is Category {
  return CATEGORIES.some(c => c.id === value);
}

/**
 * Parse category from string (with fallback)
 */
export function parseCategory(
  value: string | null | undefined,
  fallback: Category = 'TALK'
): Category {
  if (!value) return fallback;
  return isValidCategory(value) ? value : fallback;
}

/**
 * Category filter options for search
 */
export const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Alle kategorier' },
  ...getCategoryOptions(),
];

/**
 * Get default category
 */
export function getDefaultCategory(): Category {
  return 'TALK';
}

/**
 * Group saker by category
 */
export function groupByCategory<T extends { category: Category }>(
  items: T[]
): Record<Category, T[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<Category, T[]>
  );
}

/**
 * Count items by category
 */
export function countByCategory<T extends { category: Category }>(
  items: T[]
): Record<Category, number> {
  const counts = {} as Record<Category, number>;

  // Initialize all categories to 0
  CATEGORIES.forEach(cat => {
    counts[cat.id] = 0;
  });

  // Count items
  items.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  return counts;
}

export default {
  CATEGORIES,
  CATEGORY_MAP,
  CATEGORY_FILTER_OPTIONS,
  getCategory,
  getCategoryLabel,
  getCategoryShortLabel,
  getCategoryColor,
  getCategoryBgColor,
  getCategoryIcon,
  getCategoryIds,
  getCategoriesByOrder,
  getCategoryOptions,
  isValidCategory,
  parseCategory,
  getDefaultCategory,
  groupByCategory,
  countByCategory,
};
