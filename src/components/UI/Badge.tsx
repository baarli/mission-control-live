/* ============================================
   BADGE COMPONENT
   ============================================ */

import React from 'react';
import type { BadgeVariant, Category } from '../../types';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  category?: Category;
  className?: string;
}

const categoryToVariant: Record<Category, BadgeVariant> = {
  'REALITY_TV': 'reality',
  'KJENDIS_DRAMA': 'kjendis',
  'FILM_TV': 'film',
  'MUSIKK': 'musikk',
  'INTERNASJONALT': 'internasjonalt',
  'TALK': 'talk',
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  category,
  className = '',
}) => {
  // If category is provided, use it to determine variant
  const finalVariant = category ? categoryToVariant[category] : variant;

  const classNames = [styles.badge, styles[finalVariant], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
};

export default Badge;
