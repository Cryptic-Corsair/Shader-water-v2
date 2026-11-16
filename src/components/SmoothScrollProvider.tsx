import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollToTop: (immediate?: boolean) => void;
  scrollToElement: (elementId: string, offsetPx?: number) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollToTop: () => {},
  scrollToElement: () => {},
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (prefersReducedMotion()) {
      lenisRef.current = null;
      setLenisInstance(null);
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  useEffect(() => {
    const activeLenis = lenisRef.current;
    const rawHash = location.hash.replace(/^#/, '');

    if (rawHash) {
      let cancelled = false;
      const scrollToHashTarget = () => {
        if (cancelled) return;
        ScrollTrigger.refresh();

        const target =
          document.getElementById(rawHash) ||
          (rawHash === 'chapter-story'
            ? document.getElementById('chapter-presence') ??
              document.getElementById('chapter-4')
            : rawHash === 'chapter-cycles'
              ? document.getElementById('chapter-4')
              : null);

        if (target) {
          const currentLenis = lenisRef.current ?? activeLenis;
          if (currentLenis) {
            currentLenis.resize();
            currentLenis.scrollTo(target, {
              offset: 0,
              immediate: true,
              force: true,
            });
          } else {
            const top = target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
          }
          ScrollTrigger.update();
        }
      };

      const rafIds: number[] = [];
      const scheduleAfterRaf = () => {
        const raf1 = window.requestAnimationFrame(() => {
          const raf2 = window.requestAnimationFrame(() => {
            scrollToHashTarget();
          });
          rafIds.push(raf2);
        });
        rafIds.push(raf1);
      };

      scheduleAfterRaf();

      const fontSettle = Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>((resolve) => window.setTimeout(resolve, 350)),
      ]);
      void fontSettle.then(() => {
        if (!cancelled) {
          scrollToHashTarget();
        }
      });

      const fallbackTimer = window.setTimeout(scrollToHashTarget, 220);

      return () => {
        cancelled = true;
        rafIds.forEach((id) => window.cancelAnimationFrame(id));
        window.clearTimeout(fallbackTimer);
      };
    }

    if (activeLenis) {
      activeLenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname, location.search, location.hash]);

  const scrollToTop = (immediate = false) => {
    const activeLenis = lenisRef.current;
    if (activeLenis) {
      activeLenis.scrollTo(0, { immediate });
    } else {
      window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
    }
  };

  const scrollToElement = (elementId: string, offsetPx = 0) => {
    const target = document.getElementById(elementId);
    if (!target) return;

    const activeLenis = lenisRef.current;
    if (activeLenis) {
      activeLenis.scrollTo(target, { offset: offsetPx, duration: 0.9 });
    } else {
      const top =
        target.getBoundingClientRect().top + window.scrollY + offsetPx;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <SmoothScrollContext.Provider
      value={{ lenis: lenisInstance, scrollToTop, scrollToElement }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
