/* ============================================
   STAT CARD COMPONENT
   ============================================ */

import React from 'react';

import { GlassCard } from '../Layout';

import styles from './StatCard.module.css';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  variant?: 'default' | 'success' | 'info';
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  trend = 'neutral',
  trendLabel,
  variant = 'default',
  isLoading = false,
}) => {
  const borderColor = variant === 'success' ? 'success' : variant === 'info' ? 'warning' : 'primary';

  if (isLoading) {
    return (
      <GlassCard borderColor="default" className={styles.loading}>
        <div className={styles.skeletonIcon} />
        <div className={styles.skeletonValue} />
        <div className={styles.skeletonLabel} />
      </GlassCard>
    );
  }

  return (
    <GlassCard borderColor={borderColor} className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <div className={[styles.value, styles[variant]].join(' ')}>
        {value}
      </div>
      <div className={styles.label}>{label}</div>
      {trendLabel && (
        <span className={[styles.trend, styles[trend]].join(' ')}>
          {trend === 'up' && '↗️ '}
          {trend === 'down' && '↘️ '}
          {trend === 'neutral' && '➡️ '}
          {trendLabel}
        </span>
      )}
    </GlassCard>
  );
};

export default StatCard;
