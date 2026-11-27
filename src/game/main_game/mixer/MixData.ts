import { as3keys, bindMethods, int } from '@/flash/as3';
import { Recipe } from '@/game/main_game/mixer/Recipe';

/** All special recipes, from mix.csv: id -> { item1, item2, itemResult, showAdvice }. */
export class MixData {
  private recipes: Recipe[];

  constructor(config: any) {
    this.recipes = [];
    for (const key of as3keys(config)) {
      const row = config[key];
      this.recipes.push(
        new Recipe(int(key), row.item1, row.item2, row.itemResult, row.showAdvice.toLowerCase() == 'true'),
      );
    }
  }
  getRecipes(): Recipe[] {
    return this.recipes;
  }
  /** the recipe with this id, or null */
  getRecipeById(id: number): Recipe | null {
    id = int(id);
    // usually ids are 1..N in order: try position id-1 first
    const guess = this.recipes[id - 1];
    if (guess && guess.getId() == id) {
      return guess;
    }
    return this.recipes.find((recipe) => recipe.getId() == id) ?? null;
  }
}
bindMethods(MixData);
