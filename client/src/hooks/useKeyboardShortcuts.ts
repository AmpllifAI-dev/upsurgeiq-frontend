import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  const [, setLocation] = useLocation();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'd',
      ctrl: true,
      action: () => setLocation('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => setLocation('/press-releases/new'),
      description: 'New Press Release',
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      action: () => setLocation('/press-releases'),
      description: 'View Press Releases',
    },
    {
      key: 's',
      ctrl: true,
      shift: true,
      action: () => setLocation('/social-media/new'),
      description: 'New Social Post',
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      action: () => setLocation('/campaign-lab'),
      description: 'Campaign Lab',
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      action: () => setLocation('/analytics'),
      description: 'Analytics',
    },
    {
      key: 'm',
      ctrl: true,
      shift: true,
      action: () => setLocation('/media-lists'),
      description: 'Media Lists',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
