// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';

export class ArrayFloatConstantDefinition extends BaseState {
  constructor(text, text2, baseState = null) {
          super(text,text2,baseState);
      }
  onDigit(text) { const __self = this;
         __self.value += text;
         return this;
      }
  onMisc(text) { const __self = this;
         if(text == "}")
         {
            __self.stream.ungetc();
            __self.constantDefinition(LexicalParser.ARRAY,Number(__self.value));
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == ",")
         {
            __self.constantDefinition(LexicalParser.ARRAY,Number(__self.value));
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         return null;
      }
  onSpace(text) {
         return this;
      }
}
bindMethods(ArrayFloatConstantDefinition);
