// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

export class ClassConstantDefinition extends BaseState {
  constructor(text) {
          super(text,"");
      }
  onLetter(text) { const __self = this;
         return __self.addToValue(text);
      }
  onSpace(text) {
         this.endConstantDef();
         return new WaitingForAttribute();
      }
  onDigit(text) { const __self = this;
         if(__self.value == "")
         {
            throw new ClassDefinitionError("Class names start with letters",__self.stream.getLineNumber());
         }
         return __self.addToValue(text);
      }
  onMisc(text) { const __self = this;
         if(text == "}")
         {
            __self.stream.ungetc();
            this.endConstantDef();
            return new WaitingForAttribute();
         }
         throw new ClassDefinitionError("Class names can\'t contain [" + text + "] character",__self.stream.getLineNumber());
      }
  endConstantDef() { const __self = this;
         var event = new ParseEvent(LexicalParser.END_ATTRIBUTE);
         event.name = __self.name;
         event.value = __self.value;
         if(__self.value == "true" || __self.value == "false")
         {
            event.value = __self.value == "true";
         }
         else
         {
            event.valueType = LexicalParser.CLASS;
         }
         __self.dispatchEvent(event);
      }
}
bindMethods(ClassConstantDefinition);
