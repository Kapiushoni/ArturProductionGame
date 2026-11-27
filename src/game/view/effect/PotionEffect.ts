import { MovieClip, Timer, TimerEvent, as3as, bindMethods } from '@/flash/as3';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';

export class PotionEffect {
  primaryEffect: any = null;
  secondaryEffect: any = null;
  timer: any = null;
  constructor(item, clip) {
    this.primaryEffect = this.addPotionEffect(item.getPrimaryModifier(), clip);
    this.secondaryEffect = this.addPotionEffect(item.getSecondaryModifier(), clip, -9, 7);
    this.timer = new Timer(2000, 1);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.endTimer);
    this.timer.start();
  }
  addPotionEffect(modifier, holder, dx = 0, dy = 0) {
    dx = Number(dx);
    dy = Number(dy);
    if (modifier.getCategory() == StatType.NULL) {
      return null;
    }
    var feedback = as3as(main.swfLoader.getObject('assets.potionFeedback'), MovieClip);
    feedback.x += dx;
    feedback.y += dy;
    feedback.mouseEnabled = false;
    feedback.mouseChildren = false;
    modifier.modifyIcon(feedback);
    holder.addChild(feedback);
    return feedback;
  }
  endTimer(event) {
    this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.endTimer);
    this.timer.stop();
    this.timer = null;
    this.clear();
  }
  removeFromParent(clip) {
    if (Boolean(clip) && Boolean(clip.parent)) {
      clip.parent.removeChild(clip);
    }
  }
  clear() {
    this.removeFromParent(this.primaryEffect);
    this.primaryEffect = null;
    this.removeFromParent(this.secondaryEffect);
    this.secondaryEffect = null;
  }
  get x() {
    if (this.primaryEffect) {
      return Number(this.primaryEffect.x);
    }
    if (this.secondaryEffect) {
      return Number(this.secondaryEffect.x);
    }
    return 0;
  }
  set x(value) {
    value = Number(value);
    if (this.primaryEffect) {
      this.primaryEffect.x = value;
    }
    if (this.secondaryEffect) {
      this.secondaryEffect.x = value;
    }
  }
  get y() {
    if (this.primaryEffect) {
      return Number(this.primaryEffect.y);
    }
    if (this.secondaryEffect) {
      return Number(this.secondaryEffect.y);
    }
    return 0;
  }
  set y(value) {
    value = Number(value);
    if (this.primaryEffect) {
      this.primaryEffect.y = value;
    }
    if (this.secondaryEffect) {
      this.secondaryEffect.y = value;
    }
  }
  get scaleX() {
    if (this.primaryEffect) {
      return Number(this.primaryEffect.scaleX);
    }
    if (this.secondaryEffect) {
      return Number(this.secondaryEffect.scaleX);
    }
    return 0;
  }
  set scaleX(value) {
    value = Number(value);
    if (this.primaryEffect) {
      this.primaryEffect.scaleX = value;
    }
    if (this.secondaryEffect) {
      this.secondaryEffect.scaleX = value;
    }
  }
  get scaleY() {
    if (this.primaryEffect) {
      return Number(this.primaryEffect.scaleY);
    }
    if (this.secondaryEffect) {
      return Number(this.secondaryEffect.scaleY);
    }
    return 0;
  }
  set scaleY(value) {
    value = Number(value);
    if (this.primaryEffect) {
      this.primaryEffect.scaleY = value;
    }
    if (this.secondaryEffect) {
      this.secondaryEffect.scaleY = value;
    }
  }
}
bindMethods(PotionEffect);
