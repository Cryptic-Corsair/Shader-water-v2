import { useEffect, useRef, useState } from 'react';
import { sampleTideContourY } from './canvasAtmosphereMath';

export interface TideContourCanvasProps {
  scrollProgress: number;
  activePhraseIndex: number;
  className?: string;
}

export function TideContourCanvas({
  scrollProgress,
  activePhraseIndex,
  className = '',
}: TideContourCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const stateRef = useRef({
    scrollProgress,
    activePhraseIndex,
    pointerX: 0.5,
    pointerY: 0.5,
    targetPointerX: 0.5,
    targetPointerY: 0.5,
  });

  stateRef.current.scrollProgress = scrollProgress;
  stateRef.current.activePhraseIndex = activePhraseIndex;

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
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.02 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      stateRef.current.targetPointerX = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
      );
      stateRef.current.targetPointerY = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height)
      );
    };

    const handlePointerLeave = () => {
      stateRef.current.targetPointerX = 0.5;
      stateRef.current.targetPointerY = 0.5;
    };

    const renderFrame = (nowMs: number) => {
      const s = stateRef.current;
      s.pointerX += (s.targetPointerX - s.pointerX) * 0.08;
      s.pointerY += (s.targetPointerY - s.pointerY) * 0.08;

      const timeSec = nowMs / 1000;
      ctx.clearRect(0, 0, width, height);

      // Subtle horizon glow anchored behind the active beat
      const focusY =
        height * (0.28 + Math.min(2, Math.max(0, s.activePhraseIndex)) * 0.22);
      const glow = ctx.createRadialGradient(
        width * s.pointerX,
        focusY,
        0,
        width * s.pointerX,
        focusY,
        width * 0.62
      );
      glow.addColorStop(0, 'rgba(223, 188, 145, 0.16)');
      glow.addColorStop(0.55, 'rgba(178, 194, 212, 0.07)');
      glow.addColorStop(1, 'rgba(54, 62, 75, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const layerCount = 16;
      const samples = 72;

      for (let layer = 0; layer < layerCount; layer++) {
        const layerFrac = layer / (layerCount - 1);
        const isWarmBand = Math.abs(layerFrac - (0.25 + s.activePhraseIndex * 0.25)) < 0.18;

        ctx.beginPath();
        for (let step = 0; step <= samples; step++) {
          const xNorm = step / samples;
          const yNorm = sampleTideContourY({
            xNorm,
            layerIndex: layer,
            layerCount,
            timeSec: reducedMotion ? 1.2 : timeSec,
            scrollProgress: s.scrollProgress,
            pointerX: s.pointerX,
            pointerY: s.pointerY,
            activePhraseIndex: s.activePhraseIndex,
          });

          const px = xNorm * width;
          const py = yNorm * height;

          if (step === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        const edgeFade = 1 - Math.abs(layerFrac - 0.5) * 1.1;
        const alpha = Math.max(0.08, (isWarmBand ? 0.62 : 0.28) * edgeFade);
        ctx.strokeStyle = isWarmBand
          ? `rgba(223, 188, 145, ${alpha.toFixed(3)})`
          : layer % 2 === 0
            ? `rgba(246, 244, 239, ${alpha.toFixed(3)})`
            : `rgba(178, 194, 212, ${alpha.toFixed(3)})`;
        ctx.lineWidth = isWarmBand ? 1.35 : 0.85;
        ctx.stroke();
      }
    };

    resize();
    renderFrame(performance.now());

    window.addEventListener('resize', resize, { passive: true });
    host.addEventListener('pointermove', handlePointerMove, { passive: true });
    host.addEventListener('pointerleave', handlePointerLeave);

    if (inView && pageVisible && !reducedMotion) {
      const loop = (now: number) => {
        renderFrame(now);
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [inView, pageVisible, reducedMotion]);

  return (
    <div
      ref={hostRef}
      className={`relative h-[22rem] w-full overflow-hidden md:h-[27rem] ${className}`}
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 84% 80% at 50% 50%, black 52%, transparent 98%)',
        maskImage:
          'radial-gradient(ellipse 84% 80% at 50% 50%, black 52%, transparent 98%)',
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="tide-contour-canvas"
        aria-hidden="true"
        className="block h-full w-full"
      />
    </div>
  );
}
