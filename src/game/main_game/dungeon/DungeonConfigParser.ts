// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { Util } from '@/game/util/Util';

export class DungeonConfigParser {
  declare enemies: any;
  declare loot: any;
  declare backgrounds: any;
  constructor(obj) {
         
         this.parseEnemies(obj);
         this.loot = DungeonConfigParser.parseLootData(obj);
         this.parseBackground(obj);
      }
  static parseLootData(obj) {
         var list = null;
         var list2 = new Array();
         var i = uint(1);
         while(i <= 10)
         {
            list = obj["lootDrop" + i].split(":");
            if(list[0] == "null")
            {
               break;
            }
            list2.push([list[0],list[1]]);
            i++;
         }
         return list2;
      }
  parseEnemies(obj) {
         var list = null;
         this.enemies = new Array();
         var i = uint(1);
         while(i <= 10)
         {
            list = obj["enemy" + i].split(":");
            if(list[0] == "null")
            {
               break;
            }
            this.enemies.push([list[0],list[1]]);
            i++;
         }
      }
  parseBackground(obj) {
         this.backgrounds = new Array();
         var i = uint(1);
         while(i <= 3)
         {
            this.backgrounds.push(Util.parseArray(obj["layer" + i]));
            i++;
         }
      }
  get enemiesData() {
         return this.enemies;
      }
  get lootData() {
         return this.loot;
      }
  get backgroundsData() {
         return this.backgrounds;
      }
}
DungeonConfigParser.prototype.enemies = null;
DungeonConfigParser.prototype.loot = null;
DungeonConfigParser.prototype.backgrounds = null;
bindMethods(DungeonConfigParser);
