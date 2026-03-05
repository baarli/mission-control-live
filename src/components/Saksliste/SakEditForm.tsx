/* ============================================
   SAK EDIT FORM COMPONENT
   ============================================ */

import React, { useState } from 'react';

import type { Sak, Category } from '../../types';
import { Button, Input, Select } from '../UI';

import styles from './SakEditForm.module.css';

interface SakEditFormProps {
  sak: Sak;
  index: number;
  onSave: (id: string, data: Partial<Sak>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const categoryOptions = [
  { value: 'TALK', label: 'TALK' },
  { value: 'REALITY_TV', label: 'Reality TV' },
  { value: 'KJENDIS_DRAMA', label: 'Kjendis Drama' },
  { value: 'FILM_TV', label: 'Film & TV' },
  { value: 'MUSIKK', label: 'Musikk' },
  { value: 'INTERNASJONALT', label: 'Internasjonalt' },
];

const SakEditForm: React.FC<SakEditFormProps> = ({
  sak,
  index,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [title, setTitle] = useState(sak.title);
  const [description, setDescription] = useState(sak.description || '');
  const [category, setCategory] = useState<Category>(sak.category);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Tittel er påkrevd');
      return;
    }

    onSave(sak.id, {
      title: title.trim(),
      description: description.trim(),
      category,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.form}>
      {/* Number */}
      <div className={styles.number} aria-hidden="true">
        {index + 1}
      </div>

      {/* Fields */}
      <div className={styles.fields}>
        <div className={styles.row}>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Tittel"
            error={error}
            fullWidth
            disabled={isSaving}
          />
          <Select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            options={categoryOptions}
            disabled={isSaving}
          />
        </div>

        <Input
          type="textarea"
          multiline
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Beskrivelse"
          fullWidth
          disabled={isSaving}
        />

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Avbryt
          </Button>
          <Button type="submit" variant="success" isLoading={isSaving}>
            💾 Lagre
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SakEditForm;
