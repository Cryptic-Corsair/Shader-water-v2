import { getFeaturedPoems, type PoemMeta } from '../../data/poemsCatalog';

export function getFeaturedTodayPoem(date: Date = new Date()): PoemMeta {
  const featured = getFeaturedPoems();
  if (featured.length === 0) {
    throw new Error('No featured poems available in catalog.');
  }
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % featured.length;
  return featured[index];
}

export const HERO_STANZA: [string, string] = [
  'তুমি আমার বর্ষার প্রথম বৃষ্টি,, শ্রাবণ সন্ধ্যা,,',
  'গোধূলির ছায়া,, রক্তিম সূর্যাস্ত।।',
];
