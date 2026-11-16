import type { SiteLang } from '../../context/LanguageContext';
import { POEM_CYCLES, getCollections, type CycleId } from '../../data/poemsCatalog';

export interface CycleCarouselSlide {
  id: CycleId;
  nameBn: string;
  nameEn: string;
  collectionQuery: CycleId;
  yearsBn: string;
  yearsEn: string;
  taglineBn: string;
  taglineEn: string;
  couplet: [string, string];
  horizonColors: [string, string, string];
  waveAmplitude: number;
  wavePhase: number;
}

export const CYCLE_CAROUSEL_SLIDES: readonly CycleCarouselSlide[] =
  getCollections().map((id) => {
    const c = POEM_CYCLES[id];
    return {
      id: c.id,
      nameBn: c.nameBn,
      nameEn: c.nameEn,
      collectionQuery: c.id,
      yearsBn: c.yearsBn,
      yearsEn: c.yearsEn,
      taglineBn: c.taglineBn,
      taglineEn: c.taglineEn,
      couplet: c.couplet,
      horizonColors: c.horizonColors,
      waveAmplitude: c.waveAmplitude,
      wavePhase: c.wavePhase,
    };
  });

export function getSlideCycleName(slide: CycleCarouselSlide, lang: SiteLang): string {
  return lang === 'bn' ? slide.nameBn : slide.nameEn;
}

export function wrapSlideIndex(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return ((Math.round(index) % total) + total) % total;
}

export function getCircularOffset(
  slideIndex: number,
  activeIndex: number,
  total: number
): number {
  if (total <= 0) return 0;
  let diff = slideIndex - activeIndex;
  const half = total / 2;
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

export function getSlideDepthStyle(offset: number): {
  scale: number;
  opacity: number;
  zIndex: number;
} {
  const abs = Math.abs(offset);
  if (abs < 0.25) {
    return { scale: 1, opacity: 1, zIndex: 20 };
  }
  if (abs <= 1.25) {
    return { scale: 0.82, opacity: 0.48, zIndex: 10 };
  }
  return { scale: 0.72, opacity: 0.22, zIndex: 5 };
}
