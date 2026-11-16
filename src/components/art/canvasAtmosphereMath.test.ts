import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceMotePosition,
  createLightMotes,
  createSeededRng,
  getCollectionPlatePalette,
  hashSeed,
  sampleTideContourY,
} from './canvasAtmosphereMath';

test('createSeededRng produces deterministic sequences in [0, 1)', () => {
  const a = createSeededRng(hashSeed('twilight-sky'));
  const b = createSeededRng(hashSeed('twilight-sky'));
  const c = createSeededRng(hashSeed('masks-reality'));

  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  const seqC = [c(), c(), c()];

  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, seqC);
  for (const val of seqA) {
    assert.ok(val >= 0 && val < 1);
  }
});

test('createLightMotes generates bounded particles and wraps positions cleanly', () => {
  const motes = createLightMotes(12, 'test-motes');
  assert.equal(motes.length, 12);

  for (const mote of motes) {
    assert.ok(mote.x >= 0 && mote.x < 1);
    assert.ok(mote.y >= 0 && mote.y < 1);
    const next = advanceMotePosition(mote, 0.05, 800, 3.2);
    assert.ok(next.x >= 0 && next.x < 1);
    assert.ok(next.y >= 0 && next.y < 1);
    assert.ok(next.alpha > 0 && next.alpha <= 0.45);
  }
});

test('sampleTideContourY stays finite and shifts with scroll and pointer proximity', () => {
  const calm = sampleTideContourY({
    xNorm: 0.5,
    layerIndex: 3,
    layerCount: 10,
    timeSec: 1.5,
    scrollProgress: 0,
    pointerX: 0.1,
    pointerY: 0.5,
    activePhraseIndex: 0,
  });

  const scrolled = sampleTideContourY({
    xNorm: 0.5,
    layerIndex: 3,
    layerCount: 10,
    timeSec: 1.5,
    scrollProgress: 0.9,
    pointerX: 0.5,
    pointerY: 0.2,
    activePhraseIndex: 2,
  });

  assert.ok(Number.isFinite(calm));
  assert.ok(Number.isFinite(scrolled));
  assert.notEqual(calm, scrolled);
});

test('getCollectionPlatePalette returns 3 hex colors for each cycle', () => {
  const cycles = ['twilight-sky', 'masks-reality', 'longing-dawn'] as const;

  for (const cycle of cycles) {
    const palette = getCollectionPlatePalette(cycle);
    assert.equal(palette.length, 3);
    for (const color of palette) {
      assert.match(color, /^#[0-9A-Fa-f]{6}$/);
    }
  }
});
