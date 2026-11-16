import { useEffect, useRef, useState } from 'react';
import { NeuroNoise, Voronoi } from '@paper-design/shaders-react';
import { prefersReducedMotion } from '../../lib/motion';
import { CustomGlslCanvas, type CustomGlslEngine } from './CustomGlslCanvas';
import {
  ShaderErrorBoundary,
  detectWebGLCapabilities,
} from './LiveAtmosphere';
import type { ShaderEngineId, ShaderPalettePreset } from './shaderGalleryData';

export interface ShaderViewportProps {
  engine: ShaderEngineId;
  palette: ShaderPalettePreset;
  speed: number;
  intensity: number;
  scale: number;
  paused?: boolean;
  interactive?: boolean;
  unmountOffscreen?: boolean;
  className?: string;
}

function ShaderFallbackBackdrop({ palette }: { palette: ShaderPalettePreset }) {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full"
      style={{
        backgroundColor: palette.colorA,
        backgroundImage: `radial-gradient(62% 60% at 32% 35%, ${palette.accent}55 0%, transparent 65%), linear-gradient(155deg, ${palette.colorA} 0%, ${palette.colorB} 55%, ${palette.colorC} 100%)`,
      }}
    />
  );
}

export function ShaderViewport({
  engine,
  palette,
  speed,
  intensity,
  scale,
  paused = false,
  interactive = true,
  unmountOffscreen = false,
  className = '',
}: ShaderViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(() => !unmountOffscreen);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );
  const [webgl] = useState(() => detectWebGLCapabilities());

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const syncVis = () => setPageVisible(!document.hidden);
    syncVis();
    document.addEventListener('visibilitychange', syncVis);
    return () => document.removeEventListener('visibilitychange', syncVis);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.02, rootMargin: '20px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isCustomGlsl =
    engine === 'glsl-literary-book' ||
    engine === 'glsl-wet-ink' ||
    engine === 'glsl-raymarch' ||
    engine === 'glsl-fbm' ||
    engine === 'glsl-crt';

  const shouldMountWebGL = webgl.supported && (!unmountOffscreen || inView);

  if (isCustomGlsl) {
    return (
      <div
        ref={hostRef}
        data-testid={`shader-viewport-${engine}`}
        className={`relative h-full w-full overflow-hidden ${className}`}
      >
        {shouldMountWebGL ? (
          <CustomGlslCanvas
            engine={engine as CustomGlslEngine}
            palette={palette}
            speed={speed}
            intensity={intensity}
            scale={scale}
            paused={paused || !inView}
            interactive={interactive}
          />
        ) : (
          <ShaderFallbackBackdrop palette={palette} />
        )}
      </div>
    );
  }

  const effectiveSpeed =
    inView && pageVisible && !paused && !reducedMotion ? speed * 0.55 : 0;
  const maxPixelCount = webgl.isSoftwareRenderer ? 640 * 480 : 1280 * 800;

  return (
    <div
      ref={hostRef}
      data-testid={`shader-viewport-${engine}`}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      {!shouldMountWebGL ? (
        <ShaderFallbackBackdrop palette={palette} />
      ) : (
        <ShaderErrorBoundary fallback={<ShaderFallbackBackdrop palette={palette} />}>
          {engine === 'paper-voronoi' ? (
            <Voronoi
              colors={[palette.colorB, palette.colorC, palette.accent]}
              colorGap={palette.colorA}
              colorGlow={palette.accent}
              stepsPerColor={2}
              distortion={intensity * 0.55}
              gap={0.04}
              glow={0.35 + intensity * 0.45}
              scale={scale}
              speed={effectiveSpeed}
              minPixelRatio={1}
              maxPixelCount={maxPixelCount}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <NeuroNoise
              colorFront={palette.accent}
              colorMid={palette.colorC}
              colorBack={palette.colorA}
              brightness={0.14 + intensity * 0.28}
              contrast={0.38}
              scale={scale}
              speed={effectiveSpeed}
              minPixelRatio={1}
              maxPixelCount={maxPixelCount}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </ShaderErrorBoundary>
      )}
    </div>
  );
}
