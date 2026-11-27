import { bindMethods } from '@/flash/as3';

export class NullShieldModifier {
  constructor() {}
  modify(clip) {
    clip.stop();
    clip.visible = false;
  }
}
bindMethods(NullShieldModifier);
