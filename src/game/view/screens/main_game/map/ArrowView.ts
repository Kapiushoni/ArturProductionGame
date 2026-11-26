// @ts-nocheck
import { MouseEvent, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';

export class ArrowView {
  declare mc: any;
  declare showing: any;
  declare click: any;
  constructor(mc, click = null, flag = false) {
         
         this.click = click;
         this.mc = mc;
         this.showing = false;
         if(flag)
         {
            mc.gotoAndStop("arrowOut");
         }
         else
         {
            mc.gotoAndStop("arrowIn");
         }
         mc.buttonMode = true;
         this.initializeButton(mc);
         this.refreshAsButton();
      }
  initializeButton(clip) {
         clip.hitbox.addEventListener(MouseEvent.CLICK,this.onClick,false,0,true);
         clip.hitbox.addEventListener(MouseEvent.ROLL_OVER,this.over,false,0,true);
         clip.hitbox.addEventListener(MouseEvent.ROLL_OUT,this.out,false,0,true);
      }
  onClick(event) {
         main.soundManager.playFx(GameSounds.BUTTON_CLICK);
         this.click();
      }
  over(event) {
         if(this.showing)
         {
            this.mc.gotoAndPlay("mouseOver");
            main.soundManager.playFx(GameSounds.MOUSE_OVER);
         }
      }
  out(event) {
         if(this.showing)
         {
            this.mc.gotoAndPlay("mouseOut");
            main.soundManager.playFx(GameSounds.MOUSE_OVER);
         }
      }
  hide() {
         if(this.showing)
         {
            this.showing = false;
            this.refreshAsButton();
            this.mc.gotoAndPlay("arrowOut");
         }
      }
  show() {
         if(!this.showing)
         {
            this.showing = true;
            this.mc.gotoAndPlay("arrowIn");
            new SmartMC(this.mc).trigger(new EndCurrentLabel(this.mc),Functor.wrap(this.refreshAsButton));
         }
      }
  refreshAsButton() {
         this.mc.mouseEnabled = this.showing;
         this.mc.mouseChildren = this.showing;
      }
  clear() {
         this.mc = null;
         this.click = null;
      }
}
ArrowView.prototype.mc = null;
ArrowView.prototype.showing = false;
ArrowView.prototype.click = null;
bindMethods(ArrowView);
