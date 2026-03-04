/* ============================================
   STATS VIEW COMPONENT
   ============================================ */

import React, { useMemo } from 'react';
import LineChart from './LineChart';
import DataTable from './DataTable';
import { GlassCard, Button, SkeletonCard } from '../UI';
import type { NielsenMetric, PodcastMetric, ChartDataPoint } from '../../types';
import styles from './StatsView.module.css';

interface StatsViewProps {
  radioData: NielsenMetric[];
  podcastData: PodcastMetric[];
  isLoading?: boolean;
  onExportRadio?: () => void;
  onExportPodcast?: () => void;
  onRefresh?: () => void;
}

const StatsView: React.FC<StatsViewProps> = ({
  radioData,
  podcastData,
  isLoading = false,
  onExportRadio,
  onExportPodcast,
  onRefresh,
}) => {
  // Transform data for charts
  const radioChartData: ChartDataPoint[] = useMemo(() => {
    return [...radioData]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-12) // Last 12 data points
      .map(m => ({
        label: new Date(m.created_at).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' }),
        value: m.value,
        date: m.created_at,
      }));
  }, [radioData]);

  const podcastChartData: ChartDataPoint[] = useMemo(() => {
    return [...podcastData]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-12)
      .map(m => ({
        label: new Date(m.created_at).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' }),
        value: m.rank,
        date: m.created_at,
      }));
  }, [podcastData]);

  return (
    <section className={styles.container} aria-label="Statistikk">
      <div className={styles.grid}>
        {/* Radio Stats */}
        <GlassCard>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">📻</span> Radio (Nielsen)
            </h2>
            {onExportRadio && (
              <Button variant="ghost" size="sm" onClick={onExportRadio}>
                📊 Eksporter CSV
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loading}>
              <SkeletonCard lines={2} />
            </div>
          ) : (
            <>
              <div className={styles.chart}>
                <LineChart
                  data={radioChartData}
                  color="#6366f1"
                  showGrid
                  showArea
                  yAxisFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
              </div>
              <DataTable
                data={radioData.slice(0, 5)}
                type="radio"
              />
            </>
          )}
        </GlassCard>

        {/* Podcast Stats */}
        <GlassCard>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">🎙️</span> Podcast (Podtoppen)
            </h2>
            {onExportPodcast && (
              <Button variant="ghost" size="sm" onClick={onExportPodcast}>
                📊 Eksporter CSV
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loading}>
              <SkeletonCard lines={2} />
            </div>
          ) : (
            <>
              <div className={styles.chart}>
                <LineChart
                  data={podcastChartData}
                  color="#10b981"
                  showGrid
                  showArea
                  yAxisFormatter={(v) => `#${v}`}
                />
              </div>
              <DataTable
                data={podcastData.slice(0, 5)}
                type="podcast"
              />
            </>
          )}
        </GlassCard>
      </div>

      {/* Refresh Button */}
      {!isLoading && onRefresh && (
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onRefresh}>
            🔄 Oppdater statistikk
          </Button>
        </div>
      )}
    </section>
  );
};

export default StatsView;
