import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { FighterView } from '@/game/view/figthers/FighterView';
import { DragListener } from '@/game/drag_and_drop/DragListener';
import { app } from '@/game/app';
import { Jinn } from '@/game/main_game/character/Jinn';
import { ItemViews } from '@/game/view/items/ItemViews';
import { JinnSoundManager } from '@/game/sound/JinnSoundManager';
import { PotionEffect } from '@/game/view/effect/PotionEffect';
import type { IFighterAnimation } from '@/game/view/figthers/animations/IFighterAnimation';
import type { Item } from '@/game/main_game/items/Item';
import type { DisplayObjectContainer } from '@/flash/as3';

export class JinnView extends FighterView {
  declare mc: MovieClip;
  declare dragger: DragListener;
  constructor(jinn: Jinn) {
    super(jinn);
    this.createMc();
    this.dragger = new DragListener(this.mc, jinn.liver);
    this.jinn.onPotionConsumition.add(this.consumePotion);
  }
  get jinn() {
    return as3as(this.fighter, Jinn);
  }
  setSoundManager() {
    this.soundManager = new JinnSoundManager(this.jinn);
  }
  consumePotion(item: Item) {
    new PotionEffect(item, this.mc);
  }
  createMc() {
    let text = 'Sword';
    if (this.jinn.gear.weapon.isEmpty()) {
      text = 'Hand';
    }
    this.mc = as3as(app.swfLoader.getObject('assets.Jinn' + text), MovieClip);
    this.setSword(this.mc.sword);
    this.setShield(this.mc.shield);
  }
  setSword(clip: MovieClip) {
    const swordModifier = ItemViews.swordModifier(this.jinn.gear.weapon.getContent());
    swordModifier.modify(clip);
  }
  setShield(clip: MovieClip) {
    const shieldModifier = ItemViews.shieldModifier(this.jinn.gear.shield.getContent());
    shieldModifier.modify(clip);
  }
  playAnimation(fighterAnimation: IFighterAnimation) {
    this.mc.gotoAndPlay(fighterAnimation.getName());
  }
  getMC() {
    return this.mc;
  }
  putIn(displayObjectContainer: DisplayObjectContainer) {
    displayObjectContainer['jinn'] = this.mc;
    displayObjectContainer.addChild(this.mc);
  }
  set x(value: number) {
    value = Number(value);
    this.mc.x = value;
  }
  get x() {
    return Number(this.mc.x);
  }
  set y(value: number) {
    value = Number(value);
    this.mc.y = value;
  }
  get y() {
    return Number(this.mc.y);
  }
  clear() {
    this.pop();
    this.dragger.clear();
    super.clear();
  }
  pop() {
    this.mc.parent.removeChild(this.mc);
  }
}
// Defaults on the prototype, not field initializers: the FighterView constructor calls overridden methods that may set them,
// and an initializer (run after the base constructor) would overwrite them.
JinnView.prototype.mc = null;
JinnView.prototype.dragger = null;
bindMethods(JinnView);
