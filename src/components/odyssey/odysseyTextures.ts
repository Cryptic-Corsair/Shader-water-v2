import * as THREE from 'three';

/**
 * Procedural concentric brass dial markings & etched coordinate grooves.
 * Color texture explicitly tagged SRGBColorSpace.
 */
export function createAstrolabeDialTexture(
  maxAnisotropy: number
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#141923';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Radial slate twilight vignette
  const grad = ctx.createRadialGradient(cx, cy, 32, cx, cy, size * 0.5);
  grad.addColorStop(0, '#1F2634');
  grad.addColorStop(0.65, '#141A24');
  grad.addColorStop(1, '#0C1018');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine astrolabe concentric rings
  [82, 138, 192, 224].forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle =
      idx % 2 === 0 ? 'rgba(223, 188, 145, 0.48)' : 'rgba(178, 194, 212, 0.28)';
    ctx.lineWidth = idx === 3 ? 2 : 1;
    ctx.stroke();
  });

  // 72 engraved meridian degree ticks
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const r0 = isMajor ? 196 : 210;
    const r1 = 224;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
    ctx.lineTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.strokeStyle = isMajor
      ? 'rgba(223, 188, 145, 0.78)'
      : 'rgba(223, 188, 145, 0.3)';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.max(1, maxAnisotropy);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural micro-brushed metal bump map (linear NoColorSpace).
 */
export function createBrushedMetalBumpTexture(
  maxAnisotropy: number
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y++) {
    const shade = 112 + Math.floor((Math.sin(y * 0.73) * 0.5 + 0.5) * 32);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(0, y, size, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = Math.max(1, maxAnisotropy);
  texture.needsUpdate = true;
  return texture;
}
