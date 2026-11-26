// @ts-nocheck
import { as3values, bindMethods, int, uint } from '@/flash/as3';
import { OneTimeSlot } from '@/game/main_game/item_containers/OneTimeSlot';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';

export class Loot {
  declare slots: any;
  constructor(dungeonConfigData, probabilisticSet) {
         var lootDataItem = null;
         var i = uint(0);
         var slot = null;
         var text = null;
         
         this.slots = [];
         var probabilisticSet2 = new ProbabilisticSet();
         for (lootDataItem of as3values(dungeonConfigData.lootData))
         {
            probabilisticSet2.add(lootDataItem[0],lootDataItem[1]);
         }
         i = uint(0);
         while(i < 3 && probabilisticSet.length > 0)
         {
            slot = this.makeSlot(probabilisticSet.pop());
            this.slots.push(slot);
            i++;
         }
         var j = int(int(i));
         while(j < 3)
         {
            text = probabilisticSet2.pop();
            slot = this.makeSlot(text);
            this.slots.push(slot);
            j++;
         }
      }
  makeSlot(text = null) {
         var item = null;
         if(text != null)
         {
            item = ItemFactory.getInstance().getItem(text);
         }
         return new OneTimeSlot(item);
      }
  getSlot(num) { num = int(num);
         return this.slots[num];
      }
  getBooty() {
         return this.slots;
      }
  clear() {
         var slot = null;
         for (slot of as3values(this.slots))
         {
            slot.clear();
         }
         this.slots = null;
      }
}
Loot.prototype.slots = null;
bindMethods(Loot);
