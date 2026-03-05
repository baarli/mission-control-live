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

const LockIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="40"
    height="40"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
      clipRule="evenodd"
    />
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  title = 'Mission Control',
  subtitle = 'Logg inn for å fortsette',
  loadingText = 'Logger inn...',
  errorText = 'Feil passord',
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setErrorMessage('Vennligst skriv inn passord');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const success = await Promise.resolve(onLogin(password));

      if (!success) {
        setErrorMessage(errorText);
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <LockIcon />
        </div>

        {/* Title */}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={styles.form}
          noValidate
          aria-label="Logg inn"
        >
          <Input
            ref={inputRef}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Skriv passord..."
            autoComplete="current-password"
            disabled={isLoading}
            fullWidth
            label="Passord"
            error={errorMessage || undefined}
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

        {/* Help text */}
        <p className={styles.helpText}>Kontakt administrator hvis du har glemt passordet</p>
      </div>

      {/* Footer */}
      <p className={styles.footer}>🔒 Sikker tilgang • Versjon 1.0.0</p>
    </div>
  );
};

export default LoginScreen;
