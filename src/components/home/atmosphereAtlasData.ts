import type { SiteLang } from '../../context/LanguageContext';
import { POEMS_CATALOG, type CycleId } from '../../data/poemsCatalog';

export interface AtmosphereRealm {
  id: string;
  indexLabelBn: string;
  indexLabelEn: string;
  titleBn: string;
  titleEn: string;
  seasonBn: string;
  seasonEn: string;
  descriptionBn: string;
  descriptionEn: string;
  poemSlug: string;
  poemTitle: string;
  cycleId: CycleId;
  verseLines: readonly [string, string, string];
  motifsBn: readonly string[];
  motifsEn: readonly string[];
  palette: {
    backdropGradient: string;
    veilTint: string;
    waterColorBack: string;
    waterColorHighlight: string;
    accentHex: string;
    mistHex: string;
    swatchPair: [string, string];
    orbProgress: number;
  };
}

export const ATMOSPHERE_REALMS: readonly AtmosphereRealm[] = [
  {
    id: 'shrabon-indigo',
    indexLabelBn: '০১',
    indexLabelEn: '01',
    titleBn: 'শ্রাবণ গোধূলি ও বৃষ্টি',
    titleEn: 'Shrabon Rain & Indigo Dusk',
    seasonBn: 'সন্ধ্যা · বর্ষা ও কদম',
    seasonEn: 'Monsoon Dusk · River Mist',
    descriptionBn:
      'আষাঢ়-শ্রাবণের প্রথম বৃষ্টির ফোঁটায় ভিজে ওঠা নীল দিগন্ত, বকুল-কদমের গন্ধ আর নীরব সন্ধ্যার গভীর নীলচে আবহ।',
    descriptionEn:
      'Deep sapphire rainlight settling over Shrabon evenings, wet kodom blossoms, and moonlit stillness along the river.',
    poemSlug: 'tumi-amar',
    poemTitle: 'তুমি আমার',
    cycleId: 'twilight-sky',
    verseLines: [
      'তুমি আমার মেঘলা আকাশ,, ঝিরিঝিরি বাতাস,,',
      'তুমি আমার বর্ষার প্রথম বৃষ্টি,, শ্রাবণ সন্ধ্যা,,',
      'গোধূলির ছায়া,, রক্তিম সূর্যাস্ত।।',
    ],
    motifsBn: ['বর্ষা', 'কদম ফুল', 'শ্রাবণ সন্ধ্যা'],
    motifsEn: ['Monsoon Rain', 'Kodom Blooms', 'Shrabon Dusk'],
    palette: {
      backdropGradient:
        'radial-gradient(84% 72% at 24% 22%, rgba(143, 180, 217, 0.34) 0%, transparent 62%), radial-gradient(76% 68% at 82% 76%, rgba(56, 86, 134, 0.56) 0%, transparent 64%), linear-gradient(164deg, #162238 0%, #243757 48%, #2E456B 82%, #19253D 100%)',
      veilTint:
        'radial-gradient(74% 66% at 72% 28%, rgba(143, 180, 217, 0.24) 0%, transparent 65%), radial-gradient(78% 72% at 18% 82%, rgba(44, 72, 118, 0.44) 0%, transparent 68%)',
      waterColorBack: '#152136',
      waterColorHighlight: '#9FC5E8',
      accentHex: '#9FC5E8',
      mistHex: '#C5DCF2',
      swatchPair: ['#243757', '#9FC5E8'],
      orbProgress: 0.18,
    },
  },
  {
    id: 'charcoal-mask',
    indexLabelBn: '০২',
    indexLabelEn: '02',
    titleBn: 'মুখোশ ও ধূসর দর্পণ',
    titleEn: 'Charcoal Mirror & Hidden Truth',
    seasonBn: 'মধ্যরাত · বাস্তবতার মঞ্চ',
    seasonEn: 'Midnight · Unmasked Stage',
    descriptionBn:
      'অভিনয়, স্বার্থ আর মুখোশের আড়ালে লুকিয়ে থাকা কঠিন বাস্তবতার মুখোমুখি হওয়া গাঢ় অবসিডিয়ান ও ধূসর-তাম্র আবহ।',
    descriptionEn:
      'Smoky obsidian shadow and burnished pewter reflecting social artifice, quiet endurance, and unvarnished candor.',
    poemSlug: 'mukhosher-antarale',
    poemTitle: 'মুখোশের অন্তরালে',
    cycleId: 'masks-reality',
    verseLines: [
      'এই দুনিয়ায় হায়! মানুষ চেনা দায়!',
      'কেউ বা আবার মুখোশ এর উপর মুখোশ পরে বেড়ায়,',
      'মুখোশের অন্তরালে ঠিক যেন ঢাকা পড়ে যায়।',
    ],
    motifsBn: ['মুখোশ', 'বাস্তবতা', 'নির্মোহ সত্য'],
    motifsEn: ['Masks', 'Reckoning', 'Solitude'],
    palette: {
      backdropGradient:
        'radial-gradient(82% 70% at 76% 24%, rgba(212, 152, 134, 0.28) 0%, transparent 60%), radial-gradient(78% 72% at 20% 76%, rgba(62, 46, 48, 0.62) 0%, transparent 65%), linear-gradient(166deg, #181417 0%, #2C2225 48%, #3B2D30 82%, #1C1719 100%)',
      veilTint:
        'radial-gradient(72% 62% at 78% 24%, rgba(212, 152, 134, 0.22) 0%, transparent 64%), radial-gradient(80% 74% at 16% 84%, rgba(56, 38, 42, 0.48) 0%, transparent 68%)',
      waterColorBack: '#1B1618',
      waterColorHighlight: '#DCA491',
      accentHex: '#E4B19C',
      mistHex: '#CBB7B0',
      swatchPair: ['#2C2225', '#E4B19C'],
      orbProgress: 0.44,
    },
  },
  {
    id: 'sandstone-ember',
    indexLabelBn: '০৩',
    indexLabelEn: '03',
    titleBn: 'সোনালি রোদ ও রংধনু দিগন্ত',
    titleEn: 'Sandstone Sunset & Rainbow Horizon',
    seasonBn: 'অপরাহ্ণ · উষ্ণ সূর্যাস্ত',
    seasonEn: 'Late Afternoon · Warm Amber',
    descriptionBn:
      'অলস দুপুরের মিষ্টি রোদ, সাদা মেঘ আর রংধনুর রঙে আকাশ রাঙিয়ে দেয়ার উষ্ণ বেলেপাথর ও সোনালি গোধূলি।',
    descriptionEn:
      'Warm terracotta dusk and liquid sunset gold echoing lazy afternoon sunlight, drifting clouds, and rainbow promise.',
    poemSlug: 'tomar-tumi-hobo',
    poemTitle: 'তোমার "তুমি" হবো',
    cycleId: 'twilight-sky',
    verseLines: [
      'আমি তোমার মনে জমে থাকা সাদা মেঘ হব,',
      'তোমার পুরো আকাশ রংধনুর রঙে রাঙিয়ে দিব।',
      'আমি তোমার অলস দুপুর হব, মিষ্টি রোদে তোমায় দেবো ছুঁয়ে।',
    ],
    motifsBn: ['মিষ্টি রোদ', 'রংধনু', 'সাদা মেঘ'],
    motifsEn: ['Sunlight', 'Rainbow Sky', 'White Clouds'],
    palette: {
      backdropGradient:
        'radial-gradient(86% 72% at 28% 22%, rgba(241, 207, 160, 0.34) 0%, transparent 60%), radial-gradient(76% 66% at 82% 74%, rgba(128, 86, 62, 0.56) 0%, transparent 64%), linear-gradient(162deg, #322119 0%, #4C3326 48%, #634433 82%, #3B271E 100%)',
      veilTint:
        'radial-gradient(76% 64% at 74% 30%, rgba(241, 207, 160, 0.25) 0%, transparent 64%), radial-gradient(78% 72% at 20% 80%, rgba(104, 68, 48, 0.46) 0%, transparent 68%)',
      waterColorBack: '#2E1F18',
      waterColorHighlight: '#F1CFA0',
      accentHex: '#F1CFA0',
      mistHex: '#EAD7C0',
      swatchPair: ['#4C3326', '#F1CFA0'],
      orbProgress: 0.7,
    },
  },
  {
    id: 'dawn-frost',
    indexLabelBn: '০৪',
    indexLabelEn: '04',
    titleBn: 'ভোরের শিশির ও স্নিগ্ধ আকাশ',
    titleEn: 'Morning Dew & Seafoam Dawn',
    seasonBn: 'ভোর · শিশির ও চা',
    seasonEn: 'Daybreak · Dew & Quiet Tea',
    descriptionBn:
      'ভোরের শিশির ভেজা ঘাস, পাখির গান আর প্রশান্ত ভোরের বাতাসে মিশে থাকা স্নিগ্ধ সবুজাভ-নীল ভোরের আলো।',
    descriptionEn:
      'Cool seafoam dawn light over dew-wet grass, morning birdsong, and the quiet honesty of early tea.',
    poemSlug: 'bhalo-thaka',
    poemTitle: 'ভালো থাকা বললেই কি ভালো থাকা যায়??',
    cycleId: 'longing-dawn',
    verseLines: [
      '♡ ভোরের শিশির ভেজা ঘাসের ওপর পা ভিজানো লাগে!!',
      '♡ বিকেলের মৃদু হাওয়ায় একসাথে বসে গল্প -চা য়ের আড্ডা দেয়া লাগে!!',
      '~☆~ ভালো থাকা বললেই কি ভালো থাকা যায়?? ~☆~',
    ],
    motifsBn: ['ভোরের শিশির', 'নীল আকাশ', 'আত্মজিজ্ঞাসা'],
    motifsEn: ['Morning Dew', 'Open Sky', 'Honest Joy'],
    palette: {
      backdropGradient:
        'radial-gradient(84% 70% at 74% 20%, rgba(171, 218, 208, 0.32) 0%, transparent 60%), radial-gradient(76% 68% at 22% 76%, rgba(44, 88, 92, 0.56) 0%, transparent 64%), linear-gradient(166deg, #162E34 0%, #24474E 48%, #305C62 82%, #1B373D 100%)',
      veilTint:
        'radial-gradient(74% 64% at 70% 28%, rgba(171, 218, 208, 0.24) 0%, transparent 64%), radial-gradient(78% 70% at 18% 82%, rgba(36, 74, 80, 0.44) 0%, transparent 68%)',
      waterColorBack: '#152B31',
      waterColorHighlight: '#B6E3D7',
      accentHex: '#B6E3D7',
      mistHex: '#DCECE7',
      swatchPair: ['#24474E', '#B6E3D7'],
      orbProgress: 0.92,
    },
  },
];

export function getAtmosphereRealms(): readonly AtmosphereRealm[] {
  return ATMOSPHERE_REALMS;
}

export function mapProgressToRealmIndex(
  progress: number,
  total: number = ATMOSPHERE_REALMS.length
): number {
  if (!Number.isFinite(progress) || total <= 0) return 0;
  const clamped = Math.max(0, Math.min(0.9999, progress));
  return Math.min(total - 1, Math.floor(clamped * total));
}

export function wrapRealmIndex(
  index: number,
  total: number = ATMOSPHERE_REALMS.length
): number {
  if (!Number.isFinite(index) || total <= 0) return 0;
  return ((Math.round(index) % total) + total) % total;
}

export function resolveRealmPoemMeta(realm: AtmosphereRealm) {
  return POEMS_CATALOG.find((poem) => poem.slug === realm.poemSlug) ?? POEMS_CATALOG[0];
}

export function getRealmLocalizedFields(realm: AtmosphereRealm, lang: SiteLang) {
  return {
    indexLabel: lang === 'bn' ? realm.indexLabelBn : realm.indexLabelEn,
    title: lang === 'bn' ? realm.titleBn : realm.titleEn,
    season: lang === 'bn' ? realm.seasonBn : realm.seasonEn,
    description: lang === 'bn' ? realm.descriptionBn : realm.descriptionEn,
    motifs: lang === 'bn' ? realm.motifsBn : realm.motifsEn,
  };
}
