import { bindMethods } from '@/flash/as3';
import { PopUpPositioner } from '@/game/view/popUp/PopUpPositioner';
import type { DisplayObjectContainer } from '@/flash/as3';
import type { MovieClip } from '@/flash/as3';

export class PopUp {
  theMc: MovieClip = null;
  positioner: PopUpPositioner = null;
  constructor(theMc: MovieClip) {
    this.theMc = theMc;
    this.mc.visible = false;
  }
  get mc() {
    return this.theMc;
  }
  addIn(displayObjectContainer: DisplayObjectContainer) {
    this.positioner = new PopUpPositioner(displayObjectContainer);
    this.positioner.addMc(this.mc);
  }
  hide(callback: Function = null) {
    this.mc.visible = false;
    if (callback != null) {
      callback();
    }
  }
  show(callback: Function = null) {
    this.positioner.refreshPos(this.mc);
    this.mc.visible = true;
    if (callback != null) {
      callback();
    }
  }
  clear() {
    if (this.mc.parent != null) {
      this.mc.parent.removeChild(this.mc);
    }
    this.positioner = null;
  }
}
bindMethods(PopUp);
