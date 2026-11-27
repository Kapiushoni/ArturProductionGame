import { SharedUtils } from '@/game/persistence/SharedUtils';

/**
 * The roguelite mod (switched on in the main menu): one life per run, its own save, and what is kept between runs.
 *
 * - While it is on, the game saves to Roguelite.SAVE_FILE instead of the normal save, so the two never mix.
 * - Losing a fight ends the run: the run save is wiped and the next "new game" starts from the first dungeon.
 * - Leaving a fight is not a way out: the run is marked "in a dungeon" while fighting, and a run that is
 *   still marked when the game starts (the tab was closed mid-fight) is lost.
 * - Kept between runs (META): the number of runs, the best dungeon reached, and whether the tutorial was done.
 */
const META = 'cbjs_rl_meta';
const read = (key: string, value: any = null): any => SharedUtils.load(META, key) ?? value;
const write = (key: string, value: any) => SharedUtils.save(META, key, value);

/** what a run ended with (for the "run over" window) */
export interface RunResult {
  /** the dungeon reached on the way to the boss (1..25) */
  reached: number;
  best: number;
  newRecord: boolean;
  /** runs finished so far, this one included */
  runs: number;
}

export const Roguelite = {
  SAVE_FILE: 'cbjs_rl',

  /** the mod is on (switched in the main menu, kept between sessions) */
  get enabled(): boolean {
    return read('on', false) === true;
  },
  set enabled(on: boolean) {
    write('on', on);
  },
  get runs(): number {
    return read('runs', 0);
  },
  get best(): number {
    return read('best', 0);
  },
  /** the tutorial is played in the first run only */
  get tutorialDone(): boolean {
    return read('tutorial', false) === true;
  },
  tutorialCompleted() {
    write('tutorial', true);
  },
  /** a fight starts in this dungeon: until it is won, closing the game loses the run */
  enterDungeon(reached: number) {
    write('inDungeon', true);
    write('at', reached);
  },
  leaveDungeon() {
    write('inDungeon', false);
  },
  /** the game was closed during a fight */
  get leftDuringFight(): boolean {
    return read('inDungeon', false) === true;
  },
  /** the run is over (lost): wipes the run save and records the result */
  endRun(reached: number = read('at', 1)): RunResult {
    const best = Math.max(this.best, reached);
    const result: RunResult = { reached, best, newRecord: reached > this.best, runs: this.runs + 1 };
    write('runs', result.runs);
    write('best', best);
    write('inDungeon', false);
    SharedUtils.clear(Roguelite.SAVE_FILE);
    return result;
  },
};
