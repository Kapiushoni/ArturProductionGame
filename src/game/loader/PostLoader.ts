// @ts-nocheck
import { as3values, bindMethods } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import { FSM } from '@/game/aplication/FSM';
import { Appender } from '@/game/cb/logger/Appender';
import { JSConsoleAppender } from '@/game/cb/logger/JSConsoleAppender';
import { Log } from '@/game/cb/logger/Log';
import { Signal } from '@/game/cb/signals/Signal';
import { Util } from '@/game/util/Util';

export class PostLoader {
  static readonly NEXT = "next";
  declare fsm: any;
  declare states: any;
  declare theOnLoad: any;
  declare theLoader: any;
  constructor(states, theLoader) {
         
         this.theLoader = theLoader;
         this.states = states;
         this.theOnLoad = new Signal();
         PostLoader.log.addAppender(new Appender());
         PostLoader.log.addAppender(new JSConsoleAppender());
         this.initFSM();
      }
  static get log() {
         return Log.getLogger("PostLoader");
      }
  get onLoad() {
         return this.theOnLoad;
      }
  isLoaded(text) {
         var name = this.fsm.getActualState().getName();
         if(name == "end")
         {
            return true;
         }
         return this.states.indexOf(text) < this.states.indexOf(name);
      }
  initFSM() {
         var state = null;
         var basicState = null;
         var state2 = null;
         var basicState2 = new BasicState("init");
         this.fsm = new FSM(basicState2);
         for (state of as3values(this.states))
         {
            state2 = basicState2;
            basicState2 = new BasicState(state,this.enterToState,this.resourceLoaded);
            this.fsm.addState(basicState2);
            this.fsm.addTransition(state2.getName(),basicState2.getName(),PostLoader.NEXT);
         }
         basicState = new BasicState("end",this.endLoad);
         this.fsm.addState(basicState);
         this.fsm.addTransition(basicState2.getName(),basicState.getName(),PostLoader.NEXT);
      }
  start() {
         if(this.fsm.getActualState().getName() == "init")
         {
            this.fsm.takeTransition(PostLoader.NEXT);
         }
      }
  enterToState() {
         this.onLoad.emit();
         this.theLoader.load(this.fsm.getActualState().getName(),Util.l(this.fsm.takeTransition,PostLoader.NEXT));
      }
  resourceLoaded() {
         PostLoader.log.log("Loaded: " + this.fsm.getActualState().getName());
      }
  endLoad() {
         this.onLoad.emit();
      }
}
PostLoader.prototype.fsm = null;
PostLoader.prototype.states = null;
PostLoader.prototype.theOnLoad = null;
PostLoader.prototype.theLoader = null;
bindMethods(PostLoader);
