import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

export interface AtlasAtmosphereCanvasProps {
  accentHex: string;
  mistHex: string;
  realmIndex: number;
}

interface FloatingParticle {
  xRatio: number;
  yRatio: number;
  radius: number;
  driftX: number;
  driftY: number;
  phase: number;
  warm: boolean;
}

const PARTICLES: readonly FloatingParticle[] = Array.from(
  { length: 28 },
  (_, i) => ({
    xRatio: ((i * 37) % 100) / 100,
    yRatio: ((i * 53 + 11) % 100) / 100,
    radius: 1.4 + (i % 4) * 0.65,
    driftX: ((i % 2 === 0 ? 1 : -1) * (4 + (i % 5) * 1.8)) / 1000,
    driftY: -(5 + (i % 6) * 2.2) / 1000,
    phase: i * 0.72,
    warm: i % 3 !== 0,
  })
);

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [223, 188, 145];
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return [223, 188, 145];
  return [r, g, b];
}

export function AtlasAtmosphereCanvas({
  accentHex,
  mistHex,
  realmIndex,
}: AtlasAtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetColorsRef = useRef({
    accent: hexToRgb(accentHex),
    mist: hexToRgb(mistHex),
    realmIndex,
  });
  targetColorsRef.current = {
    accent: hexToRgb(accentHex),
    mist: hexToRgb(mistHex),
    realmIndex,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let width = 1280;
    let height = 720;
    let dpr = 1;
    let inView = true;
    let rafId = 0;

    const curAccent = [...targetColorsRef.current.accent];
    const curMist = [...targetColorsRef.current.mist];

    const applySize = (nextW: number, nextH: number) => {
      width = Math.max(300, Math.round(nextW));
      height = Math.max(380, Math.round(nextH));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rect = parent.getBoundingClientRect();
    applySize(rect.width, rect.height);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            applySize(entry.contentRect.width, entry.contentRect.height);
            if (reduced) {
              drawFrame(performance.now(), false);
            }
          })
        : null;
    resizeObserver?.observe(parent);

    const drawFrame = (nowTs: number, animate: boolean) => {
      const t = nowTs / 1000;
      const target = targetColorsRef.current;

      for (let i = 0; i < 3; i += 1) {
        curAccent[i] += (target.accent[i] - curAccent[i]) * (animate ? 0.05 : 1);
        curMist[i] += (target.mist[i] - curMist[i]) * (animate ? 0.05 : 1);
      }

      const ar = Math.round(curAccent[0]);
      const ag = Math.round(curAccent[1]);
      const ab = Math.round(curAccent[2]);
      const mr = Math.round(curMist[0]);
      const mg = Math.round(curMist[1]);
      const mb = Math.round(curMist[2]);

      ctx.clearRect(0, 0, width, height);

      // Slow Horizon Tide Waves
      const bands = 3;
      for (let b = 0; b < bands; b += 1) {
        const yBase = height * (0.28 + b * 0.24);
        const amp = 14 + b * 7;
        const speed = 0.28 + b * 0.09;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 28) {
          const phase = x * 0.0045 + t * speed + b * 1.4 + target.realmIndex * 0.7;
          const y = yBase + Math.sin(phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle =
          b === 1
            ? `rgba(${ar}, ${ag}, ${ab}, 0.22)`
            : `rgba(${mr}, ${mg}, ${mb}, 0.12)`;
        ctx.lineWidth = b === 1 ? 1.2 : 0.85;
        ctx.stroke();
      }

      // Luminous Floating Atmospheric Spores / Mist Motes
      for (const p of PARTICLES) {
        const rawX = animate
          ? (p.xRatio + t * p.driftX + 10) % 1
          : p.xRatio;
        const rawY = animate
          ? (p.yRatio + t * p.driftY + 10) % 1
          : p.yRatio;
        const px = rawX * width;
        const py = rawY * height;
        const pulse = animate ? 0.55 + 0.45 * Math.sin(t * 1.35 + p.phase) : 0.75;
        const glowR = p.radius * 5.2;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        const rgb = p.warm ? `${ar}, ${ag}, ${ab}` : `${mr}, ${mg}, ${mb}`;
        grad.addColorStop(0, `rgba(${rgb}, ${(0.42 * pulse).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduced) {
      drawFrame(performance.now(), false);
      return () => {
        resizeObserver?.disconnect();
      };
    }

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
            },
            { threshold: 0.02 }
          )
        : null;
    observer?.observe(canvas);

    let lastDraw = 0;
    const tick = (nowTs: number) => {
      if (inView && !document.hidden) {
        if (nowTs - lastDraw >= 32) {
          lastDraw = nowTs;
          drawFrame(nowTs, true);
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      observer?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="atlas-atmosphere-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
