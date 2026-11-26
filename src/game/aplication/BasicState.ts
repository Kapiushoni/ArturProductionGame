// @ts-nocheck
import { Dictionary, __DEFER, bindMethods } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';

export class BasicState {
  static log = Log.getLogger("FSMLogger");
  declare name: any;
  declare transitions: any;
  declare onEnter: any;
  declare onLeave: any;
  persistency = {};
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_BasicState(...__a); }
  __init_BasicState(name, onEnter = null, onLeave = null) {
         
         this.name = name;
         this.transitions = new Dictionary();
         this.onEnter = onEnter;
         this.onLeave = onLeave;
      }
  enter() {
         BasicState.log.log("Enter to state: " + this.getName());
         if(this.onEnter != null)
         {
            this.onEnter();
         }
      }
  leave() {
         BasicState.log.log("Leave from state: " + this.getName());
         if(this.onLeave != null)
         {
            this.onLeave();
         }
      }
  addTransition(state, text) {
         this.transitions.set(text, state);
      }
  getName() {
         return this.name;
      }
  getTargetForTransition(text) {
         var state = this.transitions.get(text);
         if(state == null)
         {
            throw new Error("Transicion " + text + " no definida para estado " + this.getName());
         }
         return state;
      }
  clear() {
         this.onEnter = null;
         this.onLeave = null;
         this.transitions = null;
         this.persistency = null;
      }
}
BasicState.prototype.name = null;
BasicState.prototype.transitions = null;
BasicState.prototype.onEnter = null;
BasicState.prototype.onLeave = null;
bindMethods(BasicState);
