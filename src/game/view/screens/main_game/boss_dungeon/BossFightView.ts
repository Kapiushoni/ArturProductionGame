// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { BasicFightView } from '@/game/view/screens/main_game/dungeon/fight/BasicFightView';
import { main } from '@/game/main';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { GameSounds } from '@/game/sound/GameSounds';
import { Util } from '@/game/util/Util';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';

export class BossFightView extends BasicFightView {
  declare bossDungeonView: any;
  constructor(bossDungeonView, bossFight) {super(__DEFER); 
         this.bossDungeonView = bossDungeonView;
          this.__init_BasicFightView(bossFight,bossDungeonView.background);
         main.soundManager.playMusic(GameSounds.BOSS_MUSIC);
      }
  get bossView() {
         return this.bossDungeonView.getBossView();
      }
  initializeViews(list) { const __self = this;
         __self.enemy = __self.fight.getEnemy();
         var jinnView = this.bossDungeonView.getJinnView();
         __self.views.set(jinnView.getFighter(), jinnView);
         __self.views.set(this.bossView.getFighter(), this.bossView);
      }
  enter(callback) {
         this.bossView.animate(new IdleAnimation());
         this.bossView.x = this.bossDungeonView.getJinnView().x + (Dungeon.DungeonConfig["position_enemy"] - Dungeon.DungeonConfig["position_jinn"]) + 100;
         this.bossView.putIn(this.bossDungeonView.background.arena);
         this.bossDungeonView.getJinnView().animate(new IdleAnimation());
         this.bossDungeonView.background.onMove.add(Util.l(this.backgroundMove,callback));
         this.bossDungeonView.background.beginScroll();
      }
  backgroundMove(num, callback) { num = Number(num);
         this.bossDungeonView.getJinnView().x = this.bossDungeonView.getJinnView().x - num;
         this.bossDungeonView.getBossView().x = this.bossDungeonView.getBossView().x - num;
         if(this.bossDungeonView.getJinnView().x <= Dungeon.DungeonConfig["position_jinn"])
         {
            this.bossDungeonView.background.onMove.remove(this.backgroundMove);
            this.bossDungeonView.background.endScroll();
            super.enter(callback);
         }
      }
  won() {
         this.bossDungeonView.dungeon.getDungeon().wonFight();
      }
  lose() {
         this.bossDungeonView.dungeon.getDungeon().lostFight();
      }
  playMusic() {
         main.soundManager.playMusic(GameSounds.BOSS_MUSIC);
      }
  stopMusic() {
         main.soundManager.stopMusic(GameSounds.BOSS_MUSIC);
      }
}
BossFightView.prototype.bossDungeonView = null;
bindMethods(BossFightView);
