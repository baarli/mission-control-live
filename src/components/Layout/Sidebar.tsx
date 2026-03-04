/* ============================================
   SIDEBAR COMPONENT
   ============================================ */

import React from 'react';

import type { NavItem } from '../../types';

import styles from './Sidebar.module.css';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  navItems?: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '#dashboard' },
  { id: 'saksliste', label: 'Saksliste', icon: '📋', path: '#saksliste' },
  { id: 'search', label: 'Søk', icon: '🔍', path: '#search' },
  { id: 'stats', label: 'Statistikk', icon: '📈', path: '#stats' },
  { id: 'agent', label: 'Agent', icon: '🤖', path: '#agent' },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  navItems = defaultNavItems,
  isOpen = false,
  onClose,
}) => {
  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[styles.sidebar, isOpen && styles.open].filter(Boolean).join(' ')}
        aria-label="Sidebar navigation"
      >
        <div className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">🎛️</span>
            <span className={styles.brandText}>Mission Control</span>
          </div>
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Lukk meny"
            >
              ✕
            </button>
          )}
        </div>

        <nav className={styles.nav} aria-label="Sidebar navigasjon">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={[
                styles.navItem,
                activeSection === item.id && styles.active,
              ].join(' ')}
              onClick={() => handleNavClick(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.label}>{item.label}</span>
              {activeSection === item.id && (
                <span className={styles.indicator} aria-hidden="true" />
              )}
            </button>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.version}>v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
