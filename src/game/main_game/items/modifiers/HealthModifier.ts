// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Modifier } from '@/game/main_game/items/modifiers/Modifier';
import { assert } from '@/game/assert';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class HealthModifier extends Modifier {
  constructor(obj) {
          super(obj);
         assert(this.characteristic == StatType.HEALTH,"Health must be health");
      }
  modifyIcon(clip) {
         clip.visible = true;
         clip.gotoAndStop("health");
      }
  affect(stats) {
         super.affect(stats);
      }
  disaffect(stats) {
      }
  isInstant() {
         return false;
      }
}
bindMethods(HealthModifier);
