import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KINETIC_DEPTH_PHRASES,
  getCollectionWorlds,
  getFeaturedGalleryPoems,
  getRibbonFragments,
  resolveTransitionLabel,
  validateDispatchEmail,
} from './versesLogic';
import { getFeaturedStanzaLines } from './verseStageData';

test('getFeaturedGalleryPoems returns 5 featured Bangla poems ordered sequentially with stanza lines', () => {
  const list = getFeaturedGalleryPoems(5);
  assert.equal(list.length, 5);
  for (let i = 0; i < list.length; i++) {
    assert.equal(list[i].featured, true);
    const stanzaLines = getFeaturedStanzaLines(list[i].slug, 3);
    assert.ok(stanzaLines.length >= 2 || list[i].slug === 'shopnil-jogote');
    if (i > 0) {
      assert.ok(list[i].order > list[i - 1].order);
    }
  }
});

test('getRibbonFragments returns 10 non-empty Bangla opening lines matching catalog size', () => {
  const fragments = getRibbonFragments();
  assert.equal(fragments.length, 10);
  for (const frag of fragments) {
    assert.ok(frag.length > 5);
  }
});

test('getCollectionWorlds returns 3 poetic cycle worlds in bn and en with real counts', () => {
  const worldsBn = getCollectionWorlds('bn');
  assert.equal(worldsBn.length, 3);
  assert.deepEqual(
    worldsBn.map((w) => w.name),
    [
      'গোধূলি ও স্বপ্নীল আকাশ',
      'মুখোশ ও বাস্তবতার লড়াই',
      'অনুভব ও শুভেচ্ছা',
    ]
  );
  assert.deepEqual(
    worldsBn.map((w) => w.parallaxPercent),
    [-8, 0, 10]
  );

  const worldsEn = getCollectionWorlds('en');
  assert.deepEqual(
    worldsEn.map((w) => w.name),
    ['Twilight & Dream Sky', 'Masks & Reality', 'Longing & Dawn']
  );

  for (const world of worldsBn) {
    assert.ok(world.count > 0);
    assert.ok(world.meshGradient.includes('linear-gradient'));
  }
});

test('KINETIC_DEPTH_PHRASES exposes 3 phrases cleanly', () => {
  assert.equal(KINETIC_DEPTH_PHRASES.length, 3);
  for (const item of KINETIC_DEPTH_PHRASES) {
    assert.ok(item.lead.length > 5);
    assert.ok(item.accent.length > 5);
  }
});

test('validateDispatchEmail rejects empty or malformed input and accepts valid email', () => {
  assert.equal(validateDispatchEmail('', 'bn').valid, false);
  assert.equal(validateDispatchEmail('   ', 'en').valid, false);
  assert.equal(validateDispatchEmail('not-an-email', 'bn').valid, false);
  assert.equal(validateDispatchEmail('reader@example.com', 'bn').valid, true);
});

test('resolveTransitionLabel maps route paths cleanly in bn and en', () => {
  assert.equal(resolveTransitionLabel('/', 'bn'), 'সংগৃহীত কবিতা');
  assert.equal(resolveTransitionLabel('/poems', 'bn'), 'কবিতাগার');
  assert.equal(resolveTransitionLabel('/about', 'en'), 'About Ananya Hasan');
  assert.equal(
    resolveTransitionLabel('/poems/mukhosher-antarale', 'bn'),
    'মুখোশের অন্তরালে'
  );
  assert.equal(resolveTransitionLabel('/poems/unknown-slug', 'en'), 'Reading Room');
});
