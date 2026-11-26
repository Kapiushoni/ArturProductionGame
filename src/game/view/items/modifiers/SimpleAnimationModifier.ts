// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { StatType } from '@/game/main_game/character/stats/StatType';
import { Util } from '@/game/util/Util';

export class SimpleAnimationModifier {
  declare mcName: any;
  declare typeModifier: any;
  constructor(mcName, typeModifier) {
         
         this.mcName = mcName;
         this.typeModifier = typeModifier;
      }
  modify(clip) {
         this.setFrame(clip,this.mcName);
         this.setModifier(clip,this.typeModifier);
      }
  setFrame(clip, text) {
         clip.gotoAndStop(this.mcName);
      }
  setModifier(clip, text) {
         this.setIcon(clip.icon,text);
      }
  setIcon(clip, text) {
         var mc = clip;
         var type = text;
         if(type == null)
         {
            try
            {
               mc.gotoAndStop("none");
            }
            catch(a)
            {
               mc.visible = false;
               Util.recursiveStop(mc);
            }
         }
         else
         {
            StatType.setMcIcon(mc,StatType.parse(type));
         }
      }
}
SimpleAnimationModifier.prototype.mcName = null;
SimpleAnimationModifier.prototype.typeModifier = null;
bindMethods(SimpleAnimationModifier);
