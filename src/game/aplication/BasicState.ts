import { Dictionary, bindMethods } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import type { State } from '@/game/aplication/State';

/** A state that calls onEnter / onLeave. */
export class BasicState implements State {
  static log = Log.getLogger('FSMLogger');
  private name: string = null;
  /** Dictionary: transition -> target state */
  private transitions: any = null;
  private onEnter: Function = null;
  private onLeave: Function = null;
  persistency = {};

  constructor(name: string, onEnter: Function = null, onLeave: Function = null) {
    this.name = name;
    this.transitions = new Dictionary();
    this.onEnter = onEnter;
    this.onLeave = onLeave;
  }
  enter() {
    BasicState.log.log('Enter to state: ' + this.getName());
    if (this.onEnter != null) {
      this.onEnter();
    }
  }
  leave() {
    BasicState.log.log('Leave from state: ' + this.getName());
    if (this.onLeave != null) {
      this.onLeave();
    }
  }
  addTransition(target: State, transition: string) {
    this.transitions.set(transition, target);
  }
  getName(): string {
    return this.name;
  }
  getTargetForTransition(transition: string): State {
    const target = this.transitions.get(transition);
    if (target == null) {
      throw new Error('Transicion ' + transition + ' no definida para estado ' + this.getName()); // "undefined transition"
    }
    return target;
  }
  clear() {
    this.onEnter = null;
    this.onLeave = null;
    this.transitions = null;
    this.persistency = null;
  }
}
bindMethods(BasicState);
