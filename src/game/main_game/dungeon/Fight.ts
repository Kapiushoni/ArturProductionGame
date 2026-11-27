import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { DamageCalculator } from '@/game/main_game/dungeon/DamageCalculator';
import type { IFight } from '@/game/main_game/dungeon/IFight';
import type { Damage } from '@/game/main_game/dungeon/Damage';
import type { Jinn } from '@/game/main_game/character/Jinn';
import type { Enemy } from '@/game/main_game/character/Enemy';

/**
 * The jinn against one enemy. They hit in turns, the jinn first, until one of them dies:
 * onHit(attacker, target, damage, done) for every hit, then onWin or onLose.
 * onEnter / onExit (with a callback) let the view play the entry and exit animations.
 */
export class Fight implements IFight {
  protected jinn: Jinn;
  protected enemy: any; // Enemy
  private theOnEnter: Signal;
  private theOnExit: Signal;
  private theOnHit: Signal;
  private theOnLose: Signal;
  private theOnWin: Signal;
  first: boolean;

  /** first: the first fight of the dungeon */
  constructor(jinn: Jinn, enemy: any, first = false) {
    this.first = first;
    this.jinn = jinn;
    this.enemy = enemy;
    this.theOnHit = new Signal();
    this.theOnLose = new Signal();
    this.theOnWin = new Signal();
    this.theOnEnter = new Signal();
    this.theOnExit = new Signal();
  }
  get onEnter(): Signal {
    return this.theOnEnter;
  }
  get onExit(): Signal {
    return this.theOnExit;
  }
  get onHit(): Signal {
    return this.theOnHit;
  }
  get onLose(): Signal {
    return this.theOnLose;
  }
  get onWin(): Signal {
    return this.theOnWin;
  }
  getEnemy(): Enemy {
    return this.enemy;
  }
  enter(callback: Function) {
    this.onEnter.emit(callback);
  }
  leave(callback: Function) {
    this.onExit.emit(callback);
  }
  fight() {
    this.jinn.prepareForFight(this);
    this.enemy.prepareForFight(this);
    this.jinn.onHit.add(this.atHit);
    this.enemy.onHit.add(this.atHit);
    this.enter(this.start);
  }
  atHit(...args: any[]) {
    this.onHit.emit.apply(this.onHit, args);
  }
  start() {
    this.makeJinnHit();
  }
  /** the player left the dungeon during the fight */
  suddenDeath() {
    this.jinn.onHit.remove(this.atHit);
    this.enemy.onHit.remove(this.atHit);
    this.onLose.emit();
  }
  makeJinnHit() {
    const damage = DamageCalculator.calculateDamage(this.jinn, this.enemy);
    this.jinn.hit(this.enemy, damage, () => {
      this.endJinnHit(damage);
    });
  }
  endJinnHit(_damage: Damage) {
    if (!this.enemy.stats.isDead()) {
      this.makeEnemyHit();
    } else {
      this.onWin.emit();
    }
  }
  endEnemyHit(_damage: Damage) {
    if (!this.jinn.stats.isDead()) {
      this.makeJinnHit();
    } else {
      this.onLose.emit();
    }
  }
  makeEnemyHit() {
    const damage = DamageCalculator.calculateDamage(this.enemy, this.jinn);
    this.enemy.hit(this.jinn, damage, () => {
      this.endEnemyHit(damage);
    });
  }
  deactivate() {
    this.onLose.clear();
    this.onWin.clear();
    this.onHit.clear();
    this.onEnter.clear();
    this.onExit.clear();
    this.jinn.onHit.remove(this.atHit);
    this.enemy.onHit.remove(this.atHit);
  }
  clear() {
    this.enemy = null;
    this.jinn = null;
    this.theOnLose = null;
    this.theOnWin = null;
    this.theOnHit = null;
    this.theOnEnter = null;
    this.theOnExit = null;
  }
}
bindMethods(Fight, ['enter', 'leave', 'fight', 'atHit', 'start', 'suddenDeath', 'deactivate', 'clear']);
