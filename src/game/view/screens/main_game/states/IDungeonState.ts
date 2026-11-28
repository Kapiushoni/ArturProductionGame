import type { Signal } from '@/game/cb/signals/Signal';

/** The dungeon state of the game screen, as seen by the dungeon views. */
export interface IDungeonState {
  enter(): void;
  leave(): void;
  get pauseHolder(): any;
  getDungeon(): any;
  setNextDungeon(level: any): void;
  get onToDungeon(): Signal;
  get onToMap(): Signal;
  /** the roguelite run is over: a new one */
  get onNewRun(): Signal;
  clear(): void;
}
