(() => {
  const main = window.game.constructor;
  const dv = main.gameHolder.gameView.up_holder.game.dungeonView;
  const a = dv.background.arena;
  return a._ch.map((o) => `${o.constructor.name}@${Math.round(o.x)},${Math.round(o.y)} f${o.currentFrame}/${o.totalFrames} ${o.currentLabel} vis=${o.visible} a=${o.alpha} sx=${o.scaleX}`).join(' | ') + ' || layers:' + dv.background._ch.map((l) => l._ch.length).join(',');
})()
