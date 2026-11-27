import { Dictionary, bindMethods } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import { Util } from '@/game/util/Util';
import type { Sprite } from '@/flash/as3';

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
    return app.swfLoader.getClass('assets.loading');
  }
  start(sprite: Sprite) {
    sprite.addChild(this);
    this.enter(this.startWaiting);
    app.soundManager.playFx(GameSounds.TRANSITION_IN);
  }
  startWaiting() {
    this.onStart();
    this.bg.gotoAndPlay('idle');
    app.theLoader.onLoad.add(this.waitingForResources);
    this.waitingForResources();
  }
  waitingForResources() {
    if (!Util.areLoaded(this.resources, app.theLoader)) {
      return;
    }
    app.theLoader.onLoad.remove(this.waitingForResources);
    this.onFinish();
    this.leave();
  }
  leave(callback: Function = null) {
    const end = callback;
    app.soundManager.playFx(GameSounds.TRANSITION_OUT);
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
bindMethods(TransitionWindow, ['start', 'startWaiting', 'waitingForResources', 'leave', 'clear']);
