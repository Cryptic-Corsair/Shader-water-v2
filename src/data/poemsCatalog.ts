import type { SiteLang } from '../context/LanguageContext';

export type CycleId = 'twilight-sky' | 'masks-reality' | 'longing-dawn';
export type CollectionName = CycleId;

export interface CycleMeta {
  id: CycleId;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  yearsBn: string;
  yearsEn: string;
  couplet: [string, string];
  horizonColors: [string, string, string];
  waveAmplitude: number;
  wavePhase: number;
}

export const POEM_CYCLES: Record<CycleId, CycleMeta> = {
  'twilight-sky': {
    id: 'twilight-sky',
    nameBn: 'গোধূলি ও স্বপ্নীল আকাশ',
    nameEn: 'Twilight & Dream Sky',
    taglineBn: 'গোধূলি, জোছনা, বৃষ্টি ও কল্পনার নীল দিগন্ত।',
    taglineEn: 'Dusk horizons, moonlight, monsoon rain, and imagined skies.',
    yearsBn: 'জানুয়ারি – ফেব্রুয়ারি ২০২৪',
    yearsEn: 'Jan – Feb 2024',
    couplet: [
      'তুমি আমার বর্ষার প্রথম বৃষ্টি,, শ্রাবণ সন্ধ্যা,,',
      'গোধূলির ছায়া,, রক্তিম সূর্যাস্ত।।',
    ],
    horizonColors: ['#3B4656', '#728092', '#B2C2D4'],
    waveAmplitude: 16,
    wavePhase: 0.9,
  },
  'masks-reality': {
    id: 'masks-reality',
    nameBn: 'মুখোশ ও বাস্তবতার লড়াই',
    nameEn: 'Masks & Reality',
    taglineBn: 'মুখোশের আড়াল, স্বার্থের সংঘাত ও একাকী বাস্তবতা।',
    taglineEn: 'Hidden masks, human artifice, and solitary reckoning.',
    yearsBn: 'ডিসেম্বর ২০২৩ – জানুয়ারি ২০২৪',
    yearsEn: 'Dec 2023 – Jan 2024',
    couplet: [
      'বুঝার নেই যে কোন সহজ উপায়---',
      'মুখোশের অন্তরালে ঠিক যেন ঢাকা পড়ে যায়।',
    ],
    horizonColors: ['#4E4844', '#8A7E74', '#DFBC91'],
    waveAmplitude: 21,
    wavePhase: 0.4,
  },
  'longing-dawn': {
    id: 'longing-dawn',
    nameBn: 'অনুভব ও শুভেচ্ছা',
    nameEn: 'Longing & Dawn',
    taglineBn: 'ভালোবাসার আশ্রয়, পূর্ণতার প্রার্থনা ও ভোরের প্রত্যাশা।',
    taglineEn: 'Sanctuary in love, quiet longing, and new dawn wishes.',
    yearsBn: 'নববর্ষ – ফেব্রুয়ারি ২০২৪',
    yearsEn: 'New Year – Feb 2024',
    couplet: [
      'নতুন বছরের নতুন সূর্য,',
      'বয়ে আনুক খুশির ছন্দ।',
    ],
    horizonColors: ['#59524E', '#978C84', '#EDE7DD'],
    waveAmplitude: 18,
    wavePhase: 2.1,
  },
};

export interface PoemMeta {
  id: string;
  slug: string;
  title: string;
  collection: CycleId;
  dateDisplay: string;
  year: number;
  themes: string[];
  searchKeywords: string[];
  firstLine: string;
  readingSeconds: number;
  featured: boolean;
  order: number;
  moodColors: [string, string, string];
}

export interface MarginaliaNote {
  lineHint: string;
  note: string;
}

export interface PoemFull extends PoemMeta {
  epigraph?: string;
  stanzas: string[][];
  marginalia?: MarginaliaNote[];
}

export const POEMS_CATALOG: PoemMeta[] = [
  {
    id: 'poem-001',
    slug: 'mukhosher-antarale',
    title: 'মুখোশের অন্তরালে',
    collection: 'masks-reality',
    dateDisplay: '১৩/১২/২০২৩',
    year: 2023,
    themes: ['মুখোশ', 'বাস্তবতা', 'স্বার্থ'],
    searchKeywords: [
      'mukhosher antarale',
      'mukhosh',
      'mask',
      'masks',
      'reality',
      'bastobota',
      'swartho',
      'hypocrisy',
      'december',
      '2023',
    ],
    firstLine: 'এই দুনিয়ায় হায়! মানুষ চেনা দায়!',
    readingSeconds: 95,
    featured: true,
    order: 1,
    moodColors: ['#363E4B', '#677180', '#DFBC91'],
  },
  {
    id: 'poem-002',
    slug: 'shubheccha',
    title: 'শুভেচ্ছা',
    collection: 'longing-dawn',
    dateDisplay: 'তারিখ অজানা',
    year: 2024,
    themes: ['নববর্ষ', 'আশা', 'আলো'],
    searchKeywords: [
      'shubheccha',
      'shubechha',
      'noboborsho',
      'new year',
      'greetings',
      'wish',
      'asha',
      'hope',
      'light',
      'alo',
      'boshonto',
      'spring',
    ],
    firstLine: 'নতুন বছরের নতুন সূর্য,',
    readingSeconds: 80,
    featured: false,
    order: 2,
    moodColors: ['#484F5A', '#8E827B', '#EDE7DD'],
  },
  {
    id: 'poem-003',
    slug: 'bhalobashar-adhyay',
    title: 'ভালোবাসার অধ্যায়',
    collection: 'longing-dawn',
    dateDisplay: '২৫ জানুয়ারি',
    year: 2024,
    themes: ['ভালোবাসা', 'বিশ্বাস', 'আশ্রয়'],
    searchKeywords: [
      'bhalobashar adhyay',
      'valobashar odhyay',
      'bhalobasha',
      'love',
      'trust',
      'bishwas',
      'honesty',
      'ashroy',
      'shelter',
      'january',
    ],
    firstLine: 'আমি এমন একটি ভালোবাসা বেছে নিয়েছি,',
    readingSeconds: 65,
    featured: true,
    order: 3,
    moodColors: ['#434954', '#8E827B', '#DFBC91'],
  },
  {
    id: 'poem-004',
    slug: 'tomar-tumi-hobo',
    title: 'তোমার "তুমি" হবো',
    collection: 'twilight-sky',
    dateDisplay: '২৭ জানুয়ারি',
    year: 2024,
    themes: ['আকাশ', 'চাঁদ', 'ভালোবাসা'],
    searchKeywords: [
      'tomar tumi hobo',
      'tumi',
      'akash',
      'sky',
      'chand',
      'moon',
      'rainbow',
      'rongdhonu',
      'bhalobasha',
      'love',
      'january',
    ],
    firstLine: 'আমি তোমার ভিতরের তুমি হব,',
    readingSeconds: 85,
    featured: true,
    order: 4,
    moodColors: ['#3A4452', '#707D8B', '#B2C2D4'],
  },
  {
    id: 'poem-005',
    slug: 'purnota',
    title: 'পূর্ণতা',
    collection: 'longing-dawn',
    dateDisplay: '২৮ জানুয়ারি',
    year: 2024,
    themes: ['পূর্ণতা', 'স্বপ্ন', 'প্রতীক্ষা'],
    searchKeywords: [
      'purnota',
      'purnata',
      'fulfillment',
      'dream',
      'shopno',
      'waiting',
      'protikkha',
      'hope',
      'longing',
      'january',
    ],
    firstLine: 'ভাবনাগুলো মনেই থাকুক!!',
    readingSeconds: 55,
    featured: false,
    order: 5,
    moodColors: ['#4A5260', '#8E827B', '#DFBC91'],
  },
  {
    id: 'poem-006',
    slug: 'tumi-amar',
    title: 'তুমি আমার',
    collection: 'twilight-sky',
    dateDisplay: '২৮ জানুয়ারি',
    year: 2024,
    themes: ['বৃষ্টি', 'গোধূলি', 'জোছনা'],
    searchKeywords: [
      'tumi amar',
      'monsoon',
      'rain',
      'brishti',
      'shrabon',
      'kodom',
      'bokul',
      'godhuli',
      'twilight',
      'jochona',
      'moonlight',
      'rainbow',
      'january',
    ],
    firstLine: 'তুমি আমার নীল আকাশের বিশালতা,,',
    readingSeconds: 70,
    featured: true,
    order: 6,
    moodColors: ['#363E4B', '#59687A', '#B2C2D4'],
  },
  {
    id: 'poem-007',
    slug: 'shudhui-tumi',
    title: 'শুধুই তুমি',
    collection: 'twilight-sky',
    dateDisplay: '৩০ জানুয়ারি',
    year: 2024,
    themes: ['সমুদ্র', 'আকাশ', 'অনুভূতি'],
    searchKeywords: [
      'shudhui tumi',
      'only you',
      'sea',
      'ocean',
      'shomudro',
      'sky',
      'akash',
      'sun',
      'moon',
      'anubhuti',
      'feeling',
      'january',
    ],
    firstLine: 'আমার জীবন ও তুমি,, আমার পৃথিবী ও তুমি,,',
    readingSeconds: 75,
    featured: false,
    order: 7,
    moodColors: ['#3C4654', '#5F6C7A', '#B2C2D4'],
  },
  {
    id: 'poem-008',
    slug: 'bastobotar-lorai',
    title: 'বাস্তবতার লড়াই',
    collection: 'masks-reality',
    dateDisplay: '৩১ জানুয়ারি',
    year: 2024,
    themes: ['বাস্তবতা', 'একাকীত্ব', 'সমাজ'],
    searchKeywords: [
      'bastobotar lorai',
      'bastobota',
      'reality',
      'struggle',
      'battle',
      'ekakitto',
      'loneliness',
      'society',
      'somaj',
      'tears',
      'january',
    ],
    firstLine: 'হারানো কিছু প্রাপ্তি-সুখ,, হারানো কিছু মধুর স্মৃতি,,',
    readingSeconds: 95,
    featured: true,
    order: 8,
    moodColors: ['#3A414E', '#766F6B', '#DFBC91'],
  },
  {
    id: 'poem-009',
    slug: 'shopnil-jogote',
    title: 'স্বপ্নীল জগতে',
    collection: 'twilight-sky',
    dateDisplay: '১ ফেব্রুয়ারি',
    year: 2024,
    themes: ['স্বপ্ন', 'প্রজাপতি', 'কল্পনা'],
    searchKeywords: [
      'shopnil jogote',
      'swapnil',
      'butterfly',
      'projapoti',
      'dream',
      'shopno',
      'imagination',
      'kolpona',
      'february',
    ],
    firstLine: 'তুমি আমার রূপকথার জগতের এক নীল প্রজাপতি,,',
    readingSeconds: 70,
    featured: false,
    order: 9,
    moodColors: ['#3B4654', '#677180', '#B2C2D4'],
  },
  {
    id: 'poem-010',
    slug: 'bhalo-thaka',
    title: 'ভালো থাকা বললেই কি ভালো থাকা যায়??',
    collection: 'longing-dawn',
    dateDisplay: '২ ফেব্রুয়ারি',
    year: 2024,
    themes: ['ভালো থাকা', 'বৃষ্টি', 'গোধূলি'],
    searchKeywords: [
      'bhalo thaka bollei ki bhalo thaka jay',
      'bhalo thaka',
      'valo thaka',
      'wellbeing',
      'rain',
      'brishti',
      'tea',
      'cha',
      'twilight',
      'godhuli',
      'dew',
      'february',
    ],
    firstLine: 'অনেক প্রতীক্ষার পর ~~~',
    readingSeconds: 100,
    featured: false,
    order: 10,
    moodColors: ['#45505E', '#8E827B', '#DFBC91'],
  },
];

export function getCollections(): CycleId[] {
  return ['twilight-sky', 'masks-reality', 'longing-dawn'];
}

export function isCycleId(value: string): value is CycleId {
  return (
    value === 'twilight-sky' ||
    value === 'masks-reality' ||
    value === 'longing-dawn'
  );
}

export function getCycleLabel(cycleId: CycleId, lang: SiteLang = 'bn'): string {
  const cycle = POEM_CYCLES[cycleId];
  return lang === 'bn' ? cycle.nameBn : cycle.nameEn;
}

export function getFeaturedPoems(): PoemMeta[] {
  return POEMS_CATALOG.filter((poem) => poem.featured).sort(
    (a, b) => a.order - b.order
  );
}

export function getPoemMetaBySlug(slug: string): PoemMeta | undefined {
  return POEMS_CATALOG.find((poem) => poem.slug === slug);
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

export function toBanglaNumerals(input: number | string): string {
  return String(input).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)] ?? digit);
}

export function formatArchiveIndex(order: number, lang: SiteLang = 'bn'): string {
  const padded = String(order).padStart(3, '0');
  return lang === 'bn' ? toBanglaNumerals(padded) : padded;
}

export function formatReadingTime(seconds: number, lang: SiteLang = 'bn'): string {
  if (seconds < 60) {
    return lang === 'bn' ? `${toBanglaNumerals(seconds)} সেকেন্ড` : `${seconds} sec`;
  }
  const minutes = Math.ceil(seconds / 60);
  return lang === 'bn'
    ? `${toBanglaNumerals(minutes)} মিনিট পাঠ`
    : `${minutes} min read`;
}
