import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATMOSPHERE_REALMS,
  getAtmosphereRealms,
  getRealmLocalizedFields,
  mapProgressToRealmIndex,
  resolveRealmPoemMeta,
  wrapRealmIndex,
} from './atmosphereAtlasData';

test('getAtmosphereRealms returns 4 distinct mood realms mapped cleanly to catalog poems', () => {
  const realms = getAtmosphereRealms();
  assert.equal(realms.length, 4);

  const ids = new Set(realms.map((r) => r.id));
  assert.equal(ids.size, 4);

  for (const realm of realms) {
    const poem = resolveRealmPoemMeta(realm);
    assert.equal(poem.slug, realm.poemSlug);
    assert.equal(poem.collection, realm.cycleId);
    assert.equal(realm.verseLines.length, 3);
    assert.ok(realm.palette.backdropGradient.includes('linear-gradient'));
    assert.ok(realm.palette.waterColorHighlight.startsWith('#'));

    const bnFields = getRealmLocalizedFields(realm, 'bn');
    const enFields = getRealmLocalizedFields(realm, 'en');
    assert.ok(bnFields.title.length > 0 && enFields.title.length > 0);
    assert.ok(bnFields.motifs.length >= 2 && enFields.motifs.length >= 2);
  }
});

test('mapProgressToRealmIndex maps scroll progress continuously into bounded realm indices', () => {
  assert.equal(mapProgressToRealmIndex(-0.5), 0);
  assert.equal(mapProgressToRealmIndex(0), 0);
  assert.equal(mapProgressToRealmIndex(0.24), 0);
  assert.equal(mapProgressToRealmIndex(0.26), 1);
  assert.equal(mapProgressToRealmIndex(0.55), 2);
  assert.equal(mapProgressToRealmIndex(0.85), 3);
  assert.equal(mapProgressToRealmIndex(1.5), 3);
  assert.equal(mapProgressToRealmIndex(Number.NaN), 0);
});

test('wrapRealmIndex wraps positive and negative step offsets cleanly', () => {
  assert.equal(wrapRealmIndex(-1, ATMOSPHERE_REALMS.length), 3);
  assert.equal(wrapRealmIndex(4, ATMOSPHERE_REALMS.length), 0);
  assert.equal(wrapRealmIndex(5, ATMOSPHERE_REALMS.length), 1);
  assert.equal(wrapRealmIndex(Number.NaN, ATMOSPHERE_REALMS.length), 0);
});
