(async () => {
  const m = { main: window.game.constructor };
  const dv = m.main.gameHolder.gameView.up_holder.game.dungeonView;
  const a = dv.background.arena;
  const d = (o) => o ? { n: o.name, cls: o.constructor.name, x: Math.round(o.x), y: Math.round(o.y), vis: o.visible, a: o.alpha, ch: o.numChildren, fr: o.currentFrame, tf: o.totalFrames,
    b: (() => { const r = o.getBounds(null); return [r.x | 0, r.y | 0, r.width | 0, r.height | 0]; })() } : null;
  return { arena: d(a), kids: a._ch.map(d), bgkids: dv.background._ch.map(d) };
})()
