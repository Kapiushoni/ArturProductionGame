import { Timer, TimerEvent, bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import type { Item } from '@/game/main_game/items/Item';

/** The mixing time: the sum of both items' MixTime (seconds); onTic(1..100), then atEndMix. */
export class MixerClock {
  atEndMix: Signal;
  onTic: Signal;
  private timer: Timer = null;
  private duration: number;

  constructor(item: Item, item2: Item) {
    this.atEndMix = new Signal();
    this.onTic = new Signal();
    this.duration = Number(item.getMixTime() + item2.getMixTime());
  }
  start() {
    this.timer = new Timer(this.duration * 10, 100);
    this.timer.addEventListener(TimerEvent.TIMER, this.tic);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.endMix);
    this.timer.start();
  }
  tic(event: any) {
    this.onTic.emit(event.target.currentCount);
  }
  endMix(_event: any) {
    this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.endMix);
    this.timer.removeEventListener(TimerEvent.TIMER, this.tic);
    this.onTic.clear();
    this.timer = null;
    this.atEndMix.emit();
    this.clear();
  }
  stop() {
    if (this.timer != null) {
      this.timer.stop();
    }
    this.clear();
  }
  clear() {
    this.atEndMix.clear();
    this.onTic.clear();
    if (this.timer != null) {
      this.timer.stop();
    }
  }
}
bindMethods(MixerClock);
