// @ts-nocheck
import { MovieClip, as3as, bindMethods } from '@/flash/as3';
import { FighterView } from '@/game/view/figthers/FighterView';
import { DragListener } from '@/game/drag_and_drop/DragListener';
import { main } from '@/game/main';
import { Jinn } from '@/game/main_game/character/Jinn';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { JinnSoundManager } from '@/game/sound/JinnSoundManager';
import { PotionEffect } from '@/game/view/effect/PotionEffect';

export class JinnView extends FighterView {
  declare mc: any;
  declare dragger: any;
  constructor(jinn) {
          super(jinn);
         this.createMc();
         this.dragger = new DragListener(this.mc,jinn.liver);
         this.jinn.onPotionConsumition.add(this.consumePotion);
      }
  get jinn() { const __self = this;
         return as3as(__self.getFighter(), Jinn);
      }
  setSoundManager() {
         this.soundManager = new JinnSoundManager(this.jinn);
      }
  consumePotion(item) {
         new PotionEffect(item,this.mc);
      }
  createMc() {
         var text = "Sword";
         if(this.jinn.gear.weapon.isEmpty())
         {
            text = "Hand";
         }
         this.mc = as3as(main.swfLoader.getObject("assets.Jinn" + text), MovieClip);
         this.setSword(this.mc.sword);
         this.setShield(this.mc.shield);
      }
  setSword(clip) {
         var swordModifier = ItemFactory.getInstance().getSwordModifier(this.jinn.gear.weapon.getContent());
         swordModifier.modify(clip);
      }
  setShield(clip) {
         var shieldModifier = ItemFactory.getInstance().getShieldModifier(this.jinn.gear.shield.getContent());
         shieldModifier.modify(clip);
      }
  playAnimation(fighterAnimation) {
         this.mc.gotoAndPlay(fighterAnimation.getName());
      }
  getMC() {
         return this.mc;
      }
  putIn(displayObjectContainer) {
         displayObjectContainer["jinn"] = this.mc;
         displayObjectContainer.addChild(this.mc);
      }
  set x(value) { value = Number(value);
         this.mc.x = value;
      }
  get x() {
         return Number(this.mc.x);
      }
  set y(value) { value = Number(value);
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
JinnView.prototype.mc = null;
JinnView.prototype.dragger = null;
bindMethods(JinnView);
