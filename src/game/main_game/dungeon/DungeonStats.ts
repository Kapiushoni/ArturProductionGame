// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';

export class DungeonStats {
  declare defeated: any;
  declare mixesDone: any;
  declare criticalHits: any;
  declare theLevel: any;
  declare active: any;
  constructor(theLevel) {
         
         this.active = false;
         this.theLevel = theLevel;
         this.mixesDone = int(0);
         this.criticalHits = int(0);
      }
  start() {
         this.active = true;
         main.game.getMixer().onMixEnd.add(this.onMix);
         main.game.getJinn().onHit.add(this.onHit);
      }
  get level() {
         return this.theLevel;
      }
  onMix(mixResult) {
         this.mixesDone = int(this.mixesDone + (1));
      }
  onHit(jinn, enemy, damage, callback) {
         if(damage.isCritical())
         {
            this.criticalHits = int(this.criticalHits + (1));
         }
      }
  end(defeated) {
         this.defeated = defeated;
         this.deactivate();
      }
  getCombatExperience() {
         return Number(Dungeon.xpCalulator.getXp(this.defeated));
      }
  getMixExperience() {
         return Number(Dungeon.xpCalulator.getMixXp(this.mixesDone));
      }
  getCriticalExperience() {
         return Number(Dungeon.xpCalulator.getCriticalXp(this.criticalHits));
      }
  getDungeonExperience() {
         return Number(this.getCombatExperience() + this.getCriticalExperience() + this.getMixExperience());
      }
  deactivate() {
         if(this.active)
         {
            main.game.getMixer().onMixEnd.remove(this.onMix);
            main.game.getJinn().onHit.remove(this.onHit);
            this.active = false;
         }
      }
  clear() {
         this.deactivate();
      }
}
DungeonStats.prototype.defeated = null;
DungeonStats.prototype.mixesDone = 0;
DungeonStats.prototype.criticalHits = 0;
DungeonStats.prototype.theLevel = null;
DungeonStats.prototype.active = false;
bindMethods(DungeonStats);
