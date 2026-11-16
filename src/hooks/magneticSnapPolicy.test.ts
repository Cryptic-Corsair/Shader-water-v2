import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAGNETIC_SNAP_MIN_WIDTH,
  shouldEnableMagneticSnap,
} from './magneticSnapPolicy';

test('shouldEnableMagneticSnap enables desktop non-touch landing route only', () => {
  assert.equal(
    shouldEnableMagneticSnap({
      viewportWidth: 1440,
      isTouch: false,
      reducedMotion: false,
      pathname: '/',
    }),
    true
  );

  assert.equal(
    shouldEnableMagneticSnap({
      viewportWidth: MAGNETIC_SNAP_MIN_WIDTH - 1,
      isTouch: false,
      reducedMotion: false,
      pathname: '/',
    }),
    false
  );

  assert.equal(
    shouldEnableMagneticSnap({
      viewportWidth: 1440,
      isTouch: true,
      reducedMotion: false,
      pathname: '/',
    }),
    false
  );

  assert.equal(
    shouldEnableMagneticSnap({
      viewportWidth: 1440,
      isTouch: false,
      reducedMotion: true,
      pathname: '/',
    }),
    false
  );

  assert.equal(
    shouldEnableMagneticSnap({
      viewportWidth: 1440,
      isTouch: false,
      reducedMotion: false,
      pathname: '/poems',
    }),
    false
  );
});
