import type { SiteLang } from '../../context/LanguageContext';
import {
  POEM_CYCLES,
  POEMS_CATALOG,
  getCollections,
  toBanglaNumerals,
  type CycleId,
  type PoemMeta,
} from '../../data/poemsCatalog';

export interface CycleVolumeEntry {
  id: CycleId;
  indexLabel: string;
  name: string;
  tagline: string;
  years: string;
  couplet: [string, string];
  horizonColors: [string, string, string];
  waveAmplitude: number;
  wavePhase: number;
  poems: PoemMeta[];
  countLabel: string;
}

export function buildCycleVolumes(lang: SiteLang = 'bn'): CycleVolumeEntry[] {
  return getCollections().map((cycleId, idx) => {
    const meta = POEM_CYCLES[cycleId];
    const poems = POEMS_CATALOG.filter((p) => p.collection === cycleId).sort(
      (a, b) => a.order - b.order
    );
    const numStr = String(idx + 1).padStart(2, '0');
    const countNum = lang === 'bn' ? toBanglaNumerals(poems.length) : String(poems.length);

    return {
      id: cycleId,
      indexLabel: lang === 'bn' ? toBanglaNumerals(numStr) : numStr,
      name: lang === 'bn' ? meta.nameBn : meta.nameEn,
      tagline: lang === 'bn' ? meta.taglineBn : meta.taglineEn,
      years: lang === 'bn' ? meta.yearsBn : meta.yearsEn,
      couplet: meta.couplet,
      horizonColors: meta.horizonColors,
      waveAmplitude: meta.waveAmplitude,
      wavePhase: meta.wavePhase,
      poems,
      countLabel:
        lang === 'bn' ? `${countNum}টি কবিতা` : `${countNum} poems`,
    };
  });
}

export function filterTimelineMilestonesByCycle<
  T extends { kindLabel: string; cycleId?: string; upcoming?: boolean },
>(items: readonly T[], cycleFilter: string): T[] {
  if (!cycleFilter || cycleFilter === 'all') {
    return [...items];
  }
  return items.filter(
    (item) => item.cycleId === cycleFilter || item.kindLabel === cycleFilter
  );
}
