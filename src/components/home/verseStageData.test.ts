import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMoodPulseBars,
  clampVelocityTimeScale,
  getStageFeaturedPoems,
} from './verseStageData';

test('getStageFeaturedPoems returns 5 distinct featured works in curated order', () => {
  const items = getStageFeaturedPoems(5);
  assert.equal(items.length, 5);
  const slugs = new Set(items.map((item) => item.slug));
  assert.equal(slugs.size, 5);
  for (let i = 1; i < items.length; i++) {
    assert.ok(items[i].order > items[i - 1].order);
  }
});

test('buildMoodPulseBars generates bounded bar heights and delays from poem palette', () => {
  const sample = getStageFeaturedPoems(1)[0];
  const bars = buildMoodPulseBars(sample, 8);
  assert.equal(bars.length, 8);
  for (const bar of bars) {
    assert.ok(bar.heightPercent >= 30 && bar.heightPercent <= 100);
    assert.ok(bar.delaySeconds >= 0);
    assert.ok(sample.moodColors.includes(bar.color));
  }
});

test('clampVelocityTimeScale bounds ribbon speed multiplier safely', () => {
  assert.equal(clampVelocityTimeScale(0), 1);
  assert.equal(clampVelocityTimeScale(Number.NaN), 1);
  assert.ok(clampVelocityTimeScale(850) > 1);
  assert.equal(clampVelocityTimeScale(12000), 3.1);
});
