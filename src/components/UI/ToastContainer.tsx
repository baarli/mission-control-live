/* ============================================
   TOAST CONTAINER COMPONENT
   ============================================ */

import React from 'react';
import Toast from './Toast';
import type { Toast as ToastType } from '../../types';
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
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
