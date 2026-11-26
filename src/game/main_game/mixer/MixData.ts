// @ts-nocheck
import { as3keys, bindMethods, int } from '@/flash/as3';
import { Recipe } from '@/game/main_game/mixer/Recipe';

export class MixData {
  declare recipes: any;
  constructor(obj) {
         var key = null;
         var obj2 = null;
         
         this.recipes = [];
         for (key of as3keys(obj))
         {
            obj2 = obj[key];
            this.recipes.push(new Recipe(int(key),obj2.item1,obj2.item2,obj2.itemResult,obj2.showAdvice.toLowerCase() == "true"));
         }
      }
  getRecipes() {
         return this.recipes;
      }
  getRecipeById(num) { num = int(num);
         var recipe = this.recipes[Math.max(num - 1,0)];
         var i = int(0);
         while(i < this.recipes.length && recipe.getId() != num)
         {
            recipe = this.recipes[i];
            i++;
         }
         if(recipe.getId() == num)
         {
            return recipe;
         }
         return null;
      }
}
MixData.prototype.recipes = null;
bindMethods(MixData);
