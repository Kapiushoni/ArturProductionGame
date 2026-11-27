import { as3values, bindMethods } from '@/flash/as3';
import type { State } from '@/game/aplication/State';

/** A finite state machine: named states and named transitions between them. */
export class FSM {
  private states: State[];
  private actual_state: State;

  constructor(initial: State) {
    this.states = [];
    this.actual_state = initial;
    this.addState(this.actual_state);
  }
  /** enters the initial state */
  start() {
    this.getActualState().enter();
  }
  addState(state: State) {
    this.states.push(state);
  }
  addTransition(from: string, to: string, transition: string) {
    const source = this.getState(from);
    const target = this.getState(to);
    this.checkState(source);
    this.checkState(target);
    source.addTransition(target, transition);
  }
  getState(name: string): State {
    for (const state of as3values(this.states)) {
      if (name == state.getName()) {
        return state;
      }
    }
    throw new Error('No existe estado con nombre ' + name); // "no state named ..."
  }
  /** leaves the current state and enters the target of `transition` */
  takeTransition(transition: string) {
    this.getActualState().leave();
    this.actual_state = this.getActualState().getTargetForTransition(transition);
    this.getActualState().enter();
  }
  getActualState(): State {
    return this.actual_state;
  }
  checkState(state: State) {
    if (this.states.indexOf(state) < 0) {
      throw new Error('Estado ' + state.getName() + ' no se encuentra en la FSM'); // "state not in the FSM"
    }
  }
  clear() {
    for (const state of as3values(this.states)) {
      state.clear();
    }
    this.states = null;
    this.actual_state = null;
  }
}
bindMethods(FSM);
