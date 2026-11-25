(() => {
  const sm = game.constructor.soundManager;
  const out = {};
  for (const k of Object.keys(sm)) { const v = sm[k]; if (v && v.sounds) out[k] = [...v.sounds.keys()].slice(0, 80); }
  return { smKeys: Object.keys(sm), mixers: out };
})()
