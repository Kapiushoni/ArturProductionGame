// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class StatsEffectGuardian {
  declare stats: any;
  constructor(stats) {
         
         this.stats = stats;
      }
  removeEfectsOfItem(item) {
         if(item != null)
         {
            item.getPrimaryModifier().disaffect(this.stats);
            item.getSecondaryModifier().disaffect(this.stats);
            this.stats.onChange.emit();
         }
      }
  addEfectsOfItem(item) {
         if(item != null)
         {
            item.getPrimaryModifier().affect(this.stats);
            item.getSecondaryModifier().affect(this.stats);
            this.stats.onChange.emit();
         }
      }
  clear() {
         this.stats = null;
      }
}
StatsEffectGuardian.prototype.stats = null;
bindMethods(StatsEffectGuardian);
