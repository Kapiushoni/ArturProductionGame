import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { PopUp } from '@/game/view/popUp/PopUp';
import { main } from '@/game/main';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import type { Item } from '@/game/main_game/items/Item';

export class ItemPopUp extends PopUp {
  static LEFT = 'Left';
  static RIGHT = 'Right';
  declare item: any;
  constructor(text: string = 'Left') {
    var clip = as3as(main.swfLoader.getObject('assets.ItemInformation' + text), MovieClip);
    super(clip);
    this.item = null;
  }
  refreshItem(item: Item) {
    this.item = item;
    if (item) {
      this.refreshInfo(item);
    }
  }
  refreshInfo(item: Item) {
    this.mc.container.title.title.text = item.getNameToShow();
    var maxMod = int(item.getMaxMod());
    ModifierIcons.show(item.getPrimaryModifier(), this.mc.container.armor_icon_1);
    ModifierIcons.showValue(item.getPrimaryModifier(), this.mc.container.numbers_1.title, maxMod);
    ModifierIcons.show(item.getSecondaryModifier(), this.mc.container.armor_icon_2);
    maxMod = int(Math.round((maxMod * MixStrategy.mixConfig.secondModMaxPercent) / 100));
    ModifierIcons.showValue(item.getSecondaryModifier(), this.mc.container.numbers_2.title, maxMod);
  }
  hide(callback: Function = null) {
    if (this.item) {
      super.hide();
    } else if (callback != null) {
      callback();
    }
  }
  show(callback: Function = null) {
    if (this.item) {
      super.show();
    } else if (callback != null) {
      callback();
    }
  }
  clear() {
    this.item = null;
    super.clear();
  }
}
// Defaults on the prototype, not field initializers: the PopUp constructor runs first and may use them,
// and an initializer (run after the base constructor) would overwrite them.
ItemPopUp.prototype.item = null;
bindMethods(ItemPopUp);
