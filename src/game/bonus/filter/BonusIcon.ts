import { bindMethods } from '@/flash/as3';
import { services } from '@/game/services';

/** An icon of a daily bonus: library clip "assets.<prefix><type>", on frame `label`, with an optional title (see DailyBonusView). */
export class BonusIcon {
  static readonly Kill = 'Kill';
  readonly type: string;
  readonly title: string | null;
  readonly label: string;

  constructor(_lock: ConstructorLock, type: string, title: string = null, label = '1') {
    this.type = type;
    this.title = title;
    this.label = label;
  }
  static getFire(): BonusIcon {
    return new BonusIcon(new ConstructorLock(), 'Fire');
  }
  static getIce(): BonusIcon {
    return new BonusIcon(new ConstructorLock(), 'Ice');
  }
  static getNormal(): BonusIcon {
    return new BonusIcon(new ConstructorLock(), 'Normal');
  }
  static getXpIcon(): BonusIcon {
    return new BonusIcon(new ConstructorLock(), 'XpIcon', services.texts.get('dailyXp'));
  }
  static getExtraDungeon(element: string): BonusIcon {
    return new BonusIcon(new ConstructorLock(), 'Dungeon' + element);
  }
  /** up: enemies get stronger */
  static getLevelIcon(up: boolean): BonusIcon {
    return new BonusIcon(new ConstructorLock(), 'LevelIcon', services.texts.get('dailyLvl'), up ? 'up' : 'down');
  }
}
bindMethods(BonusIcon);

class ConstructorLock {}
