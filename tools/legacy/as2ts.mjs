// RETIRED: src/game is now maintained by hand. This script would DELETE src/game and regenerate it from the AS3 sources.
// Kept only for reference (how the original AS3 was translated). Run with --force-overwrite-src-game only if you really mean it.
if (!process.argv.includes('--force-overwrite-src-game')) { console.error('as2ts is retired: src/game is hand-maintained now (see the header of this file).'); process.exit(1); }
process.argv = process.argv.filter((a) => a !== '--force-overwrite-src-game');
// AS3 (JPEXS-decompiled) -> TypeScript transpiler for scripts_main.
// usage: node tools/as2ts.mjs            (all files)   |  node tools/as2ts.mjs path/to/File.as  (print one)
// Output: web/src/game/<package path>/<Name>.ts + web/src/game/index.ts  (// @ts-nocheck; runtime helpers from @/flash/as3)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const SRC = join(ROOT, 'web', 'source', 'scripts_main');
const OUT = join(ROOT, 'web', 'src', 'game');
const PATCHES = join(ROOT, 'web', 'tools', 'legacy', 'as2ts.patches.mjs');
const AS3_EXPORTS = readFileSync(join(ROOT, 'web/src/flash/as3.ts'), 'utf8')
  .match(/export\s*\{([\s\S]*?)\}\s*from|export (?:class|function|const|let) (\w+)/g)
  .flatMap((m) => {
    const b = m.match(/\{([\s\S]*?)\}/);
    if (b) return b[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean);
    return [m.split(/\s+/).pop()];
  });
const AS3_SET = new Set(AS3_EXPORTS);

// ---------------- scanner ----------------
/** returns mask string: same length, code chars kept, strings/comments replaced by spaces (string quotes kept) */
function maskCode(s) {
  let out = '';
  let i = 0; let prevSig = '';
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    if (c === '/' && n === '/') { const e = s.indexOf('\n', i); const end = e < 0 ? s.length : e; out += ' '.repeat(end - i); i = end; continue; }
    if (c === '/' && n === '*') { const e = s.indexOf('*/', i + 2); const end = e < 0 ? s.length : e + 2; out += s.slice(i, end).replace(/[^\n]/g, ' '); i = end; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1; while (j < s.length && s[j] !== c) { if (s[j] === '\\') j++; j++; }
      out += c + ' '.repeat(Math.max(0, j - i - 1)) + c; i = j + 1; prevSig = c; continue;
    }
    if (c === '/' && /[(,=:\[!&|?{};]/.test(prevSig || ';')) { // regex literal
      let j = i + 1; let cls = false;
      while (j < s.length && (s[j] !== '/' || cls) && s[j] !== '\n') { if (s[j] === '\\') j++; else if (s[j] === '[') cls = true; else if (s[j] === ']') cls = false; j++; }
      j++; while (/[a-z]/i.test(s[j] || '')) j++;
      out += ' '.repeat(j - i); i = j; prevSig = '/'; continue;
    }
    out += c; if (!/\s/.test(c)) prevSig = c; i++;
  }
  return out;
}
function matchBrace(mask, open) { // index of '{' -> index of matching '}'
  let d = 0;
  for (let i = open; i < mask.length; i++) { if (mask[i] === '{') d++; else if (mask[i] === '}') { d--; if (!d) return i; } }
  throw new Error('unbalanced');
}
function matchParen(mask, open) {
  let d = 0;
  for (let i = open; i < mask.length; i++) { if (mask[i] === '(') d++; else if (mask[i] === ')') { d--; if (!d) return i; } }
  throw new Error('unbalanced paren');
}
/** replace using regex on masked text, applying to original */
function replaceMasked(src, re, fn) {
  const mask = maskCode(src);
  let out = ''; let last = 0; let m;
  re.lastIndex = 0;
  while ((m = re.exec(mask))) {
    const orig = src.slice(m.index, m.index + m[0].length);
    const groups = m.slice(1).map((g, k) => (g === undefined ? g : srcGroup(src, m, k + 1)));
    out += src.slice(last, m.index) + fn(orig, ...groups);
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  return out + src.slice(last);
}
function srcGroup(src, m, k) {
  // locate group k inside the match by offset (needs 'd' flag)
  if (m.indices) { const [a, b] = m.indices[k] || []; return a === undefined ? undefined : src.slice(a, b); }
  return m[k];
}

// ---------------- type helpers ----------------
const TYPE_RE = String.raw`(?:\*|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*(?:\.<[^;{}()=]*?>)?)`;
const INT_TYPES = new Set(['int', 'uint', 'Number']); // AS3 coerces values stored into these types
const defaultFor = (t) => (t === 'int' || t === 'uint' ? '0' : t === 'Number' ? 'NaN' : t === 'Boolean' ? 'false' : 'null');
const conv = (t, e) => (t === 'int' ? `int(${e})` : t === 'uint' ? `uint(${e})` : t === 'Number' ? `Number(${e})` : e);

// ---------------- class index ----------------
function walk(d) { const o = []; for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== '_assets') o.push(...walk(p)); } else if (f.endsWith('.as')) o.push(p); } return o; }
const files = walk(SRC);
const index = new Map(); // full name -> {pkg, name, file}
const byPkg = new Map();
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const pkg = (s.match(/^package\s*([\w.]*)/m) || [])[1] || '';
  const name = f.slice(f.lastIndexOf(sep) + 1, -3);
  const full = pkg ? pkg + '.' + name : name;
  index.set(full, { pkg, name, file: f });
  if (!byPkg.has(pkg)) byPkg.set(pkg, new Set());
  byPkg.get(pkg).add(name);
}
const outPath = (full) => join(OUT, ...full.split('.')) + '.ts';

// ---------------- inherited member index (for bare member references) ----------------
const EVENT_MEMBERS = ['addEventListener', 'removeEventListener', 'dispatchEvent', 'hasEventListener', 'willTrigger'];
const DO_MEMBERS = [...EVENT_MEMBERS, 'stage', 'parent', 'root', 'x', 'y', 'width', 'height', 'scaleX', 'scaleY', 'rotation', 'alpha', 'visible', 'name',
  'mouseX', 'mouseY', 'filters', 'mask', 'transform', 'loaderInfo', 'getBounds', 'getRect', 'localToGlobal', 'globalToLocal', 'hitTestPoint',
  'hitTestObject', 'cacheAsBitmap', 'blendMode', 'mouseEnabled', 'tabEnabled', 'doubleClickEnabled'];
const DOC_MEMBERS = [...DO_MEMBERS, 'addChild', 'addChildAt', 'removeChild', 'removeChildAt', 'removeChildren', 'getChildAt', 'getChildByName', 'getChildIndex',
  'setChildIndex', 'numChildren', 'contains', 'swapChildren', 'swapChildrenAt', 'mouseChildren', 'tabChildren'];
const SPRITE_MEMBERS = [...DOC_MEMBERS, 'graphics', 'buttonMode', 'useHandCursor', 'hitArea', 'startDrag', 'stopDrag', 'dropTarget'];
const MC_MEMBERS = [...SPRITE_MEMBERS, 'gotoAndStop', 'gotoAndPlay', 'play', 'stop', 'nextFrame', 'prevFrame', 'currentFrame', 'totalFrames',
  'currentLabel', 'currentLabels', 'currentFrameLabel', 'addFrameScript', 'framesLoaded', 'enabled'];
const FLASH_MEMBERS = {
  EventDispatcher: EVENT_MEMBERS, DisplayObject: DO_MEMBERS, InteractiveObject: DO_MEMBERS, DisplayObjectContainer: DOC_MEMBERS,
  Sprite: SPRITE_MEMBERS, MovieClip: MC_MEMBERS, Shape: [...DO_MEMBERS, 'graphics'], Stage: DOC_MEMBERS,
  Array: ['length', 'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'indexOf', 'lastIndexOf', 'concat', 'join', 'reverse', 'sort', 'sortOn', 'forEach', 'filter', 'map', 'some', 'every'],
  TextField: [...DO_MEMBERS, 'text', 'htmlText', 'textColor', 'textWidth', 'textHeight', 'defaultTextFormat', 'setTextFormat'],
};
const classInfo = new Map(); // simple name -> {ext, members:Set}
const INTERFACES = new Set();
for (const [, e] of index) for (const im of maskCode(readFileSync(e.file, 'utf8')).matchAll(/\binterface\s+([\w$]+)/g)) INTERFACES.add(im[1]);
for (const [, e] of index) {
  const s = maskCode(readFileSync(e.file, 'utf8'));
  for (const cm of s.matchAll(/\bclass\s+([\w$]+)(?:\s+extends\s+([\w$.]+))?/g)) {
    const members = new Set(); const statics = new Set();
    for (const v of s.matchAll(/^\s{6}(?:(?:public|private|protected|internal|override|final)\s+)*static\s+(?:(?:public|private|protected|internal|override|final)\s+)*(?:var|const|function)\s+(?:get\s+|set\s+)?([\w$]+)/gm)) statics.add(v[1]);
    for (const v of s.matchAll(/^\s{6}(?:(?:public|private|protected|internal|override|final)\s+)*(?:var|const)\s+([\w$]+)/gm)) members.add(v[1]);
    for (const f of s.matchAll(/^\s{6}(?:(?:public|private|protected|internal|override|final)\s+)*function\s+(?:get\s+|set\s+)?([\w$]+)/gm)) members.add(f[1]);
    const dicts = new Set(); // fields/getters typed Dictionary
    for (const v of s.matchAll(/^\s{6}(?:(?:public|private|protected|internal|override|final|static)\s+)*(?:var\s+|const\s+|function\s+get\s+)([\w$]+)\s*(?:\(\s*\)\s*)?:\s*Dictionary\b/gm)) dicts.add(v[1]);
    if (!classInfo.has(cm[1])) classInfo.set(cm[1], { ext: cm[2]?.split('.').pop(), members, statics, dicts });
  }
}
// classes whose constructor must be splittable (a subclass uses `this` in its super(...) args)
const DEFERRABLE = new Set();
for (const [, e] of index) {
  const s = maskCode(readFileSync(e.file, 'utf8'));
  // constructor body up to its super(...) call
  const ctor = s.match(new RegExp(String.raw`function\s+${e.name.replace(/[$]/g, '\\$')}\s*\([^)]*\)[^{]*\{([\s\S]*?)\bsuper\s*\(([^;]*)\)\s*;`));
  const needs = ctor && (/\bthis\b/.test(ctor[1]) || /\bthis\b/.test(ctor[2]));
  if (!needs) continue;
  let c = classInfo.get(e.name)?.ext;
  while (c && classInfo.has(c)) { DEFERRABLE.add(c); c = classInfo.get(c).ext; }
}
/** rewrite X[k] for Dictionary-typed X: reads -> X.get(k), writes -> X.set(k, v), delete X[k] -> X.delete(k) */
function dictAccess(s, names) {
  const alt = [...names].map(esc).join('|');
  const re = new RegExp(String.raw`(delete\s+)?(?<![\w$.])((?:(?:this|__self|[A-Z][\w$]*)\.)?(?:${alt}))\s*\[`, 'g');
  for (let guard = 0; guard < 2000; guard++) {
    const mk = maskCode(s);
    re.lastIndex = 0;
    let m; let done = true;
    while ((m = re.exec(mk))) {
      const open = m.index + m[0].length - 1;
      let close;
      try { close = matchParen(mk.replace(/\[/g, '(').replace(/\]/g, ')'), open); } catch { continue; }
      const base = s.slice(m.index + (m[1] ? m[1].length : 0), m.index + m[0].length - 1).trim();
      const key = s.slice(open + 1, close);
      const after = mk.slice(close + 1);
      let rep, end;
      if (m[1]) { rep = `${base}.delete(${key})`; end = close + 1; }
      else {
        const asg = after.match(/^\s*([+\-*/%]?)=(?!=)/);
        if (asg) {
          // value: until ; or unbalanced ) ] } or , at depth 0
          let i = close + 1 + asg[0].length; let d = 0;
          for (; i < mk.length; i++) {
            const c = mk[i];
            if ('([{'.includes(c)) d++;
            else if (')]}'.includes(c)) { if (!d) break; d--; }
            else if ((c === ';' || c === ',') && !d) break;
          }
          const val = s.slice(close + 1 + asg[0].length, i).trim();
          rep = asg[1] ? `${base}.set(${key}, ${base}.get(${key}) ${asg[1]} (${val}))` : `${base}.set(${key}, ${val})`;
          end = i;
        } else { rep = `${base}.get(${key})`; end = close + 1; }
      }
      s = s.slice(0, m.index) + rep + s.slice(end);
      done = false;
      break;
    }
    if (done) break;
  }
  return s;
}
/** split code into top-level statements (`...;` or if/else/while blocks) */
function splitStatements(code) {
  const mk = maskCode(code);
  const out = []; let start = 0; let depth = 0;
  for (let i = 0; i < mk.length; i++) {
    const c = mk[i];
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') {
      depth--;
      if (depth === 0 && c === '}') {
        const rest = mk.slice(i + 1).trimStart();
        if (!/^else\b/.test(rest)) { out.push(code.slice(start, i + 1)); start = i + 1; }
      }
    } else if (c === ';' && depth === 0) { out.push(code.slice(start, i + 1)); start = i + 1; }
  }
  if (code.slice(start).trim()) out.push(code.slice(start));
  return out.filter((s) => s.trim());
}
/** fn(args, prefix): replaces "prefix super(args);" (prefix only moved when withPrefix) */
function rewriteSuper(b, fn, withPrefix = false) {
  const mk = maskCode(b);
  const sm = mk.match(/\bsuper\s*\(/);
  if (!sm) return b;
  const open = sm.index + sm[0].length - 1;
  const close = matchParen(mk, open);
  const semi = mk.indexOf(';', close);
  if (!withPrefix) return b.slice(0, sm.index) + fn(b.slice(open + 1, close), '') + b.slice(semi + 1);
  // keep `var` declarations of the prefix at the top (hoisting), move the rest
  return fn(b.slice(open + 1, close), b.slice(0, sm.index)) + b.slice(semi + 1);
}
const NATIVE_CALLABLE =new Set(['Number', 'String', 'Boolean', 'Array', 'Object', 'Error', 'Date', 'RegExp', 'Function']);
const CASTABLE = new Set([...classInfo.keys(), ...[...index.values()].map((e) => e.name), ...Object.keys(FLASH_MEMBERS),
  'Event', 'MouseEvent', 'TimerEvent', 'KeyboardEvent', 'Point', 'Rectangle', 'TextField', 'Bitmap', 'Class', 'Sound', 'SoundChannel']
  .filter((n) => /^[A-Z]/.test(n) && !NATIVE_CALLABLE.has(n)));
function inheritedMembers(cls) {
  const out = new Set(); let c = classInfo.get(cls)?.ext; let guard = 0;
  while (c && guard++ < 20) {
    if (FLASH_MEMBERS[c]) { FLASH_MEMBERS[c].forEach((m) => out.add(m)); break; }
    const ci = classInfo.get(c); if (!ci) break;
    ci.members.forEach((m) => out.add(m)); c = ci.ext;
  }
  return out;
}

// ---------------- member transform ----------------
function stripTypesInParams(p) {
  // "param1:int = 0, ...rest" -> "param1 = 0, ...rest"
  return replaceMasked(p, new RegExp(String.raw`([\w$]+)\s*:\s*` + TYPE_RE, 'gd'), (_, n) => n);
}

/** transform a function body (text between braces, exclusive) */
function transformBody(body, ctx) {
  let s = body;
  // locals: var x:T = e;  /  var x:T;
  const locals = new Map(ctx.params);
  s = replaceMasked(s, new RegExp(String.raw`\b(var|const)\s+([\w$]+)\s*:\s*(` + TYPE_RE + String.raw`)(\s*=\s*)?`, 'gd'), (m, kw, name, type, eq) => {
    locals.set(name, type);
    if (eq) return `${kw} ${name} = `;
    return `${kw} ${name}`;
  });
  // var without initializer -> default (AS3 semantics); only for "var x;" statements
  s = replaceMasked(s, /\b(var)\s+([\w$]+)\s*;/gd, (m, kw, name) => `var ${name} = ${defaultFor(locals.get(name))};`);
  s = forIn(s, locals);
  // anonymous function params/returns
  s = replaceMasked(s, /\bfunction\s*([\w$]*)\s*\(/gd, (m) => m); // keep; handled by fnSignatures
  s = fnSignatures(s);
  // catch(e:Error)
  s = replaceMasked(s, new RegExp(String.raw`catch\s*\(\s*([\w$]+)\s*:\s*` + TYPE_RE + String.raw`\s*\)`, 'gd'), (m, n) => `catch(${n})`);
  // is / as
  s = replaceMasked(s, /([\w$.]+(?:\[[^\]]*\])*)\s+is\s+(String|Number|Boolean|Array|int|uint|Function)\b/gd, (m, a, t) => (
    t === 'String' ? `(typeof ${a} === "string")` : t === 'Array' ? `Array.isArray(${a})` : t === 'Boolean' ? `(typeof ${a} === "boolean")` : t === 'Function' ? `(typeof ${a} === "function")` : `(typeof ${a} === "number")`));
  s = replaceMasked(s, /([\w$.]+(?:\[[^\]]*\])*)\s+is\s+([A-Z][\w$]*)/gd, (m, a, t) => `as3is(${a}, ${t})`);
  // `expr as T`: real classes -> as3as(expr, T) (null when not an instance); interfaces/natives -> dropped
  s = asCasts(s);
  // vectors
  s = replaceMasked(s, /new\s+Vector\.<[^>]*>+\s*\(\s*\)/gd, () => '[]');
  s = replaceMasked(s, /new\s+Vector\.<[^>]*>+\s*\(/gd, () => 'new Array(');
  s = replaceMasked(s, /new\s*<[^>]*>\s*\[/gd, () => '[');
  s = replaceMasked(s, /\bVector\.<[^>]*>+\s*\(/gd, () => '(');
  s = replaceMasked(s, /\btrace\s*\(/gd, () => 'console.log(');
  // function-style casts: Foo(x) -> (x)   (only for classes; natives like String()/int() stay)
  s = replaceMasked(s, /(?<![\w$.])(?<!new\s+)(?<!function\s+)([A-Z][\w$]*)\s*\(/gd, (m, n) => (CASTABLE.has(n) ? '(' : m));
  // int typed locals: initializers and assignments
  const intNames = [...locals].filter(([, t]) => INT_TYPES.has(t)).map(([n]) => n);
  for (const n of intNames) {
    const t = locals.get(n);
    s = replaceMasked(s, new RegExp(String.raw`(?<![\w$.])(var\s+)?(${esc(n)})\s*([+\-*/%]?)=(?!=)([^;]*);`, 'gd'), (m, v, name, op, e) => {
      if (/^\s*=/.test(e)) return m;
      const expr = op ? `${name} ${op} (${e.trim()})` : e.trim();
      return `${v ?? ''}${name} = ${conv(t, expr)};`;
    });
  }
  // int fields: this.x = e;
  for (const [n, t] of ctx.fields) {
    if (!INT_TYPES.has(t)) continue;
    s = replaceMasked(s, new RegExp(String.raw`\bthis\.(${esc(n)})\s*([+\-*/%]?)=(?!=)([^;]*);`, 'gd'), (m, name, op, e) => {
      const expr = op ? `this.${name} ${op} (${e.trim()})` : e.trim();
      return `this.${name} = ${conv(t, expr)};`;
    });
  }
  for (const [n, t] of ctx.statics) {
    if (!INT_TYPES.has(t)) continue;
    s = replaceMasked(s, new RegExp(String.raw`(?<![\w$.])(${esc(n)})\s*([+\-*/%]?)=(?!=)([^;]*);`, 'gd'), (m, name, op, e) => {
      if (locals.has(name)) return m;
      const expr = op ? `${name} ${op} (${e.trim()})` : e.trim();
      return `${name} = ${conv(t, expr)};`;
    });
  }
  // int return type
  if (ctx.ret && INT_TYPES.has(ctx.ret)) {
    s = replaceMasked(s, /\breturn\s+([^;]+);/gd, (m, e) => `return ${conv(ctx.ret, e.trim())};`);
  }
  // bare static member references -> Class.member
  // nested function params are locals too
  for (const fm of maskCode(s).matchAll(/\bfunction\s*[\w$]*\s*\(([^)]*)\)/g)) for (const p of fm[1].split(',')) { const n = p.trim().replace(/^\.\.\./, '').split(/[\s=:]/)[0]; if (n) locals.set(n, '*'); }
  const bareRe = (n) => new RegExp(String.raw`(?<![\w$.'"])(?:(${esc(n)})\b(?!\s*:)|(?<![{,]\s*)(${esc(n)})\b(?=\s*:(?!:)))`, 'gd');
  // bare inherited/own instance members -> __self.member (works inside closures too)
  if (ctx.members && !ctx.isStatic) {
    let hit = false;
    for (const n of ctx.members) {
      if (locals.has(n) || ctx.statics.has(n) || n === ctx.cls || classInfo.has(n) || index.has(n)) continue;
      s = replaceMasked(s, bareRe(n), (m, a, b) => { hit = true; return `__self.${a ?? b}`; });
    }
    if (hit) {
      const sm = ctx.ctorExt ? maskCode(s).match(/\bsuper\s*\(/) : null;
      if (sm) { const mk = maskCode(s); const sc = matchParen(mk, sm.index + sm[0].length - 1); const semi = mk.indexOf(';', sc); s = s.slice(0, semi + 1) + ' const __self = this;' + s.slice(semi + 1); }
      else s = ' const __self = this;' + s;
    }
  }
  for (const [n] of ctx.statics) {
    if (locals.has(n)) continue;
    s = replaceMasked(s, bareRe(n), (m, a, b) => `${ctx.cls}.${a ?? b}`);
  }
  // Dictionary-typed names: indexing -> .get/.set/.delete (object keys keep identity)
  {
    const dn = new Set();
    for (const [n, t] of locals) if (t === 'Dictionary') dn.add(n);
    let c = ctx.cls; let g2 = 0;
    while (c && classInfo.has(c) && g2++ < 20) { for (const n of classInfo.get(c).dicts) dn.add(n); c = classInfo.get(c).ext; }
    if (dn.size) s = dictAccess(s, dn);
  }
  // bare statics inherited from ancestor classes -> Ancestor.member
  let anc = classInfo.get(ctx.cls)?.ext; let g = 0;
  while (anc && classInfo.has(anc) && g++ < 20) {
    for (const n of classInfo.get(anc).statics) {
      if (locals.has(n) || ctx.statics.has(n)) continue;
      s = replaceMasked(s, bareRe(n), (m, a, b) => `${anc}.${a ?? b}`);
    }
    anc = classInfo.get(anc).ext;
  }
  if (ctx.noSuper) s = replaceMasked(s, /\bsuper\s*\(\s*\)\s*;/gd, () => '');
  return s;
}
const esc = (s) => s.replace(/[$]/g, '\\$');

const AS_CLASSES = new Set(['MovieClip', 'Sprite', 'DisplayObject', 'DisplayObjectContainer', 'InteractiveObject', 'Shape', 'TextField', 'Bitmap', 'Stage']);
/** operand to the left of " as ": identifier chain with calls/brackets, or a parenthesized expr */
function asCasts(s) {
  // one cast at a time (innermost/leftmost first), re-masking after each, so nested casts stay consistent
  for (let guard = 0; guard < 500; guard++) {
    const r = asCastOnce(s);
    if (r === null) return s;
    s = r;
  }
  return s;
}
function asCastOnce(s) {
  const mask = maskCode(s);
  const re = new RegExp(String.raw`\s+as\s+(` + TYPE_RE + String.raw`)(?=[\s;,)\].])`, 'g');
  const edits = [];
  let m;
  while (!edits.length && (m = re.exec(mask))) {
    const T = m[1];
    const end = m.index;
    const isClass = AS_CLASSES.has(T) || (classInfo.has(T) && !INTERFACES.has(T));
    if (!isClass) { edits.push({ a: end, b: end + m[0].length, rep: '' }); continue; }
    // scan left for the operand start
    let i = end - 1; let depth = 0;
    while (i >= 0) {
      const c = mask[i];
      if (c === ')' || c === ']') depth++;
      else if (c === '(' || c === '[') { if (!depth) break; depth--; }
      else if (!depth && !/[\w$.]/.test(c)) {
        if (c === '"' || c === "'") { // string literal operand
          const q = c; let j = i - 1; while (j >= 0 && mask[j] !== q) j--; i = j - 1; continue;
        }
        break;
      }
      i--;
    }
    const a = i + 1;
    if (a >= end) { edits.push({ a: end, b: end + m[0].length, rep: '' }); continue; }
    edits.push({ a, b: end + m[0].length, rep: `as3as(${s.slice(a, end)}, ${T})` });
  }
  if (!edits.length) return null;
  const e = edits[0];
  return s.slice(0, e.a) + e.rep + s.slice(e.b);
}
function forIn(s, locals) {
  const mask = maskCode(s);
  const re = /\bfor(\s+each)?\s*\(\s*(?:var\s+)?([\w$]+)\s+in\s+/g;
  let m; const edits = [];
  while ((m = re.exec(mask))) {
    const open = mask.indexOf('(', m.index);
    const close = matchParen(mask, open);
    const fn = m[1] ? 'as3values' : 'as3keys';
    const n = m[2];
    const expr = s.slice(m.index + m[0].length, close);
    edits.push({ a: m.index, b: close + 1, rep: `for (${locals.has(n) ? '' : 'var '}${n} of ${fn}(${expr}))` });
  }
  let out = s;
  for (const e of edits.sort((x, y) => y.a - x.a)) out = out.slice(0, e.a) + e.rep + out.slice(e.b);
  return out;
}
function fixForOf(s) {
  const mask = maskCode(s);
  const re = /for \((?:var )?[\w$]+ of as3(?:values|keys)\(/g;
  let m; const ins = [];
  while ((m = re.exec(mask))) {
    const forParen = m.index + 4;
    const close = matchParen(mask, forParen);
    ins.push(close);
  }
  let out = s;
  for (const i of ins.sort((a, b) => b - a)) out = out.slice(0, i) + ')' + out.slice(i);
  return out;
}

/** function signatures inside bodies: function name?(p:T=..):R { -> function name?(p=..) { */
function fnSignatures(s) {
  const mask = maskCode(s);
  const re = /\bfunction\b\s*([\w$]*)\s*\(/g;
  let m; const edits = [];
  while ((m = re.exec(mask))) {
    const open = mask.indexOf('(', m.index + 8);
    const close = matchParen(mask, open);
    const after = mask.slice(close + 1).match(new RegExp(String.raw`^\s*:\s*` + TYPE_RE));
    edits.push({ a: open + 1, b: close, rep: stripTypesInParams(s.slice(open + 1, close)), retEnd: after ? close + 1 + after[0].length : null });
  }
  let out = s;
  for (const e of edits.sort((x, y) => y.a - x.a)) {
    if (e.retEnd !== null) out = out.slice(0, e.b + 1) + out.slice(e.retEnd);
    out = out.slice(0, e.a) + e.rep + out.slice(e.b);
  }
  return out;
}

// ---------------- class/interface transform ----------------
function parseParams(p) {
  const params = new Map();
  for (const part of p.split(',')) {
    const m = part.trim().match(new RegExp(String.raw`^(?:\.\.\.)?([\w$]+)\s*(?::\s*(` + TYPE_RE + '))?'));
    if (m) params.set(m[1], m[2] || '*');
  }
  return params;
}

function transformClass(src, kind, name, ext, impl, body, isExported) {
  const mask = maskCode(body);
  const members = [];
  // split members at depth 0 of body
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i])) i++;
    if (i >= body.length) break;
    // find either ';' or '{' at depth 0 (parens tracked)
    let j = i; let paren = 0;
    while (j < body.length) {
      const c = mask[j];
      if (c === '(') paren++; else if (c === ')') paren--;
      else if (!paren && c === ';') { members.push({ head: body.slice(i, j), body: null }); j++; break; }
      else if (!paren && c === '{' && /\b(var|const)\s/.test(mask.slice(i, j)) && !/\bfunction\b/.test(mask.slice(i, j))) {
        j = matchBrace(mask, j) + 1; continue; // object literal initializer
      }
      else if (!paren && c === '{') {
        const e = matchBrace(mask, j);
        members.push({ head: body.slice(i, j), body: body.slice(j + 1, e) });
        j = e + 1; break;
      }
      j++;
    }
    i = j;
  }
  const fields = new Map(); const statics = new Map();
  for (const mb of members) {
    const h = mb.head.replace(/\s+/g, ' ').trim();
    const v = h.match(new RegExp(String.raw`\b(var|const)\s+([\w$]+)\s*:\s*(` + TYPE_RE + ')'));
    if (v && !/\bfunction\b/.test(h)) { (/\bstatic\b/.test(h) ? statics : fields).set(v[2], v[3]); mb.var = { kind: v[1], name: v[2], type: v[3], isStatic: /\bstatic\b/.test(h) }; }
    else {
      const f = h.match(/\bfunction\s+(?:(get|set)\s+)?([\w$]+)\s*\(/);
      if (f) {
        mb.fn = { acc: f[1], name: f[2], isStatic: /\bstatic\b/.test(h) };
        if (mb.fn.isStatic && !f[1]) statics.set(f[2], 'Function');
        if (mb.fn.isStatic && f[1]) statics.set(f[2], 'accessor');
      }
    }
  }
  const out = [];
  const members_ = members.filter((x) => x.fn && !x.fn.acc).map((x) => ({ name: x.fn.name, isStatic: x.fn.isStatic }))
    .concat(members.filter((x) => x.fn && x.fn.acc && !x.fn.isStatic).map((x) => ({ name: x.fn.name, isStatic: false })));
  const protoDefaults = [];
  const head = kind === 'interface'
    ? `${isExported ? 'export ' : ''}interface ${name}${ext ? ' extends ' + ext : ''} {`
    : `${isExported ? 'export ' : ''}class ${name}${ext ? ' extends ' + ext : ''} {`;
  out.push(head);
  for (const mb of members) {
    if (mb.var) {
      const { kind: k, name: n, type, isStatic } = mb.var;
      if (kind === 'interface') continue;
      const init = mb.head.match(/=\s*([\s\S]*)$/);
      if (init) {
        let e = transformBody(init[1].trim(), { params: new Map(), fields: new Map(), statics, cls: name, ret: null });
        e = conv(type, e);
        out.push(`  ${isStatic ? 'static ' : ''}${k === 'const' ? 'readonly ' : ''}${n} = ${e};`);
      } else if (isStatic) {
        out.push(`  static ${n} = ${defaultFor(type)};`);
      } else {
        protoDefaults.push(`${name}.prototype.${n} = ${defaultFor(type)};`);
        out.push(`  declare ${n}: any;`);
      }
      continue;
    }
    if (mb.fn) {
      const h = mb.head;
      const open = h.indexOf('(');
      const close = matchParen(maskCode(h), open);
      const paramsSrc = h.slice(open + 1, close);
      const ret = (h.slice(close + 1).match(new RegExp(String.raw`:\s*(` + TYPE_RE + ')')) || [])[1];
      const params = parseParams(paramsSrc);
      let pclean = stripTypesInParams(paramsSrc);
      const { acc, name: fname, isStatic } = mb.fn;
      if (kind === 'interface' || mb.body === null) {
        if (kind === 'interface') out.push(`  ${acc ? acc + ' ' : ''}${fname}(${pclean}): any;`);
        continue;
      }
      const isCtor = fname === name && !acc;
      const members = new Set([...inheritedMembers(name), ...fields.keys(), ...members_.filter((x) => !x.isStatic).map((x) => x.name)]);
      let b = transformBody(mb.body, { params, fields, statics, cls: name, ret: isCtor ? null : ret, noSuper: !ext, members, isStatic, ctorExt: isCtor && !!ext });
      // int params
      const intParams = [...params].filter(([, t]) => INT_TYPES.has(t));
      const pre = intParams.map(([p, t]) => `${p} = ${conv(t, p)};`).join(' ');
      if (pre) {
        if (isCtor && ext) {
          // after super(...)
          const sm = maskCode(b).match(/\bsuper\s*\(/);
          if (sm) { const sc = matchParen(maskCode(b), sm.index + sm[0].length - 1); const semi = b.indexOf(';', sc); b = b.slice(0, semi + 1) + ' ' + pre + b.slice(semi + 1); }
          else b = pre + b;
        } else b = ' ' + pre + b;
      }
      if (isCtor && ext && !/\bsuper\s*\(/.test(maskCode(b))) b = ' super();' + b;
      if (isCtor) {
        const parentDef = !!ext && DEFERRABLE.has(ext);
        if (DEFERRABLE.has(name)) {
          // two-phase construction: subclasses may pass `this`-dependent args to super
          const ib = ext ? rewriteSuper(b, (args) => (parentDef ? `this.__init_${ext}(${args});` : '')) : b;
          out.push(`  constructor(...__a) { ${ext ? `super(${parentDef ? '__DEFER' : ''}); ` : ''}if (__a[0] !== __DEFER) this.__init_${name}(...__a); }`);
          out.push(`  __init_${name}(${pclean}) {${ib}}`);
          continue;
        }
        if (parentDef) b = rewriteSuper(b, (args, prefix) => `super(__DEFER); ${prefix} this.__init_${ext}(${args});`, true);
        else if (ext) b = rewriteSuper(b, (args, prefix) => {
          if (!/\bthis\b|__self/.test(maskCode(prefix))) return `${prefix} super(${args});`;
          // statements touching `this` must follow super(); the rest (e.g. computing super args) stays before
          const st = splitStatements(prefix);
          const pre = st.filter((x) => !/\bthis\b|__self/.test(maskCode(x))).join(' ');
          const post = st.filter((x) => /\bthis\b|__self/.test(maskCode(x))).join(' ');
          return `${pre} super(${args}); ${post}`;
        }, true);
        if (ext && b.includes(' const __self = this;')) {
          b = b.replace(' const __self = this;', '');
          b = rewriteSuper(b, (args) => `super(${args}); const __self = this;`);
        }
      }
      const sig = isCtor ? `constructor(${pclean})` : `${isStatic ? 'static ' : ''}${acc ? acc + ' ' : ''}${fname}(${pclean})`;
      out.push(`  ${sig} {${b}}`);
    }
  }
  out.push('}');
  if (kind === 'class') {
    out.push(...protoDefaults);
    out.push(`bindMethods(${name});`);
  }
  return out.join('\n');
}

// ---------------- file transform ----------------
function transformFile(file) {
  const src = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/§/g, '');
  const me = [...index.values()].find((e) => e.file === file);
  const mask = maskCode(src);
  const pm = mask.match(/package\s*([\w.]*)\s*\{/);
  const pOpen = pm.index + pm[0].length - 1;
  const pClose = matchBrace(mask, pOpen);
  const inner = src.slice(pOpen + 1, pClose);
  const tail = src.slice(pClose + 1);
  const imports = [];
  const defs = [];
  const handle = (text, exported) => {
    const tm = maskCode(text);
    // imports
    for (const im of text.matchAll(/^\s*import\s+([\w.*]+)\s*;/gm)) imports.push(im[1]);
    // definitions: class / interface / function at depth 0
    const re = /(?:^|\n)[ \t]*((?:(?:public|internal|final|dynamic)\s+)*)(class|interface|function)\s+([\w$]+)/g;
    let m;
    while ((m = re.exec(tm))) {
      const kind = m[2], name = m[3];
      const start = m.index;
      const braceAt = tm.indexOf('{', start + m[0].length);
      const end = matchBrace(tm, braceAt);
      const header = text.slice(start, braceAt);
      const body = text.slice(braceAt + 1, end);
      if (kind === 'function') {
        const open = header.indexOf('(');
        const close = matchParen(maskCode(header), open);
        const params = parseParams(header.slice(open + 1, close));
        const ret = (header.slice(close + 1).match(new RegExp(String.raw`:\s*(` + TYPE_RE + ')')) || [])[1];
        const b = transformBody(body, { params, fields: new Map(), statics: new Map(), cls: name, ret });
        defs.push(`${exported ? 'export ' : ''}function ${name}(${stripTypesInParams(header.slice(open + 1, close))}) {${b}}`);
      } else {
        const ext = (header.match(/\bextends\s+([\w$.,\s]+?)(?:\s+implements\b|\s*$)/) || [])[1]?.trim();
        const impl = (header.match(/\bimplements\s+([\w$.,\s]+)/) || [])[1]?.trim();
        defs.push(transformClass(text, kind, name, kind === 'interface' ? ext : ext?.split('.').pop(), impl, body, exported));
      }
      re.lastIndex = end;
    }
  };
  handle(inner, true);
  const nPublic = defs.length;
  handle(tail, false);
  const code = defs.join('\n\n');
  const defName = (d) => (d.match(/(?:class|interface|function)\s+([\w$]+)/) || [])[1];
  const names = defs.slice(0, nPublic).map(defName).filter(Boolean);
  const localNames = new Set(defs.map(defName).filter(Boolean));
  const types = new Set(defs.filter((d) => /^(?:export )?interface\s/.test(d)).map(defName)); // erased at run time
  return { full: me.pkg ? me.pkg + '.' + me.name : me.name, file, code, names, localNames, types };
}

/** names a module needs while it is being evaluated (extends, static initializers, prototype defaults) */
function loadTimeDeps(code) {
  const deps = new Set();
  for (const m of code.matchAll(/\bclass\s+[\w$]+\s+extends\s+([\w$]+)/g)) deps.add(m[1]);
  for (const line of code.split('\n')) {
    if (/^\s*static\s+(readonly\s+)?[\w$]+\s*=/.test(line) || /^[\w$]+\.prototype\./.test(line)) {
      for (const id of maskCode(line.replace(/^\s*static\s+(readonly\s+)?[\w$]+\s*=/, '')).match(/(?<![\w$.])[A-Za-z_$][\w$]*/g) || []) deps.add(id);
    }
  }
  return deps;
}
const usedIdents = (code) => new Set(maskCode(code).match(/(?<![\w$.])[A-Za-z_$][\w$]*/g) || []);
const modSpec = (full) => '@/game/' + full.replace(/\./g, '/');

// ---------------- main ----------------
// Output: one module per AS3 file under src/game/<package path>/<Name>.ts, plus src/game/index.ts,
// which imports every module in load order (base classes / static-init dependencies first) and re-exports them.
const one = process.argv[2];
if (one) {
  console.log(transformFile(join(process.cwd(), one)).code);
} else {
  const units = []; const fails = [];
  for (const [, e] of index) { try { units.push(transformFile(e.file)); } catch (err) { fails.push(e.file + ': ' + err.message); } }
  // hand patches, applied per module before imports are resolved
  if (existsSync(PATCHES)) {
    const { PATCHES: list } = await import('file://' + PATCHES);
    for (const [desc, re, rep] of list) {
      let hit = false;
      for (const u of units) if (re.test(u.code)) { u.code = u.code.replace(re, rep); hit = true; }
      if (!hit) console.warn('PATCH NOT APPLIED:', desc);
    }
  }
  const owner = new Map(); // exported name -> unit
  for (const u of units) for (const n of u.names) {
    if (owner.has(n)) console.warn('duplicate exported name:', n);
    owner.set(n, u);
  }
  for (const n of AS3_SET) if (owner.has(n)) console.warn('game class shadows as3 export:', n);
  // per-module imports; load-time deps first so they are evaluated before this module's body
  for (const u of units) {
    const used = usedIdents(u.code);
    const ext = (n) => { const o = owner.get(n); return o && o !== u && !u.localNames.has(n) ? o : null; };
    u.hard = [...new Set([...loadTimeDeps(u.code)].map(ext).filter(Boolean))];
    const want = new Map(); // module -> names
    for (const n of [...used].sort()) { const o = ext(n); if (o) { if (!want.has(o)) want.set(o, []); want.get(o).push(n); } }
    u.want = want;
    u.imports = [...want.keys()].sort((a, b) => (u.hard.includes(b) - u.hard.includes(a)) || a.full.localeCompare(b.full));
    u.late = new Set(); // imports routed through index.ts to break an import cycle (used only inside function bodies)
    u.as3 = [...AS3_SET].filter((n) => used.has(n) && !owner.has(n) && !u.localNames.has(n)).sort();
  }
  // load order: topological on load-time deps
  const order = []; const state = new Map();
  const visit = (u, stack) => {
    const s = state.get(u);
    if (s === 2) return;
    if (s === 1) { console.warn('load-time dependency cycle:', [...stack.map((x) => x.full), u.full].join(' -> ')); return; }
    state.set(u, 1);
    for (const d of u.hard) visit(d, [...stack, u]);
    state.set(u, 2); order.push(u);
  };
  for (const u of [...units].sort((a, b) => a.full.localeCompare(b.full))) visit(u, []);
  // simulate ES module evaluation from index.ts: every load-time dep must be evaluated before the module body runs.
  // When module D (still evaluating) reaches, through its import C, a module that needs D at load time
  // (typically a base class creating one of its subclasses), D's import of C is routed through index.ts instead.
  let bad = [];
  for (let pass = 0; pass < 100; pass++) {
    const done = new Set(); const stack = []; let fixed = 0;
    bad = [];
    const evaluate = (u) => {
      if (done.has(u) || stack.includes(u)) return;
      stack.push(u);
      for (const d of u.imports) if (!u.late.has(d)) evaluate(d);
      stack.pop();
      for (const d of u.hard) {
        if (done.has(d)) continue;
        const at = stack.indexOf(d);
        const via = at >= 0 ? (stack[at + 1] ?? u) : null;
        if (via && !d.hard.includes(via)) { d.late.add(via); fixed++; }
        else bad.push(`${u.full} needs ${d.full} at load time, but it is not evaluated yet (import cycle)`);
      }
      done.add(u);
    };
    for (const u of order) evaluate(u);
    if (!fixed) break;
  }
  for (const b of bad) console.warn('LOAD ORDER:', b);
  for (const u of units) {
    const head = ['// @ts-nocheck', `// GENERATED from ${relative(ROOT, u.file).replace(/\\/g, '/')} by tools/as2ts.mjs — do not edit; patches go in tools/as2ts.patches.mjs`];
    if (u.as3.length) head.push(`import { ${u.as3.join(', ')} } from '@/flash/as3';`);
    const late = [];
    for (const o of u.imports) {
      if (u.late.has(o)) late.push(...u.want.get(o));
      else head.push(`import ${u.want.get(o).every((n) => o.types.has(n)) ? 'type ' : ''}{ ${u.want.get(o).join(', ')} } from '${modSpec(o.full)}';`);
    }
    if (late.length) head.push('// import cycle (these modules need this one at load time): resolved through the index, used only at run time',
      `import { ${late.sort().join(', ')} } from '@/game/index';`);
    u.text = head.join('\n') + '\n\n' + u.code + '\n';
  }
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  for (const u of units) { const p = outPath(u.full); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, u.text); }
  const idx = ['// GENERATED by tools/as2ts.mjs — do not edit.',
    '// Entry point of the game code: imports every module in load order and re-exports the public classes.', ''];
  for (const u of order) {
    const vals = u.names.filter((n) => !u.types.has(n)); const types = u.names.filter((n) => u.types.has(n));
    if (vals.length) idx.push(`export { ${vals.join(', ')} } from '${modSpec(u.full)}';`);
    if (types.length) idx.push(`export type { ${types.join(', ')} } from '${modSpec(u.full)}';`);
    if (!u.names.length) idx.push(`import '${modSpec(u.full)}';`);
  }
  writeFileSync(join(OUT, 'index.ts'), idx.join('\n') + '\n');
  console.log(`transpiled ${units.length}/${index.size} files into ${relative(ROOT, OUT)}`);
  for (const f of fails) console.log('FAIL', f);
  if (bad.length || fails.length) process.exitCode = 1;
}
