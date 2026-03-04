import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!shortcut.shift === event.shiftKey;
        const altMatch = !!shortcut.alt === event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.handler();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for Mission Control
export const getMissionControlShortcuts = (
  navigateTo: (section: string) => void
): ShortcutConfig[] => [
  {
    key: 'k',
    ctrl: true,
    handler: () => navigateTo('search'),
    description: 'Åpne søk',
  },
  {
    key: 'd',
    ctrl: true,
    handler: () => navigateTo('dashboard'),
    description: 'Gå til dashboard',
  },
  {
    key: 's',
    ctrl: true,
    handler: () => navigateTo('saksliste'),
    description: 'Gå til saksliste',
  },
  {
    key: 'a',
    ctrl: true,
    shift: true,
    handler: () => navigateTo('agent'),
    description: 'Gå til Agent Control',
  },
  {
    key: 'Escape',
    handler: () => navigateTo('dashboard'),
    description: 'Gå tilbake til dashboard',
  },
];
