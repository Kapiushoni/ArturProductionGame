// @ts-nocheck
import { as3keys, as3values, bindMethods } from '@/flash/as3';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { DungeonConfigParser } from '@/game/main_game/dungeon/DungeonConfigParser';
import { ProbabilisticSet } from '@/game/util/ProbabilisticSet';
import { BossDungeonView } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonView';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';

export class DungeonFactory {
  static instance = null;
  static config = null;
  static firstLootData = null;
  constructor(singletonLock) {
         
         if(!singletonLock)
         {
            throw new Error("Static Class");
         }
      }
  static set firstLoot(value) {
         if(DungeonFactory.firstLootData != null)
         {
            throw new Error("Can\'t do that");
         }
         DungeonFactory.firstLootData = value;
      }
  static getInstance() {
         if(DungeonFactory.instance == null)
         {
            DungeonFactory.instance = new DungeonFactory(new SingletonLock());
         }
         return DungeonFactory.instance;
      }
  static setConfig(dict) {
         DungeonFactory.config = dict;
      }
  static getConfigFor(text) {
         return new DungeonConfigParser(DungeonFactory.config.get(text));
      }
  getDungeonsIds() {
         var key = undefined;
         var list = new Array();
         for (key of as3keys(DungeonFactory.config))
         {
            list.push(key);
         }
         return list;
      }
  getDungeon(level) {
         var configFor = DungeonFactory.getConfigFor(level.getDungeonId());
         if(level.getDungeonId() == BossDungeon.idBossLevel)
         {
            return new BossDungeon(level,configFor,this.getFirstLoot(level));
         }
         return new Dungeon(level,configFor,this.getFirstLoot(level));
      }
  getFirstLoot(level) {
         var list = null;
         var loc3_Item = null;
         var probabilisticSet = new ProbabilisticSet();
         if(!level.isCleared())
         {
            list = DungeonConfigParser.parseLootData(DungeonFactory.firstLootData.get(level.id));
            for (loc3_Item of as3values(list))
            {
               probabilisticSet.add(loc3_Item[0],loc3_Item[1]);
            }
         }
         return probabilisticSet;
      }
  getViewFor(dungeonState) {
         if(dungeonState.getDungeon().getId() == BossDungeon.idBossLevel)
         {
            return new BossDungeonView(dungeonState);
         }
         return new DungeonView(dungeonState);
      }
}
bindMethods(DungeonFactory);

class SingletonLock {
  constructor() {
      
   }
}
bindMethods(SingletonLock);
