import { as3keys, as3values, int } from '@/flash/as3';
import { services } from '@/game/services';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Category } from '@/game/main_game/items/Category';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { NullModifier } from '@/game/main_game/items/modifiers/NullModifier';
import { MixData } from '@/game/main_game/mixer/MixData';
import { removeMix } from '@/game/main_game/mixer/mixId';
import { MixResult } from '@/game/main_game/mixer/MixResult';
import type { Item } from '@/game/main_game/items/Item';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';
import type { Recipe } from '@/game/main_game/mixer/Recipe';

type ModifierConfig = { Category: any; Value: any };

/**
 * What mixing two items gives.
 * - a special recipe (mix.csv) gives its result item;
 * - otherwise a "Mix_<first item>" whose modifiers combine both items, weighted by MixConfig
 *   (config.di: primaryModifier, secondaryModifier, potionModifier, secondModMaxPercent).
 */
export class MixStrategy {
  static recipes: MixData = null;

  static set config(value: any) {
    MixStrategy.recipes = new MixData(value);
  }
  static get mixConfig(): any {
    return services.config.get('MixConfig');
  }
  /** is the item the result of a special recipe? */
  static isSpecial(item: Item): boolean {
    for (const recipe of as3values(MixStrategy.recipes.recipes)) {
      if (recipe.isResult(item)) {
        return true;
      }
    }
    return false;
  }
  static getSpecialMixId(item: Item, item2: Item, strictOrder = false): Recipe | null {
    for (const recipe of as3values(MixStrategy.recipes.recipes)) {
      if (recipe.areIngredients(item, item2, strictOrder)) {
        return recipe;
      }
    }
    return null;
  }
  static getRecipe(id: number): Recipe | null {
    return MixStrategy.recipes.getRecipeById(int(id));
  }
  /** "Mix_sword" -> "sword" */
  static removeMix(id: string): string {
    return removeMix(id);
  }

  getMix(item: Item, item2: Item): MixResult {
    const factory = ItemFactory.getInstance();
    const recipe = MixStrategy.getSpecialMixId(item, item2);
    if (recipe == null) {
      return new MixResult(this.makeMix(item, item2));
    }
    // a weapon or shield keeps its modifiers when they are better than the recipe result's
    let custom = false;
    let id: string = null;
    let config: any = null;
    const type = item.getCategory().type;
    if (type == Category.SHIELD_CATEGORY || type == Category.WEAPON_CATEGORY) {
      const resultConfig = factory.getConfigOfItem(recipe.result);
      id = 'Mix_' + MixStrategy.removeMix(recipe.result);
      config = {};
      for (const key of as3keys(resultConfig)) {
        config[key] = resultConfig[key];
      }
      config.FirstModifier = item.primaryModifier.toObject();
      config.FirstModifier.Value = Math.max(config.FirstModifier.Value, resultConfig.FirstModifier.Value);
      if (item.secondaryModifier.getCategory() != StatType.NULL) {
        config.SecondModifier = item.secondaryModifier.toObject();
        custom = true;
      }
      this.applyLimitToModifiers(config);
      if (config.FirstModifier.Value != resultConfig.FirstModifier.Value) {
        custom = true;
      }
    }
    const result = custom ? factory.getCustomItem(id, config) : factory.getItem(recipe.result);
    return new MixResult(result, recipe);
  }

  makeMix(item: Item, item2: Item): Item {
    const config: any = {};
    config.NameString = item.name;
    config.Category = item.getCategory().type;
    const primary = item.primaryModifier;
    const secondary = item.secondaryModifier;
    const primary2 = item2.primaryModifier;
    const secondary2 = item2.secondaryModifier;
    const potion = this.isConsumable(item);
    config.MovieClip = item.getMcName();
    // a pure healing potion lasts as long as the second item
    if (primary.getCategory() == StatType.HEALTH && secondary.getCategory() == StatType.NULL) {
      config.Duration = item2.duration;
    } else {
      config.Duration = item.duration;
    }
    config.MaxMod = item.maxMod;
    const primaryWeight = Number(MixStrategy.mixConfig.primaryModifier);
    let secondaryWeight = Number(MixStrategy.mixConfig.secondaryModifier);
    if (this.isConsumable(item) && this.isConsumable(item2)) {
      secondaryWeight = Number(MixStrategy.mixConfig.potionModifier);
    }
    if (this.sameCategory(primary, primary2)) {
      config.FirstModifier = this.combine(primary, primary2, primaryWeight, secondaryWeight, potion);
      config.SecondModifier = this.combine(secondary, secondary2, primaryWeight, secondaryWeight, potion);
    } else {
      // different main stats: the second item's main stat becomes the secondary modifier
      config.FirstModifier = this.combine(primary, new NullModifier(), primaryWeight, primaryWeight, potion);
      config.SecondModifier = this.combine(primary2, secondary, secondaryWeight, primaryWeight, potion);
    }
    this.applyLimitToModifiers(config);
    config.Element = item.getElement().type;
    config.MixTime = item.getMixTime();
    return ItemFactory.getInstance().getCustomItem('Mix_' + MixStrategy.removeMix(item.id), config);
  }

  /** the first modifier stays within +-MaxMod, the second within +-secondModMaxPercent of MaxMod */
  applyLimitToModifiers(config: { MaxMod: any; FirstModifier: ModifierConfig; SecondModifier: ModifierConfig }) {
    const maxMod = Number(config.MaxMod);
    const maxSecond = Math.round((maxMod * Number(MixStrategy.mixConfig.secondModMaxPercent)) / 100);
    config.FirstModifier.Value = Math.max(-maxMod, Math.min(maxMod, config.FirstModifier.Value));
    if (config.SecondModifier.Value != null) {
      config.SecondModifier.Value = Math.max(-maxSecond, Math.min(maxSecond, config.SecondModifier.Value));
    }
  }

  /** weighted sum of two modifiers as a config object; health becomes H for potions and MH for gear */
  combine(modifier: IModifier, modifier2: IModifier, weight = 1, weight2 = 1, potion = false): ModifierConfig {
    weight = Number(weight);
    weight2 = Number(weight2);
    const result: ModifierConfig = { Category: null, Value: null };
    if (modifier.getCategory() == StatType.NULL) {
      if (modifier2.getCategory() != StatType.NULL) {
        result.Category = modifier2.getCategory();
        result.Value = this.getNumber(modifier2.getValue(), weight2);
      }
    } else if (modifier2.getCategory() != StatType.NULL && this.sameCategory(modifier, modifier2)) {
      result.Category = modifier.getCategory();
      result.Value = this.getNumber(modifier.getValue(), weight) + this.getNumber(modifier2.getValue(), weight2);
    } else {
      result.Category = modifier.getCategory();
      result.Value = this.getNumber(modifier.getValue(), weight);
    }
    if (result.Category == StatType.MAX_HP || result.Category == StatType.HEALTH) {
      result.Category = potion ? StatType.HEALTH : StatType.MAX_HP;
    }
    if (result.Category != null) {
      result.Category = StatType.toString(result.Category);
    }
    return result;
  }

  /** value * weight rounded down, but a non-zero value never becomes 0 */
  getNumber(value: number, weight: number): number {
    value = Number(value);
    const scaled = Math.floor(value * Number(weight));
    if (value < 0) {
      return Math.min(-1, scaled);
    }
    if (value > 0) {
      return Math.max(1, scaled);
    }
    return scaled;
  }
  isConsumable(item: Item): boolean {
    return item.getCategory().type == Category.CONSUMABLE_CATEGORY;
  }
  sameCategory(modifier: IModifier, modifier2: IModifier): boolean {
    return (
      modifier.getCategory() == modifier2.getCategory() ||
      (this.modifiesHealth(modifier) && this.modifiesHealth(modifier2))
    );
  }
  modifiesHealth(modifier: IModifier): boolean {
    return modifier.getCategory() == StatType.MAX_HP || modifier.getCategory() == StatType.HEALTH;
  }
}
