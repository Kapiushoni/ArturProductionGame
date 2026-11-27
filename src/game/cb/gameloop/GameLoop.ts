import { Event, bindMethods, getTimer, int } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import type { DisplayObject } from '@/flash/as3';

/** While started: updated(elapsed ms) on every frame of the display object. */
export class GameLoop {
  private displayObject: DisplayObject;
  updated: Signal;
  private lastUpdate = 0;

  constructor(displayObject: DisplayObject) {
    this.displayObject = displayObject;
    this.updated = new Signal();
  }
  start() {
    this.lastUpdate = int(getTimer());
    this.displayObject.addEventListener(Event.ENTER_FRAME, this.update);
  }
  update(_event: Event) {
    const elapsed = int(getTimer() - this.lastUpdate);
    this.lastUpdate = int(getTimer());
    this.updated.emit(elapsed);
  }
  stop() {
    this.displayObject.removeEventListener(Event.ENTER_FRAME, this.update);
  }
}
bindMethods(GameLoop);
