import test from 'node:test';
import assert from 'node:assert/strict';
import { searchPoems } from './poemSearch';
import { parseMarkdownPoem } from '../utils/parseMarkdownPoem';
import { filterAndSortPoems, getAllThemes } from '../pages/archiveFilter';

test('searchPoems matches Bangla Unicode text and Banglish/English keywords', () => {
  const banglaTitleHit = searchPoems('মুখোশ');
  assert.ok(banglaTitleHit.ids.includes('poem-001'));

  const banglaBodyHit = searchPoems('বৃষ্টি');
  assert.ok(banglaBodyHit.ids.includes('poem-006'));
  assert.ok(banglaBodyHit.ids.includes('poem-010'));

  const banglaButterflyHit = searchPoems('প্রজাপতি');
  assert.ok(banglaButterflyHit.ids.includes('poem-009'));
  assert.ok(banglaButterflyHit.hitsById['poem-009']?.snippet?.includes('প্রজাপতি'));

  // Banglish and English search keyword support
  const banglishHit = searchPoems('mukhosher');
  assert.ok(banglishHit.ids.includes('poem-001'));

  const englishMaskHit = searchPoems('mask');
  assert.ok(englishMaskHit.ids.includes('poem-001'));

  const banglishTumiAmarHit = searchPoems('tumi amar');
  assert.ok(banglishTumiAmarHit.ids.includes('poem-006'));

  const englishButterflyHit = searchPoems('butterfly');
  assert.ok(englishButterflyHit.ids.includes('poem-009'));

  const monsoonHit = searchPoems('monsoon');
  assert.ok(monsoonHit.ids.includes('poem-006'));

  // Empty query returns all 10 catalog items
  const emptyHit = searchPoems('   ');
  assert.equal(emptyHit.ids.length, 10);
});

test('parseMarkdownPoem parses frontmatter, epigraph, moodColors, and Bangla stanzas', () => {
  const sampleMd = `---
id: poem-099
slug: shrabon-rate
title: শ্রাবণ রাতে
collection: twilight-sky
year: 2024
themes: [বৃষ্টি, গোধূলি, কদম]
epigraph: গোধূলির ছায়া
readingSeconds: 55
featured: true
order: 99
moodColors: ["#363E4B", "#59687A", "#B2C2D4"]
---

বৃষ্টি ভেজা কদম ফুলের ঘ্রাণ,
শ্রাবণ সন্ধ্যায় খুঁজে পাওয়া প্রাণ।

জোছনা ভরা নীল আকাশের তলে,
নীরব কথা ভাসে মেঘের দলে।
`;

  const parsed = parseMarkdownPoem(sampleMd);
  assert.equal(parsed.id, 'poem-099');
  assert.equal(parsed.slug, 'shrabon-rate');
  assert.equal(parsed.title, 'শ্রাবণ রাতে');
  assert.equal(parsed.collection, 'twilight-sky');
  assert.equal(parsed.year, 2024);
  assert.deepEqual(parsed.themes, ['বৃষ্টি', 'গোধূলি', 'কদম']);
  assert.equal(parsed.epigraph, 'গোধূলির ছায়া');
  assert.equal(parsed.featured, true);
  assert.equal(parsed.order, 99);
  assert.equal(parsed.firstLine, 'বৃষ্টি ভেজা কদম ফুলের ঘ্রাণ,');
  assert.equal(parsed.stanzas.length, 2);
  assert.equal(parsed.stanzas[0].length, 2);
  assert.deepEqual(parsed.moodColors, ['#363E4B', '#59687A', '#B2C2D4']);
});

test('filterAndSortPoems filters by cycle ID, Bangla theme, Bangla title initial, and sort order', () => {
  const themes = getAllThemes();
  assert.ok(themes.includes('বৃষ্টি'));
  assert.ok(themes.includes('মুখোশ'));

  const twilightOnly = filterAndSortPoems({
    query: '',
    collection: 'twilight-sky',
    theme: '',
    sort: 'order',
    letter: '',
  });
  assert.equal(twilightOnly.items.length, 4);

  const banglaAlphaFiltered = filterAndSortPoems({
    query: '',
    collection: 'All',
    theme: '',
    sort: 'alpha',
    letter: 'ভ',
  });
  assert.equal(banglaAlphaFiltered.items.length, 2);
  for (const item of banglaAlphaFiltered.items) {
    assert.equal(Array.from(item.title.trim())[0], 'ভ');
  }

  const newest = filterAndSortPoems({
    query: '',
    collection: 'All',
    theme: '',
    sort: 'newest',
    letter: '',
  });
  assert.equal(newest.items[0].slug, 'bhalo-thaka');
});
