import { useEffect, useRef } from 'react';
import type { CollectionName } from '../../data/poemsCatalog';
import {
  createSeededRng,
  getCollectionPlatePalette,
  hashSeed,
} from './canvasAtmosphereMath';

export interface GenerativePlateProps {
  collection: CollectionName;
  className?: string;
}

export function GenerativePlate({
  collection,
  className = '',
}: GenerativePlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = getCollectionPlatePalette(collection);
    const rng = createSeededRng(hashSeed(collection));

    const width = 320;
    const height = 200;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Base twilight wash
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    baseGrad.addColorStop(0, palette[0]);
    baseGrad.addColorStop(0.58, palette[1]);
    baseGrad.addColorStop(1, palette[0]);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // Atmospheric mist blooms
    for (let i = 0; i < 4; i++) {
      const cx = (0.18 + rng() * 0.64) * width;
      const cy = (0.18 + rng() * 0.64) * height;
      const radius = (0.32 + rng() * 0.34) * width;
      const color = i % 2 === 0 ? palette[2] : palette[1];
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `${color}66`);
      grad.addColorStop(1, `${color}00`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Horizon line & delicate ripple arcs seeded by cycle
    const horizonY = height * (0.44 + rng() * 0.14);
    const lineCount = 9;
    for (let l = 0; l < lineCount; l++) {
      const frac = l / (lineCount - 1);
      const yBase = horizonY + (frac - 0.3) * (height * 0.42);
      const amp = 2.5 + frac * 7.5;
      const freq = 1.6 + rng() * 1.4;
      const phase = rng() * Math.PI * 2;

      ctx.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const xNorm = x / width;
        const y =
          yBase +
          Math.sin(xNorm * Math.PI * freq + phase) * amp +
          Math.cos(xNorm * Math.PI * (freq * 1.8) - phase * 0.5) * (amp * 0.35);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle =
        l === 2
          ? `${palette[2]}cc`
          : `rgba(246, 244, 239, ${(0.12 + (1 - frac) * 0.24).toFixed(2)})`;
      ctx.lineWidth = l === 2 ? 1.25 : 0.75;
      ctx.stroke();
    }

    // Fine luminous rain / salt motes
    for (let p = 0; p < 24; p++) {
      const px = rng() * width;
      const py = rng() * height;
      const r = 0.6 + rng() * 1.3;
      ctx.fillStyle = `rgba(246, 244, 239, ${(0.14 + rng() * 0.28).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [collection]);

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border border-white/18 bg-[#363E4B]/50 ${className}`}
    >
      <canvas
        ref={canvasRef}
        data-testid={`generative-plate-${collection.toLowerCase().replace(/\s+/g, '-')}`}
        aria-hidden="true"
        className="block h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 45%, rgba(24,28,36,0.28) 100%)',
        }}
      />
    </div>
  );
}
