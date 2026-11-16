import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCycleVolumes, filterTimelineMilestonesByCycle } from './cycleVolumesData';
import { buildMeridianTimeline } from './timelinePortalData';

test('buildCycleVolumes aggregates all 10 catalog poems across the 3 cycles cleanly', () => {
  const bnVolumes = buildCycleVolumes('bn');
  assert.equal(bnVolumes.length, 3);
  const totalPoems = bnVolumes.reduce((sum, v) => sum + v.poems.length, 0);
  assert.equal(totalPoems, 10);
  assert.equal(bnVolumes[0].indexLabel, '০১');
  assert.equal(bnVolumes[0].countLabel, '৪টি কবিতা');

  const enVolumes = buildCycleVolumes('en');
  assert.equal(enVolumes[1].indexLabel, '02');
  assert.equal(enVolumes[1].name, 'Masks & Reality');
  assert.equal(enVolumes[1].poems.length, 2);
});

test('filterTimelineMilestonesByCycle filters timeline nodes accurately without mutating source', () => {
  const all = buildMeridianTimeline('en');
  assert.equal(filterTimelineMilestonesByCycle(all, 'all').length, all.length);

  const twilightOnly = filterTimelineMilestonesByCycle(all, 'twilight-sky');
  assert.equal(twilightOnly.length, 4);
  for (const node of twilightOnly) {
    assert.equal(node.cycleId, 'twilight-sky');
  }

  const masksOnly = filterTimelineMilestonesByCycle(all, 'masks-reality');
  assert.equal(masksOnly.length, 2);
  assert.equal(masksOnly[0].id, 'ms-jan-31');
  assert.equal(masksOnly[1].id, 'ms-dec-13');

  const longingOnly = filterTimelineMilestonesByCycle(all, 'longing-dawn');
  assert.equal(longingOnly.length, 2);
  assert.equal(longingOnly[0].id, 'ms-feb-02');
  assert.equal(longingOnly[1].id, 'ms-jan-25');
});
