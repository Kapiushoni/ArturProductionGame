import { bindMethods } from '@/flash/as3';
import { Fighter } from '@/game/main_game/character/Fighter';
import { Signal } from '@/game/cb/signals/Signal';
import { Gear } from '@/game/main_game/character/Gear';
import { Liver } from '@/game/main_game/character/Liver';
import { JinnStats } from '@/game/main_game/character/stats/JinnStats';
import type { CharacterConfigData } from '@/game/main_game/character/CharacterConfigData';
import type { Item } from '@/game/main_game/items/Item';
import type { IFight } from '@/game/main_game/dungeon/IFight';

/** The player's jinn: gear, potion slot (liver) and saved experience. */
export class Jinn extends Fighter {
  liver: Liver;
  gear: Gear;
  onPotionConsumition: Signal;
  endPotionConsumition: Signal;

  constructor(name: string, config: CharacterConfigData) {
    super(name, config);
    this.onPotionConsumition = new Signal();
    this.endPotionConsumition = new Signal();
    this.liver = new Liver(this);
    this.gear = new Gear(this);
    this.loadData();
  }
  consumePotion(item: Item) {
    this.onPotionConsumition.emit(item);
  }
  endPotionEffect(item: Item) {
    this.endPotionConsumition.emit(item);
  }
  /** loads the saved experience and heals to full */
  loadData() {
    this.stats.loadData();
    this.stats.refillHealth();
  }
  isJinn(): boolean {
    return true;
  }
  createStats(config: CharacterConfigData): JinnStats {
    return new JinnStats(config, this);
  }
  prepareForFight(_fight: IFight) {}
  clear() {
    super.clear();
    this.onPotionConsumition.clear();
    this.endPotionConsumition.clear();
    this.gear.clear();
    this.liver.clear();
  }
}
bindMethods(Jinn, ['consumePotion', 'clear']);
