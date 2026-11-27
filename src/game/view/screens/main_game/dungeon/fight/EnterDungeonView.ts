import { bindMethods, int } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { RunAnimation } from '@/game/view/figthers/animations/RunAnimation';
import { BackgroundView } from '@/game/view/screens/main_game/dungeon/BackgroundView';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';
import type { JinnView } from '@/game/view/figthers/JinnView';

export class EnterDungeonView {
  bg: any = null;
  jinnView: any = null;
  atEnd: any = null;
  paused = false;
  gameLoop: any = null;
  walk: any = null;
  constructor(jinnView: JinnView, bg: BackgroundView, atEnd: Function) {
    this.bg = bg;
    this.jinnView = jinnView;
    this.atEnd = atEnd;
    this.gameLoop = new GameLoop(bg);
    this.gameLoop.updated.add(this.refresh);
    this.paused = false;
    this.start();
  }
  start() {
    var num = Dungeon.DungeonConfig['position_jinn'] - Dungeon.DungeonConfig['lenght_step'] * 2;
    this.jinnView.putIn(this.bg.arena);
    this.jinnView.x = num - Dungeon.DungeonConfig['start_lenght_step'];
    this.jinnView.y = Dungeon.DungeonConfig['height_fighters'];
    this.walk = new RunAnimation(2, true, false);
    this.walk.getAtFinish().add(this.endEnter);
    this.jinnView.animate(this.walk);
    if (!this.paused) {
      this.gameLoop.start();
    }
  }
  endEnter(fighterAnimation: IFighterAnimation) {
    this.walk = null;
    this.gameLoop.stop();
    this.atEnd();
  }
  refresh(num: number) {
    num = int(num);
    this.jinnView.x += BackgroundView.ARENA_VELOCITY;
  }
  resume() {
    if (this.paused) {
      this.paused = false;
      this.gameLoop.start();
      this.jinnView.resume();
    }
  }
  pause() {
    if (!this.paused) {
      this.paused = true;
      this.gameLoop.stop();
      this.jinnView.pause();
    }
  }
  clear() {
    this.gameLoop.updated.clear();
    this.gameLoop = null;
    if (this.walk != null) {
      this.walk.kill();
    }
    this.walk = null;
  }
}
bindMethods(EnterDungeonView);
