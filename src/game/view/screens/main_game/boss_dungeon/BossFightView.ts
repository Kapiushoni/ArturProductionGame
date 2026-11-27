import { bindMethods } from '@/flash/as3';
import { BasicFightView } from '@/game/view/screens/main_game/dungeon/fight/BasicFightView';
import { main } from '@/game/main';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { GameSounds } from '@/game/sound/GameSounds';
import { Util } from '@/game/util/Util';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import type { BossDungeonView } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonView';
import type { BossFight } from '@/game/main_game/boss_dungeon/BossFight';

export class BossFightView extends BasicFightView {
  bossDungeonView: any = null;
  constructor(bossDungeonView: BossDungeonView, bossFight: BossFight) {
    super();
    this.bossDungeonView = bossDungeonView;
    this.initFightView(bossFight, bossDungeonView.background);
    main.soundManager.playMusic(GameSounds.BOSS_MUSIC);
  }
  get bossView() {
    return this.bossDungeonView.bossView;
  }
  initializeViews(list: any[]) {
    this.enemy = this.fight.getEnemy();
    var jinnView = this.bossDungeonView.jinnView;
    this.views.set(jinnView.fighter, jinnView);
    this.views.set(this.bossView.fighter, this.bossView);
  }
  enter(callback: Function) {
    this.bossView.animate(new IdleAnimation());
    this.bossView.x =
      this.bossDungeonView.jinnView.x +
      (Dungeon.DungeonConfig['position_enemy'] - Dungeon.DungeonConfig['position_jinn']) +
      100;
    this.bossView.putIn(this.bossDungeonView.background.arena);
    this.bossDungeonView.jinnView.animate(new IdleAnimation());
    this.bossDungeonView.background.onMove.add(Util.l(this.backgroundMove, callback));
    this.bossDungeonView.background.beginScroll();
  }
  backgroundMove(num: number, callback: Function) {
    num = Number(num);
    this.bossDungeonView.jinnView.x = this.bossDungeonView.jinnView.x - num;
    this.bossDungeonView.bossView.x = this.bossDungeonView.bossView.x - num;
    if (this.bossDungeonView.jinnView.x <= Dungeon.DungeonConfig['position_jinn']) {
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
bindMethods(BossFightView);
