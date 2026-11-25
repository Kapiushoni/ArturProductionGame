(() => {
  const find = (o, name) => { if (o.constructor.name === name) return o; for (const c of o._ch || []) { const r = find(c, name); if (r) return r; } return null; };
  const w = find(game, 'WinWindow');
  if (!w) return 'no WinWindow';
  const s = w.stats;
  const lv = w.loot;
  return { values: w.values, combat: s.getCombatExperience(), crit: s.getCriticalExperience(), total: s.getDungeonExperience(),
    lootKeys: lv ? Object.keys(lv) : null, lootEmpty: lv && lv.isEmpty && lv.isEmpty() };
})()
