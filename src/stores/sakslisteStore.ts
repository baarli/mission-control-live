/* ============================================
   SAKSLISTE STORE - Zustand
   ============================================ */

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

import type { Sak, Category } from '../types';

interface SakslisteState {
  // State
  items: Sak[];
  selectedItemId: string | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
  filters: {
    category: Category | null;
    searchQuery: string;
    dateRange: { from: string | null; to: string | null };
  };
  sortBy: 'order_index' | 'created_at' | 'title';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setItems: (items: Sak[]) => void;
  addItem: (item: Sak) => void;
  updateItem: (id: string, updates: Partial<Sak>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  reorderItems: (orderedIds: string[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (key: keyof SakslisteState['filters'], value: SakslisteState['filters'][keyof SakslisteState['filters']]) => void;
  clearFilters: () => void;
  setSort: (sortBy: SakslisteState['sortBy'], sortOrder?: 'asc' | 'desc') => void;
  reset: () => void;
  
  // Computed
  getFilteredItems: () => Sak[];
  getItemById: (id: string) => Sak | undefined;
  getItemsByCategory: (category: Category) => Sak[];
}

const initialFilters = {
  category: null as Category | null,
  searchQuery: '',
  dateRange: { from: null, to: null } as { from: string | null; to: string | null }
};

export const useSakslisteStore = create<SakslisteState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        selectedItemId: null,
        isLoading: false,
        error: null,
        lastFetchedAt: null,
        filters: initialFilters,
        sortBy: 'order_index',
        sortOrder: 'asc',

        // Actions
        setItems: (items: Sak[]) => {
          set({ 
            items, 
            lastFetchedAt: new Date().toISOString(),
            error: null 
          });
        },

        addItem: (item: Sak) => {
          set((state) => ({
            items: [...state.items, item]
          }));
        },

        updateItem: (id: string, updates: Partial<Sak>) => {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
            )
          }));
        },

        removeItem: (id: string) => {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            selectedItemId: state.selectedItemId === id ? null : state.selectedItemId
          }));
        },

        selectItem: (id: string | null) => {
          set({ selectedItemId: id });
        },

        reorderItems: (orderedIds: string[]) => {
          set((state) => {
            const itemMap = new Map(state.items.map((item) => [item.id, item]));
            const reorderedItems = orderedIds
              .map((id, index) => {
                const item = itemMap.get(id);
                if (item) {
                  return { ...item, order_index: index };
                }
                return null;
              })
              .filter((item): item is Sak => item !== null);
            
            // Add any items not in the ordered list
            const remainingItems = state.items.filter(
              (item) => !orderedIds.includes(item.id)
            );
            
            return { items: [...reorderedItems, ...remainingItems] };
          });
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error, isLoading: false });
        },

        setFilter: (key: keyof SakslisteState['filters'], value: SakslisteState['filters'][keyof SakslisteState['filters']]) => {
          set((state) => ({
            filters: { ...state.filters, [key]: value }
          }));
        },

        clearFilters: () => {
          set({ filters: initialFilters });
        },

        setSort: (sortBy: SakslisteState['sortBy'], sortOrder?: 'asc' | 'desc') => {
          set((state) => ({
            sortBy,
            sortOrder: sortOrder || state.sortOrder
          }));
        },

        reset: () => {
          set({
            items: [],
            selectedItemId: null,
            isLoading: false,
            error: null,
            lastFetchedAt: null,
            filters: initialFilters,
            sortBy: 'order_index',
            sortOrder: 'asc'
          });
        },

        // Computed
        getFilteredItems: () => {
          const { items, filters, sortBy, sortOrder } = get();
          
          let filtered = [...items];
          
          // Apply category filter
          if (filters.category) {
            filtered = filtered.filter((item) => item.category === filters.category);
          }
          
          // Apply search filter
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (item) =>
                item.title.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            );
          }
          
          // Apply date range filter
          if (filters.dateRange.from) {
            filtered = filtered.filter(
              (item) => new Date(item.show_date) >= new Date(filters.dateRange.from!)
            );
          }
          if (filters.dateRange.to) {
            filtered = filtered.filter(
              (item) => new Date(item.show_date) <= new Date(filters.dateRange.to!)
            );
          }
          
          // Apply sorting
          filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
              case 'order_index':
                comparison = a.order_index - b.order_index;
                break;
              case 'created_at':
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
              case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
          });
          
          return filtered;
        },

        getItemById: (id: string) => {
          return get().items.find((item) => item.id === id);
        },

        getItemsByCategory: (category: Category) => {
          return get().items.filter((item) => item.category === category);
        }
      }),
      {
        name: 'mc-saksliste-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          filters: state.filters,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        })
      }
    ),
    { name: 'SakslisteStore' }
  )
);

// Selector hooks
export const useSakslisteItems = () => useSakslisteStore((state) => state.items);
export const useSakslisteLoading = () => useSakslisteStore((state) => state.isLoading);
export const useSakslisteError = () => useSakslisteStore((state) => state.error);
export const useSelectedSak = () => useSakslisteStore((state) => 
  state.selectedItemId ? state.getItemById(state.selectedItemId) : undefined
);
export const useSakslisteFilters = () => useSakslisteStore((state) => state.filters);
export const useFilteredSakslisteItems = () => {
  const store = useSakslisteStore();
  return store.getFilteredItems();
};

export default useSakslisteStore;
