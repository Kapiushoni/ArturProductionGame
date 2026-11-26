// @ts-nocheck
import { Dictionary, as3as, as3values, bindMethods, int } from '@/flash/as3';
import { DailyBonus } from '@/game/bonus/DailyBonus';
import { cbArray } from '@/game/cb/utils/cbArray';
import { main } from '@/game/main';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { Element } from '@/game/main_game/element/Element';
import { LegendaryLevel } from '@/game/main_game/map/LegendaryLevel';
import { Level } from '@/game/main_game/map/Level';
import { SpecialLevel } from '@/game/main_game/map/SpecialLevel';

export class Map {
  declare levels: any;
  constructor() {
         
         this.initializeLevels();
         this.setConections();
         this.getLevel("1").unlock();
         this.loadSave();
         this.unlockUnlocked();
      }
  getNextLevel(level) {
         var correlative = level.getCorrelative();
         if(correlative.length > 0)
         {
            return correlative[0];
         }
         return null;
      }
  getPreviousLevel(text) {
         var level = null;
         if(!this.levels.get(text))
         {
            return null;
         }
         for (level of as3values(this.levels))
         {
            if(level.getCorrelative().indexOf(this.levels.get(text)) >= 0)
            {
               return level;
            }
         }
         return null;
      }
  biggestUnlockedLevel() {
         var level = null;
         var i = int(1);
         while(i <= 25)
         {
            if((as3as(this.levels.get(i), Level)).isUnlocked())
            {
               level = this.levels.get(i);
            }
            i++;
         }
         return level;
      }
  getLevel(text) {
         return this.levels.get(text);
      }
  getLevels() {
         return this.levels;
      }
  initializeLevels() {
         var dungeonsId = null;
         this.levels = new Dictionary();
         for (dungeonsId of as3values(DungeonFactory.getInstance().getDungeonsIds()))
         {
            if(dungeonsId == "31")
            {
               this.addLevel(new LegendaryLevel(dungeonsId,Element.ice,DailyBonus.getNextSpecialDungeonDate(Element.ice)));
            }
            else if(dungeonsId == "32")
            {
               this.addLevel(new LegendaryLevel(dungeonsId,Element.fire,DailyBonus.getNextSpecialDungeonDate(Element.fire)));
            }
            else if(["26","27","28","29","30"].indexOf(dungeonsId) >= 0)
            {
               this.addLevel(new SpecialLevel(dungeonsId));
            }
            else
            {
               this.addLevel(new Level(dungeonsId));
            }
         }
      }
  addLevel(level) {
         this.levels.set(level.getDungeonId(), level);
      }
  setConections() {
         var i = int(1);
         while(i < 25)
         {
            this.levels.get(i).addCorrelative(this.levels.get(i + 1));
            i++;
         }
         this.levels.get(4).addCorrelative(this.levels.get(26));
         this.levels.get(15).addCorrelative(this.levels.get(27));
         this.levels.get(19).addCorrelative(this.levels.get(28));
         this.levels.get(23).addCorrelative(this.levels.get(29));
         this.levels.get(29).addCorrelative(this.levels.get(30));
         this.levels.get(26).addCorrelative(this.levels.get(6));
         this.levels.get(27).addCorrelative(this.levels.get(16));
         this.levels.get(28).addCorrelative(this.levels.get(20));
         this.levels.get(30).addCorrelative(this.levels.get(24));
      }
  loadSave() {
         var loc1_Item = null;
         var clearedLevels = main.saveSystem.getClearedLevels();
         for (loc1_Item of as3values(clearedLevels))
         {
            this.getLevel(loc1_Item).clear();
         }
      }
  unlockUnlocked() {
         var level = null;
         var correlativeItem = null;
         var cbArray2 = new cbArray();
         for (level of as3values(this.levels))
         {
            if(level.isCleared())
            {
               for (correlativeItem of as3values(level.getCorrelative()))
               {
                  if(correlativeItem.isLocked())
                  {
                     correlativeItem.unlock();
                     cbArray2.pushIfNotPresent(correlativeItem);
                  }
               }
            }
         }
         return cbArray2;
      }
  clear() {
         this.levels = null;
      }
}
Map.prototype.levels = null;
bindMethods(Map);
