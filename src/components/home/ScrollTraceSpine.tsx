import { useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  DrawSVGPlugin,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../lib/motion';
import {
  SPINE_WAYPOINTS,
  getActiveWaypointIndex,
  isWaypointReached,
} from './scrollSpineMath';

interface ScrollTraceSpineProps {
  scopeSelector?: string;
}

export function ScrollTraceSpine({
  scopeSelector = '#exhibition-root',
}: ScrollTraceSpineProps) {
  const spineRef = useRef<HTMLDivElement>(null);
  const meridianRef = useRef<SVGPathElement>(null);
  const secondaryArcRef = useRef<SVGPathElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { lang } = useLanguage();

  useGSAP(
    () => {
      const meridian = meridianRef.current;
      const secondaryArc = secondaryArcRef.current;
      if (!meridian) return;

      const reduced = prefersReducedMotion();
      const triggerTarget =
        document.querySelector<HTMLElement>(scopeSelector) ??
        document.documentElement;

      if (reduced) {
        gsap.set(meridian, { drawSVG: '100%' });
        if (secondaryArc) {
          gsap.set(secondaryArc, { drawSVG: '100%' });
        }
        setScrollProgress(1);
        return;
      }

      gsap.set(meridian, { drawSVG: '4%' });
      if (secondaryArc) {
        gsap.set(secondaryArc, { drawSVG: '0%' });
      }

      const meridianTween = gsap.to(meridian, {
        drawSVG: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: triggerTarget,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
      });

      let arcTween: gsap.core.Tween | null = null;
      if (secondaryArc) {
        arcTween = gsap.to(secondaryArc, {
          drawSVG: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: triggerTarget,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.85,
          },
        });
      }

      ScrollTrigger.refresh();

      return () => {
        meridianTween.kill();
        arcTween?.kill();
      };
    },
    { scope: spineRef, dependencies: [scopeSelector, lang], revertOnUpdate: true }
  );

  const activeIdx = getActiveWaypointIndex(scrollProgress);

  // Reference DrawSVGPlugin so tree-shaking never strips registration
  void DrawSVGPlugin;

  return (
    <div
      ref={spineRef}
      aria-hidden="true"
      data-testid="scroll-trace-spine"
      data-active-waypoint={SPINE_WAYPOINTS[activeIdx]?.id ?? 'ch-1'}
      className="pointer-events-none fixed right-2 top-[11vh] z-20 h-[78vh] w-11 opacity-45 md:right-7 md:w-20 md:opacity-80"
    >
      <svg
        viewBox="0 0 120 800"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible"
      >
        {/* Whisper-thin architectural guide track */}
        <path
          d="M 64 42 C 74 108, 38 124, 46 162 C 58 208, 84 224, 74 262 C 62 308, 48 326, 56 362 C 68 408, 38 424, 48 462 C 60 508, 76 526, 64 562 C 52 604, 42 624, 50 658 C 60 698, 70 718, 62 758"
          stroke="rgba(246, 244, 239, 0.14)"
          strokeWidth="0.9"
          strokeDasharray="2 5"
        />

        {/* Secondary harmonic drift line */}
        <path
          ref={secondaryArcRef}
          d="M 72 52 C 46 135, 82 215, 58 310 C 36 405, 84 495, 54 590 C 36 660, 72 710, 62 750"
          stroke="rgba(178, 194, 212, 0.24)"
          strokeWidth="0.8"
        />

        {/* Primary continuous scroll-tracing meridian */}
        <path
          ref={meridianRef}
          d="M 64 42 C 74 108, 38 124, 46 162 C 58 208, 84 224, 74 262 C 62 308, 48 326, 56 362 C 68 408, 38 424, 48 462 C 60 508, 76 526, 64 562 C 52 604, 42 624, 50 658 C 60 698, 70 718, 62 758"
          stroke="rgba(223, 188, 145, 0.72)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Orbital chapter waypoints */}
        {SPINE_WAYPOINTS.map((wp, idx) => {
          const reached = isWaypointReached(scrollProgress, wp);
          const isCurrent = idx === activeIdx;

          return (
            <g
              key={wp.id}
              transform={`translate(${wp.cx}, ${wp.y})`}
              style={{
                transition: 'opacity 320ms ease-out',
                opacity: reached ? 1 : 0.42,
              }}
            >
              {/* Outer orbital ring */}
              <circle
                r={isCurrent ? 11 : 7}
                stroke={
                  isCurrent
                    ? 'rgba(223, 188, 145, 0.85)'
                    : 'rgba(246, 244, 239, 0.34)'
                }
                strokeWidth={isCurrent ? 1.1 : 0.75}
                style={{ transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              {/* Meridian tick */}
              <line
                x1={isCurrent ? -17 : -11}
                y1={0}
                x2={isCurrent ? -12 : -8}
                y2={0}
                stroke="rgba(246, 244, 239, 0.45)"
                strokeWidth="0.75"
              />
              {/* Core anchor point */}
              <circle
                r={reached ? 2.4 : 1.5}
                fill={reached ? '#DFBC91' : 'rgba(246, 244, 239, 0.55)'}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
