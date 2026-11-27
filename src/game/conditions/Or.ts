import { bindMethods } from '@/flash/as3';
import type { Condition } from '@/game/cb/conditions/Condition';
import type { MovieClip } from '@/flash/as3';

/** Either condition. */
export class Or implements Condition {
  private c1: Condition;
  private c2: Condition;

  constructor(c1: Condition, c2: Condition) {
    this.c1 = c1;
    this.c2 = c2;
  }
  complete(clip: MovieClip): boolean {
    return this.c1.complete(clip) || this.c2.complete(clip);
  }
}
bindMethods(Or, ['complete']);
