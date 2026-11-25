(() => {
  const mx = game.constructor.soundManager.soundMixer;
  const orig = Object.getPrototypeOf(mx).play;
  mx.play = function (k, ...a) { if (!this.sounds.get(k)) console.log('MISSING SOUND', k, new Error().stack.split('\n').slice(2, 6).join(' <- ')); return orig.call(this, k, ...a); };
  return 'hooked';
})()
