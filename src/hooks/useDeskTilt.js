import { useState, useCallback } from 'react';

export function useDeskTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHoveringUpgradeable, setIsHoveringUpgradeable] = useState(false);
  const [stampingDecree, setStampingDecree] = useState(false);
  const [waxSplats, setWaxSplats] = useState([]);

  const handlePointerMove = useCallback((e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    setTilt({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  const triggerWaxSplat = useCallback((clientX, clientY) => {
    setStampingDecree(true);

    if (clientX && clientY) {
      const newSplat = {
        id: Date.now(),
        x: clientX,
        y: clientY
      };
      setWaxSplats(prev => [...prev.slice(-4), newSplat]);
      setTimeout(() => {
        setWaxSplats(prev => prev.filter(s => s.id !== newSplat.id));
      }, 1200);
    }

    setTimeout(() => {
      setStampingDecree(false);
    }, 350);
  }, []);

  return {
    tilt,
    cursorPos,
    isHoveringUpgradeable,
    setIsHoveringUpgradeable,
    stampingDecree,
    waxSplats,
    handlePointerMove,
    triggerWaxSplat
  };
}
