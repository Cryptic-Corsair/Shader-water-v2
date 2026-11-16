import type { SiteLang } from '../../context/LanguageContext';

export type ShaderEngineId =
  | 'glsl-wet-ink'
  | 'glsl-raymarch'
  | 'paper-voronoi'
  | 'glsl-fbm'
  | 'glsl-crt'
  | 'paper-neuro';

export interface BilingualCopy {
  bn: string;
  en: string;
}

export interface ShaderExhibit {
  id: string;
  indexLabel: BilingualCopy;
  engine: ShaderEngineId;
  techniqueLabel: BilingualCopy;
  tabLabel: BilingualCopy;
  title: BilingualCopy;
  summary: BilingualCopy;
  poemSlug: string;
  poemTitleBn: string;
  poemCoupleLineBn: string;
  defaultSpeed: number;
  defaultIntensity: number;
  defaultScale: number;
}

export interface ShaderPalettePreset {
  id: string;
  name: BilingualCopy;
  colorA: string;
  colorB: string;
  colorC: string;
  accent: string;
}

export const SHADER_PALETTES: readonly ShaderPalettePreset[] = [
  {
    id: 'twilight-amber',
    name: { bn: 'গোধূলি ও স্বর্ণাভ', en: 'Twilight Amber' },
    colorA: '#1E2532',
    colorB: '#485569',
    colorC: '#8E827B',
    accent: '#DFBC91',
  },
  {
    id: 'monsoon-mist',
    name: { bn: 'শ্রাবণ মেঘ', en: 'Monsoon Mist' },
    colorA: '#1A2633',
    colorB: '#3A4F66',
    colorC: '#7D95AB',
    accent: '#DCE8F5',
  },
  {
    id: 'obsidian-ember',
    name: { bn: 'রাত্রি ও দীপ', en: 'Nocturnal Ember' },
    colorA: '#15171E',
    colorB: '#3A3234',
    colorC: '#825B4A',
    accent: '#F0C790',
  },
  {
    id: 'dawn-dew',
    name: { bn: 'ভোরের শিশির', en: 'Morning Dew' },
    colorA: '#1E2D33',
    colorB: '#4E6B73',
    colorC: '#A8B7B2',
    accent: '#F3ECE1',
  },
];

export const SHADER_EXHIBITS: readonly ShaderExhibit[] = [
  {
    id: 'wet-ink-ripple',
    indexLabel: { bn: '০১', en: '01' },
    engine: 'glsl-wet-ink',
    techniqueLabel: {
      bn: 'GLSL ফ্র্যাগমেন্ট · তরল প্রতিসরণ',
      en: 'Custom GLSL · Fluid Displacement',
    },
    tabLabel: {
      bn: 'জল-কালি তরঙ্গ',
      en: 'Wet-Ink Ripple',
    },
    title: {
      bn: 'বর্ষার জল-কালি তরঙ্গ',
      en: 'Wet-Ink Ripple & Refraction',
    },
    summary: {
      bn: 'মাউস বা আঙুলের স্পর্শে তরঙ্গায়িত আলোর প্রতিসরণ ও জল-কালির ঢেউ তৈরি করে।',
      en: 'Pointer-driven interference waves and viscous ink refraction reacting live to cursor motion.',
    },
    poemSlug: 'tumi-amar',
    poemTitleBn: 'তুমি আমার',
    poemCoupleLineBn: 'তুমি আমার বর্ষার প্রথম বৃষ্টি,, শ্রাবণ সন্ধ্যা,,',
    defaultSpeed: 1.0,
    defaultIntensity: 0.72,
    defaultScale: 1.15,
  },
  {
    id: 'raymarched-sdf',
    indexLabel: { bn: '০২', en: '02' },
    engine: 'glsl-raymarch',
    techniqueLabel: {
      bn: 'GLSL রে-মার্চিং · ত্রিমাত্রিক SDF',
      en: 'Custom GLSL · 3D Raymarching SDF',
    },
    tabLabel: {
      bn: 'ত্রিমাত্রিক বলয়',
      en: 'Raymarch 3D SDF',
    },
    title: {
      bn: 'ত্রিমাত্রিক গোধূলি বলয়',
      en: 'Raymarched 3D Orbital Torus',
    },
    summary: {
      bn: 'কোনো থ্রিডি মডেল ছাড়াই সরাসরি শেডার গণিতের মাধ্যমে আবর্তিত ত্রিমাত্রিক আলোর বলয়।',
      en: 'Pure signed-distance-field geometry raymarched in real time with Fresnel twilight lighting.',
    },
    poemSlug: 'tomar-tumi-hobo',
    poemTitleBn: 'তোমার "তুমি" হবো',
    poemCoupleLineBn: 'আমি তোমার পূর্ণিমার চাঁদ হব, তোমার হৃদয় আলোয় দেবো ভরিয়ে।',
    defaultSpeed: 0.9,
    defaultIntensity: 0.78,
    defaultScale: 1.0,
  },
  {
    id: 'voronoi-prism',
    indexLabel: { bn: '০৩', en: '03' },
    engine: 'paper-voronoi',
    techniqueLabel: {
      bn: 'GPU কোষীয় জ্যামিতি · ভোরোনয় কাচ',
      en: 'Paper Shader · Voronoi Cellular Prism',
    },
    tabLabel: {
      bn: 'ভোরোনয় স্ফটিক',
      en: 'Voronoi Prism',
    },
    title: {
      bn: 'ভোরোনয় স্ফটিক ও মুখোশ',
      en: 'Voronoi Cellular Stained Glass',
    },
    summary: {
      bn: 'কোষীয় দূরত্ব ক্ষেত্র ব্যবহার করে ভাঙা কাচ ও আলোকিত প্রতিফলনের জ্যামিতি।',
      en: 'Cellular Voronoi distance facets shifting like rain-struck prism glass.',
    },
    poemSlug: 'mukhosher-antarale',
    poemTitleBn: 'মুখোশের অন্তরালে',
    poemCoupleLineBn: 'মুখোশের অন্তরালে ঠিক যেন ঢাকা পড়ে যায়।',
    defaultSpeed: 0.85,
    defaultIntensity: 0.65,
    defaultScale: 1.25,
  },
  {
    id: 'fbm-silk',
    indexLabel: { bn: '০৪', en: '04' },
    engine: 'glsl-fbm',
    techniqueLabel: {
      bn: 'GLSL ফ্র্যাক্টাল নয়েজ · প্রবাহিত সিল্ক',
      en: 'Custom GLSL · FBM Domain Warping',
    },
    tabLabel: {
      bn: 'স্বপ্নীল সিল্ক',
      en: 'FBM Horizon Silk',
    },
    title: {
      bn: 'সিমপ্লেক্স মেঘ ও স্বপ্নীল সিল্ক',
      en: 'FBM Warped Horizon Silk',
    },
    summary: {
      bn: 'বহু-স্তরীয় ফ্র্যাক্টাল ব্রাউনিয়ান গতিতে বয়ে চলা সন্ধ্যার মেঘ ও নরম বুনন।',
      en: 'Multi-octave domain-warped FBM folds weaving flowing monsoon silk currents.',
    },
    poemSlug: 'shopnil-jogote',
    poemTitleBn: 'স্বপ্নীল জগতে',
    poemCoupleLineBn: 'তুমি আমার রূপকথার জগতের এক নীল প্রজাপতি,,',
    defaultSpeed: 0.95,
    defaultIntensity: 0.7,
    defaultScale: 1.1,
  },
  {
    id: 'crt-chromatic',
    indexLabel: { bn: '০৫', en: '05' },
    engine: 'glsl-crt',
    techniqueLabel: {
      bn: 'GLSL পোস্ট-প্রসেস · স্ক্যানলাইন ও ক্রোমা',
      en: 'Custom GLSL · CRT Scanline & RGB Split',
    },
    tabLabel: {
      bn: 'সিআরটি বর্ণালী',
      en: 'CRT Scanlines',
    },
    title: {
      bn: 'সিআরটি স্ক্যানলাইন ও বর্ণালী',
      en: 'CRT Scanline & Chromatic Field',
    },
    summary: {
      bn: 'পুরোনো ক্যাথোড-রে পর্দার বক্রতা, অনুভূমিক স্ক্যানলাইন ও আলোর বর্ণালী বিভাজন।',
      en: 'Barrel-curved phosphor scanlines, RGB chromatic dispersion, and archival signal drift.',
    },
    poemSlug: 'bastobotar-lorai',
    poemTitleBn: 'বাস্তবতার লড়াই',
    poemCoupleLineBn: 'হারানো কিছু প্রাপ্তি-সুখ,, হারানো কিছু মধুর স্মৃতি,,',
    defaultSpeed: 1.05,
    defaultIntensity: 0.75,
    defaultScale: 1.0,
  },
  {
    id: 'neuro-smoke',
    indexLabel: { bn: '০৬', en: '06' },
    engine: 'paper-neuro',
    techniqueLabel: {
      bn: 'GPU নিউরো-নয়েজ · আলোকতন্তু',
      en: 'Paper Shader · NeuroNoise Currents',
    },
    tabLabel: {
      bn: 'স্নায়ু-আলোক',
      en: 'NeuroNoise Web',
    },
    title: {
      bn: 'ভোরের শিশির ও স্নায়ু-আলোক',
      en: 'NeuroNoise Luminous Filaments',
    },
    summary: {
      bn: 'জৈবিক আলোর সূক্ষ্ম তন্তু ও ভোরের কুয়াশার ভেতর দিয়ে বয়ে চলা নীরব প্রবাহ।',
      en: 'Bioluminescent ridge noise veins pulsing softly across dew-toned twilight.',
    },
    poemSlug: 'bhalo-thaka',
    poemTitleBn: 'ভালো থাকা বললেই কি ভালো থাকা যায়??',
    poemCoupleLineBn: 'ভোরের শিশির ভেজা ঘাসের ওপর পা ভিজানো লাগে!!',
    defaultSpeed: 0.85,
    defaultIntensity: 0.68,
    defaultScale: 1.2,
  },
];

export function clampShaderUniform(
  value: number,
  min: number,
  max: number,
  fallback: number
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [0.22, 0.26, 0.34];
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [
    Number(r.toFixed(4)),
    Number(g.toFixed(4)),
    Number(b.toFixed(4)),
  ];
}

export function getShaderExhibitById(id: string): ShaderExhibit {
  return (
    SHADER_EXHIBITS.find((item) => item.id === id) ?? SHADER_EXHIBITS[0]
  );
}

export function getShaderPaletteById(id: string): ShaderPalettePreset {
  return SHADER_PALETTES.find((p) => p.id === id) ?? SHADER_PALETTES[0];
}

export function formatUniformMetric(
  value: number,
  suffix: string,
  lang: SiteLang
): string {
  const formatted = suffix === '%' ? `${Math.round(value * 100)}%` : `${value.toFixed(1)}${suffix}`;
  if (lang === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return formatted.replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
  }
  return formatted;
}
