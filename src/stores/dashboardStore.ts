import { create } from 'zustand';

import { missionsApi } from '@services/api/missions';

import type { Metric, Mission, DashboardData } from '@/types';

interface DashboardState {
  // Data
  metrics: Metric[];
  missions: Mission[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  setMetrics: (metrics: Metric[]) => void;
  setMissions: (missions: Mission[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchDashboardData: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  
  // Computed
  getActiveMissions: () => Mission[];
  getPendingMissions: () => Mission[];
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  metrics: [],
  missions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  setMetrics: metrics => set({ metrics }),
  setMissions: missions => set({ missions }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [missionsData] = await Promise.all([
        missionsApi.getAll(),
        // Add other API calls here
      ]);

      set({
        missions: missionsData,
        lastUpdated: new Date(),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch data',
        isLoading: false,
      });
    }
  },

  refreshMetrics: async () => {
    // Refresh specific metrics
    set({ lastUpdated: new Date() });
  },

  getActiveMissions: () => {
    return get().missions.filter(m => m.status === 'active');
  },

  getPendingMissions: () => {
    return get().missions.filter(m => m.status === 'pending');
  },
}));
