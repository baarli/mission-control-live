/**
 * Supabase client setup and typed database operations
 * @module services/supabase
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import type {
  AgendaItem,
  CreateAgendaItemInput,
  UpdateAgendaItemInput,
  NielsenMetric,
  PodtoppenData,
  ApiResponseWrapper as ApiResponse,
} from '../types/mission';

/**
 * Environment variable names for Supabase configuration
 */
const ENV_KEYS = {
  URL: 'VITE_SUPABASE_URL',
  ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
} as const;

/**
 * Database table names
 */
const TABLES = {
  AGENDA_ITEMS: 'agenda_items',
  NIELSEN_METRICS: 'nielsen_metrics',
  PODTOPPEN_DATA: 'podtoppen_data',
} as const;

/**
 * Error class for Supabase operations
 */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string,
    public readonly hint?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Validates and retrieves Supabase configuration from environment
 * @returns Object containing URL and anon key
 * @throws Error if configuration is missing
 */
function getConfig(): { url: string; anonKey: string } {
  const url = import.meta.env[ENV_KEYS.URL];
  const anonKey = import.meta.env[ENV_KEYS.ANON_KEY];

  if (!url) {
    throw new SupabaseError(`Missing environment variable: ${ENV_KEYS.URL}`, 'CONFIG_ERROR');
  }

  if (!anonKey) {
    throw new SupabaseError(`Missing environment variable: ${ENV_KEYS.ANON_KEY}`, 'CONFIG_ERROR');
  }

  return { url, anonKey };
}

/**
 * Converts a PostgrestError to SupabaseError
 * @param error - Postgrest error
 * @returns SupabaseError instance
 */
function normalizeError(error: PostgrestError): SupabaseError {
  return new SupabaseError(error.message, error.code, error.details, error.hint);
}

/**
 * Creates a successful API response
 * @param data - Response data
 * @returns API response object
 */
function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

/**
 * Creates an error API response
 * @param error - Error object
 * @returns API response object
 */
function errorResponse<T>(error: SupabaseError | Error): ApiResponse<T> {
  return {
    success: false,
    error: {
      message: error.message,
      code: error instanceof SupabaseError ? error.code : undefined,
    },
  };
}

/**
 * Supabase service with typed database operations
 */
class SupabaseService {
  private client: SupabaseClient | null = null;
  private initializationPromise: Promise<SupabaseClient> | null = null;

  /**
   * Initializes the Supabase client
   * @returns Promise resolving to Supabase client
   */
  async initialize(): Promise<SupabaseClient> {
    if (this.client) {
      return this.client;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      const config = getConfig();
      this.client = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: {
          schema: 'public',
        },
      });
      return this.client;
    })();

    return this.initializationPromise;
  }

  /**
   * Gets the initialized Supabase client
   * @returns Supabase client instance
   * @throws Error if not initialized
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new SupabaseError(
        'Supabase client not initialized. Call initialize() first.',
        'NOT_INITIALIZED'
      );
    }
    return this.client;
  }

  /**
   * Checks if client is initialized
   * @returns True if initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  // ==================== Agenda Items ====================

  /**
   * Fetches agenda items for a specific date
   * @param date - Date in ISO format (YYYY-MM-DD)
   * @returns API response with array of agenda items
   */
  async getAgendaItems(date: string): Promise<ApiResponse<AgendaItem[]>> {
    try {
      const client = await this.initialize();
      const { data, error } = await client
        .from(TABLES.AGENDA_ITEMS)
        .select('*')
        .eq('show_date', date)
        .order('is_pinned', { ascending: false })
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return successResponse(data || []);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  /**
   * Creates a new agenda item
   * @param item - Agenda item data (without auto-generated fields)
   * @returns API response with created agenda item
   */
  async createAgendaItem(item: CreateAgendaItemInput): Promise<ApiResponse<AgendaItem>> {
    try {
      const client = await this.initialize();
      const { data, error } = await client
        .from(TABLES.AGENDA_ITEMS)
        .insert({
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw normalizeError(error);
      if (!data) throw new SupabaseError('No data returned from insert', 'NO_DATA');
      return successResponse(data);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  /**
   * Updates an existing agenda item
   * @param id - Agenda item ID
   * @param data - Partial agenda item data to update
   * @returns API response with updated agenda item
   */
  async updateAgendaItem(
    id: string,
    data: UpdateAgendaItemInput
  ): Promise<ApiResponse<AgendaItem>> {
    try {
      const client = await this.initialize();
      const { data: updatedData, error } = await client
        .from(TABLES.AGENDA_ITEMS)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      if (!updatedData) throw new SupabaseError('No data returned from update', 'NO_DATA');
      return successResponse(updatedData);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  /**
   * Deletes an agenda item
   * @param id - Agenda item ID
   * @returns API response with success status
   */
  async deleteAgendaItem(id: string): Promise<ApiResponse<void>> {
    try {
      const client = await this.initialize();
      const { error } = await client.from(TABLES.AGENDA_ITEMS).delete().eq('id', id);

      if (error) throw normalizeError(error);
      return successResponse(undefined);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  /**
   * Toggles the completion status of an agenda item
   * @param id - Agenda item ID
   * @param isCompleted - New completion status
   * @returns API response with updated agenda item
   */
  async toggleAgendaItemCompletion(
    id: string,
    isCompleted: boolean
  ): Promise<ApiResponse<AgendaItem>> {
    return this.updateAgendaItem(id, { is_completed: isCompleted });
  }

  /**
   * Toggles the pinned status of an agenda item
   * @param id - Agenda item ID
   * @param isPinned - New pinned status
   * @returns API response with updated agenda item
   */
  async toggleAgendaItemPinned(id: string, isPinned: boolean): Promise<ApiResponse<AgendaItem>> {
    return this.updateAgendaItem(id, { is_pinned: isPinned });
  }

  /**
   * Reorders agenda items
   * @param itemIds - Array of item IDs in new order
   * @returns API response with success status
   */
  async reorderAgendaItems(itemIds: string[]): Promise<ApiResponse<void>> {
    try {
      const client = await this.initialize();

      // Use a transaction-like approach with multiple updates
      const updates = itemIds.map((id, index) =>
        client
          .from(TABLES.AGENDA_ITEMS)
          .update({ order_index: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updates);

      // Check for errors
      const errors = results.filter(r => r.error);
      const firstError = errors[0];
      if (firstError?.error) {
        throw normalizeError(firstError.error);
      }

      return successResponse(undefined);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  // ==================== Nielsen Metrics ====================

  /**
   * Fetches Nielsen TV metrics
   * @param options - Optional filters
   * @returns API response with Nielsen metrics
   */
  async getNielsenMetrics(options?: {
    channel?: string;
    week?: number;
    year?: number;
    limit?: number;
  }): Promise<ApiResponse<NielsenMetric[]>> {
    try {
      const client = await this.initialize();
      let query = client
        .from(TABLES.NIELSEN_METRICS)
        .select('*')
        .order('year', { ascending: false })
        .order('week_number', { ascending: false });

      if (options?.channel) {
        query = query.eq('channel', options.channel);
      }
      if (options?.week) {
        query = query.eq('week_number', options.week);
      }
      if (options?.year) {
        query = query.eq('year', options.year);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw normalizeError(error);
      return successResponse(data || []);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  /**
   * Gets the latest Nielsen metrics for all channels
   * @param limit - Maximum number of results per channel
   * @returns API response with latest Nielsen metrics
   */
  async getLatestNielsenMetrics(limit: number = 10): Promise<ApiResponse<NielsenMetric[]>> {
    try {
      const client = await this.initialize();
      const { data, error } = await client
        .from(TABLES.NIELSEN_METRICS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw normalizeError(error);
      return successResponse(data || []);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  // ==================== Podtoppen Data ====================

  /**
   * Fetches Podtoppen podcast ranking data
   * @param options - Optional filters
   * @returns API response with Podtoppen data
   */
  async getPodtoppenData(options?: {
    week?: number;
    year?: number;
    podcastTitle?: string;
    limit?: number;
  }): Promise<ApiResponse<PodtoppenData[]>> {
    try {
      const client = await this.initialize();
      let query = client.from(TABLES.PODTOPPEN_DATA).select('*').order('rank', { ascending: true });

      if (options?.week) {
        query = query.eq('week_number', options.week);
      }
      if (options?.year) {
        query = query.eq('year', options.year);
      }
      if (options?.podcastTitle) {
        query = query.ilike('podcast_title', `%${options.podcastTitle}%`);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw normalizeError(error);
      return successResponse(data || []);
    } catch (error) {
      return errorResponse(error as Error);
    }
  }

  /**
   * Gets the top podcasts for a specific week
   * @param week - Week number
   * @param year - Year
   * @param topN - Number of top podcasts to return
   * @returns API response with top podcasts
   */
  async getTopPodcasts(
    week: number,
    year: number,
    topN: number = 10
  ): Promise<ApiResponse<PodtoppenData[]>> {
    return this.getPodtoppenData({ week, year, limit: topN });
  }

  // ==================== Real-time Subscriptions ====================

  /**
   * Subscribes to real-time agenda item changes
   * @param date - Date to subscribe to (YYYY-MM-DD)
   * @param callback - Callback function for changes
   * @returns Subscription cleanup function
   */
  subscribeToAgendaItems(
    date: string,
    callback: (payload: { event: string; new: AgendaItem; old: AgendaItem | null }) => void
  ): () => void {
    const client = this.getClient();

    const subscription = client
      .channel(`agenda_items:${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.AGENDA_ITEMS,
          filter: `show_date=eq.${date}`,
        },
        payload => {
          callback({
            event: payload.eventType,
            new: payload.new as AgendaItem,
            old: payload.old as AgendaItem | null,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

/**
 * Singleton instance of the Supabase service
 */
export const supabase = new SupabaseService();

/**
 * Re-export types and utilities
 */
export { getConfig, TABLES };
export type { SupabaseClient };
