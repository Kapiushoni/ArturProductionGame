// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';

export class BasicPausableState extends BasicState {
  constructor(...__a) { super(__DEFER); if (__a[0] !== __DEFER) this.__init_BasicPausableState(...__a); }
  __init_BasicPausableState(text, callback = null, callback2 = null) {
         this.__init_BasicState(text,callback,callback2);
      }
  pause() {
      }
  resume() {
      }
}
bindMethods(BasicPausableState);
