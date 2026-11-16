import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_FOLIO_PALETTES,
  SITE_BACKGROUND_SHADERS,
  getAllCoveredSiteEngines,
  resolveHeroFolioPalette,
} from './siteShaderChoreography';

test('site shader choreography uses all 7 shader engines across website backgrounds', () => {
  const covered = new Set(getAllCoveredSiteEngines());
  const expected = [
    'glsl-literary-book',
    'glsl-wet-ink',
    'paper-voronoi',
    'glsl-fbm',
    'paper-neuro',
    'glsl-crt',
    'glsl-raymarch',
  ] as const;

  for (const engine of expected) {
    assert.ok(covered.has(engine), `Missing shader engine in site choreography: ${engine}`);
  }
  assert.equal(SITE_BACKGROUND_SHADERS.hero.engine, 'glsl-literary-book');
});

test('all section shader configs define valid hex palettes and bounded uniform defaults', () => {
  const hexPattern = /^#[0-9a-fA-F]{6}$/;
  for (const config of Object.values(SITE_BACKGROUND_SHADERS)) {
    assert.match(config.palette.colorA, hexPattern);
    assert.match(config.palette.colorB, hexPattern);
    assert.match(config.palette.colorC, hexPattern);
    assert.match(config.palette.accent, hexPattern);
    assert.ok(config.speed > 0 && config.speed <= 2.0);
    assert.ok(config.intensity > 0 && config.intensity <= 1.0);
    assert.ok(config.opacity > 0 && config.opacity <= 1.0);
  }
});

test('resolveHeroFolioPalette wraps out-of-range and NaN indices cleanly', () => {
  assert.equal(resolveHeroFolioPalette(0).id, HERO_FOLIO_PALETTES[0].id);
  assert.equal(resolveHeroFolioPalette(1).id, HERO_FOLIO_PALETTES[1].id);
  assert.equal(resolveHeroFolioPalette(2).id, HERO_FOLIO_PALETTES[2].id);
  assert.equal(resolveHeroFolioPalette(3).id, HERO_FOLIO_PALETTES[0].id);
  assert.equal(resolveHeroFolioPalette(-1).id, HERO_FOLIO_PALETTES[2].id);
  assert.equal(resolveHeroFolioPalette(Number.NaN).id, HERO_FOLIO_PALETTES[0].id);
});
