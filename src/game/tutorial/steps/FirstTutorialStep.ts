import { bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { app } from '@/game/app';
import type { SlotChange } from '@/game/main_game/item_containers/SlotChange';
import type { Tutorial } from '@/game/tutorial/Tutorial';
import type { MovieClip } from '@/flash/as3';

/** Step 1: equip the sword (the window closes when a weapon is put in the weapon slot). */
export class FirstTutorialStep extends TutorialStep {
  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  enter() {
    app.game.getJinn().gear.weapon.onChange.add(this.weaponChange);
    super.enter();
  }
  weaponChange(change: SlotChange) {
    if (change.getNewItem() != null) {
      this.theView.leave();
    }
  }
  setText(clip: MovieClip) {
    clip.title.title.text = app.locale.get('tutorialSwordTitle');
    clip.text.text.text = app.locale.get('tutorialSword');
  }
  leave() {
    app.game.getJinn().gear.weapon.onChange.remove(this.weaponChange);
    super.leave();
  }
  clear() {
    super.clear();
    app.game.getJinn().gear.weapon.onChange.remove(this.weaponChange);
  }
}
bindMethods(FirstTutorialStep);
