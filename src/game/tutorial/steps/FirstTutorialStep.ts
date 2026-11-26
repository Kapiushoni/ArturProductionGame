// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';

export class FirstTutorialStep extends TutorialStep {
  constructor(num, tutorial) {
          super(num.toString(),tutorial,num,"assets.Tutorial" + num.toString()); num = uint(num);
      }
  enter() {
         main.game.getJinn().gear.weapon.onChange.add(this.weaponChange);
         super.enter();
      }
  weaponChange(slotChange) { const __self = this;
         if(slotChange.getNewItem() != null)
         {
            __self.theView.leave();
         }
      }
  setText(clip) {
         clip.title.title.text = main.locale.get("tutorialSwordTitle");
         clip.text.text.text = main.locale.get("tutorialSword");
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
