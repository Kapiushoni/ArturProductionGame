import { Event, as3values, bindMethods, int } from '@/flash/as3';
import type { Action } from '@/game/cb/actions/Action';
import type { Condition } from '@/game/cb/conditions/Condition';
import type { MovieClip } from '@/flash/as3';

/** Watches a clip every frame: trigger(condition, action) runs the action once the condition holds. */
export class SmartMC {
  private conditions: { condition: Condition; action: Action }[];
  private mc: MovieClip;
  private actions: Action[];

  constructor(mc: MovieClip) {
    mc.addEventListener(Event.ENTER_FRAME, this.enterFrame);
    this.conditions = [];
    this.mc = mc;
    this.actions = [];
  }
  enterFrame(_event: Event) {
    for (let i = 0; i < this.conditions.length; i++) {
      const entry = this.conditions[i];
      if (entry.condition.complete(this.mc)) {
        this.actions.push(entry.action);
        this.conditions.splice(i, 1);
        i--;
      }
    }
    for (const action of as3values(this.actions)) {
      action.execute(this.mc);
    }
    this.actions = [];
    if (this.conditions == null || this.conditions.length == 0) {
      this.mc.removeEventListener(Event.ENTER_FRAME, this.enterFrame);
    }
  }
  trigger(condition: Condition, action: Action) {
    this.conditions.push({ condition, action });
  }
  clear() {
    this.mc.removeEventListener(Event.ENTER_FRAME, this.enterFrame);
    this.conditions = null;
  }
  equals(clip: MovieClip): boolean {
    return this.mc == clip;
  }
  stopRewind() {
    this.mc.parent.removeEventListener(Event.ENTER_FRAME, this.rewindFrame);
  }
  rewindFrame(_event: Event) {
    if (int(this.mc.currentFrame) == 1) {
      this.stopRewind();
      return;
    }
    this.mc.prevFrame();
  }
}
bindMethods(SmartMC);
