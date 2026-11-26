// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { PopUpPositioner } from '@/game/view/popUp/PopUpPositioner';

export class PopUp {
  declare theMc: any;
  declare positioner: any;
  constructor(theMc) {
         
         this.theMc = theMc;
         this.mc.visible = false;
      }
  get mc() {
         return this.theMc;
      }
  addIn(displayObjectContainer) {
         this.positioner = new PopUpPositioner(displayObjectContainer);
         this.positioner.addMc(this.mc);
      }
  hide(callback = null) {
         this.mc.visible = false;
         if(callback != null)
         {
            callback();
         }
      }
  show(callback = null) {
         this.positioner.refreshPos(this.mc);
         this.mc.visible = true;
         if(callback != null)
         {
            callback();
         }
      }
  clear() {
         if(this.mc.parent != null)
         {
            this.mc.parent.removeChild(this.mc);
         }
         this.positioner = null;
      }
}
PopUp.prototype.theMc = null;
PopUp.prototype.positioner = null;
bindMethods(PopUp);
