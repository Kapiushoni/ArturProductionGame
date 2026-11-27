import { bindMethods, int, uint } from '@/flash/as3';
import { services } from '@/game/services';

/** A dungeon on the map: locked -> unlocked -> cleared. `correlative`: the levels it opens when cleared. */
export class Level {
  dungeonId: string;
  private state: number;
  correlative: Level[];

  constructor(dungeonId: string, state = 1) {
    this.dungeonId = dungeonId;
    this.state = uint(state);
    this.correlative = [];
  }
  static get LOCKED(): number {
    return 1;
  }
  static get UNLOCKED(): number {
    return 2;
  }
  static get CLEARED(): number {
    return 3;
  }
  /** map page: dungeons 1-8, 9-16, 17+ */
  getArea(): number {
    const id = int(this.dungeonId);
    if (id <= 8) {
      return 1;
    }
    if (id <= 16) {
      return 2;
    }
    return 3;
  }
  isLegendary(): boolean {
    return false;
  }
  isSpecial(): boolean {
    return false;
  }
  addCorrelative(level: Level) {
    this.correlative.push(level);
  }
  isLocked(): boolean {
    return this.state == Level.LOCKED;
  }
  isCleared(): boolean {
    return this.state == Level.CLEARED;
  }
  isUnlocked(): boolean {
    return this.state >= Level.UNLOCKED;
  }
  getName(): string {
    return services.texts.get('dungeonName', [this.id]);
  }
  unlock() {
    if (this.isLocked()) {
      this.state = Level.UNLOCKED;
    }
  }
  clear() {
    if (!this.isCleared()) {
      this.state = Level.CLEARED;
    }
  }
  get id(): string {
    return this.dungeonId;
  }
}
bindMethods(Level);
