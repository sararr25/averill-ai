function clampCompanion(bounds, displays, width = 210, height = 84) {
  const areas = displays.map(display => display.workArea).filter(Boolean);
  if (!areas.length) return { x: 0, y: 0, width, height };
  const point = { x: Number(bounds?.x), y: Number(bounds?.y) };
  const valid = Number.isFinite(point.x) && Number.isFinite(point.y);
  const area = valid
    ? areas.find(a => point.x >= a.x && point.x < a.x + a.width && point.y >= a.y && point.y < a.y + a.height)
      || areas.reduce((best, a) => {
        const distance = Math.hypot(point.x - (a.x + a.width / 2), point.y - (a.y + a.height / 2));
        return distance < best.distance ? { area: a, distance } : best;
      }, { area: areas[0], distance: Infinity }).area
    : areas[0];
  return {
    x: valid ? Math.max(area.x, Math.min(point.x, area.x + area.width - width)) : area.x + area.width - width - 12,
    y: valid ? Math.max(area.y, Math.min(point.y, area.y + area.height - height)) : area.y + area.height - height - 12,
    width, height,
  };
}

module.exports = { clampCompanion };
