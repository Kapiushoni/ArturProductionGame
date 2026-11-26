// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { NullSlot } from '@/game/main_game/item_containers/NullSlot';

export class BubbleGumTip {
  declare text: any;
  declare principalSlot: any;
  declare secondarySlot: any;
  constructor(text, item = null, item2 = null) {
         
         this.principalSlot = new NullSlot();
         this.secondarySlot = new NullSlot();
         this.principalSlot.add(item);
         this.secondarySlot.add(item2);
         this.text = text;
      }
  get tipText() {
         return this.text;
      }
  make(interactiveShmabledum) {
         interactiveShmabledum.sayTip(this);
      }
  getTime() {
         var num = Number(Number(main.config.get("Shmabledum").delayAdvice));
         num = Number(num + (Number(this.text.length) / 6 / 2));
         return int(1000 * num);
      }
  clear() {
         this.principalSlot.clear();
         this.secondarySlot.clear();
      }
}
BubbleGumTip.prototype.text = null;
BubbleGumTip.prototype.principalSlot = null;
BubbleGumTip.prototype.secondarySlot = null;
bindMethods(BubbleGumTip);
