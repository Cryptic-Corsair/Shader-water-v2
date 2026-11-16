import type { SiteLang } from '../../context/LanguageContext';
import {
  POEMS_CATALOG,
  type CycleId,
  type PoemMeta,
} from '../../data/poemsCatalog';
import { getPoemOpeningStanza } from '../../data/poemsContent';

export interface OdysseyActDefinition {
  id: 'prologue' | 'masks' | 'constellation' | 'chronicle' | 'finale';
  roman: string;
  start: number;
  end: number;
  labelBn: string;
  labelEn: string;
  coordLabel: string;
  primaryHex: string;
  secondaryHex: string;
  cameraPos: [number, number, number];
  lookY: number;
  astrolabeSplit: number;
  morphWeights: [number, number, number, number];
}

export const ODYSSEY_ACTS: readonly OdysseyActDefinition[] = [
  {
    id: 'prologue',
    roman: 'I',
    start: 0.0,
    end: 0.22,
    labelBn: 'সূচনা · দিগন্ত',
    labelEn: 'Prologue · Horizon',
    coordLabel: '23°48′ N · 90°24′ E',
    primaryHex: '#DFBC91',
    secondaryHex: '#6F89A8',
    cameraPos: [0, 0.15, 7.2],
    lookY: 0,
    astrolabeSplit: 0.08,
    morphWeights: [1, 0, 0, 0],
  },
  {
    id: 'masks',
    roman: 'II',
    start: 0.22,
    end: 0.46,
    labelBn: 'মুখোশ ও অন্তরাল',
    labelEn: 'Masks & Fracture',
    coordLabel: 'DEC 13 · 2023',
    primaryHex: '#C96D63',
    secondaryHex: '#7A7D88',
    cameraPos: [-1.15, 0.35, 5.8],
    lookY: 0.1,
    astrolabeSplit: 1.0,
    morphWeights: [0, 1, 0, 0],
  },
  {
    id: 'constellation',
    roman: 'III',
    start: 0.46,
    end: 0.72,
    labelBn: 'দশ নক্ষত্র · কবিতা',
    labelEn: 'Ten-Poem Orbit',
    coordLabel: 'SHRABON · SKY',
    primaryHex: '#B2C2D4',
    secondaryHex: '#DFBC91',
    cameraPos: [1.1, -0.2, 6.4],
    lookY: -0.05,
    astrolabeSplit: 0.42,
    morphWeights: [0, 0, 1, 0],
  },
  {
    id: 'chronicle',
    roman: 'IV',
    start: 0.72,
    end: 0.9,
    labelBn: 'তিন কাব্যচক্র',
    labelEn: 'Three Cycles',
    coordLabel: 'VOL I – III',
    primaryHex: '#D8B185',
    secondaryHex: '#68859E',
    cameraPos: [0.35, 0.55, 6.9],
    lookY: 0.15,
    astrolabeSplit: 0.26,
    morphWeights: [0, 0, 0.3, 0.7],
  },
  {
    id: 'finale',
    roman: 'V',
    start: 0.9,
    end: 1.0,
    labelBn: 'সম্পূর্ণ সংকলন',
    labelEn: 'Sanctuary Portal',
    coordLabel: 'FEB 02 · 2024',
    primaryHex: '#E8CDA8',
    secondaryHex: '#8FB2B0',
    cameraPos: [0, 0.0, 5.4],
    lookY: 0,
    astrolabeSplit: 0.16,
    morphWeights: [0.2, 0, 0, 0.8],
  },
] as const;

export interface InterpolatedOdysseyStage {
  actIndex: number;
  localPhase: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  lookY: number;
  astrolabeSplit: number;
  morphWeights: [number, number, number, number];
  primaryHex: string;
  secondaryHex: string;
}

export interface ConstellationNode {
  poem: PoemMeta;
  indexLabel: string;
  angleDeg: number;
  angleRad: number;
  orbitRadius: number;
  xPct: number;
  yPct: number;
  stanzaPreview: string[];
  cycle: CycleId;
}

export interface ParticleFormations {
  count: number;
  pos0: Float32Array;
  pos1: Float32Array;
  pos2: Float32Array;
  pos3: Float32Array;
  seeds: Float32Array;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function resolveActByProgress(progress: number): {
  actIndex: number;
  localPhase: number;
  act: OdysseyActDefinition;
} {
  const p = clamp01(progress);
  for (let i = 0; i < ODYSSEY_ACTS.length; i++) {
    const act = ODYSSEY_ACTS[i];
    const isLast = i === ODYSSEY_ACTS.length - 1;
    if (p < act.end || isLast) {
      const span = Math.max(0.0001, act.end - act.start);
      const localPhase = clamp01((p - act.start) / span);
      return { actIndex: i, localPhase, act };
    }
  }
  const fallback = ODYSSEY_ACTS[ODYSSEY_ACTS.length - 1];
  return {
    actIndex: ODYSSEY_ACTS.length - 1,
    localPhase: 1,
    act: fallback,
  };
}

export function interpolateOdysseyStageState(
  progress: number
): InterpolatedOdysseyStage {
  const p = clamp01(progress);
  const { actIndex, localPhase } = resolveActByProgress(p);
  const current = ODYSSEY_ACTS[actIndex];
  const next = ODYSSEY_ACTS[Math.min(ODYSSEY_ACTS.length - 1, actIndex + 1)];
  const blend = smoothstep01(Math.max(0, (localPhase - 0.15) / 0.85));

  const w0 = lerp(current.morphWeights[0], next.morphWeights[0], blend);
  const w1 = lerp(current.morphWeights[1], next.morphWeights[1], blend);
  const w2 = lerp(current.morphWeights[2], next.morphWeights[2], blend);
  const w3 = lerp(current.morphWeights[3], next.morphWeights[3], blend);
  const total = Math.max(0.0001, w0 + w1 + w2 + w3);

  return {
    actIndex,
    localPhase,
    cameraX: lerp(current.cameraPos[0], next.cameraPos[0], blend),
    cameraY: lerp(current.cameraPos[1], next.cameraPos[1], blend),
    cameraZ: lerp(current.cameraPos[2], next.cameraPos[2], blend),
    lookY: lerp(current.lookY, next.lookY, blend),
    astrolabeSplit: lerp(current.astrolabeSplit, next.astrolabeSplit, blend),
    morphWeights: [w0 / total, w1 / total, w2 / total, w3 / total],
    primaryHex: current.primaryHex,
    secondaryHex: current.secondaryHex,
  };
}

/**
 * Generates four deterministic 3D point cloud formations (length = count * 3)
 * for GPU attribute morphing across scroll acts:
 * 0: Celestial Torus Halo (Prologue)
 * 1: Dual Fractured Mask Shells (Masks & Fracture)
 * 2: Shrabon Monsoon Wave Horizon (Ten-Poem Orbit)
 * 3: Blooming Fibonacci Sphere Canopy (Three Cycles & Finale)
 */
export function generateParticleFormations(count: number): ParticleFormations {
  const safeCount = Math.max(64, Math.floor(count));
  const rng = createSeededRng(20240202);

  const pos0 = new Float32Array(safeCount * 3);
  const pos1 = new Float32Array(safeCount * 3);
  const pos2 = new Float32Array(safeCount * 3);
  const pos3 = new Float32Array(safeCount * 3);
  const seeds = new Float32Array(safeCount * 2);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < safeCount; i++) {
    const idx3 = i * 3;
    const idx2 = i * 2;
    const t = i / safeCount;
    const rA = rng();
    const rB = rng();
    const rC = rng();

    seeds[idx2] = rA;
    seeds[idx2 + 1] = rB;

    // 0: Tidal Astrolabe Torus Halo + scattered deep stars
    if (i % 5 === 0) {
      const starRadius = 4.6 + rB * 5.2;
      const starTheta = rA * Math.PI * 2;
      const starPhi = Math.acos(2 * rC - 1);
      pos0[idx3] = starRadius * Math.sin(starPhi) * Math.cos(starTheta);
      pos0[idx3 + 1] = starRadius * Math.cos(starPhi) * 0.65;
      pos0[idx3 + 2] = starRadius * Math.sin(starPhi) * Math.sin(starTheta) - 1.5;
    } else {
      const majorR = 3.1 + Math.sin(t * Math.PI * 6) * 0.25;
      const minorR = 0.24 + rA * 0.65;
      const u = t * Math.PI * 2 * 3 + rB * 0.25;
      const v = rC * Math.PI * 2;
      const ringX = (majorR + minorR * Math.cos(v)) * Math.cos(u);
      const ringY = (majorR + minorR * Math.cos(v)) * Math.sin(u) * 0.85;
      const ringZ = minorR * Math.sin(v) * 1.4;
      pos0[idx3] = ringX;
      pos0[idx3 + 1] = ringY;
      pos0[idx3 + 2] = ringZ;
    }

    // 1: Dual Fractured Mask Shells (Split horizontally in opposite relief)
    const side = i % 2 === 0 ? 1 : -1;
    const maskTheta = (rA - 0.5) * Math.PI * 0.95;
    const maskPhi = (rB - 0.5) * Math.PI * 1.1;
    const shellR = 2.15 + (rC - 0.5) * 0.22;
    pos1[idx3] =
      side * (1.28 + Math.cos(maskPhi) * 0.6) +
      Math.sin(maskTheta) * shellR * 0.62;
    pos1[idx3 + 1] = Math.sin(maskPhi) * shellR * 1.25;
    pos1[idx3 + 2] =
      Math.cos(maskTheta) * Math.cos(maskPhi) * shellR * 0.55 * side;

    // 2: Shrabon Monsoon Wave Horizon (Flowing sine-crest landscape)
    const gridX = (rA - 0.5) * 11.4;
    const gridZ = (rB - 0.5) * 6.8 - 0.6;
    const crest =
      Math.sin(gridX * 0.82 + gridZ * 0.4) * 0.85 +
      Math.cos(gridZ * 1.15 - gridX * 0.35) * 0.48 +
      (rC - 0.5) * 0.28;
    pos2[idx3] = gridX;
    pos2[idx3 + 1] = crest - 0.45;
    pos2[idx3 + 2] = gridZ;

    // 3: Blooming Fibonacci Canopy Sphere
    const fy = 1 - (i / (safeCount - 1)) * 2;
    const fRadius = Math.sqrt(Math.max(0, 1 - fy * fy));
    const fTheta = goldenAngle * i;
    const canopyScale = 3.15 + (rA - 0.5) * 0.42;
    pos3[idx3] = Math.cos(fTheta) * fRadius * canopyScale;
    pos3[idx3 + 1] = fy * canopyScale * 0.88;
    pos3[idx3 + 2] = Math.sin(fTheta) * fRadius * canopyScale;
  }

  return { count: safeCount, pos0, pos1, pos2, pos3, seeds };
}

export function buildPoemConstellationNodes(
  lang: SiteLang
): ConstellationNode[] {
  const ordered = [...POEMS_CATALOG].sort((a, b) => a.order - b.order);
  const total = ordered.length;

  return ordered.map((poem, idx) => {
    // Arc from -138deg to +138deg around celestial SVG orb
    const t = total > 1 ? idx / (total - 1) : 0.5;
    const angleDeg = -132 + t * 264;
    const angleRad = (angleDeg * Math.PI) / 180;
    const orbitRadius = idx % 2 === 0 ? 39 : 31;
    const xPct = 50 + Math.sin(angleRad) * orbitRadius;
    const yPct = 50 - Math.cos(angleRad) * orbitRadius;
    const padded = String(poem.order).padStart(2, '0');
    const indexLabel =
      lang === 'bn'
        ? padded.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)] ?? d)
        : padded;

    return {
      poem,
      indexLabel,
      angleDeg,
      angleRad,
      orbitRadius,
      xPct,
      yPct,
      stanzaPreview: getPoemOpeningStanza(poem.slug, 3),
      cycle: poem.collection,
    };
  });
}

export function getActLabel(act: OdysseyActDefinition, lang: SiteLang): string {
  return lang === 'bn' ? act.labelBn : act.labelEn;
}
