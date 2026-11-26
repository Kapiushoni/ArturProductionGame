// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForEndArrayStringDefinition } from '@/game/bonus/states/WaitingForEndArrayStringDefinition';

export class ArrayStringDefinition extends BaseState {
  declare startSymbol: any;
  constructor(startSymbol, text, baseState = null) {
          super(text,"",baseState);
         this.startSymbol = startSymbol;
      }
  onMisc(text) { const __self = this;
         if(text == this.startSymbol)
         {
            return new WaitingForEndArrayStringDefinition(__self.name,__self.value,__self.parent);
         }
         __self.value += text;
         return this;
      }
  onLetter(text) { const __self = this;
         __self.value += text;
         return this;
      }
  onDigit(text) { const __self = this;
         __self.value += text;
         return this;
      }
  onSpace(text) { const __self = this;
         __self.value += text;
         return this;
      }
}
ArrayStringDefinition.prototype.startSymbol = null;
bindMethods(ArrayStringDefinition);
