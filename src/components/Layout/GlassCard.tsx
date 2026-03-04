/* ============================================
   GLASS CARD COMPONENT
   ============================================ */

import React from 'react';

import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: 'default' | 'primary' | 'success' | 'warning';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'lg',
  borderColor = 'default',
}) => {
  const classNames = [
    styles.card,
    hover && styles.hover,
    onClick && styles.clickable,
    styles[`padding-${padding}`],
    styles[`border-${borderColor}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

export default GlassCard;
