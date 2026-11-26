// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { DamageCalculator } from '@/game/main_game/dungeon/DamageCalculator';

export class Fight {
  declare jinn: any;
  declare enemy: any;
  declare theOnEnter: any;
  declare theOnExit: any;
  declare theOnHit: any;
  declare theOnLose: any;
  declare theOnWin: any;
  declare first: any;
  constructor(enemy, first = false) {
         
         this.first = first;
         this.jinn = main.game.getJinn();
         this.enemy = enemy;
         this.theOnHit = new Signal();
         this.theOnLose = new Signal();
         this.theOnWin = new Signal();
         this.theOnEnter = new Signal();
         this.theOnExit = new Signal();
      }
  get onEnter() {
         return this.theOnEnter;
      }
  get onExit() {
         return this.theOnExit;
      }
  get onHit() {
         return this.theOnHit;
      }
  get onLose() {
         return this.theOnLose;
      }
  get onWin() {
         return this.theOnWin;
      }
  getEnemy() {
         return this.enemy;
      }
  enter(callback) {
         this.onEnter.emit(callback);
      }
  leave(callback) {
         this.onExit.emit(callback);
      }
  fight() {
         this.jinn.prepareForFight(this);
         this.enemy.prepareForFight(this);
         this.jinn.onHit.add(this.atHit);
         this.enemy.onHit.add(this.atHit);
         this.enter(this.start);
      }
  atHit(... rest) {
         this.onHit.emit.apply(this.onHit,rest);
      }
  start() {
         this.makeJinnHit();
      }
  suddenDeath() {
         this.jinn.onHit.remove(this.atHit);
         this.enemy.onHit.remove(this.atHit);
         this.onLose.emit();
      }
  makeJinnHit() { const __self = this;
         var damage = null;
         damage = DamageCalculator.calculateDamage(this.jinn,this.enemy);
         this.jinn.hit(this.enemy,damage,function()
         {
            __self.endJinnHit(damage);
         });
      }
  endJinnHit(damage) {
         if(!this.enemy.stats.isDead())
         {
            this.makeEnemyHit();
         }
         else
         {
            this.onWin.emit();
         }
      }
  endEnemyHit(damage) {
         if(!this.jinn.stats.isDead())
         {
            this.makeJinnHit();
         }
         else
         {
            this.onLose.emit();
         }
      }
  makeEnemyHit() { const __self = this;
         var damage = null;
         damage = DamageCalculator.calculateDamage(this.enemy,this.jinn);
         this.enemy.hit(this.jinn,damage,function()
         {
            __self.endEnemyHit(damage);
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
  isFirst() {
         return this.first;
      }
}
Fight.prototype.jinn = null;
Fight.prototype.enemy = null;
Fight.prototype.theOnEnter = null;
Fight.prototype.theOnExit = null;
Fight.prototype.theOnHit = null;
Fight.prototype.theOnLose = null;
Fight.prototype.theOnWin = null;
Fight.prototype.first = false;
bindMethods(Fight);
