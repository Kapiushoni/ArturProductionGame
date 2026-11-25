// Minimal AS3 event model: Event / MouseEvent / TimerEvent + EventDispatcher with capture/target/bubble.
import { reportError } from './errors';

export class Event {
  static ADDED = 'added';
  static ADDED_TO_STAGE = 'addedToStage';
  static REMOVED = 'removed';
  static REMOVED_FROM_STAGE = 'removedFromStage';
  static ENTER_FRAME = 'enterFrame';
  static EXIT_FRAME = 'exitFrame';
  static COMPLETE = 'complete';
  static CHANGE = 'change';
  static RESIZE = 'resize';
  static OPEN = 'open';
  static ACTIVATE = 'activate';
  static DEACTIVATE = 'deactivate';
  static CANCEL = 'cancel';
  static INIT = 'init';

  type: string;
  bubbles: boolean;
  cancelable: boolean;
  target: any = null;
  currentTarget: any = null;
  eventPhase = 2;
  _stop = false;
  _stopNow = false;
  _prevented = false;

  constructor(type: string, bubbles = false, cancelable = false) {
    this.type = type; this.bubbles = bubbles; this.cancelable = cancelable;
  }
  stopPropagation() { this._stop = true; }
  stopImmediatePropagation() { this._stop = true; this._stopNow = true; }
  preventDefault() { this._prevented = true; }
  isDefaultPrevented() { return this._prevented; }
  clone(): Event { return new Event(this.type, this.bubbles, this.cancelable); }
  toString() { return `[Event type="${this.type}"]`; }
}

export class MouseEvent extends Event {
  static CLICK = 'click';
  static DOUBLE_CLICK = 'doubleClick';
  static MOUSE_DOWN = 'mouseDown';
  static MOUSE_UP = 'mouseUp';
  static MOUSE_MOVE = 'mouseMove';
  static MOUSE_OVER = 'mouseOver';
  static MOUSE_OUT = 'mouseOut';
  static ROLL_OVER = 'rollOver';
  static ROLL_OUT = 'rollOut';
  static MOUSE_WHEEL = 'mouseWheel';

  stageX = 0; stageY = 0; localX = 0; localY = 0;
  relatedObject: any = null;
  buttonDown = false; ctrlKey = false; shiftKey = false; altKey = false; delta = 0;

  constructor(type: string, bubbles = true, cancelable = false) { super(type, bubbles, cancelable); }
  clone(): Event { const e = new MouseEvent(this.type, this.bubbles, this.cancelable); Object.assign(e, { stageX: this.stageX, stageY: this.stageY, localX: this.localX, localY: this.localY, relatedObject: this.relatedObject }); return e; }
  updateAfterEvent() { /* noop */ }
}

export class TimerEvent extends Event {
  static TIMER = 'timer';
  static TIMER_COMPLETE = 'timerComplete';
  updateAfterEvent() { /* noop */ }
}

export class KeyboardEvent extends Event {
  static KEY_DOWN = 'keyDown';
  static KEY_UP = 'keyUp';
  keyCode = 0; charCode = 0; key = ''; code = '';
  constructor(type: string, bubbles = true, cancelable = false) { super(type, bubbles, cancelable); }
}

export class IOErrorEvent extends Event { static IO_ERROR = 'ioError'; text = ''; }
export class ProgressEvent extends Event { static PROGRESS = 'progress'; bytesLoaded = 0; bytesTotal = 0; }
export class StatusEvent extends Event { static STATUS = 'status'; code = ''; level = ''; }

type L = { fn: (e: any) => void; capture: boolean; prio: number };

export class EventDispatcher {
  _ls: Record<string, L[]> | null = null;

  addEventListener(type: string, fn: (e: any) => void, useCapture = false, priority = 0, _weak = false): void {
    if (!fn) return;
    const m = (this._ls ??= {});
    const arr = (m[type] ??= []);
    if (arr.some((l) => l.fn === fn && l.capture === useCapture)) return;
    const l = { fn, capture: useCapture, prio: priority };
    let i = arr.length;
    while (i > 0 && arr[i - 1].prio < priority) i--;
    arr.splice(i, 0, l);
    this._onListen(type, true);
  }

  removeEventListener(type: string, fn: (e: any) => void, useCapture = false): void {
    const arr = this._ls?.[type];
    if (!arr) return;
    const i = arr.findIndex((l) => l.fn === fn && l.capture === useCapture);
    if (i >= 0) arr.splice(i, 1);
    if (!arr.length) { delete this._ls![type]; this._onListen(type, false); }
  }

  hasEventListener(type: string): boolean { return !!this._ls?.[type]?.length; }
  willTrigger(type: string): boolean { return this.hasEventListener(type); }

  /** hook for subclasses (ENTER_FRAME registry) */
  _onListen(_type: string, _on: boolean) { /* */ }

  _fire(e: Event, capture: boolean) {
    const arr = this._ls?.[e.type];
    if (!arr) return;
    e.currentTarget = this;
    for (const l of arr.slice()) {
      if (l.capture !== capture) continue;
      try { l.fn.call(null, e); } catch (err) { reportError('event ' + e.type, err); }
      if (e._stopNow) break;
    }
  }

  dispatchEvent(ev: Event | string): boolean {
    const e = typeof ev === 'string' ? new Event(ev) : ev;
    if (e.target) { e._stop = false; e._stopNow = false; }
    e.target = this;
    const chain: EventDispatcher[] = [];
    let p = (this as any).parent;
    while (p) { chain.push(p); p = p.parent; }
    if (chain.length) {
      e.eventPhase = 1;
      for (let i = chain.length - 1; i >= 0 && !e._stop; i--) chain[i]._fire(e, true);
    }
    if (!e._stop) { e.eventPhase = 2; this._fire(e, false); }
    if (e.bubbles) {
      e.eventPhase = 3;
      for (let i = 0; i < chain.length && !e._stop; i++) chain[i]._fire(e, false);
    }
    return !e._prevented;
  }
}
