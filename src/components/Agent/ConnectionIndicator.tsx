import { useEffect, useState } from 'react';

import { useAgentStore } from '@/stores';

import styles from './styles.module.css';

export function ConnectionIndicator() {
  const { isConnected } = useAgentStore();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Show indicator after a short delay to avoid flash on initial load
    const timer = setTimeout(() => setShowIndicator(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`${styles.connectionIndicator} ${
        isConnected ? styles.online : styles.offline
      }`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.indicatorDot} />
      <span className={styles.indicatorText}>
        {isConnected ? 'BaarliClaw Online' : 'BaarliClaw Offline'}
      </span>
    </div>
  );
}
