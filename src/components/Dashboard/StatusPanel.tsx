/* ============================================
   STATUS PANEL COMPONENT
   ============================================ */

import React from 'react';

import { GlassCard } from '../Layout';
import { SkeletonText } from '../UI';

import styles from './StatusPanel.module.css';

export type StatusType = 'loading' | 'success' | 'error' | 'warning';

interface StatusPanelProps {
  status: StatusType;
  message?: string;
  details?: string;
  title?: string;
}

const icons: Record<StatusType, string> = {
  loading: '⏳',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

const StatusPanel: React.FC<StatusPanelProps> = ({
  status,
  message,
  details,
  title = 'Systemstatus',
}) => {
  const getDefaultMessage = () => {
    switch (status) {
      case 'loading':
        return 'Kobler til server...';
      case 'success':
        return message || 'Tilkoblet!';
      case 'error':
        return message || 'En feil oppstod';
      case 'warning':
        return message || 'Advarsel';
      default:
        return '';
    }
  };

  return (
    <GlassCard className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>

      {status === 'loading' ? (
        <div className={styles.loading}>
          <SkeletonText lines={2} />
        </div>
      ) : (
        <div className={[styles.content, styles[status]].join(' ')}>
          <span className={styles.icon} aria-hidden="true">
            {icons[status]}
          </span>
          <div className={styles.text}>
            <p className={styles.message}>{getDefaultMessage()}</p>
            {details && <p className={styles.details}>{details}</p>}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default StatusPanel;
