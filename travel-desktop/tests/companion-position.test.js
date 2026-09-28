const test = require('node:test');
const assert = require('node:assert/strict');
const { clampCompanion } = require('../src/companion-position');

const displays = [
  { workArea: { x: 0, y: 20, width: 1440, height: 850 } },
  { workArea: { x: 1440, y: 0, width: 1920, height: 1080 } },
];

test('companion keeps a position on a second monitor', () => {
  assert.deepEqual(clampCompanion({ x: 2100, y: 840 }, displays), { x: 2100, y: 840, width: 210, height: 84 });
});

test('companion returns to visible work area after a monitor is removed', () => {
  const bounds = clampCompanion({ x: 2100, y: 840 }, displays.slice(0, 1));
  assert.equal(bounds.x, 1230);
  assert.equal(bounds.y, 786);
});
