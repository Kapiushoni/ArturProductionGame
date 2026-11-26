// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

export class ItemView {
  declare item: any;
  declare mc: any;
  constructor(item) {
         
         this.item = item;
      }
  getMC() {
         var cls = null;
         if(this.mc == null)
         {
            cls = main.swfLoader.getClass("assets." + this.item.getMcName());
            this.mc = new cls();
         }
         return this.mc;
      }
  putIn(displayObjectContainer) {
         var mc = this.getMC();
         displayObjectContainer.addChild(mc);
      }
  clear() {
         if(this.mc.parent != null)
         {
            this.mc.parent.removeChild(this.mc);
         }
         this.item = null;
         this.mc = null;
      }
  getStateForSlot(slotView) {
         return "";
      }
}
ItemView.prototype.item = null;
ItemView.prototype.mc = null;
bindMethods(ItemView);
