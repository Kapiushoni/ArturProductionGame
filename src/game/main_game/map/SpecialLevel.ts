// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { Level } from '@/game/main_game/map/Level';
import { main } from '@/game/main';

export class SpecialLevel extends Level {
  constructor(text, num = 1) {
          super(text,num); num = uint(num);
      }
  isSpecial() {
         return true;
      }
  getName() {
         return main.locale.get("specialDungeonName");
      }
  getArea() { const __self = this;
         if(__self.getDungeonId() == "26")
         {
            return uint(1);
         }
         if(__self.getDungeonId() == "27")
         {
            return uint(2);
         }
         return uint(3);
      }
}
bindMethods(SpecialLevel);
