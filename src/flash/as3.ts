// AS3 standard library surface used by the transpiled game code.
import { lib } from './library';
import { EventDispatcher, Event, IOErrorEvent, ProgressEvent } from './events';
import { MovieClip } from './display';
import { clock, Timer } from './clock';

export { DisplayObject, DisplayObjectContainer, InteractiveObject, Sprite, MovieClip, Shape, Stage, Bitmap, FrameLabel, Graphics } from './display';
export { Event, MouseEvent, TimerEvent, KeyboardEvent, IOErrorEvent, ProgressEvent, StatusEvent, EventDispatcher } from './events';
export { Point, Rectangle, ColorTransform } from './geom';
export { TextField, TextFormat, TextFieldAutoSize, TextFormatAlign, TextFieldType, AntiAliasType } from './text';
export { Timer, getTimer, setTimeout, clearTimeout, setInterval, clearInterval } from './clock';
export { ColorMatrixFilterAS as ColorMatrixFilter, GlowFilterAS as GlowFilter, DropShadowFilterAS as DropShadowFilter, BlurFilterAS as BlurFilter } from './filters';

export type IEventDispatcher = EventDispatcher;
export const IEventDispatcher = EventDispatcher;
export type Class = any;

// ---------------- numeric conversions ----------------
export function int(v: any): number { const n = Number(v); return Number.isFinite(n) ? n | 0 : 0; }
(int as any).MAX_VALUE = 2147483647; (int as any).MIN_VALUE = -2147483648;
export function uint(v: any): number { const n = Number(v); return Number.isFinite(n) ? n >>> 0 : 0; }
(uint as any).MAX_VALUE = 4294967295; (uint as any).MIN_VALUE = 0;

// ---------------- iteration / types ----------------
export function as3keys(o: any): any[] {
  if (o == null) return [];
  if (o instanceof Map) return [...o.keys()];
  if (Array.isArray(o)) return Object.keys(o);
  const out: string[] = [];
  for (const k in o) out.push(k);
  return out;
}
export function as3values(o: any): any[] {
  if (o == null) return [];
  if (o instanceof Map) return [...o.values()];
  if (Array.isArray(o)) return o.slice();
  const out: any[] = [];
  for (const k in o) out.push(o[k]);
  return out;
}
export function as3is(v: any, T: any): boolean {
  if (v == null || !T) return false;
  if (typeof T === 'function') { try { return v instanceof T; } catch { return false; } }
  return false;
}

/** AS3 method closures are bound: emulate with cached bound getters on the prototype */
export function bindMethods(C: any) {
  const p = C.prototype;
  for (const k of Object.getOwnPropertyNames(p)) {
    if (k === 'constructor') continue;
    const d = Object.getOwnPropertyDescriptor(p, k)!;
    if (typeof d.value !== 'function') continue;
    const orig = d.value;
    Object.defineProperty(p, k, {
      configurable: true, enumerable: false,
      get() {
        if (this === p) return orig;
        let m: Map<any, any> = this.__bm;
        if (!m) { m = new Map(); Object.defineProperty(this, '__bm', { value: m }); }
        let f = m.get(orig);
        if (!f) { f = orig.bind(this); m.set(orig, f); }
        return f;
      },
      set(v) { Object.defineProperty(this, k, { value: v, writable: true, configurable: true }); },
    });
  }
}

/** Dictionary: plain object (string keys). Object-keyed dictionaries are fixed by hand. */
/**
 * Dictionary: a Map (object keys keep identity) behind a Proxy so untyped code can still use
 * dict["key"] / for-in with string keys. Typed accesses are rewritten by as2ts to .get/.set/.delete.
 */
const MAP_PROTO = Map.prototype as any;
const dictHandler: ProxyHandler<Map<any, any>> = {
  get(m, k) {
    if (k === '__isDict') return true;
    if (typeof k === 'symbol' || k in MAP_PROTO) { const v = Reflect.get(m, k, m); return typeof v === 'function' ? v.bind(m) : v; }
    return m.get(k);
  },
  set(m, k, v) { m.set(k, v); return true; },
  has(m, k) { return m.has(k); },
  deleteProperty(m, k) { m.delete(k); return true; },
  ownKeys(m) { return [...m.keys()].filter((k) => typeof k === 'string' || typeof k === 'number').map(String); },
  getOwnPropertyDescriptor(m, k) { return m.has(k) ? { value: m.get(k), enumerable: true, configurable: true, writable: true } : undefined; },
};
/** AS3 Dictionary treats primitive keys by string value (dict[1] === dict["1"]); objects by identity */
const nk = (k: any) => (typeof k === 'number' || typeof k === 'boolean' ? String(k) : k);
class AS3Map extends Map<any, any> {
  get(k: any) { return super.get(nk(k)); }
  set(k: any, v: any) { return super.set(nk(k), v); }
  has(k: any) { return super.has(nk(k)); }
  delete(k: any) { return super.delete(nk(k)); }
}
export class Dictionary {
  constructor(_weak = false) { return new Proxy(new AS3Map(), dictHandler) as any; }
  static [Symbol.hasInstance](v: any) { return !!v && v.__isDict === true; }
}
/** typing of the Map behind the Proxy (plus dict[key] access) */
export interface Dictionary {
  get(key: any): any;
  set(key: any, value: any): any;
  has(key: any): boolean;
  delete(key: any): boolean;
  [key: string]: any;
}
/** AS3 Date properties (polyfilled below) */
declare global {
  interface Date {
    time: number;
  }
}

export function getQualifiedClassName(v: any): string {
  if (v == null) return 'null';
  const C = typeof v === 'function' ? v : v.constructor;
  return C?._libName ?? C?.name ?? 'Object';
}
export function getDefinitionByName(name: string): any { return lib.getClass(name); }
export function describeType(_v: any) { return null; }

// ---------------- Date / Error polyfills ----------------
const D = Date.prototype as any;
const acc = (name: string, get: () => any, set?: (v: any) => void) => {
  if (!Object.getOwnPropertyDescriptor(D, name)) Object.defineProperty(D, name, { get, set, configurable: true });
};
acc('time', function (this: Date) { return this.getTime(); }, function (this: Date, v) { this.setTime(v); });
acc('fullYear', function (this: Date) { return this.getFullYear(); }, function (this: Date, v) { this.setFullYear(v); });
acc('month', function (this: Date) { return this.getMonth(); }, function (this: Date, v) { this.setMonth(v); });
acc('date', function (this: Date) { return this.getDate(); }, function (this: Date, v) { this.setDate(v); });
acc('day', function (this: Date) { return this.getDay(); });
acc('hours', function (this: Date) { return this.getHours(); }, function (this: Date, v) { this.setHours(v); });
acc('minutes', function (this: Date) { return this.getMinutes(); }, function (this: Date, v) { this.setMinutes(v); });
acc('seconds', function (this: Date) { return this.getSeconds(); }, function (this: Date, v) { this.setSeconds(v); });
acc('milliseconds', function (this: Date) { return this.getMilliseconds(); });
acc('fullYearUTC', function (this: Date) { return this.getUTCFullYear(); });
acc('monthUTC', function (this: Date) { return this.getUTCMonth(); });
acc('dateUTC', function (this: Date) { return this.getUTCDate(); });
(Error.prototype as any).getStackTrace = function () { return this.stack; };

export class DateTimeFormatter {
  pattern = 'yyyy-MM-dd';
  constructor(public locale = 'en-US') {}
  setDateTimePattern(p: string) { this.pattern = p; }
  /** Unicode pattern subset: 'quoted literals', yyyy MM M dd d HH mm ss EEEE EEE (en-US names, as the game expects) */
  format(d: Date) {
    const pad = (n: number, l = 2) => String(n).padStart(l, '0');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tok: Record<string, string> = {
      yyyy: String(d.getFullYear()), MM: pad(d.getMonth() + 1), M: String(d.getMonth() + 1), dd: pad(d.getDate()), d: String(d.getDate()),
      HH: pad(d.getHours()), mm: pad(d.getMinutes()), ss: pad(d.getSeconds()), EEEE: days[d.getDay()], EEE: days[d.getDay()].slice(0, 3),
    };
    return this.pattern.replace(/'([^']*)'|EEEE|EEE|yyyy|MM|dd|HH|mm|ss|M|d/g, (t, lit) => (lit !== undefined ? lit : tok[t]));
  }
}

// ---------------- net ----------------
/** where loose files live (served from public/) */
export const paths = {
  /** exact-name redirects, e.g. locale.txt -> locale_ru.txt */
  rewrite: {} as Record<string, string>,
  /** text post-processing of loaded data files (by requested name) */
  transform: {} as Record<string, (text: string) => string>,
  resolve(url: string) {
    url = paths.rewrite[url] ?? url;
    if (/^(https?:|\.\/|\/)/.test(url)) return url;
    if (url.startsWith('sounds/')) return './' + url;
    if (/\.(mp3|ogg|m4a|opus|webm)$/.test(url)) return './sounds/' + url;
    return './data/' + url;
  },
};

export class URLRequest { method = 'GET'; data: any = null; constructor(public url = '') {} }
export class URLLoader extends EventDispatcher {
  data: any = null; dataFormat = 'text'; bytesLoaded = 0; bytesTotal = 0;
  constructor(req?: URLRequest) { super(); if (req) this.load(req); }
  load(req: URLRequest) {
    fetch(paths.resolve(req.url)).then(async (r) => {
      if (!r.ok) throw new Error(r.status + ' ' + req.url);
      this.data = await r.text();
      const tf = paths.transform[req.url]; if (tf) this.data = tf(this.data);
      this.bytesLoaded = this.bytesTotal = this.data.length;
      const p = new ProgressEvent(ProgressEvent.PROGRESS); p.bytesLoaded = p.bytesTotal = this.bytesTotal; this.dispatchEvent(p);
      this.dispatchEvent(new Event(Event.COMPLETE));
    }).catch((e) => { console.error(e); const ev = new IOErrorEvent(IOErrorEvent.IO_ERROR); ev.text = String(e); this.dispatchEvent(ev); });
  }
  close() { /* */ }
}

export class ApplicationDomain {
  static currentDomain = new ApplicationDomain();
  getDefinition(name: string) { return lib.getClass(name); }
  hasDefinition(name: string) { return lib.has(name); }
}
export class LoaderContext { applicationDomain: any = ApplicationDomain.currentDomain; checkPolicyFile = false; }

class LoaderInfo extends EventDispatcher { content: any = null; applicationDomain = ApplicationDomain.currentDomain; bytesLoaded = 0; bytesTotal = 1; url = ''; }
/** Loader for "*.swf": loads the matching converted library module */
export class Loader extends MovieClip {
  contentLoaderInfo = new LoaderInfo();
  content: any = null;
  load(req: URLRequest, _ctx?: any) {
    const name = req.url.replace(/^.*\//, '').replace(/\.swf$/i, '');
    const mod = name === 'assets' ? 'main' : name;
    this.contentLoaderInfo.url = req.url;
    if (lib.has('assets.' + name)) { // replacement asset defined in code
      globalThis.setTimeout(() => this.contentLoaderInfo.dispatchEvent(new Event(Event.COMPLETE)), 0);
      return;
    }
    lib.load(mod, (f) => {
      const p = new ProgressEvent(ProgressEvent.PROGRESS); p.bytesLoaded = Math.round(f * 1e6); p.bytesTotal = 1e6;
      this.contentLoaderInfo.dispatchEvent(p);
    }).catch((e) => console.warn('swf module not available:', name, e.message))
      .finally(() => {
        const p = new ProgressEvent(ProgressEvent.PROGRESS); p.bytesLoaded = p.bytesTotal = 1e6;
        this.contentLoaderInfo.dispatchEvent(p);
        this.contentLoaderInfo.dispatchEvent(new Event(Event.COMPLETE));
        this.contentLoaderInfo.dispatchEvent(new Event(Event.INIT));
      });
  }
  unload() { /* modules stay cached */ }
  unloadAndStop() { /* */ }
}

// ---------------- SharedObject (localStorage) ----------------
const SO_PREFIX = 'jinn.so.';
export class SharedObject extends EventDispatcher {
  private static cache = new Map<string, SharedObject>();
  data: any;
  constructor(private key: string) {
    super();
    try { this.data = JSON.parse(localStorage.getItem(SO_PREFIX + key) || '{}'); } catch { this.data = {}; }
  }
  static getLocal(name: string, _path?: string) {
    let so = SharedObject.cache.get(name);
    if (!so) { so = new SharedObject(name); SharedObject.cache.set(name, so); }
    return so;
  }
  flush(_min = 0) { try { localStorage.setItem(SO_PREFIX + this.key, JSON.stringify(this.data)); } catch (e) { console.warn(e); } return 'flushed'; }
  clear() { this.data = {}; localStorage.removeItem(SO_PREFIX + this.key); }
  close() { /* */ }
  get size() { return JSON.stringify(this.data).length; }
  static exportAll(): string {
    const o: any = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith(SO_PREFIX)) o[k.slice(SO_PREFIX.length)] = JSON.parse(localStorage.getItem(k)!); }
    return JSON.stringify({ game: 'jinn', v: 1, so: o });
  }
  static importAll(json: string) {
    const o = JSON.parse(json);
    if (o?.game !== 'jinn' || !o.so) throw new Error('bad save file');
    for (const k of Object.keys(o.so)) localStorage.setItem(SO_PREFIX + k, JSON.stringify(o.so[k]));
    SharedObject.cache.clear();
  }
}

// ---------------- sound (Web Audio) ----------------
let ctx: AudioContext | null = null;
export const audioBus = { master: null as GainNode | null, music: null as GainNode | null, sfx: null as GainNode | null };
const busVolume = { music: 1, sfx: 1 };
/** user volume (0..1) for the music and effects buses */
export function setBusVolume(music: number, sfx: number) {
  busVolume.music = music; busVolume.sfx = sfx;
  if (audioBus.music) audioBus.music.gain.value = music;
  if (audioBus.sfx) audioBus.sfx.gain.value = sfx;
}
export function audio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    audioBus.master = ctx.createGain(); audioBus.master.connect(ctx.destination);
    audioBus.music = ctx.createGain(); audioBus.music.connect(audioBus.master);
    audioBus.sfx = ctx.createGain(); audioBus.sfx.connect(audioBus.master);
    audioBus.music.gain.value = busVolume.music; audioBus.sfx.gain.value = busVolume.sfx;
    const unlock = () => { ctx!.resume(); };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
  }
  return ctx;
}

export class SoundTransform { constructor(public volume = 1, public pan = 0) {} }

/** music files are routed to the music bus (by file name) */
const isMusic = (url: string) => /music/i.test(url);

/** decode compressed audio (callback form works on old Safari too: no promise-returning decodeAudioData there) */
function decode(ab: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise<AudioBuffer>((res, rej) => { const pr = audio().decodeAudioData(ab, res, rej); if (pr && (pr as any).then) (pr as any).then(res, rej); });
}
/** music is decoded one track at a time (decoded music is large: tens of MB per track) */
let musicDecodeChain: Promise<unknown> = Promise.resolve();

export class Sound extends EventDispatcher {
  buffer: AudioBuffer | null = null;
  url = '';
  bytesLoaded = 0; bytesTotal = 0;
  isBuffering = false;
  /** music only: the compressed file, decoded on play and released when it stops (saves ~150 MB) */
  _packed: ArrayBuffer | null = null;
  _duration = 0;
  private _decoding: Promise<AudioBuffer | null> | null = null;
  private _users = 0;
  private _releaseTimer = 0;
  constructor(req?: URLRequest) { super(); if (req) this.load(req); }
  get length() { return (this.buffer?.duration ?? this._duration) * 1000; }
  load(req: URLRequest) {
    this.url = paths.resolve(req.url);
    const done = () => {
      const p = new ProgressEvent(ProgressEvent.PROGRESS); p.bytesLoaded = p.bytesTotal = Math.max(1, this.bytesTotal); this.dispatchEvent(p);
      this.dispatchEvent(new Event(Event.COMPLETE));
    };
    const ctrl = new AbortController();
    const timeout = globalThis.setTimeout(() => ctrl.abort(), 30000);
    const music = isMusic(this.url);
    fetch(this.url, { signal: ctrl.signal }).then((r) => { if (!r.ok) throw new Error(r.status + ' ' + this.url); return r.arrayBuffer(); })
      .then((ab) => {
        this.bytesTotal = this.bytesLoaded = ab.byteLength;
        if (!music) return decode(ab).then((b) => { this.buffer = b; });
        // music: decode once to learn the length, then keep only the compressed file
        this._packed = ab.slice(0); // decodeAudioData detaches its argument
        const job = musicDecodeChain.then(() => decode(ab)).then((b) => { this._duration = b.duration; });
        musicDecodeChain = job.catch(() => undefined);
        return job;
      })
      .then(() => done())
      .catch((e) => {
        // the original game waits for every sound before some levels (e.g. the boss): a failed sound must not
        // block it forever, so it counts as loaded (silent) after reporting the error
        console.warn('sound not loaded, continuing silently:', this.url, e);
        this._packed = null;
        const ev = new IOErrorEvent(IOErrorEvent.IO_ERROR); ev.text = String(e);
        try { this.dispatchEvent(ev); } catch { /* the game throws in its handler */ }
        done();
      })
      .finally(() => globalThis.clearTimeout(timeout));
  }
  /** decoded audio for playback (music is decoded on demand) */
  _acquire(): AudioBuffer | Promise<AudioBuffer | null> | null {
    this._users++;
    globalThis.clearTimeout(this._releaseTimer);
    if (this.buffer || !this._packed) return this.buffer;
    this._decoding ??= decode(this._packed.slice(0)).then((b) => { this.buffer = b; this._decoding = null; return b; }, () => { this._decoding = null; return null; });
    return this._decoding;
  }
  /** a channel stopped: drop the decoded music a little later if nothing plays it any more */
  _release() {
    this._users = Math.max(0, this._users - 1);
    if (this._users || !this._packed) return;
    globalThis.clearTimeout(this._releaseTimer);
    this._releaseTimer = globalThis.setTimeout(() => { if (!this._users) this.buffer = null; }, 5000) as unknown as number;
  }
  play(startTime = 0, loops = 0, st: SoundTransform | null = null): SoundChannel {
    return new SoundChannel(this, startTime, loops, st);
  }
  close() { /* */ }
}

/** channels currently producing sound (debug: overlapping music) */
export const activeChannels = new Set<any>();
export class SoundChannel extends EventDispatcher {
  static SOUND_COMPLETE = 'soundComplete';
  private src: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private t0 = 0; private offset = 0;
  private _st: SoundTransform;
  private stopped = false;
  private held = false;
  constructor(private snd: Sound, start: number, loops: number, st: SoundTransform | null) {
    super();
    this._st = st ?? new SoundTransform();
    const got = snd._acquire();
    if (!got && !snd._packed) { snd._release(); return; }
    this.held = true;
    const ac = audio();
    this.gain = ac.createGain(); this.gain.gain.value = this._st.volume;
    this.gain.connect(isMusic(snd.url) ? audioBus.music! : audioBus.sfx!);
    this.offset = Math.max(0, start / 1000);
    this.t0 = ac.currentTime;
    activeChannels.add(this);
    if (got instanceof AudioBuffer) this._start(got, loops);
    else if (got) {
      // music still decoding: start as soon as it is ready, at the position it would have reached by then
      got.then((b) => {
        if (this.stopped) return;
        if (!b) { this._end(); return; }
        this.offset += audio().currentTime - this.t0; this.t0 = audio().currentTime;
        if (loops <= 0 && this.offset >= b.duration) { this._end(); return; }
        this.offset %= b.duration;
        this._start(b, loops);
      });
    }
  }
  private _start(b: AudioBuffer, loops: number) {
    const ac = audio();
    const src = ac.createBufferSource(); src.buffer = b;
    if (loops > 0) { src.loop = true; src.loopStart = 0; src.loopEnd = b.duration; }
    src.connect(this.gain!);
    src.start(0, Math.min(this.offset, b.duration));
    if (loops > 0 && loops < 1e6) src.stop(ac.currentTime + (b.duration - this.offset) + b.duration * loops);
    src.onended = () => this._end();
    this.src = src;
  }
  private _end() {
    activeChannels.delete(this);
    if (this.held) { this.held = false; this.snd._release(); }
    if (!this.stopped) { this.stopped = true; this.dispatchEvent(new Event(SoundChannel.SOUND_COMPLETE)); }
  }
  get position() {
    const d = this.snd.length / 1000;
    if (!this.gain || !d) return 0;
    const t = (audio().currentTime - this.t0 + this.offset) % d;
    return t * 1000;
  }
  get soundTransform() { return this._st; }
  set soundTransform(st: SoundTransform) { this._st = st; if (this.gain) this.gain.gain.value = st.volume; }
  get leftPeak() { return 0; } get rightPeak() { return 0; }
  stop() {
    this.stopped = true; activeChannels.delete(this);
    try { this.src?.stop(); } catch { /* */ } this.src?.disconnect();
    if (this.held) { this.held = false; this.snd._release(); }
  }
  get url() { return this.snd.url; }
}
export const SoundMixer = {
  soundTransform: new SoundTransform(),
  stopAll() { /* channels stop individually */ },
};

// ---------------- misc platform ----------------
export const Mouse = {
  cursor: 'auto',
  hide() { /* */ }, show() { /* */ },
};
export const MouseCursor = { AUTO: 'auto', ARROW: 'arrow', BUTTON: 'button', HAND: 'hand', IBEAM: 'ibeam' };
export const ExternalInterface = { available: false, call(..._a: any[]) { return null; }, addCallback() { /* */ } };
export class LocalConnection extends EventDispatcher {
  client: any = null; allowDomain() { /* */ } connect() { /* */ } send() { /* */ } close() { /* */ }
}
export const Capabilities = { playerType: 'PlugIn', version: 'WEB 11,0,0,0', os: navigator.platform };
export const System = { totalMemory: 0, gc() { /* */ } };
export const navigateToURL = (req: URLRequest, target = '_blank') => window.open(req.url, target);
void clock;

/** AS3 `x as T`: x when x is a T, otherwise null */
export function as3as(v: any, T: any): any {
  if (v == null || typeof T !== 'function') return v ?? null;
  try { return v instanceof T ? v : null; } catch { return v; }
}

/** Timer driven by the audio clock: used for sound end/loop timing so it never drifts from what is heard
 * (the game clock runs x2 in fast battles and drops time on slow frames). */
export class AudioTimer extends Timer {
  _now() { return audio().currentTime * 1000; }
  // a sound that failed to load has length 0: don't re-trigger its loop every frame
  start() { if (!(this.delay > 0)) this.delay = 60000; super.start(); }
}
