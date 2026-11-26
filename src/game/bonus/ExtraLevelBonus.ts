// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { BonusIcon } from '@/game/bonus/filter/BonusIcon';
import { NoneFilter } from '@/game/bonus/filter/NoneFilter';
import { LevelingEnemies } from '@/game/main_game/character/stats/LevelingEnemies';

export class ExtraLevelBonus {
  declare extraLevel: any;
  declare filter: any;
  constructor(extraLevel = 0, filter = null) { extraLevel = Number(extraLevel);
         
         this.extraLevel = int(extraLevel);
         if(filter == null)
         {
            filter = new NoneFilter();
         }
         this.filter = filter;
      }
  activate() {
         LevelingEnemies.setBonus(this);
      }
  apply(characterConfigData, levelingEnemies) {
         var element = characterConfigData.element;
         if(this.filter.doesApply(element))
         {
            levelingEnemies.setExtraLevel(this.extraLevel);
         }
      }
  getIcon() {
         return BonusIcon.getLevelIcon(this.extraLevel >= 0);
      }
  getFilter() {
         return this.filter;
      }
  getAction() {
         return BonusIcon.Kill;
      }
}
ExtraLevelBonus.prototype.extraLevel = 0;
ExtraLevelBonus.prototype.filter = null;
bindMethods(ExtraLevelBonus);
