import { bindMethods, uint } from '@/flash/as3';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { CharacterConfigParser } from '@/game/main_game/character/CharacterConfigParser';
import { Enemy } from '@/game/main_game/character/Enemy';
import { Jinn } from '@/game/main_game/character/Jinn';
import { Roguelite } from '@/game/roguelite/Roguelite';

/** Creates the jinn, enemies and the boss from characters.csv (name -> row). Singleton. */
export class CharacterFactory {
  static instance: CharacterFactory = null;
  /** Dictionary: character name -> row */
  static config: any = null;

  constructor(singletonLock: SingletonLock) {
    if (!singletonLock) {
      throw new Error('Static Class');
    }
  }
  static getInstance(): CharacterFactory {
    if (CharacterFactory.instance == null) {
      CharacterFactory.instance = new CharacterFactory(new SingletonLock());
    }
    return CharacterFactory.instance;
  }
  static setConfig(dict: any) {
    CharacterFactory.config = dict;
  }
  getBoss(level: number): Boss {
    const name = 'boss_normal';
    return new Boss(name, this.getConfig(name), uint(level));
  }
  getEnemy(name: string, level: number): Enemy {
    if (CharacterFactory.config == null) {
      throw new Error('No se cuenta con el archivo de configuracion'); // "the config file is missing"
    }
    return new Enemy(name, this.getConfig(name), uint(level));
  }
  getJinn(): Jinn {
    // the roguelite mod adds the shop's upgrades to the base values
    const row = CharacterFactory.config.get('Jinn');
    return new Jinn('Jinn', new CharacterConfigParser(Roguelite.enabled ? Roguelite.jinnRow(row) : row));
  }
  getConfig(name: string): CharacterConfigParser {
    return new CharacterConfigParser(CharacterFactory.config.get(name));
  }
}
bindMethods(CharacterFactory, ['getJinn']);

class SingletonLock {}
