// @ts-nocheck
import { __DEFER, bindMethods } from '@/flash/as3';
import { Fighter } from '@/game/main_game/character/Fighter';
import { EnemyStats } from '@/game/main_game/character/stats/EnemyStats';

export class Enemy extends Fighter {
  declare element: any;
  constructor(text, characterConfigData, num) {super(__DEFER); 
         this.element = characterConfigData.element;
          this.__init_Fighter(text,characterConfigData); num = Number(num);
         this.stats.leveling(num);
      }
  createStats(characterConfigData) {
         return new EnemyStats(characterConfigData,this);
      }
  getElement() {
         return this.element;
      }
  getType() {
         return this.getName().charAt(5);
      }
}
Enemy.prototype.element = null;
bindMethods(Enemy);
