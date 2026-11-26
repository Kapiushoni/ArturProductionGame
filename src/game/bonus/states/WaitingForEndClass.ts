// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForEndClassError } from '@/game/bonus/errors/WaitingForEndClassError';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

export class WaitingForEndClass extends BaseState {
  constructor() {
          super();
      }
  onSpace(text) {
         return this;
      }
  onMisc(text) { const __self = this;
         if(text == "{")
         {
            return new WaitingForAttribute();
         }
         throw new WaitingForEndClassError(text,__self.stream.getLineNumber());
      }
}
bindMethods(WaitingForEndClass);
