import { bindMethods } from '@/flash/as3';
import type { MovieClip } from '@/flash/as3';

export class NullSwordModifier {
  constructor() {}
  modify(clip: MovieClip) {}
}
bindMethods(NullSwordModifier);
