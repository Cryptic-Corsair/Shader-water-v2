import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeHorizonTilt,
  formatFolioLabel,
  getHeroFolios,
  wrapFolioIndex,
} from './heroSpectacleData';

test('getHeroFolios returns 3 curated hero folios backed by real catalog poems', () => {
  const folios = getHeroFolios();
  assert.equal(folios.length, 3);
  for (const folio of folios) {
    assert.ok(folio.slug.length > 0);
    assert.ok(folio.titleBn.length > 0);
    assert.equal(folio.stanza.length, 2);
    assert.ok(folio.stanza[0].length > 5);
    assert.ok(folio.stanza[1].length > 5);
  }
  assert.equal(folios[0].slug, 'tumi-amar');
  assert.equal(folios[1].slug, 'mukhosher-antarale');
  assert.equal(folios[2].slug, 'bhalo-thaka');
});

test('wrapFolioIndex wraps negative, overflow, and non-finite inputs cleanly', () => {
  assert.equal(wrapFolioIndex(0, 3), 0);
  assert.equal(wrapFolioIndex(-1, 3), 2);
  assert.equal(wrapFolioIndex(3, 3), 0);
  assert.equal(wrapFolioIndex(5, 3), 2);
  assert.equal(wrapFolioIndex(Number.NaN, 3), 0);
});

test('computeHorizonTilt clamps pointer coordinates and produces bounded 3D tilt angles', () => {
  const neutral = computeHorizonTilt(0, 0);
  assert.equal(neutral.rotateXDeg, 0);
  assert.equal(neutral.rotateYDeg, 0);
  assert.equal(neutral.glintPercentX, 50);

  const extreme = computeHorizonTilt(3, -3);
  assert.ok(Math.abs(extreme.rotateYDeg) <= 5);
  assert.ok(Math.abs(extreme.rotateXDeg) <= 5);
  assert.ok(extreme.glintPercentX > 50 && extreme.glintPercentX <= 70);
});

test('formatFolioLabel formats bilingual labels cleanly', () => {
  const folios = getHeroFolios();
  assert.equal(formatFolioLabel(folios[0], 'bn'), '০১ · বর্ষার প্রথম বৃষ্টি');
  assert.equal(formatFolioLabel(folios[0], 'en'), '01 · First Monsoon Rain');
});
