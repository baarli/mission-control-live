/* ============================================
   SAKSLISTE COMPONENT
   ============================================ */

import React, { useState } from 'react';

import type { Sak } from '../../types';
import { GlassCard, Button, Input, SkeletonCard } from '../UI';

import EmptyState from './EmptyState';
import SakEditForm from './SakEditForm';
import { SakItem } from './SakItem';
import styles from './Saksliste.module.css';

interface SakslisteProps {
  saker: Sak[];
  isLoading?: boolean;
  error?: string | null;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onRefresh?: () => void;
  onSaveSak?: (id: string, data: Partial<Sak>) => Promise<void>;
  onDeleteSak?: (id: string) => Promise<void>;
  onNavigateToSearch?: () => void;
}

const Saksliste: React.FC<SakslisteProps> = ({
  saker,
  isLoading = false,
  error = null,
  selectedDate,
  onDateChange,
  onRefresh,
  onSaveSak,
  onDeleteSak,
  onNavigateToSearch,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (id: string, data: Partial<Sak>) => {
    if (!onSaveSak) return;
    
    setSavingId(id);
    try {
      await onSaveSak(id, data);
      setEditingId(null);
    } catch (error) {
      // Error handling is done by parent
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteSak) return;
    await onDeleteSak(id);
  };

  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0] ?? '';
  };

  return (
    <section className={styles.container} aria-label="Saksliste">
      <GlassCard>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span aria-hidden="true">📋</span> Saksliste
          </h2>
          <div className={styles.controls}>
            <Input
              type="date"
              value={selectedDate || getTomorrowDate()}
              onChange={(e) => onDateChange?.(e.target.value)}
              className={styles.dateInput}
            />
            <Button
              variant="icon"
              onClick={onRefresh}
              isLoading={isLoading}
              aria-label="Oppdater"
              title="Oppdater"
            >
              🔄
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {isLoading ? (
            // Loading skeletons
            <>
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
              <SkeletonCard lines={2} />
            </>
          ) : error ? (
            // Error state
            <div className={styles.error} role="alert">
              ❌ {error}
            </div>
          ) : saker.length === 0 ? (
            // Empty state
            <EmptyState
              icon="📋"
              title="Ingen saker ennå"
              description="Start med å søke etter nyheter eller legg til manuelt fra søkefanen."
              actionLabel="Søk etter saker"
              onAction={onNavigateToSearch}
            />
          ) : (
            // Sak list
            <div className={styles.list} role="list">
              {saker.map((sak, index) =>
                editingId === sak.id ? (
                  <SakEditForm
                    key={sak.id}
                    sak={sak}
                    index={index}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={savingId === sak.id}
                  />
                ) : (
                  <SakItem
                    key={sak.id}
                    sak={sak}
                    onEdit={(s) => handleEdit(s.id)}
                    onDelete={(id) => handleDelete(id)}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {!isLoading && !error && saker.length > 0 && (
          <div className={styles.footer}>
            <span className={styles.count}>
              {saker.length} {saker.length === 1 ? 'sak' : 'saker'}
            </span>
          </div>
        )}
      </GlassCard>
    </section>
  );
};

export default Saksliste;
