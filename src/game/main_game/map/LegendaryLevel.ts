import { services } from '@/game/services';
import { Level } from '@/game/main_game/map/Level';
import type { Element } from '@/game/main_game/element/Element';

/** The legendary ice (31) and fire (32) dungeons. Originally open only on their event days, now always open. */
export class LegendaryLevel extends Level {
  private theElement: Element;
  /** next event day (still shown on the map) */
  private date: Date;

  constructor(dungeonId: string, element: Element, date: Date, state = 1) {
    super(dungeonId, state);
    this.theElement = element;
    this.date = date;
  }
  isLocked(): boolean {
    return false;
  }
  isUnlocked(): boolean {
    return true;
  }
  isLegendary(): boolean {
    return true;
  }
  getDate(): Date {
    return this.date;
  }
  get element(): Element {
    return this.theElement;
  }
  getName(): string {
    return services.texts.get('legendaryDungeonName');
  }
  getArea(): number {
    return 1;
  }
}
