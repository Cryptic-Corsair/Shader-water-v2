import { useRef, useState } from 'react';
import {
  EDITORIAL_EASE,
  gsap,
  isTouchDevice,
  prefersReducedMotion,
  useGSAP,
} from '../lib/motion';

export function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !isTouchDevice() && !prefersReducedMotion();
  });

  useGSAP(
    () => {
      if (isTouchDevice() || prefersReducedMotion()) {
        setEnabled(false);
        return;
      }

      setEnabled(true);
      const dot = dotRef.current;
      if (!dot) return;

      gsap.set(dot, {
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        opacity: 0,
      });

      const xTo = gsap.quickTo(dot, 'x', {
        duration: 0.22,
        ease: EDITORIAL_EASE,
      });
      const yTo = gsap.quickTo(dot, 'y', {
        duration: 0.22,
        ease: EDITORIAL_EASE,
      });

      let visible = false;

      const handleMouseMove = (event: MouseEvent) => {
        if (!visible) {
          visible = true;
          gsap.to(dot, { opacity: 0.85, duration: 0.22, ease: EDITORIAL_EASE });
        }
        xTo(event.clientX);
        yTo(event.clientY);
      };

      const handleMouseLeaveWindow = () => {
        visible = false;
        gsap.to(dot, { opacity: 0, duration: 0.2, ease: EDITORIAL_EASE });
      };

      const navTextSelector = 'header a, header button, nav a, nav button';
      const interactiveSelector =
        'a, button, [role="button"], input, select, [data-cursor="expand"]';

      const handleMouseOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        if (target.closest(navTextSelector)) {
          // Soften and dim over nav text so letters stay crystal clear
          gsap.to(dot, {
            scale: 0.72,
            opacity: 0.34,
            duration: 0.2,
            ease: EDITORIAL_EASE,
          });
          return;
        }

        if (target.closest(interactiveSelector)) {
          gsap.to(dot, {
            scale: 1.25,
            opacity: 0.36,
            duration: 0.22,
            ease: EDITORIAL_EASE,
          });
        }
      };

      const handleMouseOut = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const related = event.relatedTarget as HTMLElement | null;
        if (
          target?.closest(interactiveSelector) &&
          !related?.closest(interactiveSelector)
        ) {
          gsap.to(dot, {
            scale: 1,
            opacity: visible ? 0.85 : 0,
            duration: 0.24,
            ease: EDITORIAL_EASE,
          });
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeaveWindow);
      document.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('mouseout', handleMouseOut);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeaveWindow);
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
      };
    },
    { scope: containerRef }
  );

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 hidden mix-blend-difference md:block"
    >
      <div
        ref={dotRef}
        className="h-2 w-2 rounded-full bg-[#F6F4EF] opacity-0 will-change-transform"
      />
    </div>
  );
}
