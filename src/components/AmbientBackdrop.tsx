import { useEffect, useState } from 'react';
import { Water } from '@paper-design/shaders-react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger, gsap, prefersReducedMotion } from '../lib/motion';
import { useReadingSurface } from './ReadingSurfaceContext';
import {
  AMBIENT_STAGES,
  clampStageIndex,
  computeStageOpacities,
  resolveRouteDefaultStage,
} from './ambientBackdropStages';
import {
  GLOBAL_WATER_IMAGE_URI,
  resolveGlobalWaterConfig,
} from './globalWaterConfig';
import {
  ShaderErrorBoundary,
  detectWebGLCapabilities,
} from './shaders/LiveAtmosphere';

function GlobalWaterFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-cover bg-center"
      style={{
        backgroundColor: '#212936',
        backgroundImage: `url("${GLOBAL_WATER_IMAGE_URI}")`,
      }}
    />
  );
}

export function AmbientBackdrop() {
  const location = useLocation();
  const { surface } = useReadingSurface();
  const [activeStage, setActiveStage] = useState<number>(() =>
    resolveRouteDefaultStage(location.pathname)
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    prefersReducedMotion()
  );
  const [pageVisible, setPageVisible] = useState<boolean>(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth
  );
  const [webgl] = useState(() => detectWebGLCapabilities());

  const isReadingRoom =
    location.pathname.startsWith('/poems/') && location.pathname !== '/poems/';
  const isDaylightPaper = isReadingRoom && surface === 'paper';

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
    if (typeof document === 'undefined') return;
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () =>
      document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId = 0;
    const handleResize = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        setViewportWidth(window.innerWidth);
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const defaultStage = resolveRouteDefaultStage(location.pathname);
    setActiveStage(defaultStage);

    let ctx: gsap.Context | null = null;
    const rafId = window.requestAnimationFrame(() => {
      const markers = Array.from(
        document.querySelectorAll<HTMLElement>('[data-bg-stage]')
      );
      if (markers.length === 0) return;

      ctx = gsap.context(() => {
        markers.forEach((marker) => {
          const raw = Number(marker.getAttribute('data-bg-stage') ?? '0');
          const stageIdx = clampStageIndex(raw);

          ScrollTrigger.create({
            trigger: marker,
            start: 'top 58%',
            end: 'bottom 42%',
            onEnter: () => setActiveStage(stageIdx),
            onEnterBack: () => setActiveStage(stageIdx),
          });
        });
      });

      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, [location.pathname]);

  const hardwareConcurrency =
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 8;

  const waterConfig = resolveGlobalWaterConfig({
    isDaylightPaper,
    pageVisible,
    reducedMotion,
    isSoftwareRenderer: webgl.isSoftwareRenderer,
    hardwareConcurrency,
    viewportWidth,
  });

  const opacities = computeStageOpacities(activeStage);

  return (
    <div
      aria-hidden="true"
      data-testid="ambient-backdrop"
      data-active-stage={activeStage}
      data-stage-name={AMBIENT_STAGES[activeStage]?.name ?? 'Dawn Fog'}
      data-water-active={waterConfig.active ? 'true' : 'false'}
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#1D2430] transition-opacity duration-500 ${
        isDaylightPaper ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Persistent, Heavily Optimized Full-Site Water Shader Layer */}
      <div
        data-testid="global-water-backdrop"
        className="pointer-events-none absolute inset-0"
      >
        {!webgl.supported ? (
          <GlobalWaterFallback />
        ) : (
          <ShaderErrorBoundary fallback={<GlobalWaterFallback />}>
            <Water
              image={GLOBAL_WATER_IMAGE_URI}
              fit="cover"
              scale={waterConfig.scale}
              colorBack="#1B222E"
              colorHighlight="#E6C99E"
              highlights={waterConfig.highlights}
              layering={waterConfig.layering}
              edges={waterConfig.edges}
              caustic={waterConfig.caustic}
              waves={waterConfig.waves}
              size={waterConfig.size}
              speed={waterConfig.speed}
              minPixelRatio={waterConfig.minPixelRatio}
              maxPixelCount={waterConfig.maxPixelCount}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                inset: 0,
              }}
            />
          </ShaderErrorBoundary>
        )}
      </div>

      {/* Translucent Scroll-Stage Mood Glazes (preserve clear water caustics beneath) */}
      {AMBIENT_STAGES.map((stage, idx) => (
        <div
          key={stage.id}
          data-stage-layer={stage.id}
          className="absolute inset-0"
          style={{
            backgroundImage: stage.backgroundImage,
            opacity: opacities[idx] * 0.28,
            transition: reducedMotion
              ? 'none'
              : 'opacity 1050ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity',
          }}
        />
      ))}

      {/* Subtle Perimeter Vignette for Effortless Typography Contrast Over Vivid Water */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(92% 84% at 42% 38%, rgba(18, 22, 30, 0.08) 0%, rgba(16, 20, 28, 0.38) 100%)',
        }}
      />
    </div>
  );
}
