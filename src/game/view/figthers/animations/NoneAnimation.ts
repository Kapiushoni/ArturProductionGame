// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class NoneAnimation {
  declare atFinish: any;
  constructor() {
         
         this.atFinish = new Signal();
      }
  forceKill() {
         return false;
      }
  getName() {
         return "";
      }
  make(fighterView) {
      }
  pause() {
      }
  resume() {
      }
  kill() {
         this.atFinish.clear();
         this.atFinish = null;
      }
  getAtFinish() {
         return this.atFinish;
      }
  mustGoToIdle() {
         return false;
      }
}
NoneAnimation.prototype.atFinish = null;
bindMethods(NoneAnimation);
