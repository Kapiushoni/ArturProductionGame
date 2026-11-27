import { Dictionary, bindMethods, uint } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { app } from '@/game/app';
import { Effect } from '@/game/view/effect/Effect';
import type { MixerClock } from '@/game/main_game/mixer/MixerClock';

export class MixerClockView extends Screen {
  constructor(mixerClock: MixerClock) {
    super();
    this.initScreen(app.swfLoader.getClass('assets.Time'), new Dictionary());
    mixerClock.onTic.add(this.refresh);
    mixerClock.atEndMix.add(this.removeClock);
    this.bg.gotoAndStop(0);
  }
  refresh(num: number) {
    num = uint(num);
    this.bg.gotoAndStop(num);
  }
  removeClock() {
    const cls = app.swfLoader.getClass('assets.Stars');
    const effect = new Effect(new cls());
    effect.playOn(this.bg.parent);
    this.pop();
  }
}
bindMethods(MixerClockView, ['refresh', 'removeClock']);
