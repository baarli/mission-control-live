/* ============================================
   HEADER COMPONENT
   ============================================ */

import React from 'react';
import { Button, Toggle } from '../UI';
import type { NavItem, Theme } from '../../types';
import styles from './Header.module.css';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  theme: Theme;
  onThemeToggle: () => void;
  onLogout: () => void;
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '#dashboard' },
  { id: 'saksliste', label: 'Saksliste', icon: '📋', path: '#saksliste' },
  { id: 'search', label: 'Søk', icon: '🔍', path: '#search' },
  { id: 'stats', label: 'Statistikk', icon: '📈', path: '#stats' },
];

const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  theme,
  onThemeToggle,
  onLogout,
  navItems = defaultNavItems,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true">
            🎛️
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Mission Control</h1>
            <span className={styles.subtitle}>NRJ Morgen</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Hovednavigasjon">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={[
                styles.navButton,
                activeSection === item.id && styles.active,
              ].join(' ')}
              onClick={() => onNavigate(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <Toggle
            isOn={theme === 'dark'}
            onToggle={onThemeToggle}
            onIcon="🌙"
            offIcon="☀️"
            ariaLabel={theme === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
          />
          <Button
            variant="ghost"
            onClick={onLogout}
            leftIcon="🚪"
            className={styles.logoutButton}
          >
            <span className={styles.logoutText}>Logg ut</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
