/* ============================================
   PROTECTED ROUTE COMPONENT
   ============================================ */

import React, { useState, useEffect, isValidElement, cloneElement } from 'react';

import { emitToast } from '../../hooks/useToast';

import LoginScreen from './LoginScreen';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  onAuthenticate?: (password: string) => Promise<boolean> | boolean;
  authCheck?: () => boolean;
  onLogout?: () => void;
  password?: string; // For simple password-based auth
  storageKey?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated: externalAuth,
  onAuthenticate,
  authCheck,
  onLogout,
  password,
  storageKey = 'mc_auth',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      // Priority 1: External auth prop
      if (externalAuth !== undefined) {
        setIsAuthenticated(externalAuth);
        setIsLoading(false);
        return;
      }

      // Priority 2: Custom auth check
      if (authCheck) {
        setIsAuthenticated(authCheck());
        setIsLoading(false);
        return;
      }

      // Priority 3: localStorage
      const stored = localStorage.getItem(storageKey);
      setIsAuthenticated(stored === 'true');
      setIsLoading(false);
    };

    checkAuth();
  }, [externalAuth, authCheck, storageKey]);

  const handleLogin = async (inputPassword: string): Promise<boolean> => {
    // Priority 1: Custom authenticate handler
    if (onAuthenticate) {
      const success = await Promise.resolve(onAuthenticate(inputPassword));
      if (success) {
        setIsAuthenticated(true);
        localStorage.setItem(storageKey, 'true');
        emitToast('Logget inn!', 'success');
      }
      return success;
    }

    // Priority 2: Simple password check
    if (password) {
      const success = inputPassword === password;
      if (success) {
        setIsAuthenticated(true);
        localStorage.setItem(storageKey, 'true');
        emitToast('Logget inn!', 'success');
      }
      return success;
    }

    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(storageKey);
    onLogout?.();
    emitToast('Logget ut', 'info');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Laster...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Pass logout handler to children via cloneElement if it's a single element
  if (isValidElement(children) && typeof children.type !== 'string') {
    return cloneElement(children, { onLogout: handleLogout } as Record<string, unknown>);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
