import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ODYSSEY_ACTS,
  buildPoemConstellationNodes,
  generateParticleFormations,
  interpolateOdysseyStageState,
  resolveActByProgress,
} from './odysseyChoreography';

test('resolveActByProgress maps normalized and clamped scroll progress across all 5 acts', () => {
  assert.equal(resolveActByProgress(-0.5).actIndex, 0);
  assert.equal(resolveActByProgress(0.05).actIndex, 0);
  assert.equal(resolveActByProgress(0.3).actIndex, 1);
  assert.equal(resolveActByProgress(0.55).actIndex, 2);
  assert.equal(resolveActByProgress(0.8).actIndex, 3);
  assert.equal(resolveActByProgress(0.95).actIndex, 4);
  assert.equal(resolveActByProgress(1.8).actIndex, 4);
  assert.equal(ODYSSEY_ACTS.length, 5);
});

test('interpolateOdysseyStageState keeps morph weights normalized and separates astrolabe in Masks act', () => {
  const startState = interpolateOdysseyStageState(0.0);
  const masksState = interpolateOdysseyStageState(0.24);
  const endState = interpolateOdysseyStageState(1.0);

  const sumWeights = (weights: [number, number, number, number]) =>
    weights[0] + weights[1] + weights[2] + weights[3];

  assert.ok(Math.abs(sumWeights(startState.morphWeights) - 1) < 0.001);
  assert.ok(Math.abs(sumWeights(masksState.morphWeights) - 1) < 0.001);
  assert.ok(Math.abs(sumWeights(endState.morphWeights) - 1) < 0.001);

  assert.ok(masksState.astrolabeSplit > startState.astrolabeSplit);
  assert.ok(Number.isFinite(masksState.cameraZ));
});

test('generateParticleFormations produces finite deterministic buffers for all 4 morph shapes', () => {
  const fA = generateParticleFormations(256);
  const fB = generateParticleFormations(256);

  assert.equal(fA.count, 256);
  assert.equal(fA.pos0.length, 256 * 3);
  assert.equal(fA.pos1.length, 256 * 3);
  assert.equal(fA.pos2.length, 256 * 3);
  assert.equal(fA.pos3.length, 256 * 3);
  assert.equal(fA.seeds.length, 256 * 2);

  for (let i = 0; i < fA.pos0.length; i++) {
    assert.ok(Number.isFinite(fA.pos0[i]));
    assert.ok(Number.isFinite(fA.pos1[i]));
    assert.ok(Number.isFinite(fA.pos2[i]));
    assert.ok(Number.isFinite(fA.pos3[i]));
    assert.equal(fA.pos0[i], fB.pos0[i]);
  }
});

test('buildPoemConstellationNodes includes all 10 catalog poems with opening stanzas and coordinates', () => {
  const bnNodes = buildPoemConstellationNodes('bn');
  const enNodes = buildPoemConstellationNodes('en');

  assert.equal(bnNodes.length, 10);
  assert.equal(enNodes.length, 10);
  assert.equal(bnNodes[0].indexLabel, '০১');
  assert.equal(enNodes[0].indexLabel, '01');
  assert.ok(bnNodes.every((n) => n.stanzaPreview.length >= 1));
  assert.ok(
    bnNodes.every(
      (n) =>
        n.xPct >= 5 &&
        n.xPct <= 95 &&
        n.yPct >= 5 &&
        n.yPct <= 95 &&
        n.poem.moodColors.length === 3
    )
  );
});
