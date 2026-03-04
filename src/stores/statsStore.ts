/* ============================================
   STATS STORE - Zustand
   ============================================ */

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

import type { NielsenMetric, PodcastMetric, ChartDataPoint } from '../types';

type StatsTimeRange = 'week' | 'month' | 'quarter' | 'year';
type StatsView = 'overview' | 'nielsen' | 'podcast' | 'comparison';

interface StatsState {
  // State
  nielsenData: NielsenMetric[];
  podcastData: PodcastMetric[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: Record<string, string>;
  timeRange: StatsTimeRange;
  currentView: StatsView;
  selectedChannels: string[];
  selectedPodcasts: string[];
  chartType: 'line' | 'bar' | 'area' | 'pie';

  // Actions
  setNielsenData: (data: NielsenMetric[]) => void;
  setPodcastData: (data: PodcastMetric[]) => void;
  addNielsenMetric: (metric: NielsenMetric) => void;
  addPodcastMetric: (metric: PodcastMetric) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setTimeRange: (range: StatsTimeRange) => void;
  setCurrentView: (view: StatsView) => void;
  toggleChannel: (channel: string) => void;
  togglePodcast: (podcast: string) => void;
  selectAllChannels: (channels: string[]) => void;
  selectAllPodcasts: (podcasts: string[]) => void;
  setChartType: (type: StatsState['chartType']) => void;
  refreshData: (dataType: 'nielsen' | 'podcast') => void;
  reset: () => void;

  // Computed
  getNielsenChartData: () => ChartDataPoint[];
  getPodcastChartData: () => ChartDataPoint[];
  getAvailableChannels: () => string[];
  getAvailablePodcasts: () => string[];
  getStatsSummary: () => {
    totalNielsenPoints: number;
    totalPodcasts: number;
    avgNielsenValue: number;
    topPodcast: PodcastMetric | null;
  };
}

export const useStatsStore = create<StatsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        nielsenData: [],
        podcastData: [],
        isLoading: false,
        error: null,
        lastFetchedAt: {},
        timeRange: 'week',
        currentView: 'overview',
        selectedChannels: [],
        selectedPodcasts: [],
        chartType: 'line',

        // Actions
        setNielsenData: (data: NielsenMetric[]) => {
          set(state => ({
            nielsenData: data,
            lastFetchedAt: { ...state.lastFetchedAt, nielsen: new Date().toISOString() },
            error: null,
          }));
        },

        setPodcastData: (data: PodcastMetric[]) => {
          set(state => ({
            podcastData: data,
            lastFetchedAt: { ...state.lastFetchedAt, podcast: new Date().toISOString() },
            error: null,
          }));
        },

        addNielsenMetric: (metric: NielsenMetric) => {
          set(state => ({
            nielsenData: [...state.nielsenData, metric],
          }));
        },

        addPodcastMetric: (metric: PodcastMetric) => {
          set(state => ({
            podcastData: [...state.podcastData, metric],
          }));
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error, isLoading: false });
        },

        setTimeRange: (range: StatsTimeRange) => {
          set({ timeRange: range });
        },

        setCurrentView: (view: StatsView) => {
          set({ currentView: view });
        },

        toggleChannel: (channel: string) => {
          set(state => ({
            selectedChannels: state.selectedChannels.includes(channel)
              ? state.selectedChannels.filter(c => c !== channel)
              : [...state.selectedChannels, channel],
          }));
        },

        togglePodcast: (podcast: string) => {
          set(state => ({
            selectedPodcasts: state.selectedPodcasts.includes(podcast)
              ? state.selectedPodcasts.filter(p => p !== podcast)
              : [...state.selectedPodcasts, podcast],
          }));
        },

        selectAllChannels: (channels: string[]) => {
          set({ selectedChannels: channels });
        },

        selectAllPodcasts: (podcasts: string[]) => {
          set({ selectedPodcasts: podcasts });
        },

        setChartType: (type: StatsState['chartType']) => {
          set({ chartType: type });
        },

        refreshData: (dataType: 'nielsen' | 'podcast') => {
          set(state => ({
            lastFetchedAt: { ...state.lastFetchedAt, [dataType]: new Date().toISOString() },
          }));
        },

        reset: () => {
          set({
            nielsenData: [],
            podcastData: [],
            isLoading: false,
            error: null,
            lastFetchedAt: {},
            timeRange: 'week',
            currentView: 'overview',
            selectedChannels: [],
            selectedPodcasts: [],
            chartType: 'line',
          });
        },

        // Computed
        getNielsenChartData: () => {
          const { nielsenData, selectedChannels, timeRange } = get();

          // Filter by selected channels
          let filtered = nielsenData;
          if (selectedChannels.length > 0) {
            filtered = filtered.filter(m => selectedChannels.includes(m.channel));
          }

          // Filter by time range
          const now = new Date();
          const cutoffDate = new Date();
          switch (timeRange) {
            case 'week':
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              cutoffDate.setMonth(now.getMonth() - 1);
              break;
            case 'quarter':
              cutoffDate.setMonth(now.getMonth() - 3);
              break;
            case 'year':
              cutoffDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          filtered = filtered.filter(m => new Date(m.week_start) >= cutoffDate);

          // Group by week and aggregate
          const grouped = filtered.reduce(
            (acc, metric) => {
              const key = metric.week_start;
              if (!acc[key]) {
                acc[key] = { label: key, value: 0, count: 0 };
              }
              acc[key].value += metric.value;
              acc[key].count += 1;
              return acc;
            },
            {} as Record<string, { label: string; value: number; count: number }>
          );

          return Object.values(grouped)
            .map(g => ({ label: g.label, value: Math.round(g.value / g.count) }))
            .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
        },

        getPodcastChartData: () => {
          const { podcastData, selectedPodcasts, timeRange } = get();

          // Filter by selected podcasts
          let filtered = podcastData;
          if (selectedPodcasts.length > 0) {
            filtered = filtered.filter(m => selectedPodcasts.includes(m.podcast_title));
          }

          // Filter by time range
          const now = new Date();
          const cutoffDate = new Date();
          switch (timeRange) {
            case 'week':
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              cutoffDate.setMonth(now.getMonth() - 1);
              break;
            case 'quarter':
              cutoffDate.setMonth(now.getMonth() - 3);
              break;
            case 'year':
              cutoffDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          filtered = filtered.filter(m => new Date(m.week_start) >= cutoffDate);

          // Return top 10 by rank
          return filtered.slice(0, 10).map(m => ({
            label: m.podcast_title,
            value: m.rank,
            date: m.week_start,
          }));
        },

        getAvailableChannels: () => {
          const channels = new Set(get().nielsenData.map(m => m.channel));
          return Array.from(channels).sort();
        },

        getAvailablePodcasts: () => {
          const podcasts = new Set(get().podcastData.map(m => m.podcast_title));
          return Array.from(podcasts).sort();
        },

        getStatsSummary: () => {
          const { nielsenData, podcastData } = get();

          const totalNielsenPoints = nielsenData.length;
          const totalPodcasts = podcastData.length;
          const avgNielsenValue =
            totalNielsenPoints > 0
              ? nielsenData.reduce((sum, m) => sum + m.value, 0) / totalNielsenPoints
              : 0;
          const first = podcastData[0];
          const topPodcast: PodcastMetric | null =
            podcastData.length > 0 && first
              ? podcastData.reduce(
                  (top, current) => (current.rank < top.rank ? current : top),
                  first
                )
              : null;

          return {
            totalNielsenPoints,
            totalPodcasts,
            avgNielsenValue: Math.round(avgNielsenValue * 100) / 100,
            topPodcast,
          };
        },
      }),
      {
        name: 'mc-stats-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          timeRange: state.timeRange,
          currentView: state.currentView,
          chartType: state.chartType,
        }),
      }
    ),
    { name: 'StatsStore' }
  )
);

// Selector hooks
export const useNielsenData = () => useStatsStore(state => state.nielsenData);
export const usePodcastData = () => useStatsStore(state => state.podcastData);
export const useStatsLoading = () => useStatsStore(state => state.isLoading);
export const useStatsError = () => useStatsStore(state => state.error);
export const useStatsTimeRange = () => useStatsStore(state => state.timeRange);
export const useStatsView = () => useStatsStore(state => state.currentView);

export default useStatsStore;
