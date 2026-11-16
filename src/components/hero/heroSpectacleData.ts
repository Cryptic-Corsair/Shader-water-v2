import type { SiteLang } from '../../context/LanguageContext';
import { getPoemMetaBySlug, type CycleId } from '../../data/poemsCatalog';
import { getPoemOpeningStanza } from '../../data/poemsContent';

export interface HeroFolioItem {
  id: string;
  indexLabelBn: string;
  indexLabelEn: string;
  slug: string;
  collection: CycleId;
  shortLabelBn: string;
  shortLabelEn: string;
  titleBn: string;
  dateBn: string;
  dateEn: string;
  stanza: [string, string];
  noteBn: string;
  noteEn: string;
  coordinates: string;
}

const HERO_FOLIO_SPECS: Array<{
  id: string;
  indexLabelBn: string;
  indexLabelEn: string;
  slug: string;
  shortLabelBn: string;
  shortLabelEn: string;
  dateEn: string;
  stanza: [string, string];
  noteBn: string;
  noteEn: string;
  coordinates: string;
}> = [
  {
    id: 'folio-monsoon',
    indexLabelBn: '০১',
    indexLabelEn: '01',
    slug: 'tumi-amar',
    shortLabelBn: 'বর্ষার প্রথম বৃষ্টি',
    shortLabelEn: 'First Monsoon Rain',
    dateEn: '28 Jan 2024',
    stanza: [
      'তুমি আমার বর্ষার প্রথম বৃষ্টি,, শ্রাবণ সন্ধ্যা,,',
      'গোধূলির ছায়া,, রক্তিম সূর্যাস্ত।।',
    ],
    noteBn: 'শ্রাবণ সন্ধ্যা ও রক্তিম সূর্যাস্তের নীরব সংলাপ',
    noteEn: 'Quiet dialogue of Shrabon dusk and crimson sunset',
    coordinates: '২৩°৪৮′ উ · ৯০°২৪′ পূ',
  },
  {
    id: 'folio-masks',
    indexLabelBn: '০২',
    indexLabelEn: '02',
    slug: 'mukhosher-antarale',
    shortLabelBn: 'মুখোশের অন্তরালে',
    shortLabelEn: 'Behind the Mask',
    dateEn: '13 Dec 2023',
    stanza: [
      'উপরে এক ভিতরে আরেক----',
      'মুখোশের অন্তরালে ঠিক যেন ঢাকা পড়ে যায়।',
    ],
    noteBn: 'স্বার্থ ও অভিনয়ের পৃথিবীতে সত্য চেনার নির্মোহ পাঠ',
    noteEn: 'Unvarnished reckoning with outward masks and hidden truth',
    coordinates: '১৩/১২/২০২৩ · খাতা ০১',
  },
  {
    id: 'folio-dawn',
    indexLabelBn: '০৩',
    indexLabelEn: '03',
    slug: 'bhalo-thaka',
    shortLabelBn: 'ভোরের শিশির',
    shortLabelEn: 'Morning Dew',
    dateEn: '02 Feb 2024',
    stanza: [
      '♡ ভোরের শিশির ভেজা ঘাসের ওপর পা ভিজানো লাগে!!',
      '~☆~ ভালো থাকা বললেই কি ভালো থাকা যায়?? ~☆~',
    ],
    noteBn: 'ভোরের শিশির ও গোধূলি চায়ের আড্ডায় সহজ আত্মজিজ্ঞাসা',
    noteEn: 'Morning dew and twilight tea, closing with an honest question',
    coordinates: '০২/০২/২০২৪ · খাতা ১০',
  },
];

export function getHeroFolios(): HeroFolioItem[] {
  return HERO_FOLIO_SPECS.map((spec) => {
    const meta = getPoemMetaBySlug(spec.slug);
    const opening = getPoemOpeningStanza(spec.slug, 2);
    return {
      id: spec.id,
      indexLabelBn: spec.indexLabelBn,
      indexLabelEn: spec.indexLabelEn,
      slug: spec.slug,
      collection: meta?.collection ?? 'twilight-sky',
      shortLabelBn: spec.shortLabelBn,
      shortLabelEn: spec.shortLabelEn,
      titleBn: meta?.title ?? spec.shortLabelBn,
      dateBn: meta?.dateDisplay ?? '',
      dateEn: spec.dateEn,
      stanza:
        spec.stanza[0] && spec.stanza[1]
          ? spec.stanza
          : [opening[0] ?? '', opening[1] ?? ''],
      noteBn: spec.noteBn,
      noteEn: spec.noteEn,
      coordinates: spec.coordinates,
    };
  });
}

export function wrapFolioIndex(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return ((Math.round(index) % total) + total) % total;
}

export function computeHorizonTilt(normX: number, normY: number): {
  rotateYDeg: number;
  rotateXDeg: number;
  glintPercentX: number;
  glintPercentY: number;
} {
  const cx = Number.isFinite(normX) ? Math.max(-0.5, Math.min(0.5, normX)) : 0;
  const cy = Number.isFinite(normY) ? Math.max(-0.5, Math.min(0.5, normY)) : 0;
  return {
    rotateYDeg: Number((cx * 9).toFixed(2)),
    rotateXDeg: Number((-cy * 8).toFixed(2)),
    glintPercentX: Number((50 + cx * 36).toFixed(1)),
    glintPercentY: Number((42 + cy * 32).toFixed(1)),
  };
}

export function formatFolioLabel(item: HeroFolioItem, lang: SiteLang): string {
  return lang === 'bn'
    ? `${item.indexLabelBn} · ${item.shortLabelBn}`
    : `${item.indexLabelEn} · ${item.shortLabelEn}`;
}
