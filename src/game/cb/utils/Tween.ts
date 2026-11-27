import { Dictionary, Sprite, as3as, as3keys, as3values, bindMethods, uint } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';

/**
 * Linear tweens of numeric properties: Tween.to(target, ms, { x: 10 }, done?, onUpdate?).
 * Runs on its own GameLoop, which stops when no tween is left.
 */
export class Tween {
  static tweens: Properties[] = null;
  static loop: GameLoop = null;

  /** stops the tweens of target (without finishing them); were there any? */
  static killTweensOf(target: any): boolean {
    let killed = false;
    Tween.forEachTweenOf(target, (tween: Properties) => {
      killed = true;
      Tween.tweens.splice(Tween.tweens.indexOf(tween), 1);
    });
    return killed;
  }
  static isTweening(target: any): boolean {
    let playing = false;
    Tween.forEachTweenOf(target, (tween: Properties) => {
      playing = playing || tween.target == target;
    });
    return playing;
  }
  static to(target: any, time: number, props: any, callback: Function = null, update: Function = null) {
    if (!target || !props) {
      return;
    }
    Tween.initialize();
    const tween = new Properties(target, Number(time), callback, update);
    for (const key of as3keys(props)) {
      tween.propsMap[key] = new Value(target[key], props[key]);
    }
    Tween.tweens.push(tween);
  }
  static destroy() {
    Tween.loop.stop();
    Tween.loop = null;
    Tween.tweens = null;
  }
  static initialize() {
    if (Tween.loop) {
      return;
    }
    Tween.tweens = [];
    Tween.loop = new GameLoop(new Sprite());
    Tween.loop.updated.add(Tween.update);
    Tween.loop.start();
  }
  static update(elapsed: number) {
    elapsed = uint(elapsed);
    const finished = [];
    for (const tween of as3values(Tween.tweens.concat())) {
      if (!Tween.updateTween(tween, elapsed)) {
        finished.push(tween);
      }
    }
    for (const tween of as3values(finished)) {
      Tween.tweens.splice(Tween.tweens.indexOf(tween), 1);
    }
    if (!Tween.tweens.length) {
      Tween.destroy();
    }
  }
  /** advances a tween; false when it has finished (or has no target) */
  static updateTween(tween: Properties, elapsed: number): boolean {
    elapsed = uint(elapsed);
    if (!tween || !tween.target) {
      return false;
    }
    tween.elapsedTime += elapsed;
    const done = tween.elapsedTime > tween.time;
    for (const key of as3keys(tween.propsMap)) {
      const value = as3as(tween.propsMap[key], Value) as Value;
      tween.target[key] = done ? value.to : Tween.linear(tween.elapsedTime, value.from, value.change, tween.time);
    }
    if (done) {
      tween.callback && tween.callback();
    } else {
      tween.update && tween.update();
    }
    return !done;
  }
  static forEachTweenOf(target: any, callback: (tween: Properties) => void) {
    if (!Tween.tweens) {
      return;
    }
    const tweens = [].concat(Tween.tweens);
    for (let i = 0; i < tweens.length; i++) {
      const tween = tweens[i];
      if (Boolean(tween) && tween.target == target) {
        callback && callback(tween);
      }
    }
  }
  static linear(time: number, from: number, change: number, duration: number): number {
    return (Number(change) * Number(time)) / Number(duration) + Number(from);
  }
}
bindMethods(Tween);

class Properties {
  target: any;
  /** ms */
  time: number;
  callback: Function;
  update: Function;
  /** Dictionary: property -> Value */
  propsMap: any;
  elapsedTime = 0;

  constructor(target: any, time: number, callback: Function = null, update: Function = null) {
    this.target = target;
    this.time = uint(time);
    this.callback = callback;
    this.update = update;
    this.propsMap = new Dictionary();
  }
}
bindMethods(Properties);

class Value {
  from: number;
  to: number;
  change: number;

  constructor(from: any, to: any) {
    this.from = Number(from);
    this.to = Number(to);
    this.change = this.to - this.from;
  }
}
bindMethods(Value);
