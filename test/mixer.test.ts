import { describe, it, expect, beforeEach } from 'vitest';
import { GM, setConfig, dict, itemConfig } from './helpers';

const { MixStrategy, MixData, ItemFactory, StatType, Category } = GM;

const ITEMS = {
  potSmall: itemConfig({ FirstModifier: { Category: 'H', Value: 10 }, Duration: 5 }),
  potBig: itemConfig({ FirstModifier: { Category: 'H', Value: 20 }, Duration: 8 }),
  potLuck: itemConfig({ FirstModifier: { Category: 'L', Value: 4 } }),
  potSpecial: itemConfig({ FirstModifier: { Category: 'A', Value: 3 } }),
  sword: itemConfig({ Category: 'W', MaxMod: 25, Element: 'F', FirstModifier: { Category: 'A', Value: 20 } }),
};
const MIX_CONFIG = { primaryModifier: 1, secondaryModifier: 0.5, potionModifier: 0.8, secondModMaxPercent: 50 };

const item = (id: string) => ItemFactory.getInstance().getItem(id);
const mix = (a: string, b: string) => new MixStrategy().getMix(item(a), item(b));

beforeEach(() => {
  setConfig({ MixConfig: MIX_CONFIG });
  ItemFactory.setConfig(dict(ITEMS));
  MixStrategy.config = { 1: { item1: 'potSmall', item2: 'potLuck', itemResult: 'potSpecial', showAdvice: 'True' } };
});

describe('special recipes', () => {
  it('ingredients in any order give the recipe result', () => {
    for (const [a, b] of [
      ['potSmall', 'potLuck'],
      ['potLuck', 'potSmall'],
    ]) {
      const r = mix(a, b);
      expect(r.item.id).toBe('potSpecial');
      expect(r.recipe.getId()).toBe(1);
    }
  });

  it('strict order check and "Mix_" prefix are respected', () => {
    const recipe = MixStrategy.getRecipe(1);
    expect(recipe.areIngredients(item('potLuck'), item('potSmall'), true)).toBe(false);
    expect(MixStrategy.removeMix('Mix_potSmall')).toBe('potSmall');
    expect(recipe.mustShow).toBe(true);
    expect(MixStrategy.isSpecial(item('potSpecial'))).toBe(true);
    expect(MixStrategy.isSpecial(item('potBig'))).toBe(false);
  });

  const recipe = (r: string) => ({ item1: 'a', item2: 'b', itemResult: r, showAdvice: 'false' });

  it('recipes are found by id', () => {
    const data = new MixData({ 1: recipe('r1'), 2: recipe('r2'), 3: recipe('r3') });
    expect(data.getRecipeById(3).result).toBe('r3');
    expect(data.getRecipeById(1).mustShow).toBe(false);
  });

  it('ids with gaps or above the recipe count are found (or give null)', () => {
    const data = new MixData({ 2: recipe('r2'), 5: recipe('r5') });
    expect(data.getRecipeById(5).result).toBe('r5');
    expect(data.getRecipeById(2).result).toBe('r2');
    expect(data.getRecipeById(3)).toBe(null);
    expect(data.getRecipeById(9)).toBe(null);
  });
});

describe('regular mixes', () => {
  it('two health potions: values add up (second one weakened by potionModifier)', () => {
    const r = mix('potSmall', 'potBig');
    expect(r.recipe).toBe(null);
    const p = r.item;
    expect(p.id).toBe('Mix_potSmall');
    expect(p.getCategory().type).toBe(Category.CONSUMABLE_CATEGORY);
    expect(p.primaryModifier.getCategory()).toBe(StatType.HEALTH);
    expect(p.primaryModifier.getValue()).toBe(26); // 10*1 + floor(20*0.8)
    expect(p.secondaryModifier.getCategory()).toBe(StatType.NULL);
    expect(p.duration).toBe(8); // a pure healing potion takes the second potion's duration
  });

  it('different stats: the second item becomes the secondary modifier', () => {
    const p = mix('potBig', 'potLuck').item;
    expect(p.primaryModifier.getCategory()).toBe(StatType.HEALTH);
    expect(p.primaryModifier.getValue()).toBe(20);
    expect(p.secondaryModifier.getCategory()).toBe(StatType.LUCK);
    expect(p.secondaryModifier.getValue()).toBe(3); // floor(4 * 0.8)
  });

  it('modifiers are capped by MaxMod', () => {
    const p = mix('sword', 'sword').item;
    expect(p.getCategory().type).toBe(Category.WEAPON_CATEGORY);
    expect(p.primaryModifier.getValue()).toBe(25); // 20 + floor(20*0.5) = 30, capped at 25
    expect(p.getElement().type).toBe('F');
  });

  it('small non-zero values never round to zero', () => {
    const s = new MixStrategy();
    expect(s.getNumber(1, 0.1)).toBe(1);
    expect(s.getNumber(-1, 0.1)).toBe(-1);
    expect(s.getNumber(0, 5)).toBe(0);
  });
});
