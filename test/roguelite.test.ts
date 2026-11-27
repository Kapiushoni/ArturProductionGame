import { describe, it, expect, beforeEach } from 'vitest';
import { GM, clearSaves, forgetLoadedSaves, setConfig } from './helpers';

const { Roguelite, SaveSystem } = GM;

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
    expect(first).toEqual({ reached: 4, best: 4, newRecord: true, runs: 1 });
    expect(reopen().hasPlayed()).toBe(false); // "continue" is locked: a new run starts from the first dungeon
    expect(Roguelite.leftDuringFight).toBe(false);
    const second = Roguelite.endRun(2);
    expect(second).toEqual({ reached: 2, best: 4, newRecord: false, runs: 2 });
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
});
