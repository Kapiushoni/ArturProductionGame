// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import { NoneFilter } from '@/game/bonus/filter/NoneFilter';
import { main } from '@/game/main';
import { Element } from '@/game/main_game/element/Element';

export class ExtraDungeon {
  declare dungeonId: any;
  declare element: any;
  constructor(dungeonId, element) {
         
         this.dungeonId = dungeonId;
         this.element = element;
      }
  activate() {
         var level = main.game.getMap().getLevel(this.dungeonId);
         level.unlock();
         main.game.getMap().unlockUnlocked();
      }
  getElement() {
         return Element.parseElement(this.element);
      }
  getIcon() {
         return BonusIcon.getExtraDungeon(this.element);
      }
  getFilter() {
         return new NoneFilter();
      }
  getAction() {
         return "";
      }
}
ExtraDungeon.prototype.dungeonId = null;
ExtraDungeon.prototype.element = null;
bindMethods(ExtraDungeon);
