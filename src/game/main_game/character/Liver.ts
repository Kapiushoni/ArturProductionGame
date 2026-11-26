// @ts-nocheck
import { __DEFER, as3as, bindMethods } from '@/flash/as3';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { Signal } from '@/game/cb/signals/Signal';
import { cbArray } from '@/game/cb/utils/cbArray';
import { main } from '@/game/main';
import { SlotChange } from '@/game/main_game/item_containers/SlotChange';
import { Category } from '@/game/main_game/items/Category';
import { Consumable } from '@/game/main_game/items/Consumable';
import { GameSounds } from '@/game/sound/GameSounds';

export class Liver extends Slot {
  declare fighter: any;
  onLock = new Signal();
  constructor(fighter) {super(__DEFER); 
         this.fighter = fighter;
          this.__init_Slot();
         this.lock();
      }
  lock() {
         super.lock();
         this.onLock.emit(true);
      }
  unlock() {
         super.unlock();
         this.onLock.emit(false);
      }
  moveFrom(item, dragContainer) {
         dragContainer.remove(item);
         this.add(item);
      }
  add(item) { const __self = this;
         var consumable = as3as(item.getCategory(), Consumable);
         if(!consumable.isInstant())
         {
            consumable.atEndEffect.add(this.remove);
            consumable.degrade();
            super.add(item);
         }
         else
         {
            __self.onChange.emit(new SlotChange(this,item,null));
         }
         this.fighter.stats.getEffectGuardian().addEfectsOfItem(item);
         this.fighter.consumePotion(item);
         if(consumable.isInstant())
         {
            item.clear();
         }
         main.saveSystem.savePendingItems();
         main.soundManager.playFx(GameSounds.CONSUMABLE);
      }
  activeBuffs() { const __self = this;
         var content = null;
         var cbArray2 = new cbArray();
         if(!__self.isEmpty())
         {
            content = __self.getContent();
            cbArray2.pushIfNotPresent(content.getPrimaryModifier().getCategory());
            cbArray2.pushIfNotPresent(content.getSecondaryModifier().getCategory());
         }
         return cbArray2;
      }
  remove(item) {
         this.fighter.stats.getEffectGuardian().removeEfectsOfItem(item);
         this.fighter.endPotionEffect(item);
         super.remove(item);
         item.clear();
      }
  canRemove(item) {
         return false;
      }
  canMoveFrom(item, dragContainer) { const __self = this;
         var flag = item.getCategory().type == Category.CONSUMABLE_CATEGORY && (as3as(item.getCategory(), Consumable)).isInstant();
         return !this.isLocked() && (flag || __self.isEmpty() && item.canBeContained(this));
      }
  isLocked() {
         return Boolean(super.isLocked()) || this.fighter.stats.isDead();
      }
  canSwap(dragContainer) {
         return false;
      }
  itsCompatible(item, dragContainer) {
         return item.canBeContained(this);
      }
  canContainEquipment() {
         return false;
      }
  canContainWeapon() {
         return false;
      }
  canContainShield() {
         return false;
      }
  clearBuffs() { const __self = this;
         if(!__self.isEmpty())
         {
            this.remove(__self.getContent());
         }
      }
  clear() {
         super.clear();
         this.onLock.clear();
         this.fighter = null;
      }
}
Liver.prototype.fighter = null;
bindMethods(Liver);
