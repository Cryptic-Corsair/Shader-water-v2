import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import type Lenis from 'lenis';
import Snap from 'lenis/snap';
import { isTouchDevice, prefersReducedMotion } from '../lib/motion';
import { shouldEnableMagneticSnap } from './magneticSnapPolicy';

export function useMagneticSnap(
  lenis: Lenis | null,
  containerRef: RefObject<HTMLElement | null>,
  stationSelector = '[data-snap-station]'
): void {
  const location = useLocation();

  useEffect(() => {
    if (!lenis || typeof window === 'undefined') {
      return;
    }

    let snapInstance: Snap | null = null;
    const unsubscribes: Array<() => void> = [];

    const setupOrTeardown = () => {
      const enabled = shouldEnableMagneticSnap({
        viewportWidth: window.innerWidth,
        isTouch: isTouchDevice(),
        reducedMotion: prefersReducedMotion(),
        pathname: location.pathname,
      });

      if (!enabled) {
        unsubscribes.splice(0).forEach((fn) => fn());
        snapInstance?.destroy();
        snapInstance = null;
        return;
      }

      if (snapInstance) {
        snapInstance.resize();
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const snap = new Snap(lenis, {
        type: 'proximity',
        distanceThreshold: '15%',
        debounce: 240,
        duration: 0.95,
      });

      const stations = Array.from(
        container.querySelectorAll<HTMLElement>(stationSelector)
      );

      for (const el of stations) {
        unsubscribes.push(snap.addElement(el, { align: ['start'] }));
      }

      snapInstance = snap;
    };

    const rafId = window.requestAnimationFrame(() => {
      setupOrTeardown();
    });

    window.addEventListener('resize', setupOrTeardown, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', setupOrTeardown);
      unsubscribes.splice(0).forEach((fn) => fn());
      snapInstance?.destroy();
      snapInstance = null;
    };
  }, [lenis, containerRef, stationSelector, location.pathname]);
}
