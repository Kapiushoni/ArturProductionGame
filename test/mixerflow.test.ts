import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GM, setConfig, dict, itemConfig } from './helpers';

const { Mixer, MixStrategy, ItemFactory } = GM;

const item = (id: string) => ItemFactory.getInstance().getItem(id);

beforeEach(() => {
  setConfig({
    MixConfig: { primaryModifier: 1, secondaryModifier: 0.5, potionModifier: 0.8, secondModMaxPercent: 50 },
  });
  ItemFactory.setConfig(
    dict({
      potA: itemConfig({ FirstModifier: { Category: 'H', Value: 10 } }),
      potB: itemConfig({ FirstModifier: { Category: 'L', Value: 4 } }),
      rock: itemConfig({ FirstModifier: { Category: 'D', Value: 1 } }),
    }),
  );
  MixStrategy.config = { 1: { item1: 'potA', item2: 'potB', itemResult: 'rock', showAdvice: 'True' } };
  GM.services.saveSystem = {
    loadMixItem: () => null,
    saveMix: vi.fn(),
    savePendingItems: vi.fn(),
    saveRecipe: vi.fn(),
  };
  GM.services.sound = { playFx: vi.fn() };
  GM.services.achievements = { madeMix: vi.fn(), friendlyRockJrObtained: vi.fn() };
});

describe('Mixer', () => {
  it('needs both ingredients and a free result slot', () => {
    const m = new Mixer();
    expect(m.canMix()).toBe(false);
    m.slot_1.add(item('potA'));
    expect(m.canMix()).toBe(false);
    m.slot_2.add(item('potB'));
    expect(m.canMix()).toBe(true);
    m.slot_3.add(item('rock'));
    expect(m.canMix()).toBe(false);
  });

  it('while mixing the slots are locked and no second mix can start', () => {
    const m = new Mixer();
    const started = vi.fn();
    m.onMixStart.add(started);
    m.slot_1.add(item('potA'));
    m.slot_2.add(item('potB'));
    m.startMix();
    expect(started).toHaveBeenCalledTimes(1);
    expect(m.slot_1.isLocked()).toBe(true);
    expect(m.canMix()).toBe(false);
    m.clear();
  });

  it('at the end: the ingredients become the result, the recipe is remembered, everything is saved', () => {
    const m = new Mixer();
    const ended = vi.fn();
    m.onMixEnd.add(ended);
    m.slot_1.add(item('potA'));
    m.slot_2.add(item('potB'));
    m.startMix();
    m.endMix(); // what the mixer clock calls when the time is up
    expect(m.slot_1.isEmpty() && m.slot_2.isEmpty()).toBe(true);
    expect(m.getSlot(3).getContent().id).toBe('rock');
    expect(m.slot_1.isLocked()).toBe(false);
    expect(ended.mock.calls[0][0].recipe.getId()).toBe(1);
    expect(GM.services.saveSystem.saveRecipe).toHaveBeenCalled();
    expect(GM.services.saveSystem.saveMix).toHaveBeenCalledWith(3, expect.anything());
    expect(GM.services.achievements.madeMix).toHaveBeenCalled();
    expect(m.canMix()).toBe(false); // the result slot is full
  });
});
