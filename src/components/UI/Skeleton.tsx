/* ============================================
   SKELETON COMPONENT
   ============================================ */

import React from 'react';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
  count = 1,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: circle ? '50%' : undefined,
  };

  const skeletonClass = [styles.skeleton, className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

// Preset skeletons for common use cases
export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      <Skeleton width="60%" height="1.25rem" className={styles.title} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '80%' : '100%'} />
      ))}
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 2,
  className = '',
}) => {
  return (
    <div className={[styles.textBlock, className].filter(Boolean).join(' ')}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

export default Skeleton;
