import { MovieClip, Timer, TimerEvent, as3as, bindMethods } from '@/flash/as3';
import { ModifierIcons } from '@/game/view/items/ModifierIcons';
import { main } from '@/game/main';
import { StatType } from '@/game/main_game/character/stats/StatType';
import type { IModifier } from '@/game/main_game/items/modifiers/IModifier';
import type { Item } from '@/game/main_game/items/Item';

export class PotionEffect {
  primaryEffect: any = null;
  secondaryEffect: any = null;
  timer: any = null;
  constructor(item: Item, clip: any) {
    this.primaryEffect = this.addPotionEffect(item.primaryModifier, clip);
    this.secondaryEffect = this.addPotionEffect(item.secondaryModifier, clip, -9, 7);
    this.timer = new Timer(2000, 1);
    this.timer.addEventListener(TimerEvent.TIMER_COMPLETE, this.endTimer);
    this.timer.start();
  }
  addPotionEffect(modifier: IModifier, holder: any, dx: number = 0, dy: number = 0) {
    dx = Number(dx);
    dy = Number(dy);
    if (modifier.getCategory() == StatType.NULL) {
      return null;
    }
    const feedback = as3as(main.swfLoader.getObject('assets.potionFeedback'), MovieClip);
    feedback.x += dx;
    feedback.y += dy;
    feedback.mouseEnabled = false;
    feedback.mouseChildren = false;
    ModifierIcons.show(modifier, feedback);
    holder.addChild(feedback);
    return feedback;
  }
  endTimer(event: any) {
    this.timer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.endTimer);
    this.timer.stop();
    this.timer = null;
    this.clear();
  }
  removeFromParent(clip: any) {
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
  set x(value: number) {
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
  set y(value: number) {
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
  set scaleX(value: number) {
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
  set scaleY(value: number) {
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
