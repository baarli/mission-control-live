/* ============================================
   SEARCH STORE - Zustand
   ============================================ */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { SearchResult, SearchHistoryItem, Category } from '../types';

interface SearchState {
  // State
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  history: SearchHistoryItem[];
  activeFilters: {
    category: Category | null;
    source: string | null;
    dateRange: 'all' | 'day' | 'week' | 'month' | 'year';
  };
  selectedResultId: string | null;
  
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  addResult: (result: SearchResult) => void;
  clearResults: () => void;
  setSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (query: string, category?: string) => void;
  removeFromHistory: (timestamp: number) => void;
  clearHistory: () => void;
  setFilter: (key: keyof SearchState['activeFilters'], value: any) => void;
  clearFilters: () => void;
  selectResult: (id: string | null) => void;
  reset: () => void;
  
  // Computed
  getFilteredResults: () => SearchResult[];
  getRecentHistory: (limit?: number) => SearchHistoryItem[];
}

const MAX_HISTORY_ITEMS = 20;

const initialFilters = {
  category: null as Category | null,
  source: null as string | null,
  dateRange: 'all' as 'all' | 'day' | 'week' | 'month' | 'year'
};

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        query: '',
        results: [],
        isSearching: false,
        error: null,
        history: [],
        activeFilters: initialFilters,
        selectedResultId: null,

        // Actions
        setQuery: (query: string) => {
          set({ query });
        },

        setResults: (results: SearchResult[]) => {
          set({ results, isSearching: false, error: null });
        },

        addResult: (result: SearchResult) => {
          set((state) => ({
            results: [...state.results, result]
          }));
        },

        clearResults: () => {
          set({ results: [], selectedResultId: null });
        },

        setSearching: (isSearching: boolean) => {
          set({ isSearching });
        },

        setError: (error: string | null) => {
          set({ error, isSearching: false });
        },

        addToHistory: (query: string, category?: string) => {
          if (!query.trim()) return;
          
          set((state) => {
            // Remove duplicate if exists
            const filtered = state.history.filter(
              (item) => item.query.toLowerCase() !== query.toLowerCase()
            );
            
            // Add new item at the beginning
            const newItem: SearchHistoryItem = {
              query: query.trim(),
              category,
              timestamp: Date.now()
            };
            
            return {
              history: [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
            };
          });
        },

        removeFromHistory: (timestamp: number) => {
          set((state) => ({
            history: state.history.filter((item) => item.timestamp !== timestamp)
          }));
        },

        clearHistory: () => {
          set({ history: [] });
        },

        setFilter: (key: keyof SearchState['activeFilters'], value: any) => {
          set((state) => ({
            activeFilters: { ...state.activeFilters, [key]: value }
          }));
        },

        clearFilters: () => {
          set({ activeFilters: initialFilters });
        },

        selectResult: (id: string | null) => {
          set({ selectedResultId: id });
        },

        reset: () => {
          set({
            query: '',
            results: [],
            isSearching: false,
            error: null,
            activeFilters: initialFilters,
            selectedResultId: null
          });
        },

        // Computed
        getFilteredResults: () => {
          const { results, activeFilters } = get();
          
          return results.filter((result) => {
            // Category filter
            if (activeFilters.category && result.category !== activeFilters.category) {
              return false;
            }
            
            // Source filter
            if (activeFilters.source && result.source !== activeFilters.source) {
              return false;
            }
            
            // Date range filter
            if (activeFilters.dateRange !== 'all' && result.published_at) {
              const resultDate = new Date(result.published_at);
              const now = new Date();
              const diffMs = now.getTime() - resultDate.getTime();
              const diffDays = diffMs / (1000 * 60 * 60 * 24);
              
              switch (activeFilters.dateRange) {
                case 'day':
                  if (diffDays > 1) return false;
                  break;
                case 'week':
                  if (diffDays > 7) return false;
                  break;
                case 'month':
                  if (diffDays > 30) return false;
                  break;
                case 'year':
                  if (diffDays > 365) return false;
                  break;
              }
            }
            
            return true;
          });
        },

        getRecentHistory: (limit = 5) => {
          return get().history.slice(0, limit);
        }
      }),
      {
        name: 'mc-search-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ history: state.history })
      }
    ),
    { name: 'SearchStore' }
  )
);

// Selector hooks
export const useSearchQuery = () => useSearchStore((state) => state.query);
export const useSearchResults = () => useSearchStore((state) => state.results);
export const useSearchLoading = () => useSearchStore((state) => state.isSearching);
export const useSearchError = () => useSearchStore((state) => state.error);
export const useSearchHistory = () => useSearchStore((state) => state.history);
export const useSearchFilters = () => useSearchStore((state) => state.activeFilters);

export default useSearchStore;
