/* ============================================
   TOAST CONTAINER COMPONENT
   ============================================ */

import React from 'react';

import type { Toast as ToastType } from '../../types';

import { ToastItem } from './Toast';
import styles from './ToastContainer.module.css';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.container}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
