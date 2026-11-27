import { Timer, TimerEvent, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Random } from '@/game/cb/utils/Random';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { Util } from '@/game/util/Util';
import { ShmabledumPopUp } from '@/game/view/screens/main_game/shmabledum/ShmabledumPopUp';

export class ShmabledumView {
  bg: any = null;
  popUp: any = null;
  timer: any = null;
  tips: any = null;
  constructor() {
    main.game.getShmabledum().onInteraction.add(this.interact);
    main.game.getShmabledum().getLocker().onLock.add(this.changeInLock);
    this.popUp = new ShmabledumPopUp();
    this.popUp.onCancel.add(this.hideTip);
    this.tips = new Array();
    this.timer = new Timer(2000, 1);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.hideTip);
  }
  initialize(bg) {
    this.bg = bg;
    this.popUp.addIn(main.tutorialHolder);
    bg.gotoAndPlay('idleFront');
    Util.addMouseEvents(this.hitbox, this.click);
    this.changeInLock(main.game.getShmabledum().getLocker());
  }
  get hitbox() {
    return this.bg.hitbox;
  }
  changeInLock(locker) {
    if (locker.isLocked) {
      if (this.tips.length != 0) {
        this.hideTip();
      }
      this.hitbox.buttonMode = false;
    } else {
      this.hitbox.buttonMode = true;
    }
  }
  click(event) {
    if (this.tips.length != 0) {
      this.hideTip();
    }
    if (this.tips.length == 0) {
      main.game.getShmabledum().giveSomeTip();
    }
  }
  interact(shmabledumInteraction) {
    shmabledumInteraction.make(this);
  }
  expressFeeling(shmabledumFeeling, callback = null) {
    this.bg.gotoAndPlay(shmabledumFeeling.feeling);
    if (callback != null) {
      new SmartMC(this.bg).trigger(new EndCurrentLabel(this.bg), Functor.wrap(callback));
    }
  }
  sayTip(bubbleGumTip) {
    if (this.tips.length == 0) {
      this.tips.push(bubbleGumTip);
      this.showTipNow();
    }
  }
  showTipNow() {
    if (this.tips.length == 0) {
      return;
    }
    var bubbleGumTip = this.tips[0];
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
    main.game.getShmabledum().onInteraction.remove(this.interact);
    main.game.getShmabledum().getLocker().onLock.remove(this.changeInLock);
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
