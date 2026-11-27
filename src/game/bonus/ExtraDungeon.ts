import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import { NoneFilter } from '@/game/bonus/filter/NoneFilter';
import { Element } from '@/game/main_game/element/Element';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';

/** "specialDungeon": opens a legendary dungeon for the day. */
export class ExtraDungeon implements IDailyBonus {
  private dungeonId: string;
  /** element code of the dungeon ("I" / "F") */
  private element: string;

  constructor(dungeonId: string, element: string) {
    this.dungeonId = dungeonId;
    this.element = element;
  }
  activate(game: any) {
    game.getMap().getLevel(this.dungeonId).unlock();
    game.getMap().unlockUnlocked();
  }
  getElement(): Element {
    return Element.parseElement(this.element);
  }
  getIcon(): BonusIcon {
    return BonusIcon.getExtraDungeon(this.element);
  }
  getFilter(): IBonusFilter {
    return new NoneFilter();
  }
  getAction(): string {
    return '';
  }
}
bindMethods(ExtraDungeon);
