(() => {
  const m = window.mc;
  const pc = m._c;
  const info = pc.children.map((c) => ({ type: c.constructor.name, kids: c.children.length, mask: c.mask ? c.mask.constructor.name : null, vis: c.visible, renderable: c.renderable, alpha: c.alpha }));
  // turn masks off to see if the sand is there at all
  for (const c of pc.children) if (c.mask) c.mask = null;
  return info;
})()
