/* ============================================
   TOGGLE COMPONENT (Theme Toggle)
   ============================================ */

import React from 'react';

import styles from './Toggle.module.css';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  onIcon?: React.ReactNode;
  offIcon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  isOn,
  onToggle,
  onIcon = '🌙',
  offIcon = '☀️',
  ariaLabel = 'Toggle',
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={[styles.toggle, className].filter(Boolean).join(' ')}
    >
      <span className={styles.track}>
        <span
          className={styles.thumb}
          style={{ transform: isOn ? 'translateX(100%)' : 'translateX(0)' }}
        >
          <span className={styles.icon}>{isOn ? onIcon : offIcon}</span>
        </span>
      </span>
    </button>
  );
};

export default Toggle;
