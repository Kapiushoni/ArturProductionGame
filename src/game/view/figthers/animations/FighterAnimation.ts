import { bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { AnimationLabelAt } from '@/game/cb/conditions/AnimationLabelAt';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { Or } from '@/game/conditions/Or';
import type { Element } from '@/game/main_game/element/Element';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';

/**
 * Plays the label `name` of the fighter clip until "end_animation" (or the last frame), then atFinish(this).
 */
export class FighterAnimation implements IFighterAnimation {
  atFinish: Signal;
  /** label of the fighter clip */
  protected name: string;
  protected current_mc: any = null;
  protected current_smc: SmartMC = null;

  constructor(name: string) {
    this.name = name;
    this.atFinish = new Signal();
  }
  forceKill(): boolean {
    return false;
  }
  getName(): string {
    return this.name;
  }
  make(fighterView: any) {
    fighterView.playAnimation(this);
    this.current_mc = fighterView.getMC();
    this.current_smc = new SmartMC(this.current_mc);
    this.current_smc.trigger(
      new Or(new AnimationLabelAt('end_animation'), new EndAnimation()),
      new Functor(this.finish),
    );
  }
  finish(_clip: any) {
    this.clearMc();
    this.atFinish.emit(this);
    this.atFinish.clear();
  }
  /** the element look of the "fx" child of the clip (fire / ice / normal) */
  setEffect(clip: any, element: Element = null) {
    if (clip.fx) {
      let look = 'normal';
      if (element && element.isOfFire) {
        look = 'fire';
      } else if (element && element.isOfIce) {
        look = 'ice';
      }
      clip.fx.gotoAndStop(look);
    }
  }
  pause() {
    this.current_mc.stop();
  }
  resume() {
    this.current_mc.play();
  }
  clearMc() {
    if (this.current_smc != null) {
      this.current_smc.clear();
    }
    this.current_smc = null;
    if (this.current_mc != null) {
      this.current_mc.stop();
    }
    this.current_mc = null;
  }
  kill() {
    this.clearMc();
    this.atFinish.clear();
  }
  mustGoToIdle(): boolean {
    return true;
  }
}
bindMethods(FighterAnimation);
