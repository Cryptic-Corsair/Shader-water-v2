import type { SiteLang } from '../../context/LanguageContext';
import {
  POEM_CYCLES,
  POEMS_CATALOG,
  getCollections,
  getFeaturedPoems,
  getPoemMetaBySlug,
  type CollectionName,
  type PoemMeta,
} from '../../data/poemsCatalog';
import { UI_COPY } from '../../data/uiCopy';

export interface CollectionWorldItem {
  id: CollectionName;
  name: string;
  years: string;
  tagline: string;
  excerpt: string;
  count: number;
  parallaxPercent: number;
  surfaceMode: 'light' | 'dusk';
  meshGradient: string;
}

export function getCollectionWorlds(lang: SiteLang = 'bn'): CollectionWorldItem[] {
  const countFor = (id: CollectionName) =>
    POEMS_CATALOG.filter((p) => p.collection === id).length;

  const specs: Array<{
    id: CollectionName;
    parallaxPercent: number;
    surfaceMode: 'light' | 'dusk';
    meshGradient: string;
  }> = [
    {
      id: 'twilight-sky',
      parallaxPercent: -8,
      surfaceMode: 'dusk',
      meshGradient:
        'radial-gradient(85% 85% at 18% 20%, rgba(178, 194, 212, 0.44) 0%, transparent 60%), radial-gradient(75% 75% at 86% 78%, rgba(54, 62, 75, 0.9) 0%, transparent 62%), linear-gradient(145deg, #3B4656 0%, #677180 52%, #8E97A4 100%)',
    },
    {
      id: 'masks-reality',
      parallaxPercent: 0,
      surfaceMode: 'light',
      meshGradient:
        'radial-gradient(80% 80% at 80% 18%, rgba(223, 188, 145, 0.52) 0%, transparent 60%), radial-gradient(75% 75% at 15% 85%, rgba(78, 72, 68, 0.45) 0%, transparent 62%), linear-gradient(155deg, #CFC8BE 0%, #B8A99B 52%, #7D746D 100%)',
    },
    {
      id: 'longing-dawn',
      parallaxPercent: 10,
      surfaceMode: 'dusk',
      meshGradient:
        'radial-gradient(85% 85% at 22% 76%, rgba(223, 188, 145, 0.42) 0%, transparent 60%), radial-gradient(75% 75% at 84% 22%, rgba(237, 231, 221, 0.35) 0%, transparent 58%), linear-gradient(135deg, #3A4352 0%, #596270 50%, #8E827B 100%)',
    },
  ];

  return specs.map((spec) => {
    const cycle = POEM_CYCLES[spec.id];
    const firstPoem = POEMS_CATALOG.find((p) => p.collection === spec.id);
    return {
      id: spec.id,
      name: lang === 'bn' ? cycle.nameBn : cycle.nameEn,
      years: lang === 'bn' ? cycle.yearsBn : cycle.yearsEn,
      tagline: lang === 'bn' ? cycle.taglineBn : cycle.taglineEn,
      excerpt: firstPoem?.firstLine ?? cycle.couplet[0],
      count: countFor(spec.id),
      parallaxPercent: spec.parallaxPercent,
      surfaceMode: spec.surfaceMode,
      meshGradient: spec.meshGradient,
    };
  });
}

export function getFeaturedGalleryPoems(limit = 5): PoemMeta[] {
  return getFeaturedPoems().slice(0, limit);
}

export function getRibbonFragments(): string[] {
  return [...POEMS_CATALOG]
    .sort((a, b) => a.order - b.order)
    .map((poem) => poem.firstLine);
}

export function validateDispatchEmail(
  rawEmail: string,
  lang: SiteLang = 'bn'
): {
  valid: boolean;
  message: string;
} {
  const copy = UI_COPY[lang].footer;
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return {
      valid: false,
      message: copy.emailEmpty,
    };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return {
      valid: false,
      message: copy.emailInvalid,
    };
  }
  return {
    valid: true,
    message: copy.emailSuccess,
  };
}

export function resolveTransitionLabel(
  pathname: string,
  lang: SiteLang = 'bn'
): string {
  const labels = UI_COPY[lang].transitionLabels;
  if (pathname === '/' || pathname === '') {
    return labels.home;
  }
  if (pathname === '/poems') {
    return labels.archive;
  }
  if (pathname === '/about') {
    return labels.about;
  }
  if (pathname.startsWith('/poems/')) {
    const slug = pathname.slice('/poems/'.length).replace(/\/+$/, '');
    const meta = getPoemMetaBySlug(slug);
    return meta ? meta.title : labels.readingRoom;
  }
  return labels.home;
}

export interface KineticDepthPhrase {
  id: string;
  lead: string;
  accent: string;
  note: string;
}

export const KINETIC_DEPTH_PHRASES: readonly KineticDepthPhrase[] =
  UI_COPY.bn.depthDrift.phrases.map((phrase, idx) => ({
    id: `depth-phrase-${idx + 1}`,
    lead: phrase.lead,
    accent: phrase.accent,
    note: phrase.note,
  }));

export { getCollections };
