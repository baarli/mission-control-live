/* ============================================
   AGENT STATUS CARD COMPONENT
   ============================================ */

import React from 'react';

import { useAgentStore } from '@/stores/agentStore';

import { GlassCard } from '../Layout';

import styles from './styles.module.css';

export const AgentStatusCard: React.FC = () => {
  const { isConnected, systemStatus, isLoading } = useAgentStore();

  const healthySystems = systemStatus.filter(s => s.status === 'healthy').length;
  const totalSystems = systemStatus.length;
  const avgHealthScore = totalSystems > 0
    ? Math.round(systemStatus.reduce((acc, s) => acc + s.health_score, 0) / totalSystems)
    : 0;

  return (
    <GlassCard className={styles.statusCard}>
      <div className={styles.statusHeader}>
        <h3 className={styles.title}>🤖 BaarliClaw Agent</h3>
        <span className={`${styles.badge} ${isConnected ? styles.connected : styles.disconnected}`}>
          {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricValue}>{isLoading ? '-' : `${avgHealthScore}%`}</span>
          <span className={styles.metricLabel}>Health Score</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>
            {isLoading ? '-' : `${healthySystems}/${totalSystems}`}
          </span>
          <span className={styles.metricLabel}>Systems Healthy</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>{isConnected ? 'Active' : 'Inactive'}</span>
          <span className={styles.metricLabel}>Connection</span>
        </div>
      </div>

      {systemStatus.length > 0 && (
        <div className={styles.systemsList}>
          <h4 className={styles.subtitle}>System Status</h4>
          {systemStatus.slice(0, 3).map((system) => (
            <div key={system.id} className={styles.systemItem}>
              <span className={styles.systemName}>{system.system_name}</span>
              <span className={`${styles.systemStatus} ${styles[system.status]}`}>
                {system.status === 'healthy' && '✓'}
                {system.status === 'degraded' && '⚠'}
                {system.status === 'unhealthy' && '✗'}
                {system.status === 'offline' && '○'}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
