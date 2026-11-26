// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { Level } from '@/game/main_game/map/Level';
import { main } from '@/game/main';

export class LegendaryLevel extends Level {
  isLocked() { return false; }
  isUnlocked() { return true; }
  declare theElement: any;
  declare date: any;
  constructor(text, theElement, date, num = 1) {
          super(text,num); num = uint(num);
         this.theElement = theElement;
         this.date = date;
      }
  isLegendary() {
         return true;
      }
  getDate() {
         return this.date;
      }
  get element() {
         return this.theElement;
      }
  getName() {
         return main.locale.get("legendaryDungeonName");
      }
  getArea() {
         return uint(1);
      }
}
LegendaryLevel.prototype.theElement = null;
LegendaryLevel.prototype.date = null;
bindMethods(LegendaryLevel);
