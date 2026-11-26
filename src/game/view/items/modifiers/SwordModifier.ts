// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { SimpleAnimationModifier } from '@/game/view/items/modifiers/SimpleAnimationModifier';

export class SwordModifier extends SimpleAnimationModifier {
  constructor(text, text2) {
          super(text,text2);
      }
  setModifier(clip, text) { const __self = this;
         __self.setIcon(clip.sword.gem,text);
      }
}
bindMethods(SwordModifier);
