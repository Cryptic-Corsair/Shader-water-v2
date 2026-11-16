import type { SiteLang } from '../../context/LanguageContext';

export interface RainStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
  depth: number; // 0 (far/soft) -> 1 (near/crisp)
}

export interface MistWisp {
  xRatio: number;
  yRatio: number;
  radiusRatio: number;
  driftSpeedX: number;
  driftSpeedY: number;
  phase: number;
  baseAlpha: number;
  tone: 'amber' | 'cloud' | 'mist';
}

export interface DustMote {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
  speedY: number;
  speedX: number;
  depth: number;
}

/**
 * Deterministic PRNG (Mulberry32) so initial hero atmosphere layout is repeatable.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Splits the hero headline into clean poetic lines without breaking Bengali conjuncts.
 */
export function splitHeadlineLines(headline: string, lang: SiteLang): string[] {
  const trimmed = headline.trim();
  if (!trimmed) return [];

  if (lang === 'bn') {
    const marker = 'মেঘ ও ';
    const idx = trimmed.indexOf(marker);
    if (idx !== -1) {
      const splitPoint = idx + marker.length;
      return [
        trimmed.slice(0, splitPoint).trim(),
        trimmed.slice(splitPoint).trim(),
      ].filter(Boolean);
    }
  } else {
    const commaIdx = trimmed.indexOf(',');
    if (commaIdx !== -1 && commaIdx < trimmed.length - 4) {
      return [
        trimmed.slice(0, commaIdx + 1).trim(),
        trimmed.slice(commaIdx + 1).trim(),
      ].filter(Boolean);
    }
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 3) return [trimmed];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/**
 * Computes diagonal monsoon rain angle & horizontal wind offset from normalized pointer [-0.5, 0.5].
 */
export function computeBreezeTilt(normX: number, normY: number): {
  angleRad: number;
  windVx: number;
  mistShiftX: number;
  mistShiftY: number;
} {
  const clampedX = Math.max(-0.5, Math.min(0.5, normX));
  const clampedY = Math.max(-0.5, Math.min(0.5, normY));
  // Subtle natural monsoon slant (-0.18 rad ~ -10.3 deg) gently bent by pointer breeze
  const angleRad = -0.18 + clampedX * 0.22;
  const windVx = Math.sin(angleRad);
  return {
    angleRad,
    windVx,
    mistShiftX: clampedX * 36,
    mistShiftY: clampedY * 22,
  };
}

/**
 * Computes audio-reactive harmonic pulse multiplier.
 * When sound is ON, mist and motes breathe with a slow 0.35Hz–0.65Hz luminous pulse.
 * When sound is OFF, amplitude settles cleanly to 1.0 (calm stillness).
 */
export function computeSoundModulation(
  timeSec: number,
  soundActive: boolean
): {
  mistScale: number;
  moteAlphaBoost: number;
  rainVelocityFactor: number;
  rippleGlow: number;
} {
  if (!soundActive) {
    return {
      mistScale: 1,
      moteAlphaBoost: 1,
      rainVelocityFactor: 0.86,
      rippleGlow: 0,
    };
  }
  const slowWave = 0.5 + 0.5 * Math.sin(timeSec * 1.35);
  const harmonicWave = 0.5 + 0.5 * Math.sin(timeSec * 2.1 + 0.8);
  return {
    mistScale: 1 + 0.14 * slowWave,
    moteAlphaBoost: 1.18 + 0.32 * harmonicWave,
    rainVelocityFactor: 1.12,
    rippleGlow: 0.35 + 0.65 * slowWave,
  };
}

/**
 * Computes scroll-progress dissolve curves (progress in [0, 1]) for hero scrollytelling.
 */
export function computeHeroScrollDissolve(progress: number): {
  poemTranslateY: number;
  poemOpacity: number;
  mistOpacity: number;
  sculptureScale: number;
} {
  const p = Math.max(0, Math.min(1, progress));
  return {
    poemTranslateY: p === 0 ? 0 : -56 * p,
    poemOpacity: Math.max(0.14, 1 - p * 0.86),
    mistOpacity: Math.max(0, 1 - p * 1.15),
    sculptureScale: 1 + p * 0.06,
  };
}

export function createMistWisps(): MistWisp[] {
  return [
    {
      xRatio: 0.78,
      yRatio: 0.24,
      radiusRatio: 0.46,
      driftSpeedX: 0.14,
      driftSpeedY: 0.09,
      phase: 0.2,
      baseAlpha: 0.24,
      tone: 'amber',
    },
    {
      xRatio: 0.66,
      yRatio: 0.4,
      radiusRatio: 0.54,
      driftSpeedX: -0.11,
      driftSpeedY: 0.08,
      phase: 1.7,
      baseAlpha: 0.24,
      tone: 'cloud',
    },
    {
      xRatio: 0.88,
      yRatio: 0.58,
      radiusRatio: 0.5,
      driftSpeedX: 0.08,
      driftSpeedY: -0.1,
      phase: 3.1,
      baseAlpha: 0.2,
      tone: 'mist',
    },
    {
      xRatio: 0.26,
      yRatio: 0.74,
      radiusRatio: 0.44,
      driftSpeedX: 0.07,
      driftSpeedY: 0.06,
      phase: 4.4,
      baseAlpha: 0.15,
      tone: 'mist',
    },
  ];
}

export function createRainStreaks(
  count: number,
  width: number,
  height: number,
  seed = 2024
): RainStreak[] {
  const rand = createSeededRandom(seed);
  return Array.from({ length: count }, () => {
    const depth = rand();
    return {
      x: rand() * (width + 160) - 80,
      y: rand() * height,
      length: 38 + depth * 74,
      speed: 240 + depth * 360,
      opacity: 0.095 + depth * 0.22,
      width: 0.75 + (1 - depth) * 1.55, // Far streaks softly wider/dimmer for DOF
      depth,
    };
  });
}

export function createDustMotes(
  count: number,
  width: number,
  height: number,
  seed = 1971
): DustMote[] {
  const rand = createSeededRandom(seed);
  return Array.from({ length: count }, () => {
    const depth = rand();
    return {
      x: rand() * width,
      y: rand() * height,
      radius: 1.3 + (1 - depth) * 2.8,
      alpha: 0.22 + depth * 0.38,
      phase: rand() * Math.PI * 2,
      speedY: -8 - rand() * 14,
      speedX: (rand() - 0.5) * 10,
      depth,
    };
  });
}
