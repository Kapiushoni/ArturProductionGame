// Hand patches applied to the generated bundle (src/game/game.ts) by tools/as2ts.mjs.
// Each patch: [description, regex, replacement (string or function)]. A patch that no longer matches is reported.
const PATCHES = [
  ['sound mixer: a sound that is not loaded yet is skipped instead of throwing',
    /(play\(param1, param2 = 0, param3 = false, param4 = -1\) \{)/,
    '$1 if (!this.sounds.get(param1)) return null;'],
  ['cbSound: end/loop timers follow the audio clock (game clock may run x2 or drop frames -> music overlapped)',
    /export class cbSound \{[\s\S]*?\nbindMethods\(cbSound\);/,
    (m) => m.replace(/new Timer\(/g, 'new AudioTimer(')],
  ['AnimatedScreen.leave on a screen already cleared (Pause after "leave dungeon" in special dungeons): finish instead of throwing, so the confirmation popup closes',
    /(  leave\(param1 = null\) \{ const __self = this;\n\s*)(__self\.bg\.gotoAndPlay\(this\.leaveLabel\);)/,
    '$1if (!__self.bg) { if (param1) param1(); return; }\n         $2'],
  ['Screen.pop when already detached',
    /(  pop\(\) \{[^\n]*\n\s*)(__self\.parent\.removeChild\(this\);|this\.parent\.removeChild\(this\);)/,
    '$1if (this.parent) $2'],
  ['legendary dungeons (31 ice, 32 fire) are always open instead of only on their event days',
    /(export class LegendaryLevel extends Level \{\n)/,
    '$1  isLocked() { return false; }\n  isUnlocked() { return true; }\n'],
  ['import AudioTimer into the bundle',
    /^import \{ /m,
    'import { AudioTimer, '],
];

export function patch(code) {
  for (const [desc, re, rep] of PATCHES) {
    if (!re.test(code)) { console.warn('PATCH NOT APPLIED:', desc); continue; }
    code = code.replace(re, rep);
  }
  return code;
}
