/* ============================================
   ACTIVITY LOG COMPONENT
   ============================================ */

import React from 'react';

import { useAgentStore } from '@/stores/agentStore';

import { GlassCard } from '../Layout';

import styles from './styles.module.css';

const levelIcons: Record<string, string> = {
  debug: '🐛',
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const levelStyles: Record<string, string | undefined> = {
  debug: styles.levelDebug,
  info: styles.levelInfo,
  success: styles.levelSuccess,
  warning: styles.levelWarning,
  error: styles.levelError,
};

const categoryIcons: Record<string, string> = {
  system: '⚙️',
  agent: '🤖',
  user: '👤',
  api: '🔌',
  task: '📋',
};

export const ActivityLog: React.FC = () => {
  const { activityLogs, isLoading } = useAgentStore();

  const sortedLogs = [...activityLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <GlassCard className={styles.logCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>📝 Activity Log</h3>
        <span className={styles.count}>{activityLogs.length} entries</span>
      </div>

      <div className={styles.logList}>
        {isLoading ? (
          <div className={styles.loading}>Loading activity...</div>
        ) : sortedLogs.length === 0 ? (
          <div className={styles.empty}>
            <p>No activity yet</p>
            <p className={styles.emptyHint}>Agent activity will be logged here</p>
          </div>
        ) : (
          sortedLogs.slice(0, 20).map(log => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logHeader}>
                <span className={`${styles.logLevel} ${levelStyles[log.level] || ''}`}>
                  {levelIcons[log.level]}
                </span>
                <span className={styles.logCategory}>
                  {categoryIcons[log.category]} {log.category}
                </span>
                <span className={styles.logTime}>
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className={styles.logMessage}>{log.message}</p>
              {log.details && Object.keys(log.details).length > 0 && (
                <pre className={styles.logDetails}>{JSON.stringify(log.details, null, 2)}</pre>
              )}
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};
