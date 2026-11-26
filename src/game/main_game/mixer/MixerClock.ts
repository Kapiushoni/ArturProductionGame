// @ts-nocheck
import { Timer, TimerEvent, bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class MixerClock {
  declare atEndMix: any;
  declare onTic: any;
  declare timer: any;
  declare duration: any;
  constructor(item, item2) {
         
         this.atEndMix = new Signal();
         this.onTic = new Signal();
         this.duration = Number(item.getMixTime() + item2.getMixTime());
      }
  start() {
         this.timer = new Timer(this.duration * 10,100);
         this.timer.addEventListener(TimerEvent.TIMER,this.tic);
         this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,this.endMix);
         this.timer.start();
      }
  tic(event) {
         this.onTic.emit((event.target).currentCount);
      }
  endMix(event) {
         this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.endMix);
         this.timer.removeEventListener(TimerEvent.TIMER,this.onTic.emit);
         this.onTic.clear();
         this.timer = null;
         this.atEndMix.emit();
         this.clear();
      }
  stop() {
         if(this.timer != null)
         {
            this.timer.stop();
         }
         this.clear();
      }
  clear() {
         this.atEndMix.clear();
         this.onTic.clear();
         if(this.timer != null)
         {
            this.timer.stop();
         }
      }
}
MixerClock.prototype.atEndMix = null;
MixerClock.prototype.onTic = null;
MixerClock.prototype.timer = null;
MixerClock.prototype.duration = NaN;
bindMethods(MixerClock);
