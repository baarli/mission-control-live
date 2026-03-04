/* ============================================
   EMPTY STATE COMPONENT
   ============================================ */

import React from 'react';

import { GlassCard, Button } from '../UI';

import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title = 'Ingen saker ennå',
  description = 'Start med å søke etter nyheter eller legg til manuelt fra søkefanen.',
  actionLabel,
  onAction,
}) => {
  return (
    <GlassCard className={styles.container} hoverable={false}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className={styles.action}>
          {actionLabel}
        </Button>
      )}
    </GlassCard>
  );
};

export default EmptyState;
