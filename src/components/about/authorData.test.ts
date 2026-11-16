import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHOR_BIO_BEATS,
  AUTHOR_PROFILE,
  BIOGRAPHY_PARAGRAPHS,
  CORRESPONDENCE_DESKS,
  POET_TIMELINE_MILESTONES,
} from './authorData';

test('AUTHOR_PROFILE contains valid bilingual Ananya Hasan data without AI poetry clichés', () => {
  const combined = [
    AUTHOR_PROFILE.headline.bn,
    AUTHOR_PROFILE.headline.en,
    AUTHOR_PROFILE.statement.bn,
    AUTHOR_PROFILE.statement.en,
    AUTHOR_PROFILE.pullQuote.bn,
    AUTHOR_PROFILE.pullQuote.en,
    ...BIOGRAPHY_PARAGRAPHS,
  ]
    .join(' ')
    .toLowerCase();

  for (const cliché of ['tapestry', 'whispers of the soul', 'echoes of eternity']) {
    assert.equal(combined.includes(cliché), false);
  }

  assert.equal(AUTHOR_PROFILE.name.bn, 'অনন্যা হাসান');
  assert.equal(AUTHOR_PROFILE.name.en, 'Ananya Hasan');
  assert.match(AUTHOR_PROFILE.contactEmail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  assert.equal(AUTHOR_BIO_BEATS.length, 3);
  assert.equal(BIOGRAPHY_PARAGRAPHS.length, 3);
});

test('POET_TIMELINE_MILESTONES are chronological descending from Feb 2024 to Dec 2023', () => {
  assert.equal(POET_TIMELINE_MILESTONES.length, 8);
  for (let i = 1; i < POET_TIMELINE_MILESTONES.length; i++) {
    assert.ok(
      POET_TIMELINE_MILESTONES[i - 1].sortKey >=
        POET_TIMELINE_MILESTONES[i].sortKey
    );
  }

  assert.equal(POET_TIMELINE_MILESTONES[0].upcoming, true);
  assert.ok(CORRESPONDENCE_DESKS.length >= 1);
});
