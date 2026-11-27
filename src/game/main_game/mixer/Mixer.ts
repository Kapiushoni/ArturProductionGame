import { bindMethods, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { Signal } from '@/game/cb/signals/Signal';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { MixerClock } from '@/game/main_game/mixer/MixerClock';
import { MixSlot } from '@/game/main_game/mixer/MixSlot';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { GameSounds } from '@/game/sound/GameSounds';
import type { MixResult } from '@/game/main_game/mixer/MixResult';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';

/**
 * The mixer: two ingredient slots and a result slot (saved as mix slots 1-3).
 * startMix() locks the slots for the mixing time, then the ingredients become the result (onMixEnd(MixResult)).
 */
export class Mixer {
  /** the running mixing time, or null */
  clock: MixerClock = null;
  onMixStart: Signal;
  onMixEnd: Signal;
  slot_1: Slot;
  slot_2: Slot;
  slot_3: MixSlot;
  private strat: MixStrategy;

  constructor() {
    this.slot_1 = new Slot();
    this.slot_2 = new Slot();
    this.slot_3 = new MixSlot();
    this.strat = new MixStrategy();
    this.onMixEnd = new Signal();
    this.onMixStart = new Signal();
    this.loadData();
  }
  private slots(): Slot[] {
    return [this.slot_1, this.slot_2, this.slot_3];
  }
  /** loads the saved items, then saves every later change */
  loadData() {
    this.slots().forEach((slot, i) => {
      const saveId = i + 1;
      const item = services.saveSystem.loadMixItem(saveId);
      if (item != null) {
        slot.add(item);
      }
      slot.onChange.add(this.saveSlot(saveId));
    });
  }
  saveSlot(saveId: number) {
    const id = uint(saveId);
    return (change: SlotChange) => {
      services.saveSystem.saveMix(id, change.getNewItem());
    };
  }
  /** both ingredients are there, the result slot is free and nothing is mixing */
  canMix(): boolean {
    return !this.slot_1.isEmpty() && !this.slot_2.isEmpty() && this.slot_3.isEmpty() && this.clock == null;
  }
  startMix() {
    if (!this.canMix()) {
      return;
    }
    this.lock();
    this.clock = new MixerClock(this.slot_1.getContent(), this.slot_2.getContent());
    this.clock.atEndMix.add(this.endMix);
    this.clock.start();
    this.onMixStart.emit();
  }
  endMix() {
    this.unlock();
    const first = this.slot_1.getContent();
    const second = this.slot_2.getContent();
    const mix: MixResult = this.strat.getMix(first, second);
    const item = mix.item;
    this.slot_1.remove(first);
    this.slot_2.remove(second);
    this.slot_3.add(item);
    this.clock = null;
    this.onMixEnd.emit(mix);
    if (mix.recipe != null && mix.recipe.mustShow) {
      services.saveSystem.saveRecipe(mix.recipe);
    }
    services.saveSystem.savePendingItems();
    services.sound.playFx(GameSounds.MIX_DONE);
    if (item.getID() == 'FriendlyRockJr') {
      services.achievements.friendlyRockJrObtained();
    }
    services.achievements.madeMix();
  }
  lock() {
    for (const slot of this.slots()) {
      slot.lock();
    }
  }
  unlock() {
    for (const slot of this.slots()) {
      slot.unlock();
    }
  }
  /** 1, 2: ingredients; 3: result */
  getSlot(index: number): Slot {
    return [undefined, this.slot_1, this.slot_2, this.slot_3][uint(index)];
  }
  clear() {
    this.slot_1.clear();
    this.slot_2.clear();
    this.slot_3.clear();
    this.onMixEnd.clear();
    this.onMixEnd = null;
    this.onMixStart.clear();
    this.onMixStart = null;
    if (this.clock != null) {
      this.clock.stop();
    }
    this.clock = null;
  }
}
bindMethods(Mixer);
