// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ConstantDefinitionError } from '@/game/bonus/errors/ConstantDefinitionError';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

export class FloatConstantDefinition extends BaseState {
  constructor(text, text2) {
          super(text,text2);
      }
  onDigit(text) { const __self = this;
         return __self.addToValue(text);
      }
  onSpace(text) { const __self = this;
         __self.constantDefinition(LexicalParser.FLOAT,Number(__self.value));
         return new WaitingForAttribute();
      }
  onMisc(text) { const __self = this;
         if(text == "}")
         {
            __self.stream.ungetc();
            __self.constantDefinition(LexicalParser.FLOAT,Number(__self.value));
            return new WaitingForAttribute();
         }
         throw new ConstantDefinitionError("Expected a digit. got [" + text + "]",__self.stream.getLineNumber());
      }
}
bindMethods(FloatConstantDefinition);
