import { bindMethods } from '@/flash/as3';
import { SimpleAnimationModifier } from '@/game/view/items/modifiers/SimpleAnimationModifier';

export class ShieldModifier extends SimpleAnimationModifier {
  constructor(mcName: string, typeModifier: string) {
    super(mcName, typeModifier);
  }
  setModifier(clip: any, text: string) {
    this.setIcon(clip.shield.shield.gem, text);
  }
}
bindMethods(ShieldModifier);
