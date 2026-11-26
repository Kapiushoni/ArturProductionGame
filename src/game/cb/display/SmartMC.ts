// @ts-nocheck
import { Event, as3values, bindMethods, int } from '@/flash/as3';

export class SmartMC {
  declare conditions: any;
  declare mc: any;
  declare actions: any;
  constructor(mc) {
         
         mc.addEventListener(Event.ENTER_FRAME,this.enterFrame);
         this.conditions = new Array();
         this.mc = mc;
         this.actions = new Array();
      }
  enterFrame(event) {
         var action = null;
         var obj = null;
         var i = 0;
         while(i < this.conditions.length)
         {
            obj = this.conditions[i];
            if(obj.condition.complete(this.mc))
            {
               this.actions.push(obj.action);
               this.conditions.splice(i,1);
               i--;
            }
            i++;
         }
         for (action of as3values(this.actions))
         {
            action.execute(this.mc);
         }
         this.actions = new Array();
         if(this.conditions == null || this.conditions.length == 0)
         {
            this.mc.removeEventListener(Event.ENTER_FRAME,this.enterFrame);
         }
      }
  trigger(condition, action) {
         this.conditions.push({
            "condition":condition,
            "action":action
         });
      }
  clear() {
         this.mc.removeEventListener(Event.ENTER_FRAME,this.enterFrame);
         this.conditions = null;
      }
  equals(clip) {
         return this.mc == clip;
      }
  rewind() {
         this.mc.parent.addEventListener(Event.ENTER_FRAME,this.rewindFrame);
      }
  stopRewind() {
         this.mc.parent.removeEventListener(Event.ENTER_FRAME,this.rewindFrame);
      }
  rewindFrame(event) {
         var num = int(this.mc.currentFrame);
         if(num == 1)
         {
            this.stopRewind();
            return;
         }
         this.mc.prevFrame();
      }
}
SmartMC.prototype.conditions = null;
SmartMC.prototype.mc = null;
SmartMC.prototype.actions = null;
bindMethods(SmartMC);
