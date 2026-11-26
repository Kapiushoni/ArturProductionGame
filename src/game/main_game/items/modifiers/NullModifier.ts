// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Util } from '@/game/util/Util';

export class NullModifier {
  constructor() {
         
      }
  modifyIcon(clip) {
         var mc = clip;
         try
         {
            mc.gotoAndStop("none");
         }
         catch(a)
         {
            mc.visible = false;
            Util.recursiveStop(mc);
         }
      }
  modifyValue(textField, num) { num = int(num);
         textField.text = "";
      }
  affect(stats) {
      }
  disaffect(stats) {
      }
  getValue() {
         return Number(0);
      }
  getCategory() {
         return int(StatType.NULL);
      }
  isInstant() {
         return true;
      }
  clear() {
      }
  toObject() {
         return {
            "Category":null,
            "Value":null
         };
      }
}
bindMethods(NullModifier);
