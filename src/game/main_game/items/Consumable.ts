// @ts-nocheck
import { Timer, TimerEvent, bindMethods, int } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';

export class Consumable extends Category {
  declare atEndEffect: any;
  declare onChange: any;
  declare percent: any;
  declare timer: any;
  constructor(item, obj) {
          super(item,obj);
         this.atEndEffect = new Signal();
         this.onChange = new Signal();
      }
  isInstant() { const __self = this;
         return __self.item.getPrimaryModifier().isInstant() && __self.item.getSecondaryModifier().isInstant();
      }
  degrade() { const __self = this;
         if(this.timer == null)
         {
            main.game.onPause.add(this.pause);
            this.percent = int(100);
            this.timer = new Timer(__self.item.getDuration() * 10,100);
            this.timer.addEventListener(TimerEvent.TIMER,this.tick);
            this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,this.complete);
            this.timer.start();
            this.onChange.emit(this.percent);
         }
      }
  pause(flag) {
         if(flag)
         {
            this.timer.stop();
         }
         else
         {
            this.timer.start();
         }
      }
  tick(event) {
         --this.percent;
         this.onChange.emit(this.percent);
      }
  complete(event) { const __self = this;
         this.clearTimer();
         this.atEndEffect.emit(__self.item);
      }
  get type() {
         return Category.CONSUMABLE_CATEGORY;
      }
  canBeContained(itemContainer) {
         return itemContainer.canContainConsumable();
      }
  clearTimer() {
         if(this.timer != null)
         {
            this.timer.removeEventListener(TimerEvent.TIMER,this.tick);
            this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.complete);
            this.timer.stop();
            this.timer = null;
            main.game.onPause.remove(this.pause);
         }
      }
  clear() {
         this.clearTimer();
         this.atEndEffect.clear();
         this.atEndEffect = null;
         this.onChange.clear();
         this.onChange = null;
         super.clear();
      }
}
Consumable.prototype.atEndEffect = null;
Consumable.prototype.onChange = null;
Consumable.prototype.percent = 0;
Consumable.prototype.timer = null;
bindMethods(Consumable);
