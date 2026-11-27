import { bindMethods, int } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';
import { app } from '@/game/app';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { GameSounds } from '@/game/sound/GameSounds';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import { RunAnimation } from '@/game/view/figthers/animations/RunAnimation';
import { BackgroundView } from '@/game/view/screens/main_game/dungeon/BackgroundView';
import type { BossDungeonView } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonView';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';

export class EnterBossDungeon {
  bossDungeonView: BossDungeonView = null;
  atEnd: any = null;
  gameLoop: GameLoop = null;
  paused = false;
  walk: RunAnimation = null;
  constructor(bossDungeonView: BossDungeonView, atEnd: Function) {
    this.bossDungeonView = bossDungeonView;
    this.atEnd = atEnd;
    this.gameLoop = new GameLoop(bossDungeonView.background);
    this.gameLoop.updated.add(this.refresh);
    this.paused = false;
    this.start();
  }
  start() {
    const num = Number(Dungeon.DungeonConfig['height_fighters']);
    const jinnView = this.bossDungeonView.jinnView;
    const bossView = this.bossDungeonView.bossView;
    jinnView.y = num;
    bossView.y = num;
    jinnView.x = Dungeon.DungeonConfig['position_jinn'] - 2.1 * Dungeon.DungeonConfig['lenght_step'];
    jinnView.putIn(this.bossDungeonView.background.arena);
    this.walk = new RunAnimation(4, true, false);
    this.walk.atFinish.add(this.endPositionating);
    jinnView.animate(this.walk);
    bossView.animate(new IdleAnimation());
    this.gameLoop.start();
  }
  resume() {
    if (this.paused) {
      this.gameLoop.start();
      this.bossDungeonView.jinnView.resume();
      this.bossDungeonView.bossView.resume();
      this.paused = false;
    }
  }
  pause() {
    if (!this.paused) {
      this.gameLoop.stop();
      this.bossDungeonView.jinnView.pause();
      this.bossDungeonView.bossView.pause();
      this.paused = true;
    }
  }
  refresh(num: number) {
    num = int(num);
    this.bossDungeonView.jinnView.x = this.bossDungeonView.jinnView.x + BackgroundView.ARENA_VELOCITY;
  }
  endPositionating(fighterAnimation: IFighterAnimation) {
    this.walk = null;
    this.gameLoop.stop();
    this.atEnd();
  }
  playMusic() {
    app.soundManager.playMusic(GameSounds.BOSS_MUSIC);
  }
  stopMusic() {
    app.soundManager.stopMusic(GameSounds.BOSS_MUSIC);
  }
  clear() {
    this.gameLoop.updated.clear();
    this.gameLoop = null;
    if (this.walk != null) {
      this.walk.kill();
      this.walk = null;
    }
    this.bossDungeonView = null;
    this.atEnd = null;
  }
}
bindMethods(EnterBossDungeon);
