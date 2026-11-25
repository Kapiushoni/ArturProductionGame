(() => {
  const L = game.constructor.theLoader;
  const P = Object.getPrototypeOf(L);
  const orig = P.isLoaded;
  L.isLoaded = function (n) { const r = orig.call(this, n); console.log('isLoaded', n, '->', r, 'state=', this.fsm.getActualState().getName()); return r; };
  return { state: L.fsm.getActualState().getName(), states: L.states };
})()
