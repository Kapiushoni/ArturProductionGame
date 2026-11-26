// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Experience } from '@/game/main_game/character/stats/Experience';
import { main } from '@/game/main';

export class PersistentExperience extends Experience {
  persist = false;
  constructor(stats) {
          super(stats);
      }
  startPersistence() { const __self = this;
         this.value = main.saveSystem.getExperience();
         __self.refreshLevel();
         this.persist = true;
      }
  modifyValue(num) { num = Number(num);
         super.modifyValue(num);
         if(num != 0 && this.persist)
         {
            main.saveSystem.saveExperience(this.value);
         }
      }
}
bindMethods(PersistentExperience);
