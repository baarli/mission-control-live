/* ============================================
   SEARCH HISTORY COMPONENT
   ============================================ */

import React from 'react';

import type { SearchHistoryItem } from '../../types';
import { Button } from '../UI';

import styles from './SearchHistory.module.css';

interface SearchHistoryProps {
  items: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onClear: () => void;
  maxItems?: number;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  items,
  onSelect,
  onClear,
  maxItems = 10,
}) => {
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'akkurat nå';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min siden`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} t siden`;
    return `${Math.floor(hours / 24)} d siden`;
  };

  const visibleItems = items.slice(0, maxItems);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>
        <span aria-hidden="true">📜</span> Siste søk
      </h4>

      <ul className={styles.list} role="list">
        {visibleItems.map((item, _index) => (
          <li key={`${item.query}-${item.timestamp}`}>
            <button
              onClick={() => onSelect(item)}
              className={styles.item}
              aria-label={`Søk etter ${item.query}`}
            >
              <span className={styles.query}>
                {item.query}
                {item.category && <span className={styles.category}>[{item.category}]</span>}
              </span>
              <span className={styles.time}>{getTimeAgo(item.timestamp)}</span>
            </button>
          </li>
        ))}
      </ul>

      <Button variant="ghost" size="sm" onClick={onClear} className={styles.clearButton}>
        Tøm historikk
      </Button>
    </div>
  );
};

export default SearchHistory;
