import { type RefObject } from 'react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

let pluginsRegistered = false;

export function registerMotionPlugins(): void {
  if (pluginsRegistered || typeof window === 'undefined') {
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, useGSAP);
  pluginsRegistered = true;
}

registerMotionPlugins();

export const EDITORIAL_EASE = 'power3.out';
export const EDITORIAL_EASE_STRONG = 'power4.out';
export const EDITORIAL_EASE_EXPO = 'expo.out';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Reusable magnetic pull hook built on gsap.quickTo.
 * Automatically disabled on touch devices and when prefers-reduced-motion is enabled.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  strength = 0.26
): void {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || isTouchDevice()) {
        return;
      }

      const xTo = gsap.quickTo(el, 'x', {
        duration: 0.45,
        ease: EDITORIAL_EASE,
      });
      const yTo = gsap.quickTo(el, 'y', {
        duration: 0.45,
        ease: EDITORIAL_EASE,
      });

      const handleMouseMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (event.clientX - centerX) * strength;
        const deltaY = (event.clientY - centerY) * strength;
        xTo(deltaX);
        yTo(deltaY);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
        gsap.set(el, { x: 0, y: 0 });
      };
    },
    { scope: ref, dependencies: [strength] }
  );
}

export { DrawSVGPlugin, Flip, gsap, ScrollTrigger, SplitText, useGSAP };
