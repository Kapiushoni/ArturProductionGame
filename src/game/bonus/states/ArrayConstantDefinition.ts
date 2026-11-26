// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayClassConstantDefinition } from '@/game/bonus/states/ArrayClassConstantDefinition';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { ArrayFloatConstantDefinition } from '@/game/bonus/states/ArrayFloatConstantDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';

export class ArrayConstantDefinition extends BaseState {
  constructor(text, baseState = null) {
          super(text,"",baseState);
      }
  onDigit(text) { const __self = this;
         return __self.addToValue(text);
      }
  onSpace(text) {
         return this;
      }
  onLetter(text) { const __self = this;
         __self.stream.ungetc();
         return new ArrayClassConstantDefinition(__self.name);
      }
  onMisc(text) { const __self = this;
         if(text == "}")
         {
            __self.stream.ungetc();
            __self.constantDefinition(LexicalParser.ARRAY,int(__self.value));
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == ".")
         {
            __self.value += text;
            return new ArrayFloatConstantDefinition(__self.name,__self.value,__self.parent);
         }
         if(text == ",")
         {
            __self.constantDefinition(LexicalParser.ARRAY,int(__self.value));
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == "-")
         {
            return this.onDigit(text);
         }
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         return null;
      }
}
bindMethods(ArrayConstantDefinition);
