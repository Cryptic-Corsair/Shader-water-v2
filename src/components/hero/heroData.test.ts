import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_STANZA, getFeaturedTodayPoem } from './heroData';
import { getFeaturedPoems } from '../../data/poemsCatalog';

test('getFeaturedTodayPoem returns a valid featured poem deterministically for a date', () => {
  const featured = getFeaturedPoems();
  const sampleDate = new Date('2026-11-14T12:00:00Z');
  const firstCall = getFeaturedTodayPoem(sampleDate);
  const secondCall = getFeaturedTodayPoem(sampleDate);

  assert.equal(firstCall.slug, secondCall.slug);
  assert.equal(firstCall.featured, true);
  assert.ok(featured.some((p) => p.slug === firstCall.slug));
});

test('HERO_STANZA provides 2 verbatim Bangla couplet lines without forbidden clichés', () => {
  assert.equal(HERO_STANZA.length, 2);
  const joined = HERO_STANZA.join(' ').toLowerCase();
  assert.ok(!joined.includes('tapestry'));
  assert.ok(!joined.includes('whispers of the soul'));
  assert.ok(!joined.includes('echoes of eternity'));
  for (const line of HERO_STANZA) {
    assert.ok(line.trim().length > 10);
  }
});
