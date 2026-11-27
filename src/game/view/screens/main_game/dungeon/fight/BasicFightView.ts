import { Dictionary, MovieClip, Timer, TimerEvent, as3as, as3values, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { app } from '@/game/app';
import { Util } from '@/game/util/Util';
import { FighterView } from '@/game/view/figthers/FighterView';
import { DamageFeedback } from '@/game/view/screens/main_game/dungeon/fight/DamageFeedback';
import type { BackgroundView } from '@/game/view/screens/main_game/dungeon/BackgroundView';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { IFight } from '@/game/main_game/dungeon/IFight';
import type { Enemy } from '@/game/main_game/character/Enemy';

export class BasicFightView {
  bg: BackgroundView = null;
  fight: IFight = null;
  enemy: Enemy = null;
  views: any = null;
  timer: Timer = null;
  /**
   * new BasicFightView(fight, bg, ...views), or super() then initFightView(...) in subclasses that must set
   * their fields first: the initialization calls initializeViews(), which subclasses override.
   */
  constructor(fight: IFight = null, bg: BackgroundView = null, ...views: any[]) {
    if (fight != null) this.initFightView(fight, bg, ...views);
  }
  initFightView(fight: IFight, bg: BackgroundView, ...rest) {
    this.fight = fight;
    this.bg = bg;
    this.views = new Dictionary();
    this.initializeViews(rest);
    this.initialize();
  }
  getFightConfig() {
    return app.config.get('FightConfig');
  }
  initializeViews(list: any[]) {
    throw new Error('Must implement');
  }
  initialize() {
    this.fight.onHit.add(this.onHit);
    this.fight.onEnter.add(this.enter);
    this.fight.onExit.add(this.leave);
    this.fight.onWin.add(this.won);
    this.fight.onLose.add(this.lose);
  }
  won() {
    throw new Error('Must implement');
  }
  lose() {
    throw new Error('Must implement');
  }
  countdown(callback: Function) {
    const next = callback;
    this.bg.enemyHud.changeFighter(this.enemy);
    this.timer = new Timer(100, this.getFightConfig().countdown * 10);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, (event) => {
      this.removeTimer();
      next();
    });
    this.timer.start();
  }
  enter(callback: Function) {
    this.countdown(callback);
  }
  leave(callback: Function) {
    this.bg.enemyHud.changeFighter(null);
    callback();
  }
  onHit(fighter: Fighter, fighter2: Fighter, damage2: Damage, callback: Function) {
    const hitter = fighter;
    const reciver = fighter2;
    const damage = damage2;
    const atEnd = callback;
    this.timer = new Timer(100, this.getFightConfig().cooldown * 10);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, (event) => {
      this.removeTimer();
      this.views
        .get(hitter)
        .onHit(this.views.get(reciver), damage, atEnd, Util.l(this.showFeedback, hitter, reciver, damage));
    });
    this.timer.start();
  }
  showFeedback(fighter: Fighter, fighter2: Fighter, damage2: Damage) {
    let jinnFeedbacks = null;
    let enemyFeedbacks = null;
    const hitter = fighter;
    const reciver = fighter2;
    const damage = damage2;
    const number = as3as(app.swfLoader.getObject('assets.numberHealth2'), MovieClip);
    number.container.title.title.text = damage.stringValue();
    const hitterView = as3as(this.views.get(reciver), FighterView);
    number.x = hitterView.x;
    number.y = hitterView.y;
    if (hitter.isJinn()) {
      number.scaleX = -1;
      number.container.title.scaleX = -1;
      jinnFeedbacks = DamageFeedback.hitter(damage);
      enemyFeedbacks = DamageFeedback.defender(damage);
    } else {
      number.x -= 50;
      enemyFeedbacks = DamageFeedback.hitter(damage);
      jinnFeedbacks = DamageFeedback.defender(damage);
    }
    number.gotoAndPlay(1);
    this.bg.arena.addChild(number);
    const smart_mc = new SmartMC(number);
    smart_mc.trigger(
      new EndAnimation(),
      Functor.wrap(function () {
        smart_mc.clear();
        number.stop();
        number.parent.removeChild(number);
      }),
    );
    for (const fFeedback of as3values(jinnFeedbacks)) {
      this.bg.addJinnFeddback(fFeedback);
    }
    for (const eFeedback of as3values(enemyFeedbacks)) {
      this.bg.addEnemyFeddback(eFeedback);
    }
  }
  removeTimer() {
    if (this.timer != null) {
      this.timer.stop();
    }
    this.timer = null;
  }
  pause() {
    if (this.timer != null) {
      this.timer.stop();
    }
    this.bg.pauseScroll();
    for (const view of as3values(this.views)) {
      view.pause();
    }
  }
  resume() {
    if (this.timer != null) {
      this.timer.start();
    }
    this.bg.resumeScroll();
    for (const view of as3values(this.views)) {
      view.resume();
    }
  }
  clear() {
    this.removeTimer();
    this.bg = null;
    this.views = null;
    this.enemy = null;
  }
}
bindMethods(BasicFightView);
