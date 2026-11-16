import { getFeaturedPoems, type PoemMeta } from '../../data/poemsCatalog';
import { getPoemOpeningStanza } from '../../data/poemsContent';
import {
  getCircularOffset,
  getSlideDepthStyle,
  wrapSlideIndex,
} from './collectionsCarouselData';

export interface MoodBarSpec {
  heightPercent: number;
  delaySeconds: number;
  color: string;
}

export function getStageFeaturedPoems(limit = 5): PoemMeta[] {
  return getFeaturedPoems().slice(0, Math.max(1, limit));
}

export function getFeaturedStanzaLines(slug: string, maxLines = 3): string[] {
  return getPoemOpeningStanza(slug, maxLines);
}

export function buildMoodPulseBars(
  poem: Pick<PoemMeta, 'moodColors' | 'readingSeconds' | 'order'>,
  count = 8
): MoodBarSpec[] {
  const safeCount = Math.max(3, Math.min(16, count));
  const seed = poem.readingSeconds + poem.order * 17;
  const palette = poem.moodColors.length > 0 ? poem.moodColors : ['#B2C2D4', '#DFBC91', '#8E827B'];

  const bars: MoodBarSpec[] = [];
  for (let i = 0; i < safeCount; i++) {
    const wave = Math.abs(Math.sin((i + 1) * 0.92 + seed * 0.13));
    const heightPercent = Math.round(32 + wave * 64);
    const delaySeconds = Number(((i * 0.14) % 1.1).toFixed(2));
    const color = palette[i % palette.length];
    bars.push({ heightPercent, delaySeconds, color });
  }
  return bars;
}

export function clampVelocityTimeScale(rawVelocity: number): number {
  if (!Number.isFinite(rawVelocity)) return 1;
  const boost = Math.min(2.1, Math.abs(rawVelocity) / 850);
  return Number((1 + boost).toFixed(3));
}

export { getCircularOffset, getSlideDepthStyle, wrapSlideIndex };
