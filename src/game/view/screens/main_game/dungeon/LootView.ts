import { Timer, TimerEvent, as3as, as3values, bindMethods, int } from '@/flash/as3';
import { app } from '@/game/app';
import { SmokeEffect } from '@/game/view/effect/SmokeEffect';
import { SlotView } from '@/game/view/screens/main_game/slot/SlotView';
import type { Loot } from '@/game/main_game/dungeon/Loot';

export class LootView {
  loot: any = null;
  slots: any = null;
  bg: any = null;
  timer: any = null;
  showing = 0;
  constructor(loot: Loot, bg: any) {
    this.bg = bg;
    this.loot = loot;
    this.slots = [];
    this.initialize();
  }
  pause() {
    if (this.showing < 3) {
      this.clearTimer();
      while (this.showing < 3) {
        this.showing = int(this.showing + 1);
        as3as(this.slots[this.showing - 1], SlotView).unHideItem();
      }
      this.showing = int(this.showing + 1);
    }
  }
  resume() {}
  initialize() {
    this.showing = 0;
    let i = 1;
    while (i <= 3) {
      this.slots[i - 1] = new SlotView(this.loot.getSlot(i - 1));
      this.slots[i - 1].initialize(this.bg['slot_' + i]);
      as3as(this.slots[i - 1], SlotView).hideItem();
      i++;
    }
  }
  showLoot() {
    if (this.showing >= 3) {
      return;
    }
    this.timer = new Timer(300, 3);
    this.timer.addEventListener(TimerEvent.TIMER, this.showOneLoot);
    this.timer.start();
  }
  showOneLoot(...rest) {
    if (this.showing >= 3) {
      this.clearTimer();
      return;
    }
    this.showing = int(this.showing + 1);
    this.showLootOf(this.showing);
    if (this.showing >= 3) {
      this.clearTimer();
    }
  }
  showLootOf(num: number) {
    num = int(num);
    const smokeEffect = new SmokeEffect();
    smokeEffect.playOn(this.bg['slot_' + num]);
    as3as(this.slots[num - 1], SlotView).unHideItem();
  }
  takeAll() {
    let bootyItem = null;
    let emptySlot = null;
    let content = null;
    this.clearTimer();
    if (this.showing < 3) {
      while (this.showing < 3) {
        this.showing = int(this.showing + 1);
        this.showLootOf(this.showing);
      }
      this.takeAll();
    } else {
      for (bootyItem of as3values(this.loot.getBooty())) {
        if (!bootyItem.isEmpty()) {
          emptySlot = app.game.getInventory().getEmptySlot();
          if (emptySlot == null) {
            return;
          }
          content = bootyItem.getContent();
          bootyItem.remove(content);
          emptySlot.add(content);
        }
      }
    }
  }
  clearTimer() {
    if (this.timer != null) {
      this.timer.stop();
      this.timer = null;
    }
  }
  clear() {
    for (const slot of as3values(this.slots)) {
      slot.clear();
    }
    this.loot.clear();
    this.clearTimer();
  }
  isEmpty() {
    return this.loot.getSlot(0).isEmpty();
  }
}
bindMethods(LootView);
