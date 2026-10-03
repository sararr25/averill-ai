import test from 'node:test';
import assert from 'node:assert/strict';
import { copenhagenSchedule } from '../src/services/brevo-schedule.ts';
test('campaign date stays Copenhagen time regardless of host timezone', () => {
  assert.equal(copenhagenSchedule('2026-10-15','10:00'),'2026-10-15T08:00:00.000Z');
  assert.equal(copenhagenSchedule('2026-12-15','10:00'),'2026-12-15T09:00:00.000Z');
});
test('rejects impossible dates, times and spring daylight-saving gap', () => {
  for (const [date,time] of [['2026-02-30','10:00'],['2026-10-15','25:00'],['2026-03-29','02:30'],['','10:00']]) assert.equal(copenhagenSchedule(date,time),null);
});
