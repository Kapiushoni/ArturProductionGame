import { bindMethods } from '@/flash/as3';
import type { Action } from '@/game/cb/actions/Action';
import type { MovieClip } from '@/flash/as3';

/** An Action calling f(clip) or f(clip, params). */
export class Functor implements Action {
  private f: Function;
  private params: any[];

  constructor(f: Function, ...params: any[]) {
    this.f = f;
    this.params = params;
  }
  /** an Action that calls callback() and ignores the clip */
  static wrap(callback: Function): Functor {
    return new Functor(function (_clip: any) {
      callback();
    });
  }
  execute(clip: MovieClip) {
    if (this.params.length == 0) {
      this.f(clip);
    } else {
      this.f(clip, this.params);
    }
  }
}
bindMethods(Functor);
