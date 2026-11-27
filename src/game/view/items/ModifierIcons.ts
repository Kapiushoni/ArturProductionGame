import { bindMethods, int } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { HealthModifier } from '@/game/main_game/items/modifiers/HealthModifier';
import { MaxHealthModifier } from '@/game/main_game/items/modifiers/MaxHealthModifier';
import { NullModifier } from '@/game/main_game/items/modifiers/NullModifier';
import { Util } from '@/game/util/Util';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';

/**
 * How item modifiers look (moved here from the modifiers and StatType: the game logic does not touch clips).
 * Icon clips have one frame per stat: luck, attack, defence, health, max_health, none.
 */
export class ModifierIcons {
  /** the icon clip shows the stat */
  static setStatIcon(clip: any, type: number) {
    switch (int(type)) {
      case StatType.LUCK:
        clip.gotoAndStop('luck');
        break;
      case StatType.DEFENSE:
        clip.gotoAndStop('defence');
        break;
      case StatType.ATTACK:
        clip.gotoAndStop('attack');
        break;
      case StatType.HEALTH:
        clip.gotoAndStop('health');
        break;
      case StatType.MAX_HP:
        clip.gotoAndStop('max_health');
    }
  }
  /** the icon of a modifier (hidden for no modifier; max health with an up / down arrow) */
  static show(modifier: IModifier, clip: any) {
    if (modifier instanceof NullModifier) {
      try {
        clip.gotoAndStop('none');
      } catch (e) {
        clip.visible = false;
        Util.recursiveStop(clip);
      }
      return;
    }
    clip.visible = true;
    if (modifier instanceof HealthModifier) {
      clip.gotoAndStop('health');
      return;
    }
    ModifierIcons.setStatIcon(clip, modifier.getCategory());
    if (modifier instanceof MaxHealthModifier && clip.max_health) {
      clip.max_health.gotoAndStop(modifier.getValue() >= 0 ? 'up' : 'down');
    }
  }
  /** "value / max" in a text field (empty for no modifier) */
  static showValue(modifier: IModifier, textField: any, max: number) {
    if (modifier instanceof NullModifier) {
      textField.text = '';
      return;
    }
    textField.text = main.locale.get('popUpValue', [modifier.getValue().toString(), int(max).toString()]);
  }
}
bindMethods(ModifierIcons);
