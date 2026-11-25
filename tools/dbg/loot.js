(() => {
  const find = (o, name) => { if (o.constructor.name === name) return o; for (const c of o._ch || []) { const r = find(c, name); if (r) return r; } return null; };
  const w = find(game, 'WinWindow');
  if (!w) return 'no WinWindow';
  const l = w.loot.loot;
  const desc = (x) => { try { return x && (x.getName ? x.getName() : x.constructor.name); } catch (e) { return String(e); } };
  return { lootType: l && l.constructor.name, lootKeys: l && Object.keys(l), items: l && l.items ? Array.from(l.items).map(desc) : null, slots: w.loot.slots && Array.from(w.loot.slots).map((s) => s && s.constructor.name), showing: w.loot.showing };
})()
