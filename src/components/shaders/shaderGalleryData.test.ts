import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHADER_EXHIBITS,
  SHADER_PALETTES,
  clampShaderUniform,
  formatUniformMetric,
  getShaderExhibitById,
  getShaderPaletteById,
  hexToRgbTuple,
} from './shaderGalleryData';

test('SHADER_EXHIBITS contains 6 distinct live shader entries with bilingual copy and paired poems', () => {
  assert.equal(SHADER_EXHIBITS.length, 6);
  const ids = new Set(SHADER_EXHIBITS.map((item) => item.id));
  assert.equal(ids.size, 6);

  for (const exhibit of SHADER_EXHIBITS) {
    assert.ok(exhibit.title.bn.length > 0);
    assert.ok(exhibit.title.en.length > 0);
    assert.ok(exhibit.summary.bn.length > 0);
    assert.ok(exhibit.summary.en.length > 0);
    assert.ok(exhibit.poemSlug.length > 0);
    assert.ok(exhibit.defaultSpeed > 0);
    assert.ok(exhibit.defaultIntensity > 0);
    assert.ok(exhibit.defaultScale > 0);
  }
});

test('hexToRgbTuple converts 6-digit hex codes to normalized 0..1 RGB tuples and falls back cleanly', () => {
  const white = hexToRgbTuple('#FFFFFF');
  assert.deepEqual(white, [1, 1, 1]);

  const black = hexToRgbTuple('#000000');
  assert.deepEqual(black, [0, 0, 0]);

  const amber = hexToRgbTuple('#DFBC91');
  assert.ok(amber[0] > 0.85 && amber[1] > 0.7 && amber[2] > 0.5);

  const fallback = hexToRgbTuple('invalid-hex');
  assert.equal(fallback.length, 3);
  assert.ok(fallback.every((c) => c >= 0 && c <= 1));
});

test('clampShaderUniform bounds out-of-range and NaN values accurately', () => {
  assert.equal(clampShaderUniform(2.5, 0.2, 2.0, 1.0), 2.0);
  assert.equal(clampShaderUniform(-1.0, 0.2, 2.0, 1.0), 0.2);
  assert.equal(clampShaderUniform(Number.NaN, 0.2, 2.0, 1.0), 1.0);
  assert.equal(clampShaderUniform(1.25, 0.2, 2.0, 1.0), 1.25);
});

test('lookup helpers resolve valid and unknown exhibit or palette IDs safely', () => {
  assert.equal(getShaderExhibitById('raymarched-sdf').engine, 'glsl-raymarch');
  assert.equal(getShaderExhibitById('missing-id').id, SHADER_EXHIBITS[0].id);

  assert.equal(getShaderPaletteById('monsoon-mist').id, 'monsoon-mist');
  assert.equal(getShaderPaletteById('unknown').id, SHADER_PALETTES[0].id);
});

test('formatUniformMetric renders localized bn numerals and English metrics', () => {
  assert.equal(formatUniformMetric(0.75, '%', 'en'), '75%');
  assert.equal(formatUniformMetric(0.75, '%', 'bn'), '৭৫%');
  assert.equal(formatUniformMetric(1.2, 'x', 'en'), '1.2x');
});
