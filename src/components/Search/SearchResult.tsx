/* ============================================
   SEARCH RESULT COMPONENT
   ============================================ */

import React from 'react';

import type { SearchResult as SearchResultType, Category } from '../../types';
import { Badge } from '../UI';

import styles from './SearchResult.module.css';

interface SearchResultProps {
  result: SearchResultType;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onAdd?: (result: SearchResultType) => void;
}

const getScoreVariant = (score?: number): 'high' | 'medium' | 'low' => {
  if (!score) return 'low';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

const SearchResultComponent: React.FC<SearchResultProps> = ({
  result,
  isSelected = false,
  onSelect,
  onAdd,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(result.id, e.target.checked);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(result.id, !isSelected);
    }
  };

  const scoreVariant = getScoreVariant(result.score);

  return (
    <article
      className={[styles.card, isSelected && styles.selected].filter(Boolean).join(' ')}
      onClick={handleCardClick}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(result.id, !isSelected);
              }
            }
          : undefined
      }
    >
      <div className={styles.header}>
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className={styles.checkbox}
            aria-label={`Velg ${result.title}`}
          />
        )}

        <div className={styles.content}>
          <h3 className={styles.title}>{result.title}</h3>
          
          {result.description && (
            <p className={styles.description}>{result.description}</p>
          )}

          <div className={styles.meta}>
            {result.category && (
              <Badge category={result.category as Category}>
                {result.category}
              </Badge>
            )}
            
            {result.source && (
              <span className={styles.source}>{result.source}</span>
            )}

            {result.published_at && (
              <span className={styles.date}>
                {new Date(result.published_at).toLocaleDateString('nb-NO')}
              </span>
            )}

            {result.score !== undefined && (
              <span className={[styles.score, styles[scoreVariant]].join(' ')}>
                Score: {result.score}
              </span>
            )}
          </div>
        </div>

        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(result);
            }}
            className={styles.addButton}
            aria-label={`Legg til ${result.title}`}
            title="Legg til i saksliste"
          >
            ➕
          </button>
        )}
      </div>
    </article>
  );
};

export default SearchResultComponent;
