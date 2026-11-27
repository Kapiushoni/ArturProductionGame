import { EnemyView } from '@/game/view/figthers/EnemyView';
import { app } from '@/game/app';
import { BossSoundManager } from '@/game/sound/BossSoundManager';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';

export class BossView extends EnemyView {
  constructor(fighter: Fighter) {
    super(fighter);
  }
  getNewMc(fighterAnimation: IFighterAnimation) {
    const text = 'assets.' + 'boss_normal' + '.' + fighterAnimation.getName();
    const cls = app.swfLoader.getClass(text);
    return new cls();
  }
  setSoundManager() {
    this.soundManager = new BossSoundManager();
  }
}
