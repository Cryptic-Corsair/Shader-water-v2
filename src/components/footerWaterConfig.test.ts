import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FOOTER_DIAGONAL_CUT_POLYGON,
  FOOTER_WATER_IMAGE_URI,
  resolveFooterWaterSpeed,
} from './footerWaterConfig';

test('FOOTER_WATER_IMAGE_URI encodes twilight amber and slate horizon SVG cleanly', () => {
  assert.ok(FOOTER_WATER_IMAGE_URI.startsWith('data:image/svg+xml;utf8,'));
  const decoded = decodeURIComponent(
    FOOTER_WATER_IMAGE_URI.replace('data:image/svg+xml;utf8,', '')
  );
  assert.ok(decoded.includes('#DFBC91'));
  assert.ok(decoded.includes('#363E4B'));
  assert.ok(FOOTER_DIAGONAL_CUT_POLYGON.includes('polygon('));
});

test('resolveFooterWaterSpeed pauses shader when offscreen, hidden, or reduced-motion', () => {
  assert.equal(
    resolveFooterWaterSpeed({
      inView: true,
      pageVisible: true,
      reducedMotion: false,
    }),
    0.42
  );
  assert.equal(
    resolveFooterWaterSpeed({
      inView: false,
      pageVisible: true,
      reducedMotion: false,
    }),
    0
  );
  assert.equal(
    resolveFooterWaterSpeed({
      inView: true,
      pageVisible: false,
      reducedMotion: false,
    }),
    0
  );
  assert.equal(
    resolveFooterWaterSpeed({
      inView: true,
      pageVisible: true,
      reducedMotion: true,
    }),
    0
  );
});
