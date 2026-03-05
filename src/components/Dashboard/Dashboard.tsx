/* ============================================
   DASHBOARD COMPONENT
   ============================================ */

import React, { useState, useEffect } from 'react';

import type { Sak, NielsenMetric, PodcastMetric } from '../../types';

import styles from './Dashboard.module.css';
import StatCard from './StatCard';
import StatusPanel from './StatusPanel';

interface DashboardProps {
  saker?: Sak[];
  radioStats?: NielsenMetric;
  podcastStats?: PodcastMetric;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  saker = [],
  radioStats,
  podcastStats,
  isLoading = false,
  error = null,
  onRefresh,
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isLoading) {
      setStatus('loading');
    } else if (error) {
      setStatus('error');
      setStatusMessage(error);
    } else {
      setStatus('success');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStatusMessage(`${saker.length} saker for ${tomorrow.toISOString().split('T')[0]}`);
    }
  }, [isLoading, error, saker.length]);

  const formatRadioValue = (metric?: NielsenMetric): string => {
    if (!metric) return '-';
    return `${(metric.value / 1000).toFixed(1)}k`;
  };

  const formatPodcastRank = (metric?: PodcastMetric): string => {
    if (!metric) return '-';
    return `#${metric.rank}`;
  };

  return (
    <section className={styles.dashboard} aria-label="Dashboard">
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          value={isLoading ? '-' : saker.length}
          label="Saker i morgen"
          icon="📋"
          trend="up"
          trendLabel="Oppdatert"
          variant="default"
          isLoading={isLoading}
        />
        <StatCard
          value={isLoading ? '-' : formatRadioValue(radioStats)}
          label="Radio lyttere"
          icon="📻"
          trend="up"
          trendLabel="Nielsen"
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          value={isLoading ? '-' : formatPodcastRank(podcastStats)}
          label="Podcast rank"
          icon="🎙️"
          trend="up"
          trendLabel="Podtoppen"
          variant="info"
          isLoading={isLoading}
        />
      </div>

      {/* Status Panel */}
      <StatusPanel
        status={status}
        message={status === 'error' ? 'Tilkoblingsfeil' : 'Tilkoblet!'}
        details={statusMessage}
        title="Systemstatus"
      />

      {/* Quick Actions */}
      {!isLoading && onRefresh && (
        <div className={styles.actions}>
          <button
            onClick={onRefresh}
            className={styles.refreshButton}
            aria-label="Oppdater dashboard"
          >
            🔄 Oppdater
          </button>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
