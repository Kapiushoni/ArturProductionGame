import type { Signal } from '@/game/cb/signals/Signal';

/** A fight against one enemy (Fight, BossFight). */
export interface IFight {
  getEnemy(): any;
  leave(callback: Function): void;
  fight(): void;
  start(): void;
  suddenDeath(): void;
  deactivate(): void;
  clear(): void;
  readonly first: boolean;
  get onEnter(): Signal;
  get onExit(): Signal;
  get onHit(): Signal;
  get onLose(): Signal;
  get onWin(): Signal;
}
