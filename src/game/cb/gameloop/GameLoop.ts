import { Event, bindMethods, getTimer, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

/** While started: updated(elapsed ms) on every frame of the display object. */
export class GameLoop {
  private displayObject: any;
  updated: Signal;
  private lastUpdate = 0;

  constructor(displayObject: any) {
    this.displayObject = displayObject;
    this.updated = new Signal();
  }
  start() {
    this.lastUpdate = int(getTimer());
    this.displayObject.addEventListener(Event.ENTER_FRAME, this.update);
  }
  update(_event: any) {
    const elapsed = int(getTimer() - this.lastUpdate);
    this.lastUpdate = int(getTimer());
    this.updated.emit(elapsed);
  }
  stop() {
    this.displayObject.removeEventListener(Event.ENTER_FRAME, this.update);
  }
}
bindMethods(GameLoop);
