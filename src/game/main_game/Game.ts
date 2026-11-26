// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { Map } from '@/game/main_game/map/Map';
import { Mixer } from '@/game/main_game/mixer/Mixer';
import { ShmabledumPrincess } from '@/game/main_game/shmabledum/ShmabledumPrincess';

export class Game {
  declare inv: any;
  declare map: any;
  declare mix: any;
  declare jinn: any;
  declare princess: any;
  declare current_dungeon: any;
  declare pauseSignal: any;
  declare onDungeonSignal: any;
  constructor() {
         
      }
  get onPause() {
         return this.pauseSignal;
      }
  get onDungeon() {
         return this.onDungeonSignal;
      }
  enter() {
         this.jinn = CharacterFactory.getInstance().getJinn();
         this.pauseSignal = new Signal();
         this.onDungeonSignal = new Signal();
         this.inv = new Inventory();
         this.mix = new Mixer();
         this.map = new Map();
         this.princess = new ShmabledumPrincess();
      }
  exit() {
         this.inv.clear();
         this.inv = null;
         this.jinn.clear();
         this.jinn = null;
         this.mix.clear();
         this.mix = null;
         this.map.clear();
         this.map = null;
         this.princess.clear();
         this.princess = null;
         if(this.current_dungeon != null)
         {
            this.current_dungeon.clear();
            this.current_dungeon = null;
         }
         this.onPause.clear();
         this.pauseSignal = null;
         this.onDungeonSignal.clear();
         this.onDungeonSignal = null;
      }
  goToDungeon(level) {
         this.current_dungeon = DungeonFactory.getInstance().getDungeon(level);
         this.current_dungeon.enter();
         this.onDungeon.emit(this.current_dungeon);
         main.saveSystem.saveLastPlayed(level.getDungeonId());
         return this.current_dungeon;
      }
  getDungeon() {
         return this.current_dungeon;
      }
  exitDungeon() {
         this.current_dungeon.exit();
         this.current_dungeon = null;
      }
  getJinn() {
         return this.jinn;
      }
  getShmabledum() {
         return this.princess;
      }
  getInventory() {
         return this.inv;
      }
  getMixer() {
         return this.mix;
      }
  getMap() {
         return this.map;
      }
}
Game.prototype.inv = null;
Game.prototype.map = null;
Game.prototype.mix = null;
Game.prototype.jinn = null;
Game.prototype.princess = null;
Game.prototype.current_dungeon = null;
Game.prototype.pauseSignal = null;
Game.prototype.onDungeonSignal = null;
bindMethods(Game);
