import { MovieClip, as3as, as3values, bindMethods } from '@/flash/as3';
import { app } from '@/game/app';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { RecipeView } from '@/game/view/screens/main_game/cookBook/RecipeView';

export class CookBookPage {
  static readonly RECIPES = 6;
  bg: MovieClip = null;
  recipes: any = null;
  constructor(list: any[]) {
    this.bg = as3as(app.swfLoader.getObject('assets.RecipesContainer'), MovieClip);
    this.initializeRecipes(list);
  }
  initializeRecipes(list: any[]) {
    let recipe = null;
    let recipeView = null;
    this.recipes = [];
    let i = 0;
    while (i < CookBookPage.RECIPES) {
      recipe = null;
      if (i < list.length) {
        recipe = MixStrategy.getRecipe(list[i]);
        recipeView = new RecipeView(this.bg['recipe' + (i + 1).toString()], recipe);
        this.recipes.push(recipeView);
      } else {
        this.bg.removeChild(this.bg['recipe' + (i + 1).toString()]);
      }
      i++;
    }
  }
  getMc() {
    return this.bg;
  }
  pop() {
    if (this.bg.parent != null) {
      this.bg.parent.removeChild(this.bg);
    }
    this.clear();
  }
  clear() {
    for (const recipe of as3values(this.recipes)) {
      recipe.clear();
    }
    this.recipes = null;
    this.bg = null;
  }
}
bindMethods(CookBookPage);
