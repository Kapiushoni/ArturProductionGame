// @ts-nocheck
import { __DEFER, bindMethods, int } from '@/flash/as3';
import { Stat } from '@/game/main_game/character/stats/Stat';

export class HealthStat extends Stat {
  declare maxHealth: any;
  constructor(num, maxHealth, num2 = 0) {super(__DEFER); 
         this.maxHealth = maxHealth;
          this.__init_Stat(num,num2); num = int(num); num2 = Number(num2);
      }
  modifyValue(num) { num = Number(num);
         this.value = Math.max(0,Math.min(this.value + num,this.getUpperBound().getValue()));
      }
  modifyUpperBound(num) { num = Number(num);
         this.maxHealth.modifyValue(num);
         this.fill(100);
      }
  fill(num = 100) { num = Number(num);
         this.modifyValue(Math.floor(this.getUpperBound().getValue() * num / 100));
      }
  getUpperBound() {
         return this.maxHealth;
      }
  getpercentage() { const __self = this;
         return Number(Math.ceil(__self.getValue() * 100 / this.getUpperBound().getValue()));
      }
}
HealthStat.prototype.maxHealth = null;
bindMethods(HealthStat);
