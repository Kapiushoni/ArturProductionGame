import { bindMethods } from '@/flash/as3';
import { services } from '@/game/services';

/** An icon of a daily bonus (library clip "assets.<prefix><type>", on frame `label`, with an optional title). */
export class BonusIcon {
  static readonly Kill = 'Kill';
  private type: string;
  private title: string | null;
  private label: string;

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
  addToHolder(holder: any, prefix = '') {
    const cls = services.assets.getClass('assets.' + prefix + this.type);
    const clip = new cls();
    if (this.title != null) {
      clip.title.title.text = this.title;
    }
    clip.gotoAndStop(this.label);
    holder.addChild(clip);
  }
}
bindMethods(BonusIcon);

class ConstructorLock {}
