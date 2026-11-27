import { bindMethods } from '@/flash/as3';
import type { Action } from '@/game/cb/actions/Action';
import type { MovieClip } from '@/flash/as3';

/** An Action calling f(clip, ...params). */
export class Lambda implements Action {
  private f: Function;
  private params: any[];

  constructor(f: Function, ...params: any[]) {
    this.f = f;
    this.params = params;
  }
  /** an Action that calls callback(...args) and ignores the clip */
  static wrap(callback: Function, ...args: any[]): Lambda {
    return new Lambda(function (_clip: any) {
      if (args.length == 0) {
        callback();
      } else {
        callback.apply(null, args);
      }
    });
  }
  execute(clip: MovieClip) {
    if (this.params.length == 0) {
      this.f.apply(null, [clip]);
    } else {
      this.f.apply(null, [clip, ...this.params]);
    }
  }
}
bindMethods(Lambda);
