import { MouseEvent, MovieClip, as3as, as3values, bindMethods, int } from '@/flash/as3';

export class Util {
  /** callback with extra arguments appended: l(f, a)(x) == f(x, a) */
  static l(callback: Function, ...extra: any[]): (...args: any[]) => any {
    return (...args: any[]) => callback.apply(null, args.concat(extra));
  }
  /** first(...args), then second() */
  static concatenate(first: Function, second: Function): (...args: any[]) => void {
    return (...args: any[]) => {
      first.apply(null, args);
      second();
    };
  }
  /** callback ignoring its arguments */
  static removeParams(callback: Function): (...args: any[]) => any {
    return (..._args: any[]) => callback();
  }
  static bringToFront(sprite: any) {
    if (sprite.parent != null) {
      sprite.parent.setChildIndex(sprite, sprite.parent.numChildren - 1);
    }
  }
  static parseArray(text: string, separator: string = null): string[] {
    return text.split(separator || ';');
  }
  /** a function that does nothing */
  static pass(): (...args: any[]) => void {
    return (..._args: any[]) => {};
  }
  static areLoaded(resources: string[], loader: { isLoaded(resource: string): boolean }): boolean {
    for (const resource of as3values(resources)) {
      if (!loader.isLoaded(resource)) {
        return false;
      }
    }
    return true;
  }
  static recursiveStop(clip: any) {
    Util.recursiveApply(clip, (c: any) => c.stop());
  }
  /** callback on the clip and all the movie clips inside it (children first) */
  static recursiveApply(clip: any, callback: (clip: any) => void) {
    for (let i = int(clip.numChildren - 1); i >= 0; i--) {
      const child = as3as(clip.getChildAt(i), MovieClip);
      if (child) {
        Util.recursiveApply(child, callback);
      }
    }
    callback(clip);
  }
  /** child at a path: getSprite(c, "a.b") == c.a.b */
  static getSprite(sprite: any, path: string): any {
    let child = sprite;
    for (const name of as3values(path.split('.'))) {
      child = child[name];
    }
    return child;
  }
  static addMouseEvents(sprite: any, click: Function = null, over: Function = null, out: Function = null) {
    if (click != null) {
      sprite.addEventListener(MouseEvent.CLICK, click);
    }
    if (over != null) {
      sprite.addEventListener(MouseEvent.MOUSE_OVER, over);
    }
    if (out != null) {
      sprite.addEventListener(MouseEvent.MOUSE_OUT, out);
    }
  }
  static removeMouseEvents(sprite: any, click: Function = null, over: Function = null, out: Function = null) {
    if (click != null) {
      sprite.removeEventListener(MouseEvent.CLICK, click);
    }
    if (over != null) {
      sprite.removeEventListener(MouseEvent.MOUSE_OVER, over);
    }
    if (out != null) {
      sprite.removeEventListener(MouseEvent.MOUSE_OUT, out);
    }
  }
}
bindMethods(Util);
