import { bindMethods } from '@/flash/as3';
import type { InteractiveShmabledum } from '@/game/main_game/shmabledum/InteractiveShmabledum';
import type { ShmabledumInteraction } from '@/game/main_game/shmabledum/ShmabledumInteraction';

/** The shmabledum is happy or sad (the name of its animation). */
export class ShmabledumFeeling implements ShmabledumInteraction {
  private theFeeling: string;

  constructor(feeling: string) {
    this.theFeeling = feeling;
  }
  static getJoy(): ShmabledumFeeling {
    return new ShmabledumFeeling('happy');
  }
  static getSadness(): ShmabledumFeeling {
    return new ShmabledumFeeling('sad');
  }
  get feeling(): string {
    return this.theFeeling;
  }
  make(shmabledum: InteractiveShmabledum) {
    shmabledum.expressFeeling(this);
  }
}
bindMethods(ShmabledumFeeling);
