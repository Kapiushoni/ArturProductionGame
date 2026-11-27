import { as3values, bindMethods } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import { FSM } from '@/game/aplication/FSM';
import { Appender } from '@/game/cb/logger/Appender';
import { JSConsoleAppender } from '@/game/cb/logger/JSConsoleAppender';
import { Log } from '@/game/cb/logger/Log';
import { Signal } from '@/game/cb/signals/Signal';
import { Util } from '@/game/util/Util';
import type { DynamicLoader } from '@/game/loader/DynamicLoader';
import type { ResourceLoader } from '@/game/loader/ResourceLoader';

/**
 * Loads resources one after another in the background (after the game has started), e.g. the sound lists:
 * an FSM init -> each resource -> end. onLoad on every step; isLoaded(resource) says if it is done.
 */
export class PostLoader implements DynamicLoader {
  static readonly NEXT = 'next';
  private fsm: FSM;
  private states: string[];
  private theOnLoad: Signal;
  private theLoader: ResourceLoader;

  constructor(resources: string[], loader: ResourceLoader) {
    this.theLoader = loader;
    this.states = resources;
    this.theOnLoad = new Signal();
    PostLoader.log.addAppender(new Appender());
    PostLoader.log.addAppender(new JSConsoleAppender());
    this.initFSM();
  }
  static get log(): Log {
    return Log.getLogger('PostLoader');
  }
  get onLoad(): Signal {
    return this.theOnLoad;
  }
  isLoaded(resource: string): boolean {
    const current = this.fsm.getActualState().getName();
    if (current == 'end') {
      return true;
    }
    return this.states.indexOf(resource) < this.states.indexOf(current);
  }
  initFSM() {
    let previous = new BasicState('init');
    this.fsm = new FSM(previous);
    for (const resource of as3values(this.states)) {
      const state = new BasicState(resource, this.enterToState, this.resourceLoaded);
      this.fsm.addState(state);
      this.fsm.addTransition(previous.getName(), state.getName(), PostLoader.NEXT);
      previous = state;
    }
    const end = new BasicState('end', this.endLoad);
    this.fsm.addState(end);
    this.fsm.addTransition(previous.getName(), end.getName(), PostLoader.NEXT);
  }
  start() {
    if (this.fsm.getActualState().getName() == 'init') {
      this.fsm.takeTransition(PostLoader.NEXT);
    }
  }
  /** entering a resource state: load it, then go to the next one */
  enterToState() {
    this.onLoad.emit();
    this.theLoader.load(this.fsm.getActualState().getName(), Util.l(this.fsm.takeTransition, PostLoader.NEXT));
  }
  resourceLoaded() {
    PostLoader.log.log('Loaded: ' + this.fsm.getActualState().getName());
  }
  endLoad() {
    this.onLoad.emit();
  }
}
bindMethods(PostLoader);
