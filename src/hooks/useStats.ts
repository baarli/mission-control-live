/* ============================================
   USE STATS HOOK
   ============================================ */

import { useCallback, useEffect, useMemo } from 'react';
import { 
  useStatsStore, 
  useNielsenData, 
  usePodcastData, 
  useStatsLoading,
  useStatsError,
  useStatsTimeRange,
  useStatsView
} from '../stores/statsStore';
import type { ChartDataPoint } from '../types';
import { useToast } from './useToast';

type StatsTimeRange = 'week' | 'month' | 'quarter' | 'year';
type StatsView = 'overview' | 'nielsen' | 'podcast' | 'comparison';

interface UseStatsReturn {
  // State
  nielsenData: ReturnType<typeof useNielsenData>;
  podcastData: ReturnType<typeof usePodcastData>;
  isLoading: boolean;
  error: string | null;
  timeRange: StatsTimeRange;
  currentView: StatsView;
  selectedChannels: string[];
  selectedPodcasts: string[];
  chartType: 'line' | 'bar' | 'area' | 'pie';
  
  // Chart data
  nielsenChartData: ChartDataPoint[];
  podcastChartData: ChartDataPoint[];
  
  // Available options
  availableChannels: string[];
  availablePodcasts: string[];
  
  // Summary
  summary: {
    totalNielsenPoints: number;
    totalPodcasts: number;
    avgNielsenValue: number;
    topPodcast: { podcast_title: string; rank: number } | null;
  };
  
  // Actions
  fetchNielsenData: () => Promise<void>;
  fetchPodcastData: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setTimeRange: (range: StatsTimeRange) => void;
  setCurrentView: (view: StatsView) => void;
  toggleChannel: (channel: string) => void;
  togglePodcast: (podcast: string) => void;
  selectAllChannels: () => void;
  selectAllPodcasts: () => void;
  clearChannelSelection: () => void;
  clearPodcastSelection: () => void;
  setChartType: (type: 'line' | 'bar' | 'area' | 'pie') => void;
}

// Mock API calls - replace with actual API calls
const mockFetchNielsen = async (): Promise<any[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { id: '1', channel: 'NRJ', metric_type: 'listeners', value: 150000, week_start: '2024-01-01', created_at: new Date().toISOString() },
    { id: '2', channel: 'NRJ', metric_type: 'listeners', value: 155000, week_start: '2024-01-08', created_at: new Date().toISOString() },
    { id: '3', channel: 'P4', metric_type: 'listeners', value: 200000, week_start: '2024-01-01', created_at: new Date().toISOString() },
    { id: '4', channel: 'P4', metric_type: 'listeners', value: 198000, week_start: '2024-01-08', created_at: new Date().toISOString() }
  ];
};

const mockFetchPodcasts = async (): Promise<any[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { id: '1', podcast_title: 'Kloakkontroll', rank: 5, total_listens: 50000, week_start: '2024-01-01', created_at: new Date().toISOString() },
    { id: '2', podcast_title: 'Morgenrush', rank: 12, total_listens: 35000, week_start: '2024-01-01', created_at: new Date().toISOString() },
    { id: '3', podcast_title: 'Top 20', rank: 3, total_listens: 75000, week_start: '2024-01-01', created_at: new Date().toISOString() }
  ];
};

export function useStats(): UseStatsReturn {
  const { showToast } = useToast();
  const store = useStatsStore();
  const nielsenData = useNielsenData();
  const podcastData = usePodcastData();
  const isLoading = useStatsLoading();
  const error = useStatsError();
  const timeRange = useStatsTimeRange();
  const currentView = useStatsView();
  const selectedChannels = useStatsStore((state) => state.selectedChannels);
  const selectedPodcasts = useStatsStore((state) => state.selectedPodcasts);
  const chartType = useStatsStore((state) => state.chartType);

  // Memoized computed values
  const nielsenChartData = useMemo(() => store.getNielsenChartData(), [store, nielsenData, selectedChannels, timeRange]);
  const podcastChartData = useMemo(() => store.getPodcastChartData(), [store, podcastData, selectedPodcasts, timeRange]);
  const availableChannels = useMemo(() => store.getAvailableChannels(), [store, nielsenData]);
  const availablePodcasts = useMemo(() => store.getAvailablePodcasts(), [store, podcastData]);
  const summary = useMemo(() => store.getStatsSummary(), [store, nielsenData, podcastData]);

  // Actions
  const fetchNielsenData = useCallback(async () => {
    try {
      store.setLoading(true);
      const data = await mockFetchNielsen();
      store.setNielsenData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke hente Nielsen-data';
      store.setError(message);
      showToast(message, 'error');
    } finally {
      store.setLoading(false);
    }
  }, [store, showToast]);

  const fetchPodcastData = useCallback(async () => {
    try {
      store.setLoading(true);
      const data = await mockFetchPodcasts();
      store.setPodcastData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke hente podcast-data';
      store.setError(message);
      showToast(message, 'error');
    } finally {
      store.setLoading(false);
    }
  }, [store, showToast]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchNielsenData(), fetchPodcastData()]);
    showToast('Statistikk oppdatert', 'success');
  }, [fetchNielsenData, fetchPodcastData, showToast]);

  const setTimeRange = useCallback((range: StatsTimeRange) => {
    store.setTimeRange(range);
  }, [store]);

  const setCurrentView = useCallback((view: StatsView) => {
    store.setCurrentView(view);
  }, [store]);

  const toggleChannel = useCallback((channel: string) => {
    store.toggleChannel(channel);
  }, [store]);

  const togglePodcast = useCallback((podcast: string) => {
    store.togglePodcast(podcast);
  }, [store]);

  const selectAllChannels = useCallback(() => {
    store.selectAllChannels(availableChannels);
  }, [store, availableChannels]);

  const selectAllPodcasts = useCallback(() => {
    store.selectAllPodcasts(availablePodcasts);
  }, [store, availablePodcasts]);

  const clearChannelSelection = useCallback(() => {
    store.selectAllChannels([]);
  }, [store]);

  const clearPodcastSelection = useCallback(() => {
    store.selectAllPodcasts([]);
  }, [store]);

  const setChartType = useCallback((type: 'line' | 'bar' | 'area' | 'pie') => {
    store.setChartType(type);
  }, [store]);

  // Auto-fetch on mount
  useEffect(() => {
    if (nielsenData.length === 0 && !isLoading) {
      fetchNielsenData();
    }
    if (podcastData.length === 0 && !isLoading) {
      fetchPodcastData();
    }
  }, []);

  return {
    nielsenData,
    podcastData,
    isLoading,
    error,
    timeRange,
    currentView,
    selectedChannels,
    selectedPodcasts,
    chartType,
    nielsenChartData,
    podcastChartData,
    availableChannels,
    availablePodcasts,
    summary,
    fetchNielsenData,
    fetchPodcastData,
    refreshAll,
    setTimeRange,
    setCurrentView,
    toggleChannel,
    togglePodcast,
    selectAllChannels,
    selectAllPodcasts,
    clearChannelSelection,
    clearPodcastSelection,
    setChartType
  };
}

export default useStats;
