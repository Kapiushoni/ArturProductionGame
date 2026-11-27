import type { SaveSystem } from '@/game/persistence/SaveSystem';

/**
 * What the game logic (main_game, bonus, persistence) needs from the application. The logic never imports
 * `main` or the views: it uses these services. The application (main) sets them at start; tests set them directly.
 */

/** the sections of config.di */
export interface Config {
  get(section: string): any;
}
/** the game texts (locale.txt): get(key, [params for $1, $2 ...]) */
export interface Texts {
  get(key: string, params?: any[]): string;
}
export interface SoundEffects {
  playFx(name: string, start?: number, volume?: number): any;
}
/** the publisher's achievement system */
export interface Achievements {
  madeMix(): void;
  friendlyRockJrObtained(): void;
  finishFirstPage(): void;
  unequippedDungeonCompleted(level: any): void;
  endLastDungeon(): void;
}
/** what the tutorial has taught so far */
export interface TutorialProgress {
  isMixKnown(): boolean;
}
/** the loaded asset libraries */
export interface Assets {
  getClass(name: string): any;
  getObject(name: string): any;
}

export const services = {
  config: null as Config,
  texts: null as Texts,
  saveSystem: null as SaveSystem,
  sound: null as SoundEffects,
  achievements: null as Achievements,
  tutorial: null as TutorialProgress,
  assets: null as Assets,
};
