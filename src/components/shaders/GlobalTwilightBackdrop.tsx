import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { useLocation } from 'react-router-dom';
import {
  advanceMotePosition,
  createLightMotes,
  type LightMote,
} from '../art/canvasAtmosphereMath';
import { useReadingSurface } from '../ReadingSurfaceContext';
import {
  ShaderErrorBoundary,
  detectWebGLCapabilities,
} from './LiveAtmosphere';

const GLOBAL_TWILIGHT_COLORS: [string, string, string, string] = [
  '#333B48',
  '#525C6B',
  '#8C827A',
  '#6E7A8A',
];

function GlobalCssFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: '#3A4352',
        backgroundImage: `
          radial-gradient(74% 64% at 18% 18%, rgba(200, 192, 182, 0.34) 0%, transparent 66%),
          radial-gradient(64% 64% at 86% 24%, rgba(54, 62, 75, 0.72) 0%, transparent 65%),
          radial-gradient(72% 68% at 52% 84%, rgba(142, 130, 123, 0.36) 0%, transparent 70%),
          linear-gradient(165deg, #363E4B 0%, #4E5766 48%, #5F6773 78%, #38404E 100%)
        `,
      }}
    />
  );
}

const MOTE_FILL: Record<LightMote['tint'], string> = {
  pearl: '246, 244, 239',
  amber: '223, 188, 145',
  mist: '178, 194, 212',
};

export function GlobalTwilightBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const { surface } = useReadingSurface();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
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
    const onVisChange = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  // Subtle Canvas 2D drifting light-motes & atmospheric mist layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isDaylightPaper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motes = createLightMotes(44, 'liminal-twilight-motes');
    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTs = performance.now();
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let scrollVelocity = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastScrollY;
      lastScrollY = nextY;
      scrollVelocity = Math.max(-2200, Math.min(2200, scrollVelocity + delta * 14));
    };

    const drawFrame = (now: number) => {
      const dtSec = Math.min(0.06, (now - lastTs) / 1000);
      lastTs = now;
      const timeSec = now / 1000;

      ctx.clearRect(0, 0, width, height);

      // Soft drifting mist halos
      const mistShiftX = Math.sin(timeSec * 0.08) * width * 0.04;
      const mistShiftY = Math.cos(timeSec * 0.06) * height * 0.03;

      const mistA = ctx.createRadialGradient(
        width * 0.22 + mistShiftX,
        height * 0.28 + mistShiftY,
        0,
        width * 0.22 + mistShiftX,
        height * 0.28 + mistShiftY,
        Math.max(width, height) * 0.48
      );
      mistA.addColorStop(0, 'rgba(223, 188, 145, 0.055)');
      mistA.addColorStop(1, 'rgba(223, 188, 145, 0)');
      ctx.fillStyle = mistA;
      ctx.fillRect(0, 0, width, height);

      const mistB = ctx.createRadialGradient(
        width * 0.78 - mistShiftX,
        height * 0.68 - mistShiftY,
        0,
        width * 0.78 - mistShiftX,
        height * 0.68 - mistShiftY,
        Math.max(width, height) * 0.52
      );
      mistB.addColorStop(0, 'rgba(178, 194, 212, 0.07)');
      mistB.addColorStop(1, 'rgba(178, 194, 212, 0)');
      ctx.fillStyle = mistB;
      ctx.fillRect(0, 0, width, height);

      // Drifting luminous motes reacting gently to scroll velocity
      for (let i = 0; i < motes.length; i++) {
        const mote = motes[i];
        const next = advanceMotePosition(
          mote,
          reducedMotion ? 0 : dtSec,
          reducedMotion ? 0 : scrollVelocity,
          timeSec
        );
        mote.x = next.x;
        mote.y = next.y;

        const px = next.x * width;
        const py = next.y * height;
        const rgb = MOTE_FILL[mote.tint];

        const glow = ctx.createRadialGradient(
          px,
          py,
          0,
          px,
          py,
          mote.radius * 3.4
        );
        glow.addColorStop(0, `rgba(${rgb}, ${next.alpha.toFixed(3)})`);
        glow.addColorStop(
          0.45,
          `rgba(${rgb}, ${(next.alpha * 0.42).toFixed(3)})`
        );
        glow.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, mote.radius * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      scrollVelocity *= 0.9;
    };

    resize();
    drawFrame(performance.now());

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (!reducedMotion && pageVisible) {
      const tick = (now: number) => {
        drawFrame(now);
        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [reducedMotion, pageVisible, isDaylightPaper]);

  const shaderSpeed = !reducedMotion && pageVisible && !isDaylightPaper ? 0.18 : 0;
  const maxPixelCount = webgl.isSoftwareRenderer ? 1024 * 640 : 1440 * 900;

  return (
    <div
      aria-hidden="true"
      data-testid="global-twilight-backdrop"
      data-shader-active={shaderSpeed > 0 ? 'true' : 'false'}
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-500 ${
        isDaylightPaper ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {!webgl.supported ? (
        <GlobalCssFallback />
      ) : (
        <ShaderErrorBoundary fallback={<GlobalCssFallback />}>
          <div className="absolute inset-0">
            <MeshGradient
              colors={GLOBAL_TWILIGHT_COLORS}
              distortion={0.68}
              swirl={0.42}
              grainMixer={0.12}
              grainOverlay={0.05}
              speed={shaderSpeed}
              minPixelRatio={1}
              maxPixelCount={maxPixelCount}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </ShaderErrorBoundary>
      )}

      {/* Subtle twilight contrast veil so luminous ink remains sharp everywhere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 80% at 24% 38%, rgba(44, 52, 65, 0.22) 0%, rgba(36, 42, 54, 0.56) 100%)',
        }}
      />

      {/* Drifting luminous motes & atmospheric mist Canvas 2D layer */}
      <canvas
        ref={canvasRef}
        data-testid="twilight-motes-canvas"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
