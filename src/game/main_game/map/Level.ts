// @ts-nocheck
import { bindMethods, int, uint } from '@/flash/as3';
import { main } from '@/game/main';

export class Level {
  declare dungeonId: any;
  declare state: any;
  declare correlative: any;
  constructor(dungeonId, state = 1) { state = uint(state);
         
         this.dungeonId = dungeonId;
         this.state = uint(state);
         this.correlative = [];
      }
  static get LOCKED() {
         return uint(1);
      }
  static get UNLOCKED() {
         return uint(2);
      }
  static get CLEARED() {
         return uint(3);
      }
  getArea() {
         var num = int(int(this.dungeonId));
         if(num <= 8)
         {
            return uint(1);
         }
         if(num <= 16)
         {
            return uint(2);
         }
         return uint(3);
      }
  isLegendary() {
         return false;
      }
  isSpecial() {
         return false;
      }
  getDungeonId() {
         return this.dungeonId;
      }
  addCorrelative(level) {
         this.correlative.push(level);
      }
  getCorrelative() {
         return this.correlative;
      }
  isLocked() {
         return this.state == Level.LOCKED;
      }
  isCleared() {
         return this.state == Level.CLEARED;
      }
  isUnlocked() {
         return this.state >= Level.UNLOCKED;
      }
  getName() {
         return main.locale.get("dungeonName",[this.id]);
      }
  unlock() {
         if(this.isLocked())
         {
            this.state = uint(Level.UNLOCKED);
         }
      }
  clear() {
         if(!this.isCleared())
         {
            this.state = uint(Level.CLEARED);
         }
      }
  get id() {
         return this.dungeonId;
      }
  get stateUint() {
         return uint(this.state);
      }
}
Level.prototype.dungeonId = null;
Level.prototype.state = 0;
Level.prototype.correlative = null;
bindMethods(Level);
