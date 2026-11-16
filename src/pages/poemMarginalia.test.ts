import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAnnotatedStanzas,
  clampFontStep,
  POEM_FONT_STEPS_REM,
  toSuperscript,
} from './poemMarginalia';
import { getPoemBySlug, getReadingRoomAdjacentPoems } from '../data/poemsContent';

test('toSuperscript converts multi-digit note indices accurately', () => {
  assert.equal(toSuperscript(1), '¹');
  assert.equal(toSuperscript(2), '²');
  assert.equal(toSuperscript(12), '¹²');
});

test('clampFontStep bounds font scale index within defined steps', () => {
  assert.equal(clampFontStep(-3), 0);
  assert.equal(clampFontStep(99), POEM_FONT_STEPS_REM.length - 1);
  assert.equal(clampFontStep(2), 2);
});

test('buildAnnotatedStanzas splits Bangla lines on exact marginalia phrases and preserves stanza notes', async () => {
  const poem = await getPoemBySlug('mukhosher-antarale');
  assert.ok(poem);

  const annotated = buildAnnotatedStanzas(poem.stanzas, [
    { lineHint: 'মানুষ চেনা দায়', note: 'সূচনা পঙ্‌ক্তি' },
    { lineHint: 'নতুন মঞ্চ', note: 'দ্বিতীয় স্তবক' },
  ]);
  assert.equal(annotated.length, 6);

  const stanza0Line0 = annotated[0].lines[0];
  assert.equal(stanza0Line0[1].type, 'annotation');
  if (stanza0Line0[1].type === 'annotation') {
    assert.equal(stanza0Line0[1].text, 'মানুষ চেনা দায়');
    assert.equal(stanza0Line0[1].superscript, '¹');
  }
  assert.equal(annotated[0].notes.length, 1);

  assert.equal(annotated[1].notes.length, 1);
  assert.equal(annotated[1].notes[0].superscript, '²');
});

test('buildAnnotatedStanzas supports positional Stanza/line fallback hints', () => {
  const stanzas = [
    ['First line here.', 'Second line here.'],
    ['Another stanza line.'],
  ];
  const annotated = buildAnnotatedStanzas(stanzas, [
    { lineHint: 'Stanza II, l. 1', note: 'Positional note' },
  ]);
  assert.equal(annotated[1].lines[0][0].type, 'annotation');
  assert.equal(annotated[1].notes[0].note, 'Positional note');
});

test('getReadingRoomAdjacentPoems wraps gracefully and prioritizes same cycle', () => {
  const firstMask = getReadingRoomAdjacentPoems('mukhosher-antarale');
  assert.equal(firstMask.prev?.slug, 'bhalo-thaka');
  assert.equal(firstMask.next?.slug, 'bastobotar-lorai');

  const endTwilight = getReadingRoomAdjacentPoems('shopnil-jogote');
  assert.equal(endTwilight.prev?.slug, 'shudhui-tumi');
  assert.equal(endTwilight.next?.slug, 'mukhosher-antarale');
});
