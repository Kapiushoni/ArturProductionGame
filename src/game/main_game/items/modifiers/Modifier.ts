import { bindMethods, int } from '@/flash/as3';
import { services } from '@/game/services';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';

/** Adds `value` to one stat while the item is equipped. Config: { Category: "A" | "D" | "L" | ..., Value }. */
export class Modifier implements IModifier {
  protected characteristic: number;
  protected value: number;

  constructor(config: { Category: string; Value: any }) {
    this.characteristic = int(StatType.parse(config.Category));
    this.value = Number(config.Value);
  }
  modifyIcon(clip: any) {
    clip.visible = true;
    StatType.setMcIcon(clip, this.characteristic);
  }
  modifyValue(textField: any, num: number) {
    textField.text = services.texts.get('popUpValue', [this.value.toString(), int(num).toString()]);
  }
  affect(stats: any) {
    this.getStat(stats).modifyValue(this.value);
  }
  disaffect(stats: any) {
    this.getStat(stats).modifyValue(-this.value);
  }
  getStat(stats: any): any {
    return stats.getStat(this.characteristic);
  }
  getValue(): number {
    return this.value;
  }
  getCategory(): number {
    return this.characteristic;
  }
  isInstant(): boolean {
    return false;
  }
  clear() {}
  toObject() {
    return {
      Category: StatType.toString(this.characteristic),
      Value: this.value,
    };
  }
}
bindMethods(Modifier);
