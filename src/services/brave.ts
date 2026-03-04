/**
 * Brave News API client with request enrichment and entertainment scoring
 * @module services/brave
 */

import { ApiClient } from './api-client';

import type { NewsSearchResult as SearchResult, SearchOptions, ApiResponseWrapper as ApiResponse, AgendaCategory } from '../types/mission';

/**
 * Environment variable names
 */
const ENV_KEYS = {
  API_KEY: 'VITE_BRAVE_API_KEY',
  BASE_URL: 'VITE_BRAVE_BASE_URL',
} as const;

/**
 * Default configuration
 */
const DEFAULTS = {
  BASE_URL: 'https://api.search.brave.com/res/v1',
  TIMEOUT: 15000,
  COUNT: 10,
} as const;

/**
 * Entertainment keywords for scoring
 */
const ENTERTAINMENT_KEYWORDS: Record<string, number> = {
  // High relevance keywords (weight: 10)
  kjendis: 10,
  celebrity: 10,
  stjerne: 10,
  premiere: 10,
  hollywood: 10,
  netflix: 10,

  // Medium-high relevance (weight: 7)
  tv: 7,
  film: 7,
  serie: 7,
  reality: 7,
  underholdning: 7,
  entertainment: 7,
  artist: 7,
  musiker: 7,

  // Medium relevance (weight: 5)
  musikk: 5,
  koncert: 5,
  festival: 5,
  skuespiller: 5,
  skuespillerinne: 5,
  regissør: 5,

  // Low-medium relevance (weight: 3)
  kultur: 3,
  kulturminne: 3,
  bok: 3,
  litteratur: 3,
  kunst: 3,
};

/**
 * Category keywords for search enrichment
 */
const CATEGORY_KEYWORDS: Record<AgendaCategory, string[]> = {
  TALK: ['intervju', 'prat', 'talkshow', 'gjest', 'samtale'],
  REALITY_TV: ['reality', 'deltaker', 'program', 'sesong', 'episode'],
  KJENDIS_DRAMA: ['skandale', 'brudd', 'forhold', 'drama', 'konflikt'],
  FILM_TV: ['film', 'serie', 'streaming', 'premiere', 'rolle'],
  MUSIKK: ['album', 'singel', 'turne', 'konsert', 'chart'],
  INTERNASJONALT: ['international', 'global', 'utlandet', 'utenlandsk'],
};

/**
 * Brave API response structure
 */
interface BraveApiResponse {
  query: {
    original: string;
    altered?: string;
  };
  mixed?: {
    type: string;
    index?: number;
    all?: boolean;
  }[];
  web?: {
    results?: {
      title: string;
      description: string;
      url: string;
      profile?: {
        name: string;
      };
      age?: string;
      meta?: {
        article?: {
          author?: string;
          date?: string;
        };
      };
    }[];
  };
}

/**
 * Error class for Brave API operations
 */
export class BraveApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'BraveApiError';
  }
}

/**
 * Calculates entertainment relevance score for a text
 * @param title - Article title
 * @param description - Article description
 * @returns Score from 0 to 100
 */
export function calculateScore(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  // Calculate base score from keywords
  for (const [keyword, weight] of Object.entries(ENTERTAINMENT_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += weight * matches.length;
    }
  }

  // Bonus for multiple entertainment terms
  const entertainmentTerms = Object.keys(ENTERTAINMENT_KEYWORDS).filter(
    (keyword) => new RegExp(`\\b${keyword}\\w*\\b`, 'i').test(text)
  );
  if (entertainmentTerms.length >= 3) {
    score += 15;
  }

  // Bonus for recent content indicators
  const recentIndicators = ['i dag', 'i går', 'ny', 'siste', 'today', 'yesterday', 'latest'];
  for (const indicator of recentIndicators) {
    if (text.includes(indicator)) {
      score += 5;
      break;
    }
  }

  // Normalize to 0-100 range
  return Math.min(100, Math.max(0, score * 2));
}

/**
 * Gets Brave API configuration from environment
 * @returns Configuration object
 * @throws BraveApiError if API key is missing
 */
function getConfig(): { apiKey: string; baseURL: string } {
  const apiKey = import.meta.env[ENV_KEYS.API_KEY];
  const baseURL = import.meta.env[ENV_KEYS.BASE_URL] || DEFAULTS.BASE_URL;

  if (!apiKey) {
    throw new BraveApiError(
      `Missing environment variable: ${ENV_KEYS.API_KEY}`,
      undefined,
      'CONFIG_ERROR'
    );
  }

  return { apiKey, baseURL };
}

/**
 * Enriches search query with category keywords
 * @param query - Original search query
 * @param category - Optional category for enrichment
 * @returns Enriched query string
 */
function enrichQuery(query: string, category?: string): string {
  if (!category || !(category in CATEGORY_KEYWORDS)) {
    return query;
  }

  const keywords = CATEGORY_KEYWORDS[category as AgendaCategory];
  const enrichedTerms = keywords.slice(0, 2).join(' OR ');
  return `${query} (${enrichedTerms})`;
}

/**
 * Parses Brave API response into SearchResult objects
 * @param response - Brave API response
 * @returns Array of search results
 */
function parseResponse(response: BraveApiResponse): SearchResult[] {
  if (!response.web?.results) {
    return [];
  }

  return response.web.results.map((result, index) => {
    const title = result.title || '';
    const description = result.description || '';
    const score = calculateScore(title, description);

    // Determine category based on content
    const category = determineCategory(title, description);

    return {
      id: index + 1,
      title,
      description,
      url: result.url,
      source: result.profile?.name || new URL(result.url).hostname,
      published: result.meta?.article?.date || result.age || new Date().toISOString(),
      score,
      category,
    };
  });
}

/**
 * Determines category based on content analysis
 * @param title - Article title
 * @param description - Article description
 * @returns Category name
 */
function determineCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.reduce((acc, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
      const matches = text.match(regex);
      return acc + (matches?.length || 0);
    }, 0);
  }

  const topCategory = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return topCategory && topCategory[1] > 0 ? topCategory[0] : 'GENERAL';
}

/**
 * Brave News API service
 */
class BraveService {
  private client: ApiClient | null = null;
  private config: { apiKey: string; baseURL: string } | null = null;

  /**
   * Initializes the Brave API client
   */
  private initialize(): void {
    if (this.client) return;

    this.config = getConfig();
    this.client = new ApiClient({
      baseURL: this.config.baseURL,
      timeout: DEFAULTS.TIMEOUT,
      headers: {
        'X-Subscription-Token': this.config.apiKey,
        Accept: 'application/json',
      },
    });
  }

  /**
   * Ensures the client is initialized
   * @private
   */
  private ensureInitialized(): void {
    if (!this.client) {
      this.initialize();
    }
  }

  /**
   * Searches for news articles using Brave News API
   * @param query - Search query
   * @param options - Search options
   * @returns API response with search results
   */
  async searchNews(
    query: string,
    options: SearchOptions = {}
  ): Promise<ApiResponse<SearchResult[]>> {
    try {
      this.ensureInitialized();

      // Enrich query with category keywords
      const enrichedQuery = enrichQuery(query, options.category);

      // Build search parameters
      const params = new URLSearchParams({
        q: enrichedQuery,
        count: String(options.count || DEFAULTS.COUNT),
        offset: String(options.offset || 0),
        search_lang: options.language || 'no',
        country: options.country || 'NO',
        text_decorations: 'false',
        result_filter: 'news',
      });

      // Add freshness filter if specified
      if (options.freshness) {
        params.append('freshness', options.freshness);
      }

      const response = await this.client!.get<BraveApiResponse>(
        `/news/search?${params.toString()}`
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error,
        };
      }

      const results = parseResponse(response.data!);

      // Sort by entertainment score (highest first)
      results.sort((a, b) => b.score - a.score);

      return {
        success: true,
        data: results,
        meta: {
          total: results.length,
        },
      };
    } catch (error) {
      if (error instanceof BraveApiError) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Performs a quick search with default options
   * @param query - Search query
   * @param category - Optional category filter
   * @returns API response with search results
   */
  async quickSearch(
    query: string,
    category?: string
  ): Promise<ApiResponse<SearchResult[]>> {
    return this.searchNews(query, {
      category,
      count: 5,
      freshness: 'week',
    });
  }

  /**
   * Gets trending entertainment news
   * @param count - Number of results to return
   * @returns API response with trending results
   */
  async getTrendingNews(count: number = 10): Promise<ApiResponse<SearchResult[]>> {
    const trendingQueries = [
      'kjendisnyheter Norge',
      'underholdning TV',
      'reality TV Norge',
    ];

    const allResults: SearchResult[] = [];

    for (const query of trendingQueries) {
      const response = await this.searchNews(query, {
        count: Math.ceil(count / trendingQueries.length),
        freshness: 'day',
      });

      if (response.success && response.data) {
        allResults.push(...response.data);
      }
    }

    // Remove duplicates based on URL
    const uniqueResults = allResults.filter(
      (result, index, self) =>
        index === self.findIndex((r) => r.url === result.url)
    );

    // Sort by score and take top results
    uniqueResults.sort((a, b) => b.score - a.score);

    return {
      success: true,
      data: uniqueResults.slice(0, count),
      meta: {
        total: uniqueResults.length,
      },
    };
  }

  /**
   * Calculates entertainment score for text content
   * @param title - Article title
   * @param description - Article description
   * @returns Entertainment score (0-100)
   */
  calculateScore(title: string, description: string): number {
    return calculateScore(title, description);
  }
}

/**
 * Singleton instance of the Brave service
 */
export const brave = new BraveService();

/**
 * Re-export utilities and types
 */
export { getConfig, enrichQuery, parseResponse };
