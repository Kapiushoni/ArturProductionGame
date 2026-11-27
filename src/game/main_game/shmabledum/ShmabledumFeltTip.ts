import { bindMethods } from '@/flash/as3';
import { Util } from '@/game/util/Util';
import type { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import type { InteractiveShmabledum } from '@/game/main_game/shmabledum/InteractiveShmabledum';
import type { ShmabledumFeeling } from '@/game/main_game/shmabledum/ShmabledumFeeling';
import type { ShmabledumInteraction } from '@/game/main_game/shmabledum/ShmabledumInteraction';

/** A feeling, then a tip. */
export class ShmabledumFeltTip implements ShmabledumInteraction {
  private tip: BubbleGumTip;
  private feeling: ShmabledumFeeling;

  constructor(tip: BubbleGumTip, feeling: ShmabledumFeeling) {
    this.tip = tip;
    this.feeling = feeling;
  }
  make(shmabledum: InteractiveShmabledum) {
    shmabledum.expressFeeling(this.feeling, Util.l(this.tip.make, shmabledum));
  }
}
bindMethods(ShmabledumFeltTip);
