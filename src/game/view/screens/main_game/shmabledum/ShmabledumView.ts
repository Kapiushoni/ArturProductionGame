import { Timer, TimerEvent, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Random } from '@/game/cb/utils/Random';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { app } from '@/game/app';
import { Util } from '@/game/util/Util';
import { ShmabledumPopUp } from '@/game/view/screens/main_game/shmabledum/ShmabledumPopUp';
import type { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import type { Locker } from '@/game/util/Locker';
import type { ShmabledumFeeling } from '@/game/main_game/shmabledum/ShmabledumFeeling';
import type { ShmabledumInteraction } from '@/game/main_game/shmabledum/ShmabledumInteraction';
import type { MouseEvent } from '@/flash/as3';
import type { MovieClip } from '@/flash/as3';

export class ShmabledumView {
  bg: MovieClip = null;
  popUp: ShmabledumPopUp = null;
  timer: Timer = null;
  tips: any = null;
  constructor() {
    app.game.getShmabledum().onInteraction.add(this.interact);
    app.game.getShmabledum().getLocker().onLock.add(this.changeInLock);
    this.popUp = new ShmabledumPopUp();
    this.popUp.onCancel.add(this.hideTip);
    this.tips = new Array();
    this.timer = new Timer(2000, 1);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.hideTip);
  }
  initialize(bg: MovieClip) {
    this.bg = bg;
    this.popUp.addIn(app.tutorialHolder);
    bg.gotoAndPlay('idleFront');
    Util.addMouseEvents(this.hitbox, this.click);
    this.changeInLock(app.game.getShmabledum().getLocker());
  }
  get hitbox() {
    return this.bg.hitbox;
  }
  changeInLock(locker: Locker) {
    if (locker.isLocked) {
      if (this.tips.length != 0) {
        this.hideTip();
      }
      this.hitbox.buttonMode = false;
    } else {
      this.hitbox.buttonMode = true;
    }
  }
  click(event: MouseEvent) {
    if (this.tips.length != 0) {
      this.hideTip();
    }
    if (this.tips.length == 0) {
      app.game.getShmabledum().giveSomeTip();
    }
  }
  interact(shmabledumInteraction: ShmabledumInteraction) {
    shmabledumInteraction.make(this);
  }
  expressFeeling(shmabledumFeeling: ShmabledumFeeling, callback: Function = null) {
    this.bg.gotoAndPlay(shmabledumFeeling.feeling);
    if (callback != null) {
      new SmartMC(this.bg).trigger(new EndCurrentLabel(this.bg), Functor.wrap(callback));
    }
  }
  sayTip(bubbleGumTip: BubbleGumTip) {
    if (this.tips.length == 0) {
      this.tips.push(bubbleGumTip);
      this.showTipNow();
    }
  }
  showTipNow() {
    if (this.tips.length == 0) {
      return;
    }
    const bubbleGumTip = this.tips[0];
    this.popUp.refreshTip(bubbleGumTip);
    this.popUp.show();
    this.bg.gotoAndPlay('talk_' + Random.nextRange(1, 2));
    this.timer.delay = bubbleGumTip.getTime();
    this.timer.start();
  }
  hideTip(...rest) {
    this.timer.reset();
    this.tips.shift();
    this.popUp.hide(this.showTipNow);
  }
  clear() {
    app.game.getShmabledum().onInteraction.remove(this.interact);
    app.game.getShmabledum().getLocker().onLock.remove(this.changeInLock);
    Util.removeMouseEvents(this.bg, this.click);
    this.bg.stop();
    this.bg = null;
    this.popUp.clear();
    this.popUp = null;
    this.timer.stop();
    this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.hideTip);
    this.timer = null;
  }
}
bindMethods(ShmabledumView);
