import type { CollectionName } from '../../data/poemsCatalog';

export interface LightMote {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  depth: number;
  phase: number;
  tint: 'pearl' | 'amber' | 'mist';
}

export interface ContourSampleInput {
  xNorm: number;
  layerIndex: number;
  layerCount: number;
  timeSec: number;
  scrollProgress: number;
  pointerX: number;
  pointerY: number;
  activePhraseIndex: number;
}

export function hashSeed(seedText: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createLightMotes(count: number, seedKey = 'twilight-motes'): LightMote[] {
  const rng = createSeededRng(hashSeed(seedKey));
  const tints: Array<LightMote['tint']> = ['pearl', 'amber', 'mist'];
  const motes: LightMote[] = [];

  for (let i = 0; i < count; i++) {
    const depth = 0.25 + rng() * 0.75;
    motes.push({
      x: rng(),
      y: rng(),
      radius: 0.7 + rng() * 1.9,
      baseAlpha: 0.08 + rng() * 0.24,
      vx: (rng() - 0.45) * 0.008,
      vy: -(0.003 + rng() * 0.008),
      depth,
      phase: rng() * Math.PI * 2,
      tint: tints[i % tints.length],
    });
  }

  return motes;
}

export function advanceMotePosition(
  mote: LightMote,
  dtSec: number,
  scrollVelocityPx: number,
  timeSec: number
): { x: number; y: number; alpha: number } {
  const clampedDt = Math.min(Math.max(dtSec, 0), 0.1);
  const clampedScroll = Math.max(-2400, Math.min(2400, scrollVelocityPx));
  const sway = Math.sin(timeSec * 0.45 + mote.phase) * 0.0025;
  const scrollShift = (clampedScroll / 18000) * mote.depth;

  let nextX = (mote.x + (mote.vx + sway) * clampedDt) % 1;
  let nextY = (mote.y + mote.vy * clampedDt - scrollShift) % 1;

  if (nextX < 0) nextX += 1;
  if (nextY < 0) nextY += 1;

  const pulse = 0.78 + 0.22 * Math.sin(timeSec * 0.9 + mote.phase);
  return {
    x: nextX,
    y: nextY,
    alpha: Math.min(0.45, Math.max(0.04, mote.baseAlpha * pulse)),
  };
}

export function sampleTideContourY(input: ContourSampleInput): number {
  const {
    xNorm,
    layerIndex,
    layerCount,
    timeSec,
    scrollProgress,
    pointerX,
    pointerY,
    activePhraseIndex,
  } = input;

  const layerFrac = layerCount <= 1 ? 0.5 : layerIndex / (layerCount - 1);
  const baseLine = 0.2 + layerFrac * 0.62;

  const scrollAmp = 0.018 + scrollProgress * 0.024 + activePhraseIndex * 0.004;
  const harmonicFreq = 2.6 + layerFrac * 1.9 + activePhraseIndex * 0.25;
  const phaseShift = timeSec * (0.42 + layerFrac * 0.18) + layerIndex * 0.55;

  const primaryWave =
    Math.sin(xNorm * Math.PI * harmonicFreq + phaseShift) * scrollAmp;
  const secondaryWave =
    Math.cos(xNorm * Math.PI * (harmonicFreq * 1.75) - phaseShift * 0.72) *
    (scrollAmp * 0.44);

  const distToPointer = Math.abs(xNorm - pointerX);
  const pointerFalloff = Math.exp(-(distToPointer * distToPointer) * 14);
  const pointerRipple =
    Math.sin(distToPointer * 22 - timeSec * 2.4) *
    pointerFalloff *
    (0.014 + Math.abs(pointerY - 0.5) * 0.025);

  return baseLine + primaryWave + secondaryWave + pointerRipple;
}

export function getCollectionPlatePalette(
  collection: CollectionName
): [string, string, string] {
  switch (collection) {
    case 'twilight-sky':
      return ['#3B4657', '#677180', '#B2C2D4'];
    case 'masks-reality':
      return ['#384252', '#8E827B', '#DFBC91'];
    case 'longing-dawn':
      return ['#434D5E', '#9B8E85', '#EDE7DD'];
  }
}
