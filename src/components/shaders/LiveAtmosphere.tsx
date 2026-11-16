import {
  Component,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { GodRays, MeshGradient } from '@paper-design/shaders-react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ShaderErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Graceful CSS twilight fallback rendered; zero UI clutter.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface WebGLCapabilities {
  supported: boolean;
  isSoftwareRenderer: boolean;
}

export function detectWebGLCapabilities(): WebGLCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { supported: false, isSoftwareRenderer: false };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) {
      return { supported: false, isSoftwareRenderer: false };
    }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? '')
      : String(gl.getParameter(gl.RENDERER) ?? '');
    const isSoftwareRenderer = /swiftshader|llvmpipe|software|mesa/i.test(
      renderer
    );
    return { supported: true, isSoftwareRenderer };
  } catch {
    return { supported: false, isSoftwareRenderer: false };
  }
}

export const TWILIGHT_MESH_PRESET = {
  colors: ['#363E4B', '#677180', '#C8C0B6', '#8E827B'] as [
    string,
    string,
    string,
    string,
  ],
  distortion: 0.72,
  swirl: 0.48,
  grainMixer: 0.1,
  grainOverlay: 0.06,
  speed: 0.28,
};

export const TWILIGHT_RAYS_PRESET = {
  colors: ['#F4EFE655', '#B5C4D477', '#DFBC9144', '#ffffff33'] as [
    string,
    string,
    string,
    string,
  ],
  colorBack: '#48515E',
  colorBloom: '#9EB0C4',
  bloom: 0.32,
  intensity: 0.55,
  density: 0.35,
  spotty: 0.22,
  speed: 0.32,
  offsetY: -0.35,
};

export interface LiveAtmosphereProps {
  variant?: 'mesh' | 'rays' | 'grain' | 'smoke';
  colors?: string[];
  colorBack?: string;
  distortion?: number;
  swirl?: number;
  grainMixer?: number;
  grainOverlay?: number;
  speed?: number;
  feather?: boolean;
  scrim?: 'twilight' | 'soft' | 'none';
  className?: string;
  // Legacy optional props kept for smooth compatibility with secondary routes
  softness?: number;
  intensity?: number;
  noise?: number;
  shape?: 'wave' | 'dots' | 'truchet' | 'corners' | 'ripple' | 'blob' | 'sphere';
}

function CssTwilightFallback({
  colors = TWILIGHT_MESH_PRESET.colors,
  colorBack = '#4A5362',
}: {
  colors?: string[];
  colorBack?: string;
}) {
  const c0 = colors[0] ?? TWILIGHT_MESH_PRESET.colors[0];
  const c1 = colors[1] ?? TWILIGHT_MESH_PRESET.colors[1];
  const c2 = colors[2] ?? TWILIGHT_MESH_PRESET.colors[2];
  const c3 = colors[3] ?? TWILIGHT_MESH_PRESET.colors[3];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: colorBack,
        backgroundImage: `
          radial-gradient(64% 62% at 20% 18%, ${c2}66 0%, transparent 68%),
          radial-gradient(56% 58% at 84% 72%, ${c3}55 0%, transparent 66%),
          radial-gradient(78% 72% at 50% 45%, ${c1}7a 0%, ${c0} 100%)
        `,
      }}
    />
  );
}

export function LiveAtmosphere({
  variant = 'mesh',
  colors,
  colorBack,
  distortion = TWILIGHT_MESH_PRESET.distortion,
  swirl = TWILIGHT_MESH_PRESET.swirl,
  grainMixer = TWILIGHT_MESH_PRESET.grainMixer,
  grainOverlay = TWILIGHT_MESH_PRESET.grainOverlay,
  speed,
  feather = true,
  scrim = 'twilight',
  className = '',
}: LiveAtmosphereProps) {
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

  const resolvedVariant =
    variant === 'rays' || variant === 'smoke' ? 'rays' : 'mesh';

  const baseSpeed =
    speed ??
    (resolvedVariant === 'rays'
      ? TWILIGHT_RAYS_PRESET.speed
      : TWILIGHT_MESH_PRESET.speed);

  const effectiveSpeed = inView && !reducedMotion ? baseSpeed : 0;
  const maxPixelCount = webgl.isSoftwareRenderer ? 1024 * 640 : 1440 * 900;

  const activeColors =
    colors && colors.length > 0
      ? colors
      : resolvedVariant === 'rays'
        ? TWILIGHT_RAYS_PRESET.colors
        : TWILIGHT_MESH_PRESET.colors;

  const fallback = (
    <CssTwilightFallback
      colors={activeColors}
      colorBack={colorBack ?? (resolvedVariant === 'rays' ? TWILIGHT_RAYS_PRESET.colorBack : '#48515E')}
    />
  );

  return (
    <div
      ref={hostRef}
      data-testid="live-atmosphere"
      data-shader-variant={resolvedVariant}
      data-shader-active={effectiveSpeed > 0 ? 'true' : 'false'}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        feather ? 'shader-feather-y' : ''
      } ${className}`}
    >
      {!webgl.supported ? (
        fallback
      ) : (
        <ShaderErrorBoundary fallback={fallback}>
          <div className="absolute inset-0">
            {resolvedVariant === 'rays' ? (
              <GodRays
                colors={activeColors}
                colorBack={colorBack ?? TWILIGHT_RAYS_PRESET.colorBack}
                colorBloom={TWILIGHT_RAYS_PRESET.colorBloom}
                bloom={TWILIGHT_RAYS_PRESET.bloom}
                intensity={TWILIGHT_RAYS_PRESET.intensity}
                density={TWILIGHT_RAYS_PRESET.density}
                spotty={TWILIGHT_RAYS_PRESET.spotty}
                speed={effectiveSpeed}
                offsetY={TWILIGHT_RAYS_PRESET.offsetY}
                minPixelRatio={1}
                maxPixelCount={maxPixelCount}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <MeshGradient
                colors={activeColors}
                distortion={distortion}
                swirl={swirl}
                grainMixer={grainMixer}
                grainOverlay={grainOverlay}
                speed={effectiveSpeed}
                minPixelRatio={1}
                maxPixelCount={maxPixelCount}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        </ShaderErrorBoundary>
      )}

      {scrim === 'twilight' ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(85% 75% at 28% 45%, rgba(44, 52, 65, 0.24) 0%, rgba(44, 52, 65, 0.56) 100%)',
          }}
        />
      ) : scrim === 'soft' ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(44, 52, 65, 0.14) 0%, rgba(44, 52, 65, 0.42) 100%)',
          }}
        />
      ) : null}
    </div>
  );
}
