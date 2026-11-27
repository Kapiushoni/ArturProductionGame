import { as3as, bindMethods } from '@/flash/as3';
import { BasicFightView } from '@/game/view/screens/main_game/dungeon/fight/BasicFightView';
import { app } from '@/game/app';
import { EnemyView } from '@/game/view/figthers/EnemyView';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import { RunAnimation } from '@/game/view/figthers/animations/RunAnimation';
import { FighterView } from '@/game/view/figthers/FighterView';
import { JinnView } from '@/game/view/figthers/JinnView';
import type { BackgroundView } from '@/game/view/screens/main_game/dungeon/BackgroundView';
import type { IFight } from '@/game/main_game/dungeon/IFight';

export class FightView extends BasicFightView {
  constructor(fight: IFight, fighterView: FighterView, backgroundView: BackgroundView) {
    super();
    this.initFightView(fight, backgroundView, fighterView);
  }
  initializeViews(list: any[]) {
    const jinnView = list[0];
    this.views.set(app.game.getJinn(), jinnView);
    this.views.set(this.fight.getEnemy(), new EnemyView(this.fight.getEnemy()));
  }
  get jinnView() {
    return as3as(this.views.get(app.game.getJinn()), JinnView);
  }
  initialize() {
    this.enemy = this.fight.getEnemy();
    const fighterView = this.views.get(this.enemy);
    fighterView.putIn(this.bg.arena);
    fighterView.y = Dungeon.DungeonConfig['height_fighters'];
    fighterView.x =
      Dungeon.DungeonConfig['position_enemy'] +
      Dungeon.DungeonConfig['lenght_step'] * Dungeon.DungeonConfig['steps_to_find_enemy'];
    fighterView.x += Dungeon.DungeonConfig['end_lenght_step'];
    if (!this.fight.first) {
      fighterView.x += Dungeon.DungeonConfig['start_lenght_step'];
    }
    fighterView.animate(new IdleAnimation());
    super.initialize();
  }
  won() {
    app.game.getDungeon().wonFight();
  }
  lose() {
    app.game.getDungeon().lostFight();
  }
  moveEnemy(num: number) {
    num = Number(num);
    this.views.get(this.enemy).x -= num;
  }
  enter(callback2: Function) {
    const callback = callback2;
    const steps = Number(Dungeon.DungeonConfig['steps_to_find_enemy']);
    const walk = new RunAnimation(steps, !this.fight.first);
    this.jinnView.animate(walk);
    walk.atFinish.add((fighterAnimation) => {
      this.atEndEnter(callback);
    });
    this.bg.onMove.add(this.moveEnemy);
    this.bg.beginScroll();
  }
  atEndEnter(callback: Function) {
    this.bg.endScroll();
    this.bg.onMove.remove(this.moveEnemy);
    super.enter(callback);
  }
  clear() {
    as3as(this.views.get(this.enemy), FighterView).clear();
    super.clear();
  }
}
bindMethods(FightView, ['won', 'lose', 'moveEnemy', 'enter', 'clear']);
