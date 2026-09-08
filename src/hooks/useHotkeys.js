import { useEffect } from 'react';

export function useHotkeys({
  onClaimAll,
  onClaimYield,
  onPan,
  setDeskView,
  onToggleTech,
  onOpenFlora,
  onEscape
} = {}) {
  useEffect(() => {
    const handleKeyDown = e => {
      // Ignore keystrokes when typing inside inputs, textareas, or selects
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.target.isContentEditable
      ) {
        return;
      }
      const key = e.key;

      // Space: Claim All harvests
      if (key === ' ' || key === 'Spacebar' || e.code === 'Space') {
        e.preventDefault();
        if (onClaimAll) {
          onClaimAll();
        } else if (onClaimYield) {
          onClaimYield();
        }
        return;
      }

      // Escape: Dismiss / deselect / close
      if (key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        if (onEscape) onEscape();
        return;
      }

      // Number keys 1 - 5 for primary desk navigation
      if (key === '1') {
        e.preventDefault();
        setDeskView?.('citadel');
        return;
      }
      if (key === '2') {
        e.preventDefault();
        setDeskView?.('war');
        return;
      }
      if (key === '3') {
        e.preventDefault();
        if (onOpenFlora) onOpenFlora();
        else setDeskView?.('flora');
        return;
      }
      if (key === '4') {
        e.preventDefault();
        setDeskView?.('chronicle');
        return;
      }
      if (key === '5') {
        e.preventDefault();
        setDeskView?.('menu');
        return;
      }

      // T / C: Hotkey for Royal Codex & Decrees switches focus directly to Sovereign Ledger
      if (key === 't' || key === 'T' || key === 'c' || key === 'C') {
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

    const handleCustomClaim = () => {
      if (onClaimAll) {
        onClaimAll();
      } else if (onClaimYield) {
        onClaimYield();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('realm-claim-all', handleCustomClaim);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('realm-claim-all', handleCustomClaim);
    };
  }, [onClaimAll, onClaimYield, onPan, setDeskView, onToggleTech, onOpenFlora, onEscape]);
}