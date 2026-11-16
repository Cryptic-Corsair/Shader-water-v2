import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPINE_WAYPOINTS,
  clampScrollProgress,
  getActiveWaypointIndex,
  isWaypointReached,
} from './scrollSpineMath';

test('SPINE_WAYPOINTS are ordered vertically with monotonically increasing thresholds', () => {
  assert.ok(SPINE_WAYPOINTS.length >= 4);
  for (let i = 1; i < SPINE_WAYPOINTS.length; i++) {
    assert.ok(SPINE_WAYPOINTS[i].y > SPINE_WAYPOINTS[i - 1].y);
    assert.ok(SPINE_WAYPOINTS[i].threshold > SPINE_WAYPOINTS[i - 1].threshold);
  }
});

test('clampScrollProgress bounds invalid and out-of-range progress values', () => {
  assert.equal(clampScrollProgress(-0.5), 0);
  assert.equal(clampScrollProgress(0.45), 0.45);
  assert.equal(clampScrollProgress(1.8), 1);
  assert.equal(clampScrollProgress(Number.NaN), 0);
});

test('getActiveWaypointIndex and isWaypointReached track scroll progress accurately', () => {
  assert.equal(SPINE_WAYPOINTS.length, 8);
  assert.equal(getActiveWaypointIndex(0), 0);
  assert.equal(getActiveWaypointIndex(0.15), 1);
  assert.equal(getActiveWaypointIndex(0.3), 2);
  assert.equal(getActiveWaypointIndex(0.45), 3);
  assert.equal(getActiveWaypointIndex(0.58), 4);
  assert.equal(getActiveWaypointIndex(0.72), 5);
  assert.equal(getActiveWaypointIndex(0.84), 6);
  assert.equal(getActiveWaypointIndex(0.95), 7);

  assert.equal(isWaypointReached(0.1, SPINE_WAYPOINTS[1]), false);
  assert.equal(isWaypointReached(0.14, SPINE_WAYPOINTS[1]), true);
});
