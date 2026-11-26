// @ts-nocheck
import { as3values, bindMethods } from '@/flash/as3';

export class FSM {
  declare states: any;
  declare actual_state: any;
  constructor(actual_state) {
         
         this.states = new Array();
         this.actual_state = actual_state;
         this.addState(this.actual_state);
      }
  start() {
         this.getActualState().enter();
      }
  addState(state) {
         this.states.push(state);
      }
  addTransition(text, text2, text3) {
         var state = this.getState(text);
         var state2 = this.getState(text2);
         this.checkState(state);
         this.checkState(state2);
         state.addTransition(state2,text3);
      }
  getState(text) {
         var state = null;
         for (state of as3values(this.states))
         {
            if(text == state.getName())
            {
               return state;
            }
         }
         throw new Error("No existe estado con nombre " + text);
      }
  takeTransition(text) {
         this.getActualState().leave();
         this.actual_state = this.getActualState().getTargetForTransition(text);
         this.getActualState().enter();
      }
  getActualState() {
         return this.actual_state;
      }
  checkState(state) {
         if(this.states.indexOf(state) < 0)
         {
            throw new Error("Estado " + state.getName() + " no se encuentra en la FSM");
         }
      }
  clear() {
         var state = null;
         for (state of as3values(this.states))
         {
            state.clear();
         }
         this.states = null;
         this.actual_state = null;
      }
}
FSM.prototype.states = null;
FSM.prototype.actual_state = null;
bindMethods(FSM);
