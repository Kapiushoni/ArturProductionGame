// @ts-nocheck
import { as3as, bindMethods } from '@/flash/as3';
import { EnemyView } from '@/game/view/figthers/EnemyView';
import { main } from '@/game/main';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { BossSoundManager } from '@/game/sound/BossSoundManager';

export class BossView extends EnemyView {
  constructor(fighter) {
          super(fighter);
      }
  getNewMc(fighterAnimation) {
         var text = "assets." + "boss_normal" + "." + fighterAnimation.getName();
         var cls = main.swfLoader.getClass(text);
         return new cls();
      }
  setSoundManager() {
         this.soundManager = new BossSoundManager(as3as(this.fighter, Boss));
      }
}
bindMethods(BossView);
