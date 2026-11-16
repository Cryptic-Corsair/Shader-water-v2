import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYCLE_CAROUSEL_SLIDES,
  getCircularOffset,
  getSlideCycleName,
  getSlideDepthStyle,
  wrapSlideIndex,
} from './collectionsCarouselData';

test('CYCLE_CAROUSEL_SLIDES contains the 3 Ananya Hasan poetic cycles', () => {
  assert.equal(CYCLE_CAROUSEL_SLIDES.length, 3);
  assert.deepEqual(
    CYCLE_CAROUSEL_SLIDES.map((s) => s.id),
    ['twilight-sky', 'masks-reality', 'longing-dawn']
  );

  assert.deepEqual(
    CYCLE_CAROUSEL_SLIDES.map((s) => getSlideCycleName(s, 'bn')),
    [
      'গোধূলি ও স্বপ্নীল আকাশ',
      'মুখোশ ও বাস্তবতার লড়াই',
      'অনুভব ও শুভেচ্ছা',
    ]
  );

  for (const slide of CYCLE_CAROUSEL_SLIDES) {
    assert.equal(slide.couplet.length, 2);
    assert.ok(slide.yearsBn.length > 0);
    assert.ok(slide.yearsEn.length > 0);
    assert.ok(slide.collectionQuery.length > 0);
  }
});

test('wrapSlideIndex wraps negative and overflowing indices cleanly', () => {
  assert.equal(wrapSlideIndex(0, 3), 0);
  assert.equal(wrapSlideIndex(3, 3), 0);
  assert.equal(wrapSlideIndex(-1, 3), 2);
  assert.equal(wrapSlideIndex(4, 3), 1);
  assert.equal(wrapSlideIndex(Number.NaN, 3), 0);
});

test('getCircularOffset calculates shortest signed distance on 3-slide ring', () => {
  assert.equal(getCircularOffset(0, 0, 3), 0);
  assert.equal(getCircularOffset(1, 0, 3), 1);
  assert.equal(getCircularOffset(2, 0, 3), -1);
  assert.equal(getCircularOffset(0, 2, 3), 1);
});

test('getSlideDepthStyle returns zoom-depth scale and opacity values', () => {
  const center = getSlideDepthStyle(0);
  assert.equal(center.scale, 1);
  assert.equal(center.opacity, 1);

  const adjacent = getSlideDepthStyle(1);
  assert.equal(adjacent.scale, 0.82);
  assert.equal(adjacent.opacity, 0.48);

  const far = getSlideDepthStyle(2);
  assert.ok(far.scale < adjacent.scale);
  assert.ok(far.opacity < adjacent.opacity);
});
