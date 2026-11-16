import type { SiteLang } from '../../context/LanguageContext';
import { POET_TIMELINE_MILESTONES } from '../../data/authorProfile';
import type { CycleId } from '../../data/poemsCatalog';

export const MILESTONE_CYCLE_MAP: Record<string, CycleId> = {
  'ms-feb-02': 'longing-dawn',
  'ms-feb-01': 'twilight-sky',
  'ms-jan-31': 'masks-reality',
  'ms-jan-30': 'twilight-sky',
  'ms-jan-28b': 'twilight-sky',
  'ms-jan-27': 'twilight-sky',
  'ms-jan-25': 'longing-dawn',
  'ms-dec-13': 'masks-reality',
};

export interface MeridianMilestone {
  id: string;
  cycleId: CycleId;
  yearLabel: string;
  sortKey: number;
  kindLabel: string;
  title: string;
  citation: string;
  location: string;
  upcoming: boolean;
}

export function buildMeridianTimeline(lang: SiteLang = 'bn'): MeridianMilestone[] {
  return [...POET_TIMELINE_MILESTONES]
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((entry) => ({
      id: entry.id,
      cycleId: MILESTONE_CYCLE_MAP[entry.id] ?? 'twilight-sky',
      yearLabel: entry.yearLabel[lang],
      sortKey: entry.sortKey,
      kindLabel: entry.kindLabel[lang],
      title: entry.title,
      citation: entry.citation[lang],
      location: entry.location[lang],
      upcoming: entry.upcoming,
    }));
}

