import { bindMethods } from '@/flash/as3';
import { services } from '@/game/services';
import { Signal } from '@/game/cb/signals/Signal';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { Map } from '@/game/main_game/map/Map';
import { Mixer } from '@/game/main_game/mixer/Mixer';
import { ShmabledumPrincess } from '@/game/main_game/shmabledum/ShmabledumPrincess';
import type { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import type { Jinn } from '@/game/main_game/character/Jinn';
import type { Level } from '@/game/main_game/map/Level';

/**
 * The game model (main.game): the jinn, inventory, mixer, map, the shmabledum and the current dungeon.
 * Everything is created on enter() (when the game screen opens), from the save.
 */
export class Game {
  private inv: Inventory = null;
  private map: Map = null;
  private mix: Mixer = null;
  private jinn: Jinn = null;
  private princess: ShmabledumPrincess = null;
  private current_dungeon: Dungeon = null;
  private pauseSignal: Signal = null;
  private onDungeonSignal: Signal = null;

  /** onPause(paused) */
  get onPause(): Signal {
    return this.pauseSignal;
  }
  /** onDungeon(dungeon) when a dungeon is entered */
  get onDungeon(): Signal {
    return this.onDungeonSignal;
  }
  enter() {
    this.jinn = CharacterFactory.getInstance().getJinn();
    this.pauseSignal = new Signal();
    this.onDungeonSignal = new Signal();
    this.jinn.liver.pauseSignal = this.pauseSignal;
    this.inv = new Inventory();
    this.mix = new Mixer();
    this.map = new Map();
    this.princess = new ShmabledumPrincess(this);
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
    if (this.current_dungeon != null) {
      this.current_dungeon.clear();
      this.current_dungeon = null;
    }
    this.onPause.clear();
    this.pauseSignal = null;
    this.onDungeonSignal.clear();
    this.onDungeonSignal = null;
  }
  goToDungeon(level: Level): Dungeon {
    this.current_dungeon = DungeonFactory.getInstance().getDungeon(level, this);
    this.current_dungeon.enter();
    this.onDungeon.emit(this.current_dungeon);
    services.saveSystem.saveLastPlayed(level.getDungeonId());
    return this.current_dungeon;
  }
  getDungeon(): Dungeon | null {
    return this.current_dungeon;
  }
  exitDungeon() {
    this.current_dungeon.exit();
    this.current_dungeon = null;
  }
  getJinn(): Jinn {
    return this.jinn;
  }
  getShmabledum(): ShmabledumPrincess {
    return this.princess;
  }
  getInventory(): Inventory {
    return this.inv;
  }
  getMixer(): Mixer {
    return this.mix;
  }
  getMap(): Map {
    return this.map;
  }
}
bindMethods(Game);
