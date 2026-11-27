import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { TutorialViewWithOk } from '@/game/tutorial/view/TutorialViewWithOk';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/** Step 5: once the inventory holds 2 items, the mixer is enabled and explained (closed with OK). */
export class MixInformationStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  createView(viewClass: string): TutorialViewWithOk {
    return new TutorialViewWithOk(main.swfLoader.getClass(viewClass));
  }
  setText(clip: any) {
    clip.title.title.text = main.locale.get('tutorialMixTitle');
    clip.text.text.text = main.locale.get('tutorialMix2');
  }
  get inventory(): Inventory {
    return main.game.getInventory();
  }
  enter() {
    for (let i = 0; i < Inventory.SLOTS; i++) {
      this.inventory.getSlot(i).onChange.add(this.checkForEnoughItems);
    }
    this.checkForEnoughItems();
  }
  checkForEnoughItems(_change: any = null): boolean {
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
