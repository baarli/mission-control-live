/**
 * Mission Control specific types - Agenda, Nielsen, and Podtoppen
 * @module types/mission
 *
 * These types extend the core Mission Control functionality with
 * entertainment industry specific data structures.
 */

// ==========================================
// Agenda Item Types
// ==========================================

/**
 * Agenda item category types for show classification
 */
export type AgendaCategory =
  | 'TALK'
  | 'REALITY_TV'
  | 'KJENDIS_DRAMA'
  | 'FILM_TV'
  | 'MUSIKK'
  | 'INTERNASJONALT';

/**
 * Agenda item representing a show or event in the mission control dashboard
 */
export interface AgendaItem {
  /** Unique identifier */
  id: string;
  /** Tenant identifier for multi-tenancy */
  tenant_id: string;
  /** Title of the agenda item */
  title: string;
  /** Optional description */
  description?: string;
  /** Category of the show/event */
  category: AgendaCategory;
  /** Date of the show in ISO format (YYYY-MM-DD) */
  show_date: string;
  /** Optional external link URL */
  link_url?: string;
  /** Internal notes */
  notes?: string;
  /** Order index for sorting */
  order_index: number;
  /** Whether item is pinned to top */
  is_pinned: boolean;
  /** Whether item is completed */
  is_completed: boolean;
  /** User ID who created the item */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Input type for creating a new agenda item (omits auto-generated fields)
 */
export type CreateAgendaItemInput = Omit<
  AgendaItem,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * Input type for updating an agenda item
 */
export type UpdateAgendaItemInput = Partial<
  Omit<AgendaItem, 'id' | 'created_at' | 'updated_at'>
>;

// ==========================================
// Nielsen Metrics Types
// ==========================================

/**
 * Nielsen TV metrics data for viewership analytics
 */
export interface NielsenMetric {
  /** Unique identifier */
  id: string;
  /** TV channel name */
  channel: string;
  /** Week number (1-53) */
  week_number: number;
  /** Year */
  year: number;
  /** Metric value (viewership/rating) */
  value: number;
  /** Data collection timestamp */
  created_at: string;
}

// ==========================================
// Podtoppen Types
// ==========================================

/**
 * Podtoppen podcast ranking data
 */
export interface PodtoppenData {
  /** Unique identifier */
  id: string;
  /** Podcast title */
  podcast_title: string;
  /** Week number (1-53) */
  week_number: number;
  /** Year */
  year: number;
  /** Ranking position */
  rank: number;
  /** Number of unique listeners (optional) */
  unique_units?: number;
  /** Data collection timestamp */
  created_at: string;
}

// ==========================================
// Search & News Types
// ==========================================

/**
 * Enhanced search result with entertainment scoring
 */
export interface NewsSearchResult {
  /** Unique identifier for the result */
  id: number;
  /** Article title */
  title: string;
  /** Article description/snippet */
  description: string;
  /** Source URL */
  url: string;
  /** Source name */
  source: string;
  /** Publication date */
  published: string;
  /** Relevance score (0-100) */
  score: number;
  /** Category classification */
  category: string;
}

/**
 * Options for news search queries
 */
export interface SearchOptions {
  /** Number of results to return (default: 10) */
  count?: number;
  /** Offset for pagination */
  offset?: number;
  /** Category filter */
  category?: string;
  /** Language filter */
  language?: string;
  /** Country filter */
  country?: string;
  /** Search freshness (day, week, month) */
  freshness?: 'day' | 'week' | 'month';
}

// ==========================================
// UI & Storage Types
// ==========================================

/**
 * UI theme preference
 */
export type Theme = 'dark' | 'light';

/**
 * Individual search history entry
 */
export interface SearchHistoryItem {
  /** Search query string */
  query: string;
  /** Category filter used */
  category: string;
  /** Unix timestamp of search */
  timestamp: number;
}

/**
 * Search history stored in localStorage
 */
export interface SearchHistory {
  /** Array of search history items */
  items: SearchHistoryItem[];
  /** Maximum number of items to store */
  maxItems: number;
}

/**
 * Authentication state for localStorage
 */
export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** User ID */
  userId?: string;
  /** User email */
  email?: string;
  /** Access token */
  accessToken?: string;
  /** Token expiration timestamp */
  expiresAt?: number;
}

/**
 * Prompt editor content storage
 */
export interface PromptEditorContent {
  /** Editor content */
  content: string;
  /** Last saved timestamp */
  savedAt: number;
  /** Associated prompt name/title */
  name?: string;
}

// ==========================================
// API Types
// ==========================================

/**
 * API error response structure
 */
export interface ApiErrorDetails {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Generic API response wrapper
 * @template T Type of the response data
 */
export interface ApiResponseWrapper<T> {
  /** Whether request was successful */
  success: boolean;
  /** Response data (if successful) */
  data?: T;
  /** Error information (if failed) */
  error?: ApiErrorDetails;
  /** Response metadata */
  meta?: {
    /** Total count for paginated results */
    total?: number;
    /** Current page */
    page?: number;
    /** Items per page */
    perPage?: number;
  };
}

/**
 * Cache entry with expiration for service layer caching
 * @template T Type of cached data
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** Expiration timestamp */
  expiresAt: number;
}
