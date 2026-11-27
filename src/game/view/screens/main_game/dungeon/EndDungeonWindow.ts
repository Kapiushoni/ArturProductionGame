import type { IPausable } from '@/game/view/screens/main_game/states/IPausable';

/** The window at the end of a dungeon (WinWindow / LostWindow). */
export interface EndDungeonWindow extends IPausable {
  getOnReplay(): any;
  getOnBackToMap(): any;
  enter(callback?: Function): any;
  putIn(holder: any): any;
}
