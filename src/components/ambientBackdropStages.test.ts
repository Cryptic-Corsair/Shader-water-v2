import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AMBIENT_STAGES,
  clampStageIndex,
  computeStageOpacities,
  resolveRouteDefaultStage,
} from './ambientBackdropStages';

test('AMBIENT_STAGES defines all 5 atmospheric palette stages', () => {
  assert.equal(AMBIENT_STAGES.length, 5);
  assert.deepEqual(
    AMBIENT_STAGES.map((s) => s.name),
    [
      'Dawn Fog',
      'Silver Water',
      'Sandstone Dusk',
      'Twilight Slate',
      'Balanced Mist',
    ]
  );

  for (const stage of AMBIENT_STAGES) {
    assert.ok(stage.backgroundImage.includes('linear-gradient'));
    assert.ok(stage.backgroundImage.includes('radial-gradient'));
    assert.equal(stage.colors.length, 3);
  }
});

test('clampStageIndex bounds arbitrary stage indices safely', () => {
  assert.equal(clampStageIndex(-2), 0);
  assert.equal(clampStageIndex(0), 0);
  assert.equal(clampStageIndex(2.4), 2);
  assert.equal(clampStageIndex(99), 4);
  assert.equal(clampStageIndex(Number.NaN), 0);
});

test('computeStageOpacities activates exactly one stage layer at a time', () => {
  assert.deepEqual(computeStageOpacities(0), [1, 0, 0, 0, 0]);
  assert.deepEqual(computeStageOpacities(1), [0, 1, 0, 0, 0]);
  assert.deepEqual(computeStageOpacities(4), [0, 0, 0, 0, 1]);
  assert.deepEqual(computeStageOpacities(12), [0, 0, 0, 0, 1]);
});

test('resolveRouteDefaultStage picks Dawn Fog on home and Twilight Slate on archive/reading routes', () => {
  assert.equal(resolveRouteDefaultStage('/'), 0);
  assert.equal(resolveRouteDefaultStage('/poems'), 3);
  assert.equal(resolveRouteDefaultStage('/poems/mukhosher-antarale'), 3);
});
