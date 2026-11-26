// @ts-nocheck
import { as3values, bindMethods, uint } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { BossDungeon } from '@/game/main_game/boss_dungeon/BossDungeon';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonStats } from '@/game/main_game/dungeon/DungeonStats';
import { Fight } from '@/game/main_game/dungeon/Fight';
import { Loot } from '@/game/main_game/dungeon/Loot';
import { XpCalculator } from '@/game/main_game/dungeon/XpCalculator';

export class Dungeon {
  static theXpCalulator = null;
  declare onFight: any;
  declare loot: any;
  declare fights: any;
  declare current: any;
  declare fighting: any;
  declare level: any;
  declare stats: any;
  declare onLose: any;
  declare onWin: any;
  constructor(level, dungeonConfigData, probabilisticSet) {
         
         this.level = level;
         this.fighting = false;
         this.onLose = new Signal();
         this.onWin = new Signal();
         this.onFight = new Signal();
         this.stats = new DungeonStats(level);
         this.fights = [];
         this.initializeFights(dungeonConfigData);
         this.loot = this.createLoot(dungeonConfigData,probabilisticSet);
         this.current = uint(0);
      }
  static get DungeonConfig() {
         return main.config.get("DungeonConfig");
      }
  static get xpCalulator() {
         if(Dungeon.theXpCalulator == null)
         {
            Dungeon.theXpCalulator = new XpCalculator();
         }
         return Dungeon.theXpCalulator;
      }
  static set xpCalulator(value) {
         Dungeon.theXpCalulator = value;
      }
  enter() {
         main.saveSystem.savePendingItems();
         var jinn = main.game.getJinn();
         jinn.gear.lock();
         jinn.liver.unlock();
         this.stats.start();
      }
  getId() {
         return this.level.id;
      }
  getStats() {
         return this.stats;
      }
  exit() {
         main.saveSystem.savePendingItems();
         main.game.getJinn().gear.unlock();
         main.game.getJinn().liver.lock();
         main.game.getJinn().liver.clearBuffs();
         this.clear();
      }
  createLoot(dungeonConfigData, probabilisticSet) {
         return new Loot(dungeonConfigData,probabilisticSet);
      }
  initializeFights(dungeonConfigData) {
         var enemiesDataItem = null;
         var flag = true;
         for (enemiesDataItem of as3values(dungeonConfigData.enemiesData))
         {
            this.fights.push(this.createFight(this.createEnemy(enemiesDataItem[0],enemiesDataItem[1]),flag));
            flag = false;
         }
      }
  createFight(enemy, flag) {
         return new Fight(enemy,flag);
      }
  createEnemy(text, num) { num = uint(num);
         return CharacterFactory.getInstance().getEnemy(text,num);
      }
  get enemies() {
         var fight = null;
         var _loc1_ = [];
         for (fight of as3values(this.fights))
         {
            _loc1_.push(fight.getEnemy());
         }
         return _loc1_;
      }
  getLoot() {
         return this.loot;
      }
  startFight() {
         this.fighting = true;
         this.onFight.emit(this.currentFight);
         this.currentFight.fight();
      }
  get currentFight() {
         return this.fights[this.current];
      }
  wonFight() {
         this.fighting = false;
         if(this.current == this.fights.length - 1)
         {
            main.game.getJinn().gear.unlock();
            main.game.getJinn().liver.lock();
            main.game.getJinn().liver.clearBuffs();
            this.currentFight.deactivate();
            ++this.current;
            this.stats.end(this.getDefeated());
            this.advertiseAchievements();
            this.onWin.emit();
            this.level.clear();
            main.saveSystem.saveClearedLevel(this.getId());
         }
         else
         {
            this.currentFight.leave(this.goToNextFight);
         }
      }
  advertiseAchievements() {
         if(this.level.getDungeonId() == BossDungeon.idBossLevel)
         {
            main.achievementDispatcher.endLastDungeon();
         }
         if(this.level.getDungeonId() == "8")
         {
            main.achievementDispatcher.finishFirstPage();
         }
         var gear = main.game.getJinn().gear;
         if(gear.equipment_1.isEmpty() && gear.equipment_2.isEmpty() && gear.shield.isEmpty() && gear.weapon.isEmpty())
         {
            main.achievementDispatcher.unequippedDungeonCompleted(this.level);
         }
      }
  suddenDeath() {
         this.stats.end(this.getDefeated());
         if(this.fighting)
         {
            this.currentFight.suddenDeath();
            this.fighting = false;
         }
         else
         {
            this.onLose.emit();
         }
      }
  getDefeated() {
         var list = new Array();
         var i = uint(0);
         while(i < this.current)
         {
            list.push(this.fights[i].getEnemy());
            i++;
         }
         return list;
      }
  goToNextFight() {
         this.currentFight.deactivate();
         ++this.current;
         this.startFight();
      }
  lostFight() {
         this.fighting = false;
         this.stats.end(this.getDefeated());
         main.game.getJinn().gear.unlock();
         main.game.getJinn().liver.lock();
         main.game.getJinn().liver.clearBuffs();
         this.onLose.emit();
      }
  clear() {
         var fight = null;
         while(this.current < this.fights.length)
         {
            this.currentFight.deactivate();
            ++this.current;
         }
         for (fight of as3values(this.fights))
         {
            fight.clear();
         }
         this.fights = null;
         this.stats.clear();
         this.stats = null;
         this.onLose.clear();
         this.onLose = null;
         this.onWin.clear();
         this.onWin = null;
         this.onFight.clear();
         this.onFight = null;
      }
  getLevel() {
         return this.level;
      }
}
Dungeon.prototype.onFight = null;
Dungeon.prototype.loot = null;
Dungeon.prototype.fights = null;
Dungeon.prototype.current = 0;
Dungeon.prototype.fighting = false;
Dungeon.prototype.level = null;
Dungeon.prototype.stats = null;
Dungeon.prototype.onLose = null;
Dungeon.prototype.onWin = null;
bindMethods(Dungeon);
