import { Dictionary, bindMethods, uint } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { main } from '@/game/main';
import { Effect } from '@/game/view/effect/Effect';
import type { MixerClock } from '@/game/main_game/mixer/MixerClock';

export class MixerClockView extends Screen {
  constructor(mixerClock: MixerClock) {
    super();
    this.initScreen(main.swfLoader.getClass('assets.Time'), new Dictionary());
    mixerClock.onTic.add(this.refresh);
    mixerClock.atEndMix.add(this.removeClock);
    this.bg.gotoAndStop(0);
  }
  refresh(num: number) {
    num = uint(num);
    this.bg.gotoAndStop(num);
  }
  removeClock() {
    var cls = main.swfLoader.getClass('assets.Stars');
    var effect = new Effect(new cls());
    effect.playOn(this.bg.parent);
    this.pop();
  }
}
bindMethods(MixerClockView);
