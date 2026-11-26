// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';

export class Fighter {
  declare onHit: any;
  declare stats: any;
  declare name: any;
  declare nameString: any;
  declare soundManager: any;
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_Fighter(...__a); }
  __init_Fighter(name, characterConfigData) {
         
         this.name = name;
         this.onHit = new Signal();
         this.nameString = characterConfigData.nameString;
         this.stats = this.createStats(characterConfigData);
      }
  isJinn() {
         return false;
      }
  createStats(characterConfigData) {
         throw new Error("must override this method");
      }
  getName() {
         return this.name;
      }
  prepareForFight(fight) {
      }
  hit(fighter, damage, callback) {
         this.onHit.emit(this,fighter,damage,callback);
      }
  takeDamage(damage) {
         damage.apply(this.stats);
      }
  clear() {
         this.onHit.clear();
         this.stats.clear();
      }
  getNameToShow() {
         return main.locale.get(this.nameString);
      }
}
Fighter.prototype.onHit = null;
Fighter.prototype.stats = null;
Fighter.prototype.name = null;
Fighter.prototype.nameString = null;
Fighter.prototype.soundManager = null;
bindMethods(Fighter);
