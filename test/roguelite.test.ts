import { describe, it, expect, beforeEach } from 'vitest';
import { GM, clearSaves, forgetLoadedSaves, setConfig } from './helpers';

const { Roguelite, SaveSystem } = GM;
const C = GM.RogueliteConfig;

const noFrames = { addEventListener() {}, removeEventListener() {} };
/** a fresh SaveSystem, like after reloading the page */
const reopen = () => {
  forgetLoadedSaves();
  return new SaveSystem(noFrames);
};

beforeEach(() => {
  clearSaves();
  setConfig({
    InitialConfig: { tutorialOn: true, initialRecipes: [], initialExperience: 0, clearedLevel: 0, inventory: [] },
  });
});

describe('roguelite mod', () => {
  it('is off by default; when on, the game saves to its own file', () => {
    expect(Roguelite.enabled).toBe(false);
    expect(SaveSystem.SAVE_FILE).toBe('cbjs');
    reopen().onFirstPlay();
    Roguelite.enabled = true;
    expect(SaveSystem.SAVE_FILE).toBe(Roguelite.SAVE_FILE);
    expect(reopen().hasPlayed()).toBe(false); // the run is separate from the normal game
    reopen().saveExperience(500);
    Roguelite.enabled = false;
    expect(reopen().hasPlayed()).toBe(true);
    expect(reopen().getExperience()).toBe(0); // the normal game did not get the run's experience
  });

  it('switching forgets what was read from the other save', () => {
    const s = reopen();
    s.saveLastPlayed('7');
    s.savePending();
    expect(s.getLastPlayed()).toBe('7');
    Roguelite.enabled = true;
    s.switched();
    expect(s.getLastPlayed()).toBe('1');
  });

  it('a lost run wipes the run save and records runs and the best dungeon', () => {
    Roguelite.enabled = true;
    reopen().onFirstPlay();
    Roguelite.enterDungeon(4);
    expect(Roguelite.leftDuringFight).toBe(true);
    const first = Roguelite.endRun();
    expect(first).toMatchObject({ reached: 4, best: 4, newRecord: true, runs: 1, bones: 0 });
    expect(reopen().hasPlayed()).toBe(false); // "continue" is locked: a new run starts from the first dungeon
    expect(Roguelite.leftDuringFight).toBe(false);
    const second = Roguelite.endRun(2);
    expect(second).toMatchObject({ reached: 2, best: 4, newRecord: false, runs: 2 });
  });

  it('a dungeon left alive is not a lost run', () => {
    Roguelite.enabled = true;
    Roguelite.enterDungeon(3);
    Roguelite.leaveDungeon();
    expect(Roguelite.leftDuringFight).toBe(false);
  });

  it('the tutorial is played in the first run only', () => {
    Roguelite.enabled = true;
    const s = reopen();
    s.reset();
    expect(reopen().tutorialStepCompleted()).toBe(0);
    s.onTutorialComplete(SaveSystem.TUTORIAL_DONE);
    expect(Roguelite.tutorialDone).toBe(true);
    Roguelite.endRun(1);
    reopen().reset();
    expect(reopen().tutorialStepCompleted()).toBe(SaveSystem.TUTORIAL_DONE);
  });

  it('the normal game keeps its tutorial', () => {
    Roguelite.enabled = true;
    reopen().onTutorialComplete(SaveSystem.TUTORIAL_DONE);
    Roguelite.enabled = false;
    reopen().reset();
    expect(reopen().tutorialStepCompleted()).toBe(0);
  });

  it('bones: earned with the greed upgrade, kept after a lost run', () => {
    Roguelite.enabled = true;
    Roguelite.startRun();
    expect(Roguelite.earn(10)).toBe(10);
    expect(Roguelite.bones).toBe(10);
    const result = Roguelite.endRun(3);
    expect(result.bones).toBe(10);
    expect(result.totalBones).toBe(10);
    expect(Roguelite.bones).toBe(10); // the currency stays
    expect(Roguelite.bonesForEnemy(8, true, false)).toBe(C.bonesPerEnemy + 2 + C.bonesElemental);
    expect(Roguelite.bonesForEnemy(1, false, true)).toBe(C.bonesBoss);
  });

  it('the shop: levels, prices, not enough bones, max level, unlocks', () => {
    expect(Roguelite.buy('greed')).toBe(false); // no bones
    Roguelite.earn(1000);
    expect(Roguelite.buy('greed')).toBe(true);
    expect(Roguelite.level('greed')).toBe(1);
    expect(Roguelite.bones).toBe(1000 - C.upgrades.greed.prices[0]);
    expect(Roguelite.earn(10)).toBe(12); // +20%
    while (Roguelite.price('greed') != null) Roguelite.buy('greed');
    expect(Roguelite.buy('greed')).toBe(false);
    expect(Roguelite.level('greed')).toBe(Roguelite.maxLevel('greed'));
    expect(Roguelite.isLocked('SwordMedium')).toBe(true);
    expect(Roguelite.buy('rareGear')).toBe(true);
    expect(Roguelite.isLocked('SwordMedium')).toBe(false);
    expect(Roguelite.buy('rareGear')).toBe(false); // already bought
  });

  it('upgrades of the jinn and the start items', () => {
    Roguelite.earn(1000);
    Roguelite.buy('tough');
    Roguelite.buy('eye');
    Roguelite.buy('armor');
    Roguelite.buy('stock');
    expect(Roguelite.jinnRow({ BaseHP: 50, BaseLuck: 5, BaseDefense: 2, BaseAttack: 5 })).toEqual({
      BaseHP: 55,
      BaseLuck: 5 + C.upgrades.eye.luck,
      BaseDefense: 2 + C.upgrades.armor.defense,
      BaseAttack: 5,
    });
    expect(Roguelite.startItems()).toEqual(C.upgrades.stock.items[0]);
  });

  it('hardcore: stronger enemies further on, rarer potions, locked items do not drop', () => {
    Roguelite.enterDungeon(1);
    expect(Roguelite.enemyExtraLevel()).toBe(C.enemyLevelBase);
    Roguelite.enterDungeon(25);
    expect(Roguelite.enemyExtraLevel()).toBe(C.enemyLevelBase + 4);
    expect(Roguelite.lootWeight('HPPotionSmall', 10, 'C')).toBe(10 * C.potionDropFactor);
    expect(Roguelite.lootWeight('SwordStarter', 10, 'W')).toBe(10);
    expect(Roguelite.lootWeight('SwordHeavy', 10, 'W')).toBe(0);
    expect(Roguelite.lootWeight(null, 10, null)).toBe(10);
  });

  it('a new run forgets the health of the last one', () => {
    Roguelite.health = 12;
    Roguelite.startRun();
    expect(Roguelite.health).toBe(null);
  });
});
