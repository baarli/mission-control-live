/* ============================================
   VALIDATION UTILITIES
   ============================================ */

import { isValidCategory } from '../constants/categories';

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Field validator function type
 */
export type FieldValidator = (value: unknown) => string | null;

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  required: (value: unknown): string | null => {
    if (value === null || value === undefined) return 'Dette feltet er påkrevd';
    if (typeof value === 'string' && value.trim() === '') return 'Dette feltet er påkrevd';
    if (Array.isArray(value) && value.length === 0) return 'Dette feltet er påkrevd';
    return null;
  },

  minLength: (min: number) => (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    if (value.length < min) return `Må være minst ${min} tegn`;
    return null;
  },

  maxLength: (max: number) => (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    if (value.length > max) return `Maks ${max} tegn`;
    return null;
  },

  email: (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Ugyldig e-postadresse';
    return null;
  },

  url: (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Ugyldig URL';
    }
  },

  numeric: (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null;
    if (!/^-?\d*\.?\d+$/.test(value)) return 'Må være et tall';
    return null;
  },

  min: (min: number) => (value: unknown): string | null => {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return null;
    if (num < min) return `Må være minst ${min}`;
    return null;
  },

  max: (max: number) => (value: unknown): string | null => {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return null;
    if (num > max) return `Maks ${max}`;
    return null;
  },

  pattern: (regex: RegExp, message: string) => (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null;
    if (!regex.test(value)) return message;
    return null;
  },

  oneOf: (values: unknown[]) => (value: unknown): string | null => {
    if (!values.includes(value)) return 'Ugyldig verdi';
    return null;
  }
};

/**
 * Compose multiple validators
 */
export function composeValidators(...validators: FieldValidator[]): FieldValidator {
  return (value: unknown): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Validate object against schema
 */
export function validateObject<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, FieldValidator>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [key, validator] of Object.entries(schema)) {
    const error = validator(data[key]);
    if (error) {
      errors[key] = error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate sak form data
 */
export function validateSak(data: {
  title?: string;
  description?: string;
  category?: string;
  link_url?: string;
  show_date?: string;
}): ValidationResult {
  const schema = {
    title: composeValidators(
      VALIDATION_RULES.required,
      VALIDATION_RULES.minLength(2),
      VALIDATION_RULES.maxLength(200)
    ),
    description: VALIDATION_RULES.maxLength(1000),
    category: (value: unknown): string | null => {
      if (!value) return 'Kategori er påkrevd';
      if (!isValidCategory(String(value))) return 'Ugyldig kategori';
      return null;
    },
    link_url: (value: unknown): string | null => {
      if (!value) return null;
      return VALIDATION_RULES.url(value);
    },
    show_date: VALIDATION_RULES.required
  };

  return validateObject(data as Record<string, unknown>, schema);
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): ValidationResult {
  const schema = {
    query: composeValidators(
      VALIDATION_RULES.required,
      VALIDATION_RULES.minLength(2),
      VALIDATION_RULES.maxLength(200)
    )
  };

  return validateObject({ query }, schema);
}

/**
 * Validate login form
 */
export function validateLogin(password: string): ValidationResult {
  const schema = {
    password: composeValidators(
      VALIDATION_RULES.required,
      VALIDATION_RULES.minLength(4)
    )
  };

  return validateObject({ password }, schema);
}

/**
 * Validate settings form
 */
export function validateSettings(data: {
  theme?: string;
  notifications?: boolean;
  email?: string;
}): ValidationResult {
  const schema = {
    theme: VALIDATION_RULES.oneOf(['dark', 'light', 'system']),
    notifications: (): string | null => null,
    email: (value: unknown): string | null => {
      if (!value) return null;
      return VALIDATION_RULES.email(value);
    }
  };

  return validateObject(data as Record<string, unknown>, schema);
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): ValidationResult {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options;
  const errors: Record<string, string> = {};

  if (maxSize && file.size > maxSize) {
    errors.size = `Filen er for stor (maks ${formatFileSize(maxSize)})`;
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    errors.type = `Ugyldig filtype. Tillatte typer: ${allowedTypes.join(', ')}`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
}

/**
 * Sanitize string input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 10000); // Limit length
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: string | Date | null,
  endDate: string | Date | null
): ValidationResult {
  const errors: Record<string, string> = {};

  if (startDate && endDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (start > end) {
      errors.dateRange = 'Startdato må være før sluttdato';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Create validator hook for React forms
 */
export function createValidator<T extends Record<string, unknown>>(
  schema: Record<keyof T, FieldValidator>
) {
  return {
    validate: (data: T): ValidationResult => validateObject(data, schema),
    validateField: (key: keyof T, value: unknown): string | null => {
      const validator = schema[key];
      return validator ? validator(value) : null;
    }
  };
}

export default {
  VALIDATION_RULES,
  composeValidators,
  validateObject,
  validateSak,
  validateSearchQuery,
  validateLogin,
  validateSettings,
  validateFile,
  validateDateRange,
  sanitizeInput,
  isEmpty,
  createValidator,
};
