// @ts-nocheck
import type { IPausable } from '@/game/view/screens/main_game/states/IPausable';

export interface EndDungeonWindow extends IPausable {
  getOnReplay(): any;
  getOnBackToMap(): any;
  enter(param1 = null): any;
  putIn(param1): any;
}
