// @ts-nocheck
import { as3as, bindMethods } from '@/flash/as3';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { BossFight } from '@/game/main_game/boss_dungeon/BossFight';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { GameSounds } from '@/game/sound/GameSounds';
import { BossDungeonState } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonState';
import { BossFightView } from '@/game/view/screens/main_game/boss_dungeon/BossFightView';
import { EnterBossDungeon } from '@/game/view/screens/main_game/boss_dungeon/EnterBossDungeon';
import { WinBossDungeonWindow } from '@/game/view/screens/main_game/boss_dungeon/WinBossDungeonWindow';

export class BossDungeonView extends DungeonView {
  declare bossView: any;
  won = false;
  constructor(dungeonState) {
          super(dungeonState);
         this.timeLine.clear();
      }
  initialize() { const __self = this;
         this.bossView = CharacterFactory.getInstance().getBossView(as3as(__self.dungeon.getDungeon().currentFight.getEnemy(), Boss));
         super.initialize();
      }
  start() { const __self = this;
         this.innerView.clear();
         this.innerView = new EnterBossDungeon(this,__self.dungeon.getDungeon().startFight);
      }
  getBossView() {
         return this.bossView;
      }
  getJinnView() {
         return this.jinnView;
      }
  playMusic() { const __self = this;
         (__self.innerView).playMusic();
      }
  stopMusic() { const __self = this;
         (__self.innerView).stopMusic();
      }
  makeWinWindow() { const __self = this;
         this.won = true;
         return new WinBossDungeonWindow(__self.getLoot(),__self.getStats(),__self.dungeon.getDungeon().getLevel().isCleared(),this.onToOutro);
      }
  onToOutro() { const __self = this;
         (as3as(__self.dungeon, BossDungeonState)).onToOutro.emit();
      }
  onFight(fight) { const __self = this;
         this.innerView.clear();
         this.innerView = new BossFightView(this,as3as(__self.dungeon.getDungeon().currentFight, BossFight));
      }
  endEnterFinishWindow() {
         super.endEnterFinishWindow();
         if(this.bossView)
         {
            this.bossView.clear();
            this.bossView = null;
         }
      }
  get soundTrack() {
         return GameSounds.BOSS_MUSIC;
      }
  clear() {
         super.clear();
         if(this.bossView)
         {
            this.bossView.clear();
            this.bossView = null;
         }
      }
}
BossDungeonView.prototype.bossView = null;
bindMethods(BossDungeonView);
