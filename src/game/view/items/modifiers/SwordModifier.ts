import { bindMethods } from '@/flash/as3';
import { SimpleAnimationModifier } from '@/game/view/items/modifiers/SimpleAnimationModifier';

export class SwordModifier extends SimpleAnimationModifier {
  constructor(mcName, typeModifier) {
    super(mcName, typeModifier);
  }
  setModifier(clip, text) {
    this.setIcon(clip.sword.gem, text);
  }
}
bindMethods(SwordModifier);
