import { bindMethods } from '@/flash/as3';

export class NullSwordModifier {
  constructor() {}
  modify(clip) {}
}
bindMethods(NullSwordModifier);
