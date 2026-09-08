import { useState, useCallback, useEffect, useRef } from 'react';
import { haptics } from '../utils/index.js';

export function useDeskTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHoveringUpgradeable, setIsHoveringUpgradeable] = useState(false);
  const [stampingDecree, setStampingDecree] = useState(false);
  const [waxSplats, setWaxSplats] = useState([]);
  const hasGyroRef = useRef(false);

  // Desktop Pointer Tracking
  const handlePointerMove = useCallback((e) => {
    // If gyro is actively driving tilt, ignore mouse move for tilt but keep cursor
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

    if (clientX !== undefined && clientY !== undefined) {
      setCursorPos({ x: clientX, y: clientY });
      if (!hasGyroRef.current) {
        const nx = (clientX / window.innerWidth) * 2 - 1;
        const ny = (clientY / window.innerHeight) * 2 - 1;
        setTilt({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
      }
    }
  }, []);

  // Mobile Gyroscope Parallax (DeviceOrientationEvent)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return;

    let targetX = 0;
    let targetY = 0;
    let animId;

    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return;
      hasGyroRef.current = true;

      // gamma: [-90, 90] left-to-right tilt -> normalize around 0 with ±30deg threshold
      const rawX = (e.gamma || 0) / 30;
      // beta: [-180, 180] front-to-back tilt -> human portrait resting hand angle is ~45deg
      const rawY = ((e.beta || 45) - 45) / 30;

      targetX = Math.max(-1, Math.min(1, rawX));
      targetY = Math.max(-1, Math.min(1, rawY));
    };

    // Smooth lerp loop for jitter-free gyro perspective
    const smoothLoop = () => {
      if (hasGyroRef.current) {
        setTilt(prev => ({
          x: prev.x + (targetX - prev.x) * 0.15,
          y: prev.y + (targetY - prev.y) * 0.15
        }));
      }
      animId = requestAnimationFrame(smoothLoop);
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    animId = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const triggerWaxSplat = useCallback((clientX, clientY) => {
    setStampingDecree(true);
    haptics.heavy();

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
