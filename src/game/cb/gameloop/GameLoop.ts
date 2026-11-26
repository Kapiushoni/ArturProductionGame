// @ts-nocheck
import { Event, bindMethods, getTimer, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class GameLoop {
  declare displayObject: any;
  declare updated: any;
  declare lastUpdate: any;
  constructor(displayObject) {
         
         this.displayObject = displayObject;
         this.updated = new Signal();
      }
  start() {
         this.lastUpdate = int(getTimer());
         this.displayObject.addEventListener(Event.ENTER_FRAME,this.update);
      }
  update(event) {
         var num = int(getTimer() - this.lastUpdate);
         this.lastUpdate = int(getTimer());
         this.updated.emit(num);
      }
  stop() {
         this.displayObject.removeEventListener(Event.ENTER_FRAME,this.update);
      }
}
GameLoop.prototype.displayObject = null;
GameLoop.prototype.updated = null;
GameLoop.prototype.lastUpdate = 0;
bindMethods(GameLoop);
