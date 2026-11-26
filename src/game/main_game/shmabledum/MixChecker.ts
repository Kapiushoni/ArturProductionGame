// @ts-nocheck
import { as3as, as3values, bindMethods, int, uint } from '@/flash/as3';
import { Random } from '@/game/cb/utils/Random';
import { main } from '@/game/main';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { MixRecipe } from '@/game/main_game/shmabledum/MixRecipe';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';

export class MixChecker {
  static readonly MEMORY = uint(3);
  declare banned: any;
  declare slots: any;
  declare mixables: any;
  constructor(slots) {
         
         this.banned = new Array();
         this.slots = slots;
      }
  checkForMixes(list) {
         var param1Item = null;
         if(!main.theTutorial.isMixKnown())
         {
            return false;
         }
         this.mixables = new ProbabilisticSet();
         for (param1Item of as3values(list))
         {
            this.checkMixWithItem(param1Item);
         }
         return this.mixables.length > 0;
      }
  searchForSlotsMixes(list) {
         var list2 = null;
         var param1Item = null;
         var content = null;
         var content2 = null;
         var i = int(0);
         var content3 = null;
         this.mixables = new ProbabilisticSet();
         if(list != null && list.length > 0)
         {
            list2 = new Array();
            for (param1Item of as3values(list))
            {
               content = param1Item.getContent();
               if(content != null)
               {
                  list2.push(content);
               }
            }
            if(list2.length > 0)
            {
               this.checkForMixes(list2);
            }
         }
         var j = int(0);
         while(j < this.slots.length - 1)
         {
            content2 = (this.slots[j]).getContent();
            if(content2 != null)
            {
               i = int(j + 1);
               while(i < this.slots.length)
               {
                  content3 = (this.slots[i]).getContent();
                  if(content3 != null)
                  {
                     this.checkMixWithItems(content2,content3);
                  }
                  i++;
               }
            }
            j++;
         }
         return this.mixables.length > 0;
      }
  getMix() {
         var mixRecipe = null;
         var list = new Array();
         while(this.mixables.length > 0)
         {
            mixRecipe = as3as(this.mixables.pop(), MixRecipe);
            if(!this.isBanned(mixRecipe))
            {
               this.addBanned(mixRecipe);
               return mixRecipe;
            }
            list.push(mixRecipe);
         }
         if(list.length > 0)
         {
            return list[Random.nextInt(list.length - 1)];
         }
         return null;
      }
  addBanned(mixRecipe) {
         if(!this.isBanned(mixRecipe))
         {
            if(this.banned.length >= MixChecker.MEMORY)
            {
               this.banned.shift();
            }
            this.banned.push(mixRecipe);
         }
      }
  isBanned(mixRecipe) {
         var bannedItem = null;
         for (bannedItem of as3values(this.banned))
         {
            if(bannedItem.equals(mixRecipe))
            {
               return true;
            }
         }
         return false;
      }
  checkMixWithItem(item) {
         var slot = null;
         var content = null;
         if(item == null)
         {
            return;
         }
         for (slot of as3values(this.slots))
         {
            if(!slot.isEmpty())
            {
               content = slot.getContent();
               this.checkMixWithItems(item,content);
            }
         }
      }
  checkMixWithItems(item, item2) {
         var specialMixId = MixStrategy.getSpecialMixId(item,item2,true);
         if(specialMixId != null && specialMixId.mustShow)
         {
            this.addRecipe(new MixRecipe(item,item2,specialMixId.result),this.mixables);
         }
         specialMixId = MixStrategy.getSpecialMixId(item2,item,true);
         if(specialMixId != null && specialMixId.mustShow)
         {
            this.addRecipe(new MixRecipe(item2,item,specialMixId.result),this.mixables);
         }
      }
  addRecipe(mixRecipe, probabilisticSet) {
         if(!probabilisticSet.contains(mixRecipe))
         {
            probabilisticSet.add(mixRecipe);
         }
      }
  clear() {
         this.banned = null;
         this.mixables = null;
      }
}
MixChecker.prototype.banned = null;
MixChecker.prototype.slots = null;
MixChecker.prototype.mixables = null;
bindMethods(MixChecker);
