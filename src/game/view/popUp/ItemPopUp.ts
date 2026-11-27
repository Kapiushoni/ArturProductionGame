import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { PopUp } from '@/game/view/popUp/PopUp';
import { app } from '@/game/app';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import type { Item } from '@/game/main_game/items/Item';

export class ItemPopUp extends PopUp {
  static LEFT = 'Left';
  static RIGHT = 'Right';
  declare item: Item;
  constructor(text: string = 'Left') {
    const clip = as3as(app.swfLoader.getObject('assets.ItemInformation' + text), MovieClip);
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
    let maxMod = int(item.maxMod);
    ModifierIcons.show(item.primaryModifier, this.mc.container.armor_icon_1);
    ModifierIcons.showValue(item.primaryModifier, this.mc.container.numbers_1.title, maxMod);
    ModifierIcons.show(item.secondaryModifier, this.mc.container.armor_icon_2);
    maxMod = int(Math.round((maxMod * MixStrategy.mixConfig.secondModMaxPercent) / 100));
    ModifierIcons.showValue(item.secondaryModifier, this.mc.container.numbers_2.title, maxMod);
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
bindMethods(ItemPopUp, ['hide', 'show', 'clear']);
