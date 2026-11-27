import type { Signal } from '@/game/cb/signals/Signal';

/** Loads resources on demand (see PostLoader). */
export interface DynamicLoader {
  isLoaded(resource: string): boolean;
  get onLoad(): Signal;
}
