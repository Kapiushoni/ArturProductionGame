import { services } from '@/game/services';
import { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import type { Item } from '@/game/main_game/items/Item';

/** "You made <item>!" after a special recipe. */
export class SpecialMixTip extends BubbleGumTip {
  constructor(item: Item) {
    super(services.texts.get('pbSpecialMixEnd', [item.getNameToShow()]), item);
  }
}
