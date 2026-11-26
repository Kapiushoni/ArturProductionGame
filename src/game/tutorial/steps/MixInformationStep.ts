// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';

export class MixInformationStep extends TutorialStep {
  constructor(num, tutorial) {
          super(num.toString(),tutorial,num,"assets.Tutorial" + num.toString()); num = uint(num);
      }
  createView(text) {
         return new TutorialViewWithOk(main.swfLoader.getClass(text));
      }
  setText(clip) {
         clip.title.title.text = main.locale.get("tutorialMixTitle");
         clip.text.text.text = main.locale.get("tutorialMix2");
      }
  get inventory() {
         return main.game.getInventory();
      }
  enter() {
         var i = uint(0);
         while(i < Inventory.SLOTS)
         {
            this.inventory.getSlot(i).onChange.add(this.checkForEnoughItems);
            i++;
         }
         this.checkForEnoughItems();
      }
  checkForEnoughItems(slotChange = null) { const __self = this;
         var i = uint(0);
         if(this.inventory.fullSlots >= 2)
         {
            i = uint(0);
            while(i < Inventory.SLOTS)
            {
               this.inventory.getSlot(i).onChange.remove(this.checkForEnoughItems);
               i++;
            }
            __self.tut.enableMix();
            super.enter();
         }
         return false;
      }
}
bindMethods(MixInformationStep);
