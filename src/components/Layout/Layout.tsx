/* ============================================
   LAYOUT COMPONENT
   ============================================ */

import React, { useState, useEffect } from 'react';

import { useToast } from '../../hooks/useToast';
import type { Theme } from '../../types';
import ToastContainer from '../UI/ToastContainer';

import Header from './Header';
import styles from './Layout.module.css';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeSection,
  onNavigate,
  onLogout,
}) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('mc_theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const handleThemeToggle = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mc_theme', newTheme);
  };

  return (
    <div className={styles.layout}>
      {/* Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        Hopp til innhold
      </a>

      {/* Header */}
      <Header
        activeSection={activeSection}
        onNavigate={onNavigate}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onLogout={onLogout}
      />

      {/* Mobile Menu Toggle */}
      <button
        className={styles.menuToggle}
        onClick={() => setSidebarOpen(true)}
        aria-label="Åpne meny"
      >
        ☰
      </button>

      {/* Sidebar (Mobile) */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main id="main-content" className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Keyboard Hint */}
      <div className={styles.keyboardHint}>
        <kbd>Ctrl</kbd> + <kbd>K</kbd> for å søke
      </div>
    </div>
  );
};

export default Layout;
