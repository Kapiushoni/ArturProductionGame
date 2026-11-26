// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class Modifier {
  declare characteristic: any;
  declare value: any;
  constructor(obj) {
         
         this.characteristic = int(StatType.parse(obj.Category));
         this.value = Number(obj.Value);
      }
  modifyIcon(clip) {
         clip.visible = true;
         StatType.setMcIcon(clip,this.characteristic);
      }
  modifyValue(textField, num) { num = int(num);
         textField.text = main.locale.get("popUpValue",[this.value.toString(),num.toString()]);
      }
  affect(stats) {
         var stat = this.getStat(stats);
         stat.modifyValue(this.value);
      }
  disaffect(stats) {
         var stat = this.getStat(stats);
         stat.modifyValue(-this.value);
      }
  getStat(stats) {
         return stats.getStat(this.characteristic);
      }
  getValue() {
         return Number(this.value);
      }
  getCategory() {
         return int(this.characteristic);
      }
  isInstant() {
         return false;
      }
  clear() {
      }
  toObject() {
         return {
            "Category":StatType.toString(this.characteristic),
            "Value":this.value
         };
      }
}
Modifier.prototype.characteristic = 0;
Modifier.prototype.value = NaN;
bindMethods(Modifier);
