// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ConstantDefinitionError } from '@/game/bonus/errors/ConstantDefinitionError';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { FloatConstantDefinition } from '@/game/bonus/states/FloatConstantDefinition';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

export class ConstantDefinition extends BaseState {
  constructor(text) {
          super(text,"");
      }
  onDigit(text) { const __self = this;
         return __self.addToValue(text);
      }
  onSpace(text) { const __self = this;
         __self.constantDefinition(LexicalParser.INTEGER,int(__self.value));
         return new WaitingForAttribute();
      }
  onMisc(text) { const __self = this;
         if(text == "}")
         {
            __self.stream.ungetc();
            __self.constantDefinition(LexicalParser.INTEGER,int(__self.value));
            return new WaitingForAttribute();
         }
         if(text == ".")
         {
            __self.value += text;
            return new FloatConstantDefinition(__self.name,__self.value);
         }
         if(text == "-" && __self.value == "")
         {
            __self.value += text;
            return this;
         }
         throw new ConstantDefinitionError("Expected a digit. got [" + text + "]",__self.stream.getLineNumber());
      }
}
bindMethods(ConstantDefinition);
