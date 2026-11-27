import { Dictionary, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { Util } from '@/game/util/Util';

export class TransitionWindow extends AnimatedScreen {
  resources: any = null;
  onFinish: any = null;
  onStart: any = null;
  constructor(resources: any[], onStart: Function, onFinish: Function = null) {
    super();
    this.initAnimatedScreen(this.assetClass, new Dictionary(), 'start', 'end');
    this.resources = resources;
    if (onFinish == null) {
      onFinish = Util.pass();
    }
    this.onFinish = onFinish;
    this.onStart = onStart;
  }
  get assetClass() {
    return main.swfLoader.getClass('assets.loading');
  }
  start(sprite: any) {
    sprite.addChild(this);
    this.enter(this.startWaiting);
    main.soundManager.playFx(GameSounds.TRANSITION_IN);
  }
  startWaiting() {
    this.onStart();
    this.bg.gotoAndPlay('idle');
    main.theLoader.onLoad.add(this.waitingForResources);
    this.waitingForResources();
  }
  waitingForResources() {
    if (!Util.areLoaded(this.resources, main.theLoader)) {
      return;
    }
    main.theLoader.onLoad.remove(this.waitingForResources);
    this.onFinish();
    this.leave();
  }
  leave(callback: Function = null) {
    var end = callback;
    main.soundManager.playFx(GameSounds.TRANSITION_OUT);
    super.leave(() => {
      if (end != null) {
        end();
      }
      this.pop();
    });
  }
  clear() {
    this.onStart = null;
    this.onFinish = null;
    this.resources = null;
  }
}
bindMethods(TransitionWindow);
