import { Timer, TimerEvent, bindMethods } from '@/flash/as3';
import { Category } from '@/game/main_game/items/Category';
import { Signal } from '@/game/cb/signals/Signal';
import type { Item } from '@/game/main_game/items/Item';
import type { ItemContainer } from '@/game/main_game/item_containers/ItemContainer';

/**
 * A potion. Instant potions act once; the others wear off over Duration (in 1/10 s per percent:
 * onChange(percent) goes 100 -> 0, then atEndEffect(item)). The countdown stops while the game is paused.
 */
export class Consumable extends Category {
  atEndEffect: Signal;
  onChange: Signal;
  percent = 0;
  private timer: Timer = null;
  private onPause: Signal = null;

  constructor(item: Item, config: any) {
    super(item, config);
    this.atEndEffect = new Signal();
    this.onChange = new Signal();
  }
  isInstant(): boolean {
    return this.item.primaryModifier.isInstant() && this.item.secondaryModifier.isInstant();
  }
  /** starts wearing off (once); onPause(paused): the game's pause signal */
  degrade(onPause: Signal) {
    if (this.timer == null) {
      this.onPause = onPause;
      this.onPause.add(this.pause);
      this.percent = 100;
      this.timer = new Timer(this.item.duration * 10, 100);
      this.timer.addEventListener(TimerEvent.TIMER, this.tick);
      this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.complete);
      this.timer.start();
      this.onChange.emit(this.percent);
    }
  }
  pause(paused: boolean) {
    if (paused) {
      this.timer.stop();
    } else {
      this.timer.start();
    }
  }
  tick(_event: TimerEvent) {
    --this.percent;
    this.onChange.emit(this.percent);
  }
  complete(_event: TimerEvent) {
    this.clearTimer();
    this.atEndEffect.emit(this.item);
  }
  get type(): string {
    return Category.CONSUMABLE_CATEGORY;
  }
  canBeContained(itemContainer: ItemContainer): boolean {
    return itemContainer.canContainConsumable();
  }
  clearTimer() {
    if (this.timer != null) {
      this.timer.removeEventListener(TimerEvent.TIMER, this.tick);
      this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.complete);
      this.timer.stop();
      this.timer = null;
      this.onPause.remove(this.pause);
    }
  }
  clear() {
    this.clearTimer();
    this.atEndEffect.clear();
    this.atEndEffect = null;
    this.onChange.clear();
    this.onChange = null;
    super.clear();
  }
}
bindMethods(Consumable);
