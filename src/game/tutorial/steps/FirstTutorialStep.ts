import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';
import type { Tutorial } from '@/game/tutorial/Tutorial';

/** Step 1: equip the sword (the window closes when a weapon is put in the weapon slot). */
export class FirstTutorialStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  enter() {
    main.game.getJinn().gear.weapon.onChange.add(this.weaponChange);
    super.enter();
  }
  weaponChange(change: SlotChange) {
    if (change.getNewItem() != null) {
      this.theView.leave();
    }
  }
  setText(clip: any) {
    clip.title.title.text = main.locale.get('tutorialSwordTitle');
    clip.text.text.text = main.locale.get('tutorialSword');
  }
  leave() {
    main.game.getJinn().gear.weapon.onChange.remove(this.weaponChange);
    super.leave();
  }
  clear() {
    super.clear();
    main.game.getJinn().gear.weapon.onChange.remove(this.weaponChange);
  }
}
bindMethods(FirstTutorialStep);
