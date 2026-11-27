import { bindMethods } from '@/flash/as3';
import { SimpleAnimationModifier } from '@/game/view/items/modifiers/SimpleAnimationModifier';

export class ShieldModifier extends SimpleAnimationModifier {
  constructor(mcName, typeModifier) {
    super(mcName, typeModifier);
  }
  setModifier(clip, text) {
    this.setIcon(clip.shield.shield.gem, text);
  }
}
bindMethods(ShieldModifier);
