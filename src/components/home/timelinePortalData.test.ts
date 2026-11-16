import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeridianTimeline } from './timelinePortalData';

test('buildMeridianTimeline spans Dec 2023 through Feb 2024 poems in descending order', () => {
  const nodesBn = buildMeridianTimeline('bn');
  assert.equal(nodesBn.length, 8);
  for (let i = 1; i < nodesBn.length; i++) {
    assert.ok(nodesBn[i - 1].sortKey >= nodesBn[i].sortKey);
  }
  assert.equal(nodesBn[0].sortKey, 20240202);
  assert.equal(nodesBn[0].upcoming, true);
  assert.equal(nodesBn[nodesBn.length - 1].sortKey, 20231213);
  assert.equal(nodesBn[nodesBn.length - 1].title, 'মুখোশের অন্তরালে');

  const nodesEn = buildMeridianTimeline('en');
  assert.equal(nodesEn[0].yearLabel, '02 Feb 2024');
  assert.equal(nodesEn[0].title, 'ভালো থাকা বললেই কি ভালো থাকা যায়??');
});
