// @ts-nocheck
import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { PopUp } from '@/game/view/popUp/PopUp';
import { main } from '@/game/main';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';

export class ItemPopUp extends PopUp {
  static LEFT = "Left";
  static RIGHT = "Right";
  declare item: any;
  constructor(text = "Left") {
         var clip = as3as(main.swfLoader.getObject("assets.ItemInformation" + text), MovieClip);
          super(clip);
         this.item = null;
      }
  refreshItem(item) {
         this.item = item;
         if(item)
         {
            this.refreshInfo(item);
         }
      }
  refreshInfo(item) { const __self = this;
         __self.mc.container.title.title.text = item.getNameToShow();
         var maxMod = int(item.getMaxMod());
         item.getPrimaryModifier().modifyIcon(__self.mc.container.armor_icon_1);
         item.getPrimaryModifier().modifyValue(__self.mc.container.numbers_1.title,maxMod);
         item.getSecondaryModifier().modifyIcon(__self.mc.container.armor_icon_2);
         maxMod = int(Math.round(maxMod * MixStrategy.mixConfig.secondModMaxPercent / 100));
         item.getSecondaryModifier().modifyValue(__self.mc.container.numbers_2.title,maxMod);
      }
  hide(callback = null) {
         if(this.item)
         {
            super.hide();
         }
         else if(callback != null)
         {
            callback();
         }
      }
  show(callback = null) {
         if(this.item)
         {
            super.show();
         }
         else if(callback != null)
         {
            callback();
         }
      }
  clear() {
         this.item = null;
         super.clear();
      }
}
ItemPopUp.prototype.item = null;
bindMethods(ItemPopUp);
