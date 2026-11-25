(() => {
  const pc = window.mc._c;
  const groups = pc.children.filter((c) => c.mask);
  const r = [];
  for (const g of groups) {
    const m = g.mask;
    const b = m.getBounds();
    r.push({ maskBounds: [b.x, b.y, b.width, b.height].map(Math.round), tex: [m.texture.frame.x, m.texture.frame.y, m.texture.frame.width, m.texture.frame.height], groupBounds: (() => { const gb = g.getBounds(); return [gb.x, gb.y, gb.width, gb.height].map(Math.round); })() });
  }
  return r;
})()
