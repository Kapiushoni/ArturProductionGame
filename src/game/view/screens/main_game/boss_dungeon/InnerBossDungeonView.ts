import type { InnerDungeonView } from '@/game/view/screens/main_game/dungeon/InnerDungeonView';

export interface InnerBossDungeonView extends InnerDungeonView {
  playMusic(): any;
  stopMusic(): any;
}
