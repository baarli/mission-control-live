/* ============================================
   USE TOAST HOOK
   ============================================ */

import { useState, useCallback, useRef, useEffect } from 'react';

import type { Toast, ToastType } from '../types';

interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// Global toast event emitter for components that can't use hooks
type ToastListener = (message: string, type: ToastType) => void;
const toastListeners: ToastListener[] = [];

export const emitToast = (message: string, type: ToastType = 'info'): void => {
  toastListeners.forEach((listener) => listener(message, type));
};

// Global toast methods for use outside of React components
export const toast = {
  success: (message: string) => emitToast(message, 'success'),
  error: (message: string) => emitToast(message, 'error'),
  warning: (message: string) => emitToast(message, 'warning'),
  info: (message: string) => emitToast(message, 'info'),
  show: (message: string, type: ToastType = 'info') => emitToast(message, type)
};

const DEFAULT_DURATION = 3000;
const MAX_TOASTS = 5;

export function useToast(duration: number = DEFAULT_DURATION): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info'): void => {
    const id = `toast-${++idCounter.current}-${Date.now()}`;
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => {
      // Remove oldest toast if at max
      const newToasts = [...prev, newToast];
      if (newToasts.length > MAX_TOASTS) {
        const oldest = newToasts[0];
        if (oldest) {
          removeToast(oldest.id);
        }
        return newToasts.slice(1);
      }
      return newToasts;
    });

    // Auto-remove after duration
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    
    timersRef.current.set(id, timer);
  }, [duration, removeToast]);

  // Convenience methods
  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  // Listen to global toast events
  useEffect(() => {
    const listener: ToastListener = (message, type) => {
      showToast(message, type);
    };
    
    toastListeners.push(listener);
    const timers = timersRef.current;
    
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
      
      // Clear all timers on unmount
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [showToast]);

  return { 
    toasts, 
    showToast, 
    removeToast,
    success,
    error,
    warning,
    info
  };
}

// Hook for toast container component
export function useToastContainer(): { toasts: Toast[]; removeToast: (id: string) => void } {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: ToastListener = (message, type) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev.slice(-MAX_TOASTS + 1), { id, message, type }]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, DEFAULT_DURATION);
    };
    
    toastListeners.push(listener);
    
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, removeToast };
}

export default useToast;
