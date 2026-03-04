/* ============================================
   INPUT COMPONENT
   ============================================ */

import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import type { InputType } from '../../types';
import styles from './Input.module.css';

interface BaseInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & BaseInputProps & {
  type?: Exclude<InputType, 'textarea'>;
  multiline?: false;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & BaseInputProps & {
  type?: 'textarea';
  multiline: true;
  rows?: number;
};

type InputProps = TextInputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      multiline = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const containerClass = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClass = [
      styles.input,
      leftIcon && styles.withLeftIcon,
      rightIcon && styles.withRightIcon,
      hasError && styles.error,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClass}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.wrapper}>
          {leftIcon && (
            <span className={styles.leftIcon}>{leftIcon}</span>
          )}
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              className={inputClass}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${inputId}-error` : undefined}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className={inputClass}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${inputId}-error` : undefined}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          {rightIcon && (
            <span className={styles.rightIcon}>{rightIcon}</span>
          )}
        </div>
        {hasError && (
          <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
