(() => {
  const main = window.game.constructor;
  const dv = main.gameHolder.gameView.up_holder.game.dungeonView;
  const a = dv.background.arena;
  const h = a._ch[0];
  const chain = []; let p = h; while (p) { chain.push({ cls: p.constructor.name, pixiParent: !!p._c.parent, inParentPixi: p.parent ? p._c.parent === p.parent._c || (p._c.parent && p._c.parent.parent === p.parent._c) : null, vis: p._c.visible, alpha: p._c.alpha, renderable: p._c.renderable, mask: !!p._c.mask, filters: p._c.filters ? p._c.filters.length : 0 }); p = p.parent; }
  const pb = h._c.getBounds();
  const kids = h._ch.map((k) => ({ cls: k.constructor.name, n: k.name, vis: k._c.visible, a: k._c.alpha, wa: k._c.worldAlpha, ch: k._ch ? k._ch.length : -1 }));
  return { chain, pixiBounds: [pb.x | 0, pb.y | 0, pb.width | 0, pb.height | 0], kids, pixiKids: h._c.children.length };
})()
