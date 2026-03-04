/* ============================================
   SELECT COMPONENT
   ============================================ */

import React, { SelectHTMLAttributes, forwardRef } from 'react';

import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, fullWidth = false, placeholder, className = '', id, ...props },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const containerClass = [styles.container, fullWidth && styles.fullWidth, className]
      .filter(Boolean)
      .join(' ');

    const selectClass = [styles.select, hasError && styles.error].filter(Boolean).join(' ');

    return (
      <div className={containerClass}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.wrapper}>
          <select
            ref={ref}
            id={selectId}
            className={selectClass}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.arrow} aria-hidden="true">
            ▼
          </span>
        </div>
        {hasError && (
          <span id={`${selectId}-error`} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
