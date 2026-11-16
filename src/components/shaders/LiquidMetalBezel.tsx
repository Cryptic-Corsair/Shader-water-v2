import { useEffect, useRef, useState } from 'react';
import { LiquidMetal } from '@paper-design/shaders-react';
import {
  ShaderErrorBoundary,
  detectWebGLCapabilities,
} from './LiveAtmosphere';

export interface LiquidMetalBezelProps {
  className?: string;
}

function LiquidMetalFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(54% 54% at 44% 42%, rgba(237, 231, 221, 0.72) 0%, rgba(178, 194, 212, 0.34) 38%, rgba(223, 188, 145, 0.16) 62%, transparent 78%)',
      }}
    />
  );
}

export function LiquidMetalBezel({ className = '' }: LiquidMetalBezelProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl] = useState(() => detectWebGLCapabilities());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const effectiveSpeed = inView && !reducedMotion ? 0.42 : 0;
  const maxPixelCount = webgl.isSoftwareRenderer ? 640 * 640 : 960 * 960;

  return (
    <div
      ref={hostRef}
      data-testid="liquid-metal-bezel"
      data-shader-active={effectiveSpeed > 0 ? 'true' : 'false'}
      aria-hidden="true"
      className={`relative aspect-square w-full overflow-visible ${className}`}
    >
      {/* Ambient feathered glow behind floating sculpture */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(223, 188, 145, 0.15) 0%, rgba(178, 194, 212, 0.08) 42%, transparent 70%)',
        }}
      />

      <div
        className="relative h-full w-full"
        style={{
          WebkitMaskImage:
            'radial-gradient(circle, black 58%, transparent 94%)',
          maskImage: 'radial-gradient(circle, black 58%, transparent 94%)',
        }}
      >
        {!webgl.supported ? (
          <LiquidMetalFallback />
        ) : (
          <ShaderErrorBoundary fallback={<LiquidMetalFallback />}>
            <LiquidMetal
              shape="metaballs"
              colorBack="#00000000"
              colorTint="#EDE7DD"
              repetition={3}
              softness={0.42}
              distortion={0.22}
              contour={0.46}
              shiftRed={0.14}
              shiftBlue={0.26}
              scale={1.06}
              speed={effectiveSpeed}
              minPixelRatio={1}
              maxPixelCount={maxPixelCount}
              style={{ width: '100%', height: '100%' }}
            />
          </ShaderErrorBoundary>
        )}
      </div>
    </div>
  );
}
