// @ts-nocheck
import { MovieClip, as3as, as3values, bindMethods, int, uint } from '@/flash/as3';
import { main } from '@/game/main';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { RecipeView } from '@/game/view/screens/main_game/cookBook/RecipeView';

export class CookBookPage {
  static readonly RECIPES = uint(6);
  declare bg: any;
  declare recipes: any;
  constructor(list) {
         
         this.bg = as3as(main.swfLoader.getObject("assets.RecipesContainer"), MovieClip);
         this.initializeRecipes(list);
      }
  initializeRecipes(list) {
         var recipe = null;
         var recipeView = null;
         this.recipes = [];
         var i = int(0);
         while(i < CookBookPage.RECIPES)
         {
            recipe = null;
            if(i < list.length)
            {
               recipe = MixStrategy.getRecipe(list[i]);
               recipeView = new RecipeView(this.bg["recipe" + (i + 1).toString()],recipe);
               this.recipes.push(recipeView);
            }
            else
            {
               this.bg.removeChild(this.bg["recipe" + (i + 1).toString()]);
            }
            i++;
         }
      }
  getMc() {
         return this.bg;
      }
  pop() {
         if(this.bg.parent != null)
         {
            this.bg.parent.removeChild(this.bg);
         }
         this.clear();
      }
  clear() {
         var recipe = null;
         for (recipe of as3values(this.recipes))
         {
            recipe.clear();
         }
         this.recipes = null;
         this.bg = null;
      }
}
CookBookPage.prototype.bg = null;
CookBookPage.prototype.recipes = null;
bindMethods(CookBookPage);
