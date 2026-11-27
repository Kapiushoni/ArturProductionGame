import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { app } from '@/game/app';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';
import type { Tutorial } from '@/game/tutorial/Tutorial';
import type { MovieClip } from '@/flash/as3';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';

/** Step 5: once the inventory holds 2 items, the mixer is enabled and explained (closed with OK). */
export class MixInformationStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  createView(viewClass: string): TutorialViewWithOk {
    return new TutorialViewWithOk(app.swfLoader.getClass(viewClass));
  }
  setText(clip: MovieClip) {
    clip.title.title.text = app.locale.get('tutorialMixTitle');
    clip.text.text.text = app.locale.get('tutorialMix2');
  }
  get inventory(): Inventory {
    return app.game.getInventory();
  }
  enter() {
    for (let i = 0; i < Inventory.SLOTS; i++) {
      this.inventory.getSlot(i).onChange.add(this.checkForEnoughItems);
    }
    this.checkForEnoughItems();
  }
  checkForEnoughItems(_change: SlotChange = null): boolean {
    if (this.inventory.fullSlots >= 2) {
      for (let i = 0; i < Inventory.SLOTS; i++) {
        this.inventory.getSlot(i).onChange.remove(this.checkForEnoughItems);
      }
      this.tut.enableMix();
      super.enter();
    }
    return false;
  }
}
bindMethods(MixInformationStep);
