/* ============================================
   USE SAKSLISTE HOOK
   ============================================ */

import { useCallback, useEffect, useMemo } from 'react';

import {
  useSakslisteStore,
  useSakslisteItems,
  useSakslisteLoading,
  useSakslisteError,
  useSakslisteFilters,
  useFilteredSakslisteItems,
} from '../stores/sakslisteStore';
import type { Sak, Category } from '../types';

import { useToast } from './useToast';

interface UseSakslisteReturn {
  // State
  items: Sak[];
  filteredItems: Sak[];
  isLoading: boolean;
  error: string | null;
  filters: ReturnType<typeof useSakslisteFilters>;
  selectedItem: Sak | undefined;

  // Actions
  setItems: (items: Sak[]) => void;
  addItem: (item: Omit<Sak, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<Sak>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  selectItem: (id: string | null) => void;
  reorderItems: (orderedIds: string[]) => void;
  refreshItems: () => Promise<void>;

  // Filters
  setCategoryFilter: (category: Category | null) => void;
  setSearchFilter: (query: string) => void;
  setDateRangeFilter: (from: string | null, to: string | null) => void;
  clearFilters: () => void;

  // Sorting
  setSortBy: (sortBy: 'order_index' | 'created_at' | 'title') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
}

// Mock API calls - replace with actual Supabase calls
const mockFetchItems = async (): Promise<Sak[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
};

const mockCreateItem = async (
  item: Omit<Sak, 'id' | 'created_at' | 'updated_at'>
): Promise<Sak> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Sak;
};

const mockUpdateItem = async (id: string, updates: Partial<Sak>): Promise<Sak> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    ...updates,
    id,
    updated_at: new Date().toISOString(),
  } as Sak;
};

const mockDeleteItem = async (_id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

export function useSaksliste(): UseSakslisteReturn {
  const { showToast } = useToast();
  const store = useSakslisteStore();
  const items = useSakslisteItems();
  const isLoading = useSakslisteLoading();
  const error = useSakslisteError();
  const filters = useSakslisteFilters();
  const filteredItems = useFilteredSakslisteItems();
  const selectedItem = useMemo(() => {
    const selectedId = store.selectedItemId;
    return selectedId ? store.getItemById(selectedId) : undefined;
  }, [store]);

  // Actions
  const setItems = useCallback(
    (items: Sak[]) => {
      store.setItems(items);
    },
    [store]
  );

  const addItem = useCallback(
    async (item: Omit<Sak, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        store.setLoading(true);
        const newItem = await mockCreateItem(item);
        store.addItem(newItem);
        showToast('Sak lagt til', 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Kunne ikke legge til sak';
        store.setError(message);
        showToast(message, 'error');
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store, showToast]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Sak>) => {
      try {
        store.setLoading(true);
        await mockUpdateItem(id, updates);
        store.updateItem(id, updates);
        showToast('Sak oppdatert', 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Kunne ikke oppdatere sak';
        store.setError(message);
        showToast(message, 'error');
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store, showToast]
  );

  const removeItem = useCallback(
    async (id: string) => {
      try {
        store.setLoading(true);
        await mockDeleteItem(id);
        store.removeItem(id);
        showToast('Sak slettet', 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Kunne ikke slette sak';
        store.setError(message);
        showToast(message, 'error');
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store, showToast]
  );

  const selectItem = useCallback(
    (id: string | null) => {
      store.selectItem(id);
    },
    [store]
  );

  const reorderItems = useCallback(
    (orderedIds: string[]) => {
      store.reorderItems(orderedIds);
    },
    [store]
  );

  const refreshItems = useCallback(async () => {
    try {
      store.setLoading(true);
      const items = await mockFetchItems();
      store.setItems(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke hente saker';
      store.setError(message);
      showToast(message, 'error');
    } finally {
      store.setLoading(false);
    }
  }, [store, showToast]);

  // Filter actions
  const setCategoryFilter = useCallback(
    (category: Category | null) => {
      store.setFilter('category', category);
    },
    [store]
  );

  const setSearchFilter = useCallback(
    (query: string) => {
      store.setFilter('searchQuery', query);
    },
    [store]
  );

  const setDateRangeFilter = useCallback(
    (from: string | null, to: string | null) => {
      store.setFilter('dateRange', { from, to });
    },
    [store]
  );

  const clearFilters = useCallback(() => {
    store.clearFilters();
  }, [store]);

  // Sort actions
  const setSortBy = useCallback(
    (sortBy: 'order_index' | 'created_at' | 'title') => {
      store.setSort(sortBy);
    },
    [store]
  );

  const setSortOrder = useCallback(
    (order: 'asc' | 'desc') => {
      store.setSort(store.sortBy, order);
    },
    [store]
  );

  // Auto-refresh on mount
  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      refreshItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    filteredItems,
    isLoading,
    error,
    filters,
    selectedItem,
    setItems,
    addItem,
    updateItem,
    removeItem,
    selectItem,
    reorderItems,
    refreshItems,
    setCategoryFilter,
    setSearchFilter,
    setDateRangeFilter,
    clearFilters,
    setSortBy,
    setSortOrder,
  };
}

export default useSaksliste;
