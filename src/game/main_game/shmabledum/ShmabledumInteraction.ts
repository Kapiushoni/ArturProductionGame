import type { InteractiveShmabledum } from '@/game/main_game/shmabledum/InteractiveShmabledum';

/** Something the shmabledum does: a feeling, a tip, or a feeling followed by a tip. */
export interface ShmabledumInteraction {
  make(shmabledum: InteractiveShmabledum): void;
}
