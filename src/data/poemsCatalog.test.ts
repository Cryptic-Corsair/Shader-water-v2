import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POEMS_CATALOG,
  formatArchiveIndex,
  formatReadingTime,
  getCollections,
  getCycleLabel,
  getFeaturedPoems,
  getPoemMetaBySlug,
} from './poemsCatalog';
import { getAdjacentPoems, getPoemBySlug } from './poemsContent';

test('POEMS_CATALOG contains 10 unique, ordered Bangla poems across 3 cycles', () => {
  assert.equal(POEMS_CATALOG.length, 10);

  const ids = new Set(POEMS_CATALOG.map((p) => p.id));
  const slugs = new Set(POEMS_CATALOG.map((p) => p.slug));
  const orders = new Set(POEMS_CATALOG.map((p) => p.order));

  assert.equal(ids.size, 10);
  assert.equal(slugs.size, 10);
  assert.equal(orders.size, 10);

  const collections = getCollections();
  assert.deepEqual(collections, [
    'twilight-sky',
    'masks-reality',
    'longing-dawn',
  ]);

  assert.equal(getCycleLabel('twilight-sky', 'bn'), 'গোধূলি ও স্বপ্নীল আকাশ');
  assert.equal(getCycleLabel('masks-reality', 'en'), 'Masks & Reality');
  assert.equal(getCycleLabel('longing-dawn', 'bn'), 'অনুভব ও শুভেচ্ছা');

  for (const poem of POEMS_CATALOG) {
    assert.ok(collections.includes(poem.collection));
    assert.equal(poem.moodColors.length, 3);
    assert.ok(poem.firstLine.length > 0);
    assert.ok(poem.dateDisplay.length > 0);
    assert.ok(poem.readingSeconds > 0);
    assert.ok(poem.themes.length > 0);
  }
});

test('getFeaturedPoems returns only featured poems sorted by order', () => {
  const featured = getFeaturedPoems();
  assert.equal(featured.length, 5);
  for (let i = 0; i < featured.length; i++) {
    assert.equal(featured[i].featured, true);
    if (i > 0) {
      assert.ok(featured[i].order > featured[i - 1].order);
    }
  }
});

test('getPoemBySlug loads exact verbatim Bangla stanzas and returns null for unknown slug', async () => {
  const meta = getPoemMetaBySlug('mukhosher-antarale');
  assert.ok(meta);
  assert.equal(meta.title, 'মুখোশের অন্তরালে');

  const full = await getPoemBySlug('mukhosher-antarale');
  assert.ok(full);
  assert.equal(full.slug, 'mukhosher-antarale');
  assert.equal(full.stanzas[0][0], 'এই দুনিয়ায় হায়! মানুষ চেনা দায়!');
  assert.ok(full.stanzas.flat().some((line) => line.includes('----')));

  const last = await getPoemBySlug('bhalo-thaka');
  assert.ok(last);
  assert.equal(last.collection, 'longing-dawn');
  assert.equal(last.stanzas[0][0], 'অনেক প্রতীক্ষার পর ~~~');
  assert.ok(last.stanzas.flat().some((line) => line.includes('~☆~')));

  const missing = await getPoemBySlug('nonexistent-poem-slug');
  assert.equal(missing, null);
});

test('getAdjacentPoems resolves prev/next boundary links accurately', () => {
  const first = getAdjacentPoems('mukhosher-antarale');
  assert.equal(first.prev, null);
  assert.equal(first.next?.slug, 'shubheccha');

  const last = getAdjacentPoems('bhalo-thaka');
  assert.equal(last.prev?.slug, 'shopnil-jogote');
  assert.equal(last.next, null);
});

test('formatting helpers return localized indices and reading times for bn and en', () => {
  assert.equal(formatArchiveIndex(1, 'bn'), '০০১');
  assert.equal(formatArchiveIndex(10, 'bn'), '০১০');
  assert.equal(formatArchiveIndex(1, 'en'), '001');
  assert.equal(formatArchiveIndex(10, 'en'), '010');

  assert.equal(formatReadingTime(45, 'bn'), '৪৫ সেকেন্ড');
  assert.equal(formatReadingTime(75, 'bn'), '২ মিনিট পাঠ');
  assert.equal(formatReadingTime(45, 'en'), '45 sec');
  assert.equal(formatReadingTime(75, 'en'), '2 min read');
});
