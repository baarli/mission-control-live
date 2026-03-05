/* ============================================
   LOGIN SCREEN COMPONENT
   ============================================ */

import React, { useState, useRef, useEffect } from 'react';

import { Button, Input } from '../UI';

import styles from './LoginScreen.module.css';

interface LoginScreenProps {
  onLogin: (password: string) => Promise<boolean> | boolean;
  title?: string;
  subtitle?: string;
  logo?: string;
  loadingText?: string;
  errorText?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  title = 'Mission Control',
  subtitle = 'NRJ Morgen Dashboard',
  logo = '🎛️',
  loadingText = 'Logger inn...',
  errorText = 'Feil passord',
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setShowError(false);

    try {
      const success = await Promise.resolve(onLogin(password));

      if (!success) {
        setShowError(true);
        setPassword('');
        inputRef.current?.focus();
      }
    } catch (error) {
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo} aria-hidden="true">
          {logo}
        </div>

        {/* Title */}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv passord..."
            autoComplete="current-password"
            disabled={isLoading}
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText={loadingText}
          >
            Logg inn
          </Button>
        </form>

        {/* Error Message */}
        <div
          className={[styles.error, showError && styles.visible].filter(Boolean).join(' ')}
          role="alert"
          aria-live="polite"
        >
          {errorText}
        </div>
      </div>

      {/* Footer */}
      <p className={styles.footer}>🔒 Sikker tilgang • Versjon 1.0.0</p>
    </div>
  );
};

export default LoginScreen;
