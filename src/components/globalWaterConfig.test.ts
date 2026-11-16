import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLOBAL_WATER_IMAGE_URI,
  resolveGlobalWaterConfig,
} from './globalWaterConfig';

test('GLOBAL_WATER_IMAGE_URI encodes twilight amber and silver mist water field cleanly', () => {
  assert.ok(GLOBAL_WATER_IMAGE_URI.startsWith('data:image/svg+xml;utf8,'));
  const decoded = decodeURIComponent(
    GLOBAL_WATER_IMAGE_URI.replace('data:image/svg+xml;utf8,', '')
  );
  assert.ok(decoded.includes('#DFBC91'));
  assert.ok(decoded.includes('#AEC2D6'));
  assert.ok(decoded.includes('#1E2736'));
});

test('resolveGlobalWaterConfig pauses animation in daylight paper mode, hidden tab, or reduced motion', () => {
  const active = resolveGlobalWaterConfig({
    isDaylightPaper: false,
    pageVisible: true,
    reducedMotion: false,
    isSoftwareRenderer: false,
    hardwareConcurrency: 8,
    viewportWidth: 1440,
  });
  assert.equal(active.active, true);
  assert.equal(active.speed, 0.24);
  assert.ok(active.scale >= 1.35);
  assert.equal(active.maxPixelCount, 400_000);
  assert.equal(active.layering, 0.34);
  assert.ok(active.size > 0 && active.size < 1);

  assert.equal(
    resolveGlobalWaterConfig({
      isDaylightPaper: true,
      pageVisible: true,
      reducedMotion: false,
      isSoftwareRenderer: false,
    }).speed,
    0
  );

  assert.equal(
    resolveGlobalWaterConfig({
      isDaylightPaper: false,
      pageVisible: false,
      reducedMotion: false,
      isSoftwareRenderer: false,
    }).speed,
    0
  );

  assert.equal(
    resolveGlobalWaterConfig({
      isDaylightPaper: false,
      pageVisible: true,
      reducedMotion: true,
      isSoftwareRenderer: false,
    }).speed,
    0
  );
});

test('resolveGlobalWaterConfig caps pixel count and disables double caustic layering on software or low-core devices', () => {
  const softwareCfg = resolveGlobalWaterConfig({
    isDaylightPaper: false,
    pageVisible: true,
    reducedMotion: false,
    isSoftwareRenderer: true,
    hardwareConcurrency: 8,
    viewportWidth: 1440,
  });
  assert.equal(softwareCfg.maxPixelCount, 220_000);
  assert.equal(softwareCfg.layering, 0);

  const mobileCfg = resolveGlobalWaterConfig({
    isDaylightPaper: false,
    pageVisible: true,
    reducedMotion: false,
    isSoftwareRenderer: false,
    hardwareConcurrency: 8,
    viewportWidth: 390,
  });
  assert.equal(mobileCfg.maxPixelCount, 260_000);
  assert.equal(mobileCfg.layering, 0.34);
});
