// @ts-nocheck
import { MouseEvent, as3as, bindMethods, uint } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { main } from '@/game/main';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';
import { GameView } from '@/game/view/screens/main_game/GameView';

export class TakeAllStep extends TutorialStep {
  declare listeningClick: any;
  constructor(num, tutorial) {
          super(num.toString(),tutorial,num,"assets.Tutorial" + num.toString()); num = uint(num);
         this.listeningClick = false;
      }
  enter() {
         WinWindow.onShow = this.wonDungeon;
      }
  get winWindow() {
         return (as3as(main.gameHolder.gameView, GameView)).pauseHolder["window"];
      }
  wonDungeon() {
         this.winWindow.lootMcButton.addEventListener(MouseEvent.CLICK,this.loot);
         this.listeningClick = true;
         super.enter();
      }
  loot(event) { const __self = this;
         this.stopListening();
         __self.theView.leave();
      }
  leave() {
         WinWindow.onShow = null;
         this.stopListening();
         super.leave();
      }
  setText(clip) {
         clip.text.text.text = main.locale.get("tutorialTakeAll");
      }
  stopListening() {
         if(this.listeningClick)
         {
            this.winWindow.lootMcButton.removeEventListener(MouseEvent.CLICK,this.loot);
            this.listeningClick = false;
         }
      }
  clear() {
         this.stopListening();
         WinWindow.onShow = null;
         super.clear();
      }
}
TakeAllStep.prototype.listeningClick = false;
bindMethods(TakeAllStep);
