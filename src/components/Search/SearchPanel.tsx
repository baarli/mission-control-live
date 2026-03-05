/* ============================================
   SEARCH PANEL COMPONENT
   ============================================ */

import React, { useState, useCallback } from 'react';

import type { SearchResult as SearchResultType, SearchHistoryItem } from '../../types';
import EmptyState from '../Saksliste/EmptyState';
import { GlassCard, Button, Input, Select, SkeletonCard } from '../UI';

import PromptEditor from './PromptEditor';
import SearchHistory from './SearchHistory';
import styles from './SearchPanel.module.css';
import SearchResult from './SearchResult';

interface SearchPanelProps {
  results: SearchResultType[];
  isLoading?: boolean;
  onSearch: (query: string, category: string, freshness: string) => void;
  onAddToSaksliste?: (results: SearchResultType[]) => void;
  onAddSingle?: (result: SearchResultType) => void;
  history?: SearchHistoryItem[];
  onHistorySelect?: (item: SearchHistoryItem) => void;
  onHistoryClear?: () => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
}

const categoryOptions = [
  { value: '', label: 'Alle kategorier' },
  { value: 'REALITY_TV', label: 'Reality TV' },
  { value: 'KJENDIS_DRAMA', label: 'Kjendis Drama' },
  { value: 'FILM_TV', label: 'Film & TV' },
  { value: 'MUSIKK', label: 'Musikk' },
  { value: 'INTERNASJONALT', label: 'Internasjonalt' },
];

const freshnessOptions = [
  { value: 'pd', label: 'Siste 24t' },
  { value: 'pw', label: 'Siste uke' },
];

const SearchPanel: React.FC<SearchPanelProps> = ({
  results,
  isLoading = false,
  onSearch,
  onAddToSaksliste,
  onAddSingle,
  history = [],
  onHistorySelect,
  onHistoryClear,
  prompt = '',
  onPromptChange,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [freshness, setFreshness] = useState('pd');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query.trim(), category, freshness);
      setSelectedIds(new Set());
    }
  }, [query, category, freshness, onSearch]);

  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (select: boolean) => {
      if (select) {
        setSelectedIds(new Set(results.map(r => r.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [results]
  );

  const handleAddSelected = useCallback(() => {
    const selected = results.filter(r => selectedIds.has(r.id));
    onAddToSaksliste?.(selected);
    setSelectedIds(new Set());
  }, [results, selectedIds, onAddToSaksliste]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasResults = results.length > 0;
  const hasSelection = selectedIds.size > 0;

  return (
    <section className={styles.container} aria-label="Søk">
      <GlassCard>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span aria-hidden="true">🔍</span> Søk etter saker
          </h2>
        </div>

        {/* Search Form */}
        <div className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Søk etter nyheter..."
              fullWidth
            />
          </div>

          <div className={styles.filters}>
            <Select
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={categoryOptions}
            />
            <Select
              value={freshness}
              onChange={e => setFreshness(e.target.value)}
              options={freshnessOptions}
            />
            <Button variant="primary" onClick={handleSearch} isLoading={isLoading}>
              Søk
            </Button>
          </div>
        </div>

        {/* Prompt Editor */}
        {onPromptChange && <PromptEditor value={prompt} onChange={onPromptChange} />}

        {/* Selection Actions */}
        {hasResults && onAddToSaksliste && (
          <div
            className={[styles.actionsBar, hasSelection && styles.visible]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.selectionActions}>
              <Button variant="ghost" size="sm" onClick={() => handleSelectAll(true)}>
                ✓ Velg alle
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSelectAll(false)}>
                ✗ Fjern alle
              </Button>
            </div>
            <div className={styles.addAction}>
              <span className={styles.selectedCount}>{selectedIds.size} valgt</span>
              <Button variant="success" onClick={handleAddSelected} disabled={!hasSelection}>
                ➕ Legg til i saksliste
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className={styles.results}>
          {isLoading ? (
            // Loading skeletons
            <>
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </>
          ) : hasResults ? (
            // Results list
            <div className={styles.resultsList} role="list">
              {results.map(result => (
                <SearchResult
                  key={result.id}
                  result={result}
                  isSelected={selectedIds.has(result.id)}
                  onSelect={onAddToSaksliste ? handleSelect : undefined}
                  onAdd={onAddSingle}
                />
              ))}
            </div>
          ) : (
            // Empty state
            <EmptyState
              icon="🔍"
              title="Søk etter nyheter"
              description="Bruk søkefeltet over for å finne aktuelle saker å legge til i sakslista."
            />
          )}
        </div>

        {/* Search History */}
        {onHistorySelect && onHistoryClear && (
          <SearchHistory items={history} onSelect={onHistorySelect} onClear={onHistoryClear} />
        )}
      </GlassCard>
    </section>
  );
};

export default SearchPanel;
