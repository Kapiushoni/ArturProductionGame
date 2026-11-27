import { describe, it, expect, beforeEach } from 'vitest';
import { GM, dict, itemConfig } from './helpers';

const { MixChecker, MixRecipe, MixStrategy, ItemFactory, ProbabilisticSet, Slot } = GM;

const item = (id: string) => ItemFactory.getInstance().getItem(id);
const slotWith = (id: string | null) => {
  const s = new Slot();
  if (id) s.add(item(id));
  return s;
};

beforeEach(() => {
  ItemFactory.setConfig(dict({ potA: itemConfig(), potB: itemConfig(), potC: itemConfig(), rock: itemConfig() }));
  MixStrategy.config = {
    1: { item1: 'potA', item2: 'potB', itemResult: 'rock', showAdvice: 'True' },
    2: { item1: 'potA', item2: 'potC', itemResult: 'rock', showAdvice: 'False' }, // never proposed
  };
  GM.services.tutorial = { isMixKnown: () => true };
});

describe('ProbabilisticSet with equals()', () => {
  it('finds an equal (not identical) recipe', () => {
    const set = new ProbabilisticSet();
    set.add(new MixRecipe(item('potA'), item('potB'), 'rock'));
    expect(set.contains(new MixRecipe(item('potB'), item('potA'), 'rock'))).toBe(true);
    expect(set.contains(new MixRecipe(item('potA'), item('potC'), 'rock'))).toBe(false);
  });
});

describe('MixChecker (mix proposals)', () => {
  it('proposes a special recipe between a new item and the slots, only when showAdvice is on', () => {
    const checker = new MixChecker([slotWith('potA'), slotWith(null)]);
    expect(checker.checkForMixes([item('potC')])).toBe(false);
    expect(checker.checkForMixes([item('potB')])).toBe(true);
    const mix = checker.getMix();
    expect(mix.result).toBe('rock');
    expect([mix.item1.id, mix.item2.id].sort()).toEqual(['potA', 'potB']);
  });

  it('the same mix found twice is proposed once', () => {
    const checker = new MixChecker([slotWith('potA'), slotWith('potA')]);
    checker.checkForMixes([item('potB')]);
    expect((checker as any).mixables.length).toBe(1);
  });

  it('nothing is proposed before the player knows how to mix', () => {
    GM.services.tutorial = { isMixKnown: () => false };
    const checker = new MixChecker([slotWith('potA')]);
    expect(checker.checkForMixes([item('potB')])).toBe(false);
  });

  it('finds mixes among the slots themselves', () => {
    const checker = new MixChecker([slotWith('potB'), slotWith(null), slotWith('potA')]);
    expect(checker.searchForSlotsMixes([])).toBe(true);
  });
});
