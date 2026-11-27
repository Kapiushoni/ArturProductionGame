import { as3values, bindMethods, int } from '@/flash/as3';
import { services } from '@/game/services';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Element } from '@/game/main_game/element/Element';
import { Category } from '@/game/main_game/items/Category';
import { Consumable } from '@/game/main_game/items/Consumable';
import { Equipment } from '@/game/main_game/items/Equipment';
import { HealthModifier } from '@/game/main_game/items/modifiers/HealthModifier';
import { MaxHealthModifier } from '@/game/main_game/items/modifiers/MaxHealthModifier';
import { Modifier } from '@/game/main_game/items/modifiers/Modifier';
import { NullModifier } from '@/game/main_game/items/modifiers/NullModifier';
import { Shield } from '@/game/main_game/items/Shield';
import { Weapon } from '@/game/main_game/items/Weapon';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';

/**
 * An item, built from its row in items.csv:
 * { NameString, MovieClip, MixTime, MaxMod, Duration, Element, Category, FirstModifier, SecondModifier }.
 */
export class Item {
  id: string;
  /** locale keys separated by ";" */
  name: string;
  protected mc_name: string;
  maxMod: number;
  protected mix_time: number;
  primaryModifier: IModifier;
  secondaryModifier: IModifier;
  protected element: Element;
  protected category: Category;
  duration: number;

  constructor(id: string, config: any) {
    this.id = id;
    this.name = config.NameString;
    this.mc_name = config.MovieClip;
    this.mix_time = Number(config.MixTime);
    this.maxMod = int(config.MaxMod);
    this.duration = int(config.Duration);
    this.primaryModifier = this.createModifier(config.FirstModifier);
    this.secondaryModifier = this.createModifier(config.SecondModifier);
    this.element = Element.parseElement(config.Element);
    switch (config.Category) {
      case Category.EQUIPABLE_CATEGORY:
        this.category = new Equipment(this, config);
        break;
      case Category.CONSUMABLE_CATEGORY:
        this.category = new Consumable(this, config);
        break;
      case Category.WEAPON_CATEGORY:
        this.category = new Weapon(this, config);
        break;
      case Category.SHIELD_CATEGORY:
        this.category = new Shield(this, config);
        break;
      default:
        throw new Error('Unknown type');
    }
  }
  getMcName(): string {
    return this.mc_name;
  }
  createModifier(config: { Category: string; Value: any }): IModifier {
    const type = int(StatType.parse(config.Category));
    if (type == StatType.MAX_HP) {
      return new MaxHealthModifier(config);
    }
    if (type == StatType.HEALTH) {
      return new HealthModifier(config);
    }
    if (StatType.getStatTypes().indexOf(type) >= 0) {
      return new Modifier(config);
    }
    return new NullModifier();
  }
  getNameToShow(): string {
    let text = '';
    for (const key of as3values(this.name.split(';'))) {
      if (text != '') {
        text += ' ';
      }
      text += services.texts.get(key);
    }
    return text;
  }
  canBeContained(itemContainer: any): boolean {
    return this.category.canBeContained(itemContainer);
  }
  clear() {
    this.getCategory().clear();
    this.element.clear();
    this.primaryModifier.clear();
    this.secondaryModifier.clear();
  }
  getCategory(): any {
    return this.category;
  }
  getMixTime(): number {
    return this.mix_time;
  }
  getElement(): Element {
    return this.element;
  }
  /** what is saved: regular items are saved by id */
  toObject(): any {
    return { id: this.id };
  }
}
bindMethods(Item);
