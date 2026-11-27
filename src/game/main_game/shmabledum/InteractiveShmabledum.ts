import type { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import type { ShmabledumFeeling } from '@/game/main_game/shmabledum/ShmabledumFeeling';

/** The shmabledum view: plays the interactions. */
export interface InteractiveShmabledum {
  /** then: called when the animation ends */
  expressFeeling(feeling: ShmabledumFeeling, then?: Function): void;
  sayTip(tip: BubbleGumTip): void;
}
