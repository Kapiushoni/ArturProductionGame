import { bindMethods, int } from '@/flash/as3';
import { services } from '@/game/services';
import { NullSlot } from '@/game/main_game/item_containers/NullSlot';
import type { Item } from '@/game/main_game/items/Item';
import type { InteractiveShmabledum } from '@/game/main_game/shmabledum/InteractiveShmabledum';
import type { ShmabledumInteraction } from '@/game/main_game/shmabledum/ShmabledumInteraction';

/** A tip in a speech bubble, optionally showing one or two items. */
export class BubbleGumTip implements ShmabledumInteraction {
  private text: string;
  principalSlot: NullSlot;
  secondarySlot: NullSlot;

  constructor(text: string, item: Item = null, item2: Item = null) {
    this.principalSlot = new NullSlot();
    this.secondarySlot = new NullSlot();
    this.principalSlot.add(item);
    this.secondarySlot.add(item2);
    this.text = text;
  }
  get tipText(): string {
    return this.text;
  }
  make(shmabledum: InteractiveShmabledum) {
    shmabledum.sayTip(this);
  }
  /** how long the bubble stays (ms): Shmabledum.delayAdvice seconds, plus time to read the text */
  getTime(): number {
    const seconds = Number(services.config.get('Shmabledum').delayAdvice) + Number(this.text.length) / 6 / 2;
    return int(1000 * seconds);
  }
  clear() {
    this.principalSlot.clear();
    this.secondarySlot.clear();
  }
}
bindMethods(BubbleGumTip);
