// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Fighter } from '@/game/main_game/character/Fighter';
import { Signal } from '@/game/cb/signals/Signal';
import { Gear } from '@/game/main_game/character/Gear';
import { Liver } from '@/game/main_game/character/Liver';
import { JinnStats } from '@/game/main_game/character/stats/JinnStats';

export class Jinn extends Fighter {
  declare liver: any;
  declare gear: any;
  declare onPotionConsumition: any;
  declare endPotionConsumition: any;
  constructor(text, characterConfigData) {super(__DEFER); 
          this.__init_Fighter(text,characterConfigData);
         this.onPotionConsumition = new Signal();
         this.endPotionConsumition = new Signal();
         this.liver = new Liver(this);
         this.gear = new Gear(this);
         this.loadData();
      }
  consumePotion(item) {
         this.onPotionConsumition.emit(item);
      }
  endPotionEffect(item) {
         this.endPotionConsumition.emit(item);
      }
  loadData() {
         this.stats.loadData();
         this.stats.refillHealth();
      }
  isJinn() {
         return true;
      }
  createStats(characterConfigData) {
         return new JinnStats(characterConfigData,this);
      }
  prepareForFight(fight) {
      }
  clear() {
         super.clear();
         this.onPotionConsumition.clear();
         this.endPotionConsumition.clear();
         this.gear.clear();
         this.liver.clear();
      }
}
Jinn.prototype.liver = null;
Jinn.prototype.gear = null;
Jinn.prototype.onPotionConsumition = null;
Jinn.prototype.endPotionConsumition = null;
bindMethods(Jinn);
