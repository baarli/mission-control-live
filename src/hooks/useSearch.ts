/* ============================================
   USE SEARCH HOOK
   ============================================ */

import { useCallback, useEffect, useRef, useMemo } from 'react';

import {
  useSearchStore,
  useSearchQuery,
  useSearchResults,
  useSearchLoading,
  useSearchError,
  useSearchHistory,
  useSearchFilters,
} from '../stores/searchStore';
import type { SearchResult, Category } from '../types';

import { useToast } from './useToast';

interface UseSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  filteredResults: SearchResult[];
  isSearching: boolean;
  error: string | null;
  history: ReturnType<typeof useSearchHistory>;
  filters: ReturnType<typeof useSearchFilters>;
  selectedResult: SearchResult | undefined;
  hasResults: boolean;
  resultsCount: number;

  // Actions
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  clearResults: () => void;
  clearHistory: () => void;
  removeFromHistory: (timestamp: number) => void;
  selectResult: (id: string | null) => void;

  // Filters
  setCategoryFilter: (category: Category | null) => void;
  setSourceFilter: (source: string | null) => void;
  setDateRangeFilter: (range: 'all' | 'day' | 'week' | 'month' | 'year') => void;
  clearFilters: () => void;

  // Suggestions
  getSuggestions: (partial: string) => string[];
}

const SEARCH_DEBOUNCE_MS = 300;

// Mock search API - replace with actual Brave Search API
const mockSearch = async (
  query: string,
  _filters: Record<string, unknown>
): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return mock results
  return [
    {
      id: crypto.randomUUID(),
      title: `Resultat for "${query}"`,
      description: 'Dette er et eksempel på et søkeresultat.',
      url: 'https://example.com',
      source: 'Brave Search',
      published_at: new Date().toISOString(),
      score: 0.95,
    },
  ];
};

export function useSearch(): UseSearchReturn {
  const { showToast } = useToast();
  const store = useSearchStore();
  const query = useSearchQuery();
  const results = useSearchResults();
  const isSearching = useSearchLoading();
  const error = useSearchError();
  const history = useSearchHistory();
  const filters = useSearchFilters();
  const selectedResult = useMemo(() => {
    const selectedId = store.selectedResultId;
    return selectedId ? results.find(r => r.id === selectedId) : undefined;
  }, [store.selectedResultId, results]);

  const filteredResults = store.getFilteredResults();
  const hasResults = filteredResults.length > 0;
  const resultsCount = filteredResults.length;

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Actions
  const setQuery = useCallback(
    (newQuery: string) => {
      store.setQuery(newQuery);
    },
    [store]
  );

  const search = useCallback(
    async (searchQuery?: string) => {
      const finalQuery = searchQuery || query;

      if (!finalQuery.trim()) {
        store.clearResults();
        return;
      }

      try {
        store.setSearching(true);
        const results = await mockSearch(finalQuery, filters);
        store.setResults(results);
        store.addToHistory(finalQuery, filters.category || undefined);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Søk feilet';
        store.setError(message);
        showToast(message, 'error');
      }
    },
    [query, filters, store, showToast]
  );

  const clearResults = useCallback(() => {
    store.clearResults();
  }, [store]);

  const clearHistory = useCallback(() => {
    store.clearHistory();
    showToast('Søkehistorikk slettet', 'success');
  }, [store, showToast]);

  const removeFromHistory = useCallback(
    (timestamp: number) => {
      store.removeFromHistory(timestamp);
    },
    [store]
  );

  const selectResult = useCallback(
    (id: string | null) => {
      store.selectResult(id);
    },
    [store]
  );

  // Filter actions
  const setCategoryFilter = useCallback(
    (category: Category | null) => {
      store.setFilter('category', category);
    },
    [store]
  );

  const setSourceFilter = useCallback(
    (source: string | null) => {
      store.setFilter('source', source);
    },
    [store]
  );

  const setDateRangeFilter = useCallback(
    (range: 'all' | 'day' | 'week' | 'month' | 'year') => {
      store.setFilter('dateRange', range);
    },
    [store]
  );

  const clearFilters = useCallback(() => {
    store.clearFilters();
  }, [store]);

  // Get suggestions based on history
  const getSuggestions = useCallback(
    (partial: string): string[] => {
      if (!partial.trim()) return [];

      const partialLower = partial.toLowerCase();
      return history
        .filter(item => item.query.toLowerCase().includes(partialLower))
        .map(item => item.query)
        .slice(0, 5);
    },
    [history]
  );

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        search();
      }, SEARCH_DEBOUNCE_MS);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  return {
    query,
    results,
    filteredResults,
    isSearching,
    error,
    history,
    filters,
    selectedResult,
    hasResults,
    resultsCount,
    setQuery,
    search,
    clearResults,
    clearHistory,
    removeFromHistory,
    selectResult,
    setCategoryFilter,
    setSourceFilter,
    setDateRangeFilter,
    clearFilters,
    getSuggestions,
  };
}

export default useSearch;
