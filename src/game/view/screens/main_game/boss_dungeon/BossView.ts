import { as3as, bindMethods } from '@/flash/as3';
import { EnemyView } from '@/game/view/figthers/EnemyView';
import { main } from '@/game/main';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { BossSoundManager } from '@/game/sound/BossSoundManager';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';

export class BossView extends EnemyView {
  constructor(fighter: Fighter) {
    super(fighter);
  }
  getNewMc(fighterAnimation: IFighterAnimation) {
    var text = 'assets.' + 'boss_normal' + '.' + fighterAnimation.getName();
    var cls = main.swfLoader.getClass(text);
    return new cls();
  }
  setSoundManager() {
    this.soundManager = new BossSoundManager(as3as(this.fighter, Boss));
  }
}
bindMethods(BossView);
