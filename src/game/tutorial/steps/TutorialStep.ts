// @ts-nocheck
import { __DEFER, bindMethods, uint } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import { main } from '@/game/main';
import { TutorialView } from '@/game/tutorial/view/TutorialView';

export class TutorialStep extends BasicState {
  declare step: any;
  declare tut: any;
  declare theView: any;
  constructor(text, tut, step, text2) {super(__DEFER); 
         this.step = uint(step);
         this.tut = tut;
         this.theView = this.createView(text2);
         this.theView.onEnd.add(this.endStep);
          this.__init_BasicState(text); step = uint(step);
      }
  enter() {
         this.showView();
         super.enter();
      }
  createView(text) {
         return new TutorialView(main.swfLoader.getClass(text));
      }
  showView() {
         main.game.getShmabledum().getLocker().lock();
         main.tutorialHolder.addChild(this.theView);
         this.theView.enter();
         this.setText(this.theView.getBg());
      }
  setText(clip) {
      }
  endStep() {
         this.tut.next();
      }
  leave() {
         main.game.getShmabledum().getLocker().unlock();
         main.saveSystem.onTutorialComplete(this.step);
      }
  clear() {
         super.clear();
         this.theView.clear();
         this.tut = null;
         this.theView = null;
      }
}
TutorialStep.prototype.step = 0;
TutorialStep.prototype.tut = null;
TutorialStep.prototype.theView = null;
bindMethods(TutorialStep);
