import { MouseEvent, as3as, bindMethods } from '@/flash/as3';
import { TutorialStep } from '@/game/tutorial/steps/TutorialStep';
import { app } from '@/game/app';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';
import { GameView } from '@/game/view/screens/main_game/GameView';
import type { Tutorial } from '@/game/tutorial/Tutorial';
import type { MovieClip } from '@/flash/as3';

/** Step 4: when the win window opens, "take all the loot"; closes when the loot button is clicked. */
export class TakeAllStep extends TutorialStep {
  private listeningClick = false;

  constructor(step: number, tutorial: Tutorial) {
    super(step.toString(), tutorial, step, 'assets.Tutorial' + step.toString());
  }
  enter() {
    WinWindow.onShow = this.wonDungeon;
  }
  get winWindow(): WinWindow {
    return as3as(app.gameHolder.gameView, GameView).pauseHolder['window'];
  }
  wonDungeon() {
    this.winWindow.lootMcButton.addEventListener(MouseEvent.CLICK, this.loot);
    this.listeningClick = true;
    super.enter();
  }
  loot(_event: MouseEvent) {
    this.stopListening();
    this.theView.leave();
  }
  leave() {
    WinWindow.onShow = null;
    this.stopListening();
    super.leave();
  }
  setText(clip: MovieClip) {
    clip.text.text.text = app.locale.get('tutorialTakeAll');
  }
  stopListening() {
    if (this.listeningClick) {
      this.winWindow.lootMcButton.removeEventListener(MouseEvent.CLICK, this.loot);
      this.listeningClick = false;
    }
  }
  clear() {
    this.stopListening();
    WinWindow.onShow = null;
    super.clear();
  }
}
bindMethods(TakeAllStep);
