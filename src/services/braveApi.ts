import axios from 'axios';

import type { SearchResult } from '@/types';

const BRAVE_API_BASE = 'https://api.search.brave.com/res/v1';

const braveApiKey = import.meta.env.VITE_BRAVE_API_KEY;

if (!braveApiKey) {
  console.warn('VITE_BRAVE_API_KEY not set. Brave Search API will not work.');
}

const braveClient = axios.create({
  baseURL: BRAVE_API_BASE,
  headers: {
    'X-Subscription-Token': braveApiKey,
    Accept: 'application/json',
  },
  timeout: 10000,
});

export interface BraveSearchParams {
  q: string;
  count?: number;
  offset?: number;
  search_lang?: string;
  safesearch?: 'off' | 'moderate' | 'strict';
}

export interface BraveSearchResponse {
  query: {
    original: string;
    spellcheck_off: boolean;
  };
  web: {
    results: Array<{
      title: string;
      url: string;
      description: string;
      profile?: {
        name: string;
      };
    }>;
  };
}

export async function searchBrave(params: BraveSearchParams): Promise<SearchResult[]> {
  if (!braveApiKey) {
    throw new Error('Brave API key not configured');
  }

  try {
    const response = await braveClient.get<BraveSearchResponse>('/web/search', {
      params: {
        ...params,
        count: params.count ?? 10,
      },
    });

    return response.data.web.results.map((result, index) => ({
      id: String(index),
      title: result.title,
      url: result.url,
      description: result.description,
      source: result.profile?.name || 'Unknown',
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Brave Search API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}
