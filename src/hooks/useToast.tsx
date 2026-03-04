/* ============================================
   USE TOAST HOOK
   ============================================ */

import { useState, useCallback, useRef, useEffect } from 'react';

import type { Toast, ToastType } from '../types';

interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

// Global toast event emitter for components that can't use hooks
const toastListeners: Array<(message: string, type: ToastType) => void> = [];

export const emitToast = (message: string, type: ToastType = 'info'): void => {
  toastListeners.forEach(listener => listener(message, type));
};

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const removeToast = useCallback((id: string): void => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info'): void => {
    const id = `toast-${++idCounter.current}-${Date.now()}`;
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  // Listen to global toast events
  useEffect(() => {
    const listener = (message: string, type: ToastType) => {
      showToast(message, type);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, [showToast]);

  return { toasts, showToast, removeToast };
};

export default useToast;
