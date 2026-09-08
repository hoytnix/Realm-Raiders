import { useEffect } from 'react';

export function useHotkeys({
  onClaimAll,
  onPan,
  setDeskView,
  onToggleTech,
  onOpenFlora,
  onEscape
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keystrokes when typing inside inputs or textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target.isContentEditable
      ) {
        return;
      }

      const key = e.key;

      // Space: Claim All harvests
      if (key === ' ' || key === 'Spacebar') {
        e.preventDefault();
        if (onClaimAll) onClaimAll();
        return;
      }

      // Escape: Dismiss / deselect / close
      if (key === 'Escape') {
        e.preventDefault();
        if (onEscape) onEscape();
        return;
      }

      // Number keys 1 - 6 for primary desk navigation
      if (key === '1') {
        e.preventDefault();
        setDeskView('citadel');
        return;
      }
      if (key === '2') {
        e.preventDefault();
        setDeskView('war');
        return;
      }
      if (key === '3') {
        e.preventDefault();
        if (onToggleTech) onToggleTech();
        return;
      }
      if (key === '4') {
        e.preventDefault();
        if (onOpenFlora) onOpenFlora();
        else setDeskView('flora');
        return;
      }
      if (key === '5') {
        e.preventDefault();
        setDeskView('menu');
        return;
      }
      if (key === '6') {
        e.preventDefault();
        setDeskView('chronicle');
        return;
      }

      // T: Toggle technology codex / decrees
      if (key === 't' || key === 'T') {
        e.preventDefault();
        if (onToggleTech) onToggleTech();
        return;
      }

      // W / A / S / D or Arrow Keys: Map panning
      const panStep = 35;
      if (key === 'w' || key === 'W' || key === 'ArrowUp') {
        e.preventDefault();
        if (onPan) onPan(0, panStep);
        return;
      }
      if (key === 's' || key === 'S' || key === 'ArrowDown') {
        e.preventDefault();
        if (onPan) onPan(0, -panStep);
        return;
      }
      if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
        e.preventDefault();
        if (onPan) onPan(panStep, 0);
        return;
      }
      if (key === 'd' || key === 'D' || key === 'ArrowRight') {
        e.preventDefault();
        if (onPan) onPan(-panStep, 0);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClaimAll, onPan, setDeskView, onToggleTech, onOpenFlora, onEscape]);
}
