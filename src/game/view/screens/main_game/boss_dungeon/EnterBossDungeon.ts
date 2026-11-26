// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';
import { main } from '@/game/main';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { GameSounds } from '@/game/sound/GameSounds';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import { RunAnimation } from '@/game/view/figthers/animations/RunAnimation';
import { BackgroundView } from '@/game/view/screens/main_game/dungeon/BackgroundView';

export class EnterBossDungeon {
  declare bossDungeonView: any;
  declare atEnd: any;
  declare gameLoop: any;
  declare paused: any;
  declare walk: any;
  constructor(bossDungeonView, atEnd) {
         
         this.bossDungeonView = bossDungeonView;
         this.atEnd = atEnd;
         this.gameLoop = new GameLoop(bossDungeonView.background);
         this.gameLoop.updated.add(this.refresh);
         this.paused = false;
         this.start();
      }
  start() {
         var num = Number(Number(Dungeon.DungeonConfig["height_fighters"]));
         var jinnView = this.bossDungeonView.getJinnView();
         var bossView = this.bossDungeonView.getBossView();
         jinnView.y = num;
         bossView.y = num;
         jinnView.x = Dungeon.DungeonConfig["position_jinn"] - 2.1 * Dungeon.DungeonConfig["lenght_step"];
         jinnView.putIn(this.bossDungeonView.background.arena);
         this.walk = new RunAnimation(4,true,false);
         this.walk.getAtFinish().add(this.endPositionating);
         jinnView.animate(this.walk);
         bossView.animate(new IdleAnimation());
         this.gameLoop.start();
      }
  resume() {
         if(this.paused)
         {
            this.gameLoop.start();
            this.bossDungeonView.getJinnView().resume();
            this.bossDungeonView.getBossView().resume();
            this.paused = false;
         }
      }
  pause() {
         if(!this.paused)
         {
            this.gameLoop.stop();
            this.bossDungeonView.getJinnView().pause();
            this.bossDungeonView.getBossView().pause();
            this.paused = true;
         }
      }
  refresh(num) { num = int(num);
         this.bossDungeonView.getJinnView().x = this.bossDungeonView.getJinnView().x + BackgroundView.ARENA_VELOCITY;
      }
  endPositionating(fighterAnimation) {
         this.walk = null;
         this.gameLoop.stop();
         this.atEnd();
      }
  playMusic() {
         main.soundManager.playMusic(GameSounds.BOSS_MUSIC);
      }
  stopMusic() {
         main.soundManager.stopMusic(GameSounds.BOSS_MUSIC);
      }
  clear() {
         this.gameLoop.updated.clear();
         this.gameLoop = null;
         if(this.walk != null)
         {
            this.walk.kill();
            this.walk = null;
         }
         this.bossDungeonView = null;
         this.atEnd = null;
      }
}
EnterBossDungeon.prototype.bossDungeonView = null;
EnterBossDungeon.prototype.atEnd = null;
EnterBossDungeon.prototype.gameLoop = null;
EnterBossDungeon.prototype.paused = false;
EnterBossDungeon.prototype.walk = null;
bindMethods(EnterBossDungeon);
