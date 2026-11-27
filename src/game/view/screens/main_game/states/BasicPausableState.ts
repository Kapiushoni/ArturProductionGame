import { bindMethods } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import type { IPausable } from '@/game/view/screens/main_game/states/IPausable';

/** A state of the game screen (map / dungeon) that can be paused. */
export class BasicPausableState extends BasicState implements IPausable {
  constructor(name: string, onEnter: Function = null, onLeave: Function = null) {
    super(name, onEnter, onLeave);
  }
  pause() {}
  resume() {}
}
bindMethods(BasicPausableState, ['pause', 'resume']);
