import { describe, it, expect, beforeEach } from 'vitest';
import { GM, clearSaves, forgetLoadedSaves, dict, itemConfig, setConfig } from './helpers';

const { SaveSystem, ItemFactory, MixStrategy } = GM;

const noFrames = { addEventListener() {}, removeEventListener() {} };
/** a fresh SaveSystem, like after reloading the page */
const reopen = () => {
  forgetLoadedSaves();
  return new SaveSystem(noFrames);
};

beforeEach(() => {
  clearSaves();
  ItemFactory.setConfig(
    dict({
      potA: itemConfig({ FirstModifier: { Category: 'H', Value: 10 } }),
      potB: itemConfig({ FirstModifier: { Category: 'L', Value: 4 } }),
    }),
  );
});

describe('SaveSystem', () => {
  it('a new player has not played; after the first play it is remembered', () => {
    expect(reopen().hasPlayed()).toBe(false);
    reopen().onFirstPlay();
    expect(reopen().hasPlayed()).toBe(true);
  });

  it('defaults: last played dungeon "1", no experience, sound on', () => {
    const s = reopen();
    expect(s.getLastPlayed()).toBe('1');
    expect(s.getExperience()).toBe(0);
    expect(s.isSoundMuted()).toBe(false);
  });

  it('experience, mute, tutorial step survive a reload', () => {
    const s = reopen();
    s.saveExperience(1234);
    s.saveMuteState(true);
    s.onTutorialComplete(3);
    const r = reopen();
    expect(r.getExperience()).toBe(1234);
    expect(r.isSoundMuted()).toBe(true);
    expect(r.tutorialStepCompleted()).toBe(3);
  });

  it('cleared levels are stored once each', () => {
    const s = reopen();
    s.saveClearedLevel('3');
    s.saveClearedLevel('3');
    s.saveClearedLevel('7');
    expect(reopen().getClearedLevels()).toEqual(['3', '7']);
  });

  it('pending saves (items, last played, recipes) are written by savePending()', () => {
    const s = reopen();
    s.saveInventorySlot(2, ItemFactory.getInstance().getItem('potA'));
    s.saveLastPlayed('12');
    s.saveRecipe({ getId: () => 4 });
    s.saveRecipe({ getId: () => 4 });
    expect(reopen().loadInventoryItem(2)).toBe(null); // not written yet
    s.savePending();
    const r = reopen();
    expect(r.loadInventoryItem(2).id).toBe('potA');
    expect(r.loadInventoryItem(3)).toBe(null);
    expect(r.getLastPlayed()).toBe('12');
    expect(r.recipes).toEqual([4]);
  });

  it('a mixed item is saved with all its stats and restored as the same mix', () => {
    setConfig({
      MixConfig: { primaryModifier: 1, secondaryModifier: 0.5, potionModifier: 0.8, secondModMaxPercent: 50 },
    });
    MixStrategy.config = {};
    const f = ItemFactory.getInstance();
    const mixed = new MixStrategy().getMix(f.getItem('potA'), f.getItem('potB')).item;
    const s = reopen();
    s.saveMix(1, mixed);
    s.savePending();
    const back = reopen().loadMixItem(1);
    expect(back.id).toBe(mixed.id);
    expect(back.toObject()).toEqual(mixed.toObject());
  });
});
