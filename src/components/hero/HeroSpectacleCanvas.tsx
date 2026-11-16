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

export interface HeroSpectacleCanvasProps {
  soundActive: boolean;
  pointerTargetRef: React.RefObject<{ x: number; y: number }>;
}

interface RippleRing {
  xRatio: number;
  yRatio: number;
  phase: number;
  maxRadius: number;
}

const RIPPLE_RINGS: readonly RippleRing[] = [
  { xRatio: 0.72, yRatio: 0.78, phase: 0.0, maxRadius: 72 },
  { xRatio: 0.84, yRatio: 0.64, phase: 2.1, maxRadius: 56 },
  { xRatio: 0.24, yRatio: 0.84, phase: 4.2, maxRadius: 64 },
];

const WISP_COLORS: Record<MistWisp['tone'], [number, number, number]> = {
  amber: [223, 188, 145],
  cloud: [198, 190, 180],
  mist: [178, 194, 212],
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

export function HeroSpectacleCanvas({
  soundActive,
  pointerTargetRef,
}: HeroSpectacleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundActiveRef = useRef(soundActive);
  soundActiveRef.current = soundActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let width = 1280;
    let height = 760;
    let dpr = 1;
    let streaks: RainStreak[] = [];
    let motes: DustMote[] = [];
    const wisps = createMistWisps();

    const wispSprites: Record<MistWisp['tone'], HTMLCanvasElement> = {
      amber: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.amber.join(',')}, 1)`],
        [0.5, `rgba(${WISP_COLORS.amber.join(',')}, 0.4)`],
        [1, `rgba(${WISP_COLORS.amber.join(',')}, 0)`],
      ]),
      cloud: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.cloud.join(',')}, 1)`],
        [0.5, `rgba(${WISP_COLORS.cloud.join(',')}, 0.38)`],
        [1, `rgba(${WISP_COLORS.cloud.join(',')}, 0)`],
      ]),
      mist: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.mist.join(',')}, 1)`],
        [0.5, `rgba(${WISP_COLORS.mist.join(',')}, 0.4)`],
        [1, `rgba(${WISP_COLORS.mist.join(',')}, 0)`],
      ]),
    };

    const moteSprite = createGlowSprite(64, [
      [0, 'rgba(246, 244, 239, 1)'],
      [0.42, 'rgba(223, 188, 145, 0.58)'],
      [1, 'rgba(223, 188, 145, 0)'],
    ]);

    const smoothPointer = { x: 0, y: 0 };
    let soundBlend = soundActiveRef.current ? 1 : 0;
    let inView = true;
    let rafId = 0;
    let lastTs = performance.now();

    const applySize = (nextW: number, nextH: number) => {
      width = Math.max(320, Math.round(nextW));
      height = Math.max(420, Math.round(nextH));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rainCount = width < 768 ? 30 : 54;
      const moteCount = width < 768 ? 16 : 26;
      streaks = createRainStreaks(rainCount, width, height, 2024);
      motes = createDustMotes(moteCount, width, height, 1971);
    };

    const initialRect = parent.getBoundingClientRect();
    applySize(initialRect.width, initialRect.height);

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

      // 1. Volumetric Cloud & Mist Wisps
      for (const wisp of wisps) {
        const driftX = animate
          ? Math.sin(timeSec * wisp.driftSpeedX + wisp.phase) * 32
          : 0;
        const driftY = animate
          ? Math.cos(timeSec * wisp.driftSpeedY + wisp.phase) * 18
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
        const alpha = Math.min(0.3, wisp.baseAlpha * (1 + 0.22 * soundBlend));

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          wispSprites[wisp.tone],
          cx - radius,
          cy - radius,
          radius * 2,
          radius * 2
        );
      }

      // 2. Subtle Expanding Monsoon Surface Ripples
      ctx.lineWidth = 0.85;
      for (const ring of RIPPLE_RINGS) {
        const cycle = animate ? ((timeSec * 0.22 + ring.phase) % 1) : 0.45;
        const rx = ring.maxRadius * (0.35 + cycle * 0.85);
        const ry = rx * 0.28;
        const alpha = (1 - cycle) * (0.14 + 0.14 * soundBlend);
        if (alpha > 0.01) {
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = 'rgba(223, 188, 145, 1)';
          ctx.beginPath();
          ctx.ellipse(
            ring.xRatio * width + breeze.mistShiftX * 0.35,
            ring.yRatio * height + breeze.mistShiftY * 0.2,
            rx,
            ry,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }

      // 3. Multi-Depth Diagonal Monsoon Rain Streaks
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
          s.depth > 0.7 && s.x > width * 0.42
            ? 'rgba(223, 188, 145, 1)'
            : 'rgba(246, 244, 239, 1)';
        ctx.globalAlpha = Math.min(0.4, s.opacity * (1 + 0.22 * soundBlend));
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // 4. Floating Luminous Dawn & Firefly Motes
      for (const m of motes) {
        if (animate) {
          m.y += m.speedY * dt;
          m.x +=
            (m.speedX + breeze.mistShiftX * 0.25 * (0.4 + m.depth)) * dt;

          if (m.y < -12) m.y = height + 12;
          if (m.x < -12) m.x = width + 12;
          if (m.x > width + 12) m.x = -12;
        }

        const twinkle = 0.65 + 0.35 * Math.sin(timeSec * 1.45 + m.phase);
        const alpha = Math.min(0.72, m.alpha * twinkle * moteBoost);
        const haloR = m.radius * (2.6 + 0.65 * soundBlend);

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
            { threshold: 0.01 }
          )
        : null;

    observer?.observe(canvas);

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

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      observer?.disconnect();
    };
  }, [pointerTargetRef]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-spectacle-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
