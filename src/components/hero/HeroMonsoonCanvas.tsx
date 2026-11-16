import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import {
  computeBreezeTilt,
  computeSoundModulation,
  createDustMotes,
  createMistWisps,
  createRainStreaks,
  type DustMote,
  type MistWisp,
  type RainStreak,
} from './heroAtmosphereMath';

export interface HeroMonsoonCanvasProps {
  soundActive: boolean;
  pointerTargetRef: React.RefObject<{ x: number; y: number }>;
}

const WISP_COLORS: Record<MistWisp['tone'], [number, number, number]> = {
  amber: [223, 188, 145], // #DFBC91
  cloud: [198, 190, 180], // #C6BEB4
  mist: [178, 194, 212],  // #B2C2D4
};

function createGlowSprite(
  size: number,
  stops: Array<[number, string]>
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (octx) {
    const half = size / 2;
    const grad = octx.createRadialGradient(half, half, 0, half, half, half);
    for (const [offset, color] of stops) {
      grad.addColorStop(offset, color);
    }
    octx.fillStyle = grad;
    octx.fillRect(0, 0, size, size);
  }
  return off;
}

export function HeroMonsoonCanvas({
  soundActive,
  pointerTargetRef,
}: HeroMonsoonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundActiveRef = useRef(soundActive);
  soundActiveRef.current = soundActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let streaks: RainStreak[] = [];
    let motes: DustMote[] = [];
    const wisps = createMistWisps();

    // Pre-bake radial mist & mote sprites once (zero per-frame gradient allocations)
    const wispSprites: Record<MistWisp['tone'], HTMLCanvasElement> = {
      amber: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.amber.join(',')}, 1)`],
        [0.52, `rgba(${WISP_COLORS.amber.join(',')}, 0.42)`],
        [1, `rgba(${WISP_COLORS.amber.join(',')}, 0)`],
      ]),
      cloud: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.cloud.join(',')}, 1)`],
        [0.52, `rgba(${WISP_COLORS.cloud.join(',')}, 0.42)`],
        [1, `rgba(${WISP_COLORS.cloud.join(',')}, 0)`],
      ]),
      mist: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.mist.join(',')}, 1)`],
        [0.52, `rgba(${WISP_COLORS.mist.join(',')}, 0.42)`],
        [1, `rgba(${WISP_COLORS.mist.join(',')}, 0)`],
      ]),
    };

    const moteSprite = createGlowSprite(64, [
      [0, 'rgba(246, 244, 239, 1)'],
      [0.45, 'rgba(223, 188, 145, 0.55)'],
      [1, 'rgba(223, 188, 145, 0)'],
    ]);

    const smoothPointer = { x: 0, y: 0 };
    let soundBlend = soundActiveRef.current ? 1 : 0;
    let inView = true;
    let rafId = 0;
    let lastTs = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(320, Math.round(rect.width));
      height = Math.max(420, Math.round(rect.height));
      dpr = 1;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const rainCount = width < 768 ? 28 : 48;
      const moteCount = width < 768 ? 14 : 22;
      streaks = createRainStreaks(rainCount, width, height, 2024);
      motes = createDustMotes(moteCount, width, height, 1971);
    };

    const drawFrame = (nowTs: number, animate: boolean) => {
      const dt = Math.min(0.05, Math.max(0.001, (nowTs - lastTs) / 1000));
      lastTs = nowTs;
      const timeSec = nowTs / 1000;

      const targetPtr = pointerTargetRef.current ?? { x: 0, y: 0 };
      smoothPointer.x += (targetPtr.x - smoothPointer.x) * 0.06;
      smoothPointer.y += (targetPtr.y - smoothPointer.y) * 0.06;

      const targetSound = soundActiveRef.current ? 1 : 0;
      soundBlend += (targetSound - soundBlend) * 0.04;

      const breeze = computeBreezeTilt(smoothPointer.x, smoothPointer.y);
      const soundMod = computeSoundModulation(timeSec, true);
      const mistScale = 1 + (soundMod.mistScale - 1) * soundBlend;
      const moteBoost = 1 + (soundMod.moteAlphaBoost - 1) * soundBlend;
      const velocityFactor =
        0.86 + (soundMod.rainVelocityFactor - 0.86) * soundBlend;

      ctx.clearRect(0, 0, width, height);

      // 1. Volumetric Cloud & Mist Wisps (cached sprite blitting)
      for (const wisp of wisps) {
        const driftX = animate
          ? Math.sin(timeSec * wisp.driftSpeedX + wisp.phase) * 34
          : 0;
        const driftY = animate
          ? Math.cos(timeSec * wisp.driftSpeedY + wisp.phase) * 20
          : 0;
        const cx =
          wisp.xRatio * width +
          driftX +
          breeze.mistShiftX * (0.7 + wisp.phase * 0.1);
        const cy =
          wisp.yRatio * height +
          driftY +
          breeze.mistShiftY * (0.7 + wisp.phase * 0.1);
        const radius = Math.max(width, height) * wisp.radiusRatio * mistScale;
        const alpha = Math.min(0.32, wisp.baseAlpha * (1 + 0.22 * soundBlend));

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          wispSprites[wisp.tone],
          cx - radius,
          cy - radius,
          radius * 2,
          radius * 2
        );
      }

      // 2. Out-of-focus Diagonal Monsoon Rain Streaks (varying depth-of-field)
      const cosA = Math.cos(breeze.angleRad);
      const sinA = Math.sin(breeze.angleRad);
      ctx.lineCap = 'round';

      for (const s of streaks) {
        if (animate) {
          const step = s.speed * velocityFactor * dt;
          s.y += step * cosA;
          s.x += step * sinA;

          if (s.y - s.length > height + 20) {
            s.y = -s.length - 10;
            s.x = ((s.x + width + 180) % (width + 160)) - 80;
          }
          if (s.x < -120) s.x += width + 160;
          if (s.x > width + 120) s.x -= width + 160;
        }

        const x2 = s.x - sinA * s.length;
        const y2 = s.y - cosA * s.length;
        ctx.strokeStyle =
          s.depth > 0.72 && s.x > width * 0.45
            ? 'rgba(223, 188, 145, 1)'
            : 'rgba(246, 244, 239, 1)';
        ctx.globalAlpha = Math.min(0.42, s.opacity * (1 + 0.24 * soundBlend));
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // 3. Floating Luminous Dust & Dawn Motes (cached sprite blitting)
      for (const m of motes) {
        if (animate) {
          m.y += m.speedY * dt;
          m.x +=
            (m.speedX + breeze.mistShiftX * 0.25 * (0.4 + m.depth)) * dt;

          if (m.y < -12) m.y = height + 12;
          if (m.x < -12) m.x = width + 12;
          if (m.x > width + 12) m.x = -12;
        }

        const twinkle = 0.65 + 0.35 * Math.sin(timeSec * 1.4 + m.phase);
        const alpha = Math.min(0.68, m.alpha * twinkle * moteBoost);
        const haloR = m.radius * (2.6 + 0.6 * soundBlend);

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          moteSprite,
          m.x - haloR,
          m.y - haloR,
          haloR * 2,
          haloR * 2
        );
      }

      ctx.globalAlpha = 1;
    };

    resize();

    if (reduced) {
      drawFrame(performance.now(), false);
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
            },
            { threshold: 0.01 }
          )
        : null;

    if (observer) {
      observer.observe(canvas);
    }

    let lastDrawTs = 0;
    const tick = (nowTs: number) => {
      if (inView && !document.hidden) {
        if (nowTs - lastDrawTs >= 32) {
          lastDrawTs = nowTs;
          drawFrame(nowTs, true);
        }
      } else {
        lastTs = nowTs;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    lastTs = performance.now();
    rafId = window.requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, [pointerTargetRef]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-monsoon-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
