import type { MovieClip } from '@/flash/as3';

export class NullShieldModifier {
  constructor() {}
  modify(clip: MovieClip) {
    clip.stop();
    clip.visible = false;
  }
}
