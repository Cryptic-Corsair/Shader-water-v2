import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBreezeTilt,
  computeHeroScrollDissolve,
  computeSoundModulation,
  createDustMotes,
  createMistWisps,
  createRainStreaks,
  splitHeadlineLines,
} from './heroAtmosphereMath';

test('splitHeadlineLines preserves Bengali headline cadence cleanly without splitting conjuncts', () => {
  const bnLines = splitHeadlineLines(
    'গোধূলির ছায়া, মেঘ ও বাস্তবতার নীরব লিপি।',
    'bn'
  );
  assert.deepEqual(bnLines, [
    'গোধূলির ছায়া, মেঘ ও',
    'বাস্তবতার নীরব লিপি।',
  ]);

  const enLines = splitHeadlineLines(
    'Of Twilight Skies, Masks & Quiet Longing.',
    'en'
  );
  assert.deepEqual(enLines, [
    'Of Twilight Skies,',
    'Masks & Quiet Longing.',
  ]);
});

test('computeBreezeTilt clamps pointer extremes and computes gentle monsoon slant', () => {
  const center = computeBreezeTilt(0, 0);
  const rightBreeze = computeBreezeTilt(1.5, -1.5);
  const leftBreeze = computeBreezeTilt(-1.5, 1.5);

  assert.ok(center.angleRad < 0);
  assert.ok(rightBreeze.angleRad > center.angleRad);
  assert.ok(leftBreeze.angleRad < center.angleRad);
  assert.equal(rightBreeze.mistShiftX, 18);
  assert.equal(rightBreeze.mistShiftY, -11);
});

test('computeSoundModulation amplifies mist and motes when sound is ON and settles when OFF', () => {
  const off = computeSoundModulation(2.5, false);
  assert.equal(off.mistScale, 1);
  assert.equal(off.moteAlphaBoost, 1);
  assert.equal(off.rippleGlow, 0);

  const on = computeSoundModulation(1.2, true);
  assert.ok(on.mistScale >= 1);
  assert.ok(on.moteAlphaBoost > 1);
  assert.ok(on.rippleGlow >= 0.35);
  assert.ok(on.rainVelocityFactor > off.rainVelocityFactor);
});

test('computeHeroScrollDissolve smoothly lifts poem and dissolves mist across [0, 1]', () => {
  const start = computeHeroScrollDissolve(0);
  assert.equal(start.poemTranslateY, 0);
  assert.equal(start.poemOpacity, 1);
  assert.equal(start.mistOpacity, 1);

  const end = computeHeroScrollDissolve(1);
  assert.equal(end.poemTranslateY, -56);
  assert.ok(end.poemOpacity < 0.25);
  assert.equal(end.mistOpacity, 0);
  assert.ok(end.sculptureScale > 1);
});

test('createRainStreaks, createDustMotes, and createMistWisps build deterministic finite geometry', () => {
  const wisps = createMistWisps();
  assert.ok(wisps.length >= 3);

  const streaks = createRainStreaks(48, 1440, 900, 42);
  assert.equal(streaks.length, 48);
  for (const s of streaks) {
    assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y));
    assert.ok(s.length > 0 && s.speed > 0);
  }

  const motes = createDustMotes(24, 1440, 900, 42);
  assert.equal(motes.length, 24);
  for (const m of motes) {
    assert.ok(m.radius > 0 && m.alpha > 0);
  }
});
