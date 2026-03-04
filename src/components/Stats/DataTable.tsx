/* ============================================
   DATA TABLE COMPONENT
   ============================================ */

import React from 'react';

import type { NielsenMetric, PodcastMetric } from '../../types';

import styles from './DataTable.module.css';

interface DataTableProps {
  data: NielsenMetric[] | PodcastMetric[];
  type: 'radio' | 'podcast';
  onExport?: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  type,
  onExport,
}) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('nb-NO').format(num);
  };

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Ingen data tilgjengelig</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {onExport && (
        <div className={styles.header}>
          <button onClick={onExport} className={styles.exportButton}>
            📊 Eksporter CSV
          </button>
        </div>
      )}
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dato</th>
              {type === 'radio' ? (
                <>
                  <th>Kanal</th>
                  <th>Metrikk</th>
                  <th className={styles.numeric}>Verdi</th>
                </>
              ) : (
                <>
                  <th>Podcast</th>
                  <th className={styles.numeric}>Rank</th>
                  <th className={styles.numeric}>Lyttere</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.created_at)}</td>
                {type === 'radio' ? (
                  <>
                    <td>{(item as NielsenMetric).channel}</td>
                    <td>{(item as NielsenMetric).metric_type}</td>
                    <td className={styles.numeric}>
                      {formatNumber((item as NielsenMetric).value)}
                    </td>
                  </>
                ) : (
                  <>
                    <td>{(item as PodcastMetric).podcast_title}</td>
                    <td className={styles.numeric}>
                      #{formatNumber((item as PodcastMetric).rank)}
                    </td>
                    <td className={styles.numeric}>
                      {(item as PodcastMetric).total_listens
                        ? formatNumber((item as PodcastMetric).total_listens!)
                        : '-'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
