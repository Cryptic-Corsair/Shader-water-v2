export interface BilingualText {
  bn: string;
  en: string;
}

export interface AuthorBioBeat {
  id: string;
  label: BilingualText;
  paragraph: BilingualText;
  callout: BilingualText;
  motifTitle: BilingualText;
}

export interface PoeticLedgerEntry {
  id: string;
  yearLabel: BilingualText;
  sortKey: number;
  kind: 'cycle' | 'poem' | 'note';
  kindLabel: BilingualText;
  title: string;
  citation: BilingualText;
  location: BilingualText;
  upcoming: boolean;
}

export const AUTHOR_PROFILE = {
  name: {
    bn: 'অনন্যা হাসান',
    en: 'Ananya Hasan',
  },
  contactEmail: 'contact@ananyahasan.com',
  archiveEdition: {
    bn: '২০২৩–২০২৪ কবিতার খাতা',
    en: '2023–2024 Poetry Notebook',
  },
  portraitCaption: {
    bn: 'অনন্যা হাসান · ব্যক্তিগত সংকলন',
    en: 'Ananya Hasan · Collected Notebook',
  },
  portraitSubcaption: {
    bn: 'গোধূলি ও বৃষ্টি',
    en: 'Dusk & Rain',
  },
  headline: {
    bn: 'অনুভূতি, প্রকৃতি ও বাস্তবতার সংলাপ',
    en: 'Dialogue of feeling, monsoon light, and unmasked truth',
  },
  statement: {
    bn: 'অনন্যা হাসানের কবিতাগুলো ২০২৩ সালের ডিসেম্বর থেকে ২০২৪ সালের ফেব্রুয়ারি পর্যন্ত লেখা ব্যক্তিগত অনুভবের খাতা থেকে সংকলিত—যেখানে মুখোশের আড়ালের মানুষ চেনার দায়, শ্রাবণ সন্ধ্যা, পূর্ণিমার চাঁদ ও প্রতীক্ষার দীর্ঘশ্বাস সহজ অথচ তীক্ষ্ণ ভাষায় ধরা পড়েছে।',
    en: 'Gathered from poems written between December 2023 and February 2024, Ananya Hasan’s verse moves between social reckoning behind hidden masks and luminous scenes of monsoon evenings, full moons, and unguarded longing.',
  },
  pullQuote: {
    bn: 'বর্ষার প্রথম বৃষ্টি, শ্রাবণ সন্ধ্যা আর গোধূলির ছায়ায় জমে থাকা কথাগুলোই এই সংকলনের আশ্রয়।',
    en: 'In first monsoon rain, Shrabon dusk, and quiet skyward longing, these verses keep what spoken greetings often hide.',
  },
  pullQuoteAttribution: {
    bn: 'সংকলন নোট · ২০২৩–২০২৪',
    en: 'Notebook Note · 2023–2024',
  },
  bioPlaceholderNote: {
    bn: 'এই অংশে কবির সংক্ষিপ্ত পরিচিতি ও জীবনবৃত্তান্ত পরবর্তীতে যুক্ত বা সম্পাদনা করা যাবে।',
    en: 'Editable biographical note slot — ready for the poet’s own studio notes and personal background.',
  },
} as const;

export const AUTHOR_BIO_BEATS: readonly AuthorBioBeat[] = [
  {
    id: 'beat-1',
    label: {
      bn: '০১ · মুখোশ ও বাস্তবতা',
      en: '01 · Masks & Reality',
    },
    paragraph: {
      bn: '২০২৩ সালের ডিসেম্বরে লেখা “মুখোশের অন্তরালে” থেকে ২০২৪-এর জানুয়ারির “বাস্তবতার লড়াই”—এই কবিতাগুলোতে মানুষ চেনার কঠিন অভিজ্ঞতা, স্বার্থের সংঘাত এবং একাকীত্বের দীর্ঘশ্বাস কোনো অলংকার ছাড়া সরাসরি উচ্চারিত হয়েছে।',
      en: 'From December 2023’s “Mukhosher Antarale” to “Bastobotar Lorai” in January 2024, these poems confront social artifice, self-interest, and solitary endurance in direct, unembellished Bengali verse.',
    },
    callout: {
      bn: '“উপরে এক ভিতরে আরেক—মুখোশের অন্তরালে ঠিক যেন ঢাকা পড়ে যায়।”',
      en: 'Rooted in “মুখোশের অন্তরালে” (13/12/2023) and “বাস্তবতার লড়াই” (31 Jan).',
    },
    motifTitle: {
      bn: 'বাস্তবতার দর্পণ',
      en: 'Mirror of Reality',
    },
  },
  {
    id: 'beat-2',
    label: {
      bn: '০২ · গোধূলি ও নীল আকাশ',
      en: '02 · Twilight & Dream Sky',
    },
    paragraph: {
      bn: 'জানুয়ারির শেষ সপ্তাহ থেকে ফেব্রুয়ারির শুরুতে লেখা “তোমার ‘তুমি’ হবো”, “তুমি আমার”, “শুধুই তুমি” এবং “স্বপ্নীল জগতে” কবিতায় আকাশ, সাদা মেঘ, কদম-বকুল, রক্তিম সূর্যাস্ত ও নীল প্রজাপতির রূপকে ভালোবাসার বিশালতা আঁকা হয়েছে।',
      en: 'Written across late January and early February 2024, “Tomar ‘Tumi’ Hobo”, “Tumi Amar”, “Shudhui Tumi”, and “Shopnil Jogote” weave rain-wet kodom blooms, Shrabon twilight, full moons, and blue butterflies into an expansive sky.',
    },
    callout: {
      bn: 'বৃষ্টি ভেজা কদম ফুল, শ্রাবণ সন্ধ্যা আর জোছনা ভরা রাতের অনুষঙ্গ।',
      en: 'Monsoon dusk, bokul fragrance, and starlit silence from the January–February 2024 sequence.',
    },
    motifTitle: {
      bn: 'গোধূলির দিগন্ত',
      en: 'Twilight Horizon',
    },
  },
  {
    id: 'beat-3',
    label: {
      bn: '০৩ · অনুভব, শুভেচ্ছা ও প্রতীক্ষা',
      en: '03 · Longing & Dawn',
    },
    paragraph: {
      bn: 'নববর্ষের প্রত্যাশা (“শুভেচ্ছা”), সততা ও সম্মানের আশ্রয় (“ভালোবাসার অধ্যায়”), না-বলা আকাঙ্ক্ষা (“পূর্ণতা”) এবং “ভালো থাকা বললেই কি ভালো থাকা যায়??” প্রশ্নের ভেতর দিয়ে সংকলনটি আত্মজিজ্ঞাসায় এসে থামে।',
      en: 'Moving through the New Year greeting of “Shubheccha”, quiet devotion in “Bhalobashar Adhyay” and “Purnota”, and the candid closing question of 2 February, the notebook ends with everyday honesty.',
    },
    callout: {
      bn: 'লেখকের ব্যক্তিগত তথ্য ও বিস্তারিত পরিচিতি এখানে সহজেই হালনাগাদযোগ্য।',
      en: 'Poet biographical details remain cleanly modular and ready for future personal updates.',
    },
    motifTitle: {
      bn: 'ভোরের প্রতীক্ষা',
      en: 'Morning Dew & Dawn',
    },
  },
] as const;

export const POET_TIMELINE_MILESTONES: readonly PoeticLedgerEntry[] = [
  {
    id: 'ms-feb-02',
    yearLabel: { bn: '২ ফেব্রুয়ারি ২০২৪', en: '02 Feb 2024' },
    sortKey: 20240202,
    kind: 'poem',
    kindLabel: { bn: 'সমাপনী প্রশ্ন', en: 'Closing Verse' },
    title: 'ভালো থাকা বললেই কি ভালো থাকা যায়??',
    citation: {
      bn: 'অনুভব ও শুভেচ্ছা — দৈনন্দিন হাসির আড়ালের সত্য, চা ও গোধূলি সন্ধ্যার প্রার্থনা।',
      en: 'From Longing & Dawn — questioning routine greetings beside monsoon tea and twilight walks.',
    },
    location: { bn: 'সংকলন নং ১০', en: 'Poem 010' },
    upcoming: true,
  },
  {
    id: 'ms-feb-01',
    yearLabel: { bn: '১ ফেব্রুয়ারি ২০২৪', en: '01 Feb 2024' },
    sortKey: 20240201,
    kind: 'poem',
    kindLabel: { bn: 'গোধূলি ও স্বপ্নীল আকাশ', en: 'Twilight & Dream Sky' },
    title: 'স্বপ্নীল জগতে',
    citation: {
      bn: 'নীল প্রজাপতির ডানায় ভর করে কল্পনার আকাশ পাড়ি দেয়ার কবিতা।',
      en: 'A flight across imagined skies on the wings of a blue butterfly.',
    },
    location: { bn: 'সংকলন নং ০৯', en: 'Poem 009' },
    upcoming: false,
  },
  {
    id: 'ms-jan-31',
    yearLabel: { bn: '৩১ জানুয়ারি ২০২৪', en: '31 Jan 2024' },
    sortKey: 20240131,
    kind: 'poem',
    kindLabel: { bn: 'মুখোশ ও বাস্তবতার লড়াই', en: 'Masks & Reality' },
    title: 'বাস্তবতার লড়াই',
    citation: {
      bn: 'নিঃসঙ্গতা, বেদনার নীল রং ও মানবিক বিবেকের সংকটের তীব্র দলিল।',
      en: 'Confronting loneliness, unseen grief, and the relentless trial of reality.',
    },
    location: { bn: 'সংকলন নং ০৮', en: 'Poem 008' },
    upcoming: false,
  },
  {
    id: 'ms-jan-30',
    yearLabel: { bn: '৩০ জানুয়ারি ২০২৪', en: '30 Jan 2024' },
    sortKey: 20240130,
    kind: 'poem',
    kindLabel: { bn: 'গোধূলি ও স্বপ্নীল আকাশ', en: 'Twilight & Dream Sky' },
    title: 'শুধুই তুমি',
    citation: {
      bn: 'সমুদ্র, সৈকত, আকাশ ও বাতাসের প্রতিটি অস্তিত্বে একই নামের উচ্চারণ।',
      en: 'Eight couplets tracing sea, shore, sun, moon, and breath to a single presence.',
    },
    location: { bn: 'সংকলন নং ০৭', en: 'Poem 007' },
    upcoming: false,
  },
  {
    id: 'ms-jan-28b',
    yearLabel: { bn: '২৮ জানুয়ারি ২০২৪', en: '28 Jan 2024' },
    sortKey: 20240128,
    kind: 'poem',
    kindLabel: { bn: 'গোধূলি ও স্বপ্নীল আকাশ', en: 'Twilight & Dream Sky' },
    title: 'তুমি আমার & পূর্ণতা',
    citation: {
      bn: 'একই দিনে রচিত দুটি বিপরীতমুখী অনুভব—বর্ষার প্রথম বৃষ্টি ও নীরব প্রতীক্ষার প্রার্থনা।',
      en: 'Paired 28 January works balancing Shrabon rain and unvoiced wishes.',
    },
    location: { bn: 'সংকলন নং ০৫–০৬', en: 'Poems 005–006' },
    upcoming: false,
  },
  {
    id: 'ms-jan-27',
    yearLabel: { bn: '২৭ জানুয়ারি ২০২৪', en: '27 Jan 2024' },
    sortKey: 20240127,
    kind: 'poem',
    kindLabel: { bn: 'গোধূলি ও স্বপ্নীল আকাশ', en: 'Twilight & Dream Sky' },
    title: 'তোমার "তুমি" হবো',
    citation: {
      bn: 'অলস দুপুর, রংধনু, পূর্ণিমার চাঁদ ও ছায়া হয়ে পাশে থাকার প্রতিশ্রুতি।',
      en: 'Becoming shadow, rainbow, afternoon warmth, and moonlit stillness.',
    },
    location: { bn: 'সংকলন নং ০৪', en: 'Poem 004' },
    upcoming: false,
  },
  {
    id: 'ms-jan-25',
    yearLabel: { bn: '২৫ জানুয়ারি ২০২৪', en: '25 Jan 2024' },
    sortKey: 20240125,
    kind: 'poem',
    kindLabel: { bn: 'অনুভব ও শুভেচ্ছা', en: 'Longing & Dawn' },
    title: 'ভালোবাসার অধ্যায়',
    citation: {
      bn: 'সততা, সম্মান ও বিশ্বাসের চাদরে মোড়া এক প্রশান্ত অধ্যায়ের সূচনা।',
      en: 'Five meditative verses anchored in honesty, dignity, and mutual trust.',
    },
    location: { bn: 'সংকলন নং ০৩', en: 'Poem 003' },
    upcoming: false,
  },
  {
    id: 'ms-dec-13',
    yearLabel: { bn: '১৩/১২/২০২৩', en: '13 Dec 2023' },
    sortKey: 20231213,
    kind: 'poem',
    kindLabel: { bn: 'প্রথম তারিখযুক্ত রচনা', en: 'Earliest Dated Poem' },
    title: 'মুখোশের অন্তরালে',
    citation: {
      bn: 'মুখোশ ও বাস্তবতার লড়াই পর্বের সূচনা—স্বার্থপরতা ও ছলনার বিরুদ্ধে নির্মোহ পর্যবেক্ষণ।',
      en: 'Opens the Masks & Reality cycle with sharp observation on hidden motives.',
    },
    location: { bn: 'সংকলন নং ০১', en: 'Poem 001' },
    upcoming: false,
  },
] as const;
