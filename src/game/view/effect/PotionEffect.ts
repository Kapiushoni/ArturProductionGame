// @ts-nocheck
import { MovieClip, Timer, TimerEvent, as3as, bindMethods } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class PotionEffect {
  declare primaryEffect: any;
  declare secondaryEffect: any;
  declare timer: any;
  constructor(item, clip) {
         
         this.primaryEffect = this.addPotionEffect(item.getPrimaryModifier(),clip);
         this.secondaryEffect = this.addPotionEffect(item.getSecondaryModifier(),clip,-9,7);
         this.timer = new Timer(2000,1);
         this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,this.endTimer);
         this.timer.start();
      }
  addPotionEffect(modifier, clip, num = 0, num2 = 0) { num = Number(num); num2 = Number(num2);
         if(modifier.getCategory() == StatType.NULL)
         {
            return null;
         }
         var clip2 = as3as(main.swfLoader.getObject("assets.potionFeedback"), MovieClip);
         clip2.x += num;
         clip2.y += num2;
         clip2.mouseEnabled = false;
         clip2.mouseChildren = false;
         modifier.modifyIcon(clip2);
         clip.addChild(clip2);
         return clip2;
      }
  endTimer(event) {
         this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.endTimer);
         this.timer.stop();
         this.timer = null;
         this.clear();
      }
  removeFromParent(clip) {
         if(Boolean(clip) && Boolean(clip.parent))
         {
            clip.parent.removeChild(clip);
         }
      }
  clear() {
         this.removeFromParent(this.primaryEffect);
         this.primaryEffect = null;
         this.removeFromParent(this.secondaryEffect);
         this.secondaryEffect = null;
      }
  get x() {
         if(this.primaryEffect)
         {
            return Number(this.primaryEffect.x);
         }
         if(this.secondaryEffect)
         {
            return Number(this.secondaryEffect.x);
         }
         return Number(0);
      }
  set x(value) { value = Number(value);
         if(this.primaryEffect)
         {
            this.primaryEffect.x = value;
         }
         if(this.secondaryEffect)
         {
            this.secondaryEffect.x = value;
         }
      }
  get y() {
         if(this.primaryEffect)
         {
            return Number(this.primaryEffect.y);
         }
         if(this.secondaryEffect)
         {
            return Number(this.secondaryEffect.y);
         }
         return Number(0);
      }
  set y(value) { value = Number(value);
         if(this.primaryEffect)
         {
            this.primaryEffect.y = value;
         }
         if(this.secondaryEffect)
         {
            this.secondaryEffect.y = value;
         }
      }
  get scaleX() {
         if(this.primaryEffect)
         {
            return Number(this.primaryEffect.scaleX);
         }
         if(this.secondaryEffect)
         {
            return Number(this.secondaryEffect.scaleX);
         }
         return Number(0);
      }
  set scaleX(value) { value = Number(value);
         if(this.primaryEffect)
         {
            this.primaryEffect.scaleX = value;
         }
         if(this.secondaryEffect)
         {
            this.secondaryEffect.scaleX = value;
         }
      }
  get scaleY() {
         if(this.primaryEffect)
         {
            return Number(this.primaryEffect.scaleY);
         }
         if(this.secondaryEffect)
         {
            return Number(this.secondaryEffect.scaleY);
         }
         return Number(0);
      }
  set scaleY(value) { value = Number(value);
         if(this.primaryEffect)
         {
            this.primaryEffect.scaleY = value;
         }
         if(this.secondaryEffect)
         {
            this.secondaryEffect.scaleY = value;
         }
      }
}
PotionEffect.prototype.primaryEffect = null;
PotionEffect.prototype.secondaryEffect = null;
PotionEffect.prototype.timer = null;
bindMethods(PotionEffect);
