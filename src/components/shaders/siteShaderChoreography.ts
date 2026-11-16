import type { ShaderEngineId, ShaderPalettePreset } from './shaderGalleryData';

export type SiteSectionShaderKey =
  | 'hero'
  | 'triptych'
  | 'cycles'
  | 'atlas'
  | 'salon'
  | 'chronology'
  | 'archive'
  | 'reading-room';

export interface SiteBackgroundShaderConfig {
  section: SiteSectionShaderKey;
  engine: ShaderEngineId;
  palette: ShaderPalettePreset;
  speed: number;
  intensity: number;
  scale: number;
  opacity: number;
  scrim: string;
}

export const SITE_BACKGROUND_SHADERS: Record<
  SiteSectionShaderKey,
  SiteBackgroundShaderConfig
> = {
  hero: {
    section: 'hero',
    engine: 'glsl-literary-book',
    palette: {
      id: 'hero-literary-twilight',
      name: { bn: 'গোধূলি ও স্বর্ণাক্ষর', en: 'Twilight Literary Folio' },
      colorA: '#171E29',
      colorB: '#354154',
      colorC: '#C8B9A6',
      accent: '#DFBC91',
    },
    speed: 0.65,
    intensity: 0.86,
    scale: 1.0,
    opacity: 1.0,
    scrim:
      'linear-gradient(90deg, rgba(18, 22, 30, 0.80) 0%, rgba(18, 22, 30, 0.44) 44%, rgba(18, 22, 30, 0.08) 100%)',
  },
  triptych: {
    section: 'triptych',
    engine: 'glsl-wet-ink',
    palette: {
      id: 'triptych-wet-ink',
      name: { bn: 'বর্ষার জল-কালি', en: 'Monsoon Wet-Ink' },
      colorA: '#1A212D',
      colorB: '#394658',
      colorC: '#7F7975',
      accent: '#DFBC91',
    },
    speed: 0.55,
    intensity: 0.58,
    scale: 1.15,
    opacity: 0.52,
    scrim:
      'linear-gradient(180deg, rgba(22, 27, 36, 0.54) 0%, rgba(22, 27, 36, 0.34) 50%, rgba(22, 27, 36, 0.58) 100%)',
  },
  cycles: {
    section: 'cycles',
    engine: 'paper-voronoi',
    palette: {
      id: 'cycles-voronoi-prism',
      name: { bn: 'ভোরোনয় স্ফটিক', en: 'Cellular Stained Prism' },
      colorA: '#1A212C',
      colorB: '#344152',
      colorC: '#6A6562',
      accent: '#C9A479',
    },
    speed: 0.42,
    intensity: 0.48,
    scale: 1.45,
    opacity: 0.38,
    scrim:
      'linear-gradient(180deg, rgba(20, 25, 34, 0.62) 0%, rgba(20, 25, 34, 0.42) 50%, rgba(20, 25, 34, 0.66) 100%)',
  },
  atlas: {
    section: 'atlas',
    engine: 'glsl-fbm',
    palette: {
      id: 'atlas-fbm-silk',
      name: { bn: 'প্রবাহিত সিল্ক', en: 'Domain-Warped Silk' },
      colorA: '#192230',
      colorB: '#3C5068',
      colorC: '#8E837A',
      accent: '#DFBC91',
    },
    speed: 0.62,
    intensity: 0.64,
    scale: 1.05,
    opacity: 0.56,
    scrim:
      'linear-gradient(180deg, rgba(18, 22, 30, 0.52) 0%, rgba(18, 22, 30, 0.28) 50%, rgba(18, 22, 30, 0.54) 100%)',
  },
  salon: {
    section: 'salon',
    engine: 'paper-neuro',
    palette: {
      id: 'salon-neuro-filaments',
      name: { bn: 'স্নায়ু-আলোকতন্তু', en: 'Nocturnal NeuroNoise' },
      colorA: '#171D28',
      colorB: '#344156',
      colorC: '#7D746D',
      accent: '#DFBC91',
    },
    speed: 0.48,
    intensity: 0.52,
    scale: 1.35,
    opacity: 0.44,
    scrim:
      'linear-gradient(180deg, rgba(18, 22, 30, 0.56) 0%, rgba(18, 22, 30, 0.34) 50%, rgba(18, 22, 30, 0.60) 100%)',
  },
  chronology: {
    section: 'chronology',
    engine: 'glsl-crt',
    palette: {
      id: 'chronology-crt-signal',
      name: { bn: 'পাণ্ডুলিপি বর্ণালী', en: 'Archival CRT Drift' },
      colorA: '#19202B',
      colorB: '#3A4658',
      colorC: '#7A726C',
      accent: '#DFBC91',
    },
    speed: 0.52,
    intensity: 0.36,
    scale: 1.15,
    opacity: 0.32,
    scrim:
      'linear-gradient(180deg, rgba(20, 24, 32, 0.64) 0%, rgba(20, 24, 32, 0.46) 50%, rgba(20, 24, 32, 0.68) 100%)',
  },
  archive: {
    section: 'archive',
    engine: 'glsl-fbm',
    palette: {
      id: 'archive-fbm-horizon',
      name: { bn: 'শ্রাবণ সিল্ক', en: 'Archive FBM Silk' },
      colorA: '#1A222F',
      colorB: '#364458',
      colorC: '#737B88',
      accent: '#DFBC91',
    },
    speed: 0.52,
    intensity: 0.56,
    scale: 1.2,
    opacity: 0.48,
    scrim:
      'linear-gradient(180deg, rgba(18, 22, 30, 0.52) 0%, rgba(18, 22, 30, 0.36) 50%, rgba(18, 22, 30, 0.62) 100%)',
  },
  'reading-room': {
    section: 'reading-room',
    engine: 'glsl-raymarch',
    palette: {
      id: 'reading-raymarch-orbit',
      name: { bn: 'নীরব বলয়', en: 'Nocturnal Torus Orbit' },
      colorA: '#171C25',
      colorB: '#2E3849',
      colorC: '#6B6560',
      accent: '#DFBC91',
    },
    speed: 0.42,
    intensity: 0.48,
    scale: 1.1,
    opacity: 0.36,
    scrim:
      'radial-gradient(65% 68% at 50% 42%, rgba(18, 22, 30, 0.72) 0%, rgba(18, 22, 30, 0.45) 100%)',
  },
};

export const HERO_FOLIO_PALETTES: readonly ShaderPalettePreset[] = [
  {
    id: 'folio-monsoon-gold',
    name: { bn: 'শ্রাবণ ও গোধূলি', en: 'Shrabon Twilight' },
    colorA: '#171E29',
    colorB: '#354154',
    colorC: '#D6C8B8',
    accent: '#DFBC91',
  },
  {
    id: 'folio-masks-slate',
    name: { bn: 'মুখোশ ও ধূসর', en: 'Obsidian & Silver' },
    colorA: '#161B24',
    colorB: '#313B4B',
    colorC: '#BCC4CE',
    accent: '#E2C39B',
  },
  {
    id: 'folio-morning-dew',
    name: { bn: 'ভোরের শিশির', en: 'Morning Dew' },
    colorA: '#1A272D',
    colorB: '#3F565E',
    colorC: '#D7DBD5',
    accent: '#EFE2CD',
  },
];

export function resolveHeroFolioPalette(folioIndex: number): ShaderPalettePreset {
  if (!Number.isFinite(folioIndex) || HERO_FOLIO_PALETTES.length === 0) {
    return HERO_FOLIO_PALETTES[0];
  }
  const safe =
    ((Math.round(folioIndex) % HERO_FOLIO_PALETTES.length) +
      HERO_FOLIO_PALETTES.length) %
    HERO_FOLIO_PALETTES.length;
  return HERO_FOLIO_PALETTES[safe] ?? HERO_FOLIO_PALETTES[0];
}

export function getAllCoveredSiteEngines(): ShaderEngineId[] {
  return Array.from(
    new Set(Object.values(SITE_BACKGROUND_SHADERS).map((cfg) => cfg.engine))
  );
}
