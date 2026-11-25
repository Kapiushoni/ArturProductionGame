(() => {
  const find = (o, name) => { if (o.constructor.name === name) return o; for (const c of o._ch || []) { const r = find(c, name); if (r) return r; } return null; };
  const w = find(game, 'WinWindow');
  if (!w) return 'no WinWindow';
  const l = w.loot.loot;
  return l.slots.map((s) => { const c = s.getContent && s.getContent(); return c ? (c.getName ? c.getName() : c.constructor.name) : null; });
})()
