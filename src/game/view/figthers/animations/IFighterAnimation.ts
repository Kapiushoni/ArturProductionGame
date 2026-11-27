import type { Signal } from '@/game/cb/signals/Signal';

/** An animation of a fighter view (see FighterView.animate): plays a label of the fighter clip. */
export interface IFighterAnimation {
  make(fighterView: any): void;
  pause(): void;
  resume(): void;
  kill(): void;
  /** atFinish(animation) */
  getAtFinish(): Signal;
  /** go back to idle afterwards */
  mustGoToIdle(): boolean;
  getName(): string;
  /** may interrupt the current animation */
  forceKill(): boolean;
}
