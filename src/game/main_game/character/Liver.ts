import { as3as, bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { Signal } from '@/game/cb/signals/Signal';
import { cbArray } from '@/game/cb/utils/cbArray';
import { SlotChange } from '@/game/main_game/item_containers/SlotChange';
import { Category } from '@/game/main_game/items/Category';
import { Consumable } from '@/game/main_game/items/Consumable';
import { GameSounds } from '@/game/sound/GameSounds';
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Item } from '@/game/main_game/items/Item';
import type { Jinn } from '@/game/main_game/character/Jinn';

/**
 * The jinn's potion slot: a potion dropped here is drunk. Instant potions act and disappear;
 * the others stay here while they wear off. Unlocked only inside a dungeon; onLock(locked) on every change.
 */
export class Liver extends Slot {
  private fighter: Jinn; // Jinn
  onLock = new Signal();
  /** the game's pause signal (potions stop wearing off while paused) */
  pauseSignal: Signal = null;

  constructor(fighter: Jinn) {
    super();
    this.fighter = fighter;
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
  moveFrom(item: Item, from: IDragContainer) {
    from.remove(item);
    this.add(item);
  }
  /** drinks the potion */
  add(item: Item) {
    const potion = as3as(item.getCategory(), Consumable) as Consumable;
    if (!potion.isInstant()) {
      potion.atEndEffect.add(this.remove);
      potion.degrade(this.pauseSignal);
      super.add(item);
    } else {
      this.onChange.emit(new SlotChange(this, item, null));
    }
    this.fighter.stats.getEffectGuardian().addEfectsOfItem(item);
    this.fighter.consumePotion(item);
    if (potion.isInstant()) {
      item.clear();
    }
    services.saveSystem.savePendingItems();
    services.sound.playFx(GameSounds.CONSUMABLE);
  }
  /** stat types affected by the active potion */
  activeBuffs(): cbArray {
    const buffs = new cbArray();
    if (!this.isEmpty()) {
      const potion = this.getContent();
      buffs.pushIfNotPresent(potion.primaryModifier.getCategory());
      buffs.pushIfNotPresent(potion.secondaryModifier.getCategory());
    }
    return buffs;
  }
  /** the potion's effect ended (or was cleared) */
  remove(item: Item) {
    this.fighter.stats.getEffectGuardian().removeEfectsOfItem(item);
    this.fighter.endPotionEffect(item);
    super.remove(item);
    item.clear();
  }
  canRemove(_item: Item): boolean {
    return false;
  }
  /** instant potions can always be drunk; others only when no potion is active */
  canMoveFrom(item: Item, _from: IDragContainer): boolean {
    const instant =
      item.getCategory().type == Category.CONSUMABLE_CATEGORY &&
      (as3as(item.getCategory(), Consumable) as Consumable).isInstant();
    return !this.isLocked() && (instant || (this.isEmpty() && item.canBeContained(this)));
  }
  isLocked(): boolean {
    return super.isLocked() || this.fighter.stats.isDead();
  }
  canSwap(_other: IDragContainer): boolean {
    return false;
  }
  itsCompatible(item: Item, _from: IDragContainer): boolean {
    return item.canBeContained(this);
  }
  canContainEquipment(): boolean {
    return false;
  }
  canContainWeapon(): boolean {
    return false;
  }
  canContainShield(): boolean {
    return false;
  }
  clearBuffs() {
    if (!this.isEmpty()) {
      this.remove(this.getContent());
    }
  }
  clear() {
    super.clear();
    this.onLock.clear();
    this.fighter = null;
  }
}
bindMethods(Liver);
