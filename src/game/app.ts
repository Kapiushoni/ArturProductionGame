import { DailyBonus } from '@/game/bonus/DailyBonus';
import { services } from '@/game/services';
import type { AchievementDispatcher } from '@/game/AchievementDispatcher';
import type { DiFile } from '@/game/bonus/DiFile';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';
import type { Locale } from '@/game/cb/data/Locale';
import type { SwfLibrary } from '@/game/cb/display/SwfLibrary';
import type { DragDispatcher } from '@/game/drag_and_drop/DragDispatcher';
import type { PostLoader } from '@/game/loader/PostLoader';
import type { Game } from '@/game/main_game/Game';
import type { SaveSystem } from '@/game/persistence/SaveSystem';
import type { SoundManager } from '@/game/sound/SoundManager';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/**
 * What the screens, the tutorial and the sound share: the application (main) fills it in at start.
 * It only imports types (and the daily bonus logic), so no module depends on main or on the screens
 * through it: this is what keeps the modules free of import cycles. The services shared with the game
 * logic (texts, config, save, sound, ...) live in services.ts and are reached here through accessors.
 */
export const app = {
  /** asset libraries */
  swfLoader: null as SwfLibrary,
  /** the game model, while in the game */
  game: null as Game,
  drag: null as DragDispatcher,
  /** today's bonus, or null */
  activeBonus: null as IDailyBonus,
  /** loads the rest of the sounds in the background */
  postLoader: null as PostLoader,
  /** display layers, bottom to top */
  gameHolder: null as any,
  tutorialHolder: null as any,
  popUpHolder: null as any,
  transitionHolder: null as any,
  /** a transition screen until the resources are loaded, then callback (set by main) */
  waitForResources: null as (resources: string[], callback: Function, callback2?: Function) => void,
  /** the same, without Jake on the transition screen */
  waitForResourcesJakeLess: null as (resources: string[], callback: Function, callback2?: Function) => void,

  /** texts (locale.txt) */
  get locale(): Locale {
    return services.texts as Locale;
  },
  set locale(value: Locale) {
    services.texts = value;
  },
  get soundManager(): SoundManager {
    return services.sound as SoundManager;
  },
  set soundManager(value: SoundManager) {
    services.sound = value;
  },
  /** config.di */
  get config(): any {
    return services.config;
  },
  set config(value: any) {
    services.config = value;
  },
  get saveSystem(): SaveSystem {
    return services.saveSystem;
  },
  set saveSystem(value: SaveSystem) {
    services.saveSystem = value;
  },
  get theTutorial(): Tutorial {
    return services.tutorial as Tutorial;
  },
  set theTutorial(value: Tutorial) {
    services.tutorial = value;
  },
  get achievementDispatcher(): AchievementDispatcher {
    return services.achievements as AchievementDispatcher;
  },
  set achievementDispatcher(value: AchievementDispatcher) {
    services.achievements = value;
  },
  get theLoader(): PostLoader {
    return app.postLoader;
  },
  /** dailyBonus.di is loaded: today's bonus */
  setDailyBonus(config: DiFile) {
    DailyBonus.config = config;
    app.activeBonus = DailyBonus.getBonusOfDate(new Date());
  },
};
