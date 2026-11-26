// @ts-nocheck
import { as3keys, as3values, bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Category } from '@/game/main_game/items/Category';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { NullModifier } from '@/game/main_game/items/modifiers/NullModifier';
import { MixData } from '@/game/main_game/mixer/MixData';
import { MixResult } from '@/game/main_game/mixer/MixResult';

export class MixStrategy {
  static recipes = null;
  constructor() {
         
      }
  static set config(value) {
         MixStrategy.recipes = new MixData(value);
      }
  static get mixConfig() {
         return main.config.get("MixConfig");
      }
  static isSpecial(item) {
         var recipe = null;
         for (recipe of as3values(MixStrategy.recipes.getRecipes()))
         {
            if(recipe.isResult(item))
            {
               return true;
            }
         }
         return false;
      }
  static getSpecialMixId(item, item2, flag = false) {
         var recipe = null;
         for (recipe of as3values(MixStrategy.recipes.getRecipes()))
         {
            if(recipe.areIngredients(item,item2,flag))
            {
               return recipe;
            }
         }
         return null;
      }
  static getRecipe(num) { num = int(num);
         return MixStrategy.recipes.getRecipeById(num);
      }
  static removeMix(text) {
         if(text.search("Mix_") == 0)
         {
            return text.substring(4);
         }
         return text;
      }
  getMix(item, item2) {
         var item3 = null;
         var flag = false;
         var configOfItem = null;
         var text = null;
         var obj = null;
         var key = null;
         var instance = ItemFactory.getInstance();
         var specialMixId = MixStrategy.getSpecialMixId(item,item2);
         if(specialMixId != null)
         {
            flag = false;
            if(item.getCategory().type == Category.SHIELD_CATEGORY || item.getCategory().type == Category.WEAPON_CATEGORY)
            {
               configOfItem = instance.getConfigOfItem(specialMixId.result);
               text = "Mix_" + MixStrategy.removeMix(specialMixId.result);
               obj = new Object();
               for (key of as3keys(configOfItem))
               {
                  obj[key] = configOfItem[key];
               }
               obj.FirstModifier = item.getPrimaryModifier().toObject();
               obj.FirstModifier.Value = Math.max(obj.FirstModifier.Value,configOfItem.FirstModifier.Value);
               if(item.getSecondaryModifier().getCategory() != StatType.NULL)
               {
                  obj.SecondModifier = item.getSecondaryModifier().toObject();
                  flag = true;
               }
               this.applyLimitToModifiers(obj);
               if(obj.FirstModifier.Value != configOfItem.FirstModifier.Value)
               {
                  flag = true;
               }
            }
            if(!flag)
            {
               item3 = instance.getItem(specialMixId.result);
            }
            else
            {
               item3 = instance.getCustomItem(text,obj);
            }
            return new MixResult(item3,specialMixId);
         }
         return new MixResult(this.makeMix(item,item2));
      }
  getSpecialConfigForWeapons(item, recipe2) {
         var prop = null;
         var primary = item;
         var recipe = recipe2;
         var equalOrNull = function(obj, modifier)
         {
            return StatType.parse(obj.Category) == StatType.NULL || StatType.parse(obj.Category) == modifier.getCategory();
         };
         var factory = ItemFactory.getInstance();
         var initialConfig = factory.getConfigOfItem(recipe.result);
         var finalConfig = new Object();
         for (prop of as3keys(initialConfig))
         {
            finalConfig[prop] = initialConfig[prop];
         }
         if(equalOrNull(finalConfig.FirstModifier,primary.getPrimaryModifier()))
         {
            finalConfig.FirstModifier = primary.getPrimaryModifier().toObject();
            finalConfig.FirstModifier.Value = Math.max(finalConfig.FirstModifier.Value,initialConfig.FirstModifier.Value);
         }
         if(equalOrNull(finalConfig.SecondModifier,primary.getSecondaryModifier()))
         {
            finalConfig.SecondModifier = primary.getSecondaryModifier().toObject();
            finalConfig.SecondModifier.Value = Math.max(finalConfig.SecondModifier.Value,initialConfig.SecondModifier.Value);
         }
         this.applyLimitToModifiers(finalConfig);
         if(finalConfig.FirstModifier.Value != initialConfig.FirstModifier.Value || finalConfig.SecondModifier.Value != initialConfig.SecondModifier.Value)
         {
            return finalConfig;
         }
         return null;
      }
  makeMix(item, item2) {
         var text = "Mix_" + MixStrategy.removeMix(item.getID());
         var obj = new Object();
         obj.NameString = item.name;
         obj.Category = item.getCategory().type;
         var primaryModifier = item.getPrimaryModifier();
         var secondaryModifier = item.getSecondaryModifier();
         var primaryModifier2 = item2.getPrimaryModifier();
         var secondaryModifier2 = item2.getSecondaryModifier();
         var flag = this.isConsumable(item);
         obj.MovieClip = item.getMcName();
         if(primaryModifier.getCategory() == StatType.HEALTH && secondaryModifier.getCategory() == StatType.NULL)
         {
            obj.Duration = item2.getDuration();
         }
         else
         {
            obj.Duration = item.getDuration();
         }
         obj.MaxMod = item.getMaxMod();
         var num = Number(Number(MixStrategy.mixConfig.primaryModifier));
         var potionModifier = Number(Number(MixStrategy.mixConfig.secondaryModifier));
         if(this.isConsumable(item) && this.isConsumable(item2))
         {
            potionModifier = Number(Number(MixStrategy.mixConfig.potionModifier));
         }
         if(this.sameCategory(primaryModifier,primaryModifier2))
         {
            obj.FirstModifier = this.combine(primaryModifier,primaryModifier2,num,potionModifier,flag);
            obj.SecondModifier = this.combine(secondaryModifier,secondaryModifier2,num,potionModifier,flag);
         }
         else
         {
            obj.FirstModifier = this.combine(primaryModifier,new NullModifier(),num,num,flag);
            obj.SecondModifier = this.combine(primaryModifier2,secondaryModifier,potionModifier,num,flag);
         }
         this.applyLimitToModifiers(obj);
         obj.Element = item.getElement().type;
         obj.MixTime = item.getMixTime();
         return ItemFactory.getInstance().getCustomItem(text,obj);
      }
  applyLimitToModifiers(obj) {
         var num = Number(Number(MixStrategy.mixConfig.secondModMaxPercent));
         var num2 = Number(Number(obj.MaxMod));
         num = Number(Math.round(num2 * num / 100));
         obj.FirstModifier.Value = Math.max(-num2,Math.min(num2,obj.FirstModifier.Value));
         if(obj.SecondModifier.Value != null)
         {
            obj.SecondModifier.Value = Math.max(-num,Math.min(num,obj.SecondModifier.Value));
         }
      }
  combine(modifier, modifier2, num = 1, num2 = 1, flag = false) { num = Number(num); num2 = Number(num2);
         var obj = new Object();
         if(modifier.getCategory() == StatType.NULL)
         {
            if(modifier2.getCategory() == StatType.NULL)
            {
               obj.Category = null;
               obj.Value = null;
            }
            else
            {
               obj.Category = modifier2.getCategory();
               obj.Value = this.getNumber(modifier2.getValue(),num2);
            }
         }
         else if(modifier2.getCategory() != StatType.NULL && this.sameCategory(modifier,modifier2))
         {
            obj.Category = modifier.getCategory();
            obj.Value = this.getNumber(modifier.getValue(),num) + this.getNumber(modifier2.getValue(),num2);
         }
         else
         {
            obj.Category = modifier.getCategory();
            obj.Value = this.getNumber(modifier.getValue(),num);
         }
         if(obj.Category == StatType.MAX_HP || obj.Category == StatType.HEALTH)
         {
            if(flag)
            {
               obj.Category = StatType.HEALTH;
            }
            else
            {
               obj.Category = StatType.MAX_HP;
            }
         }
         if(obj.Category != null)
         {
            obj.Category = StatType.toString(obj.Category);
         }
         return obj;
      }
  getNumber(num, num2) { num = Number(num); num2 = Number(num2);
         var num3 = Number(Math.floor(num * num2));
         if(num < 0)
         {
            return Number(Math.min(-1,num3));
         }
         if(num > 0)
         {
            return Number(Math.max(1,num3));
         }
         return Number(num3);
      }
  isConsumable(item) {
         return item.getCategory().type == Category.CONSUMABLE_CATEGORY;
      }
  sameCategory(modifier, modifier2) {
         return modifier.getCategory() == modifier2.getCategory() || this.modifiesHealth(modifier) && this.modifiesHealth(modifier2);
      }
  modifiesHealth(modifier) {
         return modifier.getCategory() == StatType.MAX_HP || modifier.getCategory() == StatType.HEALTH;
      }
  healthCategory(flag) {
         if(flag)
         {
            return int(StatType.HEALTH);
         }
         return int(StatType.MAX_HP);
      }
}
bindMethods(MixStrategy);
